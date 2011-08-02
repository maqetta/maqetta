dojo.provide("davinci.workbench.Explorer");

dojo.require("davinci.Workbench");
dojo.require("davinci.workbench.ViewPart");

dojo.require("dijit.Tree");
dojo.require("davinci.ui.widgets.TransformTreeMixin");
dojo.require("davinci.ui.dnd.DragSource");
dojo.require("davinci.resource");
dojo.require("davinci.ui.widgets.ProjectSelection");

dojo.declare("davinci.workbench.Explorer", davinci.workbench.ViewPart, {
	
	toolbarID: "workbench.Explorer",
	getActionsID: function () {
	
		//	return "davinci.ve.VisualEditorOutline";

		return "davinci.workbench.Explorer";
	},
	
	postCreate: function(){
		this.inherited(arguments);

		var dragSources=davinci.Runtime.getExtensions("davinci.dnd", function (extension){
			 return dojo.some(extension.parts,function(item){ return item=="davinci.ui.navigator"; }) && extension.dragSource;
		});
		
		var model= davinci.resource;

		// Patch Tree to allow for image drag-and-drop.  code moved from davinci.ui.widget.Tree.
		// TODO: Would be better and more efficient to make use of the dijit.Tree drag-and-drop with dojo.dnd,
		// but it does not seem to perform well over an IFRAME and would require some reworking of the drag source and target.
		var imageDragTree = dojo.declare("", dijit.Tree, { //FIXME: why won't null work as first arg to dojo.declare?
			_createTreeNode: function(args){
				var treeNode = this.inherited(arguments);
		 		if (dragSources && args.item){
					dragSources.forEach(function(source){
						if (source.dragSource(args.item)){
							var ds = new davinci.ui.dnd.DragSource(treeNode.domNode, "component", treeNode);
							ds.targetShouldShowCaret = true;
							ds.returnCloneOnFailure = false;
							dojo["require"](source.dragHandler);
							var dragHandlerClass = dojo.getObject(source.dragHandler); 
							ds.dragHandler = new dragHandlerClass(args.item);
			                this.connect(ds, "initDrag", function(e){if (ds.dragHandler.initDrag) ds.dragHandler.initDrag(e);}); // move start
							this.connect(ds, "onDragStart", function(e){ds.dragHandler.dragStart(e);}); // move start
							this.connect(ds, "onDragEnd", function(e){ds.dragHandler.dragEnd(e);}); // move end
						}
			 		}, this);
		 		}
				return treeNode;
			}
		});
		var tree = this.tree = new imageDragTree({
			showRoot:false,
			model: model, id:'resourceTree',
			labelAttr: "name", childrenAttrs:"children",
			getIconClass: this._getIconClass,
			transforms: [davinci.resource.alphabeticalSort],
			isMultiSelect: true});
		
		/* @peller help!  how do i make these things flow without manually width/height=100%?  If i dont, scroll bars wont show up.
		 * 
		 */
		tree.domNode.style.height='100%';
		tree.domNode.style.width='100%';
		// the default tree dndController does a stopEvent in its mousedown handler, preventing us from doing our own DnD.
		var handler = tree.dndController.onMouseDown;
		tree.dndController.onMouseDown = function(event){
			var stop = dojo.stopEvent;
			dojo.stopEvent = function(){};
			handler.call(tree.dndController, event);
			dojo.stopEvent = stop;	
		};

		
		var topDiv = dojo.doc.createElement('div');
		
		/* is there a better way to get scroll besides setting height to 100%? */
		topDiv.style.height='100%';
		if(davinci.Runtime.singleProjectMode()){
			var projectSelection = new davinci.ui.widgets.ProjectSelection({});
			topDiv.appendChild(projectSelection.domNode);
			tree.domNode.style.height='100%';
			dojo.connect(projectSelection, "onChange", function(){
				var project = this.value;
				davinci.Runtime.loadProject(project);
			});
			
			
		}
		topDiv.appendChild(tree.domNode);
		this.setContent(topDiv);
		
		tree.startup();

		dojo.connect(tree, 'onDblClick', dojo.hitch(this,this._dblClick ));
		tree.watch("selectedItems", dojo.hitch(this, function (prop, oldValue, newValue) {
			var items = dojo.map(newValue, function(item){ return {resource:item}; });
			this.publish("/davinci/ui/selectionChanged", [items, this]);
		}));

		var popup=davinci.Workbench.createPopup({
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
			}});
	},

	destroy: function(){
		this.inherited(arguments);
	},
	
	_dblClick: function(node)
	{
		if (node.elementType=="File")
		{
			davinci.Workbench.openEditor({
				fileName: node,
				content: node.getText()
			});
		}
	},
	
	_getIconClass: function(item, opened){
		
		var readOnly = "";
		if(item.readOnly){
			readOnly = " readOnlyResource";
		}
		
		if (item.elementType=="Folder"){
			return (opened ? "dijitFolderOpened" : "dijitFolderClosed") + readOnly;
		}
		if (item.elementType=="File"){
			var icon;
			var fileType=item.getExtension();
			var extension=davinci.Runtime.getExtension("davinci.fileType", function (extension){
				return extension.extension==fileType;
			});
			if (extension){
				icon=extension.iconClass + readOnly;
			}
			return icon ||	("dijitLeaf" + readOnly);
		}
		return "dijitLeaf" + readOnly;
	}
});