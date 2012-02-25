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
    	"dijit/Tree/ForestStoreModel",
    	"dijit/Tree",
    	"davinci/Runtime"
], function(declare, ViewPart, BorderContainer,  ContentPane, ComboBox, 
			DataGrid, States, ItemFileReadStore, ItemFileWriteStore, ForestStoreModel, Tree, Runtime
		    ){


return declare("davinci.ve.views.StatesView", [ViewPart], {
	
	nextId: 0,
    PlainTextTreeNode: declare(Tree._TreeNode, {
    }),
    RichHTMLTreeNode: declare(Tree._TreeNode, {
        _setLabelAttr: {node: "labelNode", type: "innerHTML"}
    }),

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
		this.subscribe("/davinci/ui/editorSelected", this._editorSelected.bind(this));
		this.subscribe("/davinci/ui/context/loaded", this._contextLoaded.bind(this));
		this.subscribe("/davinci/ui/context/statesLoaded", this._statesLoaded.bind(this));
		this.subscribe("/davinci/ui/deviceChanged", this._deviceChanged.bind(this));
		this.subscribe("/davinci/states/state/added", this._addState.bind(this));
		this.subscribe("/davinci/states/state/removed", this._removeState.bind(this));
		this.subscribe("/davinci/states/state/renamed", this._renameState.bind(this));
		this.subscribe("/davinci/states/state/changed", this._changeState.bind(this));
		this.subscribe("/davinci/ui/context/registerSceneManager", this._registerSceneManager.bind(this));
		this.subscribe("/davinci/scene/scenesLoaded", this._scenesLoaded.bind(this));
		this.subscribe("/davinci/scene/added", this._addScene.bind(this));
		this.subscribe("/davinci/scene/removed", this._removeScene.bind(this));
		this.subscribe("/davinci/scene/renamed", this._renameScene.bind(this));
		this.subscribe("/davinci/scene/selectionChanged", this._sceneSelectionChanged.bind(this));

		this._createStateList();	
	},
	
	_contextLoaded: function() {
	},
	
	_statesLoaded: function() {
		if (this._editor && this._editor.declaredClass != 'davinci.ve.themeEditor.ThemeEditor'){
			this._updateView();
		}
	},
	
	_deviceChanged: function() {
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
	
	_registerSceneManager: function(sceneManager) {
	},

	_scenesLoaded: function(sceneManager) {
		this._updateView();
	},

	_addScene: function(sceneManager, parent, child) {
		this._updateView();
	},
	
	_removeScene: function(sceneManager, parent, child) {
		this._updateView();
	},
	
	_renameScene: function(sceneManager, parent, child) {
		this._updateView();
	},
	
	_sceneSelectionChanged: function(sceneManager, sceneId) {
		// This routine might be called before data structures are set up for first time
		if(!this._sceneStore){
			return;
		}
		var currentSceneId = sceneId;
		var path = [];
		while(currentSceneId){
			this._sceneStore.fetch({query: {type:sceneManager.category, sceneId:currentSceneId}, queryOptions:{deep:true}, 
				onComplete: dojo.hitch(this, function(items, request){
					if(items.length !== 1){
						console.error('_sceneSelectionChanged error. currentSceneId='+currentSceneId+',items.length='+items.length);
						currentSceneId = null;
					}else{
						var item = items[0];
						path.splice(0, 0, item.id[0]);
						currentSceneId = item.parentSceneId ? item.parentSceneId[0] : null;
					}
				})
			});
		}
		this._sceneStore.fetch({query: {type:'SceneManagerRoot', category:sceneManager.category}, queryOptions:{deep:true}, 
			onComplete: dojo.hitch(this, function(items, request){
				if(items.length !== 1){
					console.error('_sceneSelectionChanged error. sceneManager.category='+sceneManager.category);
					return;
				}else{
					var item = items[0];
					path.splice(0, 0, item.id[0]);
				}
			})
		});
		this._sceneStore.fetch({query: {type:'file'}, queryOptions:{}, 
			onComplete: dojo.hitch(this, function(items, request){
				if(items.length !== 1){
					console.error('_sceneSelectionChanged error. file not found');
					return;
				}else{
					var item = items[0];
					path.splice(0, 0, item.id[0]);
				}
			})
		});
		path.splice(0, 0, 'StoryRoot');
		this._tree.set('paths', [path]);
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
			"items": []
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
				autoHeight:true,
				style:'min-height:60px',
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
					var currentEditor = this._editor;
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
		//this.centerPane.domNode.appendChild(this._grid.domNode);	

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
		var context = this._editor.getContext();
		if(!context._statesLoaded){
			return;
		}
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
				var id = this.nextId+'';
				this.nextId++
				var newState = { name: name, id: id };
				this._store.newItem(newState);
			}
		}
		this._store.save();

		var storedScenes = this._getScenes();

		// Build an object structure that contains the latest list of states/scenes/views
		// We will then build a similar object structure by extracting the list from the ItemFileWriteStore
		// and then compare the two to see if there are any changes
		var fileName = (this._editor && this._editor.fileName) ? this._editor.fileName : 'file';
		var CurrentFileObj = {name:fileName, type:'file', category:'file', children:[]};
		var AppStatesObj = {name:'Widget States', type:'SceneManagerRoot', category:'AppStates', children:[]};
		var latestData = [CurrentFileObj];
		for(var state in latestStates){
			AppStatesObj.children.push({ name:state, type:'AppState' });
		}
		CurrentFileObj.children.push(AppStatesObj);

		// If data in Tree widget is same as latest data, then just return
		if(!this._compareStructures(latestData, storedScenes)){
			// Destroy the old Tree widget and create a new Tree widget
			this._destroyCreateTree(latestData);
		}
	},
	
	_updateList: function() {
		var latestStates = States.getStates(this._getWidget(), true), 
			storedScenes = this._getScenes(),
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
		
		// Build an object structure that contains the latest list of states/scenes/views
		// We will then build a similar object structure by extracting the list from the ItemFileWriteStore
		// and then compare the two to see if there are any changes
		var fileName = (this._editor && this._editor.fileName) ? this._editor.fileName : 'file';
		var CurrentFileObj = {name:fileName, type:'file', category:'file', children:[]};
		var appStatesCount = 0;
		for(var s in latestStates){
			appStatesCount++;
		}
		var AppStatesObj = {name:'Application States', type:'SceneManagerRoot', category:'AppStates', children:[]};
		var latestData = [CurrentFileObj];
		for(var state in latestStates){
			AppStatesObj.children.push({ name:state, type:'AppState' });
		}
		var context = this._editor.getContext();
		var sceneManagers = context.sceneManagers;
		// Loop through plugin scene managers, eg Dojo Mobile Views
		var AppStatesAddedAlready = false;
		var hideAppStates = false;
		for(var smIndex in sceneManagers){
			var sm = sceneManagers[smIndex];
			if(sm.getAllScenes && sm.name && sm.category){
				var scenes = sm.getAllScenes();
				var hide = sm.hideAppStates ? sm.hideAppStates() : false;
				// Don't show application states if SceneManager has hide flag set to true
				// and if there is only one application state (i.e., Normal)
				if(!AppStatesAddedAlready){
					if(appStatesCount <= 1 && hide){
						hideAppStates = true;
					}else{
						CurrentFileObj.children.push(AppStatesObj);
						AppStatesAddedAlready = true;
					}
				}
				CurrentFileObj.children.push({ name:sm.name, type:'SceneManagerRoot', category:sm.category, children:scenes});
			}
		}
		// If AppStates hasn't been added to store yet and wasn't rejected
		// by one of the SceneManagers, then add in the AppStates list
		if(!AppStatesAddedAlready && !hideAppStates){
			CurrentFileObj.children.push(AppStatesObj);
		}
		
		// If data in Tree widget is same as latest data, then just return
		if(!this._compareStructures(latestData, storedScenes)){
			// Destroy the old Tree widget and create a new Tree widget
			this._destroyCreateTree(latestData);
		}
		
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

	_getScenes: function() {
		var scenes = [];
		if(this._sceneStore){
			this._sceneStore.fetch({query:{}, queryOptions:{}, onComplete:dojo.hitch(this, function(items, request){
				function recurse(storeItem, retArray){
					var o = { name:storeItem.name[0], type:storeItem.type[0] };
					if(storeItem.sceneId){
						o.sceneId = storeItem.sceneId[0];
					}
					if(storeItem.category){
						o.category = storeItem.category[0];
					}
					retArray.push(o);
					if(storeItem.children && storeItem.children.length > 0){
						o.children = [];
						storeItem.children.forEach(function(child){
							recurse(child, o.children);
						});
					}
				}
				items.forEach(function(storeItem){
					recurse(storeItem, scenes);
				});
			})});
		}
		return scenes;		
		/*
		var ids = {};
		if(this._sceneStore){
			this._sceneStore.fetch({query:{}, queryOptions:{deep:true}, onComplete:dojo.hitch(this, function(items, request){
				for (var i = 0; i < items.length; i++){
					var item = items[i];
					var id = item.id[0];
					ids[id] = item;
				}
			})});
		}
		return ids;		
		*/
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
	},
	
	/**
	 * Compare two hierarchical lists to see if they have the same set of nested
	 * objects and those objects have the same set of properties.
	 * The two data structures match this construct:
	 * [{prop1:..., prop2:..., children:[{[prop1:..., prop2:..., children:[...]}]{]}]
	 */
	_compareStructures: function(a1, a2){
		// The following inner functions are used to see if we need
		// to recreate the tree widget because the list of states or 
		// the plugin scene managers has different data.
		function compareProperty(o1, o2, prop){
			if((o1[prop] && !o2[prop]) || (!o1[prop] && o2[prop])){
				return false;	// return false if objects don't match
			}
			// Dojo's datastores puts values as first elements of array, hence [0]
			if(o1[prop] && o1[prop][0] !== o2[prop][0]){
				return false;	// return false if objects don't match
			}
			return true;
		}
		function compareObjectRecursive(o1, o2){
			var props = ['sceneId','name','type','category'];
			for(var pidx = 0; pidx < props.length; pidx++){
				var p = props[pidx];
				if(!compareProperty(o1, o2, p)){
					return false;
				}
			}
			if((o1.children && !o2.children) || (!o1.children && o2.children)){
				return false;	// return false if objects don't match
			}
			if(o1.children){
				if(!compareArray(o1.children, o2.children)){
					return false;	// return false if objects don't match
				}
			}
			return true;
		}
		function compareArray(a1, a2){
			if(a1.length != a2.length){
				return false; 	// return false if objects don't match
			}
			for(var i=0; i<a1.length; i++){
				if(!compareObjectRecursive(a1[i], a2[i])){
					return false;	// return false if objects don't match
				}
			}
			return true;
		}
		return compareArray(a1, a2);
	},
	
	_destroyCreateTree: function(latestData){
		var that = this;
		
		// The following logic recreates the data stores and the Tree
		if(this._tree){
			this._tree.destroyRecursive();
			this._forest.destroy();
		}
	    var skeletonData = { identifier: 'id', label: 'name', items: []};
		this._sceneStore = new ItemFileWriteStore({ data: skeletonData, clearOnClose:true });
		this._forest = new ForestStoreModel({ store:this._sceneStore, query:{type:'file'},
			  rootId:'StoryRoot', rootLabel:'All', childrenAttrs:['children']});
		this._tree = new Tree({model:this._forest, showRoot:false, autoExpand:true, class:'StatesViewTree', style:'height:150px', 
			_createTreeNode:function(args){
				var item = args.item;
				if(item.type && item.category && item.category[0] === 'AppStates'){
					// Custom TreeNode class (based on dijit.TreeNode) that allows rich text labels
					return new that.RichHTMLTreeNode(args);
				}else{
					// Custom TreeNode class (based on dijit.TreeNode) that uses default plain text labels
					return new that.PlainTextTreeNode(args);
				}
			},
			getIconClass: function(/*dojo.data.Item*/ item, /*Boolean*/ opened){
				return "dijitLeaf";
			}
		});
		this.centerPane.domNode.appendChild(this._tree.domNode);	
		dojo.connect(this._tree, "onClick", this, function(item){
			var currentEditor = this._editor;
			var context = currentEditor ? currentEditor.getContext() : null;
			var bodyWidget = context ? context.rootWidget : null;
			if (item && item.type && item.type[0] == 'AppState') {
				if (this.isThemeEditor()){
					if (!this._silent) {
						this.publish("/davinci/states/state/changed", [{widget:'$all', newState:item.name[0], oldState:this._themeState, context: this._editor.context}]);
					}
					this._themeState = item.name[0];
					this._silent = false;
				} else {
					if(context && bodyWidget){
						var state = item.name[0];
						States.setState(bodyWidget, state);
						context.deselectInvisible();
					}
				}
			}else{
				if(bodyWidget){
					States.setState(bodyWidget, null);
				}
				if(item.sceneId){
					// Loop through plugin scene managers, eg Dojo Mobile Views
					for(var smIndex in sceneManagers){
						var sm = sceneManagers[smIndex];
						if(sm.selectScene){
							if(sm.selectScene({ sceneId:item.sceneId[0]})){
								break;
							}
						}
					}
				}
			}
		});
		function newItemRecursive(obj, parentItem){
			var o = dojo.mixin({}, obj);
			var id = that.nextId+'';
			that.nextId++
			o.id = id;		// ensure unique ID
			delete o.children;	// remove children property before calling newItem
			var thisItem;
			if(parentItem){
				thisItem = that._sceneStore.newItem(o, {parent:parentItem, attribute:'children'});
			}else{
				thisItem = that._sceneStore.newItem(o);
			}
			if(obj.children){
				obj.children.forEach(function(child){
					newItemRecursive(child, thisItem);
				});
			}
		}
		latestData.forEach(function(obj){
			newItemRecursive(obj);
		});
		this._sceneStore.save();
	}

});
});
