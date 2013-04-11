define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/topic",
	"dojo/_base/array",
	"dojo/touch",
	"dojo/mouse", // mouse.isLeft
	"dojo/dnd/Manager",
	"dijit/Tree",
	"../../Workbench",
	"../../ve/utils/GeomUtils",
	"./_ToggleTreeNode",
], function(declare, connect, Topic, array, touch, mouse, DndManager, Tree, Workbench, GeomUtils, ToggleTreeNode) {

return declare(Tree, {
	postCreate: function() {
		this._handles = [];
		this.toggledItems = {};

		this.inherited(arguments);

		// dndController is setup during Tree::postCreate.  We need to listen to
		// userSelect so we can list to selection changes
		this._handles.push(connect.connect(this.dndController, "userSelect", this, "_userSelect"));

		// Workaround for #13964: Prevent drag/drop from happening when user mouses down on scrollbar
		var mouseDown = this.dndController.onMouseDown;
		this.dndController.onMouseDown = function(e){
			if ((" "+(e.srcElement || e.target).className+" ").indexOf(" dojoDndContainerOver ") != -1) {
				return;
			}

			// if toggle node, don't do anything.
			if (dojo.hasClass(e.target, "dvOutlineToggleNode")) {
				return
			}

			return mouseDown.call(this.dndController, e);
		}.bind(this);

		this._connect("widgetChanged", "_widgetChanged");
		this.connect(this.domNode, touch.press, "_onMouseDown");
		Topic.subscribe("/davinci/ve/context/mouseup", this._contextMouseUp.bind(this));
	},
	

	/* override to allow us to control the nodes*/
	_createTreeNode: function(/*Object*/ args) {
		return new ToggleTreeNode(args);
	},

	/* sets selection to the passed nodes*/
	selectNode: function(items) {
		var paths = items.map(function(item) {
			return this._createPath(this.model._getWidget(item));		
		}, this);

		// we use the paths attr here
		this.set("paths", paths);
	},

	deselectAll: function() {
		dojo.forEach(this.selectedItems, dojo.hitch(this, function(item) {
			var widget = this.model._getWidget(item);

			var treeNodes = this.getNodesByItem(widget);
			if (treeNodes.length > 0) {
				treeNodes[0].setSelected(false);
			}
		}));
	},

	toggleNode: function(item, visible) {
		var widget = this.model._getWidget(item);

		var nodes = this.getNodesByItem(widget);
		if (nodes && nodes.length > 0 && nodes[0]) {
			nodes[0]._setToggleAttr(visible);
		}
	},

	_userSelect: function() {
		// user has made manual selection changes

		// these are are model items, so we need to change them to widgets
		var newSelection = this.selectedItems.map(this.model._getWidget);

		// these are real widgets
		var oldSelection = this.context.getSelection();

		// deselect any olds not in new
		dojo.forEach(oldSelection, dojo.hitch(this, function(item) {
			if (newSelection.indexOf(item) == -1) {
				this.context.deselect(item);
			}
		}));

		// now select news not in old
		dojo.forEach(newSelection, dojo.hitch(this, function(item) {
			if (oldSelection.indexOf(item) == -1) {
				// don't select root
				if (item.id != "myapp") {
					var box = GeomUtils.getMarginBoxPageCoords(item.domNode);
					this.context.getGlobal().scroll(box.l, box.t);
					this.context.select(item, true);
				}
			}
		}));
	},

	_widgetChanged: function(type, widget) {
		if (type === this.context.WIDGET_REPARENTED) {
			// reparenting means we need to reselect it
			this.selectNode(this.context.getSelection());
		}
	},

	_createPath: function(item) {
		var path = [];
		var n = item;

		while (n && n.id != "myapp") {
			path.splice(0, 0, n.id);

			if (n.getParent) {
				n = n.getParent();
			} else {
				n = null;
			} 
		}

		path.splice(0, 0, "myapp");

		return path;
	},

	_onItemDelete: function(item) {
		var model = this.model,
			identity = model.getIdentity(item),
			nodes = this._itemNodesMap[identity];

		// Dojo Tree bug - if we remove a item while children of the item are selected
		// in the tree, bad things happen.  So lets unselect them before removing it.
		var selected = this.dndController.getSelectedTreeNodes();

		var newSelected = [];

		array.forEach(nodes, function(node) {
			array.forEach(selected, function(snode) {
					if (snode.getTreePath().indexOf(node) == -1) {
						// not an decendant
						newSelected.push(node.item)
					}
			}, this);
		}, this);

		this.set("selectedItems", newSelected);

		/* Dojo bug here.  If we remove a tree node, the cached version of the node
		   (_itemNodesMap) is removed.  However, if the tree node has children, those
		   nodes get destroyed but not removed from the cache (_itemNodesMap).  So
		   manually do that here.
		   
		   TODO: remove in Dojo 2.0 which will fix this
		 */
		array.forEach(nodes, function(node) {
			array.forEach(node.getDescendants(), function(treenode) {
					var id = treenode.getIdentity(treenode.item);
					delete this._itemNodesMap[id];
			}, this);
		}, this);
				
		this.inherited(arguments);
	},

	_onMouseDown: function(e) {
		// if right click, select the node.  Dojo's tree blocks right click selecting
		if(!mouse.isLeft(e)) {
			var w = dijit.getEnclosingWidget(e.target);

			if (w && w.item) {
				e.preventDefault();
				this.selectNode([w.item]);
				this._userSelect();
			}
		}
	},

	_onDblClick: function(/*TreeNode*/ nodeWidget, /*Event*/ e) {
		// Double click means open inline editor.  We have to do this here because
		// onDblClick() is called before the treeNode is focused.  So we run into
		// a timing isssue where the dialog is shown and then hidden when the treeNode
		// gets focus.
		this.inherited(arguments);

		var c = Workbench.getOpenEditor().getContext();
		if (c) {
			c.select(this.model._getWidget(nodeWidget.item), null, true); // display inline
		}
	},

	_connect: function(contextFunction, thisFunction) {
		this._handles.push(connect.connect(this.context, contextFunction, this, thisFunction));
	},

	destroy: function(){
		this._handles.forEach(connect.disconnect);
	},
	
	/** 
	 * This gets called whenever there is a mouseUp over the canvas.
	 * If an Outline palette DND operation is active, cancel it.
	 * (See http://dojotoolkit.org/reference-guide/1.8/dojo/dnd.html#dojo-dnd
	 * and search for "stopDrag" to see why that code below is the way it is.)
	 */
	_contextMouseUp: function(e) {
		if(this.dndController.isDragging){
			Topic.publish("/dnd/cancel");
			var manager = DndManager.manager();
			manager.stopDrag();
		}
	}
});

});
