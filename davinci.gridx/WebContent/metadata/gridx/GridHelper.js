define([
	"maq-metadata-dojo-1.7/dojox/grid/DataGridHelper",
	"maq-metadata-dojo-1.7/dijit/layout/LayoutContainerHelper",
], function(
	DataGridHelper,
	LayoutContainerHelper
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
	
	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		if(!widget || !widget._srcElement){
			return undefined;
		}
		
		var children = [];
		dojo.forEach(widget._srcElement.children, function(child) {
			this._getChildrenDataHelper(child, children);
		}.bind(this));

		return children;
	},
	
	_getChildrenDataHelper: function(element, children) {
		var elementData = this._getElementData(element);
		if (elementData) {
			children.push(elementData);
			dojo.forEach(element.children, function(child) {
				this._getChildrenDataHelper(child, elementData.children);
			}.bind(this));
		}
	},
	
	_getElementData: function(element) {
		var elementData = null;
		
		if (element.elementType == "HTMLElement") {
			//Create a base data structure
			elementData = {
					type: "html." + element.tag,
					properties: {},
					children: []
				};
			
			//Get the element attributes and add to data structure
			dojo.forEach(element.attributes, function(attribute) {
				if (!attribute.noPersist) {
					elementData.properties[attribute.name] = attribute.value;
				}
			});
		} else if (element.elementType == "HTMLText") {
			elementData = element.value.trim();
		}
		
		return elementData;
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