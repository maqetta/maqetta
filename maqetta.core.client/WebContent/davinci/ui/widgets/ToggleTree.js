// The primary purpose of this dijit.Tree subclass is to provide a toggle icon on each row,
// used in Maqetta to implement the eyeball visibility switch.  In order to do this, a custom
// TreeNode class and template are required, and some other methods are pulled in, with fragile
// dependencies on dijit.Tree implementations which may break from one release to the next.
// Where possible, dijit.Tree should be used directly with mixins to alter behavior.

//FIXME: review any code not related to toggle to determine if it's still necessary
define(["dojo/_base/declare",
        "dijit/Tree",
        "davinci/ui/widgets/_ToggleTreeNode",
],function(declare, Tree, ToggleTreeNode){
	return declare("davinci.ui.widgets.ToggleTree", Tree, {

		ctrlKeyPressed: false,
		
		constructor: function()
		{
		    this._isMultiSelect=arguments[0].isMultiSelect;
			this.selectedNodes = [];
			//this.watch("selectedItem", this._selectNode);
		},
	
		getNode: function(nodeItem) {
			var node = null;
			if (nodeItem) {
				var id = (typeof nodeItem == "string") ? nodeItem : this.model.getIdentity(nodeItem);
				node = this._itemNodesMap && this._itemNodesMap[id]  && this._itemNodesMap[id][0];
			}
			return node;
		},
	
		// called from VisualOutlineEditor.  Replace with set("selectedNodes") or set("paths")?
		selectNode: function (nodeItems, add) 
		{
			this.isSelecting=true;
			if (add) {
				this.ctrlKeyPressed = add;
			} else {
				this.ctrlKeyPressed = false;
			}
			for (var i=0; i < nodeItems.length; i++){
				var node = this.getNode(nodeItems[i]);
				
				this._selectNode(node);
				//this.ctrlKeyPressed = false; 
			}
			var paths = nodeItems.map(function(nodeItem){
				var path = [];
				for(var i=nodeItem.domNode; i && i.parentNode; i = i.parentNode) {
					if(i._dvWidget){
						path.unshift(i._dvWidget);
					}
				}
				return path;
			});
			try{
				if (paths && paths[0].length) {
					this.set('paths', paths);					
				}
			}catch(e){
				console.warn(e);
				// consume error
			}
			this.isSelecting=false;
		},
	
		postCreate: function(){
			if(!this.dndController){
				this.dndController = Tree.prototype.dndController;
			}
			this.inherited(arguments);
			this.onClick = this.onClickDummy;  
			this.allFocusedNodes = [];  
			this.lastFocusedNode = null;  
		},
		onClickDummy: function(item, node) {
		},
		_onClick: function(item, event){
			dojo.stopEvent(event);
			var ctrlKey = dojo.isMac ? event.metaKey: event.ctrlKey;
			this.ctrlKeyPressed = this._isMultiSelect && event && ctrlKey;
			this.inherited(arguments); 
			//this.ctrlKeyPressed = false;
			//dojo.stopEvent(event);
		},

		focusNode: function(/* _tree.Node */ node){
			this.lastFocusedNode = node;
			var id=this.model.getIdentity(node.item);
			if(this.ctrlKeyPressed) {
				// Ctrl key was pressed
			} else {
				// Ctrl key was not pressed, blur the previously selected nodes except the clicked node.
				for(i=0; i < this.allFocusedNodes.length; i++) {
					var temp = this.allFocusedNodes[i];
					if(temp != node){
						this._customBlurNode(this.allFocusedNodes[i]);
					}
				}
				this.allFocusedNodes = [];
			}
			var isExists = false; // Flag to find out if this node already been selected
			for(i=0;i < this.allFocusedNodes.length; i++) {
				var temp = this.allFocusedNodes[i];
				if(this.model.getIdentity(temp.item) == id){ isExists = true; }
			}
			if(!isExists){
				this.allFocusedNodes.push(node);
			}
			this._selectNode(node);
			var path = [];
			for(var i=node.domNode; i && i.parentNode; i = i.parentNode) {
				if(i._dvWidget){
					path.unshift(i._dvWidget);
				}
			}
			this.set('path', path);
		},
	
		
		_selectNode: function(/*_tree.Node*/ node){
			// summary:
			//		Mark specified node as select, and unmark currently selected node.
			// tags:
			//		protected
		
			
			if(!this.ctrlKeyPressed && this.selectedNodes && !this.selectedNodes._destroyed){
				this.deselectAll();
			}
			if(node){
				node.setSelected(true);
			}
			this.selectedNode = node;
			
			if (!this.isSelecting && this.notifySelect)
			{
				this.notifySelect(this.selectedItem, this.ctrlKeyPressed); 
			}
			
		},
		
		deselectAll: function(){
			while (n = this.selectedNodes.pop()){
				n.setSelected(false);
			}
		},
	
		_customBlurNode: function(node) {
			var labelNode = node.labelNode;
	//		dojo.removeClass(labelNode, "dijitTreeLabelFocused");
			labelNode.setAttribute("tabIndex", "-1");
	//		dijit.setWaiState(labelNode, "selected", false);
			node.setSelected(false);
		},
		blurNode: function(){
			// Not using, we've our own custom made blur method. See _customBlurNode
		},

		_createTreeNode: function(/*Object*/ args){
	 		return new ToggleTreeNode(args);
		},
	    
		toggledItems: {},	
	
		_setToggledItemsAttr: function(/*Array of dojo.data.Item or id*/ items){
			//TODO
		},
	
		_getToggledItemsAttr: function(){
			var items = [];
			for(var i in this.toggledItems){
				items.push(i);
			}
			return items; // dojo.data.Item[]
		},
	    
		getMenuOpenCallback: function ()
		{
			return dojo.hitch(this,this._menuOpenCallback);
		},
		
		_menuOpenCallback: function (event)
		{
			var ctrlKey = dojo.isMac ? event.metaKey : event.ctrlKey;
			this.ctrlKeyPressed = this._isMultiSelect && event && ctrlKey;
			var w = dijit.getEnclosingWidget(event.target);
			if(!w || !w.item){
	//			dojo.style(this._menu.domNode, "display", "none");
				return;
			}
			if (dojo.indexOf(this.selectedNodes,w) >= 0) {
				return;
			}
			this._selectNode(w);
			var path = [];
			for(var i=w.domNode; i && i.parentNode; i = i.parentNode) {
				if(i._dvWidget){
					path.unshift(i._dvWidget);
				}
			}
			this.set('path', path);
	 	}
	});
});