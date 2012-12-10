define(["dojo/_base/declare",
        "dijit/Tree",
        "dojo/text!./templates/TreeNode.html"
],function(declare, Tree, treeNodeTemplate){

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

		/// Add-on to support row 'checkbox', see http://bugs.dojotoolkit.org/ticket/7513
		toggle: false, // Boolean
	
		templateString: treeNodeTemplate,
	
		_onToggleClick: function(/*Event*/e){
			var newToggleValue = !this.toggle;
			var result = this.tree.model.toggle(this.item, newToggleValue, this);
			if (result !== false) {
				this._setToggleAttr(newToggleValue);
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