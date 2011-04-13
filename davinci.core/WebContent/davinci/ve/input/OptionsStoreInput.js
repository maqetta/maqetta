dojo.provide("davinci.ve.input.OptionsStoreInput");
dojo.require("davinci.ve.input.SmartInput");

dojo.declare("davinci.ve.input.OptionsStoreInput", davinci.ve.input.SmartInput, {

	property: null, 
	
	displayOnCreate: "true",
	
	serialize: function(widget, callback, value) {
		var store = widget.dijitWidget.store;
		// take the store, and generate a text list from it
		store.fetch({onComplete:function(items){
			var result = [];
			
			function appendItems(items, prefix) {

				for(var i = 0; i < items.length; i++) {
					var item = items[i];
					var text = prefix + item.label;
					result.push(text);
				}
			}
			
			appendItems(items, "");
			
			result = result.join("\n");
			
			callback(result);
		}});
	},
	
	parse: function(input) {
		var result = this.parseItems(input);
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
			
			// Kludge to work around lack of support for frames in ItemFileReadStore::valueIsAnItem method
			var item = win.eval("new Object()");
			// Kludge to avoid duplicate ids, model/widget both choke on these
			item.id = Math.round(Math.random() * 1000000000000);
			item.label = node.text;
			items.push(item);
		}
		
		this.replaceWidgetStoreData(widget.dijitWidget, data);
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

	replaceWidgetStoreData: function(widget, data) {
		var store = widget.store;

		this.replaceStoreData(store, data);
				
		// Kludge to save the data back on the store for serialization later
		var storeId = widget.domNode._dvWidget._srcElement.getAttribute("store");
		var storeWidget = davinci.ve.widget.byId(storeId);
		this._attr(storeWidget, "data", data);
		store.data = data;
		// FIXME: How do we set this such that the model recognizes the update?
		// Berkland: How do we get the corresponding dv widget handle from something like a dojo data store object? Doesn't seem to be any handle attached.
		var dvWidget = davinci.ve.widget.getWidget(store.domNode);
	},
		
	_attr: function(widget, name, value) {
		var properties = {};
		properties[name] = value;
		
		var command = new davinci.ve.commands.ModifyCommand(widget, properties);
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
		return top.davinci && top.davinci.Runtime && top.davinci.Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this.getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	},
	
	_getWindow: function() {
		var context = this._getContext();
		return context && context.getGlobal && context.getGlobal();
	}
	
});