define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dijit/Tree",
	"davinci/ve/widget",
	"davinci/ve/States",
	"davinci/ve/commands/StyleCommand",
	"davinci/ui/widgets/_ToggleTreeNode"
], function(declare, connect, Tree, Widget, States, StyleCommand, ToggleTreeNode) {

declare("davinci.ui.widget.OutlineTreeModel", null, {
	useRichTextLabel: true,
	toggleMode: true,
	betweenThreshold: 4,
	
	_context: null,

	constructor: function(context) {
		this._context = context;
		this._handles = [];

		this._connect("activate", "_rebuild");
		this._connect("setSource", "_rebuild");
		this._connect("widgetChanged", "_widgetChanged");
	},

	getRoot: function(onItem, onError) {
		onItem(this._context.rootWidget || {id: "myapp", label:"application"});
	},

	getLabel: function(item) {
		if (item.id == "myapp") {
			return this._context.model.fileName;
		}

		if (item.isWidget) {
			label = Widget.getLabel(item);
			return label;
		}

		var type = item.type;

		if (!type) {
			return;
		}
		
		var lt = this.useRichTextLabel ? "&lt;" : "<";
		var gt = this.useRichTextLabel ? "&gt;" : ">";

		if (type.indexOf("html.") === 0) {
			label = lt + type.substring("html.".length) + gt;
		} else if (type.indexOf("OpenAjax.") === 0) {
			label = lt + type.substring("OpenAjax.".length) + gt;
		} else if (type.indexOf(".") > 0 ) {
			label = type.substring(type.lastIndexOf(".")+1);
		} else {
			label = item.label || type;
		}
		
		var widget = Widget.byId(item.id, this._context.getDocument());
		if (widget) {
			var id = widget.getId();
			if (id ) {
				label += " id=" + id;
			}
		}
		return label;
	},

	_getChildren: function(item) {
		var widgets, children=[];

		if (!this._context.rootWidget || item.type == "state" || item.type == 'html.stickynote' || item.type == 'html.richtext') {
			return [];
		}

		if (item.id == "myapp") {
			widgets = this._context.getTopWidgets();
		} else if (item === this._context.rootNode) {
			widgets = this._context.getTopWidgets();
		} else {
			widgets = item.getChildren();
		}

		dojo.forEach(widgets, function(widget) {
			if (widget.getContext && widget.getContext() && !widget.internal) {
				// managed widget only
				children.push(widget);
			}
		});

		return children;
	},
	
	mayHaveChildren: function(item) {
		if (item && item.type && item.type.indexOf("OpenAjax.") === 0) {
			return false;
		}

		return this._getChildren(item).length > 0;
	},

	getIdentity: function(item){
		return item.id;
	},

	getChildren: function(item, onComplete, onError) {
		onComplete(this._getChildren(item));
	},

	put: function(item, options) {
		var parent = item.getParent();

		this.onChildrenChange(parent, this._getChildren(parent));

		return this.getIdentity(item);
	},

	add: function(item, options) {
		(options = options || {}).overwrite = false;
		return this.put(item, options);
	},

	remove: function(item) {
		this.onDelete(item);
	},

	onChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){
	},

	_rebuild: function() {
		if (this._skipRefresh) { return; }

		var node = this._context.rootNode;

		if (node) {	// shouldn't be necessary, but sometime is null
			this.onChildrenChange(node, this._getChildren(node));
		}
	},

	_widgetChanged: function(type, widget) {
		if (type === this._context.WIDGET_ADDED) {
			this.add(widget);
		} else if (type === this._context.WIDGET_REMOVED) {
			this.remove(widget);
		} else if (type === this._context.WIDGET_MODIFIED) {
			this.onChange(widget);
		}
	},

	// toggle code
	toggle: function(widget, on, node) {
		var helper = widget.getHelper();
		var continueProcessing = true;
		if(helper && helper.onToggleVisibility){
			//FIXME: Make sure that helper functions deals properly with CommandStack and undo
			continueProcessing = helper.onToggleVisibility(widget, on);
		}
		if(continueProcessing){
			this._toggle(widget, on, node);
			return true;
		}else{
			return false;
		}
	},
	
	_toggle: function(widget, on, node) {
		var visible = !on;
		var value = visible ? "" : "none";
		var command = new StyleCommand(widget, [{"display": value}], 'current');
		this._context.getCommandStack().execute(command);
	},

	shouldShowElement: function(elementId, item) {
		if (elementId == "toggleNode") {
			return (item.type != "states" && item.id != "myapp");
		}
		return true;
	},

	_getToggledItemsAttr: function(){
		var items = [];
		for(var i in this.toggledItems){
			items.push(i);
		}
		return items; // dojo.data.Item[]
	},

	isToggleOn: function(item) {
		return !States.isVisible(item.domNode);
	},
	// end toggle code

	_connect: function(contextFunction, thisFunction) {
		this._handles.push(connect.connect(this._context, contextFunction, this, thisFunction));
	},

	destroy: function(){
		this._handles.forEach(connect.disconnect);
	}
});

return declare("davinci.ui.widget.OutlineTree", Tree, {
	// args
	context: null,

	postCreate: function() {
		this._handles = [];
		this.toggledItems = {};

		this.model = new davinci.ui.widget.OutlineTreeModel(this.context);

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
