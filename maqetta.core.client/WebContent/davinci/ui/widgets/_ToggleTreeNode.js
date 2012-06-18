define(["dojo/_base/declare",
        "dijit/Tree"
],function(declare,Tree){
		

	return declare("davinci.ui.widgets._ToggleTreeNode", dijit._TreeNode, {
		_setLabelAttr: {node: "labelNode", type: "innerHTML"},

		postCreate: function(){
			this.inherited(arguments);
			
			if (this.tree.model.useRichTextLabel) {
				this.labelNode.innerHTML = this.label;
			}
	
			if(!this.tree.model.toggleMode || !this.shouldShowElement('toggleNode', this.item)) {
				dojo.addClass(this.toggleNode, "dijitHidden");
			} else {
				if (this.tree.model.isToggleOn(this.item)) {
					this._setToggleAttr(true);
				}
	 		}
			if (this.tree.model.postCreate) {
				this.tree.model.postCreate(this);
			}
		},
	
		shouldShowElement: function(elementId, item) {
			return this.tree.model.shouldShowElement && this.tree.model.shouldShowElement(elementId, item);
		}, 
		
		setChildItems: function(/* Object[] */ items){
			// summary:
			//		Sets the child items of this node, removing/adding nodes
			//		from current children to match specified items[] array.
			//		Also, if this.persist == true, expands any children that were previously
			// 		opened.
			// returns:
			//		Deferred object that fires after all previously opened children
			//		have been expanded again (or fires instantly if there are no such children).
	
			var tree = this.tree,
				model = tree.model,
				defs = [];	// list of deferreds that need to fire before I am complete
	
	
			// Orphan all my existing children.
			// If items contains some of the same items as before then we will reattach them.
			// Don't call this.removeChild() because that will collapse the tree etc.
			this.getChildren().forEach(function(child){
				dijit._Container.prototype.removeChild.call(this, child);
			}, this);
	
			this.state = "LOADED";
	
			if(items && items.length > 0){
				this.isExpandable = true;
		
				if (this == this.tree.rootNode && !this.tree.showRoot){
					this.expand();
				}
				// Create _TreeNode widget for each specified tree node, unless one already
				// exists and isn't being used (presumably it's from a DnD move and was recently
				// released
				dojo.forEach(items, function(item){
					var id = model.getIdentity(item),
						existingNodes = tree._itemNodesMap[id],
						node;
					if(!node){
						node = this.tree._createTreeNode({
								item: item,
								tree: tree,
								isExpandable: model.mayHaveChildren(item),
								label: tree.getLabel(item),
								tooltip: tree.getTooltip(item),
								indent: this.indent + 1
							});
						tree._itemNodesMap[id] = [node];
					}
					this.addChild(node);
	
					// If node was previously opened then open it again now (this may trigger
					// more data store accesses, recursively)
					if(node.isExpandable && (this.tree.autoExpand || this.tree._state(node))){
						defs.push(tree._expandNode(node));
					}
				}, this);
	
				// note that updateLayout() needs to be called on each child after
				// _all_ the children exist
				dojo.forEach(this.getChildren(), function(child, idx){
					child._updateLayout();
				});
			}else{
				this.isExpandable=false;
			}
	
			if(this._setExpando){
				// change expando to/from dot or + icon, as appropriate
				this._setExpando(false);
			}
	
			// Set leaf icon or folder icon, as appropriate
			this._updateItemClasses(this.item);
	
			// On initial tree show, make the selected TreeNode as either the root node of the tree,
			// or the first child, if the root node is hidden
			if(this == tree.rootNode){
				var fc = this.tree.showRoot ? this : this.getChildren()[0];
				if(fc){
					fc.setFocusable(true);
					tree.lastFocused = fc;
				}else{
					// fallback: no nodes in tree so focus on Tree <div> itself
					tree.domNode.setAttribute("tabIndex", "0");
				}
			}
	
			return new dojo.DeferredList(defs);	// dojo.Deferred
		},
	
	/// Add-on to support row 'checkbox', see http://bugs.dojotoolkit.org/ticket/7513
		toggle: false, // Boolean
	
		templateString: dojo.cache("davinci.ui.widgets", "TreeNode.html"),
	
		_onToggleClick: function(/*Event*/e){
			var result = this.tree.model.toggle(this.item, !this.toggle, this);
			if (result !== false) {
				this._setToggleAttr(!this.toggle);
			}
		},
	
		_setToggleAttr: function(/*Boolean?*/ on){
			// summary:
			//		Select a tree node related to passed item.
			//		WARNING: if model use multi-parented items or desired tree node isn't already loaded
			//		behavior is not granted. Use 'path' attr instead for full support.
			this.toggle = (on === undefined) ? !this.toggle : on;
			if (this.toggleNode) {
				dojo.toggleClass(this.toggleNode, "dvOutlineVisibilityOn", !on);
				dojo.toggleClass(this.toggleNode, "dvOutlineVisibilityOff", on);		
			}
			//TODO: keeping the state in the tree is probably the wrong approach if we need to respondto changes
			// in the data store. Perhaps it's better to keep this state either in the store or have the tree
			// query its nodes directly when asked for the list of toggled items.
			if(this.toggle){
				this.tree.toggledItems[this.item] = true;
			}else{
				delete this.tree.toggledItems[this.item];
			}
		},
	
		_getToggleAttr: function(){
			// summary:
			//		Return items related to toggled nodes.
			return this.toggle; // Boolean
		}
	});
});