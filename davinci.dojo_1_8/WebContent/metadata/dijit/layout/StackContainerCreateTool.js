define([
	"dojo/_base/declare",
	"dojo/Deferred",
	"dojo/promise/all",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/MoveCommand",
	"davinci/ve/commands/ResizeCommand"
], function(
	declare,
	Deferred,
	all,
	CreateTool,
	Widget,
	CompoundCommand,
	AddCommand,
	MoveCommand,
	ResizeCommand
) {

return declare(CreateTool, {

	constructor: function(data){
		this._resizable = "both";
	},
	
	_create: function(args){
		this._loadRequires().then(dojo.hitch(this, function(results) {
			if (results.every(function(arg){return arg;})) {
				// all args are valid
				var command = this._getCreateCommand(args);
				this._context.getCommandStack().execute(command);
				this._select(this._container);		
			} else {
				console.log("StackContainerCreateTool:_loadRequires failed to load all requires");
			}
		}));
	},

	_getCreateCommand: function(args){
		if (this._data.length !== 2) {
			return;
		}

		var controllerData = this._data[0];
		var containerData = this._data[1];

		var containerId = Widget.getUniqueObjectId(containerData.type, this._context.getDocument());
		if(controllerData.properties){
			controllerData.properties.containerId = containerId;
		}else{
			controllerData.properties = {containerId: containerId};
		}
		if(containerData.properties){
			containerData.properties.id = containerId;
		}else{
			containerData.properties = {id: containerId};
		}
		containerData.context = this._context;
		controllerData.context = this._context;

		var controller, container;

		dojo.withDoc(this._context.getDocument(), function() {
			// setup the controller
			controller = Widget.createWidget(controllerData);
			container = Widget.createWidget(containerData);
		});

		if(!controller || !container){
			return;
		}

		var command = new CompoundCommand();
		command.add(new AddCommand(controller, args.parent, args.index));
		var index = (args.index !== undefined && args.index >= 0 ? args.index + 1 : undefined);
		command.add(new AddCommand(container, args.parent, index));
        
		// If preference says to add new widgets to the current custom state,
		// then add appropriate StyleCommands
		CreateTool.prototype.checkAddToCurrentState(command, controller);
		CreateTool.prototype.checkAddToCurrentState(command, container);
	
		if(args.position){
			command.add(new MoveCommand(controller, args.position.x, args.position.y - 30));
			command.add(new MoveCommand(container, args.position.x, args.position.y));
		}
		args.size = this._getInitialSize(container, args);
		if(args.size){
			command.add(new ResizeCommand(container, args.size.w, args.size.h));
		}
		this._container = container;

		return command;
	},
    
	addPasteCreateCommand: function(command, args) {
		this._context = this._data.context;
		this._data = [{type: 'dijit/layout/StackController'}, this._data];

		var deferred = new Deferred();

		this._loadRequires().then(dojo.hitch(this, function(results) {
			if (results.every(function(arg){return arg;})) {
				// all args are valid
				command.add(this._getCreateCommand(args));
				
				// pass back the container
				deferred.resolve(this._container);
			} else {
				console.log("StackContainerCreateTool:_loadRequires failed to load all requires");
			}
		}));

		return deferred.promise;
	},

	_loadRequires: function() {
		var promises = [];

		promises.push(this._context.loadRequires(this._data[0].type, true));
		promises.push(this._context.loadRequires(this._data[1].type, true));
		promises.push(this._context.loadRequires("dijit/layout/ContentPane", true));

		return all(promises);
	}
});

});