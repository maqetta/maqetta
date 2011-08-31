dojo.provide("davinci.ve.views.StatesView");

dojo.require("davinci.workbench.ViewPart");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.TitlePane");
dojo.require("davinci.Workbench");

dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.grid.DataGrid");

dojo.require("davinci.ve.States");
dojo.require("davinci.ve.actions.StateActions");

dojo.require("davinci.workbench.ViewPart");

dojo.declare("davinci.ve.views.StatesView",[davinci.workbench.ViewPart], {

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
				 }/*, 
				 { 
					 label : "Do Something",
					 path : "davinci.statesDropdownMenu/statesDropdownMenu.action1",
					 id : "statesDropdownMenu.action1",
					 run: "alert('something works')"
				 }, 
				 { 
					 label : "Do Something Else",
					 path : "davinci.statesDropdownMenu/statesDropdownMenu.action2",
					 id : "statesDropdownMenu.action2",
					 run: "alert('something else works')"
				 }*/
			],
			actions:[]
		}
	],

	postCreate: function(){
		this.inherited(arguments);
		this._themeState = null;
		
		this.container = new dijit.layout.BorderContainer({       
			design: "headline",
			gutters: false,
			liveSplitters: false
		});
		
		//this.topPane = new dijit.layout.ContentPane({region: "top"});
		this.centerPane = new dijit.layout.ContentPane({region: "center"});
		
		//this.container.addChild(this.topPane);
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
				//dojo.style(this.topPane.domNode, "display", "none");
				//this.toolbarDiv.style.display
				dojo.style(this.toolbarDiv, "display", "none");
				var d = dijit.byId(this.toolbarDiv.parentNode.id);
				d.resize();
				this._updateViewForThemeEditor();
				if(!this._themeState){
					this._silent = false;
					this._updateThemeSelection("Normal", true /*false*/);
				}else {
					this._silent = true;
					this._updateThemeSelection(this._themeState);
				}
			} else {
				this._updateView();
				//dojo.style(this.topPane.domNode, "display", "block");
				dojo.style(this.toolbarDiv, "display", "block");
				//this.toolbarDiv.parentNode.id
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
	/* Removed until ready to add transitions functionality.
	getTopAdditions: function(){
		var span=dojo.doc.createElement("span");
		var transitionText = dojo.doc.createTextNode("Transition: ");
		span.appendChild(transitionText);
		span.appendChild( this._createComboBox());
		return span;
	},*/

//	_createToolbar: function() {
//		var dvStatesViewToolbar = dojo.doc.createElement('div');
//		dvStatesViewToolbar.id = "dvStatesViewToolbar";
//		
//			var dvStatesViewActions = dojo.doc.createElement('div');
//			dvStatesViewActions.id = "dvStatesViewActions";
//				var dvStatesViewTransition = dojo.doc.createElement('div');
//				dvStatesViewTransition.id = "dvStatesViewTransition";
//				dvStatesViewActions.appendChild(dvStatesViewTransition);
//				var transitionText = dojo.doc.createTextNode("Transition: ");
//				dvStatesViewTransition.appendChild(transitionText);
//				var dvStatesViewTransitionBox = this._createComboBox();
//				dvStatesViewTransition.appendChild(dvStatesViewTransitionBox);
//
//				var dvAddState = this._getBox("dvAddState", "plusButton.gif");
//				var dvAddStateAction = new davinci.ve.AddState();
//				dvAddState.onclick = dojo.hitch(this, function() { dvAddStateAction.run(); });
//				dvAddState.style.cursor = "pointer";
//				dvStatesViewActions.appendChild(dvAddState);
//				dvStatesViewActions.appendChild(dojo.doc.createTextNode(" "));
//				
//				var dvRemoveState = this._getBox("dvRemoveState", "minusButton.gif");
//				var dvRemoveStateAction = new davinci.ve.RemoveState();
//				dvRemoveState.onclick = dojo.hitch(this, function() { 
//					dvRemoveStateAction.run(); 
//				});
//				dvRemoveState.style.cursor = "pointer";	
//				dvStatesViewActions.appendChild(dvRemoveState);
//				
//				dvStatesViewActions.appendChild(dojo.doc.createTextNode("  "));
//				var dvStatesToolbarMenuAnchor = this._getBox("dvStatesToolbarMenuAnchor", "arrowDown.gif");
//				this._attachMenu(dvStatesToolbarMenuAnchor);
//				dvStatesViewActions.appendChild(dvStatesToolbarMenuAnchor);
//
//			dvStatesViewToolbar.appendChild(dvStatesViewActions);
//			
//			var dvStatesViewToolbarFooter = dojo.doc.createElement('div');
//			dvStatesViewToolbarFooter.id = "dvStatesViewToolbarFooter";
//			dvStatesViewToolbar.appendChild(dvStatesViewToolbarFooter);
//
//		this.topPane.domNode.appendChild(dvStatesViewToolbar);
//	},
//	
//	_getBox: function(id, image) {
//		var dvBox = dojo.doc.createElement('img');
//		dvBox.id = id;
//		dojo.addClass(dvBox, "dvStatesViewAction");
//		dvBox.src = "davinci/themes/architect/images/" + image;
//		return dvBox;
//	},
		
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
		var stateStore = new dojo.data.ItemFileReadStore({data:timingData});
		var comboBox = new dijit.form.ComboBox({
				id: "dvStatesViewTransitionBox",
				name: "duration",
				value: "0s",
				store: stateStore,
				searchAttr: "duration"
			}
		);
		return comboBox.domNode;
	},
	
//	_attachMenu: function(element) {
//		var dvAddStateAction = new davinci.ve.AddState();
//		var dvRemoveStateAction = new davinci.ve.RemoveState();
//
//		element.style.cursor = "pointer";
//
//		var pMenu = new dijit.Menu({
//			targetNodeIds: [element], leftClickToOpen: true
//		});
//		pMenu.addChild(new dijit.MenuItem({
//			label: "Add state",
//			onClick: dojo.hitch(this, function() {
//				dvAddStateAction.run();
//			})
//		}));
//		pMenu.addChild(new dijit.MenuItem({
//			label: "Remove state",
//			onClick: dojo.hitch(this, function() {
//				dvRemoveStateAction.run();
//			})
//		}));
//		/*pMenu.addChild(new dijit.MenuItem({
//			label: "Duplicate state",
//			disabled: true,
//			onClick: function() {
//				console.warn('TODO: Duplicate state')
//			}
//		}));
//		pMenu.addChild(new dijit.MenuItem({
//			label: "Rename state",
//			disabled: true,
//			onClick: function() {
//				console.warn('TODO: Rename state')
//			}
//		}));*/
//		pMenu.startup();
//	},
	
	_createStateList: function() {
		// Setup our data store:
		var statesData = {
			identifier: "id",
			"items": [{ name: "Normal", id: "Normal"}]
		};
		this._store = new dojo.data.ItemFileWriteStore({ data: statesData });
		dojo.connect(this._store, "onSet", function(item, attribute, oldValue, newValue){
			if (oldValue !== newValue) {
				davinci.ve.states.rename(oldValue, newValue);
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
		this._grid = new dojox.grid.DataGrid({
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
					if (!this._silent)
						this.publish("/davinci/states/state/changed", [{widget:'$all', newState:item.name[0], oldState:this._themeState}]);
					this._themeState = item.name[0];
					this._silent = false;
				} else {
					var currentEditor = top.davinci.Runtime.currentEditor;
					var context = currentEditor.getContext();
					var bodyWidget = context.rootWidget;
					if(context && bodyWidget){
						var state = item.name[0];
						davinci.ve.states.setState(bodyWidget, state);
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
		if (this._editor && this._editor.declaredClass === 'davinci.ve.themeEditor.ThemeEditor')
			return true;
		else 
			return false;
	},
	_updateViewForThemeEditor: function() {
		
		
		//var latestStates = this._getRuntimeStates().getStates(this._getWidget(), true), storedStates = this._getStates();
		
		//var context = this.getContext();
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
