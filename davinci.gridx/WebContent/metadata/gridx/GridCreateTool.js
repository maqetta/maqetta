define([
	"dojo/_base/declare",
	"maq-metadata-dojo-1_8/dojox/grid/DataGridCreateTool"
], function(
	declare,
	DataGridCreateTool
) {

return declare(DataGridCreateTool, {

	constructor: function(data) {
		this._useDataDojoProps = true;
	},

	_augmentWidgetCreationProperties: function(properties) {
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			var cacheClass = dj.require("gridx/core/model/cache/Async");
			properties.cacheClass = cacheClass;
		});
		
		//Call superclass
		this.inherited(arguments);
	}
});

});