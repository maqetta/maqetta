define([
    	"dojo/_base/declare",
    	"davinci/workbench/ViewPart",
    	"dijit/layout/BorderContainer",
    	"dijit/layout/ContentPane",
    	"dijit/form/ComboBox",
    	"dojox/grid/DataGrid",
    	"davinci/ve/States",
    	"dojo/data/ItemFileReadStore",
    	"dojo/data/ItemFileWriteStore",
    	"davinci/Runtime"
], function(declare, ViewPart, BorderContainer,  ContentPane, ComboBox, 
			DataGrid, States, ItemFileReadStore, ItemFileWriteStore, Runtime
		    ){


return declare("davinci.ve.views.StatesView", [ViewPart], {


	toolbarMenuActionSets:[
		{
			 id: "statesDropdownMenu",
			 visible:true,
			 menu: [
				{ 
					__mainMenu : true,
					separator :
					[
					 	"dropdown",false
					]
				},
				{ 
					 label : "",
					 path : "dropdown",
					 id : "davinci.statesDropdownMenu",
					 separator :
						  [ "statesDropdownMenu.action1",true,
						   "statesDropdownMenu.action2",true
						  ]
				 }
			],
			actions:[]
		}
	],

	postCreate: function(){
		this.inherited(arguments);
		this._themeState = null;
		
		this.container = new BorderContainer({       
			design: "headline",
			gutters: false,
			liveSplitters: false
		});
		
		this.centerPane = new ContentPane({region: "center"});
		this.container.addChild(this.centerPane);
		this.container.layout();	
		this.container.startup();
		this.setContent(this.container);
		this.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, this._editorSelected));
		this.subscribe("/davinci/ui/context/loaded", dojo.hitch(this, this._contextLoaded));
		this.subscribe("/davinci/states/state/added", dojo.hitch(this, this._addState));
		this.subscribe("/davinci/states/state/removed", dojo.hitch(this, this._removeState));
		this.subscribe("/davinci/states/state/renamed", dojo.hitch(this, this._renameState));
		dojo.subscribe("/davinci/states/state/changed", dojo.hitch(this, this._changeState));

		this._createStateList();	
	},
	
	_contextLoaded: function() {
		if (this._editor && this._editor.declaredClass != 'davinci.ve.themeEditor.ThemeEditor')
			this._updateView();
	},

	_addState: function() {
		this._updateView();
	},
	
	_removeState: function() {
		this._updateView();
	},
	
	_renameState: function() {
		this._updateView();
	},
	
	_changeState: function(event) {
		if (this.isThemeEditor()){
			this._updateThemeSelection(event.newState);
		}else{
			this._updateSelection();
		}
	},
	
	_editorSelected : function (event){	
		var editor = event.editor;

		if(editor && editor.supports("states")) {
			this._editor = editor;

			dojo.style(this.container.domNode, "display", "block");
			if (editor.declaredClass === 'davinci.ve.themeEditor.ThemeEditor'){
				dojo.style(this.toolbarDiv, "display", "none");
				var d = dijit.byId(this.toolbarDiv.parentNode.id);
				d.resize();
				this._updateViewForThemeEditor();
				if(!this._themeState){
					this._silent = false;
					this._updateThemeSelection("Normal", true);
				}else {
					this._silent = true;
					this._updateThemeSelection(this._themeState);
				}
			} else {
				this._updateView();
				dojo.style(this.toolbarDiv, "display", "block");
				var d = dijit.byId(this.toolbarDiv.parentNode.id);
				d.resize();
			}
			this.container.layout();	
		}else{
			delete this._editor;
			this._clearList();
			dojo.style(this.container.domNode, "display", "none");
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
		
	_createComboBox: function() {
		var timingData = {
			identifier: "duration",
			"items": [ 
				{ duration:"0s" },
				{ duration:"1s" },
				{ duration:"2s" },
				{ duration:"3s" },
				{ duration:"5s" },
				{ duration:"8s" },
				{ duration:"13s" }
			]
		};
		var stateStore = new ItemFileReadStore({data:timingData});
		var comboBox = new ComboBox({
				id: "dvStatesViewTransitionBox",
				name: "duration",
				value: "0s",
				store: stateStore,
				searchAttr: "duration"
			}
		);
		return comboBox.domNode;
	},
	

	_createStateList: function() {
		// Setup our data store:
		var statesData = {
			identifier: "id",
			"items": [{ name: "Normal", id: "Normal"}]
		};
		this._store = new ItemFileWriteStore({ data: statesData });
		dojo.connect(this._store, "onSet", function(item, attribute, oldValue, newValue){
			if (oldValue !== newValue) {
				States.rename(oldValue, newValue);
			}
		});

		// Set the layout structure:
		var layout = [{
			field: 'name',
			name: 'name',
			width: '100%',
			editable: true
		}];
		
		// Create a new grid:
		this._grid = DataGrid({
				id: "dvStatesDataGrid",
				store: this._store,
				structure: layout,
				selectionMode: "single",
				updateDelay: 0,
				canEdit: function(cell, rowIndex) {
					return rowIndex !== 0;
				}
			}
		);
		dojo.connect(this._grid, "onSelected", this, function(index){
			var item = this._grid.getItem(index);
			if (item) {
				if (this.isThemeEditor()){
					if (!this._silent) {
						this.publish("/davinci/states/state/changed", [{widget:'$all', newState:item.name[0], oldState:this._themeState, context: this._editor.context}]);
					}
					this._themeState = item.name[0];
					this._silent = false;
				} else {
					var currentEditor = Runtime.currentEditor;
					var context = currentEditor.getContext();
					var bodyWidget = context.rootWidget;
					if(context && bodyWidget){
						var state = item.name[0];
						States.setState(bodyWidget, state);
						context.deselectInvisible();
					}
				}
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
	
	isThemeEditor: function() {
		return this._editor && this._editor.declaredClass === 'davinci.ve.themeEditor.ThemeEditor';
	},

	_updateViewForThemeEditor: function() {
		
		var states = this._editor._theme.getStatesForAllWidgets();
		var names = {"Normal": "Normal"};
		if (states) {
			for (var i=0; i<states.length;i++){
				var name = states[i];
				if (name != "Normal") {
						names[name] = name;
				}
			}
		}
		latestStates = names;
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
	
	_updateList: function() {
		var latestStates = States.getStates(this._getWidget(), true), 
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
		var currentState = States.getState(this._getWidget());

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
		
		var selectionIndex = 0;
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
});
