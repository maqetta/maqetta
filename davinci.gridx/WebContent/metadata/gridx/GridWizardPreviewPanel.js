define(
[
	"dojo/_base/declare",
	"dijit/layout/ContentPane",
	"dojo/data/ItemFileReadStore",
	"../../static/lib/gridx/1.0/Grid",
	"../../static/lib/gridx/1.0/core/model/cache/Async",  
	"./GridCustomPersist", 
    "../../static/lib/gridx/1.0/modules/extendedSelect/Column",
    "../../static/lib/gridx/1.0/modules/move/Column",
    "../../static/lib/gridx/1.0/modules/dnd/Column",
    "../../static/lib/gridx/1.0/modules/ColumnResizer",
	"davinci/css!../../static/lib/gridx/1.0/resources/claro/Gridx.css",
	"davinci/css!../../static/lib/gridx/1.0/resources/claro/Gridx_rtl.css"
],
function(declare,
		ContentPane, 
		ItemFileReadStore,
		Grid, 
		Cache,
		GridCustomPersist,
		SelectColumn,
	    MoveColumn,
	    DndColumn, 
	    ColumnResizer,
		GridXCSS,
		GridXRTL) {

return declare(ContentPane, {

	populate: function(widget, compoundCommand, selectedColumnIds, gridInput) {  
		//Clean-up
		if (this._grid) {
			this._grid.destroyRecursive();
		}
		
		this._widget = widget;
		this._selectedColumnIds = selectedColumnIds;
		
		//Get data from existing widget
		var currentWidgetData = widget.getData();
		
		//Get data from the command
		var dataStoreCommand = compoundCommand._commands[0];
		var dataStoreProps = dataStoreCommand._properties;
		
		//If URL-based data store, reuse the one from GridInput
		if (dataStoreProps.url) {
			this._gridStore = gridInput._urlDataStore;
		} else {
			//Create data store... 
			this._gridStore = new ItemFileReadStore(dataStoreProps);
		}
		
		//Get table command
		var tableCommand = compoundCommand._commands[compoundCommand._commands.length-1];
		var tableProps = tableCommand._properties;
		var tableStructure = tableProps.structure;
		
		//Build table structure for the grid from the selected column ids
		var baseStructure = tableStructure; 
		var previewStructure = [];
		dojo.forEach(selectedColumnIds, function(selectedColumnId) {
			dojo.some(baseStructure, function(baseColumn) {
				if (baseColumn.field === selectedColumnId) {
					var previewColumn = dojo.mixin({}, baseColumn);
					delete previewColumn.id; 
					previewStructure.push(previewColumn);
					return true;
				}
			});
		});
		
		//Create preview grid
		this._grid = new Grid({
			cacheClass: Cache,
			//cacheSize: 0,
			store: this._gridStore,
			structure: previewStructure,
			modules:[
		         GridCustomPersist,
		         SelectColumn,
		         MoveColumn,
		         DndColumn,
		         ColumnResizer 
			],
			style: currentWidgetData.properties.style
		});
		
		//Set content
		this.set("content", this._grid);
		
		//Mark as populated
		this._isPopulated = true;
	},
	
	isPopulated: function() {
		return this._isPopulated;
	},
	
	isValid: function() {
		return true;
	},
	
	getValidationMessage: function() {
		return this._validationMessage;
	},
	
	isDirty: function() {
		return false;
	},
	
	getPersistedGridUpdates: function() {
		this._grid.persist.save();
		var columnInfo = this._grid.persist.get();
		
		//For benefit of caller, let's add field name
		dojo.forEach(columnInfo.column, function(column) {
			var index = new Number(column.id).valueOf() - 1; 
			column.field = this._selectedColumnIds[index];
		}.bind(this));
		
		return columnInfo;
	},
	
	destroy: function() {
		this.inherited(arguments);
	}
});
});