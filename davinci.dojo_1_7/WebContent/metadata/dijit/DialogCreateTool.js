define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/widget",
	"davinci/ve/states"
], function(
	declare,
	CreateTool,
	Widget,
	States
) {

return declare("davinci.libraries.dojo.dijit.DialogCreateTool", CreateTool, {

	create: function(args){
		var bodyWidget = Widget.getWidget(this._context.rootNode);

		if(!this._data.properties){
			this._data.properties = {};
		}
		// Name the widget so it can be referenced by a state name
		this._data.properties.id = dijit.getUniqueId(this._type.replace(/\./g,"_"));
		this._data.context = this._context;
		var widget = this._create({parent: bodyWidget});
		var body = States.getContainer();
		States.add(body, "_show:" + widget.getId());
	}

});

});