define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/dom-construct",
	"davinci/workbench/ViewPart",
	"davinci/Workbench",
	"davinci/Runtime",
	
	"dijit/registry",
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dijit/DropDownMenu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/Tree",
	"dojo/mouse",
	"system/resource",
	"davinci/ui/dnd/DragSource",
	"davinci/ui/Resource",
	"davinci/ui/widgets/TransformTreeMixin",
	"davinci/ui/widgets/ProjectToolbar",
	"davinci/ui/NewProjectTemplate",
	"davinci/ui/ManageProjectTemplates",
	"davinci/ui/Rename",
	
	//ui_plugin/js
	"davinci/ui/Download",
	"davinci/ui/DownloadSelected",
	"davinci/ui/UserLibraries",
	"dojo/i18n!davinci/ve/nls/common",
    "dojo/i18n!davinci/ui/nls/ui"
	
], function(declare, domClass, domConstruct, ViewPart, Workbench, Runtime, registry, Button, DropDownButton, DropDownMenu, MenuItem, MenuSeparator,
		Tree, mouse, systemResource, DragSource, Resource, TransformTreeMixin, ProjectToolbar, 
		NewProjectTemplate, ManageProjectTemplates, Rename, Download, DownloadSelected, UserLibraries, commonNls, uiNLS) {
	
return declare("davinci.workbench.Explorer", ViewPart, {
	
	toolbarID: "workbench.Explorer",
	getActionsID: function () {
	
		//	return "davinci.ve.VisualEditorOutline";

		return "davinci.workbench.Explorer";
	},
	
	postCreate: function(){
		this.inherited(arguments);
		
		domClass.add(this.toolbarDiv, "ExplorerToolbar");

		var dragSources=Runtime.getExtensions("davinci.dnd", function (extension){
			 return dojo.some(extension.parts,function(item){ return item=="davinci.ui.navigator"; }) && extension.dragSource;
		});
		
		var model= system.resource;

		// Patch Tree to allow for image drag-and-drop
		// TODO: Would be better and more efficient to make use of the dijit.Tree drag-and-drop with dojo.dnd,
		// but it does not seem to perform well over an IFRAME and would require some reworking of the drag source and target.
		var imageDragTree = declare(Tree, {
			_createTreeNode: function(args){
				var treeNode = this.inherited(arguments);
		 		if (dragSources && args.item){
					dragSources.forEach(function(source){
						if (source.dragSource(args.item)){
							var ds = new DragSource(treeNode.domNode, "component", treeNode);
							ds.targetShouldShowCaret = true;
							ds.returnCloneOnFailure = false;
							require([source.dragHandler], function(dragHandlerClass) {
								ds.dragHandler = new dragHandlerClass(args.item);
				                this.connect(ds, "initDrag", function(e){if (ds.dragHandler.initDrag) ds.dragHandler.initDrag(e);}); // move start
								this.connect(ds, "onDragStart", function(e){ds.dragHandler.dragStart(e);}); // move start
								this.connect(ds, "onDragEnd", function(e){ds.dragHandler.dragEnd(e);}); // move end								
							}.bind(this));
						}
			 		}, this);
		 		}
				return treeNode;
			}
		});
		var tree = this.tree = new imageDragTree({
			showRoot: false,
			persist: false,
			cookieName: 'maqExplorer',
			model: model,
			id:'resourceTree',
			labelAttr: "name", childrenAttrs:"children",
			getIconClass: davinci.ui.Resource.getResourceIcon,
			getRowClass: davinci.ui.Resource.getResourceClass,
			transforms: [system.resource.alphabeticalSort],
			isMultiSelect: true});

		// Because there are two child elements in this layout container, and it only sizes the top (topDiv), we have to manage the size of the children
		// ourselves (or use yet another layout container to do it)  We'll just use CSS to fix the bottom of the Tree to the bottom of the panel,
		// using a variation of the 4-corners CSS trick.  An additional kludge seems necessary to set the Tree width properly to account for the scrollbar.
		dojo.style(tree.domNode, {width: "100%", "overflow-x": "hidden", position: "absolute", bottom: 0, top: "7px"});

		// The default tree dndController does a stopEvent in its mousedown handler, preventing us from doing our own DnD.
		// Circumvent dojo.stopEvent temporarily.
		var down = tree.dndController.onMouseDown,
			handler = function(oldHandler, event){
				// right clicking does not select in dojo tree, so lets do it ourselves
				if (mouse.isRight(event)) {
					var w = dijit.getEnclosingWidget(event.target);

					// if not in select select the node
					if (this.tree.get("selectedItems").indexOf(w.item) === -1) {
						this.tree.set("selectedItems", [w.item]);
					}
				}

				var stop = dojo.stopEvent;
				dojo.stopEvent = function(){};
				try{
					oldHandler.call(tree.dndController, event);
				}finally{
					dojo.stopEvent = stop;	
				}
			};

		tree.dndController.onMouseDown = dojo.hitch(null, handler, down);
		
		var topDiv = dojo.doc.createElement('div');
		topDiv.appendChild(tree.domNode);
		this.setContent(topDiv);
		this.attachToolbar();
		
		tree.startup();

		dojo.connect(tree, 'onDblClick', dojo.hitch(this,this._dblClick ));
		tree.watch("selectedItems", dojo.hitch(this, function (prop, oldValue, newValue) {
			var items = dojo.map(newValue, function(item){ return {resource:item}; });
			this._updateToolbarIcons(items);
			this.publish("/davinci/ui/selectionChanged", [items, this]);
		}));

		Workbench.createPopup({
			partID: 'davinci.ui.navigator',
			domNode: this.tree.domNode,
			openCallback:function (event)
			{
				// Make sure corresponding node on the Tree is set, as needed for right-mouse clicks (ctrl-click selects just fine)
				var w = dijit.getEnclosingWidget(event.target);
				if(w && w.item){
					var nodes = tree.get("selectedNodes");
					if(dojo.indexOf(nodes, w) == -1) {
						tree.set("selectedNodes", [w]);
					}
				}
			}
		});
		
		var o = Workbench.getActionSets("davinci.ui.navigator");
		var actions = o.clonedActionSets;
		if (actions) {
			dojo.forEach(actions[0].actions, dojo.hitch(this, function(action) {
					if (action.keyBinding) {
						if (!this.keyBindings) {
							this.keyBindings = [];
						}

						this.keyBindings.push({keyBinding: action.keyBinding, action: action});
					}
			}));
		}

		dojo.connect(tree.domNode, "onkeypress", this, "_onKeyPress");
	},

	/**
	 * Subclass toolbar logic in parent class _ToolbaredContainer
	 * so that we can supplement the standard buttons (from ui.plugin.js) with
	 * additional UI, particularly project-related UI.
	 */
	attachToolbar: function(){
		//FIXME: Need to move project-related UI into here.
		this.inherited(arguments);
		var projectRowDiv = dojo.doc.createElement("div");
		projectRowDiv.className = "explorerHeaderProjectDiv";
		var table = dojo.doc.createElement("table");
		table.className = "explorerHeaderProjectTable";
		projectRowDiv.appendChild(table);
		var tr = dojo.doc.createElement("tr");
		table.appendChild(tr);
		var td0 = domConstruct.create("td", {"class":"explorerHeaderProjectCol0", innerHTML:uiNLS.projectColon});
		tr.appendChild(td0);
		var td1 = domConstruct.create("td", {"class":"explorerHeaderProjectCol1"});
		tr.appendChild(td1);
		var td2 = domConstruct.create("td", {"class":"explorerHeaderProjectCol2"});
		tr.appendChild(td2);

		var projectSelection = new davinci.ui.widgets.ProjectToolbar({});
		
		td1.appendChild(projectSelection.domNode);
		var firstChild = this.toolbarDiv.children[0];
		this.toolbarDiv.insertBefore(projectRowDiv, firstChild);

		dojo.connect(projectSelection, "onChange", function(){
			Workbench.loadProject(this.value);
		});
		
		var button = new Button({
			"class":"ExplorerNewProjectButton",
			iconClass:"ExplorerNewProjectIcon",
			title:uiNLS.createProject,
		    showLabel: false,
			onClick: function(){
				require(['davinci/ui/Resource'], function(r) {
					r.newProject();
				});
		    }.bind(this)
		});
		td2.appendChild(button.domNode);
		var menu = new DropDownMenu({ style: "display: none;"});
		menu.addChild(new MenuItem({
			id: 'ExplorerCreateProject',
			label: uiNLS.createProjectMenuItem,
			iconClass: "",
			onClick: function(){
				require(['davinci/ui/Resource'], function(r) {
					r.newProject();
				});
		    }.bind(this)
		}));
		menu.addChild(new MenuItem({
			id: 'ExplorerDeleteProject',
			label: uiNLS.deleteProjectMenuItem,
			iconClass: "",
			onClick: function(){
				this._deleteProject();
		    }.bind(this)
		}));
		menu.addChild(new MenuItem({
			id: 'ExplorerRenameProject',
			label: uiNLS.renameProjectMenuItem,
			iconClass: "",
			onClick: function(){
				this._renameProject();
		    }.bind(this)
		}));
		menu.addChild(new MenuSeparator());
		menu.addChild(new MenuItem({
			id: 'ExplorerSaveAsProjectTemplate',
			label: uiNLS.saveAsProjectTemplateMenuItem,
			iconClass: "",
			onClick: function(){
				var NewProjectTemplateDialog = new NewProjectTemplate({});
				Workbench.showModal(NewProjectTemplateDialog, uiNLS.saveAsProjectTemplate, {width:'330px'}, null, true);
		    }.bind(this)
		}));
		menu.addChild(new MenuItem({
			id: 'ExplorerManageProjectTemplates',
			label: uiNLS.manageProjectTemplatesMenuItem,
			iconClass: "",
			onClick: function(){
				var ManageProjectTemplatesDialog = new ManageProjectTemplates({});
				Workbench.showModal(ManageProjectTemplatesDialog, uiNLS.manageProjectTemplates, {}, null, true, 
					// onShow() callback - the ManageProjectTemplates widget needs to do some
					// housekeeping that is only possible when the dialog is actually showing
					function(){
						ManageProjectTemplatesDialog.onShow.call(ManageProjectTemplatesDialog);
					}
				);
		    }.bind(this)
		}));
		/*FIXME: Commenting out Modify Libraries feature because feature has too many bugs.
		menu.addChild(new MenuSeparator());
		menu.addChild(new MenuItem({
			id: 'userlibs',
			label: uiNLS.modifyLibrariesMenuItem,
			iconClass: "userLibIcon",
			onClick: function(){
                require(['davinci/Workbench', 'davinci/ui/UserLibraries'],
                        function(workbench, UserLibraries) {
                            workbench.showModal(new UserLibraries(), uiNLS.modifyLibraries, "width: 400px");
                        }
                    );
		    }.bind(this)
		}));
		*/
		var button = new DropDownButton({
			"class":"ExplorerDropDownButton",
			iconClass:"ExplorerDropDownIcon",
			title:uiNLS.ProjectMenu,
		    showLabel: false,
		    dropDown: menu
		});
		td2.appendChild(button.domNode);
	},
	
	_updateToolbarIcons: function(items){
		var anyReadonly = false;
		for(var i=0; i<items.length; i++){
			var resource = items[i].resource;
			if(!resource){
				return;
			}
			if(resource.readOnly()){
				anyReadonly = true;
			}
		}
		var deleteButtonSpan = document.querySelector('.FilesToolbarDeleteFile');
		var deleteButtonWidget = registry.byNode(deleteButtonSpan);
		var deleteButtonNode = document.querySelector('.FilesToolbarDeleteFileIcon');
		if(deleteButtonWidget && deleteButtonNode){
			if(anyReadonly || items.length == 0){
				domClass.add(deleteButtonNode, 'FilesToolbarDeleteFileIconDisabled');
				deleteButtonWidget.set("disabled", true);
			}else{
				domClass.remove(deleteButtonNode, 'FilesToolbarDeleteFileIconDisabled');
				deleteButtonWidget.set("disabled", false);
			}
		}
		var renameButtonSpan = document.querySelector('.FilesToolbarRenameFile');
		var renameButtonWidget = registry.byNode(renameButtonSpan);
		var renameButtonNode = document.querySelector('.FilesToolbarRenameFileIcon');
		if(renameButtonWidget && renameButtonNode){
			if(anyReadonly || items.length != 1){
				domClass.add(renameButtonNode, 'FilesToolbarRenameFileIconDisabled');
				renameButtonWidget.set("disabled", true);
			}else{
				domClass.remove(renameButtonNode, 'FilesToolbarRenameFileIconDisabled');
				renameButtonWidget.set("disabled", false);
			}
		}
	},
	
	_deleteProject: function(){
		var allProjects = null;
		systemResource.listProjects(function(projects){
			allProjects = projects.map(function(project){ return project.name; });
		}.bind(this));
		if(!allProjects || allProjects.length < 2){
			alert(uiNLS.deleteOnlyProjectError);
			return;
		}
		var changeToProject = null;
		var project = Workbench.getProject();
		var found = false;
		// Choose project before current project if there is one
		// else next project
		for(var i=0;i<allProjects.length;i++){
			if(allProjects[i]==project) {
				found = true;
				if(changeToProject){
					break;
				}
			}else{
				changeToProject = allProjects[i];
				if(found){
					break;
				}
			}
		}
		
		//Make the user confirm
		var confirmString = dojo.string.substitute(uiNLS.areYouSureDeleteProject, [project]);
		confirmString += "\n\n" + uiNLS.NoteOperationNotUndoable + "\n";
		if(!confirm(confirmString)){
	    	return;
	    }
		
		var resource = systemResource.findResource(project);
		resource.deleteResource().then(function(){
			Workbench.loadProject(changeToProject);
		});
	},
	
	_renameProject: function(){
		var oldProject = Workbench.getProject();
		var allProjects = null;
		systemResource.listProjects(function(projects){
			allProjects = projects.map(function(project){ return project.name; });
		}.bind(this));
		var renameDialog = new Rename({value:oldProject, invalid: allProjects});
		
		Workbench.showModal(renameDialog, uiNLS.renameProjectDialogTitle, {height:110, width: 200},function(){
			
			var cancel = renameDialog.get("cancel");
			if(!cancel){
				var newName = renameDialog.get("value");
				if(newName == oldProject) {
					return;
				}

				var resource = systemResource.findResource(oldProject);
				resource.rename(newName).then(function(){
					Workbench.loadProject(newName);						
				});
			}

			return true;
		});
	},

	destroy: function(){
		this.inherited(arguments);
	},
	
	_dblClick: function(node) {
		if (node.elementType=="File") {
			Workbench.openEditor({
				fileName: node,
				content: node.getText(),
				isDirty:node.isDirty()
			});
		}
	},

	_onKeyPress: function(e) {
		var stopEvent = dojo.some(this.keyBindings, dojo.hitch(this, function(binding) {
			if (Runtime.isKeyEqualToEvent(binding.keyBinding, e)) {
				davinci.Workbench._runAction(binding.action);
				return true;
			}
		}));

		if (stopEvent) {
			dojo.stopEvent(e);
		}

		return stopEvent;
	}
});
});
