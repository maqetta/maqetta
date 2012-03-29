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

	//helpText:  'First line is column headers separated by commons all following lines are data for those columns.',

	helpText:	"",
	
	constructor : function() {
		this.helpText = dojoxNls.dataGridInputHelp;
	},

	serialize: function(widget, callback, value) {
		var structure = value || widget.attr('structure');
		var names = [];
		var fields = [];
		for (var i=0; i<structure.length; ++i) {
			fields.push(structure[i].field);
			names.push(structure[i].name);
		}

		callback(fields.join(", ") + '\n' + names.join(", ")); 
	},
	
	// splits the input by rows then columns
	// see @update() for format
	parse: function(input) {
		var values = this.parseGrid(input);
		if (values.length < 2) {
				alert(dojoxNls.invalidInput1);
				return input;
		}
		var fields = values[0];
		var names = values[1];
		if (fields.length < names.length) {
				alert(dojoxNls.invalidInput2);
				return input;
		}
		var structure = [];
		for (var i=0; i<fields.length; ++i) {
				var field = fields[i].text;
				var name = names[i].text;
				var width = 'auto';
				var editor = 'dojox.grid.editors.Input';
				structure.push({field: field, name: name, width: width, editor: editor});
		}
		return structure;
	},
	
	// in this case, the first row is the Fields
	// the second row is the Display Names (column headers)
	update: function(widget, structure) {
		if (structure.length > 0) {
			var properties = {structure: structure};
			var command = new ModifyCommand(widget, properties, null, this._getContext());
			this._getContext().getCommandStack().execute(command);
			return command.newWidget;
		}

		return widget;			
	},

	refreshStoreView: function(){
		var textArea = dijit.byId("davinciIleb");
		var structure = this._widget.attr("structure");
		var value ='';
		for (var x = 0; x < structure.length; x++){
			var pre = (x > 0) ? ',' : '';
			value += pre + structure[x].name;
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
	
	addOne: function() {
		this._gridColDS.newItem({rowid: this._rowid++, width: "auto", editable: true, hidden: false});
	},
		
	removeOne: function() {
		var gridColDS = this._gridColDS;
		dojo.forEach(this._gridColumns.selection.getSelected(), function(item) {
				gridColDS.deleteItem(item);
		});
	},
	
	updateWidget: function() {
		var structure = [];
		
		var context = this._getContext();
		var widget = this._widget;

		var storeId = widget.domNode._dvWidget._srcElement.getAttribute("store");
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

		if (storeWidget.type != "dojo.data.ItemFileReadStore") {
			props.store = newStore;
		}

		var command = new ModifyCommand(widget,
			props,
			null,
			context
		);

		compoundCommand.add(command);

		if (storeWidget.type != "dojo.data.ItemFileReadStore") {
			var mcmd = new ModifyAttributeCommand(widget, {store: newStoreId});
			compoundCommand.add(mcmd);
		}

		context.getCommandStack().execute(compoundCommand);	
		context.select(command.newWidget);
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
		var data = { identifier: 'uniqe_id', items:[]},
			rows = value.split('\n'),
			items = data.items;
		// row 0 of the textarea defines colums in data grid structure
		for (var r = 1; r < rows.length; r++) {
			var cols = rows[r].split(',');
		
			var item = {uniqe_id: r};
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
		
	_attr: function(widget, name, value) {
		var properties = {};
		properties[name] = value;
		
		var command = new ModifyCommand(widget, properties);
		this._addOrExecCommand(command);
	},
	
	_addOrExecCommand: function(command) {
		if (this.command && command) {
			this.command.add(command);
		} else {
			this._getContext().getCommandStack().execute(this.command || command);
		}	
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

		if (datastore) {
			props.store = datastore;
		}

		var command = new ModifyCommand(widget,
			props,
			null, 
			context,
			scripts
		);

		return command;
	}
});

});