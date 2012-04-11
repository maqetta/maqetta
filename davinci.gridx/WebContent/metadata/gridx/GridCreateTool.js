define([
	"dojo/_base/declare",
	"../../metadata/dojo/1.7/dojox/grid/DataGridCreateTool",
	"../../static/lib/gridx/1.0/core/model/cache/Async"
], function(
	declare,
	DataGridCreateTool,
	Cache
) {

return declare(DataGridCreateTool, {

	constructor: function(data) {
		this._useDataDojoProps = true;
	},
	
	_cleanUpNewWidgetAttributes: function(widget) {
		//We don't want "cacheClass" to be part of the DOM tree
		if (widget._srcElement) {
			widget._srcElement.removeAttribute("cacheClass");
		}
		
		//Call superclass
		this.inherited(arguments);
	},
	
	_augmentWidgetCreationProperties: function(properties) {
		properties.cacheClass = Cache;
		
		//Call superclass
		this.inherited(arguments);
	},
});

});