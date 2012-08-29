define([
	"dojo/_base/declare",
	"davinci/workbench/ViewPart",
	"davinci/Workbench",
	"davinci/Runtime",
	
	"dijit/Tree",
	"dojo/mouse",
	"davinci/ui/dnd/DragSource",
	"davinci/ui/Resource",
	"davinci/ui/widgets/TransformTreeMixin",
	"system/resource",
	"davinci/ui/widgets/ProjectToolbar",
	
	//ui_plugin/js
	"davinci/ui/Download",
	"davinci/ui/DownloadSelected",
	"davinci/ui/UserLibraries",
], function(declare, ViewPart, Workbench, Runtime, Tree, mouse, DragSource) {
	
return declare("davinci.workbench.Explorer", ViewPart, {
	
	toolbarID: "workbench.Explorer",
	getActionsID: function () {
	
		//	return "davinci.ve.VisualEditorOutline";

		return "davinci.workbench.Explorer";
	},
	
	postCreate: function(){
		this.inherited(arguments);

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
		dojo.style(tree.domNode, {width: "100%", "overflow-x": "hidden", position: "absolute", bottom: 0, top: "20px"});

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

		if(Workbench.singleProjectMode()){
			var projectSelection = new davinci.ui.widgets.ProjectToolbar({});
			topDiv.appendChild(projectSelection.domNode);

			dojo.connect(projectSelection, "onChange", function(){
				Workbench.loadProject(this.value);
			});
		}

		topDiv.appendChild(tree.domNode);
		this.setContent(topDiv);
		this.attachToolbar();
		
		tree.startup();

		dojo.connect(tree, 'onDblClick', dojo.hitch(this,this._dblClick ));
		tree.watch("selectedItems", dojo.hitch(this, function (prop, oldValue, newValue) {
			var items = dojo.map(newValue, function(item){ return {resource:item}; });
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
