define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/touch",
	"dojo/mouse", // mouse.isLeft
	"dijit/Tree",
	"davinci/ve/widget",
	"davinci/ve/States",
	"davinci/Workbench",
	"davinci/ve/commands/StyleCommand",
	"davinci/ui/widgets/_ToggleTreeNode",
], function(declare, connect, touch, mouse, Tree, Widget, States, Workbench, StyleCommand, ToggleTreeNode) {

return declare("davinci.ui.widget.OutlineTree", Tree, {
	// args
	context: null,

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
	},

	/* override to allow us to control the nodes*/
	_createTreeNode: function(/*Object*/ args) {
		return new ToggleTreeNode(args);
	},

	/* sets selection to the passed nodes*/
	selectNode: function(items) {
		var paths = [];

		dojo.forEach(items, dojo.hitch(this, function(item) {
			var widget = this.model._getWidget(item);
			paths.push(this._createPath(widget));
		}));

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
		var newSelection = [];
		dojo.forEach(this.selectedItems, dojo.hitch(this, function(item) {
				newSelection.push(this.model._getWidget(item));
		}));

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
	}
});

});
