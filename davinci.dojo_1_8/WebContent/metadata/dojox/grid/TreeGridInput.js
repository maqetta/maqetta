define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/ve/input/SmartInput",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"dojo/i18n!../nls/dojox"
], function(
	declare,
	SmartInput,
	Widget,
	ModifyCommand,
	dijitNls
) {

return declare(SmartInput, {

	property: null, 
	
	displayOnCreate: "true",
	
	multiLine: "true",
	
	supportsHTML: "false",
	helpText: "",
	_structure: [],
	
	constructor : function() {
		this.helpText = dijitNls.treeInputHelp;
	},
	
	serialize: function(widget, callback, value) {
		//var store = widget.dijitWidget.model.store;
		var store = widget.dijitWidget.store;
		// take the store, and generate a text tree from it
		store.fetch({onComplete:function(items){
			var result = [];
			
			function appendItems(items, prefix) {

				for(var i = 0; i < items.length; i++) {
					var item = items[i];
					var text = prefix + item.label;
					result.push(text);
					
					if (item.children) {
						appendItems(item.children, prefix+">");
					}
				}
			}
			
			appendItems(items, "");
			
			result = result.join("\n");
			
			callback(result);
		}});
	},
	
	parse: function(input) {
		var result = this.parseItems(dojox.html.entities.decode(input));
		return result;
	},
	
	update: function(widget, value) {
		var nodes = value;
		var data = { identifier: 'id', label: 'label', items:[], __json__: function(){ 
			// Kludge to avoid too much recursion exception when storing data as json
			// required because ItemFileReadStore adds cyclic references to data object
			var self = {};
			if (this.identifier) {
				self.identifier = this.identifier;
			}
			if (this.label) {
				self.label = this.label;
			}
			if (this.id) {
				self.id = this.id;
			}
			if (this.items || this.children) {
				var items = this.items || this.children;
				var __json__ = arguments.callee;
				
				items = dojo.map(items, function(item){
					var copy = dojo.mixin({}, item);
					copy.__json__ = __json__;
					delete copy._0;
					delete copy._RI;
					delete copy._S;
					return copy;
				});
				
				if (this.items) {
					self.items = items;
				} else if (this.children) {
					self.children = items;
				}
			}
			return self;
		}};
		
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var indent = node.indent;
			var items = data.items, item;
			var win = this._getWindow();
			
			for (var j = 0; j < indent; j++) {
				if (!items.length) {
					// Kludge to work around lack of support for frames in ItemFileReadStore::valueIsAnItem method
					item = win.eval("new Object()");
					// Kludge to avoid duplicate ids, model/tree both choke on these
					item.id = Math.round(Math.random() * 1000000000000);
					item.label = 'undefined';
					items.push(item);
				}
				
				var lastTreeNode = items[items.length - 1];
				items = lastTreeNode.children || (lastTreeNode.children = []);
			}
			
			// Kludge to work around lack of support for frames in ItemFileReadStore::valueIsAnItem method
			var item = win.eval("new Object()");
			// Kludge to avoid duplicate ids, model/tree both choke on these
			item.id = '' + Math.round(Math.random() * 1000000000000);
			item.label = node.text;
			items.push(item);
		}
		
		var structure = this.buildStructure(data);
		this.replaceTreeStoreData(widget.dijitWidget, data);
		this._attr(widget, "structure", structure);
	},
	
	replaceStoreData: function(store, data) {
		// Kludge to force reload of store data
		store.clearOnClose = true;
		store.data = data;
		store.close();
		store.fetch({
			query: this.query,
			queryOptions:{deep:true}, 
			onComplete: dojo.hitch(this, function(items){
				/*for (var i = 0; i < items.length; i++) {
					var item = items[i];
					console.warn("i=", i, "item=", item);
				}*/
			})
		});
	},

	replaceTreeStoreData: function(tree, data) {
		//var model = tree.model;
		//var store = model.store;
		var store = tree.store;

		//this.replaceStoreData(store, data);
		
		// Kludge to force model update
		//model._requeryTop();
		
		// Kludge to save the data back on the store for serialization later
		//var modelId = tree.domNode._dvWidget._srcElement.getAttribute("model");
		//var modelWidget = davinci.ve.widget.byId(modelId);
		//var storeId = modelWidget._srcElement.getAttribute("store");
		var storeId = this._widget.domNode._dvWidget._srcElement.getAttribute("store");
		var storeWidget = Widget.byId(storeId);
		this._attr(storeWidget, "data", data);
		store.data = data;
		
		store.clearOnClose = true;
		store.data = data;
		store.close();
		tree.setStore(store);
		
		// FIXME: How do we set this such that the model recognizes the update?
		// Berkland: How do we get the corresponding dv widget handle from something like a dojo data store object? Doesn't seem to be any handle attached.
	//	var dvWidget = davinci.ve.widget.getWidget(store.domNode);
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
	
	getEditor: function() {
		return Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this.getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	},
	
	_getWindow: function() {
		var context = this._getContext();
		return context && context.getGlobal && context.getGlobal();
	},
	
	buildStructure: function(data){
/*		
 * 		"structure": [ 
						{ "cells": [
							[ 
								{ "field": "label", "name": "Label", "width": "20%"}, 
								{ "field": "children", 
									"children": [
										{ field: "id", name: "Child ID" }, 
										{ field: "label", name: "Child Label" }
									]
								}
							]]
						}					
					],
*/
		//var structure = [{cells:[[]]}];
		//var item = data.items;
		this._childStructure(data.items, 0);
		var t = [];
		var s = t;
		for (var i = 0; i < this._structure.length; i++){
			var cell = {field: "children", children:[]};
			var item = this._structure[i];
			var count = 0;
			for (var n in item) {
				cell.children[count++] = {
					field: n,
					name: n
				};
			}
			t.push(cell);
			t = cell.children;
		}
		/*
		for (name in item){
			if (name !== '_0' && name !== '_RI' && name !== '_S'){
				structure.push({
					cellType: dojox.grid.cells.Cell,
					width: 'auto',
					name: name,
					field: name					
				});
			}
		}*/
		return [{cells:[s[0].children]}];
	},
	
	_childStructure: function(items,level){
		if (!this._structure[level]){
			this._structure[level] = {};
		}
		for (var i=0; i <items.length; i++){
			var item = items[i];
			if(item.children){
				this._childStructure(item.children, level + 1);
			}
			for (var name in item) {
				if (name !== 'children' && name !== 'id') {
					this._structure[level][name] = name;
				}
			}
		}
	}
	
});

});