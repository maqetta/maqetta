dojo.provide("davinci.review.view.StatesView");

dojo.require("davinci.workbench.ViewPart");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.TitlePane");
dojo.require("davinci.Workbench");

dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.data.ItemFileWriteStore");

dojo.require("davinci.ve.States");
dojo.require("davinci.ve.actions.StateActions");

dojo.require("davinci.workbench.ViewPart");

dojo.declare("davinci.review.view.StatesView",[davinci.workbench.ViewPart], {

	postCreate: function(){
		this.inherited(arguments);
		this._themeState = null;
		
		this.container = new dijit.layout.BorderContainer({       
			design: "headline",
			gutters: false,
			liveSplitters: false
		});
		this.centerPane = new dijit.layout.ContentPane({region: "center"});
		this.container.addChild(this.centerPane);
		this.container.layout();	
		this.container.startup();
		this.setContent(this.container);	
		this.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, this._editorSelected));
		this.subscribe("/davinci/review/context/loaded", dojo.hitch(this, this._contextLoaded));
		this._createStateList();	
	},
	
	_contextLoaded: function(context) {
		var global = context.getGlobal();
		this._states = global.davinci&&global.davinci.states;
		if (this._editor && this._editor.declaredClass != 'davinci.ve.themeEditor.ThemeEditor')
			this._updateView();
		if(global&&global.davinci&&global.davinci.states)
			global.davinci.states.subscribe("/davinci/states/state/changed", this, this._updateSelection);
		
	},

	
	_editorSelected : function (event){	
		var editor = event.editor;

		if(editor && editor.supports("states")) {
			this._editor = editor;
			var	global = editor.getContext()?editor.getContext().getGlobal() : null;
			this._states =global&&global.davinci&&global.davinci.states;
			this._updateView();
			this.container.layout();	
		}else{
			delete this._editor;
			this._clearList();
		}
	},
	
	_getWidget: function() {
		var currentEditor = this._editor, doc;
		if (currentEditor && currentEditor.getContext) {
			var context = currentEditor.getContext();
			doc = context && context.rootNode;
		}
		return doc;
	},

	_createStateList: function() {
		// Setup our data store:
		var statesData = {
			identifier: "id",
			"items": [{ name: "Normal", id: "Normal"}]
		};
		this._store = new dojo.data.ItemFileWriteStore({ data: statesData });
		
		// Set the layout structure:
		var layout = [{
			field: 'name',
			name: 'name',
			width: '100%'
		}];
		
		// Create a new grid:
		this._grid = new dojox.grid.DataGrid({
				id: "dvStatesDataGrid",
				store: this._store,
				structure: layout,
				selectionMode: "single",
				updateDelay: 0
			}
		);
		dojo.connect(this._grid, "onSelected", this, function(index){
			var item = this._grid.getItem(index);
			if (item) {
                if(!this._states) return;			
				var state = item.name[0];
				this._states.setState(state);
			}
		});
		dojo.connect(this._grid, "onRowClick", this, function(evt){
			var item = this._grid.getItem(evt.rowIndex);
			if (item) {
                if(!this._states) return;			
				var state = item.name[0];
//				this.publish("/davinci/review/drawing/filter", [state, []]);
			}
		});
		
		// Append the new grid to the div container:
		this.centerPane.domNode.appendChild(this._grid.domNode);	

		// Call startup, in order to render the grid:
		this._grid.startup();
	},
	
	_getStateList: function() {
		if (!this._grid) {
			this._createStateList();
		}
		return this._grid;
	},

	_updateView: function() {
		this._updateList();
		this._updateSelection();
	},
	
	_updateList: function() {
		var latestStates = davinci.ve.states.getStates(this._getWidget(), true), 
			storedStates = this._getStates();
		
		// Remove all stored states not in latestStates
		for (var name in storedStates) {
			var state = storedStates[name];
			if (!latestStates[name]) {
				this._store.deleteItem(state);
			}
		}
		
		// Add states from latestStates not yet in stored states
		for (var name in latestStates) {
			var storedState = storedStates[name];
			if (!storedState) {
				var newState = { name: name, id: name };
				this._store.newItem(newState);
			}
		}
		this._store.save();
	},
	
	_updateSelection: function() {
		var selectionIndex = 0;
		var currentState = davinci.ve.states.getState(this._getWidget());

		this._store.fetch({query: {name:"*"}, onComplete: dojo.hitch(this, function(items, request){
				for (var i = 0; i < items.length; i++){
					var item = items[i];
					var state = item.name[0];
					if (state == currentState) {
						selectionIndex = i;
					}
				}
			})
		});

		this._getStateList().selection.clear();
		this._getStateList().selection.addToSelection(selectionIndex);
	},

	_updateThemeSelection: function(currentState, silent) {
		var selected = this._grid.selection.getSelected();//selectedIndex
		//this._grid.selection.setSelected(2, true);
		
		//return;
		var selectionIndex = 0;
		//var currentState = this._getRuntimeStates().getState(this._getWidget());
		if (!currentState) return;
		var items = this._grid._by_idx;
		for (var i = 0; i < items.length; i++){
			var item = items[i].item;
			var state = item.name[0];
			if (state == currentState) {
				selectionIndex = i;
				break;
			}
		}

		//this._getStateList().selection.clear();
		this._grid.selection.clear();
		if (silent == undefined){
			this._silent = true;
		} else {
			this._silent = silent;
		}
		this._grid.selection.addToSelection(selectionIndex);
	},
	
	_getStates: function() {
		var names = {};
		this._store.fetch({query: {name:"*"}, onComplete: dojo.hitch(this, function(items, request){
				for (var i = 0; i < items.length; i++){
					var item = items[i];
					var name = item.name[0];
					names[name] = item;
				}
			})
		});
		return names;		
	},
	
	_clearList: function() {
		this._getStateList().selection.clear();

		var request = this._store.fetch({query: {name:"*"}, onComplete: dojo.hitch(this, function(items, request){
				for (var i = 0; i < items.length; i++){
					var item = items[i];
					var id = item.name[0];
					this._store.deleteItem(item);
				}
			})
		});
		this._store.save();
	}
});
