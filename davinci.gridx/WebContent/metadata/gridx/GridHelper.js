define([
	"../../metadata/dojo/1.7/dojox/grid/DataGridHelper"
], function(
	DataGridHelper
) {

var GridHelper = function() {};
GridHelper.prototype = {
	 _dataGridHelper: new DataGridHelper(),
	 
	 _useDataDojoProps: true,

	getData: function(/*Widget*/ widget, /*Object*/ options){
		var data = this._dataGridHelper.getData(widget, options, this._useDataDojoProps);
		
		//Need to worry about cacheClass for GridX. The data store is handled in DataGridHelper
		if (widget.dijitWidget.cacheClass){
			// add the cache class if it has one.
			data.properties.cacheClass = widget.dijitWidget.cacheClass; 
		}
		return data;
	},
	
	create: function(widget, srcElement){
		this._dataGridHelper.create(widget, srcElement, this._useDataDojoProps);
	},
	
	reparent: function(widget) {
		this._dataGridHelper.reparent(widget, this._useDataDojoProps);
	},
	
	updateStore: function(widget, storeWidget, w) { 
		this._dataGridHelper.updateStore(widget, storeWidget, w, this._useDataDojoProps);
	},
	
	getRemoveCommand: function(widget) {
		return this._dataGridHelper.getRemoveCommand(widget, this._useDataDojoProps);
	}
};

return GridHelper;

});