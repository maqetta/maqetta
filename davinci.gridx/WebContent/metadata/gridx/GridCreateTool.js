define([
	"dojo/_base/declare",
	"maq-metadata-dojo/dojox/grid/DataGridCreateTool"
], function(
	declare,
	DataGridCreateTool
) {

return declare(DataGridCreateTool, {

	constructor: function(data) {
		this._useDataDojoProps = true;
	},

	_augmentWidgetCreationProperties: function(properties, dojoFromContext) {
		//Parse data-dojo-props and get cacheClass
		var dataDojoProps = properties["data-dojo-props"];
		var dataDojoPropsEval = dojoFromContext.eval("({" + dataDojoProps + "})");

		//put resolved cacheClass into properties
		var cacheClass = dojoFromContext.require(dataDojoPropsEval.cacheClass);
		properties.cacheClass = cacheClass;
		
		//Call superclass
		this.inherited(arguments);
	}
});

});