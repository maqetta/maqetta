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
	
	useTableElementsForStructure: false,
	
	constructor : function() {
		this.helpText = dojoxNls.dataGridInputHelp;
	},

	refreshStoreView: function(){
		var textArea = dijit.byId("davinciIleb");
		var structure = this._widget.attr("structure");
		var value ='';
		for (var x = 0; x < structure.length; x++){
			var pre = (x > 0) ? ',' : '';
			value += pre + structure[x].name.trim();
		}
		value += '\n';
		for (var i = 0; i <	this._widget.dijitWidget.store._arrayOfAllItems.length; i++){
			var item = this._widget.dijitWidget.store._arrayOfAllItems[i];
			for (var s = 0; s < structure.length; s++){
				var pre = (s > 0) ? ',' : '';
				value += pre + item[structure[s].field];
			}
			value += '\n';
		}
		this._data = value;
		textArea.attr('value', String(value));
	},
	
	updateWidget: function() {
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
		var escapeHTML = (this.getFormat() === 'text');

		var props = {
			structure: structure,
			escapeHTMLInData: escapeHTML
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

		context.getCommandStack().execute(compoundCommand);	
		context.select(command.newWidget);
		
		// We don't want to write out "structure" (if using table elements to
		// define columns) or "store" (if using data-dojo-props)
		var newSrcElement = command.newWidget._srcElement;
		if (this.useTableElementsForStructure) {
			newSrcElement.removeAttribute("structure");
		}
		this._cleanUpNewWidgetAttributes(command.newWidget); 
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

		for (var c = 0; c < cols.length; c++){
			structure[c] = {
				cellType: dojox.grid.cells.Cell,
				width: 'auto',
				name: cols[c],
				field: cols[c].replace(/\s+/g, '_').toLowerCase()
			};
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

	_cleanUpNewWidgetAttributes: function(widget) {
		// We don't want to write out "structure" (if using table elements to
		// define columns) 
		if (this.useTableElementsForStructure) {
			widget._srcElement.removeAttribute("structure");
		}
		
		//Call superclass
		this.inherited(arguments);
	},
	
	_getModifyCommandForUrlDataStore: function(widget, context, items, datastore) {
		var structure = [];
		var attributes = this._urlDataStore.getAttributes(items[0]);
		for (var i = 0; i < attributes.length; i++) {
			var name = attributes[i];
			structure.push({
				cellType: dojox.grid.cells.Cell,
				width: 'auto',
				name: name,
				field: name					
			});
		}

		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			console.warn("i=", i, "item=", item);
		}

		var scripts;
		var escapeHTML = (this._format === 'text');

		var props = {
			structure: structure,
			escapeHTMLInData: escapeHTML
		};
		
		//Deal with table column headers
		var widgetChildren = this._buildTableChildrenForStructure(structure, widget);

		if (datastore) {
			props.store = datastore;
		}

		var command = new ModifyCommand(widget,
			props,
			widgetChildren, 
			context,
			scripts
		);

		return command;
	}
});

});