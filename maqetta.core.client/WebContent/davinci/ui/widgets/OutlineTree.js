define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dijit/Tree",
	"davinci/ve/widget",
	"davinci/ve/States",
	"davinci/ve/commands/StyleCommand",
	"davinci/ui/widgets/_ToggleTreeNode"
], function(declare, connect, Tree, Widget, States, StyleCommand, ToggleTreeNode) {

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
	},

	/* override to allow us to control the nodes*/
	_createTreeNode: function(/*Object*/ args) {
		return new ToggleTreeNode(args);
	},

	/* override to fix dijit tree bug */
	_onItemDelete: function(/*Item*/ item) {
		/*
			So here is the issue - if you delete the last child of an expanded
			tree node, the tree hides the expando icon, but does NOT remove the reference
			to _expandNodeDeferred, which when set assumes it has been or is being expanded.
			Since we removed all children, this is no longer true - any new children
			will have to be recreated, hence we need to delete _expandNodeDeferred.
		*/
		var parent = this._itemNodesMap[item.id][0].getParent();
		var children = parent.item._getChildren();
		if (children.length == 0) {
			delete parent._expandNodeDeferred;
		}
		
		this.inherited(arguments);
	},

	/* sets selection to the passed nodes*/
	selectNode: function(items) {
		var paths = [];

		dojo.forEach(items, dojo.hitch(this, function(item) {
			paths.push(this._createPath(item));
		}));

		// we use the paths attr here
		this.set("paths", paths);
	},

	deselectAll: function() {
		dojo.forEach(this.selectedItems, dojo.hitch(this, function(item) {
				var treeNodes = this.getNodesByItem(item);
				if (treeNodes.length > 0) {
					treeNodes[0].setSelected(false);
				}
		}));
	},

	_userSelect: function() {
		// user has made manual selection changes
		var newSelection = this.selectedItems
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

	_createPath: function(item) {
		var path = [];
		var n = item;

		while (n && n.id != "myapp") {
			path.splice(0, 0, n.id);
			if (!n.getParent()) {
				console.log("no parent?!?!?!")
			}
			n = n.getParent();
		}

		path.splice(0, 0, "myapp");

		return path;
	},

	_connect: function(contextFunction, thisFunction) {
		this._handles.push(connect.connect(this._context, contextFunction, this, thisFunction));
	},

	destroy: function(){
		this._handles.forEach(connect.disconnect);
	}
});

});
