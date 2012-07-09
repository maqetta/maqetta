define([
	"maq-metadata-dojo-1_8/dojox/grid/DataGridHelper",
	"maq-metadata-dojo-1_8/dijit/layout/LayoutContainerHelper",
	"maq-metadata-dojo-1_8/dijit/HTMLSubElementHelper"
], function(
	DataGridHelper,
	LayoutContainerHelper,
	HTMLSubElementHelper
) {

var GridHelper = function() {};
GridHelper.prototype = {
	 _dataGridHelper: new DataGridHelper(),
	 _layoutContainerHelper: new LayoutContainerHelper(),
	 
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
	
	// We need to provide getChildrenData because we're relying on HTML elements in the 
	// declarative HTML (e.g., <th> elements). We'll delegate to HTMLSubElementHelper.
	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		if (!this._htmlSubElementHelper) {
			this._htmlSubElementHelper = new HTMLSubElementHelper();
		}
		return this._htmlSubElementHelper.getChildrenData(widget, options);
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
	},
	
	/*
	 * In same cases we are handling certain attributes within data-dojo-props 
	 * or via child HTML elements, and we do not want to allow those attributes 
	 * to be written out into the final HTML. So, here, we clean out those
	 * attributes.
	*/
	cleanSrcElement: function(srcElement) {
		srcElement.removeAttribute("cacheClass");
		srcElement.removeAttribute("structure");
		
		//Defer to data grid helper for "store"
		this._dataGridHelper.cleanSrcElement(srcElement, this._useDataDojoProps);
	},
	
	/*
	 * GridX needs a little help after resize so that it properly renders columns
	 * with "auto" width. We give it that help by re-setting the columns.
	 */
	resize: function(widget) {
		var dijitWidget = widget.dijitWidget;
		dijitWidget.resize();
		dijitWidget.setColumns(dijitWidget.structure);
	},
	
	initialSize: function(args) {
		return this._layoutContainerHelper.initialSize(args);
	}
};

return GridHelper;

});