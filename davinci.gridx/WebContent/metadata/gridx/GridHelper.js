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
	constructor : function() {
		this._useDataDojoProps = true;
	},

	getData: function(/*Widget*/ widget, /*Object*/ options) {
		var data = this.inherited(arguments);
		
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
	
	/*
	 * In same cases we are handling certain attributes within data-dojo-props 
	 * or via child HTML elements, and we do not want to allow those attributes 
	 * to be written out into the final HTML. So, here, we clean out those
	 * attributes.
	*/
	cleanSrcElement: function(srcElement) {
		srcElement.removeAttribute("cacheClass");
		
		//Defer to data grid helper for "store"
		this.inherited(arguments);
	},
	
	/*
	 * GridX needs a little help after resize so that it properly renders columns
	 * with "auto" width. We give it that help by re-setting the columns.
	 */
	resize: function(widget) {
		// Due to timing issues, once in awhile when a document is closed, 
		// this resize function still gets called even though document has gone
		// away, in which case defaultView is null, and dojo dies when checking getComputedStyle.
		// See #3344.
		if(!widget || !widget.dijitWidget || !widget.dijitWidget.domNode || !widget.dijitWidget.domNode.defaultView){
			return;
		}
		var dijitWidget = widget.dijitWidget;
		dijitWidget.resize();
		dijitWidget.setColumns(dijitWidget.structure);
	}

});

});