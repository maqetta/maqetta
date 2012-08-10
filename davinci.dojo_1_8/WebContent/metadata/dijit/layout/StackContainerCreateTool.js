define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/MoveCommand",
	"davinci/ve/commands/ResizeCommand"
], function(
	declare,
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
		var command = this._getCreateCommand(args);
		this._context.getCommandStack().execute(command);
		this._select(this._container);
	},

	_getCreateCommand: function(args){
		if (this._data.length !== 2) {
			return;
		}

		var controllerData = this._data[0];
		var containerData = this._data[1];
		
		if (!this._context.loadRequires(controllerData.type, true) || !this._context.loadRequires(containerData.type, true) || !this._context.loadRequires("dijit.layout.ContentPane", true)) {
			return;
		}

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
    
    addPasteCreateCommand: function(command, args){
        this._context = this._data.context;
        this._data = [{type: 'dijit.layout.StackController'}, this._data];
        command.add(this._getCreateCommand(args));
        return this._container;
    }
});

});