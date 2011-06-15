dojo.provide("davinci.ui.widgets.Tree");

dojo.require("dijit.Tree");
//TODO:  use dojo DND instead
dojo.require("davinci.ui.dnd.DragSource");
dojo.require("davinci.ui.widgets.Filter");
dojo.declare("davinci.ui.widgets._TreeNode", dijit._TreeNode, {
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
				if(node.isExpandable && (this.tree.autoExpand || this.tree._state(item))){
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

dojo.declare("davinci.ui.widgets.Tree", dijit.Tree, {
	
	
	filters: [], //FIXME: shared array on prototype
	lastFocusedNode: null, 
	allFocusedNodes: [], //FIXME: shared array on prototype
	ctrlKeyPressed: false,
	
	constructor: function()
	{
	    var model= this.model || arguments[0].model;
	    this._isMultiSelect=arguments[0].isMultiSelect;
		this._orgModelGetChildren=model.getChildren;
		model.getChildren=dojo.hitch(this, this._getChildrenIntercept);
		this.selectedNodes = [];
		this.watch("selectedItem",this._selectNode);
	},

	getNode: function(nodeItem) {
		var node = null;
		if (nodeItem) {
			var id = (typeof nodeItem == "string") ? nodeItem : this.model.getIdentity(nodeItem);
			node = this._itemNodesMap && this._itemNodesMap[id]  && this._itemNodesMap[id][0];
		}
		return node;
	},

	//FIXME: unused?
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
		this.isSelecting=false;
	},

	postCreate: function(){
		if(!this.dndController){
			this.dndController = dijit.Tree.prototype.dndController;
		}
		this.inherited(arguments);
		this.onClick = this.onClickDummy;  
		this.allFocusedNodes = [];  
		this.lastFocusedNode = null;  
		this.connect(this.model, "onRefresh", "_load");
		dojo.forEach(this.filters, function (filter){
			if (filter.onFilterChange){
				this.connect(filter,"onFilterChange",filterChanged);
			}
		}, this);
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
	filterChanged : function (filter)
	{
//TODO: implement me		
	},
	_getChildrenIntercept : function(item,onComplete,onErr)
	{
		var completeHandler=onComplete;
		if (this.filters.length>0)
		{
			var self=this;
			completeHandler=function (items)
			{
				var filteredItems=self._filterItems(items);
				onComplete( filteredItems);
			}
		}
		this._orgModelGetChildren.apply(this.model,[item,completeHandler,onErr]);
	},
	
	_filterItems : function(items)
	{
				if (items.length==0){
					return items;
				}
				for (var i=0;i<this.filters.length;i++)
				{
					var filter=this.filters[i];
					if (filter.filterList){
						items=filter.filterList(items);
					} else if (filter.filterItem){
						var filteredItems=[];
						for (var j=0;j<items.length;j++)
						{
							if (!filter.filterItem(items[j])){
								filteredItems.push(items[j]);
							}
						}
						items=filteredItems;
					}
				}
				return items;
	},
	
//	
//OVERRIDE 	_onItemChildrenChange from tree to add call to filterItems
//
	_onItemChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){
		// added
		newChildrenList=this._filterItems(newChildrenList);

		var model = this.model,
			identity = model.getIdentity(parent),
			parentNodes = this._itemNodesMap[identity];

		if(parentNodes){
			dojo.forEach(parentNodes,function(parentNode){
				parentNode.setChildItems(newChildrenList);
			});
		}
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
	},
	_selectNode: function(/*_tree.Node*/ node){
		// summary:
		//		Mark specified node as select, and unmark currently selected node.
		// tags:
		//		protected
/*
		if(!this.ctrlKeyPressed && this.selectedNodes && !this.selectedNodes._destroyed){
			this.deselectAll();
		}
		if(node){
			node.setSelected(true);
			this.selectedNodes.push(node); 
		}
		this.selectedNode = node;
*/
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
	// Returns array of currently selected items.
	getSelectedItems: function() {
		var selectedItems = [];
		for(i=0;i < this.selectedNodes.length; i++) {
			var iNode = this.selectedNodes[i];
			selectedItems.push(iNode.item);
		}
		return selectedItems ;
	},
	_createTreeNode: function(/*Object*/ args){
 		var treeNode=new davinci.ui.widgets._TreeNode(args);
 		if (this.dragSources && args.item)
 		{
 			for (var i=0;i<this.dragSources.length;i++)
 				if (this.dragSources[i].dragSource(args.item))
 				{
 					var ds = new davinci.ui.dnd.DragSource(treeNode.domNode, "component", treeNode);
 					ds.targetShouldShowCaret = true;
 					ds.returnCloneOnFailure = false;
 					dojo["require"](this.dragSources[i].dragHandler);
 					var dragHandlerClass= dojo.getObject(this.dragSources[i].dragHandler); 
 					ds.dragHandler=new dragHandlerClass(args.item);
                    this.connect(ds, "initDrag", function(e){if (ds.dragHandler.initDrag) ds.dragHandler.initDrag(e);}); // move start
 					this.connect(ds, "onDragStart", function(e){ds.dragHandler.dragStart(e);}); // move start
 					this.connect(ds, "onDragEnd", function(e){ds.dragHandler.dragEnd(e);}); // move end
 				}
 		}
 		return treeNode;
	},
	
	onDragStart: function()
	{
		debugger;
	},
	onDragEnd: function()
	{
		debugger;
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
    
	getMenuOpenCallback : function ()
	{
		return dojo.hitch(this,this._menuOpenCallback);
	},
	
	_menuOpenCallback : function (event)
	{
		var ctrlKey = dojo.isMac ? event.metaKey : event.ctrlKey;
		this.ctrlKeyPressed = this._isMultiSelect && event && ctrlKey;
		var w = dijit.getEnclosingWidget(event.target);
		if(!w || !w.item){
//			dojo.style(this._menu.domNode, "display", "none");
			return;
		}
		if (dojo.indexOf(this.selectedNodes,w) >= 0)
			return;
		this._selectNode(w);
 	}
});