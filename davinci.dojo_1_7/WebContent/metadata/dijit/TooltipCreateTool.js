define([
    "dojo/_base/declare",
    "davinci/ve/tools/CreateTool",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ve/States"
], function(declare, CreateTool, widget, ModifyCommand, States){
	return declare("davinci.libraries.dojo.dijit.TooltipCreateTool", CreateTool, {

	create: function(args){
		var bodyWidget = widget.getWidget(this._context.rootNode);

		if(!this._data.properties){
			this._data.properties = {};
		}
		// Name the widget so it can be referenced by a state name
		//this._data.properties.id = dijit.getUniqueId(this._data.type.replace(/\./g,"_"));
		this._data.properties.id = dijit.getUniqueId(this._type.replace(/\./g,"_"));
		this._data.properties.connectId = [];
		if(args.target && args.target != this._context.container){
			var connectId = args.target.getId();
			if(!connectId){
				connectId = "auto_" + dijit.getUniqueId(args.target.type);
				this._context.getCommandStack().execute(new ModifyCommand(args.target, {id: connectId}));
			}
			if(connectId){
				this._data.properties.connectId.push(connectId);
			}
		}

		this._data.context = this._context;
		var w = this._create({parent: bodyWidget});
		var body = davinci.ve.states.getContainer();
		davinci.ve.states.add(body, "_show:" + w.getId());
	}
});
});
