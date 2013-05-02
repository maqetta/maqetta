define([
	"dojo/_base/declare",
	"davinci/ve/input/SmartInput",
	"davinci/ve/commands/ModifyCommand",
	"davinci/commands/OrderedCompoundCommand",
	"davinci/ve/commands/ModifyAttributeCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/RemoveCommand",
	"davinci/ve/widget",
	"davinci/model/Path",
	"dijit/Dialog",
	"dijit/layout/ContentPane",	
	"dijit/form/Button",
	"dijit/Tree",
	"dojo/data/ItemFileReadStore",
	"../../dojo/data/DataStoreBasedWidgetInput",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!../nls/dojox",
	"dojox/form/DropDownSelect",		// used in template
], function(
	declare,
	SmartInput,
	ModifyCommand,
	OrderedCompoundCommand,
	ModifyAttributeCommand,
	AddCommand,
	RemoveCommand,
	Widget,
	Path,
	Dialog,
	ContentPane,
	Button,
	Tree,
	ItemFileReadStore,
	DataStoreBasedWidgetInput,
	commonNls,
	dojoxNls
	/*DropDownSelect*/
) {
	
return declare(DataStoreBasedWidgetInput, {

	propertyName: "structure",

	property: "structure",
	
	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",

	supportsHTML: "true",

	//helpText: 'First line is column headers separated by commons all following lines are data for those columns.',

	helpText: "",
	
	constructor : function() {
		this.helpText = dojoxNls.dataGridInputHelp;
	},

	refreshStoreView: function(){
		var store = this._widget.dijitWidget.store;
		
		onComplete = function(items) {
			var textArea = dijit.byId("davinciIleb");
			var value ='';
			
			var currentWidgetStructure = this._widget.attr("structure");
			
			//structure doesn't have to be a 1-to-1 match with new grid wizard, so build 
			//structure from data source rather than widget attribute (but we'll use
			//current widget structure for column labels when available)
			var attributes = null;
			
			if (items.length > 0) {
				attributes = store.getAttributes(items[0]);
				value ='';
				var pre = '';
				for (var x = 0; x < attributes.length; x++){
					if (attributes[x] === "unique_id") {
						/*
						 * unique_id is a search for the item
						 * so it should not be included in the 
						 * data displayed to the user  
						 */
						continue;
					}
					var attributeLabel = attributes[x].trim();
					dojo.some(currentWidgetStructure, function(currentWidgetStructureElement) {
						if (attributeLabel === currentWidgetStructureElement.field) {
							attributeLabel = currentWidgetStructureElement.name.trim();
							return true;
						}
					});
					
					
					value += pre + attributeLabel;
					pre = ',';
				}
			}
	
			//Loop through data store data to build up the string
			value += '\n';
			for (var i = 0; i <	items.length; i++){
				var item = items[i];
				var pre = '';
				for (var s = 0; s < attributes.length; s++){
					if (attributes[s] === "unique_id") {
						/*
						 * unique_id is a search for the item
						 * so it should not be included in the 
						 * data displayed to the user  
						 */
						continue;
					}
					
					var itemValue = item[attributes[s]];
					value += pre + (itemValue ? itemValue[0] : "");
					pre = ',';
				}
				value += '\n';
			}
			this._data = value;
			textArea.attr('value', String(value));
		}.bind(this);
		
		this._widget.dijitWidget.store.fetch({
			onComplete: function(items) {
				onComplete(items);
			}.bind(this)
		});
	},
	
	//called by superclass's updateWidget
	_getPropsForDummyDataUpdateWidgetCommand: function(widget) {
		structure = this._structure;
		var props = {};
		if (structure) {
			if (this._useDataDojoProps) {
				var widgetData = widget.getData();
				var currentDataDojoProps = widgetData.properties["data-dojo-props"];
				props["data-dojo-props"] =  
					DataStoreBasedWidgetInput.setPropInDataDojoProps(currentDataDojoProps, "structure", structure); 
			} 
			props.structure = structure;
		}
		if (this.supportsEscapeHTMLInData) {
			var escapeHTML = (this.getFormat() === 'text');
			props.escapeHTMLInData = escapeHTML;
		}

		return props;
	},
		
	buildData: function() {
		var structure = [], // we are defining the structure by row one of text area
			textArea = dijit.byId("davinciIleb"),
			value = textArea.attr('value'),
			rows = value.split('\n'),
			cols = rows[0].split(',');

		var currentWidgetStructure = this._widget.attr("structure");
		for (var c = 0; c < cols.length; c++){
			//Create base structure
			var tmpStructure = {
				cellType: dojox.grid.cells.Cell,
				width: 'auto',
				name: cols[c].trim(),
				field: cols[c].trim().replace(/\s+/g, '_').toLowerCase()
			};
			
			//See if column exists in the current widget structure to get previously
			//set values like width, name, etc.
			dojo.some(currentWidgetStructure, function(currentWidgetStructureElement) {
				if (tmpStructure.field === currentWidgetStructureElement.field) {
					tmpStructure.width = currentWidgetStructureElement.width;
					tmpStructure.name = currentWidgetStructureElement.name;

					return true;
				}
			});
			
			structure[c] = tmpStructure;
		}

		this._structure = structure;
		var data = { identifier: 'unique_id', items:[]},
			rows = value.split('\n'),
			items = data.items;
		// row 0 of the textarea defines colums in data grid structure
		for (var r = 1; r < rows.length; r++) {
			var cols = rows[r].split(',');
		
			var item = {unique_id: r};
			for (var s = 0; s < structure.length; s++){
				var fieldName = structure[s].field;
				if (cols[s] != null) {
					item[fieldName] = cols[s];
				} else {
					item[fieldName] = ""; // place holder for empty col
				}
			}
			items.push(item);
		}

		return data;
	},
	
	_getModifyCommandForUrlDataStore: function(widget, context, items, datastore) {
		var structure = [];
		var currentWidgetStructure = this._widget.attr("structure");
		var attributes = this._urlDataStore.getAttributes(items[0]);
		for (var i = 0; i < attributes.length; i++) {
			var name = attributes[i];
			var tmpStructure = {
				cellType: dojox.grid.cells.Cell,
				width: 'auto',
				name: name,
				field: name					
			};
			
			//See if column exists in the current widget structure to get previously
			//set values like width, etc.
			dojo.some(currentWidgetStructure, function(currentWidgetStructureElement) {
				if (tmpStructure.field === currentWidgetStructureElement.field) {
					tmpStructure.width = currentWidgetStructureElement.width;
					tmpStructure.name = currentWidgetStructureElement.name;

					return true;
				}
			});
			
			structure.push(tmpStructure);
		}

		var props = {};
		if (structure) {
			if (this._useDataDojoProps) {
				var widgetData = widget.getData();
				var currentDataDojoProps = widgetData.properties["data-dojo-props"];
				props["data-dojo-props"] =  
					DataStoreBasedWidgetInput.setPropInDataDojoProps(currentDataDojoProps, "structure", structure); 
			} 
			props.structure = structure;
		}
		
		if (this.supportsEscapeHTMLInData) {
			var escapeHTML = (this._format === 'text');
			props.escapeHTMLInData = escapeHTML;
		};
		
		props = this._getPropsForNewStore(widget, datastore, props);

		var command = new ModifyCommand(widget,
			props,
			null, 
			context
		);

		return command;
	}
});

});