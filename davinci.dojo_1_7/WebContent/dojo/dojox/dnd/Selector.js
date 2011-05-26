dojo.provide("dojox.dnd.Selector");

dojo.require("dojo.dnd.Selector");

dojo.declare(
	"dojox.dnd.Selector",
	dojo.dnd.Selector,
	{
		isSelected: function(node){
			//	summary:
			//		checks if node is selected
			//	node: String|DomNode:
			//		Node to check (id or DOM Node)
			var id = dojo.isString(node) ? node : node.id,
				item = this.getItem(id);
			return item && this.selected[id];	// Boolean
		},
		
		selectNode: function(node, add){
			//	summary:
			//		selects a node
			//	node: String|DomNode:
			//		Node to select (id or DOM Node)
			//	add: Boolean?:
			//		If true, node is added to selection, otherwise current
			//		selection is removed, and node will be the only selection.
			if(!add){
				this.selectNone();
			}
			var id = dojo.isString(node) ? node : node.id,
				item = this.getItem(id);
			if(item){
				this._removeAnchor();
				this.anchor = dojo.byId(node);
				this._addItemClass(this.anchor, "Anchor");
				this.selection[id] = 1;
				this._addItemClass(this.anchor, "Selected");
			}
			return this;	// self
		},
		
		deselectNode: function(node){
			//	summary:
			//		deselects a node
			//	node: String|DomNode:
			//		Node to deselect (id or DOM Node)
			var id = dojo.isString(node) ? node : node.id,
				item = this.getItem(id);
			if(item && this.selection[id]){
				if(this.anchor === dojo.byId(node)){
					this._removeAnchor();
				}
				delete this.selection[id];
				this._removeItemClass(this.anchor, "Selected");
			}
			return this;	// self
		},
		
		selectByBBox: function(left, top, right, bottom, add) {
			//	summary:
			//		selects nodes by bounding box
			//	left: Number:
			//		Left coordinate of the bounding box
			//	top: Number:
			//		Top coordinate of the bounding box
			//	right: Number:
			//		Right coordinate of the bounding box
			//	bottom: Number:
			//		Bottom coordinate of the bounding box
			//	add: Boolean?:
			//		If true, node is added to selection, otherwise current
			//		selection is removed, and node will be the only selection.

			// user has drawn a bounding box ... time to see whether any dom nodes
			// in this container satisfy the bounding box range.
			if(!add){
				this.selectNone();
			}
			this.forInItems(function(data, id){
				var node = dojo.byId(id);
				if(node && this._isBoundedByBox(node, left, top, right, bottom)){
					this.selectNode(id, true);
				}
			}, this);
			return this;	// self
		},
		
		_isBoundedByBox: function(node, left, top, right, bottom) {
			//	summary:
			//		figures out whether certain coodinates bound a particular
			//		dom node.
			//	node: String|DomNode:
			//		Node to check (id or DOM Node)
			//	left: Number:
			//		Left coordinate of the bounding box
			//	top: Number:
			//		Top coordinate of the bounding box
			//	right: Number:
			//		Right coordinate of the bounding box
			//	bottom: Number:
			//		Bottom coordinate of the bounding box
			var c = dojo.coords(node), t;
			// normalize input
			if(left > right){
				t = left;
				left = right;
				right = t;
			}
			if(top > bottom){
				t = top;
				top = bottom;
				bottom = t;
			}
			return c.x >= left && c.x + c.w <= right && c.y >= top && c.y + c.h <= bottom;	// Boolean
		},
		
		shift: function(toNext, add) {
			//	summary:
			//		shifts the currently selected dnd item forwards and backwards.
			//		One possible use would be to allow a user select different
			//		dnd items using the right and left keys.
			//	toNext: Boolean:
			//		If true, we select the next node, otherwise the previous one.
			//	add: Boolean?:
			//		If true, add to selection, otherwise current selection is
			//		removed before adding any nodes.
			var selectedNodes = this.getSelectedNodes();
			if(selectedNodes && selectedNodes.length) {
				// only delegate to selectNode if at least one node is selected.
				// If multiple nodes are selected assume that we go with
				// the last selected node.
				this.selectNode(this._getNodeId(selectedNodes[selectedNodes.length - 1].id, toNext), add);
			}
		},

		_getNodeId: function(nodeId, toNext) {
			//	summary:
			//		finds a next/previous node in relation to nodeId
			//	nodeId: String:
			//		the id of the node to use as the base node
			//	toNext: Boolean:
			//		If true, we select the next node, otherwise the previous one.
			var allNodes = this.getAllNodes(), newId = nodeId;
			for(var i = 0, l = allNodes.length; i < l; ++i) {
				if(allNodes[i].id == nodeId) {
					// have a match ... make sure we don't go outside
					var j = Math.min(l - 1, Math.max(0, i + (toNext ? 1 : -1)));
					if(i != j){
						// we should be fine to go with the id the user has requested.
						newId = allNodes[j].id;
					}
					break;
				}
			}
			// if we don't get a match, the newId defaults to the currently selected node
			return newId;
		}
	}
);
