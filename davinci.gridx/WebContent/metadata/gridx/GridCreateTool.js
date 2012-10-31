define([
	"dojo/_base/declare",
	"maq-metadata-dojo/dojox/grid/DataGridCreateTool",
	"dojo/Deferred"
], function(
	declare,
	DataGridCreateTool,
	Deferred
) {

return declare(DataGridCreateTool, {

	constructor: function(data) {
		this._useDataDojoProps = true;
	},

	_augmentWidgetCreationProperties: function(properties) {
		var deferred = new Deferred();
		
		//Parse data-dojo-props and get cacheClass. parsing fails if don't use dj.eval (e.g., data store is not found)
		var dataDojoProps = properties["data-dojo-props"];
		var dj = this._context.getDojo();
		var dataDojoPropsEval = dj.eval("({" + dataDojoProps + "})");

		// Put resolved cacheClass into properties.
		// Note: This is in the context of the Visual Editor, so we must use its `require()`.
		dj.global.require([dataDojoPropsEval.cacheClass], function(cacheClass) {
			properties.cacheClass = cacheClass;
			deferred.resolve();
		});

		return deferred.promise;
	}
});

});