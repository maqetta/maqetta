define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/widget",
	"davinci/ve/States",
	"dojo/DeferredList"
], function(
	declare,
	CreateTool,
	Widget,
	States,
	DeferredList
) {

return declare(CreateTool, {

	create: function(args){
		var bodyWidget = Widget.getWidget(this._context.rootNode);

		if(!this._data.properties){
			this._data.properties = {};
		}
		// Name the widget so it can be referenced by a state name
		this._data.properties.id = dijit.getUniqueId(this._data.type.replace(/\./g,"_"));
		this._data.context = this._context;

		new DeferredList(this._requireHelpers(this._data)).then(function() {
			var widget = this._create({parent: bodyWidget}),
				body = States.getContainer();
			States.add(body, "_show:" + widget.getId());
		}.bind(this));
	}

});

});