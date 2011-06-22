dojo.provide("davinci.Workbench");

dojo.require("dijit.Dialog");
dojo.require("dijit.Toolbar");
dojo.require("dijit.ToolbarSeparator");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuBar");
dojo.require("dijit.PopupMenuBarItem");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
//dojo.require("davinci.workbench._ToolbaredContainer");
dojo.require("davinci.workbench.ViewPart");
dojo.require("davinci.ui.Panel");
dojo.require("davinci.resource");
dojo.require("davinci.ui.Dialogs");


dojo.require("davinci.workbench.EditorContainer");

dojo.provide("davinci.Workbench");

dojo.mixin(davinci.Workbench, {
	activePerspective: "",
	actionScope: [],

	run: function() {
		this._initKeys();
		this._baseTitle=dojo.doc.title;
		var perspective= davinci.Runtime.initialPerspective || "davinci.ui.main";
		this.showPerspective(perspective);
		davinci.Runtime.subscribe("/davinci/ui/selectionChanged",davinci.Workbench._updateMainToolBar );
		davinci.Runtime.subscribe("/davinci/ui/editorSelected",davinci.Workbench._updateMainToolBar );
		davinci.Runtime.subscribe("/davinci/resource/resourceChanged",this._resourceChanged );
/* NO MORE MAIN TOOLBAR WITH NEW UI
		this._createToolBar('init',dojo.byId('davinci_toolbar_main'));
*/
/*
		var top = new davinci.workbench._ToolbaredContainer({}, "davinci_top");
		dojo.place(dojo.byId("davinci_top_bar"), top.toolbarDiv, "replace");
		top.toolbarNode = dojo.byId("_toolbar_main");
		top.setContent(dijit.byId("mainBody"));
		top.startup();
*/
		this._initializeWorkbenchState();
	
		var loading = dojo.query('.loading');
		if (loading[0]){ // remove the loading div
			loading[0].parentNode.removeChild(loading[0]);
		}
		this._lastAutoSave=new Date().getTime();
		setInterval(dojo.hitch(this,"_autoSave"),30000);
	},
	
	_getHeightInPixels: function(){
		var mainBodyContainer = dijit.byId('mainBody');
		return mainBodyContainer.getHeight();
	},
	
	_getWidthInPixels: function (){
		var mainBodyContainer = dijit.byId('mainBody');
		return mainBodyContainer.getWidth();
	},
	
	_pushImageCss: function (urlToImage){
		var className = "." + urlToImage.replace(/\//g,"_").replace(/\./g,"_").replace(/:/g,"_");
		var plainCssText = 
			  "background-image: url('" + urlToImage + "');" +
			  "background-repeat: no-repeat;" +
			  "width: 18px;" + 
			  "height: 18px;" + 
			  "text-align: center;";
		dojox.html.insertCssRule(className, plainCssText);
		return className;
	},
	_resourceChanged : function (type,changedResource)
	{
		if (type=='deleted')
		{
			fileName=changedResource.getPath();
			var tab = dijit.byId(davinci.Workbench._filename2id(fileName));
			if (tab)
			{
				var tabContainer = dijit.byId("editors_tabcontainer");
				tabContainer.removeChild(tab);
				//	tab.destroyRecursive();
			}
		}
	},

	unload: function () {
		this._autoSave();
	},

	_updateMainToolBar: function (change, toolbarID){
		var toolbar1 = dijit.byId("davinci_toolbar_main");
		if(toolbar1){
			dojo.forEach(toolbar1.getChildren(), function(child){
 				if (child.isEnabled)
 				{
 					child.setDisabled(!child.isEnabled(change.targetObjectId));
 				}
 			});
		}
	},

	_createToolBar: function (targetObjectId,targetDiv,actionSets,context){
		var _toolbarcache = [];
		if (!actionSets)
		   actionSets = davinci.Runtime.getExtensions('davinci.actionSets');
		for(var i = 0;i<actionSets.length;i++){
			this._loadActionSetContainer(actionSets[i]);
			var actions = actionSets[i]['actions'];
			for(var k = 0;k<actions.length;k++){
			  var toolBarPath = actions[k]['toolbarPath'];
			  if(toolBarPath){
				  if(!_toolbarcache[toolBarPath]){
					  _toolbarcache[toolBarPath] = []
				  }
				  _toolbarcache[toolBarPath].push(actions[k]);
			  }
			}		
		}
		
	
		var toolbar1 = new dijit.Toolbar({'class':"davinciToolbar"}, targetDiv);   
		var radioGroups={};
		var firstgroup = true;
		for(var value  in _toolbarcache){
			if(!firstgroup){
				var separator=new dijit.ToolbarSeparator();
				toolbar1.addChild(separator);
			}else{
				firstgroup = false;
			}
			var children;
				var actions = _toolbarcache[value];
				  for(var p = 0;p<actions.length;p++){
					    var action=actions[p];
			 			var id = action.id;
			 			// dont add dupes
			 	
			 			this._loadActionClass(action);
						var parms={showLabel:false/*, id:(id + "_toolbar")*/};
						if (action.label)
							parms.label=action.label;
						if (action.iconClass)
							parms.iconClass=action.iconClass;
						var dojoAction ;
						if (action.toggle || action.radioGroup)
						{
							dojoAction =new dijit.form.ToggleButton(parms);
							dojoAction.item=action;
							dojoAction.setChecked(action.initialValue);
							if (action.radioGroup)
							{
								var group=radioGroups[action.radioGroup];
								if (!group)
									group=radioGroups[action.radioGroup]=[];
								group.push(dojoAction);
								dojoAction.onChange=dojo.hitch(this,"_toggleButton",dojoAction,context,group);
							}
							else
								dojoAction.onChange=dojo.hitch(this,"_runAction",action,context);
						}
						else
						{
							dojoAction = new dijit.form.Button(parms);
							dojoAction.onClick=dojo.hitch(this,"_runAction",action,context);
						}
						if (action.icon)
						{
							var imageNode = document.createElement('img');
							imageNode.src=action['icon'];
							imageNode.height = imageNode.width = 18;
							dojoAction.domNode.appendChild(imageNode);
						}

						toolbar1.addChild(dojoAction);
						if(action.isEnabled && !action.isEnabled(targetObjectId) ){ 
							dojoAction.isEnabled = action.isEnabled;
							dojoAction.setDisabled(true);
						}else{
							dojoAction.setDisabled(false);
						}
				}
		
		}
		return toolbar1;
	},

	getActivePerspective: function() {
		return this.activePerspective;
	},

	showPerspective: function(perspectiveID) {
		
		this.activePerspective = perspectiveID;

		this._updateMainMenubar();

		var mainBody = dojo.byId('mainBody');
		if (mainBody.tabs == null) {
			mainBody.tabs = [];
		}
		
		/* Large border container for the entire page */
		var mainBodyContainer = dijit.byId('mainBody');

		if(!mainBodyContainer) mainBodyContainer = new dijit.layout.BorderContainer({gutters: false, region: "center", design: 'sidebar'}, mainBody);
		var perspective = davinci.Runtime.getExtension("davinci.perspective",perspectiveID);


		if (!perspective)
			davinci.Runtime.handleError("perspective not found: " + perspectiveID);

		perspective=dojo.clone(perspective);	// clone so views aren't added to original definition

		var extensions = davinci.Runtime.getExtensions("davinci.perspectiveExtension",function (extension){ return extension.targetID==perspectiveID});
		dojo.forEach(extensions, function (extension){
//TODO: should check if view is already in perspective			
			dojo.forEach(extension.views, function (view){ perspective.views.push(view);});	
		});
		
		if (!mainBody.editorsStackContainer){
			this.editorsStackContainer=mainBody.editorsStackContainer =
				new dijit.layout.StackContainer(
				{
					region :'center',
					id : "editorsStackContainer",
					controllerWidget: "dijit.layout.StackController"
				});
		}
		// FIXME: THIS BYPASSES THE PLUGIN SYSTEM.
		// Hardcoding this for now. Need to work with Phil on how to turn change
		// welcome page logic into something that is defined by ve_plugin.js.
		mainBodyContainer.addChild(mainBody.editorsStackContainer);
		if (!mainBody.editorsWelcomePage){
			this.editorsWelcomePage=mainBody.editorsWelcomePage =
				new dijit.layout.ContentPane(
				{
					id : "editorsWelcomePage",
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
			this.editorTabs=mainBody.tabs.editors =
				new (davinci.Workbench.hideEditorTabs ?
					dijit.layout.StackContainer : dijit.layout.TabContainer)(
				{
					id : "editors_tabcontainer",
					controllerWidget: "dijit.layout.TabController"
				});
			this.editorTabs.setTitle = function(tab, title){ 
				tab.attr('title', title);
				(this.tablist.pane2button[tab.id] || this.tablist.pane2button[tab]).attr('label', title); // FIXME: use tab.id index for Dojo 1.4+
			};
			
			dojo.connect(mainBody.tabs.editors, "removeChild", this, this._editorTabClosed);
		}
		mainBody.editorsStackContainer.addChild(mainBody.tabs['editors']);
		mainBody.editorsStackContainer.selectChild(mainBody.editorsWelcomePage);
		dojo.connect(dijit.byId("editors_tabcontainer"),"selectChild",function(child){
			if (child.editor)
			{
				davinci.Workbench._switchEditor(child.editor);
			}
		});		
		mainBodyContainer.startup();


		// Put the toolbar and the main window in a border container
		var appBorderContainer = dijit.byId('davinci_app');
		if (!appBorderContainer) {
			appBorderContainer = new dijit.layout.BorderContainer({       
				design: "headline",
	            gutters: false,
	            liveSplitters: false
			}, "davinci_app");
			
			var topBarPane = new dijit.layout.ContentPane({
					region: "top"                    
			}, "davinci_top_bar");
			
			appBorderContainer.addChild(topBarPane);
			appBorderContainer.addChild(mainBodyContainer);
			appBorderContainer.layout();	
			appBorderContainer.startup();
			this._orginalOnResize = window.onresize;
			window.onresize = this.onResize; //alert("All done");}
			dojo.connect(mainBodyContainer, 'onMouseUp', this, 'onResize');

		}
		
		
		/* close all of the old views */
		for(position in mainBody.tabs.perspective){
			var view = mainBody.tabs.perspective[position];
			if(!view) continue;
			dojo.forEach(view.getChildren(), function (child) {
				view.removeChild(child);
				if (position != 'left' && position != 'right') {
					child.destroyRecursive(false);
				}
			});
			view.destroyRecursive(false);
			delete mainBody.tabs.perspective[position];
		}

		dojo.forEach(perspective.views, function(view){
			this.showView(view.viewID, false);
		}, this);

		// kludge to workaround problem where tabs are sometimes cutoff/shifted to the left in Chrome for Mac
		// would be nice if we had a workbench onload event that we could attach this to instead of relying on a timeout
		setTimeout(function(){
			appBorderContainer.resize();
		}, 3000);
	},

	onResize: function(e){

		var target = e.explicitOriginalTarget ? e.explicitOriginalTarget : e.srcElement;
		if ( (e.type == 'resize') || ( ((target.id) && ( (target.id.indexOf('dijit_layout__Splitter_')>-1)) || ( (target.nextSibling && target.nextSibling.id) && (target.nextSibling.id.indexOf('dijit_layout__Splitter_')>-1) ))  )  ){
			var ed = davinci && davinci.Runtime.currentEditor;
			if (davinci && davinci.Runtime.currentEditor && davinci.Runtime.currentEditor.onResize)
				davinci.Runtime.currentEditor.onResize();
		}
		if(this._orginalOnResize)
			this._orginalOnResize();

	},

	updateMenubar: function(node, actionSets) {
		var menuTree = this._createMenuTree(actionSets);

		var menuTop = dijit.byId(node.id);
		if (!menuTop) {
			menuTop = new dijit.MenuBar({'class': 'dijitInline'}, node);
		}
		this._addItemsToMenubar(menuTree, menuTop);
	},
	
	_updateMainMenubar: function() {
		 var menuDiv=dojo.byId('davinci_main_menu');
		 if (!menuDiv)
			 return;  // no menu
		var menuTree = this._createMenuTree();

	   for (var i=0;i<menuTree.length; i++)
	   {
		   var menuTreeItem=menuTree[i];
		   for (var j=0;j<menuTreeItem.menus.length;j++)
		   {
			   var menu=menuTreeItem.menus[j];
			   var dojoMenu = this._createMenu(menu);
			   menu.id = menu.id.replace(".", "-"); // kludge to work around the fact that '.' is being used for ids, and that's not compatible with CSS
				var widget =  dijit.byId(menu.id + "-dropdown");
				if(!widget) {
					widget = new dijit.form.DropDownButton({
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
					var dojoMenu = this._createMenu(menu),
						widget =  dijit.byId(menu.id + "-dropdown");
					if(!widget) {
						widget = new dijit.PopupMenuBarItem({
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

	getOpenEditor: function (){
		var tabContainer = dijit.byId("editors_tabcontainer");
		if(tabContainer && tabContainer.selectedChildWidget && tabContainer.selectedChildWidget.editor){
			return tabContainer.selectedChildWidget.editor;
		}
		return null;
	},


	getAllOpenEditorIds: function (){
	},
	
	
	showModal : function(content, title, style){

		
		 var myDialog = new dijit.Dialog({
		      'title': title,
		      'content': content,
		      'style': (style || "width: 300px")
		  });
		var handle = dojo.connect(content,"onClose",this,function(){
									myDialog.hide();
									dojo.disconnect(handle);
								  });
		myDialog.show();
		
		
	},
	
	_createMenuTree : function(actionSets,pathsOptional) {
		if (!actionSets)
		{  // only get action sets not associated with part
			actionSets =  davinci.Runtime.getExtensions("davinci.actionSets", function (actionSet)
			{
				var associations=davinci.Runtime.getExtensions("davinci.actionSetPartAssociations",function (actionSetPartAssociation){
					if (actionSetPartAssociation.targetID==actionSet.id)
						return true;
				});	
				return associations.length==0;
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
			

			davinci.Workbench._loadActionClass(item);
			
			
			var sep = path[path.length - 1];
			if (path.length > 1) {
				for ( var i = 0, len = path.length - 1; i < len; i++) {
					var k = findID(m, path[i]);
					if (k) {
						// davinci.Runtime.handleError("menu item not
						// found: "+path);
						m = k;
					}
	
				}
			}
			for ( var i = 0, len = m.length; i < len; i++) {
				if (m[i].id == sep) {
					var menus = m[i].menus;
					menus.push(item);
					if (item.separator) // if menu
					{
						var wasAdditions = false;
						menus = item.menus = [];
						for ( var j = 0; j < item.separator.length; j += 2) {
							var id = item.separator[j];
	
							wasAdditions = id == "additions";
							menus.push( {
								id :id,
								isSeparator :item.separator[j + 1],
								menus : []
							});
						}
						if (!wasAdditions)
							menus.push( {
								id :"additions",
								isSeparator :false,
								menus : []
							});
	
					}
					return;
				}
			}
			if (pathsOptional)
			menuTree.push( {
				id : sep,
				isSeparator :false,
				menus : [item]
			});
			// davinci.Runtime.handleError("menu item not found:
			// "+path);
		}
	
		for ( var actionSetN = 0, len = actionSets.length; actionSetN < len; actionSetN++) {
			var actionSet = actionSets[actionSetN];
			if (actionSet.visible) {
				this._loadActionSetContainer(actionSet);
				if (actionSet.menu)
					for ( var menuN = 0, menuLen = actionSet.menu.length; menuN < menuLen; menuN++) {
						var menu = actionSet.menu[menuN];
						if (menu.__mainMenu) {
							for ( var j = 0; j < menu.separator.length; j += 2) {
								menuTree.push( {
										id :menu.separator[j],
										isSeparator :menu.separator[j + 1],
										menus : []
								});
							}
						} else {
							addItem(menu, menu.path,pathsOptional);
							if (menu.populate instanceof Function)
							{
								var menuItems=menu.populate();
								for (var item in menuItems)
									addItem(menuItems[item], menuItems[item]['menubarPath']);
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
						addItem(action, action.menubarPath,pathsOptional)
					}
				}
			}
		}
		return menuTree;
	},

	_loadActionSetContainer : function(actionSet)
	{
		if (actionSet.actionsContainer)
		{
			if (typeof actionSet.actionsContainer == "string"/* && item.action instanceof String*/)
			{
				actionSet.actionsContainer=dojo["require"](actionSet.actionsContainer);
			}
			for (var i=0;i<actionSet.actions.length;i++)
				actionSet.actions[i].actionLoaded=true;
		}

	},
	_loadActionClass: function(item)
	{
		if (typeof item.action == "string"/* && item.action instanceof String*/)
		{
			if (!item.actionLoaded){
				var actionContainerClassName = item.actionsContainer?item.actionsContainer:item.action;
				dojo["require"](actionContainerClassName);
			}
			var actionClass= eval(item.action);
			item.action=new actionClass;
			item.action.item=item;
		}

	},
	_createMenu: function (menu,context) {
		
		var dojoMenu,menus,connectFunction;
		if (menu.menus)  // creating dropdown
		{
		  dojoMenu = new dijit.Menu( {
			parentMenu: menu
		  });
		  menus=menu.menus;
		  connectFunction="onOpen";
//					  this._openMenu(dojoMenu, menus);
//					  return dojoMenu;
		  
		}
		else	// creating popup
		{
			dojoMenu = new davinci.workbench._PopupMenu({});
			menus=menu;
			connectFunction="menuOpened";
		}

		dojoMenu.domNode.style.display = "none";
		dojoMenu.actionContext = context;
		dojo.connect(dojoMenu, connectFunction, this, function(evt){
		   this._openMenu(dojoMenu, menus,evt).focus(); // call focus again, now that we messed with the widget contents
		});
		return dojoMenu;
	},
		
	_openMenu: function (dojoMenu,menus,evt) {

		if (dojoMenu._widgetCallback)
		  dojoMenu._widgetCallback(evt);
		dojo.forEach(dojoMenu.getChildren(), function(child){
			dojoMenu.removeChild(child);
			child.destroy();
		});
		dojoMenu.focusedChild = null; // TODO: dijit.Menu bug?  Removing a focused child should probably reset focusedChild for us

		var addSeparator,menuAdded;
		for (var i = 0, len = menus.length; i < len; i++) {
			if (menus[i].menus.length > 0) {
				if (menus[i].isSeparator && i>0)
					addSeparator=true;
				for ( var menuN = 0, menuLen = menus[i].menus.length; menuN < menuLen; menuN++) {
					if (addSeparator && menuAdded)
					{
						dojoMenu.addChild(new dijit.MenuSeparator({}));
						addSeparator=false;
					}
					menuAdded=true;
					var item = menus[i].menus[menuN];
					if (item.separator) {
						var subMenu = this._createMenu(item);
						var popupParent = new dijit.MenuItem({
							label :item.label,
							popup :subMenu,
							id :subMenu.id + "item"
						});
						popupParent.actionContext=dojoMenu.actionContext;
						dojoMenu.addChild(popupParent);
					} else {
						var enabled=true;
						var label=item.label;
						if (item.action)
						{
							if (item.action.shouldShow && !item.action.shouldShow(dojoMenu.actionContext))
								continue;
							enabled= item.action.isEnabled(dojoMenu.actionContext);
							if (item.action.getName)
								label=item.action.getName();
						}
						var menuArgs= {
								label : label,
								disabled : !enabled,
								onClick :dojo.hitch(this,"_runAction",item,dojoMenu.actionContext)
							};
						if (item.iconClass)
							menuArgs.iconClass=item.iconClass;
						var menuItem1 = new dijit.MenuItem(menuArgs);
						dojoMenu.addChild(menuItem1);
					}
				}
			}
		}

		dojoMenu.startup();
		return dojoMenu;
	},
	
	_toggleButton : function (button,context,group,arg)
	{
		if (!button.checked)
			return;
		for (var i=0;i<group.length;i++)
			if (group[i]!=button)
				group[i].setChecked(false);
		this._runAction(button.item,context,button.item.id);
	},
	_runAction: function (item,context,arg)
	{
		if (item.run)
		{
			if (item.run instanceof Function)
				item.run();
			else
			{
				if (item.scope)
				{
					var scope=this.actionScope[item.scope];
					if (!scope)
						davinci.Runtime.handleError("scope not defined for action: "+item.id);
					else
					{
						var func=scope[item.run];
						if (!func)
							davinci.Runtime.handleError("function not defined for action: "+item.id);
						else
							func.apply(this);
					}
				}
				else 
				  eval(item.run);
			}
		}
		else if (item.action)
		{
			item.action.run(context);
		}
		else if (item.method && context && context[item.method] instanceof Function)
			context[item.method](arg);
		else if (item.commandID)
			davinci.Runtime.executeCommand(item.commandID);
	},

	_getPageHeight: function (){
		var mainBodyContainer = dijit.byId('mainBody');
		return mainBodyContainer._borderBox.h;
	},
	
	showView: function(viewId, shouldFocus){
		
	  try {
			
		var mainBodyContainer = dijit.byId('mainBody'),
			view = davinci.Runtime.getExtension("davinci.view", viewId),
			mainBody = dojo.byId('mainBody'),
			perspectiveId = this.getActivePerspective(),
			perspective = davinci.Runtime.getExtension("davinci.perspective", perspectiveId),
			position = 'left',
			cp1 = null,
			created = false,
			pxHeight = this._getPageHeight() - 5;
		
		dojo.some(perspective.views, function(view){
			if(view.viewID ==  viewId){
				position = view.position;
				return true;
			}	
		});
		
		mainBody.tabs = mainBody.tabs || {};				
		mainBody.tabs.perspective = mainBody.tabs.perspective || {};

		if(position == 'right' && !mainBody.tabs.perspective.right){
			mainBodyContainer.addChild(mainBody.tabs.perspective.right = new dijit.layout.BorderContainer({'class':'davinciPaletteContainer', style: 'width: 275px;', id:"right_mainBody", region:'right', gutters: false, splitter:true}));
			mainBody.tabs.perspective.right.startup();
		}

		if(position == 'left' && !mainBody.tabs.perspective.left){
			mainBodyContainer.addChild(mainBody.tabs.perspective.left = new dijit.layout.BorderContainer({'class':'davinciPaletteContainer', style: 'width: 200px;', id:"left_mainBody", region:'left', gutters: false, splitter:true}));
			mainBody.tabs.perspective.left.startup();
		}

		if(position == 'left' || position == 'right') position += "-top";
		var positionSplit = position;

		if (!mainBody.tabs.perspective[position]) {
			positionSplit = position.split('-');

			var region = positionSplit[0],
				parent = mainBodyContainer,
				clazz = '',
				style = '';
			if (positionSplit[1] && (region == 'left' || region == 'right')) {
				parent = mainBody.tabs.perspective[region];
				region = positionSplit[1];
				if (positionSplit[1] == "top") {
					region = "center";
					clazz = "davinciTopPalette";
				} else {
					style = 'height:35%;';
					clazz = "davinciBottomPalette";
				}
			} else if(region == 'bottom') {
				style = 'height:80px;';
				clazz = "davinciBottomPalette";
			}
			cp1 = mainBody.tabs.perspective[position] = new dijit.layout.TabContainer({
				region: region,
				'class': clazz,
				style: style,
				splitter: region != "center",
				controllerWidget: "dijit.layout.TabController"
			});
			parent.addChild(cp1);
		} else {
			cp1 = mainBody.tabs.perspective[position];
		}

		if (dojo.some(cp1.getChildren(), function(child){ return child.id == view.id; })) {
			return;
		}

		var tab = dijit.byId(view.id);
		if (!tab) {
				var viewClass;
				if (view.viewClass){
					dojo["require"](view.viewClass);
					viewClass = dojo.getObject(view.viewClass);
				}
				else
					viewClass = davinci.workbench.ViewPart;
				var tab = new viewClass( {
					position: positionSplit[1] || positionSplit[0],
					title: view.title,
					id: view.id,
					closable: true,
					view: view
				});
		}
			
		cp1.addChild(tab);
//		if(tab.startup){
//			debugger;
//			tab.startup();
//		
//		}
		if(shouldFocus) cp1.selectChild(tab);
	  } catch (ex) {console.error("Error loading view: "+view.id);console.error(ex);}
	},
	
	hideView: function(viewId){
		for(position in mainBody.tabs.perspective){
			if(position=='left' || position == 'right'){ position+='-top'; }
			if(! mainBody.tabs.perspective[position]){ continue; }
			var children = mainBody.tabs.perspective[position].getChildren();
			var found = false;
			for ( var i = 0; i < children.length && !found; i++) {
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
			this.hideView(viewId);
		} else{
			this.showView(viewId, true);
		}
	},

	openEditor: function (keywordArgs) {
		
		var fileName=keywordArgs.fileName,
			content=keywordArgs.content,
			fileExtension,
			file;
		if (typeof fileName=='string')
		{
			 fileExtension=fileName.substr(fileName.lastIndexOf('.')+1);
		}
		else
		{
			file=fileName;
			fileExtension=fileName.getExtension();
			fileName=fileName.getPath();
		}

		var tab = dijit.byId(this._filename2id(fileName)),
			tabContainer = dijit.byId("editors_tabcontainer");

		if (tab)
		{
			// already open
			tabContainer.selectChild(tab);
			var editor=tab.editor;
			if (keywordArgs["startOffset"]) {
				editor.select(keywordArgs);
			}
			return;
		}
		var editorCreateCallback=keywordArgs.editorCreateCallback;
		
		var editorExtensions=davinci.Runtime.getExtensions("davinci.editor", function (extension){
			 if (typeof extension.extensions =="string")
				 extension.extensions=extension.extensions.split(',');
			 return dojo.some(extension.extensions, function(e){
				 return e.toLowerCase() == fileExtension.toLowerCase();
			 });
		});

		var editorExtension = editorExtensions[0];
		if (editorExtensions.length>1){
			dojo.some(editorExtensions, function(extension){
			editorExtension = extension;
			return extension.isDefault;
		})}
		/*{
			var data={
					listData:editorExtensions
			};
			davinci.ui.Panel.openDialog( {
					definition: [
								  {
									type: "list",
									label: "Editors",
									data: "listData",
									itemLabel: "name",
									selectedItem: "selectedItem"
								  }
								],
					data: data,
					onOK: function ()
					{
					  if (data.selectedItem)
						  davinci.Runtime.currentEditor = this._createEditor(data.selectedItem, fileName, keywordArgs);
					},
					title:"Select Editor"
			});
			return;
		}*/
		var ee = this._createEditor(editorExtension,fileName,keywordArgs);
		if(editorCreateCallback){
			editorCreateCallback.call(window, ee);
		}

		if(!keywordArgs.noSelect) {
			 davinci.Runtime.currentEditor = ee;
		}
	},
	
	_createEditor: function(editorExtension, fileName, keywordArgs){
		var nodeNameArray = new String(fileName).split('/'); // unnecessary conversion to String?
		var nodeName = nodeNameArray[nodeNameArray.length-1];

		var loading = dojo.query('.loading');
		if (loading[0]){
			loading[0].parentNode.removeChild(loading[0]);
		}

		var editorsStackContainer = dijit.byId('editorsStackContainer'),
			editors_tabcontainer = dijit.byId('editors_tabcontainer');
		if (editorsStackContainer && editors_tabcontainer){
			editorsStackContainer.selectChild(editors_tabcontainer);
		}

		var content = keywordArgs.content,
			tab = dijit.byId(this._filename2id(fileName)),
			tabContainer = dijit.byId("editors_tabcontainer"),
			tabCreated=false;
		if(tab==null){
			tabCreated=true;

			tab = new davinci.workbench.EditorContainer( {
				title: nodeName,
				id: this._filename2id(fileName), 
				'class': "EditorContainer",
				closable: true,
				isDirty: keywordArgs.isDirty
			});
		}
		
		if (!editorExtension) {
			editorExtension = {
				requires: 'davinci.ui.TextEditor',
				editorClass: 'davinci.ui.TextEditor',
				id: 'davinci.ui.TextEditor'
			};
		}
		
		if (editorExtension.requires) {
			dojo["require"](editorExtension.requires);
		}

		if (tabCreated) {
			tabContainer.addChild(tab);
		}

		// add loading spinner
		var loadIcon = dojo.query('.dijitTabButtonIcon',tab.controlButton.domNode);
		dojo.addClass(loadIcon[0],'tabButtonLoadingIcon');
		dojo.removeClass(loadIcon[0],'dijitNoIcon');
		
		if (!keywordArgs.noSelect) {
			tabContainer.selectChild(tab);
		}
		tab.setEditor(editorExtension,fileName,content,keywordArgs.fileName);
		
//					var constr=dojo.getObject(editorExtension.editorClass);	  
//		  			var editor = new constr(tab.domNode);
//					editor.editorID=editorExtension.id;
//					if (!content)
//						content=editor.getDefaultContent();
//					if (!content)
//						content="";
//					editor.setContent(fileName,content);
//					editor.resourceFile=file;
//					tab.editor=editor;
		if (keywordArgs.startLine) {
			tab.editor.select(keywordArgs);
		}
		
		if (!keywordArgs.noSelect)
		{
			davinci.Runtime.arrayAddOnce(davinci.Workbench._state.editors,fileName);
			davinci.Workbench._switchEditor(tab.editor, keywordArgs.startup);
		}
		
		var self = this;
		setTimeout(function(){
			var loadIcon = dojo.query('.dijitTabButtonIcon',tab.controlButton.domNode);
			dojo.removeClass(loadIcon[0],'tabButtonLoadingIcon');
			dojo.addClass(loadIcon[0],'dijitNoIcon');
			tab.resize(); //kludge, forces editor to correct size, delayed to force contents to redraw
		}, 1000);
//}), 10);
		return tab.editor;
	},

	_filename2id: function(fileName)
	{
		return "editor." + fileName.replace(/[\/| |\t]/g, "_")
	},

	_populateShowViewsMenu: function()
	{
		return dojo.map(davinci.Runtime.getExtensions("davinci.view"), function(view){
			return {
				icon: null,
				id: view.id,
				label: view.title,
				menubarPath: "davinci.window/show.view/additions",
				run: function() {
					davinci.Workbench.toggleView(view.id);
				}
			};
		});
	},
	
	_populatePerspectivesMenu: function()
	{
		return dojo.map(davinci.Runtime.getExtensions("davinci.perspective"), function(perspective){
			return {
				icon: null,
				id: perspective.id,
				label: perspective.title,
				menubarPath: "davinci.window/open.perspective/additions",
				run: function() {
					davinci.Workbench.showPerspective(perspective.id);
				}
			};
		});
	},

	createPopup: function(args)
	{
		var partID = args.partID, domNode=args.domNode, 
			context=args.context,
			widgetCallback=args.openCallback;
//			
		var actionSetIDs=[];
		var editorExtensions=davinci.Runtime.getExtension("davinci.actionSetPartAssociations",
				function (extension)
				{
				   for (var i=0;i<extension.parts.length;i++)
					   if (extension.parts[i]==partID)
					   {
						   actionSetIDs.push(extension.targetID);
						   return true;
					   }
				});
		if (actionSetIDs.length>0)
		{
		   var actionSets=davinci.Runtime.getExtensions("davinci.actionSets",
				function (extension)
				{
				   for (var i=0;i<actionSetIDs.length;i++)
					   if (actionSetIDs[i]==extension.id)
					   {
						   return true;
					   }
				});
		   if (actionSets.length>0)
		   {
			   var menuTree=this._createMenuTree(actionSets,true);
			   this._initActionsKeys(actionSets, args);
			   var popup=this._createMenu(menuTree,context);
			   if (popup && domNode) {
				   popup.bindDomNode(domNode);
			   }
			   popup._widgetCallback=widgetCallback;
			   return popup;
		   }
		   
		}
	},
	
	_initActionsKeys: function(actionSets,args)
	{
		var keysDomNode=args.keysDomNode || args.domNode;
		var keys={};
		var wasKey;
		dojo.forEach(actionSets, function(actionSet){
			dojo.forEach(actionSet.actions, function(action){
				if (action.keySequence)
				{
					keys[action.keySequence]=action;
					wasKey=true;
				}
			});
		});
		if (wasKey)
			var context=args.context;
          dojo.connect(keysDomNode, "onkeydown", function (e){
        	  var seq=davinci.Workbench._keySequence(e);
        	  var actionItem=keys[seq];
        	  if (actionItem)
        	  {
					if (actionItem.action.shouldShow && !actionItem.action.shouldShow(context)) {
						return;
					}
					if ( actionItem.action.isEnabled(context)) {
						davinci.Workbench._runAction(actionItem,context);
					}
        	  }
          });

	},
	
	_initKeys: function ()
	{
		var keys={all: []};
		var keyExtensions=davinci.Runtime.getExtensions("davinci.keyBindings");
		dojo.forEach(keyExtensions, function(keyExt){
			var contextID= keyExt.contextID || "all";
			var keyContext=keys[contextID];
			if (!keyContext) {
			  keyContext=keys[contextID]=[];
			}
			
			keyContext[keyExt.sequence]=keyExt.commandID;
		});

		this.keyBindings=keys;
	},

	_keyTable: {
		46: "del",
		114: "f3"
		
	},
	handleKey: function (e)
	{
		if (!this.keyBindings) {
			return;
		}
		var seq=this._keySequence(e);
		var cmd;
		if (this.currentContext && this.keyBindings[this.currentContext])
		{
			cmd=this.keyBindings[this.currentContext][seq];
		}
		if (!cmd) {
			cmd=this.keyBindings['all'][seq];
		}
		if (cmd)
		{
			davinci.Runtime.executeCommand(cmd);
			return true;
		}
		
	},
	
	_keySequence: function (e)
	{
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
			if(e.modifiers)
			{
				if (e.altKey || (e.modifiers % 2))
					seq.push("M3");
			}
			else
			{
				if (e.altKey)
					seq.push("M3");
			}
		}
		
		var letter=String.fromCharCode(e.keyCode);
		if ((letter>='A' && letter<='Z')||(letter>='0' && letter<='9'))
		{
			//letter=e.keyChar;
		}
		else
		{
			letter=this._keyTable[e.keyCode]||"xxxxxxxxxx";
		}
		letter=letter.toUpperCase();
		if (letter==' ') {
			letter="' '";
		}
				
		seq.push(letter);
		seq=seq.join("+");
		return seq;
	},
	

	setActionScope: function(scopeID,scope)
	{
		this.actionScope[scopeID]=scope;
	},
	
	findView: function (viewID)
	{
		var domNode=dijit.byId(viewID);
		if (domNode) {
			return domNode;
		}
	},

	toggleFullScreen: function()
	{

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
/*
				dojo.animateProperty({
					node: mainBodyContainer._right,
					duration: 1000,
					properties: {
						width: {end: 0}
					}
				});

				var anim = dojo.anim(mainBodyContainer._right, {width: 0}, 1000);
				dojo.connect(anim, "onAnimate", function(){
					mainBodyContainer.layout();
				});
*/
			}
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
	
	_switchEditor: function(newEditor, startup)
	{
		var oldEditor = davinci.Runtime.currentEditor;
		davinci.Runtime.currentEditor =newEditor;
		try {
			dojo.publish("/davinci/ui/editorSelected", [{
				editor: newEditor,
				oldEditor: oldEditor
			}]);
		} catch (ex) {console.log(ex);}
		this._updateTitle(newEditor);
		davinci.Workbench._state.activeEditor=newEditor ? newEditor.fileName : null;
	
		if(newEditor && newEditor.focus) newEditor.focus();
		
		if(!startup) {
			davinci.Workbench._updateWorkbenchState();
		}
	},

	_updateTitle: function(currentEditor)
	{
		var newTitle=this._baseTitle;
		if (currentEditor)
		{
			newTitle=newTitle+" - "
			if (currentEditor.isDirty) {
				newTitle=newTitle+"*";
			}
			newTitle=newTitle+currentEditor.fileName;
		}
		dojo.doc.title=newTitle;
	},

	_editorTabClosed: function(page)
	{
		if (page && page.editor)
		{
			if (page.editor.fileName)
			{
				davinci.Runtime.arrayRemove(this._state.editors,page.editor.fileName);
				this._updateWorkbenchState();
			}
		}
		var editors=dijit.byId("editors_tabcontainer").getChildren();
		if (editors.length==0)
		{
			this._switchEditor(null);
			var editorsStackContainer = dijit.byId('editorsStackContainer');
			var editorsWelcomePage = dijit.byId('editorsWelcomePage');
			if (editorsStackContainer && editorsWelcomePage){
				editorsStackContainer.selectChild(editorsWelcomePage);
			}
		}
	},

	_initializeWorkbenchState: function()
	{
		var state= (this._state=davinci.Runtime.serverJSONRequest({
			   url:"./cmd/getWorkbenchState", handleAs:"json",
				   sync:true  }));
		if (state&&state.editors)
		{
			state.version = davinci.version;
			for (var i=0;i<state.editors.length;i++)
			{
				var resource=davinci.resource.findResource(state.editors[i]);
				var noSelect=state.editors[i]!=state.activeEditor;
				if (resource)
				{
					var resourceInfo=resource.getFileInfo();
					davinci.Workbench.openEditor({
						fileName: resource,
						content: resource.getContents(),
						noSelect:noSelect,
						isDirty:resourceInfo.isDirty,
						'startup': false
					});
				}
			}
		}
		else
			this._state={ editors:[], version:davinci.version};
	},

	_updateWorkbenchState: function()
	{
		davinci.Runtime.serverPut(
				{
					url: "./cmd/setWorkbenchState",
					putData: dojo.toJson(this._state),
					handleAs:"json",
					contentType:"text/html"
				});	
	},

	_autoSave: function(){
		
		var lastSave=this._lastAutoSave;
		function saveDirty(editor){
			if (editor.isReadOnly || !editor.isDirty) {
				return;
			}
			
			var modified=editor.lastModifiedTime;
			if (modified && modified>lastSave){
				try {
					editor.save(true);
				}catch(ex){
					console.error("Error while autosaving file:" + ex);
				}
			}
		}
		
		dojo.forEach(this.editorTabs.getChildren(),	function(editor){
			saveDirty(editor);
		});
				
		this._lastAutoSave=new Date().getTime();
	},
	

	_XX_last_member : true	// dummy with no trailing ','
});

dojo.declare("davinci.workbench._PopupMenu", dijit.Menu, {

	menuOpened : function (event)
	{},
	
	_openMyself: function(event){
		this.menuOpened(event);
		var open = undefined;
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
