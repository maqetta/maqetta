define([
	"dojo/_base/array",
	"dojo/dom-form",
	"davinci/ve/widget",
	"davinci/ve/commands/ReparentCommand",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/RemoveCommand",
	"davinci/html/HTMLElement",
	"davinci/html/HTMLText",
	"../../dojo/data/DataStoreBasedWidgetInput"
], function(
	array,
	form,
	Widget,
	ReparentCommand,
	CompoundCommand,
	RemoveCommand,
	HTMLElement,
	HTMLText,
	DataStoreBasedWidgetInput
) {

var DataGridHelper = function() {};
DataGridHelper.prototype = {

	getData: function(/*Widget*/ widget, /*Object*/ options, useDataDojoProps){
		// summary:
		//		Serialize the passed DataGrid.
		//		Writes a dojo/method script tag as a child to the DataGrid to set the structure, if one doesn't already exist.
		//
		if(!widget){
			return undefined;
		}

		// call the old _getData
		var data = widget._getData(options);
		// only write the script tag if this call is for serializing and there is a structure to serialize
		if(data && options && options.serialize && widget.structure){
			// the JS that sets the structure, this=the DataGrid
			var value = "this.setStructure(" + this._serializeStructure(widget.structure) + ");";
			// if there is already a script tag, try to find a dojo/method script tag and append the JS to it
			if(data.scripts){
				if (!array.some(data.scripts, function(s) {
					if(s.type == "dojo/method" && !s.name && s.value &&
						s.value.substring(0, 18) == "this.setStructure("){
						s.value = value;
						return true;
					}
					return false;
				})){ // not found
					data.scripts.push({type: "dojo/method", value: value});
				}
			}else{
				// make a new set of scripts with this setStructure call
				data.scripts = [{type: "dojo/method", value: value}];
			}
		}
		if (widget.dijitWidget.store){
			// add the data old store if it has one.
			data.properties.store = widget.dijitWidget.store; 
			
			if (useDataDojoProps) { 
				data.properties["data-dojo-props"] = "store: " + data.properties.store._edit_object_id;
			}
		}
		return data;
	},

	_serializeStructure: function(/*Object*/ structure){
		// summary:
		//		Serialize the passed DataGrid's structure.
		//		DataGrid does additional parsing to a structure once the DataGrid loads it, so undo that work and return the JSON.
		//
	
		if(!structure){
			return undefined;
		}
		var columns;
		try{
			columns = structure.cells;
		}catch(e){
		}
		if(!columns){
			return undefined;
		}
	
		// returned string
		var s = "";
		// serialize each column of the structure
		// assumption: there is only one row declaration
		array.forEach(columns, function(c) {
			var cs = "";
			// parameters to serialize: field, name, width, editor
			var field = c.field;
			if(field || field === 0){
				cs += "field: " + ((typeof field === 'string') ? "\"" + field + "\"" : field);	
			}
			var name = c.name;
			if(name){
				if(cs){
					cs += ", ";
				}
				cs += "name: \"" + name + "\"";
			}
			var width = c.width;
			if(width){
				if(cs){
					cs += ", ";
				}
				cs += "width: " + ((typeof width === 'string') ? "\"" + width + "\"" : width);
			}
			var editor = c.editor;
			if(editor){
				// supported editors: Input, Bool, Select
				if(cs){
					cs += ", ";
				}
				if(editor == dojox.grid.editors.Input){
					cs += "editor: dojox.grid.editors.Input";
				}else if(editor == dojox.grid.editors.Bool){
					cs += "editor: dojox.grid.editors.Bool";
				}else if(editor == dojox.grid.editors.Select){
					cs += "editor: dojox.grid.editors.Select";
					var options = c.options;
					if(options){
						cs += ", options: " + form.toJson(options);
					}
				}
			}
			if(s){
				s += ", ";
			}
			s += "{" + cs + "}";
		});
		return "{cells: [" + s + "]}";
	},
	
	create: function(widget, srcElement, useDataDojoProps){ 
		var storeId = DataStoreBasedWidgetInput.getStoreId(srcElement, useDataDojoProps);
		if(storeId){
			// we may have the store as an object
			var storeWidget = storeId.declaredClass ? Widget.byId(storeId.id) : Widget.byId(storeId);
			if (storeWidget && widget.dijitWidget && widget.dijitWidget.store){
				this._reparentTheStore(widget, storeWidget);
				this.updateStore(widget, storeWidget);
			}
		}
	},
	
	reparent: function(widget, useDataDojoProps){ 
		var storeId = DataStoreBasedWidgetInput.getStoreId(widget._srcElement, useDataDojoProps);
		if(storeId){
			var storeWidget = Widget.byId(storeId);
			if (storeWidget && widget.dijitWidget && widget.dijitWidget.store){
				this._reparentTheStore(widget, storeWidget);
			}
		}
	},
	
	_reparentTheStore: function(widget, storeWidget) {
		var dataGridParent = widget.getParent();
		var storeParent = storeWidget.getParent();
		var newIndex = (dataGridParent.indexOf(widget) < 1) ? 0 : dataGridParent.indexOf(widget)-1;
		var i = dataGridParent.indexOf(widget);
		var x = storeParent.indexOf(storeWidget);
		if ((dataGridParent === storeParent) && (i < x )){ // same parent
			newIndex = dataGridParent.indexOf(widget);
		} else if (dataGridParent != storeParent) {
			newIndex = i;
		}
		var command = new ReparentCommand(storeWidget, dataGridParent, newIndex);
		command.execute();
	},
	
	updateStore: function(widget, storeWidget, w, useDataDojoProps){
		var store = widget.dijitWidget.store;
		var data = storeWidget._srcElement.getAttribute('data'); 
		var url = storeWidget._srcElement.getAttribute('url');
		if (data){ 
			var value = data; 
			var storeData = eval('storeData = '+value);
			data = { identifier: storeData.identifier, items:[] };
		
			var items = data.items;
			var storeDataItems = storeData.items;
			for (var r = 0; r < storeDataItems.length; r++){
				var item = {};
				var dataStoreItem = storeDataItems[r];
				for (var name in dataStoreItem){
					item[name] = dataStoreItem[name];
				}
				items.push(item);
			}
			
			setTimeout(dojo.hitch(this, function(){
				// #1691 this bit of code is to give up control of the thread so FF can draw the grid
				// then we can update the store..
				store.clearOnClose = true;
				store.data = data;
				delete store.url; // wdr remove old url if switching
				store.close();
				widget.dijitWidget.setStore(store);
			}), 0);

		}else{ // must be url data store
			store.clearOnClose = true;
			store.url = url; 
			delete store.data; // wdr remove old url if switching
			store.close();
		}
	},
	
	/*
	 * Called by DeleteAction when widget is deleted.
	 * @param {davinci.ve._Widget} widget	Widget that is being deleted
	 * @return {davinci.commands.CompoundCommand}	command that is to be added to the command stack.
	 * 
	 * This widget has a data store widget that is associated with it and must be deleted also.
	 */
	getRemoveCommand: function(widget, useDataDojoProps){
		var command = new CompoundCommand();
		var storeId = DataStoreBasedWidgetInput.getStoreId(widget._srcElement, useDataDojoProps);
		var storeWidget = Widget.byId(storeId);
		// order is important for undo... 
		command.add(new RemoveCommand(widget));
		command.add(new RemoveCommand(storeWidget));
		return command;
	}
};

return DataGridHelper;

});