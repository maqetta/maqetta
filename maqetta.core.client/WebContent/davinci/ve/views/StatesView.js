define([
		"dojo/_base/declare",
		"dojo/query",
		"dojo/dom-class",
		"dojo/_base/connect",
		"dojo/aspect",
		"dojo/i18n!../nls/ve",
		"davinci/workbench/ViewPart",
		"dijit/layout/BorderContainer",
		"dijit/layout/ContentPane",
		"davinci/XPathUtils",
		"davinci/ve/States",
		"davinci/ve/widget",
		"davinci/ve/_Widget",
		"davinci/ve/commands/AppStateCommand",
		"dojo/data/ItemFileWriteStore",
		"dijit/tree/ForestStoreModel",
		"dijit/Tree",
		"dojo/_base/window"
], function(declare, domQuery, domClass, connect, aspect, veNls, ViewPart, BorderContainer, ContentPane, 
		XPathUtils, States, WidgetUtils, Widget, AppStateCommand, 
		ItemFileWriteStore, ForestStoreModel, Tree, win
){

var PlainTextTreeNode = declare(Tree._TreeNode, {}),
	RichHTMLTreeNode = declare(Tree._TreeNode, {
        _setLabelAttr: {node: "labelNode", type: "innerHTML"}
	});
// Properties put onto tree model items for each app state or "scene".
// This list is used to compare old-vs-new tree models for equality.
// Note that parentItem property is not listed because that's an object pointer
// to a parent item in an object hierarchy, and therefore will always be different
// when comparing two object structures.
var statesScenesProps = ['sceneId','category','node','sceneContainerNode',
             'isCurrent','isFocus','isInitial'];

return declare("davinci.ve.views.StatesView", [ViewPart], {
	
	nextId: 0,
	_lastSelectedId: null,

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
		this.subscribe("/davinci/ui/context/pagebuilt", this._pagebuilt.bind(this));
		this.subscribe("/davinci/ui/context/pagerebuilt", this._pagerebuilt.bind(this));
		this.subscribe("/davinci/states/statesReordered", this._statesReordered.bind(this));
		this.subscribe("/davinci/ui/deviceChanged", this._deviceChanged.bind(this));
		this.subscribe("/davinci/states/state/added", this._addState.bind(this));
		this.subscribe("/davinci/states/state/removed", this._removeState.bind(this));
		this.subscribe("/davinci/states/state/renamed", this._renameState.bind(this));
		this.subscribe("/davinci/states/state/changed", this._changeState.bind(this));
		this.subscribe("/maqetta/appstates/state/changed", this._changeState.bind(this));
		this.subscribe("/maqetta/appstates/state/containerChange", this._containerChange.bind(this));
		this.subscribe("/davinci/ui/context/registerSceneManager", this._registerSceneManager.bind(this));
		this.subscribe("/davinci/scene/scenesLoaded", this._scenesLoaded.bind(this));
		this.subscribe("/davinci/scene/added", this._addScene.bind(this));
		this.subscribe("/davinci/scene/removed", this._removeScene.bind(this));
		this.subscribe("/davinci/scene/renamed", this._renameScene.bind(this));
		this.subscribe("/davinci/scene/selectionChanged", this._sceneSelectionChanged.bind(this));
		dojo.subscribe("/davinci/ui/widgetPropertiesChanged", dojo.hitch(this, this._widgetPropertiesChanged));
		this.subscribe("/davinci/ui/widgetSelected", dojo.hitch(this, this._widgetSelectionChanged));
		
		this.attachToolbar();
		dojo.style(this.toolbarDiv, "display", "none");
	},
	
	_contextLoaded: function() {
	},
	
	_pagebuilt: function() {
		this._statesLoaded.apply(this, arguments);
	},
	
	_pagerebuilt: function() {
		this._destroyTree();
		this._statesLoaded.apply(this, arguments);
	},
	
	_statesReordered: function() {
		this._destroyTree();
		this._statesLoaded.apply(this, arguments);
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
			this._updateView();
		}
	},
	
	_containerChange: function() {
		this._updateView();
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
	
	_widgetPropertiesChanged: function() {
		this._updateView();
	},

	_widgetSelectionChanged: function() {
		if(!this._editor || !this._editor.getContext || !this._tree || !this._sceneStore){
			return;
		}
		var context = this._editor.getContext();
		var selection = context.getSelection();
		if(selection.length == 1){
			var node = selection[0].domNode;
			// If currently selected widget's DOM node is a state container, then
			// select the TreeNode that corresponds to that widget and DOM node.
			if(node && node._maqAppStates){
				this._sceneStore.fetch({query: {node:node}, queryOptions:{deep:true}, 
					onComplete: dojo.hitch(this, function(items, request){
						if(items.length > 0){
							var path = this._getTreeSelectionPath(items[0]);
							this._tree.set('path', path);
						}
					})
				});
				
			}
		}
	},
	
	_sceneSelectionChanged: function(sceneManager, sceneId) {
		if(!sceneManager || !sceneManager.category || !sceneId){
			return;
		}
		this._updateView();
	},

	_editorSelected: function (event){	
		var editor = event.editor;
		this._destroyTree();

		this._unregisterForContextEvents();
		if(editor && editor.supports("states")) {
			this._editor = editor;

			dojo.style(this.container.domNode, "display", "block");
			if (editor.declaredClass === 'davinci.ve.themeEditor.ThemeEditor'){
				this.set('title', veNls.States);
				this._updateViewForThemeEditor();
				if(!this._themeState){
					this._updateThemeSelection("Normal");
				}else {
					this._updateThemeSelection(this._themeState);
				}
			} else {
				this.set('title', veNls.Scenes);
				this._registerForContextEvents();
				this._updateView();
			}
			this.container.layout();	
		}else{
			delete this._editor;
			dojo.style(this.container.domNode, "display", "none");
		}
		this._hideShowToolBar();
	},
	
	_getRootNode: function() {
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
		if(!this._editor || !this._editor.getContext || this.isThemeEditor()){
			return;
		}
		var context = this._editor.getContext();
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
		var BodyNode = {name:fileName, type:'file', category:'file', children:[]};
		var AppStatesObj = {name:'Widget States', type:'SceneManagerRoot', category:'AppStates', children:[]};
		var latestData = [BodyNode];
		for(var state in latestStates){
			AppStatesObj.children.push({ name:state, sceneId:state, type:'AppState' });
		}
		//Commented out line below is what we would do if we decided that sometimes
		//we needed to show an extra nesting level in the Tree which showed
		//the SceneManager containers.
		//	BodyNode.children.push(AppStatesObj);
		BodyNode.children = BodyNode.children.concat(AppStatesObj.children);

		// If data in Tree widget is same as latest data, then just return
		if(!this._compareStructures(latestData, storedScenes)){
			// Destroy the old Tree widget and create a new Tree widget
			this._destroyTree();
			this._createTree(latestData);
		}
	},
	
	_updateList: function() {
		var storedScenes = this._getScenes();
		if(!this._editor || !storedScenes){
			return;
		}
		var context = this._editor.getContext();
		if(!context || !context.rootWidget || !context.rootNode || !context._statesLoaded){
			return;
		}
		
		// Build an object structure that contains the latest list of states/scenes/views
		// We will then build a similar object structure by extracting the list from the ItemFileWriteStore
		// and then compare the two to see if there are any changes
		var sceneManagers = context.sceneManagers;
		var existingItems = [];	// Used inside recurseWidget to look up into existing list of items
		var that = this;
		function recurseWidget(widgetOrNode, currentParentItem){
			// Page editor passes in a widget, review editor passes in a DOM node
			var widget, domNode;
			var isDvWidget = (widgetOrNode.declaredClass && widgetOrNode.isInstanceOf && widgetOrNode.isInstanceOf(Widget));
			if(isDvWidget){
				widget = widgetOrNode;
				node = widget.domNode;
			}else{
				widget = null;
				node = widgetOrNode;
			}
			var isStateContainer = States.isStateContainer(node);
			var isSceneContainer = false;
			for(var smIndex in sceneManagers){
				var sm = sceneManagers[smIndex];
				if(sm.getSceneChildren && sm.name && sm.category){
					isSceneContainer = sm.isSceneContainer(node);
					if(isSceneContainer){
						break;
					}
				}
			}
			if(node.tagName == 'BODY' || isStateContainer || isSceneContainer){
				// If the current parent node (i.e., node) matches one of the nodes already
				// in the tree, then use its corresponding tree data item as
				// the currentParentNode. This prevents adding an extra entry in the
				// tree for the same node.
				var currentParentItemAlreadyThere = null;
				for(var e=0; e<existingItems.length; e++){
					var existingItem = existingItems[e];
					if(existingItem.node == node){
						currentParentItemAlreadyThere = existingItem;
						break;
					}
				}
				// Otherwise, if current node is not already in tree, see if
				// any of the current node's ancestors are in the tree
				var ancestorParentItem = null;
				if(!currentParentItemAlreadyThere){
					pn = node.parentNode;
					ancestorParentItemLoop:
					while(pn){
						for(var e=0; e<existingItems.length; e++){
							var existingItem = existingItems[e];
							if(existingItem.node == pn){
								ancestorParentItem = existingItem;
								break ancestorParentItemLoop;
							}
						}
						if(pn.tagName == 'BODY'){
							break;
						}
						pn = pn.parentNode;
					}
				}
				if(currentParentItemAlreadyThere){
					currentParentItem = currentParentItemAlreadyThere;
				}else{
					var label = isDvWidget ? WidgetUtils.getLabel(widget) : WidgetUtils.getLabelForNode(node);
					var xpath = XPathUtils.getXPath(node);
					var o = {name:label, type:'file', category:'file', node:node, children:[]};
					if(ancestorParentItem){
						// Make sure that any new nodes are nested within the node corresponding
						// to their nearest ancestor node
						o.maqid = ancestorParentItem.maqid + '$' + xpath;
						ancestorParentItem.children.push(o);
					}else{
						// This should only happen for BODY
						o.maqid = currentParentItem.maqid + '$' + xpath;
						currentParentItem.children.push(o);
					}
					existingItems.push(o);
					currentParentItem = o;
				}
				if(isStateContainer){
					var appstates = States.getStates(node);
					var currentState = States.getState(node);
					if(!currentState){
						currentState = States.NORMAL;
					}
					var initialState = States.getInitial(node);
					if(!initialState){
						initialState = States.NORMAL;
					}
					var AppStatesObjId = currentParentItem.maqid + '$' + 'AppStates';
					var AppStatesObj = { maqid:AppStatesObjId,
							name:'Application States', type:'SceneManagerRoot', category:'AppStates', 
							sceneContainerNode:node, parentItem:currentParentItem, children:[]};
					for(var st=0; st<appstates.length; st++){
						var state = appstates[st];
						var stateDisplayValue = (state == 'Normal') ? 'Background' : state;
						var span = that._treeNodeContent(stateDisplayValue);
						var isFocus = (appStateFocus && appStateFocus.stateContainerNode == node && appStateFocus.state == currentState);
						var isCurrent = (state === currentState);
						var isInitial = (state === initialState);
						var stateId = AppStatesObj.maqid + '$' + state;
						var o = { maqid:stateId, name:span, sceneId:state, type:'AppState', 
								isFocus:isFocus, isCurrent:isCurrent, isInitial:isInitial,
								sceneContainerNode:node, parentItem:AppStatesObj };
						AppStatesObj.children.push(o);
						existingItems.push(o);
					}
					currentParentItem.children.push(AppStatesObj);
					existingItems.push(AppStatesObj);
				}
				if(isSceneContainer){
					for(var smIndex in sceneManagers){
						var sm = sceneManagers[smIndex];
						if(sm.getSceneChildren && sm.getCurrentScene && sm.getInitialScenes && sm.name && sm.category){
							var sceneChildren = sm.getSceneChildren(node);
							if(sceneChildren.length > 0){
								var currentScene = sm.getCurrentScene(node);
								var initialScenes = sm.getInitialScenes(node);
								var xpath = XPathUtils.getXPath(node);
								var idForSceneMgr = currentParentItem.maqid + '$' + xpath;
								var SceneManagerObj = { maqid:idForSceneMgr,
										name:sm.name, type:'SceneManagerRoot', category:sm.category, 
										parentItem:currentParentItem, children:[]};
								for(var childSceneIndex=0; childSceneIndex<sceneChildren.length; childSceneIndex++){
									var childSceneNode = sceneChildren[childSceneIndex];
									var label = isDvWidget ? WidgetUtils.getLabel(childSceneNode._dvWidget) : WidgetUtils.getLabelForNode(childSceneNode);
									var span = that._treeNodeContent(label);
									var isFocus = false;	// No concept if scene focus for plug-in scene managers
									var isCurrent = (childSceneNode === currentScene);
									var isInitial = (initialScenes.indexOf(childSceneNode)>=0);
									var xpath = XPathUtils.getXPath(childSceneNode);
									var idForScene = SceneManagerObj.maqid + '$' + xpath;
									var o = { maqid:idForScene, name:span, sceneId:childSceneNode.id, type:sm.category, 
											isFocus:isFocus, isCurrent:isCurrent, isInitial:isInitial,
											sceneContainerNode:node, parentItem:SceneManagerObj, node:childSceneNode, children:[] };
									SceneManagerObj.children.push(o);
									existingItems.push(o);
								}
								currentParentItem.children.push(SceneManagerObj);
								existingItems.push(o);
							}
						}
					}
				}
			}
			var children;
			if(isDvWidget){
				children = widget.getChildren();
				for(var j=0; j<children.length; j++){
					recurseWidget(children[j], currentParentItem);
				}
			}else{
				children = States._getChildrenOfNode(node);
				for(var j=0; j<children.length; j++){
					recurseWidget(children[j], currentParentItem);
				}
			}
		}
		var appStateFocus = States.getFocus(context.rootNode);
		if(appStateFocus && !appStateFocus.state){
			appStateFocus.state = States.NORMAL;
		}
		// Temporary root object onto which we will attach a BODY item
		// All other items in the structure will descend from the BODY item
		var temporaryRootObj = {maqid:'root', children:[]};
		recurseWidget(context.rootWidget, temporaryRootObj);
		var latestData = [temporaryRootObj.children[0]];

		// If data in Tree widget is same as latest data, then just return
		if(!this._compareStructures(latestData, storedScenes)){
			// Store away info about currently selected tree item
			var oldSelection = null;
			if(this._tree && this._sceneStore){
				var selectedItem = null;
				var path = this._tree.get('path');
				if(path.length > 0){
					// Programming note: the maqid property above was carefully designed
					// to ensure that each maqid is globally unique within a document
					// and that the same maqid will be computed across document reloads.
					// Each maqid consists of its parent's maqid+'$'<itemid>, where <itemid>
					// for nodes is the xpath for that node.
					oldSelection = path[path.length-1].maqid[0];
				}
			}
			
			// Destroy the old Tree widget and create a new Tree widget
			this._destroyTree();
			this._createTree(latestData);
			
			// Restore the selection
			if(oldSelection){
				// Have to wrap in a deferred because dijit.Tree sometimes initially itself
				// asynchronously, and appears to do so always in the way we are using
				// Tree in this routine.
				this._tree.onLoadDeferred.then(function(){
					this._sceneStore.fetch({query: {maqid:oldSelection}, queryOptions:{deep:true}, 
						onComplete: dojo.hitch(this, function(items, request){
							if(items.length === 1){
								var path = this._getTreeSelectionPath(items[0]);
								if(path.length > 0){
									this._tree.set('path', path);
								}
							}
						})
					});
				}.bind(this));
			}
		}
		
		this._hideShowToolBar();

	},
	
	/**
	 * Returns a path array that corresponds to the given item within the ItemFileWriteStore
	 */
	_getTreeSelectionPath: function(item){
		var path = [];
		path.splice(0, 0, item.id[0]);
		var parentItem = item.parentItem && item.parentItem[0];
		while(parentItem){
			path.splice(0, 0, parentItem.id[0]);
			parentItem = parentItem.parentItem && parentItem.parentItem[0];;
		}
		path.splice(0, 0, 'StoryRoot');
		return path;
	},
	
	_updateSelection: function() {
		if(!this._editor || !this._tree){
			return;
		}
		var context = this._editor.getContext();
		if(!context || !context._statesLoaded){
			return;
		}
		
		// Have to wrap in a deferred because dijit.Tree sometimes initially itself
		// asynchronously, and appears to do so always in the way we are using
		// Tree in this file.
		this._tree.onLoadDeferred.then(function(){
		
			// In logic below, we will be looking to see which tree node is selected
			// and whether it matches one of the "scenes" (e.g., a Dojo Mobile View)
			// or matches the currently focused application state.
			// If so, then leave selection as is. Otherwise, update selection
			// as follows:
			//  * if there are any "scenes" (e.g., Dojo Mobile View), set tree selection
			//    to match top-level selected scene
			//  * otherwise, select application state that has "focus"
			var path = this._tree.get('path');
			var selectedMaqId = (path.length > 0) ? path[path.length-1].maqid[0] : null;
			
			// Search through SceneManagers to find all scene containers for each scene manager
			// and then all scenes for each scene container.
			// Then update the icons for each scene to reflect whether currently selected (isCurrent)
			// and whether that scene should appear when document is opened (isInitial).
			// Also see if currently selected Tree node corresponds to one of the scenes.
			var sceneManagers = context.sceneManagers;
			for(var smIndex in sceneManagers){
				var sm = sceneManagers[smIndex];
				if(sm.getAllSceneContainers && sm.getSceneChildren && sm.getCurrentScene){
					var allSceneContainers = sm.getAllSceneContainers();
					var allSceneItems;
					this._sceneStore.fetch({query: {type:sm.category}, queryOptions:{deep:true}, 
						onComplete: dojo.hitch(this, function(items, request){
							allSceneItems = items;
						})
					});
					for(var k=0; k<allSceneItems.length; k++){
						var sceneItem = allSceneItems[k];
						var sceneContainerNode = sceneItem.sceneContainerNode[0];
						var id = sceneItem.id[0];
						var currentSpan = this._findTreeNodeSpanByClass(sceneItem, 'ScenesPaletteCurrent');
						/*FIXME: PROBABLY DELETETHIS
						var focusSpan = this._findTreeNodeSpanByClass(sceneItem, 'ScenesPaletteFocus');
						*/
						var initialSpan = this._findTreeNodeSpanByClass(sceneItem, 'ScenesPaletteInitial');
						if(sceneItem.isCurrent && sceneItem.isCurrent[0]){
							if(currentSpan){
								domClass.remove(currentSpan, 'ScenesPaletteCurrentHidden');
							}
						}else{
							if(currentSpan){
								domClass.add(currentSpan, 'ScenesPaletteCurrentHidden');
							}
						}
						/*FIXME: PROBABLY DELETETHIS
						if(focusSpan){
							domClass.add(focusSpan, 'ScenesPaletteFocusHidden');
						}
						*/
						if(sceneItem.isInitial && sceneItem.isInitial[0]){
							if(initialSpan){
								domClass.remove(initialSpan, 'ScenesPaletteInitialHidden');
							}
						}else{
							if(initialSpan){
								domClass.add(initialSpan, 'ScenesPaletteInitialHidden');
							}
						}
						// If this scene is selected in the Scenes palette, 
						// and this scene is a state container node, then 
						// make this scene the currently focused scene.
						if(sceneItem.maqId && sceneItem.maqId[0] == selectedMaqId){
							var node = sceneItem.node && sceneItem.node[0];
							if(node && node._maqAppStates){
								var currentState = States.getState(node);
								States.setState(currentState, node, { focus:true, updateWhenCurrent:true });
							}
						}
					}
				}
			}
			
			// Find all "state containers" (i.e., container nodes that can define a list of application states)
			// and then find all application states defined by each state container.
			// Then update the icons for each state to reflect whether currently selected (isCurrent),
			// whether it is the "focus" (i.e., target) for subsequent styling operations,
			// and whether that state should appear when document is opened (isInitial).
			var allAppStateItems = [];
			this._sceneStore.fetch({query: {type:'AppState'}, queryOptions:{deep:true}, 
				onComplete: dojo.hitch(this, function(items, request){
					allAppStateItems = items;
				})
			});
			for(var k=0; k<allAppStateItems.length; k++){
				var appStateItem = allAppStateItems[k];
				var sceneContainerNode = appStateItem.sceneContainerNode[0];
				var id = appStateItem.id[0];
				var currentSpan = this._findTreeNodeSpanByClass(appStateItem, 'ScenesPaletteCurrent');
				/*FIXME: PROBABLY DELETETHIS
				var focusSpan = this._findTreeNodeSpanByClass(appStateItem, 'ScenesPaletteFocus');
				*/
				var initialSpan = this._findTreeNodeSpanByClass(appStateItem, 'ScenesPaletteInitial');
				if(appStateItem.isCurrent && appStateItem.isCurrent[0]){
					if(appStateItem.isFocus && appStateItem.isFocus[0]){
						/*FIXME: PROBABLY DELETETHIS
						if(focusSpan){
							domClass.remove(focusSpan, 'ScenesPaletteFocusHidden');
						}
						*/
						if(currentSpan){
							domClass.remove(currentSpan, 'ScenesPaletteCurrentHidden');
						}
					}else{
						/*FIXME: PROBABLY DELETETHIS
						if(focusSpan){
							domClass.add(focusSpan, 'ScenesPaletteFocusHidden');
						}
						*/
						if(currentSpan){
							domClass.remove(currentSpan, 'ScenesPaletteCurrentHidden');
						}
					}
				}else{
					/*FIXME: PROBABLY DELETETHIS
					if(focusSpan){
						domClass.add(focusSpan, 'ScenesPaletteFocusHidden');
					}
					*/
					if(currentSpan){
						domClass.add(currentSpan, 'ScenesPaletteCurrentHidden');
					}
				}
				if(appStateItem.isInitial && appStateItem.isInitial[0]){
					if(initialSpan){
						domClass.remove(initialSpan, 'ScenesPaletteInitialHidden');
					}
				}else{
					if(initialSpan){
						domClass.add(initialSpan, 'ScenesPaletteInitialHidden');
					}
				}
			}
		}.bind(this));
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
					for(var p=0; p<statesScenesProps.length; p++){
						var prop = statesScenesProps[p];
						if(storeItem[prop]){
							o[prop] = storeItem[prop][0];
						}
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
			if(o1[prop] && o1[prop] !== o2[prop]){
				return false;	// return false if objects don't match
			}
			return true;
		}
		function compareObjectRecursive(o1, o2){
			for(var pidx = 0; pidx < statesScenesProps.length; pidx++){
				var p = statesScenesProps[pidx];
				if(!compareProperty(o1, o2, p)){
					return false;
				}
			}
			var o1AnyChildren = o1.children && o1.children.length;
			var o2AnyChildren = o2.children && o2.children.length;
			if((o1AnyChildren && !o2AnyChildren) || (!o1AnyChildren && o2AnyChildren)){
				return false;	// return false if objects don't match
			}
			if(o1AnyChildren){
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
		// For some reason, require didn't work when put at top of file
		require(["dijit/tree/dndSource"], function(dndSource){
	
			//on item tree , we want to drop on containers, the root node itself, or between items in the containers
			var itemTreeCheckItemAcceptance = function(node,source,position){
				if(!node || !source){
					return;
				}
				var sourceItem, sourceParentItem, sourceIndex;
				source.forInSelectedItems(function(TreeNodeItem){
					sourceItem = TreeNodeItem.data && TreeNodeItem.data.item;
					if(sourceItem){
						sourceParentItem = sourceItem.parentItem && sourceItem.parentItem[0];
						sourceIndex = sourceParentItem.children && sourceParentItem.children.indexOf(sourceItem);
					}
				});
				var targetItem, targetParentItem, targetIndex;
				targetItem = dijit.getEnclosingWidget(node).item;
				if(targetItem){
					targetParentItem = targetItem.parentItem && targetItem.parentItem[0];
					if(targetParentItem){
						targetIndex = targetParentItem.children && targetParentItem.children.indexOf(targetItem);
					}
				}
				return (
					position != 'over' &&
					sourceItem && targetItem && sourceParentItem && targetParentItem &&
					sourceItem.type[0] == 'AppState' &&	// Only allow moving application states
					targetItem.type[0] == 'AppState' &&
					sourceParentItem == targetParentItem &&	// Only allow moving within same state container
					sourceIndex !== 0 &&	// First state ("Background") can't be moved
					!(position == 'before' && targetIndex === 0) &&	// Can't move custom state before background
					!(position == 'before' && sourceIndex+1 == targetIndex) &&	// Can't move to same spot
					!(position == 'after' && sourceIndex == targetIndex+1)	// Can't move to same spot
				);
			}.bind(this);
			var dndDoneAfter = function(source, nodes, copy){
				// Dijit publishes a dndDone eent event to all tree widgets that
				// have dnd enabled. Only process dnd events that apply to the States palette.
				if(source.tree != this._tree){
					return;
				}
				// Find the item that is being moved, and its parent
				var sourceItem, sourceParentItem;
				source.forInSelectedItems(function(TreeNodeItem){
					sourceItem = TreeNodeItem.data && TreeNodeItem.data.item;
					if(sourceItem){
						sourceParentItem = sourceItem.parentItem && sourceItem.parentItem[0];
					}
				});
				// Retrieve the new ordered list of states
				var stateContainerNode = sourceParentItem.sceneContainerNode && sourceParentItem.sceneContainerNode[0];
				if(stateContainerNode && stateContainerNode._maqAppStates && stateContainerNode._maqAppStates.states){
					var statesList = [];
					for(var i=1; i<sourceParentItem.children.length; i++){
						var state = sourceParentItem.children[i].sceneId[0];
						statesList.push(state);
					}
					var command = new AppStateCommand({
						action:'reorder',
						newStatesList:statesList,
						stateContainerNode:stateContainerNode,
						context:context
					});
					context.getCommandStack().execute(command);
				}
			}.bind(this);
	
			if(!this._editor){
				return;
			}
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
				dndController: "dijit.tree.dndSource",
				dragThreshold:8,
				betweenThreshold:5,
				checkItemAcceptance:itemTreeCheckItemAcceptance,
				className: 'StatesViewTree',
				style: 'height:150px; overflow-x:hidden; overflow-y:auto;', 
				_createTreeNode: function(args) {
	/*FIXME: OLD LOGIC
					var item = args.item;
					if(item.type && item.category && item.category[0] === 'AppStates'){
						// Custom TreeNode class (based on dijit.TreeNode) that allows rich text labels
						return new RichHTMLTreeNode(args);
					}else{
						// Custom TreeNode class (based on dijit.TreeNode) that uses default plain text labels
						return new PlainTextTreeNode(args);
					}
	*/
					return new RichHTMLTreeNode(args);
				},
				getIconClass: function(/*dojo.data.Item*/ item, /*Boolean*/ opened){
					return "dijitLeaf";
				}
			});
			if(this._tree.tree && this._tree.tree.dndController){
				aspect.after(this._tree.tree.dndController, "onDndDrop", dndDoneAfter, true);
			}
			this.centerPane.domNode.appendChild(this._tree.domNode);	
			dojo.connect(this._tree, "onClick", this, function(item){
				var currentEditor = this._editor;
				var context = currentEditor ? currentEditor.getContext() : null;
				var bodyNode = context ? context.rootNode : null;
				var stateContainerNode = null;
				var type = null;
				var newState = null;
				if (item && item.type){
					type = item.type[0];
					var category = item.category && item.category[0];
					if(type == 'AppState' || (type == 'SceneManagerRoot' && category == 'AppStates')) {
						stateContainerNode = item.sceneContainerNode ? item.sceneContainerNode[0] : null;
					//FIXME: using type == 'file' for HTMLElements, too. That's wrong.
					}else if(item.node && item.node[0]._maqAppStates){
						stateContainerNode = item.node[0];
					}
				}
				if (this.isThemeEditor()){
					this.publish("/davinci/states/state/changed", 
							[{editorClass:currentEditor.declaredClass, widget:'$all', 
							newState:item.sceneId[0], oldState:this._themeState, context: this._editor.context}]);
					this._themeState = item.sceneId[0];
				} else {	// PageEditor
					if(context && stateContainerNode){
						if(type == 'AppState') {
							newState = item.sceneId ? item.sceneId[0] : null;
						}else{
							newState = States.getState(stateContainerNode);
						}
						States.setState(newState, stateContainerNode, { focus:true, updateWhenCurrent:true });
						if(this._editor.declaredClass === "davinci.ve.PageEditor"){
							context.deselectInvisible();
							context.clearCachedWidgetBounds();
							context.updateFocusAll();
						}
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
					//FIXME: shouldn't be using 'file' for Elements
					}else if(item.type && item.type[0] == 'file' && item.node && item.node[0]._dvWidget){
						// If user clicked on a TreeNode that corresponds to a widget, then select that widget
						context.select(item.node[0]._dvWidget);
					}
					this._updateSelection();
				}
			});
	
			var newItemRecursive = function(obj, parentItem){
				var o = dojo.mixin({}, obj);
				var id = this.nextId+'';
				this.nextId++;
				o.id = id;		// ensure unique ID
				o.parentItem = parentItem;
				delete o.children;	// remove children property before calling newItem
				var thisItem;
				if(parentItem){
					thisItem = this._sceneStore.newItem(o, {parent:parentItem, attribute:'children'});
				}else{
					thisItem = this._sceneStore.newItem(o);
				}
				if(obj.children){
					obj.children.forEach(function(child){
						newItemRecursive(child, thisItem);
					});
				}
			}.bind(this);
	
			latestData.forEach(function(obj){
				newItemRecursive(obj);
			});
			this._sceneStore.save();
			// In some scenarios, necessary to resize the ContentPane that surrounds the Tree
			if(this._tree.getParent){
				var parent = this._tree.getParent();
				if(parent.resize){
					window.setTimeout(function(){parent.resize()}, 0);
				}
			}
		}.bind(this));

	},

//FIXME: sceneId for states might not be unique the way things are written now
//FIXME: Need to refactor this
//FIXME: Seems to be only used by theme editor
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
						var parentItem = item.parentItem && item.parentItem[0];
						while(parentItem){
							path.splice(0, 0, parentItem.id[0]);
							parentItem = parentItem.parentItem && parentItem.parentItem[0];;
						}
					}
				})
			});
		}
		path.splice(0, 0, 'StoryRoot');
		this._tree.set('paths', [path]);
	},
	
	// This code prevents +/- icons from appearing in theme and review editors
	// and in page editor when authoring Dojo Mobile UIs
	_hideShowToolBar: function(){
		if(!this._editor){
			return;
		}
		var context = (this._editor.getContext && this._editor.getContext());
		var showAppStates = (this._editor.declaredClass === "davinci.ve.PageEditor");
		dojo.style(this.toolbarDiv, "display", showAppStates ? "block" : "none");
		var AddStateActive, RemoveStateActive, ModifyStateActive;
		AddStateActive = RemoveStateActive = ModifyStateActive = false;
		if(context && context.rootNode){
			var statesFocus = States.getFocus(context.rootNode);
			if(statesFocus && statesFocus.stateContainerNode){
				AddStateActive = ModifyStateActive = true;
			}
			if(statesFocus && statesFocus.state && statesFocus.state !== States.NORMAL){
				RemoveStateActive = ModifyStateActive = true;
			}
		}
		function updateIcon(baseClassName, makeActive){
			var disabledClassName = baseClassName+'Disabled';
			var spanList = domQuery('.'+baseClassName);
			if(spanList.length){
				if(makeActive){
					domClass.remove(spanList[0], disabledClassName);
				}else{
					domClass.add(spanList[0], disabledClassName);
				}
			}
		}
		updateIcon('addStateIcon', AddStateActive);
		updateIcon('removeStateIcon', RemoveStateActive);
		updateIcon('modifyStateIcon', ModifyStateActive);
	},
	
	/**
	 * Take a labelSnippet that is to appear in the Tree and puts a standard set
	 * of wrapper SPAN elements around it, mostly to include a checkbox SPAN
	 * so we can control visibility of the checkbox to indicate currently active scenes
	 */
	_treeNodeContent: function(labelSnippet){
		var s = '';
		s += '<span title="'+veNls.InitialScene+'" class="ScenesPaletteAppStateIcon ScenesPaletteInitial">&#x2713;</span>';
		/*FIXME: PROBABLY DELETETHIS
		s += '<span title="'+veNls.ActiveScene+'" class="ScenesPaletteAppStateIcon ScenesPaletteCurrent">&#x263C;</span>';
		*/
		s += '<span title="'+veNls.ActiveScene+'" class="ScenesPaletteAppStateIcon ScenesPaletteCurrent"></span>';
		/*FIXME: PROBABLY DELETETHIS
		s += '<span title="'+veNls.AppStateFocus+'" class="ScenesPaletteAppStateIcon ScenesPaletteFocus">&#x25C9;</span>';
		*/
		s += '<span>'+labelSnippet+'</span>';
		return s;
	}, 
	
	/**
	 * Returns the SPAN inside of the TreeNode that has the given className
	 */
	_findTreeNodeSpanByClass: function(item, className){
		var treeNodes = this._tree.getNodesByItem(item);
		var treeNode = (treeNodes && treeNodes.length > 0) ? treeNodes[0] : null;
		var node = treeNode ? treeNode.domNode : null;
		var spans = treeNode ? dojo.query('.'+className, node) : [];
		var span = (spans && spans.length > 0) ? spans[0] : null;
		return span;
	},

	/**
	 * Handler for certain Context.js events. Causes this palette
	 * to see if any visual updates are needed.
	 */
	_contextEventHandler: function() {
		this._updateView();
	},
	
	/**
	 * Unregister listeners to certain Context.js events.
	 */
	_unregisterForContextEvents: function() {
		if(this._contextConnects){
			this._contextConnects.forEach(connect.disconnect);
			this._contextConnects = null;
		}
	},
	
	/**
	 * Upon receiving a new editorSelected event, 
	 * register listeners to certain Context.js events.
	 */
	_registerForContextEvents: function() {
		var contextEvents = ['widgetChanged', 'widgetAddedOrDeleted'];
		this._unregisterForContextEvents();
		var context = (this._editor && this._editor.getContext && this._editor.getContext());
		if(context){
			this._contextConnects = [];
			contextEvents.forEach(function(name){
				if(context[name]){
					this._contextConnects.push(connect.connect(context, name, this, '_contextEventHandler'));
				}
			}.bind(this));
		}
	}
});
});
