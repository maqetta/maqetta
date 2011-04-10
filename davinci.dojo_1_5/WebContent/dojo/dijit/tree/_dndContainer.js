dojo.provide("dijit.tree._dndContainer");
dojo.require("dojo.dnd.common");
dojo.require("dojo.dnd.Container");

dojo.declare("dijit.tree._dndContainer",
	null,
	{

		// summary:
		//		This is a base class for `dijit.tree._dndSelector`, and isn't meant to be used directly.
		//		It's modeled after `dojo.dnd.Container`.
		// tags:
		//		protected

		/*=====
		// current: DomNode
		//		The currently hovered TreeNode.rowNode (which is the DOM node
		//		associated w/a given node in the tree, excluding it's descendants)
		current: null,
		=====*/

		constructor: function(tree, params){
			// summary:
			//		A constructor of the Container
			// tree: Node
			//		Node or node's id to build the container on
			// params: dijit.tree.__SourceArgs
			//		A dict of parameters, which gets mixed into the object
			// tags:
			//		private
			this.tree = tree;
			this.node = tree.domNode;	// TODO: rename; it's not a TreeNode but the whole Tree
			dojo.mixin(this, params);

			// class-specific variables
			this.map = {};
			this.current = null;	// current TreeNode's DOM node

			// states
			this.containerState = "";
			dojo.addClass(this.node, "dojoDndContainer");

			// set up events
			this.events = [
				// container level events
				dojo.connect(this.node, "onmouseenter", this, "onOverEvent"),
				dojo.connect(this.node, "onmouseleave",	this, "onOutEvent"),

				// switching between TreeNodes
				dojo.connect(this.tree, "_onNodeMouseEnter", this, "onMouseOver"),
				dojo.connect(this.tree, "_onNodeMouseLeave", this, "onMouseOut"),

				// cancel text selection and text dragging
				dojo.connect(this.node, "ondragstart", dojo, "stopEvent"),
				dojo.connect(this.node, "onselectstart", dojo, "stopEvent")
			];
		},

		getItem: function(/*String*/ key){
			// summary:
			//		Returns the dojo.dnd.Item (representing a dragged node) by it's key (id).
			//		Called by dojo.dnd.Source.checkAcceptance().
			// tags:
			//		protected

			var node = this.selection[key],
				ret = {
					data: dijit.getEnclosingWidget(node),
					type: ["treeNode"]
				};

			return ret;	// dojo.dnd.Item
		},

		destroy: function(){
			// summary:
			//		Prepares this object to be garbage-collected

			dojo.forEach(this.events, dojo.disconnect);
			// this.clearItems();
			this.node = this.parent = null;
		},

		// mouse events
		onMouseOver: function(/*TreeNode*/ widget, /*Event*/ evt){
			// summary:
			//		Called when mouse is moved over a TreeNode
			// tags:
			//		protected
			this.current = widget.rowNode;
			this.currentWidget = widget;
		},

		onMouseOut: function(/*TreeNode*/ widget, /*Event*/ evt){
			// summary:
			//		Called when mouse is moved away from a TreeNode
			// tags:
			//		protected
			this.current = null;
			this.currentWidget = null;
		},

		_changeState: function(type, newState){
			// summary:
			//		Changes a named state to new state value
			// type: String
			//		A name of the state to change
			// newState: String
			//		new state
			var prefix = "dojoDnd" + type;
			var state = type.toLowerCase() + "State";
			//dojo.replaceClass(this.node, prefix + newState, prefix + this[state]);
			dojo.removeClass(this.node, prefix + this[state]);
			dojo.addClass(this.node, prefix + newState);
			this[state] = newState;
		},

		_addItemClass: function(node, type){
			// summary:
			//		Adds a class with prefix "dojoDndItem"
			// node: Node
			//		A node
			// type: String
			//		A variable suffix for a class name
			dojo.addClass(node, "dojoDndItem" + type);
		},

		_removeItemClass: function(node, type){
			// summary:
			//		Removes a class with prefix "dojoDndItem"
			// node: Node
			//		A node
			// type: String
			//		A variable suffix for a class name
			dojo.removeClass(node, "dojoDndItem" + type);
		},

		onOverEvent: function(){
			// summary:
			//		This function is called once, when mouse is over our container
			// tags:
			//		protected
			this._changeState("Container", "Over");
		},

		onOutEvent: function(){
			// summary:
			//		This function is called once, when mouse is out of our container
			// tags:
			//		protected
			this._changeState("Container", "");
		}
});
