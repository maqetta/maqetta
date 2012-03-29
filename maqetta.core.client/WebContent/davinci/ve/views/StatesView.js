define([
		"dojo/_base/declare",
		"dojo/i18n!davinci/ve/nls/ve",
		"davinci/workbench/ViewPart",
		"dijit/layout/BorderContainer",
		"dijit/layout/ContentPane",
		"dijit/form/ComboBox",
		"dojox/grid/DataGrid",
		"davinci/ve/States",
		"dojo/data/ItemFileReadStore",
		"dojo/data/ItemFileWriteStore",
		"dijit/tree/ForestStoreModel",
		"dijit/Tree",
		"davinci/Runtime",
		 "dojo/_base/window"
], function(declare, veNls, ViewPart, BorderContainer,  ContentPane, ComboBox, 
			DataGrid, States, ItemFileReadStore, ItemFileWriteStore, ForestStoreModel, 
			Tree, Runtime, win
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
		
		dojo.style(this.toolbarDiv, "display", "none");
	},
	
	_contextLoaded: function() {
	},
	
	_statesLoaded: function() {
		if (this._editor && this._editor.declaredClass != 'davinci.ve.themeEditor.ThemeEditor'){
			this._updateView();
		}
		this._hideShowToolBar();
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
		if(!sceneManager || !sceneManager.category || !sceneId){
			return;
		}
		this._updateSelection(sceneManager.category, sceneId);
	},

	_editorSelected : function (event){	
		var editor = event.editor;
		var langObj = veNls; 
		this._destroyTree();

		if(editor && editor.supports("states")) {
			this._editor = editor;

			dojo.style(this.container.domNode, "display", "block");
			if (editor.declaredClass === 'davinci.ve.themeEditor.ThemeEditor'){
				this.set('title', langObj.States);
				this._updateViewForThemeEditor();
				if(!this._themeState){
					this._updateThemeSelection("Normal");
				}else {
					this._updateThemeSelection(this._themeState);
				}
			} else {
				this.set('title', langObj.Scenes);
				this._updateView();
			}
			this.container.layout();	
		}else{
			delete this._editor;
			dojo.style(this.container.domNode, "display", "none");
		}
		this._hideShowToolBar();
	},
	
	_getWidget: function() {
		var currentEditor = this._editor, doc;
		if (currentEditor && currentEditor.getContext) {
			var context = currentEditor.getContext();
			doc = context && context.rootNode;
		}
		return doc;
	},

/* This routine is forward-looking to when we might offer animation fade-in/out when changing states
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
*/

	_updateView: function() {
		if(!this._editor || !this._editor.getContext){
			return;
		}
		var context = this._editor.getContext();
		var iframe = context.getParentIframe();
		if(!context || !context._statesLoaded){
			return;
		}
		  // Call a callback with different 'global' values and context.
		// FIXME this may not be needed after we fix issue #1821
		 win.withDoc(document, function(){
			  this._updateList();
			  this._updateSelection();
		 }, this);

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
		var storedScenes = this._getScenes();

		// Build an object structure that contains the latest list of states/scenes/views
		// We will then build a similar object structure by extracting the list from the ItemFileWriteStore
		// and then compare the two to see if there are any changes
		var fileName;
		if(this._editor && this._editor.getFileNameToDisplay){
			fileName = this._editor.getFileNameToDisplay();
		}else{
			fileName = (this._editor && this._editor.fileName) ? this._editor.fileName : 'file';
		}
		var CurrentFileObj = {name:fileName, type:'file', category:'file', children:[]};
		var AppStatesObj = {name:'Widget States', type:'SceneManagerRoot', category:'AppStates', children:[]};
		var latestData = [CurrentFileObj];
		for(var state in latestStates){
			AppStatesObj.children.push({ name:state, sceneId:state, type:'AppState' });
		}
		//Commented out line below is what we would do if we decided that sometimes
		//we needed to show an extra nesting level in the Tree which showed
		//the SceneManager containers.
		//	CurrentFileObj.children.push(AppStatesObj);
		CurrentFileObj.children = CurrentFileObj.children.concat(AppStatesObj.children);

		// If data in Tree widget is same as latest data, then just return
		if(!this._compareStructures(latestData, storedScenes)){
			// Destroy the old Tree widget and create a new Tree widget
			this._destroyTree();
			this._createTree(latestData);
		}
	},
	
	_updateList: function() {
		var latestStates = States.getStates(this._getWidget(), true), 
			storedScenes = this._getScenes();
		if(!this._editor || !latestStates || !storedScenes){
			return;
		}
		var context = this._editor.getContext();
		if(!context || !context._statesLoaded){
			return;
		}
		
		// Build an object structure that contains the latest list of states/scenes/views
		// We will then build a similar object structure by extracting the list from the ItemFileWriteStore
		// and then compare the two to see if there are any changes
		var fileName;
		if(this._editor && this._editor.getFileNameToDisplay){
			fileName = this._editor.getFileNameToDisplay();
		}else{
			fileName = (this._editor && this._editor.fileName) ? this._editor.fileName : 'file';
		}
		var CurrentFileObj = {name:fileName, type:'file', category:'file', children:[]};
		var appStatesCount = 0;
		for(var s in latestStates){
			appStatesCount++;
		}
		var AppStatesObj = {name:'Application States', type:'SceneManagerRoot', category:'AppStates', children:[]};
		var latestData = [CurrentFileObj];
		for(var state in latestStates){
			AppStatesObj.children.push({ name:state, sceneId:state, type:'AppState' });
		}
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
						//Commented out line below is what we would do if we decided that sometimes
						//we needed to show an extra nesting level in the Tree which showed
						//the SceneManager containers.
						//	CurrentFileObj.children.push(AppStatesObj);
						CurrentFileObj.children = CurrentFileObj.children.concat(AppStatesObj.children);
						AppStatesAddedAlready = true;
					}
				}
				//Commented out line below is what we would do if we decided that sometimes
				//we needed to show an extra nesting level in the Tree which showed
				//the SceneManager containers.
				//	CurrentFileObj.children.push({ name:sm.name, type:'SceneManagerRoot', category:sm.category, children:scenes});
				CurrentFileObj.children = CurrentFileObj.children.concat(scenes);
			}
		}
		// If AppStates hasn't been added to store yet and wasn't rejected
		// by one of the SceneManagers, then add in the AppStates list
		if(!AppStatesAddedAlready && !hideAppStates){
			//Commented out line below is what we would do if we decided that sometimes
			//we needed to show an extra nesting level in the Tree which showed
			//the SceneManager containers.
			//	CurrentFileObj.children.push(AppStatesObj);
			CurrentFileObj.children = CurrentFileObj.children.concat(AppStatesObj.children);
		}
		
		this._hideShowToolBar();

		// If data in Tree widget is same as latest data, then just return
		if(!this._compareStructures(latestData, storedScenes)){
			// Destroy the old Tree widget and create a new Tree widget
			this._destroyTree();
			this._createTree(latestData);
		}
		
	},
	
	_updateSelection: function() {
		if(!this._sceneStore){
			return;
		}
		var sceneId;
		
		// First see if the current Tree is showing the current AppState.
		// If so, update the Tree to select that AppState
		var currentState = States.getState(this._getWidget());
		if(!currentState){
			currentState = 'Normal';
		}
		this._sceneStore.fetch({query: {type:'AppState', sceneId:currentState}, queryOptions:{deep:true}, 
			onComplete: dojo.hitch(this, function(items, request){
				if(items.length === 1){
					sceneId = items[0].sceneId[0];
				}
			})
		});
		if(sceneId){
			this._updateSelectedScene('AppState', sceneId);
		}else{
			var context = this._editor.getContext();
			var sceneManagers = context.sceneManagers;
			
			// Otherwise, current AppState isn't in Tree, so search through SceneManagers
			// to look for a current scene. If one is found, select that scene in the Tree.
			for(var smIndex in sceneManagers){
				var sm = sceneManagers[smIndex];
				if(sm.getCurrentScene){
					var sceneId;
					var candidateSceneId = sm.getCurrentScene();
					if(candidateSceneId){
						this._sceneStore.fetch({query: {type:sm.category, sceneId:candidateSceneId}, queryOptions:{deep:true}, 
							onComplete: dojo.hitch(this, function(items, request){
								if(items.length === 1){
									sceneId = items[0].sceneId[0];
								}
							})
						});
						if(sceneId){
							this._updateSelectedScene(sm.category, sceneId);
							break;
						}
					}
				}
			}
		}
	},

	_updateThemeSelection: function(currentState) {
		if(!this._sceneStore){
			return;
		}
		var sceneId;
		if(!currentState){
			currentState = 'Normal';
		}
		this._sceneStore.fetch({query: {type:'AppState', sceneId:currentState}, queryOptions:{deep:true}, 
			onComplete: dojo.hitch(this, function(items, request){
				if(items.length === 1){
					sceneId = items[0].sceneId[0];
				}
			})
		});
		if(sceneId){
			this._updateSelectedScene('AppState', sceneId);
		}
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
	
	
	_destroyTree: function(){
		if(this._tree){
			this._tree.destroyRecursive();
			this._forest.destroy();
			this._sceneStore = null;
			this._forest = null;
			this._tree = null;
		}
	},
	
	_createTree: function(latestData){
		var that = this;
		var context = this._editor.getContext();
		var sceneManagers = context.sceneManagers;
		var skeletonData = { identifier: 'id', label: 'name', items: []};
		this._sceneStore = new ItemFileWriteStore({ data: skeletonData, clearOnClose:true });
		this._forest = new ForestStoreModel({ store:this._sceneStore, query:{type:'file'},
			  rootId:'StoryRoot', rootLabel:'All', childrenAttrs:['children']});
		this._tree = new Tree({
			model: this._forest,
			persist: false,
			showRoot: false,
			autoExpand: true,
			className: 'StatesViewTree',
			style: 'height:150px', 
			_createTreeNode: function(args) {
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
					this.publish("/davinci/states/state/changed", 
							[{editorClass:currentEditor.declaredClass, widget:'$all', 
							newState:item.name[0], oldState:this._themeState, context: this._editor.context}]);
					this._themeState = item.name[0];
				} else if(currentEditor.declaredClass == 'davinci.review.editor.ReviewEditor') {
					this.publish("/davinci/states/state/changed", 
							[{editorClass:currentEditor.declaredClass, widget:context ? context.rootWidget : null, 
							newState:item.name[0]}]);
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
	},
	
	_updateSelectedScene: function(type, sceneId){
		// This routine might be called before data structures are set up for first time
		if(!this._sceneStore){
			return;
		}
		var currentSceneId = sceneId;
		var path = [];
		while(currentSceneId){
			this._sceneStore.fetch({query: {type:type, sceneId:currentSceneId}, queryOptions:{deep:true}, 
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
/*
		//This block of logic is necessary if we include an extra nesting level in the tree
		//where that extra nesting level shows a container node for each different SceneManager.
		//Not deleting this code quite yet in case we decide sometimes we need to show that extra nesting level
		this._sceneStore.fetch({query: {type:'SceneManagerRoot', category:sceneManager.category}, queryOptions:{deep:true}, 
			onComplete: dojo.hitch(this, function(items, request){
				if(items.length !== 1){
					console.error('_sceneSelectionChanged error. type='+type);
					return;
				}else{
					var item = items[0];
					path.splice(0, 0, item.id[0]);
				}
			})
		});
*/
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
	
	// This code prevents +/- icons from appearing in theme and review editors
	// and in page editor when authoring Dojo Mobile UIs
	_hideShowToolBar: function(){
		if(!this._editor){
			return;
		}
		var showAppStates;	
		if (this._editor.declaredClass !== "davinci.ve.PageEditor"){
			showAppStates = false;
		}else{
			var context = this._editor.getContext();
			if(!context || !context._statesLoaded){
				return;
			}
			var latestStates = States.getStates(this._getWidget(), true);
			if(!latestStates){
				return;
			}
			var appStatesCount = 0;
			for(var s in latestStates){
				appStatesCount++;
			}
			// Loop through plugin scene managers, eg Dojo Mobile Views
			var sceneManagers = context.sceneManagers;
			showAppStates = (appStatesCount > 1);	// >1 means not just Normal
			if(!showAppStates){
				showAppStates = true;
				for(var smIndex in sceneManagers){
					var sm = sceneManagers[smIndex];
					var hide = sm.hideAppStates ? sm.hideAppStates() : false;
					if(hide){
						showAppStates = false;
						break;
					}
				}
			}
		}

		// This code prevents +/- icons from appearing when authoring Dojo Mobile UIs
		if (showAppStates){
			dojo.style(this.toolbarDiv, "display", "block");
		}else{
			dojo.style(this.toolbarDiv, "display", "none");
		}
		var d = dijit.byId(this.toolbarDiv.parentNode.id);
		d.resize();
	}

});
});
