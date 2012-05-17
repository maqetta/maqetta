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

var ModifyCommandForUrlDataStore = declare(ModifyCommand, {
	useDataDojoProps: false,
	
	execute: function() {
		// We run as part of a compound command AFTER the data store has been recreated. With GridX, we have an 
		// issue with GridX having a stale reference to the old data store (it doesn't look it back up by ID). So,
		// interject ourselves here to update the reference before letting superclass finish the work of the
		// command execution.
		var widget = Widget.byId(this._oldId);
		if (widget) {
			var storeId = DataStoreBasedWidgetInput.getStoreId(widget._srcElement, this.useDataDojoProps);
			if (storeId) {
				var dj = widget.getContext().getDojo();
				var dj = this._context.getDojo();
				dojo.withDoc(this._context.getDocument(), function(){
					var storeWidget = dj.getObject(storeId);
					this._properties.store = storeWidget;
				}.bind(this));
			}
		}
		
		this.inherited(arguments);
	}
});
	
return declare(DataStoreBasedWidgetInput, {

	propertyName: "structure",

	property: "structure",
	
	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",

	supportsHTML: "true",

	//helpText: 'First line is column headers separated by commons all following lines are data for those columns.',

	helpText: "",
	
	useTableElementsForStructure: false,
	
	constructor : function() {
		this.helpText = dojoxNls.dataGridInputHelp;
	},

	refreshStoreView: function(){
		var textArea = dijit.byId("davinciIleb");
		var value ='';
		
		var currentWidgetStructure = this._widget.attr("structure");
		
		//structure doesn't have to be a 1-to-1 match with new grid wizard, so build 
		//structure from data source rather than widget attribute (but we'll use
		//current widget structure for column labels when available)
		var attributes = null;
		var store = this._widget.dijitWidget.store;
		if (store._arrayOfAllItems.length > 0) {
			attributes = store.getAttributes(store._arrayOfAllItems[0]);
			if (attributes[0] === "unique_id") {
				//Get rid of "unique_id"
				attributes.splice(0, 1);
			} 
			value ='';
			for (var x = 0; x < attributes.length; x++){
				var attributeLabel = attributes[x].trim();
				dojo.some(currentWidgetStructure, function(currentWidgetStructureElement) {
					if (attributeLabel === currentWidgetStructureElement.field) {
						attributeLabel = currentWidgetStructureElement.name.trim();
						return true;
					}
				});
				
				var pre = (x > 0) ? ',' : '';
				value += pre + attributeLabel;
			}
		}

		//Loop through data store data to build up the string
		value += '\n';
		for (var i = 0; i <	store._arrayOfAllItems.length; i++){
			var item = store._arrayOfAllItems[i];
			for (var s = 0; s < attributes.length; s++){
				var pre = (s > 0) ? ',' : '';
				var itemValue = item[attributes[s]];
				value += pre + (itemValue ? itemValue[0] : "");
			}
			value += '\n';
		}
		this._data = value;
		textArea.attr('value', String(value));
	},
	
	//called by superclass's updateWidget
	_getDummyDataUpdateWidgetCommand: function(updateCommandCallback) {
		var structure = [];
		
		var context = this._getContext();
		var widget = this._widget;

		var storeId = this._getStoreId(widget.domNode._dvWidget._srcElement);
		var storeWidget = Widget.byId(storeId);

		var compoundCommand = new OrderedCompoundCommand();

		var newStore;
		var newStoreId = "";
		
		var structureData = this.buildStructure(structure);

		if (storeWidget.type != "dojo.data.ItemFileReadStore") {
			// remove the old store (csv)
			var removeCmd = new RemoveCommand(storeWidget);
			compoundCommand.add(removeCmd);
		
			// id for the new store
			var newStoreId = Widget.getUniqueObjectId("dojo.data.ItemFileReadStore", context.getDocument());

			// create the item store
			newStore = new ItemFileReadStore({items: []});
			// hack: pass id around for now, as we are passing an object but string may be expected
			newStore.id = newStoreId;
		
			var data = {
				"type": "dojo.data.ItemFileReadStore",
				"properties": {
					id: newStoreId,
					jsId: newStoreId,
					url: '',
					data: structureData
				},
				context: context,
			}

			// add the new store
			var addCmd = new AddCommand(data, widget.getParent(), 0);
			compoundCommand.add(addCmd);
		} else {
			var storeCmd = this.replaceStoreData(structureData);
			compoundCommand.add(storeCmd);
		}

		structure = this._structure;
		
		var props = {
			structure: structure
		};
		if (this.supportsEscapeHTMLInData) {
			var escapeHTML = (this.getFormat() === 'text');
			props.escapeHTMLInData = escapeHTML;
		};
		
		//Deal with table column headers
		var widgetChildren = this._buildTableChildrenForStructure(structure, widget);

		//Deal with store of different type
		if (storeWidget.type != "dojo.data.ItemFileReadStore") {
			props.store = newStore; 
		}

		//Build the modify command
		var command = new ModifyCommand(widget,
			props,
			widgetChildren,
			context
		);

		compoundCommand.add(command);

		if (storeWidget.type != "dojo.data.ItemFileReadStore") {
			var mcmd = new ModifyAttributeCommand(widget, {store: newStoreId});
			compoundCommand.add(mcmd);
		}
		
		//Callback with the new command
		updateCommandCallback(compoundCommand);
	},
	
	_buildTableChildrenForStructure: function(structure, tableWidget) {
		var tableChildren = null;
		if (structure.length > 0) {
			if (this.useTableElementsForStructure) {
				var data = tableWidget.getData();
				tableChildren = data.children;
				
				//Find/create THEAD
				var tHead = null;
				dojo.some(tableChildren, function(tableChild) {
					if (tableChild.type === "html.thead") {
						tHead = tableChild;
						return true;
					}
				});
				if (!tHead) {
					tHead = this._createTableHead();
					tableChildren.push(tHead);
				}
				
				//Find/create TR
				var tRow = null;
				tHeadChildren = tHead.children;
				dojo.some(tHeadChildren, function(tHeadChild) {
					if (tHeadChild.type === "html.tr") {
						tRow = tHeadChild;
						return true;
					}
				});
				if (!tRow) {
					tRow = this._createTableRow();
					tHeadChildren.push(tRow);
				}
				
				// Create TH's as children of TR based on structure (clearing out 
				// all existing table column headers)
				tRow.children = []; 
				dojo.forEach(structure, function(colDef) {
					tRow.children.push(this._createTableColumnHeader(colDef));
				}.bind(this));
			}
		}
		return tableChildren;
	},
	
	_createTableHead: function() {
		return {
			type: "html.thead",
			children: []
		};
	},
	
	_createTableRow: function() {
		return {
			type: "html.tr",
			children: []
		};
	},
	
	_createTableColumnHeader: function(colDef) {
		//Maybe do some kind of a mixin??
		return {
			type: "html.th",
			properties: {
				field: colDef.field,
				width: colDef.width
			},
			children: colDef.name
		};
	},
		
	buildStructure: function(structure, value) {
		var oldStructure = structure, // we are defining the structure by row one of text area
				structure = [],
				textArea = dijit.byId("davinciIleb"),
				value = textArea.attr('value'),
				nodes = value,
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
				if (cols[s]){
					item[fieldName] = cols[s];
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


		var scripts;
		
		var props = {
			structure: structure
		};
		if (this.supportsEscapeHTMLInData) {
			var escapeHTML = (this._format === 'text');
			props.escapeHTMLInData = escapeHTML;
		};
		
		//Deal with table column headers
		var widgetChildren = this._buildTableChildrenForStructure(structure, widget);

		if (datastore) {
			props.store = datastore;
		}

		var command = new ModifyCommandForUrlDataStore(widget,
			props,
			widgetChildren, 
			context,
			scripts
		);
		command.useDataDojoProps = this.useDataDojoProps;

		return command;
	}
});

});