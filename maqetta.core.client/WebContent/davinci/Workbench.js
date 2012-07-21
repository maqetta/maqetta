define([
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
	"dojo/dnd/Moveable",
	"davinci/review/model/resource/root",
	"dojo/i18n!davinci/ve/nls/common"
], function(
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
		Moveable,
		reviewResource,
		veNLS
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

var updateMainToolBar = function (change, toolbarID) {
	var toolbar1 = dijit.byId("davinci_toolbar_main");
	if (toolbar1) {
		dojo.forEach(toolbar1.getChildren(), function(child) {
			if (child.isEnabled) {
				child.set('disabled', !child.isEnabled(change.targetObjectId));
			}
		});
	}
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

	var isReview = function (resPath) {
		return resPath.indexOf(".review") > -1;
	};

	var getReviewProject = function (resPath) {
		return new Path(resPath).segment(3);
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
				
				var resource;
				if(isReviewRes){
					var version = getReviewVersion(editor);
					var resPath = getReviewResource(editor).toString();
					resource = reviewResource.findFile(version, resPath);
				}else{
					resource = sysResource.findResource(editor);
				}
				
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
//					resource.getContent().then(function(content){						
						Workbench.openEditor({
							fileName: resource,
							content: resource.getContentSync(),
							noSelect: noSelect,
							isDirty: resource.isDirty(),
							startup: false
						});
//					});
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
};

var Workbench = {
	activePerspective: "",
	actionScope: [],
	_DEFAULT_PROJECT: "project1",
	hideEditorTabs: true,

	run: function() {
		Runtime.run();
		Workbench._initKeys();
		Workbench._baseTitle = dojo.doc.title;

		Runtime.subscribe("/davinci/ui/selectionChanged", updateMainToolBar);
		Runtime.subscribe("/davinci/ui/editorSelected", updateMainToolBar);
		Runtime.subscribe("/davinci/resource/resourceChanged",
			function (type, changedResource) {
				if (type == 'deleted') {
					var editorId = filename2id(changedResource.getPath());
					var shadowId = editorIdToShadowId(editorId);
					var editorContainer = dijit.byId(editorId);
					var shadowTab = dijit.byId(shadowId);
					if (tabeditorContainer && !editorContainer._isClosing) {
						var editorsContainer = dijit.byId("editors_container");
						var shadowTabContainer = dijit.byId("davinci_file_tabs");
//FIXME: shadow tab handling here? (DONE)
						editorsContainer.removeChild(editorContainer);
						editorContainer.destroyRecursive();
						shadowTabContainer.removeChild(shadowTab);
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

	_createToolBar: function (targetObjectId,targetDiv,actionSets,context){
		var _toolbarcache = [];
		if (!actionSets) {
		   actionSets = Runtime.getExtensions('davinci.actionSets');
		}
		for (var i = 0, len = actionSets.length; i < len; i++) {
			var actions = actionSets[i].actions;
			for (var k = 0, len2 = actions.length; k < len2; k++) {
				var action = actions[k],
					toolBarPath = action.toolbarPath;
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
/*FIXME: No separators for time being
				var separator = new ToolbarSeparator();
				toolbar1.addChild(separator);
*/
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
//FIXME: Have plugin files explicitly define showLabel
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
					var menu = new dijit.Menu({
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
						var menuItem = new dijit.MenuItem(menuItemParms);
						menu.addChild(menuItem);
					}
					parms.dropDown = menu;
					if(action.type == 'DropDownButton'){
						dojoAction = new DropDownButton(parms);
					}else{
						dojoAction = new ComboButton(parms);
					}
					dojoAction.onClick = dojo.hitch(this, "_runAction", action, context);
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
					dojoActionDeferred.resolve();
				}else if(action.type){
					require([action.type], function(ReviewToolBarText) {
						dojoAction = new ReviewToolBarText();
						dojoActionDeferred.resolve();
					});
				}else{
					dojoAction = new Button(parms);
					dojoAction.onClick = dojo.hitch(this, "_runAction", action, context);
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
					if (action.isEnabled && !action.isEnabled(targetObjectId)) { 
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
		Workbench._updateMainMenubar();

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
			// TODO: should check if view is already in perspective
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
		// Hardcoding this for now. Need to work with Phil on how to turn change
		// welcome page logic into something that is defined by ve_plugin.js.
		mainBodyContainer.addChild(mainBody.editorsStackContainer);
		if (!mainBody.editorsWelcomePage) {
			Workbench.editorsWelcomePage = mainBody.editorsWelcomePage =
				new ContentPane({
					id: "editorsWelcomePage",
					href: "app/davinci/ve/resources/welcome_to_maqetta.html"
					/*
					content: "<div><span id='welcome_page_new_open_container'/></div>\n"+
						"<div id='welcome_page_content'>\n"+
						"<h1>Welcome to Maqetta!</h1>\n"+
						"<p>You can get started by using the menus at the top/right:</p>\n"+
						"<ul class='welcome_page_bullets'>\n"+
						"<li>Click on <img src='app/davinci/img/help_menu_image.png'/> for tutorials.</li>\n"+
						"<li>Click on <img src='app/davinci/img/new_menu_image.png'/> to start authoring a new file.</li>\n"+
						"<li>Click on <img src='app/davinci/img/open_menu_image.png'/> to open a file or theme editor.</li>\n"+
						"</ul>\n"+
						"</div>\n"
					*/
				});
		}
		mainBody.editorsStackContainer.addChild(mainBody.editorsWelcomePage);
		if (!mainBody.tabs.editors) {
			Workbench.editorTabs = mainBody.tabs.editors =
				new (Workbench.hideEditorTabs ? StackContainer : TabContainer)({
					id: "editors_container",
					controllerWidget: (Workbench.hideEditorTabs ? "dijit.layout.StackController" : "dijit.layout.TabController")
				});
//FIXME: need to add similar logic for shadow tabs? (DONE - injected further down)
//Research this.tablist (NOT YET DONE)
			Workbench.editorTabs.setTitle = function(editorContainer, title) { 
				editorContainer.attr('title', title);
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
//FIXME: need to connect to shadow tabcontainer instead (DONE - lower down)
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
				layoutPriority:1,
			}, "davinci_top_bar");
			
			var shadowTabContainer = Workbench.shadowTabs = new TabContainer({
				id:'davinci_file_tabs',
				closable: true,
				region: "top",
				layoutPriority:2
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
				layoutPriority:3,
				content:'<div id="davinci_toolbar_container"></div>'
			});
//FIXME: shadow fixes - delete this
/*
			var tempCP = new ContentPane({
				title:'file1.html',
				content:'hello there'
			});
			shadowTabContainer.addChild(tempCP);
*/
		
			appBorderContainer.addChild(topBarPane);
			appBorderContainer.addChild(shadowTabContainer);
			appBorderContainer.addChild(toolbarPane);
			appBorderContainer.addChild(mainBodyContainer);
			appBorderContainer.layout();	
			appBorderContainer.startup();
			Workbench._orginalOnResize = window.onresize;
			window.onresize = Workbench.onResize; //alert("All done");}
			dojo.connect(mainBodyContainer, 'onMouseUp', this, 'onResize');
		}
		
//FIXME: Temporary
var floatingPropertiesPalette = dojo.create('div', 
		{ id:'floatingPropertiesPalette',
			'class':'floatingPropertiesPalette',
			style:'position:absolute; z-index:100; width:300px; height:500px; left:800px; top:200px;border:1px solid black;background:white;' },
		document.body);
new Moveable(floatingPropertiesPalette);
		
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

		// kludge to workaround problem where tabs are sometimes cutoff/shifted to the left in Chrome for Mac
		// would be nice if we had a workbench onload event that we could attach this to instead of relying on a timeout
		setTimeout(function() {
			appBorderContainer.resize();
		}, 3000);
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
		if (Workbench._orginalOnResize) {
			Workbench._orginalOnResize();
		}
	},

	updateMenubar: function(node, actionSets) {
		var menuTree = Workbench._createMenuTree(actionSets);

		var menuTop = dijit.byId(node.id);
		if (!menuTop) {
			menuTop = new MenuBar({'class': 'dijitInline'}, node);
		}
		Workbench._addItemsToMenubar(menuTree, menuTop);
	},
	
	_updateMainMenubar: function() {
		 var menuDiv=dojo.byId('davinci_main_menu');
		 if (!menuDiv) {
			 return;  // no menu
		 }
		var menuTree = Workbench._createMenuTree();

		for (var i=0; i<menuTree.length; i++) {
			var menuTreeItem = menuTree[i];
			for (var j=0;j<menuTreeItem.menus.length;j++) {
				var menu = menuTreeItem.menus[j];
				var dojoMenu = Workbench._createMenu(menu);
				menu.id = menu.id.replace(".", "-"); // kludge to work around the fact that '.' is being used for ids, and that's not compatible with CSS
				var widget =  dijit.byId(menu.id + "-dropdown");
				if(!widget) {
					widget = new DropDownButton({
						label: menu.label,
						dropDown: dojoMenu,
						id: menu.id + "-dropdown"
					});
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
//FIXME: Need to also work with shadow tab container (DONE)
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
			array.forEach(editorsContainer.getChildren(), function(child){
//FIXME: Need to also work with shadow tab container
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
					if (actionSetPartAssociation.targetID == actionSet.id) {
						return true;
					}
				});	
				return associations.length === 0;
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
		dojo.connect(dojoMenu, connectFunction, this, function(evt) {
		   this._openMenu(dojoMenu, menus, evt).focus(); // call focus again, now that we messed with the widget contents
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
	
	_openMenu: function (dojoMenu,menus,evt) {

		if (dojoMenu._widgetCallback) {
		  dojoMenu._widgetCallback(evt);
		}
		dojo.forEach(dojoMenu.getChildren(), function(child){
			dojoMenu.removeChild(child);
			child.destroy();
		});
		dojoMenu.focusedChild = null; // TODO: dijit.Menu bug?  Removing a focused child should probably reset focusedChild for us

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
					if (item.separator) {
						var subMenu = Workbench._createMenu(item);
						var popupParent = new MenuItem({
							label: item.label,
							popup: subMenu,
							id: subMenu.id + "item"
						});
						popupParent.actionContext = dojoMenu.actionContext;
						dojoMenu.addChild(popupParent);
					} else {
						var enabled = true;
						if (item.isEnabled) {
							var resource = getSelectedResource();
							enabled = item.isEnabled(resource);
						}

						var label = item.label;
						if (item.action) {
							if (item.action.shouldShow && !item.action.shouldShow(dojoMenu.actionContext)) {
								continue;
							}
							enabled = item.action.isEnabled(dojoMenu.actionContext);
							if (item.action.getName) {
								label = item.action.getName();
							}
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

		dojoMenu.startup();
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

	_runAction: function(item, context, arg) {
		if (item.run) {
			item.run();
		} else if (item.action) {
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
					style: 'width: 275px;', id:"right_mainBody", 
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
					style = 'height:50%;';
					clazz += "davinciBottomPalette";
				}
			} else if(region == 'bottom') {
				style = 'height:80px;';
				clazz += "davinciBottomPalette";
			}
			cp1 = mainBody.tabs.perspective[position] = new TabContainer({
				region: region,
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
					this.expandPaletteContainer(tab.domNode);
				}
			});
		} else {
			cp1 = mainBody.tabs.perspective[position];
		}

		if (dojo.some(cp1.getChildren(), function(child){ return child.id == view.id; })) {
			return;
		}

		var getTab = function(view) {
			var d = new Deferred(),
				tab = dijit.byId(view.id);

			if (tab) {
				d.resolve(tab);
			} else {
				require([view.viewClass], function(viewCtor){
					d.resolve(new (viewCtor || ViewPart)({
						position: positionSplit[1] || positionSplit[0],
						title: view.title,
						id: view.id,
						closable: false,
						view: view
					}));
				});
			}
			return d;
		};
		getTab(view).then(function(tab) {
//FIXME: Temporary
if(view.id == 'davinci.ve.style'){
	var floatingPropertiesPalette = dojo.byId('floatingPropertiesPalette');
	floatingPropertiesPalette.appendChild(tab.domNode);
	tab.startup();
}else{
			cp1.addChild(tab);
			if(shouldFocus) {
				cp1.selectChild(tab);
			}
}
		});
	  } catch (ex) {
		  console.error("Error loading view: "+view.id);
		  console.error(ex);
	  }
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
//FIXME: also need to select shadow tab container
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
		}

//FIXME: shadow tab (DONE)
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
		}
		
		if (!editorExtension) {
			editorExtension = {
				editorClass: 'davinci/ui/TextEditor',
				id: 'davinci.ui.TextEditor'
			};
		}

		if (editorCreated) {
//FIXME: Add shadow tab here?
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
//			
		var actionSetIDs=[];
		var editorExtensions=Runtime.getExtension("davinci.actionSetPartAssociations",
			function (extension) {
			   for (var i=0;i<extension.parts.length;i++) {
				   if (extension.parts[i]==partID) {
					   actionSetIDs.push(extension.targetID);
					   return true;
				   }
			   }
			});
		
		if (actionSetIDs.length) {
		   var actionSets=Runtime.getExtensions("davinci.actionSets",
				function (extension) {
			   		return actionSetIDs.some(function(setID) { return setID == extension.id; });
				});
		   if (actionSets.length) {
			   // Determine if any widget libraries have indicated they want to augment the actions in
			   // the action set
			   var clonedActionSets = [];
			   dojo.forEach(actionSets, function(actionSet) {
				   var libraryActions = metadata.getLibraryActions(actionSet.id);
				   if (libraryActions.length) {
					   // We want to augment the action list, so let's clone the
					   // action set before pushing new items onto the end of the
					   // array
					   clonedActionSet = dojo.clone(actionSet);
					   dojo.forEach(libraryActions, function(libraryAction) {
						   clonedActionSet.actions.push(libraryAction);
					   });
					   clonedActionSets.push(clonedActionSet);
				   } else {
					   // No modifications to the actionSet, so just push as is
					   clonedActionSets.push(actionSet);
				   }
			   });
			   
			   var menuTree=Workbench._createMenuTree(clonedActionSets,true);
			   Workbench._initActionsKeys(actionSets, args);
			   var popup=Workbench._createMenu(menuTree,context);
			   if (popup && domNode) {
				   popup.bindDomNode(domNode);
			   }
			   popup._widgetCallback=widgetCallback;
			   return popup;
		   }
		   
		}
	},

	getActionSets: function(partID) {
		var actionSetIDs=[], actionSets =[];
		var editorExtensions=Runtime.getExtension("davinci.actionSetPartAssociations",
			function (extension) {
			   for (var i=0;i<extension.parts.length;i++) {
				   if (extension.parts[i]==partID) {
					   actionSetIDs.push(extension.targetID);              
					   return true;
				   }
			   }
			});
		
		if (actionSetIDs.length) {
		   var actionSets=Runtime.getExtensions("davinci.actionSets",
				function (extension) {
			   		return actionSetIDs.some(function(setID) { return setID == extension.id; });
				});
		}

		return actionSets;
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

/*FIXME: Probably can delete this code. Doesn't seem to be used. Commenting out for now.
	toggleFullScreen: function() {
		var mainBodyContainer = dijit.byId('mainBody');
		if (mainBodyContainer.origLayout) {
			mainBodyContainer.layout = mainBodyContainer.origLayout;
			delete mainBodyContainer.origLayout;
			//TODO: undo z-index
		} else {
			mainBodyContainer.origLayout = mainBodyContainer.layout;
			mainBodyContainer.layout = function(){
				var gutter = "0";
					centerStyle = mainBodyContainer._center.style;

				dojo.mixin(centerStyle, {
					top: gutter,
					left: gutter,
					right: gutter,
					bottom: gutter,
					zIndex: "500"
				});
			};
		}

		var toggleAllButCenter = function(widget) {
			if (widget.region != "center") {
				dojo.toggleClass(widget.domNode, "dijitHidden");
			}
		};
		dojo.forEach(mainBodyContainer.getChildren(), toggleAllButCenter);
		dojo.forEach(mainBodyContainer._splitters, toggleAllButCenter);
		mainBodyContainer.resize();
		dijit.byNode(mainBodyContainer._center).resize();
	},
*/

	_switchEditor: function(newEditor, startup) {
		var oldEditor = Runtime.currentEditor;
		Runtime.currentEditor = newEditor;
		try {
			dojo.publish("/davinci/ui/editorSelected", [{
				editor: newEditor,
				oldEditor: oldEditor
			}]);
		} catch (ex) {console.error(ex);}
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
			}
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
		if (page && page.editor && page.editor.fileName) {
            var i = Workbench._state.editors.indexOf(page.editor.fileName);
            if (i != -1) {
            	Workbench._state.editors.splice(i, 1);
            }
			Workbench._updateWorkbenchState();
		}
		var editors=dijit.byId("editors_container").getChildren();
		if (!editors.length) {
			Workbench._switchEditor(null);
			var editorsStackContainer = dijit.byId('editorsStackContainer');
			var editorsWelcomePage = dijit.byId('editorsWelcomePage');
			if (editorsStackContainer && editorsWelcomePage){
				editorsStackContainer.selectChild(editorsWelcomePage);
			}
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
		var shadowId = page.id;
		var editorId = shadowIdToEditorId(shadowId);
		var editorContainer = dijit.byId(editorId);
		var editorsContainer = dijit.byId("editors_container");
		if(editorsContainer && editorContainer){
			editorsContainer.removeChild(editorContainer);
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
			if (actionSet.id == "davinci.ui.main") {
				dojo.forEach(actionSet.actions, function(action) {
					if (action.keyBinding) {
						Runtime.registerKeyBinding(action.keyBinding, action);
					}
				});
			}
		});
	},
	
	/**
	 * Look for an ancestor "palette container node", identified by its
	 * having class 'davinciPaletteContainer'
	 * @param {Element} node  a descendant of the palette container node
	 * @returns {Element|undefined}  the palette container node, if found
	 */
	findPaletteContainerNode: function(node){
		var paletteContainerNode;
		var pn = node.parentNode;
		while(pn && pn.tagName != 'BODY'){
			if(dojo.hasClass(pn, 'davinciPaletteContainer')){
				paletteContainerNode = pn;
				break;
			}
			pn = pn.parentNode;
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
		}
	},

	_XX_last_member: true	// dummy with no trailing ','
};

var PopupMenu = declare(Menu, {

	menuOpened: function (event) {},
	
	_openMyself: function(event){
		this.menuOpened(event);
		var open;
		try{
			if(this.adjustPosition){
				var offsetPosition=this.adjustPosition(event);
					open = dijit.popup.open;
					dijit.popup.open = function(args){
						args.x += offsetPosition.x;
						args.y += offsetPosition.y;
						open.call(dijit.popup, args);
					};
			}
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
