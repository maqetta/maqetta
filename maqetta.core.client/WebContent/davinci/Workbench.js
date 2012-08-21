define([
    "dojo/_base/lang",
    "require",
	"./Runtime",
	"./model/Path",
	"./workbench/ViewPart",
	"./workbench/EditorContainer",
	"./ui/Dialog",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"dijit/Menu",
	"dijit/MenuBar",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/PopupMenuBarItem",
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dijit/form/ComboButton",
	"dijit/form/ToggleButton",
	"dijit/layout/BorderContainer",
	"dijit/layout/StackController",
	"dijit/layout/StackContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/TabController",
	"dijit/layout/TabContainer",
	"system/resource",
	"dojo/i18n!./nls/webContent",
	"./ve/metadata",
	"dojo/Deferred",
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/_base/xhr",
	"./review/model/resource/root",
	"dojo/i18n!./ve/nls/common",
	"dojo/dnd/Mover",
	"./ve/utils/GeomUtils",
	"dojo/i18n!./workbench/nls/workbench"
], function(
		lang,
		require,
		Runtime,
		Path,
		ViewPart,
		EditorContainer,
		Dialog,
		Toolbar,
		ToolbarSeparator,
		Menu,
		MenuBar,
		MenuItem,
		MenuSeparator,
		PopupMenuBarItem,
		Button,
		DropDownButton,
		ComboButton,
		ToggleButton,
		BorderContainer,
		StackController,
		StackContainer,
		ContentPane,
		TabController,
		TabContainer,
		sysResource,
		webContent,
		metadata,
		Deferred,
		declare,
		connect,
		xhr,
		reviewResource,
		veNLS,
		Mover,
		GeomUtils,
		workbenchStrings
) {

// Cheap polyfill to approximate bind(), make Safari happy
Function.prototype.bind = Function.prototype.bind || function(that){ return dojo.hitch(that, this);};

// Convert filename path into an ID string
var filename2id = function(fileName) {
	return "editor-" + encodeURIComponent(fileName.replace(/[\/| |\t]/g, "_")).replace(/%/g, ":");
};
// Convert the result from filename2id into a different ID string that replaces "editor" with "shadow"
var editorIdToShadowId = function(editorFileName) {
	return editorFileName.replace(/^editor/, "shadow");
};
//Convert the result from filename2id into a different ID string that replaces "editor" with "shadow"
var shadowIdToEditorId = function(shadowFileName) {
	return shadowFileName.replace(/^shadow/, "editor");
};

var handleIoError = function (deferred, reason) {
	/*
	 *  Called by the subscription to /dojo/io/error , "
	 *  /dojo/io/error" is sent whenever an IO request has errored.
     *	It passes the error and the dojo.Deferred
     *	for the request with the topic.
	 */
	if (reason.status == 401 || reason.status == 403) {
		sessionTimedOut();
	// Only handle error if it is as of result of a failed XHR connection, not
	// (for example) if a callback throws an error. (For dojo.xhr, def.cancel()
	// is only called if connection fails or if it times out.)
	} else if (deferred.canceled === true) {
		// Filter on XHRs for maqetta server commands.  Possible values which we
		// test for:
		//     cmd/findResource
		//     ./cmd/createResource
		//     http://<host>/maqetta/cmd/getComments
		var reCmdXhr = new RegExp('(^|\\.\\/|' + document.baseURI + '\\/)cmd\\/');
		var url = deferred.ioArgs.url;
		if (!reCmdXhr.test(url)) {
			return;
		}

		Runtime.handleError(reason.message);
		console.warn('Failed to load url=' + url + ' message=' + reason.message +
				' status=' + reason.status);
	}
};

var sessionTimedOut = function(){
	var loginHref = '/maqetta/welcome';
	if(Runtime.singleUserMode()) {
		loginHref = '/maqetta/';
	}
	
	var dialog = new Dialog({
        title: webContent.sessionTimedOut
      //,  style: "width: 300px"
    });
	var message =  dojo.string.substitute(webContent.sessionTimedOutMsg, {hrefLoc: loginHref});
	dialog.set("content", message);
	dojo.connect(dialog, "onCancel", null, function(){window.location.href = loginHref;});
	setTimeout(function(){window.location.href=loginHref;}, 10000); // redirect to login in 10 sec
	dialog.show();
};

var getSelectedResource = function() {
	var selection=Runtime.getSelection();
	if (selection[0]&&selection[0].resource) {
		return selection[0].resource;
	}
};

var initializeWorkbenchState = function(){
	davinci.Workbench._expandCollapsePaletteContainers(null);

	var isReview = function (resPath) {
		return resPath.indexOf(".review") > -1;
	};

	var getReviewVersion = function (resPath) {
		return new Path(resPath).segment(2);
	};
	
	var getReviewResource = function (resPath) {
		return new Path(resPath).removeFirstSegments(3);
	};

	var init = function (state) {
		if (state.project) {
			Workbench.setActiveProject(state.project);
		}
		if (state.editors) {
			state.version = davinci.version;
			
			var project = null;
			var singleProject = Workbench.singleProjectMode();
		
			if (singleProject) {
				var p = Workbench.getProject();
				project = new Path(p);
			}
		
			state.editors.forEach(function(editor){
				var isReviewRes = isReview(editor);
				if(!isReviewRes && singleProject){
					// open all reviews and if running in single user mode, only load editors 
					// open for specific projects
					if (!new Path(editor).startsWith(project)) {
						return;
					}
				}
				
				var handleResource = function(resource) {
					// check if activeEditor is part of the current project or not
					var isActiveEditorInProject = true;
		
					if (singleProject) {
						var path = new Path(state.activeEditor);
						if (!path.startsWith(project)) {
							isActiveEditorInProject = false;
						}
					}
					
					var noSelect = editor != state.activeEditor;
		
					if (noSelect && !isActiveEditorInProject) {
						// if the active editor is not in our project, force selection
						noSelect = false;
						state.activeEditor = editor; // this is now the active editor
					}
		
					if (resource) {
//						resource.getContent().then(function(content){						
							Workbench.openEditor({
								fileName: resource,
								content: resource.getContentSync(),
								noSelect: noSelect,
								isDirty: resource.isDirty(),
								startup: false
							});
//						});
					}
				};
				
				if(isReviewRes){
					var version = getReviewVersion(editor);
					var resPath = getReviewResource(editor).toString();
					 reviewResource.findFile(version, resPath).then(function(resource) {
						 handleResource(resource);
					 });
				}else{
					handleResource(sysResource.findResource(editor));
				}
				
				
			});
		} else {
			state.editors = [];
		}
	};

	if (!Workbench._state || !Workbench._state.hasOwnProperty("editors")) { //TODO: is this conditional necessary?  could state have been set prior to initialization?
		xhr.get({
			url: "cmd/getWorkbenchState",
			handleAs: "json"
		}).then(function(response){
			init((Workbench._state = response));
			Workbench.setupGlobalKeyboardHandler();
		});
	} else {                              
		init(Workbench._state);
		Workbench.setupGlobalKeyboardHandler();
	}

	// The following event triggers palettes such as SwitchingStyleViews.js to know
	// that workbench has completed initialization of the initial perspective
	// and associated views. Put after the xhr.get to allow execution parallelism.
	dojo.publish("/davinci/ui/initialPerspectiveReady", []);
};

var Workbench = {
	activePerspective: "",
	actionScope: [],
	_DEFAULT_PROJECT: "project1",
	hideEditorTabs: true,
	_editorTabClosing: {},
	_shadowTabClosing: {},

	run: function() {
		Runtime.run();
		Workbench._initKeys();
		Workbench._baseTitle = dojo.doc.title;

		Runtime.subscribe("/davinci/resource/resourceChanged",
			function (type, changedResource) {
				if (type == 'deleted') {
					var editorId = filename2id(changedResource.getPath());
					var shadowId = editorIdToShadowId(editorId);
					var editorContainer = dijit.byId(editorId);
					var shadowTab = dijit.byId(shadowId);
					if (editorContainer && !editorContainer._isClosing) {
						var editorsContainer = dijit.byId("editors_container");
						var shadowTabContainer = dijit.byId("davinci_file_tabs");
						editorsContainer.removeChild(editorContainer);
						editorContainer.destroyRecursive();
						shadowTabContainer.removeChild(shadowTab);
						shadowTab.destroyRecursive();
					}
				}
			}
		);
		Runtime.subscribe('/dojo/io/error', handleIoError); // /dojo/io/error" is sent whenever an IO request has errored. 
		                                                   // requires djConfig.ioPublish be set to true in pagedesigner.html

		Runtime.subscribe("/davinci/states/state/changed",
			function(e) {
				// e:{node:..., newState:..., oldState:...}
				var currentEditor = Runtime.currentEditor;
				// ignore updates in theme editor and review editor
				if ((currentEditor.declaredClass != "davinci.ve.themeEditor.ThemeEditor" &&
						currentEditor.declaredClass != "davinci.review.editor.ReviewEditor") /*"davinci.ve.VisualEditor"*/) {
					currentEditor.visualEditor.onContentChange.apply(currentEditor.visualEditor, arguments);
				}
			}
		);
		Runtime.subscribe("/davinci/ui/widgetPropertiesChanges",
			function() {
				var ve = Runtime.currentEditor.visualEditor;
				ve._objectPropertiesChange.apply(ve, arguments);
			}
		);

		// bind overlay widgets to corresponding davinci states. singleton; no need to unsubscribe
		connect.subscribe("/davinci/states/state/changed", function(args) {
			//FIXME: This is page editor-specific logic within Workbench.
			var context = (Runtime.currentEditor && Runtime.currentEditor.declaredClass == "davinci.ve.PageEditor" && 
					Runtime.currentEditor.visualEditor && Runtime.currentEditor.visualEditor.context);
			if(!context){
				return;
			}
			var prefix = "_show:", widget, dvWidget, helper;
			var thisDijit = context ? context.getDijit() : null;
			var widgetUtils = require("davinci/ve/widget");
			if (args.newState && !args.newState.indexOf(prefix)) {
				widget = thisDijit.byId(args.newState.substring(6));
				dvWidget = widgetUtils.getWidget(widget.domNode);
				helper = dvWidget.getHelper();
				helper && helper.popup && helper.popup(dvWidget);
			}
			if (args.oldState && !args.oldState.indexOf(prefix)) {
				widget = thisDijit.byId(args.oldState.substring(6));
				dvWidget = widgetUtils.getWidget(widget.domNode);
				helper = dvWidget.getHelper();
				helper && helper.tearDown && helper.tearDown(dvWidget);
			}
		});

		var d = metadata.init().then(function(){
			var perspective = Runtime.initialPerspective || "davinci.ui.main";
			Workbench.showPerspective(perspective);
			Workbench._updateTitle();
			initializeWorkbenchState();			
		});
	
		var loading = dojo.query('.loading');
		if (loading[0]){ // remove the loading div
			loading[0].parentNode.removeChild(loading[0]);
		}
		Workbench._lastAutoSave = Date.now();
		setInterval(dojo.hitch(this,"_autoSave"),30000);
		return d;
	},

	unload: function () {
		Workbench._autoSave();
	},

	/**
	 * Creates a toolbar widget out of the definitions in the plugin file(s)
	 * @param {string} toolbarProp  The property name from plugin file that corresponds to this particular toolbar
	 * @param {Element} targetDiv  Container DIV into which this toolbar should be instantiated
	 * @param actionSets  Action sets from plugin file(s)
	 * @param context  Document context FIXME: 95% sure that parameter is obsolete
	 * @returns {Toolbar}  toolbar widget
	 */
	_createToolBar: function (toolbarProp, targetDiv, actionSets, context){
		var _toolbarcache = [];
		if (!actionSets) {
		   actionSets = Runtime.getExtensions('davinci.actionSets');
		}
		for (var i = 0, len = actionSets.length; i < len; i++) {
			var actions = actionSets[i].actions;
			for (var k = 0, len2 = actions.length; k < len2; k++) {
				var action = actions[k],
					toolBarPath = action[toolbarProp];
				if (toolBarPath) {
					if (!_toolbarcache[toolBarPath]) {
						_toolbarcache[toolBarPath] = [];
					}
					_toolbarcache[toolBarPath].push(action);
				}
			}
		}
	
		var toolbar1 = new Toolbar({'class':"davinciToolbar"}, targetDiv);   
		var radioGroups = {};
		var firstgroup = true;
		for (var value in _toolbarcache) {
			if (!firstgroup) {
				var separator = new ToolbarSeparator();
				toolbar1.addChild(separator);
			} else {
				firstgroup = false;
			}
			var children;
			var actions = _toolbarcache[value];
			for (var p = 0; p<actions.length; p++) {
				var action = actions[p];
				var id = action.id;
				// dont add dupes
		
				Workbench._loadActionClass(action);
				var parms = {showLabel:false/*, id:(id + "_toolbar")*/};
				['label','showLabel','iconClass'].forEach(function(prop){
					if(action.hasOwnProperty(prop)){
						parms[prop] = action[prop];
					}
				});
				if (action.className) {
					parms['class'] = action.className;
				}
				var dojoAction;
				var dojoActionDeferred = new Deferred();
				if(action.menu && (action.type == 'DropDownButton' || action.type == 'ComboButton')){
					var menu = new Menu({
						style: "display: none;"
					});
					for(var ddIndex=0; ddIndex<action.menu.length; ddIndex++){
						var menuItemObj = action.menu[ddIndex];
						Workbench._loadActionClass(menuItemObj);
						var menuItemParms = {
							onClick: dojo.hitch(this, "_runAction", menuItemObj, context)
						};
						var props = ['label','iconClass'];
						props.forEach(function(prop){
							if(menuItemObj[prop]){
								menuItemParms[prop] = menuItemObj[prop];
							}
						});
						var menuItem = new MenuItem(menuItemParms);
						menuItem._maqAction = menuItemObj;
						menu.addChild(menuItem);
					}
					parms.dropDown = menu;
					if(action.type == 'DropDownButton'){
						dojoAction = new DropDownButton(parms);
					}else{
						dojoAction = new ComboButton(parms);
					}
					dojoAction.onClick = dojo.hitch(this, "_runAction", action, context);
					dojoAction._maqAction = action;
					dojoActionDeferred.resolve();
				}else if (action.toggle || action.radioGroup) {
					dojoAction = new ToggleButton(parms);
					dojoAction.item = action;
					dojoAction.set('checked', action.initialValue);
					if (action.radioGroup) {
						var group = radioGroups[action.radioGroup];
						if (!group) {
							group = radioGroups[action.radioGroup]=[];
						}
						group.push(dojoAction);
						dojoAction.onChange = dojo.hitch(this, "_toggleButton", dojoAction, context, group);
					} else {
						dojoAction.onChange = dojo.hitch(this,"_runAction", action, context);
					}
					dojoAction._maqAction = action;
					dojoActionDeferred.resolve();
				}else if(action.type){
					require([action.type], function(ReviewToolBarText) {
						dojoAction = new ReviewToolBarText();
						dojoAction._maqActiond = action;
						dojoActionDeferred.resolve();
					});
				}else{
					dojoAction = new Button(parms);
					dojoAction.onClick = dojo.hitch(this, "_runAction", action, context);
					dojoAction._maqAction = action;
					dojoActionDeferred.resolve();
				}
				if (action.icon) {
					var imageNode = document.createElement('img');
					imageNode.src = action.icon;
					imageNode.height = imageNode.width = 18;
					dojoAction.domNode.appendChild(imageNode);
				}
				dojoActionDeferred.then(function(){
					toolbar1.addChild(dojoAction);
					//FIXME: looks like the parameter to isEnabled is "context",
					//but maybe that should be the current editor instead. Whatever, 
					//targetObjectId just has to be wrong.
					if (action.isEnabled && !action.isEnabled(/*FIXME: targetObjectId*/)) { 
						dojoAction.isEnabled = action.isEnabled;
						dojoAction.set('disabled', true);
					} else {
						dojoAction.set('disabled', false);
					}
				});
			}
		}
		return toolbar1;
	},

	showPerspective: function(perspectiveID) {
		Workbench.activePerspective = perspectiveID;
		var menuTree = Workbench._createMenuTree();	// no params means include "everything else"
		Workbench._updateMainMenubar(dojo.byId('davinci_main_menu'), menuTree);

		var o = this.getActionSets('davinci.ui.editorMenuBar');
		var clonedActionSets = o.clonedActionSets;
		if(clonedActionSets.length){
			menuTree = Workbench._createMenuTree(clonedActionSets);
			Workbench._updateMainMenubar(dojo.byId('maq_banner_editor_commands'), menuTree);
		}

		var mainBody = dojo.byId('mainBody');
		if (!mainBody.tabs) {
			mainBody.tabs = [];
		}
		
		/* Large border container for the entire page */
		var mainBodyContainer = dijit.byId('mainBody');

		if (!mainBodyContainer) {
			mainBodyContainer = new BorderContainer({
				gutters: false,
				region: "center",
				design: 'sidebar'
			}, mainBody);
		}
		var perspective = Runtime.getExtension("davinci.perspective",perspectiveID);

		if (!perspective) {
			Runtime.handleError(dojo.string.substitute(webContent.perspectiveNotFound,[perspectiveID]));
		}

		perspective = dojo.clone(perspective);	// clone so views aren't added to original definition

		var extensions = Runtime.getExtensions("davinci.perspectiveExtension",
				function (extension) {
					return extension.targetID === perspectiveID;
				});
		dojo.forEach(extensions, function (extension) {
			// TODO: should check if view is already in perspective. filter + concat instead of foreach + push?
			dojo.forEach(extension.views, function (view){ perspective.views.push(view); });
		});

		if (!mainBody.editorsStackContainer) {
			Workbench.editorsStackContainer = mainBody.editorsStackContainer =
				new StackContainer({
					region:'center',
					id: "editorsStackContainer",
					controllerWidget: "dijit.layout.StackController"
				});
		}
		// FIXME: THIS BYPASSES THE PLUGIN SYSTEM.
		// Hardcoding this for now. Need to figure out how to turn change
		// welcome page logic into something that is defined by ve_plugin.js.
		mainBodyContainer.addChild(mainBody.editorsStackContainer);
		if (!mainBody.editorsWelcomePage) {
			Workbench.editorsWelcomePage = mainBody.editorsWelcomePage =
				new ContentPane({
					id: "editorsWelcomePage",
					href: "app/davinci/ve/resources/welcome_to_maqetta.html"
				});
		}
		mainBody.editorsStackContainer.addChild(mainBody.editorsWelcomePage);
		if (!mainBody.tabs.editors) {
			Workbench.editorTabs = mainBody.tabs.editors =
				new (Workbench.hideEditorTabs ? StackContainer : TabContainer)({
					id: "editors_container",
					controllerWidget: (Workbench.hideEditorTabs ? "dijit.layout.StackController" : "dijit.layout.TabController")
				});
			Workbench.editorTabs.setTitle = function(editorContainer, title) { 
				editorContainer.attr('title', title);
				// After letting Dijit put the title onto the ContentPane,
				// force title to null string on the domNode so that the
				// browser doesn't show an annoying tooltip while hovering
				// over an editor.
				editorContainer.domNode.title = '';
				if(!Workbench.hideEditorTabs){
					this.tablist.pane2button[editorContainer.id].attr('label', title);
				}else{
					var editorId = editorContainer.id;
					var shadowId = editorIdToShadowId(editorId);
					var shadowTabContainer = dijit.byId("davinci_file_tabs");
					shadowTabContainer.tablist.pane2button[shadowId].attr('label', title);
				}
			};
			
			dojo.connect(mainBody.tabs.editors, "removeChild", this, Workbench._editorTabClosed);
		}
		mainBody.editorsStackContainer.addChild(mainBody.tabs.editors);
		mainBody.editorsStackContainer.selectChild(mainBody.editorsWelcomePage);
		dojo.connect(dijit.byId("editors_container"), "selectChild", function(child) {
			if(!Workbench._processingSelectChild){
				Workbench._processingSelectChild = true;
				var editorId = child.id;
				var shadowId = editorIdToShadowId(editorId);
				var shadowTab = dijit.byId(shadowId);
				var shadowTabContainer = dijit.byId("davinci_file_tabs");
				if(shadowTab && shadowTabContainer){
					shadowTabContainer.selectChild(shadowTab);
				}
				if (child.editor) {
					Workbench._switchEditor(child.editor);
				}
				Workbench._processingSelectChild = false;
			}
		});
		mainBodyContainer.startup();

		// Put the toolbar and the main window in a border container
		var appBorderContainer = dijit.byId('davinci_app');
		if (!appBorderContainer) {
			appBorderContainer = new BorderContainer({
				design: "headline",
				gutters: false,
				liveSplitters: false
			}, "davinci_app");
			
			var topBarPane = new ContentPane({
				region: "top",
				layoutPriority:1
			}, "davinci_top_bar");
			
			var mainStackContainer = Workbench.mainStackContainer = mainBody.editorsStackContainer =
				new StackContainer({
					region:'center',
					id: "mainStackContainer",
					controllerWidget: "dijit.layout.StackController"
				});
			var welcomePage = Workbench.welcomePage = 
				new ContentPane({
					id: "welcomePage",
					href: "app/davinci/ve/resources/welcome_to_maqetta.html"
				});

			var mainBorderContainer = Workbench.mainBorderContainer = new BorderContainer({
				design: "headline",
				gutters: false,
				id:'mainBorderContainer',
				liveSplitters: false
			});
			
			var shadowTabContainer = Workbench.shadowTabs = new TabContainer({
				id:'davinci_file_tabs',
				closable: true,
				region: "top",
				layoutPriority:1,
				style:'display:none'
			});
			
			Workbench.shadowTabs.setTitle = function(tab, title) { 
				tab.attr('title', title);
				this.tablist.pane2button[tab.id].attr('label', title);
			};
			dojo.connect(shadowTabContainer, "selectChild", function(child) {
				var shadowId = child.id;
				var editorId = shadowIdToEditorId(shadowId);
				var editorContainer = dijit.byId(editorId);
				var editorsContainer = dijit.byId("editors_container");
				if (editorsContainer && editorContainer && editorContainer.editor) {
					// This is trigger (indirectly) the selectChild callback function on 
					// the editors_container widget, which will trigger Workbench._switchEditor
					editorsContainer.selectChild(editorContainer);
				}
			});
			dojo.connect(shadowTabContainer, "removeChild", this, Workbench._shadowTabClosed);
			var toolbarPane = new ContentPane({
				id:'davinci_toolbar_pane',
				region: "top",
				layoutPriority:1,
				content:'<div id="davinci_toolbar_container"></div>',
				style:'display:none'
			});
		
			appBorderContainer.addChild(topBarPane);
			appBorderContainer.addChild(mainStackContainer);
			mainStackContainer.addChild(mainBorderContainer);
			mainStackContainer.selectChild(mainBorderContainer);

			mainBorderContainer.addChild(shadowTabContainer);
			mainBorderContainer.addChild(toolbarPane);
			mainBorderContainer.addChild(mainBodyContainer);
			appBorderContainer.layout();	
			appBorderContainer.startup();
			Workbench._originalOnResize = window.onresize;
			window.onresize = Workbench.onResize; //alert("All done");}
			dojo.connect(mainBodyContainer, 'onMouseUp', this, 'onResize');
			
			var shadowTabMenu = dijit.byId('davinci_file_tabs_tablist_Menu');
			if(shadowTabMenu){
				shadowTabMenu.addChild(new dijit.MenuItem({
					label:veNLS.closeAllEditors,
					onClick:function(a, b, c){
						this.closeAllEditors();
					}.bind(this)
				}));
			}
		}
		/* close all of the old views */
		for (var position in mainBody.tabs.perspective) {
			var view = mainBody.tabs.perspective[position];
			if(!view) {
				continue;
			}
			dojo.forEach(view.getChildren(), function(child) {
				view.removeChild(child);
				if (position != 'left' && position != 'right') {
					child.destroyRecursive(false);
				}
			});
			view.destroyRecursive(false);
			delete mainBody.tabs.perspective[position];
		}

		dojo.forEach(perspective.views, function(view) {
			Workbench.showView(view.viewID, false);
		}, this);

		//FIXME: This is also ugly - creating a special DIV for visual editor's selection chrome
		//Note sure how best to factor this out, though.
		davinci.Workbench.focusContainer = dojo.create('div', {'class':'focusContainer', id:'focusContainer'}, document.body);

		// kludge to workaround problem where tabs are sometimes cutoff/shifted to the left in Chrome for Mac
		// would be nice if we had a workbench onload event that we could attach this to instead of relying on a timeout
		setTimeout(function() {
			appBorderContainer.resize();
			dojo.publish("/davinci/workbench/ready", []);
		}.bind(this), 3000);
	},

	onResize: function(e){
		var target = e.explicitOriginalTarget ? e.explicitOriginalTarget : e.srcElement;
		if (e.type == 'resize' || ((target.id && (target.id.indexOf('dijit_layout__Splitter_')>-1) || 
			(target.nextSibling && target.nextSibling.id && target.nextSibling.id.indexOf('dijit_layout__Splitter_')>-1)))) {
			var ed = davinci && Runtime.currentEditor;
			if (davinci && Runtime.currentEditor && Runtime.currentEditor.onResize) {
				Runtime.currentEditor.onResize();
			}
		}
		if (Workbench._originalOnResize) {
			Workbench._originalOnResize();
		}
		Workbench._repositionFocusContainer();
	},

	updateMenubar: function(node, actionSets) {
		var menuTree = Workbench._createMenuTree(actionSets);

		var menuTop = dijit.byId(node.id);
		if (!menuTop) {
			menuTop = new MenuBar({'class': 'dijitInline'}, node);
		}
		Workbench._addItemsToMenubar(menuTree, menuTop);
	},
	
	_updateMainMenubar: function(menuDiv, menuTree) {
		for (var i=0; i<menuTree.length; i++) {
			var menuTreeItem = menuTree[i];
			for (var j=0;j<menuTreeItem.menus.length;j++) {
				var menu = menuTreeItem.menus[j];
				var dojoMenu = Workbench._createMenu(menu);
				menu.id = menu.id.replace(".", "-"); // kludge to work around the fact that '.' is being used for ids, and that's not compatible with CSS
				var widget = dijit.byId(menu.id + "-dropdown");
				if(!widget) {
					var params = { label: menu.label, dropDown: dojoMenu, id: menu.id + "-dropdown" };
					if(menu.hasOwnProperty('showLabel')){
						params.showLabel = menu.showLabel;
					}
					if(menu.hasOwnProperty('iconClass')){
						params.iconClass = menu.iconClass;
					}
					if(menu.hasOwnProperty('className')){
						params['class'] = menu.className;
					}
					widget = new DropDownButton(params);
					menuDiv.appendChild(widget.domNode);
				}
			}
		}
	},

	_addItemsToMenubar: function(menuTree, menuTop) {
		dojo.forEach(menuTree, function(m) {
			var menus = m.menus,
				menuLen = menus.length;
			if (menuLen) {
				dojo.forEach (menus, function(menu) {
					menu.id = menu.id.replace(/\./g, "-"); // kludge to work around the fact that '.' is being used for ids, and that's not compatible with CSS
					var dojoMenu = Workbench._createMenu(menu),
						widget =  dijit.byId(menu.id + "-dropdown");
					if (!widget) {
						widget = new PopupMenuBarItem({
							label: menu.label,
							popup: dojoMenu,
							id: menu.id + "-dropdown"
						});
					}
					menuTop.addChild(widget);
				}, this);
			}
		}, this);
	},
	/* returns either the active editor, or the editor with given resource open */
	getOpenEditor: function(resource) {
		
		if(resource!=null){
			var tab = dijit.byId(filename2id(resource.getPath()));
			if (tab) {
				return tab.editor;
			}
			return null; // no editor found for given resource
		}
		
		
		var editorsContainer = dijit.byId("editors_container");
		if (editorsContainer && editorsContainer.selectedChildWidget && editorsContainer.selectedChildWidget.editor) {
			return editorsContainer.selectedChildWidget.editor;
		}
		return null;
	},

	closeActiveEditor: function() {
		var editorsContainer = dijit.byId("editors_container");
		var shadowTabContainer = dijit.byId("davinci_file_tabs");

		if (editorsContainer && editorsContainer.selectedChildWidget && editorsContainer.selectedChildWidget.editor) {
			var editorId = selectedChildWidget.id;
			var shadowId = editorIdToShadowId(editorId);
			editorsContainer.closeChild(editorsContainer.selectedChildWidget);
			var shadowTab = dijit.byId(shadowId);
			if(shadowTab){
				shadowTabContainer.closeChild(shadowTab);
			}
		}
	},

	closeAllEditors: function() {
		var editorsContainer = dijit.byId("editors_container");

		if (editorsContainer) {
			editorsContainer.getChildren().forEach(function(child){
				editorsContainer.closeChild(child);
			});
		}
	},

	getAllOpenEditorIds: function() {
	},

	showModal: function(content, title, style, callback) {
		return Dialog.showModal(content, title, style, callback);
	},

	// simple dialog with an automatic OK button that closes it.
	showMessage: function(title, message, style, callback) {
		return Dialog.showMessage(title, message, style, callback);
	},

	// OK/Cancel dialog with a settable okLabel
	showDialog: function(title, content, style, callback, okLabel, hideCancel) {
		return Dialog.showDialog(title, content, style, callback, okLabel, hideCancel);
	},

	_createMenuTree: function(actionSets, pathsOptional) {
		if (!actionSets) {  // only get action sets not associated with part
			actionSets =  Runtime.getExtensions("davinci.actionSets", function (actionSet) {
				var associations = Runtime.getExtensions("davinci.actionSetPartAssociations", function(actionSetPartAssociation) {
					return actionSetPartAssociation.targetID == actionSet.id;
				});	
				return associations.length == 0;
			});
		}
		var menuTree = [];
		function findID(m, id) { //ALP: dijit.byId?
			for ( var j = 0, jLen = m.length; j < jLen; j++) {
				for ( var k = 0, kLen = m[j].menus.length; k < kLen; k++) {
					if (id == m[j].menus[k].id) {
						return m[j].menus[k].menus;
					}
				}
			}
		}

		function addItem(item, path,pathsOptional) {
			path = path || "additions";
			path = path.split('/');
			var m = menuTree;

			Workbench._loadActionClass(item);
			
			var sep = path[path.length - 1];
			if (path.length > 1) {
				for ( var i = 0, len = path.length - 1; i < len; i++) {
					var k = findID(m, path[i]);
					if (k) {
						m = k;
					}
				}
			}
			for ( var i = 0, len = m.length; i < len; i++) {
				if (m[i].id == sep) {
					var menus = m[i].menus;
					menus.push(item);
					if (item.separator) { // if menu
						var wasAdditions = false;
						menus = item.menus = [];
						for ( var j = 0; j < item.separator.length; j += 2) {
							var id = item.separator[j];
	
							wasAdditions = id == "additions";
							menus.push( {
								id: id,
								isSeparator: item.separator[j + 1],
								menus: []
							});
						}
						if (!wasAdditions) {
							menus.push({
								id: "additions",
								isSeparator: false,
								menus: []
							});
						}
					}
					return;
				}
			}
			if (pathsOptional) {
				menuTree.push( {
					id: sep,
					isSeparator: false,
					menus: [item]
				});
			}
		}
	
		for ( var actionSetN = 0, len = actionSets.length; actionSetN < len; actionSetN++) {
			var actionSet = actionSets[actionSetN];
			if (actionSet.visible) {
				if (actionSet.menu) {
					for ( var menuN = 0, menuLen = actionSet.menu.length; menuN < menuLen; menuN++) {
						var menu = actionSet.menu[menuN];
						if (menu.__mainMenu) {
							for ( var j = 0; j < menu.separator.length; j += 2) {
								menuTree.push({
									id: menu.separator[j],
									isSeparator: menu.separator[j + 1],
									menus: []
								});
							}
						} else {
							addItem(menu, menu.path,pathsOptional);
							if (menu.populate instanceof Function) {
								var menuItems = menu.populate();
								for (var item in menuItems) {
									addItem(menuItems[item], menuItems[item].menubarPath);
								}
							}
								
						}
					}
				}
			}
		}
		
		for ( var actionSetN = 0, len = actionSets.length; actionSetN < len; actionSetN++) {
			var actionSet = actionSets[actionSetN];
			if (actionSet.visible) {
				for ( var actionN = 0, actionLen = actionSet.actions.length; actionN < actionLen; actionN++) {
					var action = actionSet.actions[actionN];
					if (action.menubarPath) {
						addItem(action, action.menubarPath,pathsOptional);
					}
				}
			}
		}
		return menuTree;
	},

	_loadActionClass: function(item) {
		if (typeof item.action == "string") {
			require([item.action], function(ActionClass){
				item.action = new ActionClass();
				item.action.item = item;
			});
		}
	},

	_createMenu: function(menu, context) {
		var dojoMenu,menus,connectFunction;
		if (menu.menus) {  // creating dropdown
		  dojoMenu = new Menu({parentMenu: menu });
		  menus = menu.menus;
		  connectFunction = "onOpen";
		} else {	// creating popup
			dojoMenu = new PopupMenu({});
			menus = menu;
			connectFunction="menuOpened";
		}

		dojoMenu.domNode.style.display = "none";
		dojoMenu.actionContext = context;
		this._buildMenu(dojoMenu, menus);
		dojo.connect(dojoMenu, connectFunction, this, function(evt) {
			//what is this callback for?
			if (dojoMenu._widgetCallback) {
			  dojoMenu._widgetCallback(evt);
			}
//		   this._buildMenu(dojoMenu, menus, evt).focus(); // call focus again, now that we messed with the widget contents
		});
		return dojoMenu;
	},
	/*
	 * running in single project mode or multi project mode
	 */
	singleProjectMode: function() {
		return true;
	},
	
	getProject: function() {
		return Workbench.getActiveProject() || Workbench._DEFAULT_PROJECT;
	},
	
	
	loadProject: function(projectName) {
		Workbench.setActiveProject(projectName).then(function(){
			location.reload(true);	
		});
		
		// if the project was set via URL parameter, clear it off.  
		
	
	},
	
	location: function() {
		return Runtime.location();
	},
	
	queryParams: function() {
		// reloads the browser with the current project.
		var fullPath = document.location.href;
		var split = fullPath.split("?");
		var searchString = split.length>1? split[1] : "";
		// remove the ? from the front of the query string 
		return dojo.queryToObject(searchString);
	},
	
	_buildMenu: function (dojoMenu, menus) {
		/*
		dojo.forEach(dojoMenu.getChildren(), function(child){
			dojoMenu.removeChild(child);
			child.destroy();
		});
		dojoMenu.focusedChild = null; // TODO: dijit.Menu bug?  Removing a focused child should probably reset focusedChild for us
		*/
		var addSeparator,menuAdded;
		for (var i = 0, len = menus.length; i < len; i++) {
			if (menus[i].menus.length > 0) {
				if (menus[i].isSeparator && i>0) {
					addSeparator=true;
				}
				for ( var menuN = 0, menuLen = menus[i].menus.length; menuN < menuLen; menuN++) {
					if (addSeparator && menuAdded) {
						dojoMenu.addChild(new MenuSeparator({}));
						addSeparator=false;
					}
					menuAdded=true;
					var item = menus[i].menus[menuN];
					var label = item.label;
					if (item.action && item.action.getName) {
						label = item.action.getName();
					}
					if (item.separator) {
						var subMenu = Workbench._createMenu(item);
						var popupParent = new MenuItem({
							label: label,
							popup: subMenu,
							id: subMenu.id + "item"
						});
						popupParent.actionContext = dojoMenu.actionContext;
						dojoMenu.addChild(popupParent);
					} else {
						var enabled = true;
						if (item.isEnabled) {
							var resource = getSelectedResource();
							enabled = resource ? item.isEnabled(resource) : false;
						}

						if (item.action) {
							if (item.action.shouldShow && !item.action.shouldShow(dojoMenu.actionContext, {menu:dojoMenu})) {
								continue;
							}
							//FIXME: study this code for bugs.
							//dojoMenu.actionContext: is that always the current context?
							//There were other bugs where framework objects pointed to wrong context/doc
							enabled = item.action.isEnabled(dojoMenu.actionContext);
						}
						var menuArgs = {
								label: label,
								id: item.id,
								disabled: !enabled,
								onClick: dojo.hitch(this,"_runAction",item,dojoMenu.actionContext)
						};
						if (item.iconClass) {
							menuArgs.iconClass = item.iconClass;
						}
						var menuItem1 = new MenuItem(menuArgs);
						dojoMenu.addChild(menuItem1);
					}
				}
			}
		}

		return dojoMenu;
	},
	
	_toggleButton: function(button, context, group, arg) {
		if (!button.checked) {
			return;
		}
		group.forEach(function(item) {
			if (item != button) {
				item.set('checked', false);
			}
		});
		Workbench._runAction(button.item,context,button.item.id);
	},

	//FIXME: "context" is really an editor, isn't it? Like davinci.ve.PageEditor?
	_runAction: function(item, context, arg) {
		//FIXME: Not sure this code is correct, but sometimes this routine is passed
		//a context object that is not associated with the current document
		if(context && davinci.Runtime.currentEditor){
			context = davinci.Runtime.currentEditor;
		}
		if (item.run) {
			item.run();
		} else if (item.action) {
			if (dojo.isString(item.action)) {
				this._loadActionClass(item);
			}
			item.action.run(context);
		} else if (item.method && context && context[item.method] instanceof Function) {
			context[item.method](arg);
		} else if (item.commandID) {
			Runtime.executeCommand(item.commandID);
		}
	},

	showView: function(viewId, shouldFocus){
	  try {
		var mainBodyContainer = dijit.byId('mainBody'),
			view = Runtime.getExtension("davinci.view", viewId),
			mainBody = dojo.byId('mainBody'),
			perspectiveId = Workbench.activePerspective,
			perspective = Runtime.getExtension("davinci.perspective", perspectiveId),
			position = 'left',
			cp1 = null,
			created = false,
			pxHeight = dijit.byId('mainBody')._borderBox.h - 5;
		
		dojo.some(perspective.views, function(view){
			if(view.viewID ==  viewId){
				position = view.position;
				return true;
			}	
		});
		
		mainBody.tabs = mainBody.tabs || {};				
		mainBody.tabs.perspective = mainBody.tabs.perspective || {};

		if (position == 'right' && !mainBody.tabs.perspective.right) {
			mainBodyContainer.addChild(mainBody.tabs.perspective.right = 
				new BorderContainer({'class':'davinciPaletteContainer', 
					style: 'width: 340px;', id:"right_mainBody", 
					region:'right', gutters: false, splitter:true}));
			mainBody.tabs.perspective.right.startup();
		}

		if (position == 'left' && !mainBody.tabs.perspective.left) {
			mainBodyContainer.addChild(mainBody.tabs.perspective.left = 
				new BorderContainer({'class':'davinciPaletteContainer', 
					style: 'width: 300px;', id:"left_mainBody", 
					region:'left', gutters: false, splitter:true}));
			mainBody.tabs.perspective.left.startup();
		}

		if (position === 'left' || position === 'right') {
			position += "-top";
		}
		var positionSplit = position;

		if (!mainBody.tabs.perspective[position]) {
			positionSplit = position.split('-');

			var region = positionSplit[0],
				parent = mainBodyContainer,
				clazz = 'davinciPalette ',
				style = '';
			if (positionSplit[1] && (region == 'left' || region == 'right')) {
				parent = mainBody.tabs.perspective[region];
				region = positionSplit[1];
				if (positionSplit[1] == "top") {
					region = "center";
					clazz += "davinciTopPalette";
				} else {
					style = 'height:30%;';
					clazz += "davinciBottomPalette";
				}
			} else if(region == 'bottom') {
				style = 'height:80px;';
				clazz += "davinciBottomPalette";
			}
			cp1 = mainBody.tabs.perspective[position] = new TabContainer({
				region: region,
				id:'palette-tabcontainer-'+position,
				tabPosition:positionSplit[0]+'-h',
				tabStrip:false,
				'class': clazz,
				style: style,
				splitter: region != "center",
				controllerWidget: "dijit.layout.TabController"
			});
			parent.addChild(cp1);
			dojo.connect(cp1, 'selectChild', this, function(tab){
				if(tab && tab.domNode){
					var tc = tab.getParent();
					// Don't mess with which tab is selected or do any collapse/expand
					// if selectChild is called in response to adding the first child
					// of a TabContainer, which causes an implicit selectFirst().
					if(!this._showViewAddChildInProcess){
						if(tc._maqLastSelectedChild == tab){
							this._expandCollapsePaletteContainer(tab);						
						}else{
							this.expandPaletteContainer(tab.domNode);						
						}
					}
					tc._maqLastSelectedChild = tab;
				}
			}.bind(this));
		} else {
			cp1 = mainBody.tabs.perspective[position];
		}

		if (dojo.some(cp1.getChildren(), function(child){ return child.id == view.id; })) {
			return;
		}
		this.instantiateView(view).then(function(tab) {
			this._showViewAddChildInProcess = true;
			cp1.addChild(tab);
			this._showViewAddChildInProcess = false;
			// Put a tooltip on the tab button. Note that native TabContainer
			// doesn't offer a tooltip capability for its tabs
			var controlButton = tab.controlButton;
			if(controlButton && controlButton.domNode){
				controlButton.domNode.title = view.title + ' ' +  veNLS.palette;
			}
			if(shouldFocus) {
				cp1.selectChild(tab);
			}
		}.bind(this));
	  } catch (ex) {
		  console.error("Error loading view: "+view.id);
		  console.error(ex);
	  }
	},

	instantiateView: function(view) {
		var d = new Deferred(),
		tab = dijit.byId(view.id);
		if (tab) {
			d.resolve(tab);
		} else {
			require([view.viewClass], function(viewCtor){
				var params = { title: view.title,
						id: view.id, closable: false, view: view };
				if(view.iconClass){
					params.iconClass = view.iconClass;
				}
				d.resolve(new (viewCtor || ViewPart)(params));
			});
		}
		return d;
	},

	hideView: function(viewId){
		for (var position in mainBody.tabs.perspective) {
			if(position=='left' || position == 'right'){
				position+='-top';
			}
			if(!mainBody.tabs.perspective[position]){
				continue;
			}
			var children = mainBody.tabs.perspective[position].getChildren();
			var found = false;
			for (var i = 0; i < children.length && !found; i++) {
				if (children[i].id == viewId) {
					mainBody.tabs.perspective[position].removeChild(children[i]);
					children[i].destroyRecursive(false);
				}
			}									
		}
	},

	toggleView: function(viewId) {
		var found = dojo.byId(viewId);
		if(found) {
			Workbench.hideView(viewId);
		} else{
			Workbench.showView(viewId, true);
		}
	},

	openEditor: function (keywordArgs, newHtmlParams) {
		try{
			var fileName=keywordArgs.fileName,
				content=keywordArgs.content,
				fileExtension,
				file;
			if (typeof fileName=='string') {
				 fileExtension=fileName.substr(fileName.lastIndexOf('.')+1);
			} else {
				file=fileName;
				fileExtension=fileName.getExtension();
				fileName=fileName.getPath();
			}
	
			var editorContainer = dijit.byId(filename2id(fileName)),
				editorsContainer = dijit.byId("editors_container");
	
			if (editorContainer) {
				// already open
				editorsContainer.selectChild(editorContainer);
				var editor=editorContainer.editor;
				if (keywordArgs.startOffset) {
					editor.select(keywordArgs);
				}
				return;
			}
			var editorCreateCallback=keywordArgs.editorCreateCallback;
			
			var editorExtensions=Runtime.getExtensions("davinci.editor", function (extension){
				 if (typeof extension.extensions =="string") {
					 extension.extensions=extension.extensions.split(',');
				 }
				 return dojo.some(extension.extensions, function(e){
					 return e.toLowerCase() == fileExtension.toLowerCase();
				 });
			});
	
			var editorExtension = editorExtensions[0];
			if (editorExtensions.length>1){
				dojo.some(editorExtensions, function(extension){
					editorExtension = extension;
					return extension.isDefault;
				});
			}
	
			Workbench._createEditor(editorExtension, fileName, keywordArgs, newHtmlParams).then(function(editor) {
				if(editorCreateCallback){
					editorCreateCallback.call(window, editor);
				}
	
				if(!keywordArgs.noSelect) {
					 Runtime.currentEditor = editor;
				}			
			}, function(error) {
				console.error("Error opening editor for filename: " + fileName, error);
			});
		} catch (ex) {
			console.error("Exception opening editor for filename: "+ keywordArgs && keywordArgs.fileName);
			console.error(ex);
		}

	},
	
	_createEditor: function(editorExtension, fileName, keywordArgs, newHtmlParams) {
		
		var d = new Deferred();
		var nodeName = fileName.split('/').pop();
		var extension = keywordArgs && keywordArgs.fileName && keywordArgs.fileName.extension ? 
				"." + keywordArgs.fileName.extension : "";
		nodeName = nodeName + (extension == ".rev" ? extension : "");

		var loading = dojo.query('.loading');
		if (loading[0]) {
			loading[0].parentNode.removeChild(loading[0]);
		}

		var editorsStackContainer = dijit.byId('editorsStackContainer'),
			editors_container = dijit.byId('editors_container');
		if (editorsStackContainer && editors_container) {
			editorsStackContainer.selectChild(editors_container);
			Workbench.mainStackContainer.selectChild(Workbench.mainBorderContainer);
		}

		var content = keywordArgs.content,
			editorContainer = dijit.byId(filename2id(fileName)),
			editorsContainer = dijit.byId("editors_container"),
			shadowTabContainer = dijit.byId("davinci_file_tabs"),
			editorCreated = false,
			shadowTab = null;
		if (!editorContainer) {
			editorCreated = true;

			var editorId = filename2id(fileName);
			var shadowId = editorIdToShadowId(editorId);
			editorContainer = new EditorContainer({
				title: nodeName,
				id: editorId, 
				'class': "EditorContainer",
				isDirty: keywordArgs.isDirty
			});
			shadowTab = new ContentPane({
				title:nodeName,
				closable: true,
				id:shadowId
			});
			shadowTab.onClose = function(tc, tab){
				
				var shadowId = tab.id;
				var editorId = shadowIdToEditorId(shadowId);
				var editorContainer = dijit.byId(editorId);
				var editorsContainer = dijit.byId("editors_container");
				function okToClose(){
					editorContainer._skipDirtyCheck = true;
					editorContainer.onClose.apply(editorContainer, [editorsContainer, editorContainer]);
					tc.removeChild(tab);
					tab.destroyRecursive();
				}
				if(editorsContainer && editorContainer){
					if (editorContainer.editor.isDirty){
						//Give editor a chance to give us a more specific message
						var message = editorContainer.editor.getOnUnloadWarningMessage();
						if (!message) {
							//No editor-specific message, so use our canned one
							message = dojo.string.substitute(workbenchStrings.fileHasUnsavedChanges, [editorContainer._getTitle()]);
						}
						Workbench.showDialog(editorContainer._getTitle(), message, {width: 300}, dojo.hitch(this,okToClose));
					} else {
						okToClose();
					}
				}
			}
		}
		
		if (!editorExtension) {
			editorExtension = {
				editorClass: 'davinci/ui/TextEditor',
				id: 'davinci.ui.TextEditor'
			};
		}

		if (editorCreated) {
			editorsContainer.addChild(editorContainer);
			shadowTabContainer.addChild(shadowTab);
		}

		// add loading spinner
		if(!Workbench.hideEditorTabs){
			var loadIcon = dojo.query('.dijitTabButtonIcon',editorContainer.controlButton.domNode);
			dojo.addClass(loadIcon[0],'tabButtonLoadingIcon');
			dojo.removeClass(loadIcon[0],'dijitNoIcon');
		}
		
		if (!keywordArgs.noSelect) {
			editorsContainer.selectChild(editorContainer);
		}
		editorContainer.setEditor(editorExtension, fileName, content, keywordArgs.fileName, editorContainer.domNode, newHtmlParams).then(function(editor) {
			if (keywordArgs.startLine) {
				editorContainer.editor.select(keywordArgs);
			}
			
			if (!keywordArgs.noSelect) {
	            if (Workbench._state.editors.indexOf(fileName) === -1) {
	            	Workbench._state.editors.push(fileName);
	            }
				Workbench._switchEditor(editorContainer.editor, keywordArgs.startup);
			}

			if(!Workbench.hideEditorTabs){
				dojo.removeClass(loadIcon[0],'tabButtonLoadingIcon');
				dojo.addClass(loadIcon[0],'dijitNoIcon');
			}

			setTimeout(function() {
				editorContainer.resize(); //kludge, forces editor to correct size, delayed to force contents to redraw
			}, 100);
			d.resolve(editorContainer.editor);
		}, function(error) {
			if(!Workbench.hideEditorTabs){
				dojo.removeClass(loadIcon[0],'tabButtonLoadingIcon');
				dojo.addClass(loadIcon[0],'tabButtonErrorIcon');
			}

			d.reject(error);
		});
		return d;
	},

	createPopup: function(args) {
		var partID = args.partID, domNode=args.domNode, 
			context=args.context,
			widgetCallback=args.openCallback;
		
		var o = this.getActionSets(partID);
		var clonedActionSets = o.clonedActionSets;
		var actionSets = o.actionSets;
		if(clonedActionSets.length > 0){
			var menuTree=Workbench._createMenuTree(clonedActionSets,true);
			Workbench._initActionsKeys(actionSets, args);
			var popup=Workbench._createMenu(menuTree,context);
			if (popup && domNode) {
				popup.bindDomNode(domNode);
			}
			popup._widgetCallback=widgetCallback;
			popup._partID = partID;
			return popup;
		}
	},

	getActionSets: function(partID){
		var actionSetIDs = [];
		var editorExtensions=Runtime.getExtension("davinci.actionSetPartAssociations",
			function (extension) {
				return extension.parts.some(function(part) {
					if (part == partID) {
						actionSetIDs.push(extension.targetID);
						return true;
					}
				});
			});
		
		var actionSets;
		var clonedActionSets = [];
		if (actionSetIDs.length) {
		   actionSets = Runtime.getExtensions("davinci.actionSets", function (extension) {
				return actionSetIDs.some(function(setID) { return setID == extension.id; });
			});
		   if (actionSets.length) {
			   // Determine if any widget libraries have indicated they want to augment the actions in
			   // the action set
			   actionSets.forEach(function(actionSet) {
				   var libraryActions = metadata.getLibraryActions(actionSet.id);
				   if (libraryActions.length) {
					   // We want to augment the action list, so let's copy the
					   // action set before pushing new items onto the end of the
					   // array.
					   actionSet = lang.mixin({}, actionSet); // shallow obj copy
					   actionSet.actions = actionSet.actions.concat(libraryActions); // copy array, add libraryActions
				   }
				   clonedActionSets.push(actionSet);
			   });
			}
		}
		return { actionSets: actionSets, clonedActionSets: clonedActionSets};
	},

	_initActionsKeys: function(actionSets, args) {
		var keysDomNode = args.keysDomNode || args.domNode,
			keys = {},
			wasKey;
		dojo.forEach(actionSets, function(actionSet){
			dojo.forEach(actionSet.actions, function(action){
				if (action.keySequence) {
					keys[action.keySequence]=action;
					wasKey=true;
				}
			});
		});
		if (wasKey) {
			var context=args.context;
          dojo.connect(keysDomNode, "onkeydown", function (e){
				var seq = Workbench._keySequence(e),
					actionItem = keys[seq];
				if (actionItem) {
					if (actionItem.action.shouldShow && !actionItem.action.shouldShow(context)) {
						return;
					}
					if (actionItem.action.isEnabled(context)) {
						Workbench._runAction(actionItem,context);
					}
        	  }
          });
		}
	},
	
	_initKeys: function () {
		var keys={all: []};
		var keyExtensions=Runtime.getExtensions("davinci.keyBindings");
		dojo.forEach(keyExtensions, function(keyExt){
			var contextID= keyExt.contextID || "all";
			var keyContext=keys[contextID];
			if (!keyContext) {
			  keyContext=keys[contextID]=[];
			}
			
			keyContext[keyExt.sequence]=keyExt.commandID;
		});

		Workbench.keyBindings=keys;
	},

	handleKey: function (e) {
		if (!Workbench.keyBindings) {
			return;
		}
		var seq=Workbench._keySequence(e);
		var cmd;
		if (Workbench.currentContext && Workbench.keyBindings[Workbench.currentContext]) {
			cmd=Workbench.keyBindings[Workbench.currentContext][seq];
		}
		if (!cmd) {
			cmd=Workbench.keyBindings.all[seq];
		}
		if (cmd) {
			Runtime.executeCommand(cmd);
			return true;
		}
	},
	
	_keySequence: function (e) {
		var seq=[];
		if (window.event) 
		{
			if (window.event.ctrlKey) {
				seq.push("M1");
			}
			if (window.event.shiftKey) {
				seq.push("M2");
			}
			if (window.event.altKey) {
				seq.push("M3");
			}
		}
		else 
		{
			if (e.ctrlKey || (e.modifiers==2) || (e.modifiers==3) || (e.modifiers>5)) {
				seq.push("M1");
			}
			if (e.shiftKey || (e.modifiers>3)) {
				seq.push("M2");
			}
			if(e.modifiers) {
				if (e.altKey || (e.modifiers % 2)) {
					seq.push("M3");
				}
			}
			else {
				if (e.altKey) {
					seq.push("M3");
				}
			}
		}
		
		var letter=String.fromCharCode(e.keyCode);
		if (/[A-Z0-9]/.test(letter)) {
			//letter=e.keyChar;
		} else {
			var keyTable = {
				46: "del",
				114: "f3"
			};

			letter = keyTable[e.keyCode] || "xxxxxxxxxx";
		}
		letter=letter.toUpperCase();
		if (letter==' ') {
			letter="' '";
		}
				
		seq.push(letter);
		return seq.join("+");
	},

	setActionScope: function(scopeID,scope) {
		Workbench.actionScope[scopeID]=scope;
	},
	
	findView: function (viewID) {
		var domNode=dijit.byId(viewID);
		if (domNode) {
			return domNode;
		}
	},

	_switchEditor: function(newEditor, startup) {
		var oldEditor = Runtime.currentEditor;
		Runtime.currentEditor = newEditor;
		this._showEditorTopPanes();
		try {
			dojo.publish("/davinci/ui/editorSelected", [{
				editor: newEditor,
				oldEditor: oldEditor
			}]);
		} catch (ex) {
			console.error(ex);
		}
		Workbench._updateTitle(newEditor);
	
		Workbench._state.activeEditor=newEditor ? newEditor.fileName : null;
		
		setTimeout(function(){
			// kludge: if there is a visualeditor and it is already populated, resize to make Dijit visualEditor contents resize
			// If editor is still starting up, there is code on completion to do a resize
			// seems necessary due to combination of 100%x100% layouts and extraneous width/height measurements serialized in markup
			if (newEditor && newEditor.visualEditor && newEditor.visualEditor.context && newEditor.visualEditor.context.isActive()) {
				newEditor.visualEditor.context.getTopWidgets().forEach(function (widget) { if (widget.resize) { widget.resize(); } });
			}
			
			// Code below was previously outside of the existing setTimeout kludge. But, needs to be inside because on loading of Maqetta, all 
			// of the palettes might not be created in time (for example, _bringPalettesToTop might not bring Comments tab to front 
			// because it's not created yet). So, we need to take advantage of the delay. It certainly would be better is there were a 
			// Workbench loaded event or something to leverage.
			if(newEditor) {
				if (newEditor.focus) { 
					newEditor.focus(); 
				}

				//Bring palettes specified for the editor to the top
				this._bringPalettesToTop(newEditor);
				
				//Collapse/expand the left and right-side palettes
				//depending on "expandPalettes" properties
				this._expandCollapsePaletteContainers(newEditor);
			}
			this._repositionFocusContainer();
		}.bind(this), 1000);

		if(!startup) {
			Workbench._updateWorkbenchState();
		}
	},
	
	_bringPalettesToTop: function(newEditor) {
		// First, we will get the metadata for the extension and get its list of 
		// palettes to bring to the top
		var editorExtensions=Runtime.getExtensions("davinci.editor", function (extension){
			return extension.id === newEditor.editorID;
		});
		if (editorExtensions && editorExtensions.length > 0) {
			var editorPalettesToTop = editorExtensions[0].palettesToTop;
			if (editorPalettesToTop) {
				// Loop through palette ids and select appropriate palettes
				for (var i = 0; i < editorPalettesToTop.length; i++) { 
					var paletteId = editorPalettesToTop[i];
					
					// Look up the tab for the palette and get its 
					// parent to find the right TabContainer
					var tab = dijit.byId(paletteId);
					if (tab) {
						var tabContainer = tab.getParent();
	
						// Select tab
						if (tabContainer) {
							tabContainer.selectChild(tab);
						}
					}
				}
			}
		}
	},

	_expandCollapsePaletteContainer: function(tab) {
		if(!tab || !tab.domNode){
			return;
		}
		var paletteContainerNode = davinci.Workbench.findPaletteContainerNode(tab.domNode);
		if(paletteContainerNode._maqExpanded){
			this.collapsePaletteContainer(paletteContainerNode);
		}else{
			this.expandPaletteContainer(paletteContainerNode);
		}
	},

	_expandCollapsePaletteContainers: function(newEditor) {
		var leftBC = dijit.byId('left_mainBody');
		var rightBC = dijit.byId('right_mainBody');
		if(!newEditor){
			if(leftBC){
				this.collapsePaletteContainer(leftBC.domNode);
			}
			if(rightBC){
				this.collapsePaletteContainer(rightBC.domNode);
			}			
		}else{
			// First, we will get the metadata for the extension and get its list of 
			// palettes to bring to the top
			var editorExtensions=Runtime.getExtensions("davinci.editor", function (extension){
				return extension.id === newEditor.editorID;
			});
			if (editorExtensions && editorExtensions.length > 0) {
				var expandPalettes = editorExtensions[0].expandPalettes;
				if(leftBC){
					if(expandPalettes && expandPalettes.indexOf('left')>=0){
						this.expandPaletteContainer(leftBC.domNode);
					}else{
						this.collapsePaletteContainer(leftBC.domNode);
					}
				}
				if(rightBC){
					if(expandPalettes && expandPalettes.indexOf('right')>=0){
						this.expandPaletteContainer(rightBC.domNode);
					}else{
						this.collapsePaletteContainer(rightBC.domNode);
					}
				}
			}
			
		}
	},

	_updateTitle: function(currentEditor) {
		var newTitle=Workbench._baseTitle;
		if (currentEditor) {
			newTitle = newTitle + " - ";
			if (currentEditor.isDirty) {
				newTitle=newTitle+"*";
			}
			newTitle=newTitle+currentEditor.fileName;
		}
		dojo.doc.title=newTitle;
	},

	/**
	 * With standard TabContainer setup, this callback is invoked 
	 * whenever an editor tab is closed via user action.
	 * But if we are using the "shadow" approach where there is a shadow
	 * TabContainer that shows tabs for the open files, and a StackContainer
	 * to hold the actual editors, then this callback is invoked indirectly
	 * via a removeChild() call in routine _shadowTabClosed() below.
	 * @param page  The child widget that is being closed.
	 */
	_editorTabClosed: function(page) {
		if(!davinci.Workbench._editorTabClosing[page.id]){
			davinci.Workbench._editorTabClosing[page.id] = true;
			if (page && page.editor && page.editor.fileName) {
				var editorId = page.id;
				var shadowId = editorIdToShadowId(editorId);
				var shadowTabContainer = dijit.byId("davinci_file_tabs");
				var shadowTab = dijit.byId(shadowId);
				var i = Workbench._state.editors.indexOf(page.editor.fileName);
	            if (i != -1) {
	            	Workbench._state.editors.splice(i, 1);
	            }
				Workbench._updateWorkbenchState();
				if(!davinci.Workbench._shadowTabClosing[shadowId]){
					shadowTabContainer.removeChild(shadowTab);
					shadowTab.destroyRecursive();
				}
			}
			var editors=dijit.byId("editors_container").getChildren();
			if (!editors.length) {
				Workbench._switchEditor(null);
				this._expandCollapsePaletteContainers(null);
				var editorsStackContainer = dijit.byId('editorsStackContainer');
				var editorsWelcomePage = dijit.byId('editorsWelcomePage');
				if (editorsStackContainer && editorsWelcomePage){
					editorsStackContainer.selectChild(editorsWelcomePage);
				}
				this._hideEditorTopPanes();
			}
			delete davinci.Workbench._editorTabClosing[page.id];
		}
	},

	/**
	 * When using the "shadow" approach where there is a shadow
	 * TabContainer that shows tabs for the open files, and a StackContainer
	 * to hold the actual editors, then this callback is invoked when a user clicks
	 * on the tab of the shadow TabContainer. This routine then calls
	 * removeChild() on the StackContainer to remove to corresponding editor.
	 * @param page  The child widget that is being closed.
	 */
	_shadowTabClosed: function(page) {
		if(!davinci.Workbench._shadowTabClosing[page.id]){
			davinci.Workbench._shadowTabClosing[page.id] = true;
			var shadowId = page.id;
			var editorId = shadowIdToEditorId(shadowId);
			if(!davinci.Workbench._editorTabClosing[editorId]){
				var editorContainer = dijit.byId(editorId);
				var editorsContainer = dijit.byId("editors_container");
				if(editorsContainer && editorContainer){
					editorsContainer.removeChild(editorContainer);
					editorContainer.destroyRecursive();
				}
				delete davinci.Workbench._shadowTabClosing[page.id];
			}
		}
	},

	getActiveProject: function() {
		/* need to check if there is a project in the URL.  if so, it takes precidence
		 * to the workbench setting
		 */
		if (!Workbench._state) {
			Workbench._state=Runtime.serverJSONRequest({url:"cmd/getWorkbenchState", handleAs:"json", sync:true});
		}
		var urlProject = dojo.queryToObject(dojo.doc.location.search.substr((dojo.doc.location.search[0] === "?" ? 1 : 0))).project;
		
		if(urlProject){
			Workbench.loadProject(urlProject);
		}
		
		if (Workbench._state.hasOwnProperty("project")) {
			return Workbench._state.project;
		}

		return Workbench._DEFAULT_PROJECT;
	},
	
	setActiveProject: function(project){
		if(!Workbench._state){
			Workbench._state = {};
		}
		Workbench._state.project = project;
		return Workbench._updateWorkbenchState();
	},
	
	/**
	 * Retrieves a custom property from current workbench state
	 * @param {string} propName  Name of custom property
	 * @return {any} propValue  Any JavaScript value.
	 */
	workbenchStateCustomPropGet: function(propName){
		if(typeof propName == 'string'){
			return Workbench._state[propName];
		}
	},
	
	/**
	 * Assign a custom property to current workbench state and persist new workbench state to server
	 * @param {string} propName  Name of custom property
	 * @param {any} propValue  Any JavaScript value. If undefined, then remove given propName from current workbench state.
	 */
	workbenchStateCustomPropSet: function(propName, propValue){
		if(typeof propName == 'string'){
			if(typeof propValue == 'undefined'){
				delete Workbench._state[propName];
			}else{
				Workbench._state[propName] = propValue;
			}
			Workbench._updateWorkbenchState();
		}
	},
	
	clearWorkbenchState : function(){
		Workbench._state = {};
		return this._updateWorkbenchState();
	},
	
	_updateWorkbenchState: function(){
		
		if(!this._updateWorkbench){
			this._updateWorkbench = new Deferred();
			this._updateWorkbench.resolve();
		}
		
		this._updateWorkbench.then(dojo.hitch(this,function(){
			this._updateWorkbench = dojo.xhrPut({
				url: "cmd/setWorkbenchState",
				putData: dojo.toJson(Workbench._state),
				handleAs:"text",
				sync:false
			});
		}));
		
		return this._updateWorkbench;
	},

	_autoSave: function(){
		var lastSave = Workbench._lastAutoSave;
		var anyErrors = false;
		function saveDirty(editor){
			if (editor.isReadOnly || !editor.isDirty) {
				return;
			}
			
			var modified = editor.lastModifiedTime;
			if (modified && modified>lastSave){
				try {
					editor.save(true);
				}catch(ex){
					console.error("Error while autosaving file:" + ex);
					anyErrors = true;
				}
			}
		}
		if(Workbench.editorTabs){
			dojo.forEach(Workbench.editorTabs.getChildren(),	saveDirty);
		}
		if(!anyErrors){
			Workbench._lastAutoSave = Date.now();
		}		              
	},

	setupGlobalKeyboardHandler: function() {
		var actionSets = Runtime.getExtensions('davinci.actionSets');

		dojo.forEach(actionSets, function(actionSet) {
			if (actionSet.id == "davinci.ui.main" || actionSet.id == "davinci.ui.editorActions") {
				dojo.forEach(actionSet.actions, function(action) {
					if (action.keyBinding) {
						Runtime.registerKeyBinding(action.keyBinding, action);
					}
				});
			}
		});
	},
	
	/**
	 * Look for the "palette container node" from node or one of its descendants,
	 * where the palette container node id identified by its
	 * having class 'davinciPaletteContainer'
	 * @param {Element} node  reference node
	 * @returns {Element|undefined}  the palette container node, if found
	 */
	findPaletteContainerNode: function(node){
		var paletteContainerNode;
		var n = node;
		while(n && n.tagName != 'BODY'){
			if(dojo.hasClass(n, 'davinciPaletteContainer')){
				paletteContainerNode = n;
				break;
			}
			n = n.parentNode;
		}
		return paletteContainerNode;
	},
	
	/**
	 * In response to clicking on palette's collapse button,
	 * collapse all palettes within the given palette container node to just show tabs.
	 * @param {Element} node  A descendant node of the palette container node.
	 * 		In practice, the node for the collapse icon (that the user has clicked).
	 */
	collapsePaletteContainer: function(node){
		var paletteContainerNode = davinci.Workbench.findPaletteContainerNode(node);
		if(paletteContainerNode){
			var paletteContainerNodeWidth = dojo.style(paletteContainerNode, 'width');
			var paletteContainerWidget = dijit.byNode(paletteContainerNode);
			var tablistNodes = dojo.query('[role=tablist]', paletteContainerNode);
			if(paletteContainerWidget && !paletteContainerWidget._isCollapsed && tablistNodes.length > 0){
				var tablistNode = tablistNodes[0];
				var tablistNodeSize = dojo.marginBox(tablistNode);
				var parentWidget = paletteContainerWidget.getParent();
				if(parentWidget && parentWidget.resize && tablistNodeSize && tablistNodeSize.w){
					paletteContainerNode.style.width = tablistNodeSize.w + 'px';
					parentWidget.resize();
					paletteContainerWidget._isCollapsed = true;
					paletteContainerWidget._expandedWidth = paletteContainerNodeWidth; // Note: just a number, no 'px' at end
				}
			}
			dojo.removeClass(paletteContainerNode, 'maqPaletteExpanded');
			paletteContainerNode._maqExpanded = false;
			davinci.Workbench._repositionFocusContainer();
		}
	},
	
	/**
	 * In response to user clicking on one of the palette tabs,
	 * see if the parent palette container node is collapsed.
	 * If so, expand it.
	 * @param {Element} node  A descendant node of the palette container node.
	 * 		In practice, the node for the collapse icon (that the user has clicked).
	 */
	expandPaletteContainer: function(node){
		var paletteContainerNode = davinci.Workbench.findPaletteContainerNode(node);
		if(paletteContainerNode){
			var paletteContainerWidget = dijit.byNode(paletteContainerNode);
			if(paletteContainerWidget && paletteContainerWidget._isCollapsed && paletteContainerWidget._expandedWidth){
				var parentWidget = paletteContainerWidget.getParent();
				if(parentWidget && parentWidget.resize){
					paletteContainerNode.style.width = paletteContainerWidget._expandedWidth + 'px';
					parentWidget.resize();
					delete paletteContainerWidget._isCollapsed;
					delete paletteContainerWidget._expandedWidth;
				}
			}
			dojo.addClass(paletteContainerNode, 'maqPaletteExpanded');
			paletteContainerNode._maqExpanded = true;
			davinci.Workbench._repositionFocusContainer();
		}
	},

	/**
	 * Reposition the focusContainer node to align exactly with the position of editors_container node
	 */
	_repositionFocusContainer: function(){
		var editors_container = dojo.byId('editors_container');
		var focusContainer = dojo.byId('focusContainer');
		if(editors_container && focusContainer){
			var box = GeomUtils.getBorderBoxPageCoords(editors_container);
			if(box){
				focusContainer.style.left = box.l + 'px';
				focusContainer.style.top = box.t + 'px';
				focusContainer.style.width = box.w + 'px';
				focusContainer.style.height = box.h + 'px';
				var currentEditor = davinci.Runtime.currentEditor;
				if(currentEditor && currentEditor.getContext){
					var context = currentEditor.getContext();
					if(context && context.updateFocusAll){
						context.updateFocusAll();
					}
				}
			}
		}
	},
	
	_hideShowEditorTopPanes: function(displayPropValue){
		var davinci_app = dijit.byId('davinci_app');
		var davinci_file_tabs = dijit.byId('davinci_file_tabs');
		var davinci_toolbar_pane = dijit.byId('davinci_toolbar_pane');
		davinci_file_tabs.domNode.style.display = displayPropValue;
		davinci_toolbar_pane.domNode.style.display = displayPropValue;
		davinci_app.resize();
	},
	_hideEditorTopPanes: function(){
		this._hideShowEditorTopPanes('none');
	},
	_showEditorTopPanes: function(){
		this._hideShowEditorTopPanes('block');
	},

	_XX_last_member: true	// dummy with no trailing ','
};

var PopupMenu = declare(Menu, {

	menuOpened: function (event) {},
	
	_openMyself: function(event){
		this.menuOpened(event);
		var open;
		try{
			// Create a DIV that will overlay entire app and capture events that might go to interior iframes
			var menuOverlayDiv = document.getElementById('menuOverlayDiv');
			if(!menuOverlayDiv){
				menuOverlayDiv = dojo.create('div', {id:'menuOverlayDiv', style:'left:0px; top:0px; width:100%; height:100%; position:absolute; z-index:10;'}, document.body);
			}
			if(this.adjustPosition){
				var offsetPosition=this.adjustPosition(event);
					open = dijit.popup.open;
					dijit.popup.open = function(args){
						args.x += offsetPosition.x;
						args.y += offsetPosition.y;
						open.call(dijit.popup, args);
					};
			}
			this.onClose = function(){
				var menuOverlayDiv = document.getElementById('menuOverlayDiv');
				if(menuOverlayDiv){
					menuOverlayDiv.parentNode.removeChild(menuOverlayDiv);
				}
			}.bind(this);
			this.inherited(arguments);
		}finally{
			if(open){
				dijit.popup.open = open;
			}
		}
	}
});
dojo.setObject("davinci.Workbench", Workbench);
return Workbench;
});
