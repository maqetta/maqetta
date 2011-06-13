dojo.provide("davinci.libraries.dojo.dijit.layout.StackContainerCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.libraries.dojo.dijit.layout.StackContainerCreateTool", davinci.ve.tools.CreateTool, {

	constructor: function(data){
		this._resizable = "both";
	},

	_create: function(args){
		if(this._data.length !== 2){
			return;
		}
		var controllerData = this._data[0];
		var containerData = this._data[1];
		if (!this._loadType(controllerData) || !this._loadType(containerData)) {
			return;
		}

		var containerId = davinci.ve.widget.getUniqueObjectId(containerData.type, this._context.getDocument());
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

		var controller = undefined;
		var container = undefined;
		dojo.withDoc(this._context.getDocument(), function(){
			container = davinci.ve.widget.createWidget(containerData);
			controller = davinci.ve.widget.createWidget(controllerData);
		});
		if(!controller || !container){
			return;
		}

		var command = new davinci.commands.CompoundCommand();
		command.add(new davinci.ve.commands.AddCommand(controller, args.parent, args.index));
		var index = (args.index !== undefined && args.index >= 0 ? args.index + 1 : undefined);
		command.add(new davinci.ve.commands.AddCommand(container, args.parent, index));
		if(args.position){
			command.add(new davinci.ve.commands.MoveCommand(controller, args.position.x, args.position.y - 30));
			command.add(new davinci.ve.commands.MoveCommand(container, args.position.x, args.position.y));
		}
		if(args.size){
			command.add(new davinci.ve.commands.ResizeCommand(container, args.size.w, args.size.h));
		}
		this._context.getCommandStack().execute(command);

		this._context.select(controller);
		this._context.select(container, true); // add
	}

});
