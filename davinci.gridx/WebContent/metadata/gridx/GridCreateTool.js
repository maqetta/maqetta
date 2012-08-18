define([
	"dojo/_base/declare",
	"maq-metadata-dojo/dojox/grid/DataGridCreateTool",
	"dojo/Deferred",
	"require"
], function(
	declare,
	DataGridCreateTool,
	Deferred,
	require
) {

return declare(DataGridCreateTool, {

	constructor: function(data) {
		this._useDataDojoProps = true;
	},

	_augmentWidgetCreationProperties: function(properties) {
		var deferred = new Deferred();
		
		//Parse data-dojo-props and get cacheClass
		var dataDojoProps = properties["data-dojo-props"];
		var dj = this._context.getDojo();
		var dataDojoPropsEval = dj.eval("({" + dataDojoProps + "})");

		//put resolved cacheClass into properties
		require([dataDojoPropsEval.cacheClass], function(cacheClass) {
			properties.cacheClass = cacheClass;
			deferred.resolve();
		});

		return deferred.promise;
	}
});

});