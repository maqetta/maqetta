define([
	"dojo/_base/declare",
	"maq-metadata-dojo/dojox/grid/DataGridHelper",
	"maq-metadata-dojo/dijit/layout/LayoutContainerHelper",
	"maq-metadata-dojo/dijit/HTMLSubElementHelper"
], function(
	declare,
	DataGridHelper,
	LayoutContainerHelper,
	HTMLSubElementHelper
) {

return declare([LayoutContainerHelper, DataGridHelper], {

	 _useDataDojoProps: true,

	getData: function(/*Widget*/ widget, /*Object*/ options) {
		var data = this.inherited(arguments, [widget, options, this._useDataDojoProps]);
		
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
	
	create: function(widget, srcElement) {
		this.inherited(arguments, [widget, srcElement, this._useDataDojoProps]);
	},
	
	reparent: function(widget) {
		this.inherited(arguments, [widget, this._useDataDojoProps]);
	},
	
	updateStore: function(widget, storeWidget, w) {
		this.inherited(arguments, [widget, storeWidget, w, this._useDataDojoProps]);
	},
	
	getRemoveCommand: function(widget) {
		return this.inherited(arguments, [widget, this._useDataDojoProps]);
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
		this.inherited(arguments, [srcElement, this._useDataDojoProps]);
	},
	
	/*
	 * GridX needs a little help after resize so that it properly renders columns
	 * with "auto" width. We give it that help by re-setting the columns.
	 */
	resize: function(widget) {
		var dijitWidget = widget.dijitWidget;
		dijitWidget.resize();
		dijitWidget.setColumns(dijitWidget.structure);
	}

});

});