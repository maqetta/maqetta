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
	"dojo/promise/all",
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/_base/xhr",
	"./review/model/resource/root",
	"dojo/i18n!./ve/nls/common",
	"./ve/utils/GeomUtils",
	"dojo/i18n!./ui/nls/common",
	"davinci/review/model/resource/root"
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
		all,
		declare,
		connect,
		xhr,
		reviewResource,
		veNLS,
		GeomUtils,
		uiCommonNls,
		revResource
) {

var paletteTabWidth = 71;	// Width of tabs for left- and right-side palettes
var paletteTabDelta = 20;	// #pixels - if this many or fewer pixels of tab are showing, treat as collapsed
var paletteCache = {};

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
		if (reCmdXhr.test(url)) {
			// Make exception for "getBluePageInfo" because it regularly gets cancelled
			// by the type ahead searching done from the combo box on the 3rd panel of
			// the R&C wizard. The cancellation is not really an error.
			if (url.indexOf("getBluePageInfo") >= 0) {
				return;
			}
		} else {
			// Must not be a Maqetta URL (like for JSONP on GridX), so skip
			return;
		}

		Runtime.handleError(reason.message);
		console.warn('Failed to load url=' + url + ' message=' + reason.message +
				' status=' + reason.status);
	}
};

var sessionTimedOut = function(){
	var loginHref = "welcome";
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

var initializeWorkbenchState = function(){	
	// The _expandCollapsePaletteContainers() call  below collapses the 
	// left-side and right-side palettes before
	// we open any of the editors (and then subsequently potentially expand
	// the left-side and/or right-side palettes as required by that editor).
	// The dontPreserveWidth parameter bubbles down to collapsePaletteContainer()
	// and tells it to *not* cache the current palette width (which it normally does)
	davinci.Workbench._expandCollapsePaletteContainers(null, {dontPreserveWidth:true});

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
		// The following event triggers palettes such as SwitchingStyleViews.js to know
		// that workbench has completed initialization of the initial perspective
		// and associated views. Put after the xhr.get to allow execution parallelism.
		dojo.publish("/davinci/ui/initialPerspectiveReady", []);

		if (state.project) {
			Workbench.setActiveProject(state.project);
		}
		if (state.editors) {
			state.version = davinci.version;
			
			var project,
				singleProject = Workbench.singleProjectMode();
		
			if (singleProject) {
				project = new Path(Workbench.getProject());
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
		
					if (noSelect && !isActiveEditorInProject && !isReview(state.activeEditor)) {
						// if the active editor is not in our project, force selection
						noSelect = false;
						state.activeEditor = editor; // this is now the active editor
					}
		
					if (resource) {
						Workbench.openEditor({
							fileName: resource,
							noSelect: noSelect,
							isDirty: resource.isDirty(),
							startup: false,
							initializationTime: true
						});
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

	if (!Workbench._state){
		Workbench._state = Runtime.getWorkbenchState();
	}

	
	// This code loads the first file from a given review.  The review comes in as a URL parameter from an invitation.

	var designerName  = dojo.cookie("davinci_designer");
	var reviewVersion = dojo.cookie("davinci_version");
	dojo.cookie("davinci_designer", null, {expires: -1, path:"/"});
	dojo.cookie("davinci_version", null, {expires: -1, path:"/"});
	if (reviewVersion && designerName) {
		//we got here from a review link so add the review files to the editors to be opened 
		// at start up
		revResource.findVersion(designerName, reviewVersion).then(function(node) {
			if (node) {
				// if we found a node, then the user clicked a review link to get here, so
				node.getChildren(function(children){
						// if we found a node, then the user clicked a review link to get here, so
						// let's open review files 
						children.forEach(function(review, index){
							var p = review.getPath();
							if (index == 0) {
								// set the active editor to the first review file
								Workbench._state.activeEditor = p; 
							}
							// check to ensure that the review is not already in the list of editors open
							if (Workbench._state.editors.indexOf(p) < 0) {
								Workbench._state.editors.push(p);
							}
						}.bind(this));
					init(Workbench._state);
				});
				
			}
		}.bind(this));
	} else {
		init(Workbench._state);
	}
	Workbench.setupGlobalKeyboardHandler();
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

		// Set up top banner region. (Top banner is an extensibility point)
		if(window.maqetta && maqetta.TopBanner && maqetta.TopBanner.setup){
			maqetta.TopBanner.setup();
		}

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

		// bind overlay widgets to corresponding davinci states. singleton; no need to unsubscribe
		connect.subscribe("/davinci/ui/repositionFocusContainer", function(args) {
			Workbench._repositionFocusContainer();
		});

		var d = xhr.get({
	    	url: "cmd/getInitializationInfo",
	    	handleAs: "json"
	    }).then(function(result){
			Runtime._initializationInfo = result;

	    	var userInfo = result.userInfo;
	    	Runtime.isLocalInstall = userInfo.userId == 'maqettaUser';

			// Needed by review code
            Runtime.userName = userInfo.userId;
            Runtime.userEmail = userInfo.email;
            return metadata.init();
	    }).then(function(){
			var perspective = Runtime.initialPerspective || "davinci.ui.main";
			dojo.query('.loading').orphan();
			Workbench.showPerspective(perspective);
			Workbench._updateTitle();
			initializeWorkbenchState();			
		}).otherwise(function(result){
			dojo.query('#load_screen').addContent(dojo.string.substitute(webContent.startupError, [result.message]), "only")/*.addClass("error")*/;
		});

		Workbench._lastAutoSave = Date.now();
		setInterval(dojo.hitch(this,"_autoSave"),30000);
		return d;
	},

	unload: function () {
		Workbench._autoSave();
	},

	logoff: function(args) {
		dojo.create("div", {
				'class': 'loading',
				innerHTML: '<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;Logging off...</td></tr></table>' // FIXME: i18n
			}, dojo.body(), "first");

		Workbench.unload();
		return xhr.get({
			url: "cmd/logoff",
			handleAs: "text"
		}).then(function(result) {
			location.href = "welcome";
		});
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
			var actions = _toolbarcache[value];
			for (var p = 0; p<actions.length; p++) {
				var action = actions[p];
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
					var titleWithDirty = title + (editorContainer.isDirty ? '<span class="dirtyFileAsterisk"></span>'  : '');
					shadowTabContainer.tablist.pane2button[shadowId].attr('label', titleWithDirty);
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
					label: veNLS.closeAllEditors,
					onClick: this.closeAllEditors
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

		this._showViewPromises = dojo.map(perspective.views, function(view) {
			return Workbench.showView(view.viewID, view.selected, view.hidden);
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
			if (ed && ed.onResize) {
				ed.onResize();
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
				var menuWidget = Workbench._createMenu(menu);
				menu.id = menu.id.replace(".", "-"); // kludge to work around the fact that '.' is being used for ids, and that's not compatible with CSS
				// Set up top banner region. (Top banner is an extensibility point)
				if(window.maqetta && maqetta.TopBanner && maqetta.TopBanner.attachMenu){
					maqetta.TopBanner.attachMenu(menu, menuWidget, menuDiv);
				}else{
					var widget = dijit.byId(menu.id + "-dropdown");
					if(!widget) {
						var params = { label: menu.label, dropDown: menuWidget, id: menu.id + "-dropdown" };
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
		}
	},

	_addItemsToMenubar: function(menuTree, menuTop) {
		dojo.forEach(menuTree, function(m) {
			var menus = m.menus,
				menuLen = menus.length;
			if (menuLen) {
				dojo.forEach (menus, function(menu) {
					menu.id = menu.id.replace(/\./g, "-"); // kludge to work around the fact that '.' is being used for ids, and that's not compatible with CSS
					var menuWidget = Workbench._createMenu(menu),
						widget =  dijit.byId(menu.id + "-dropdown");
					if (!widget) {
						widget = new PopupMenuBarItem({
							label: menu.label,
							popup: menuWidget,
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

	showModal: function(content, title, style, callback, submitOnEnter, onShow) {
		return Dialog.showModal(content, title, style, callback, submitOnEnter, onShow);
	},

	// simple dialog with an automatic OK button that closes it.
	showMessage: function(title, message, style, callback, submitOnEnter) {
		return Dialog.showMessage(title, message, style, callback, submitOnEnter);
	},

	// OK/Cancel dialog with a settable okLabel
	showDialog: function(params) {
		return Dialog.showDialog(params);
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
		var menuWidget,menus,connectFunction;
		if (menu.menus) {  // creating dropdown
		  menuWidget = new Menu({parentMenu: menu });
		  menus = menu.menus;
		  connectFunction = "onOpen";
		} else {	// creating popup
			menuWidget = new PopupMenu({});
			menus = menu;
			connectFunction="menuOpened";
		}

		menuWidget.domNode.style.display = "none";
		menuWidget.actionContext = context;
		this._rebuildMenu(menuWidget, menus);
		dojo.connect(menuWidget, connectFunction, this, function(evt) {
			if (menuWidget._widgetCallback) { // create popup
				  menuWidget._widgetCallback(evt);
			}
			this._rebuildMenu(menuWidget, menus).focus(); // call focus again, now that we messed with the widget contents
		});
		return menuWidget;
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
		Workbench.setActiveProject(projectName);
		return Workbench.updateWorkbenchState().then(function(){
			// make sure the server has maqetta setup for the project
			location.href="cmd/configProject?configOnly=true&project=" + encodeURIComponent(projectName);
		});
		
		// if the project was set via URL parameter, clear it off.  
		
	
	},

	//FIXME: remove. Use Runtime.location() instead.
	location: function() {
		return Runtime.location();
	},

	_rebuildMenu: function (menuWidget, menus) {
		dojo.forEach(menuWidget.getChildren(), function(child){
			menuWidget.removeChild(child);
			child.destroy();
		});
		menuWidget.focusedChild = null; // TODO: dijit.Menu bug?  Removing a focused child should probably reset focusedChild for us

		var addSeparator, menuAdded;
		menus.forEach(function(menu, i){
			if (menu.menus.length) {
				if (menu.isSeparator && i>0) {
					addSeparator=true;
				}
				menu.menus.forEach(function(item){
					if (addSeparator && menuAdded) {
						menuWidget.addChild(new MenuSeparator({}));
						addSeparator=false;
					}
					menuAdded = true;
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
						popupParent.actionContext = menuWidget.actionContext;
						menuWidget.addChild(popupParent);
					} else {
						var enabled = true;
						if (item.isEnabled) {
							var selection = Runtime.getSelection(),
								resource = selection[0] && selection[0].resource;
							enabled = resource ? item.isEnabled(resource) : false;
						}

						if (item.action) {
							if (item.action.shouldShow && !item.action.shouldShow(menuWidget.actionContext, {menu: menuWidget})) {
								return;
							}
							//FIXME: study this code for bugs.
							//menuWidget.actionContext: is that always the current context?
							//There were other bugs where framework objects pointed to wrong context/doc
							enabled = item.action.isEnabled && item.action.isEnabled(menuWidget.actionContext);
						}

						var menuArgs = {
								label: label,
								id: item.id,
								disabled: !enabled,
								onClick: dojo.hitch(this, "_runAction", item, menuWidget.actionContext)
						};
						if (item.iconClass) {
							menuArgs.iconClass = item.iconClass;
						}

						menuWidget.addChild(new MenuItem(menuArgs));
					}
				}, this);
			}
		}, this);

		return menuWidget;
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
		if(context && Runtime.currentEditor){
			context = Runtime.currentEditor;
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

	showView: function(viewId, shouldFocus, hidden){
		var d = new Deferred();

		try {
			var mainBodyContainer = dijit.byId('mainBody'),
				view = Runtime.getExtension("davinci.view", viewId),
				mainBody = dojo.byId('mainBody'),
				perspectiveId = Workbench.activePerspective,
				perspective = Runtime.getExtension("davinci.perspective", perspectiveId),
				position = 'left',
				cp1;

			dojo.some(perspective.views, function(view){
				if(view.viewID ==  viewId){
					position = view.position;
					return true;
				}	
			});
			
			mainBody.tabs = mainBody.tabs || {};				
			mainBody.tabs.perspective = mainBody.tabs.perspective || {};
	
			// NOTE: Left-side and right-side palettes start up with 71px width
			// which happens to be the exact pixel size of the palette tabs.
			// This 71px setting prevents the user from seeing an initial flash
			// of temporarily opened left-side and right-side palettes.
			if (position == 'right' && !mainBody.tabs.perspective.right) {
				mainBodyContainer.addChild(mainBody.tabs.perspective.right = 
					new BorderContainer({'class':'davinciPaletteContainer', 
						style: 'width: '+paletteTabWidth+'px;', id:"right_mainBody", 
						minSize:paletteTabWidth,	// prevent user from dragging splitter too far towards edge
						region:'right', gutters: false, splitter:true}));
				mainBody.tabs.perspective.right.startup();
				// expandToSize is what expandPaletteContainer() uses as the
				// width of the palette when it is in expanded state.
				paletteCache.right_mainBody = {
					expandToSize:340,
					initialExpandToSize:340
				};
			}
	
			if (position == 'left' && !mainBody.tabs.perspective.left) {
				mainBodyContainer.addChild(mainBody.tabs.perspective.left = 
					new BorderContainer({'class':'davinciPaletteContainer', 
						style: 'width: '+paletteTabWidth+'px;', id:"left_mainBody", 
						minSize:paletteTabWidth,	// prevent user from dragging splitter too far towards edge
						region:'left', gutters: false, splitter:true}));
				mainBody.tabs.perspective.left.startup();
				// expandToSize is what expandPaletteContainer() uses as the
				// width of the palette when it is in expanded state.
				paletteCache["left_mainBody"] = {
					expandToSize:318,
					initialExpandToSize:318
				};
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
						// of a TabContainer, which causes an implicit selectFirst(),
						// or other programmatic selectChild() event (in particular, 
						// SwitchingStyleView.js puts _maqDontExpandCollapse on tabcontainer)
						if(!this._showViewAddChildInProcess && !tc._maqDontExpandCollapse){
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
				if (!hidden) {
					cp1.addChild(tab);
				}
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
				
				d.resolve(tab);
			}.bind(this));
		  } catch (ex) {
			  console.error("Error loading view: "+view.id);
			  console.error(ex);
		  }
		  
		  return d;
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
				if(!Workbench.palettes){
					Workbench.palettes = {};
				}
				// Stash the instantiated object corresponding to each palette class in
				// associative array davinci.palettes, indexed by view.viewClass.
				// Then pass the instantiated object as the argument to d.resolve().
				d.resolve((Workbench.palettes[view.viewClass] = new (viewCtor || ViewPart)(params),
						Workbench.palettes[view.viewClass]));
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
				fileExtension;
			if (typeof fileName=='string') {
				fileExtension=fileName.substr(fileName.lastIndexOf('.')+1);
			} else {
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
		nodeName += (extension == ".rev" ? extension : "");

		dojo.query('.loading').orphan();

		var editorsStackContainer = dijit.byId('editorsStackContainer'),
			editors_container = dijit.byId('editors_container');
		if (editorsStackContainer && editors_container) {
			editorsStackContainer.selectChild(editors_container);
			Workbench.mainStackContainer.selectChild(Workbench.mainBorderContainer);
		}

		var editorContainer = dijit.byId(filename2id(fileName)),
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
				function saveAndClose(){
					editorContainer.editor.save();
					okToClose();
				}
				if(editorsContainer && editorContainer){
					if (editorContainer.editor.isDirty){
						//Give editor a chance to give us a more specific message
						var message = editorContainer.editor.getOnUnloadWarningMessage();
						if (!message) {
							//No editor-specific message, so use our canned one
							message = dojo.string.substitute(webContent.fileHasUnsavedChanges, [editorContainer._getTitle()]);
						}
						Workbench.showDialog({
								title: editorContainer._getTitle(),
								content: message, 
								style: {width: 300}, 
								okLabel: uiCommonNls.save,
								okCallback: dojo.hitch(this,saveAndClose),
								hideLabel: null,
								submitOnEnter:true,
								extendLabels: [uiCommonNls.discard],
								extendCallbacks: [dojo.hitch(this,okToClose)]
							});
					} else {
						okToClose();
					}
				}
			};
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
		//FIXME: this is very kludgy. At initialization time, we want EditorContainer.js 
		//to filter past all editors except the current filename to prevent the cs=null issue #3279.
		//But when not at initialization time, we need to make sure the
		//current activeEditor is set to the "fileName".
		if(!keywordArgs.initializationTime){
			Workbench._state.activeEditor = fileName;
		}
		editorContainer.setEditor(editorExtension, fileName, true, keywordArgs.fileName, editorContainer.domNode, newHtmlParams).then(function(editor) {
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
		Runtime.getExtension("davinci.actionSetPartAssociations", function (extension) {
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
		Workbench._state.activeEditor=newEditor ? newEditor.fileName : null;
		this._removeFocusContainerChildren();	//FIXME: Visual editor logic bleeding into Workbench
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
		
		setTimeout(function(){
			// kludge: if there is a visualeditor and it is already populated, resize to make Dijit visualEditor contents resize
			// If editor is still starting up, there is code on completion to do a resize
			// seems necessary due to combination of 100%x100% layouts and extraneous width/height measurements serialized in markup
			if (newEditor && newEditor.visualEditor && newEditor.visualEditor.context && newEditor.visualEditor.context.isActive()) {
				newEditor.visualEditor.context.getTopWidgets().forEach(function (widget) { if (widget.resize) { widget.resize(); } });
			}
			
			this._repositionFocusContainer();
		}.bind(this), 1000);
		
		all(this._showViewPromises).then(function() {
			if(newEditor && newEditor.focus) { 
				newEditor.focus(); 
			}

			//Rearrange palettes based on new editor
			this._rearrangePalettes(newEditor);
			
			//Collapse/expand the left and right-side palettes
			//depending on "expandPalettes" properties
			this._expandCollapsePaletteContainers(newEditor);
		}.bind(this));

		if(!startup) {
			Workbench.saveState = true;
		}
	},

	_rearrangePalettes: function(newEditor) {
		var palettePerspectiveId,
			newEditorRightPaletteExpanded,
			newEditorLeftPaletteExpanded;
		
		//Determine what perspective to get palette info out of based on whether we have an editor or not
		if (newEditor) {
			// First, we will get the metadata for the extension and get its list of 
			// palettes to bring to the top
			var editorExtensions=Runtime.getExtensions("davinci.editor", function (extension){
				return newEditor ? (extension.id === newEditor.editorID) : false;
			});
			if (editorExtensions && editorExtensions.length > 0) {
				var editorExtension = editorExtensions[0];
				palettePerspectiveId = editorExtension.palettePerspective;
			}
			
			//Remember if palettes had been expanded because as we add/remove/select tabs these values will be 
			//altered and we'll want to restore them
			newEditorRightPaletteExpanded = newEditor._rightPaletteExpanded;
			newEditorLeftPaletteExpanded= newEditor._leftPaletteExpanded;
		} else {
			//No editor, so use the initital perspective
			palettePerspectiveId = Runtime.initialPerspective || "davinci.ui.main";
		}
			
		if (palettePerspectiveId) {
			var palettePerspective = Runtime.getExtension("davinci.perspective", palettePerspectiveId);
			if (!palettePerspective) {
				Runtime.handleError(dojo.string.substitute(webContent.perspectiveNotFound,[editorExtension.palettePerspective]));
			}
			var paletteDefs = palettePerspective.views;

			// Loop through palette ids and select appropriate palettes
			dojo.forEach(paletteDefs, function(paletteDef) {
				// Look up the tab for the palette and get its 
				// parent to find the right TabContainer
				var paletteId = paletteDef.viewID;
				var position = paletteDef.position;
				if (position.indexOf("bottom") < 0) {
					position += "-top";
				}
				var tab = dijit.byId(paletteId);
				if (tab) {
					var tabContainer = tab.getParent();
					var desiredTabContainer = mainBody.tabs.perspective[position];
					
					//Move tab
					if (tabContainer != desiredTabContainer) {
						if (tabContainer) {
							//Need to remove from the old tabbed container
							tabContainer.removeChild(tab);
						}
						if (!paletteDef.hidden) {
							desiredTabContainer.addChild(tab);
							tabContainer = desiredTabContainer;
						}
					}

					// Select/hide tab
					if (tabContainer) {
						if (paletteDef.hidden) {
							tabContainer.removeChild(tab);
						} else {
							if (paletteDef.selected) {
								// This flag prevents Workbench.js logic from triggering expand/collapse
								// logic based on selectChild() event
								tabContainer._maqDontExpandCollapse = true;
								tabContainer.selectChild(tab);
								delete tabContainer._maqDontExpandCollapse;
							}
						}
					}
				}
			});
		}
		
		//Restore left/right palette expanded states that were saved earlier
		if (newEditor) {
			if (newEditor.hasOwnProperty("_rightPaletteExpanded")) {
				newEditor._rightPaletteExpanded = newEditorRightPaletteExpanded;
			}
			if (newEditor.hasOwnProperty("_leftPaletteExpanded")) {
				newEditor._leftPaletteExpanded = newEditorLeftPaletteExpanded;
			}
		}
	},
	
	_nearlyCollapsed: function(paletteContainerNode){
		// Check actual width of palette area. If actual width is smaller than the
		// size of the tabs plus a small delta, then treat as if the palettes are collapsed
		var width = dojo.style(paletteContainerNode, 'width');
		if(typeof width == 'string'){
			width = parseInt(width);
		}
		return width < (paletteTabWidth + paletteTabDelta);
	},

	_expandCollapsePaletteContainer: function(tab) {
		if(!tab || !tab.domNode){
			return;
		}
		var paletteContainerNode = davinci.Workbench.findPaletteContainerNode(tab.domNode);
		if(!paletteContainerNode.id){
			return;
		}
		var expanded = paletteContainerNode._maqExpanded;
		var expandToSize; 
		if(this._nearlyCollapsed(paletteContainerNode)){
			expanded = false;
			expandToSize = (paletteCache[paletteContainerNode.id].expandToSize >= (paletteTabWidth + paletteTabDelta)) ?
					paletteCache[paletteContainerNode.id].expandToSize : paletteCache[paletteContainerNode.id].initialExpandToSize;
		}
		if(expanded){
			this.collapsePaletteContainer(paletteContainerNode);
		}else{
			this.expandPaletteContainer(paletteContainerNode, {expandToSize:expandToSize});
		}
	},

	_expandCollapsePaletteContainers: function(newEditor, params) {
		var leftBC = dijit.byId('left_mainBody');
		var rightBC = dijit.byId('right_mainBody');
		if(!newEditor){
			if(leftBC){
				this.collapsePaletteContainer(leftBC.domNode, params);
			}
			if(rightBC){
				this.collapsePaletteContainer(rightBC.domNode, params);
			}			
		}else{
			// First, we will get the metadata for the extension and get its list of 
			// palettes to bring to the top
			var editorExtensions=Runtime.getExtensions("davinci.editor", function (extension){
				return extension.id === newEditor.editorID;
			});
			if (editorExtensions && editorExtensions.length > 0) {
				var expandPalettes = editorExtensions[0].expandPalettes;
				var expand;
				if(leftBC){
					if(newEditor && newEditor.hasOwnProperty("_leftPaletteExpanded")){
						expand = newEditor._leftPaletteExpanded;
					}else{
						expand = (expandPalettes && expandPalettes.indexOf('left')>=0);
					}
					if(expand){
						this.expandPaletteContainer(leftBC.domNode, params);
					}else{
						this.collapsePaletteContainer(leftBC.domNode, params);
					}
				}
				if(rightBC){
					if(newEditor && newEditor.hasOwnProperty("_rightPaletteExpanded")){
						expand = newEditor._rightPaletteExpanded;
					}else{
						expand = (expandPalettes && expandPalettes.indexOf('right')>=0);
					}
					if(expand){
						this.expandPaletteContainer(rightBC.domNode, params);
					}else{
						this.collapsePaletteContainer(rightBC.domNode, params);
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
				Workbench.saveState = true;
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
			}
			delete davinci.Workbench._shadowTabClosing[page.id];
		}
	},

	getActiveProject: function() {
		/* need to check if there is a project in the URL.  if so, it takes precidence
		 * to the workbench setting
		 */
		
		if (!Workbench._state){
			Workbench._state = Runtime.getWorkbenchState();
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
		Workbench.saveState = true;
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
			Workbench.saveState = true;
		}
	},

	clearWorkbenchState: function() {
		Workbench._state = {};
		return Workbench.updateWorkbenchState();
	},

	updateWorkbenchState: function(){
		delete Workbench.saveState;
		return xhr.put({
			url: "cmd/setWorkbenchState",
			putData: JSON.stringify(Workbench._state),
			handleAs:"text"
		});
	},

	_autoSave: function(){
		var lastSave = Workbench._lastAutoSave;
		var anyErrors = false;
		function saveDirty(editor){
			if (editor.isReadOnly || !editor.isDirty) {
				return;
			}
			
			var modified = editor.lastModifiedTime;
			if (modified && modified > lastSave){
				try {
					editor.save(true);
				}catch(ex){
					console.error("Error while autosaving file:" + ex);
					anyErrors = true;
				}
			}
		}
		if(Workbench.editorTabs){
			dojo.forEach(Workbench.editorTabs.getChildren(), saveDirty);
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
	 * @params {object} params
	 *      params.dontPreserveWidth says to not cache current palette width
	 */
	collapsePaletteContainer: function(node, params){
		var paletteContainerNode = davinci.Workbench.findPaletteContainerNode(node);
		if(paletteContainerNode && paletteContainerNode.id){
			var id = paletteContainerNode.id;
			var paletteContainerNodeWidth = dojo.style(paletteContainerNode, 'width');
			var paletteContainerWidget = dijit.byNode(paletteContainerNode);
			var tablistNodes = dojo.query('[role=tablist]', paletteContainerNode);
			if(paletteContainerWidget && tablistNodes.length > 0){
				var tablistNode = tablistNodes[0];
				var tablistNodeSize = dojo.marginBox(tablistNode);
				var parentWidget = paletteContainerWidget.getParent();
				if(parentWidget && parentWidget.resize && tablistNodeSize && tablistNodeSize.w){
					if(!this._nearlyCollapsed(paletteContainerNode) && (!params || !params.dontPreserveWidth)){
						paletteCache[id].expandToSize = paletteContainerNodeWidth; // Note: just a number, no 'px' at end
					}
					paletteContainerNode.style.width = tablistNodeSize.w + 'px';
					parentWidget.resize();
					paletteContainerWidget._isCollapsed = true;
				}
			}
			dojo.removeClass(paletteContainerNode, 'maqPaletteExpanded');
			paletteContainerNode._maqExpanded = false;
			davinci.Workbench._repositionFocusContainer();
			var currentEditor = Runtime.currentEditor;
			if(currentEditor){
				if(paletteContainerNode.id == 'left_mainBody'){
					currentEditor._leftPaletteExpanded = false;
				}else if(paletteContainerNode.id == 'right_mainBody'){
					currentEditor._rightPaletteExpanded = false;
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
	 * @param {object} params  A descendant node of the palette container node.
	 * 		params.expandToSize {number}  Desired width upon expansion
	 */
	expandPaletteContainer: function(node, params){
		var expandToSize = params && params.expandToSize;
		var paletteContainerNode = davinci.Workbench.findPaletteContainerNode(node);
		if(paletteContainerNode && paletteContainerNode.id){
			var id = paletteContainerNode.id;
			var paletteContainerWidget = dijit.byNode(paletteContainerNode);
			if(expandToSize){
				paletteCache[id].expandToSize = expandToSize;
			}
			if(paletteContainerWidget && paletteCache[id].expandToSize){
				var parentWidget = paletteContainerWidget.getParent();
				if(parentWidget && parentWidget.resize){
					paletteContainerNode.style.width = paletteCache[id].expandToSize + 'px';
					parentWidget.resize();
					delete paletteContainerWidget._isCollapsed;
				}
			}
			dojo.addClass(paletteContainerNode, 'maqPaletteExpanded');
			paletteContainerNode._maqExpanded = true;
			davinci.Workbench._repositionFocusContainer();
			var currentEditor = Runtime.currentEditor;
			if(currentEditor){
				if(paletteContainerNode.id == 'left_mainBody'){
					currentEditor._leftPaletteExpanded = true;
				}else if(paletteContainerNode.id == 'right_mainBody'){
					currentEditor._rightPaletteExpanded = true;
				}
			}
		}
	},

	/**
	 * Reposition the focusContainer node to align exactly with the position of editors_container node
	 */
	_repositionFocusContainer: function(){
		var editors_container = dojo.byId('editors_container');
		var focusContainer = dojo.byId('focusContainer');
		if(editors_container && focusContainer){
			var currentEditor = Runtime.currentEditor;
			var box;
			if(currentEditor && currentEditor.getFocusContainerBounds){
				box = currentEditor.getFocusContainerBounds();
			}else{
				box = GeomUtils.getBorderBoxPageCoords(editors_container);
			}
			if(box){
				focusContainer.style.left = box.l + 'px';
				focusContainer.style.top = box.t + 'px';
				focusContainer.style.width = box.w + 'px';
				focusContainer.style.height = box.h + 'px';
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
	
	_removeFocusContainerChildren: function(){
		davinci.Workbench.focusContainer.innerHTML = '';
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

// put workbench state upload on a timer to reduce number of requests to the server
window.setInterval(function(){
	if (Workbench.saveState) {
		Workbench.updateWorkbenchState();		
	}
}, 1000);

dojo.setObject("davinci.Workbench", Workbench);
return Workbench;
});
