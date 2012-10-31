define(["dojo/_base/declare"
        

],function(declare){
	

	return declare("davinci.ui.widgets.DavinciModelTreeModel",null,{
		constructor: function(root)	{
				this.root=root;
				this.subscription=dojo.subscribe("/davinci/ui/modelChanged",this,this.modelChanged);
		},
			
		destroy: function(){
			dojo.unsubscribe(this.subscription);
		},
		
		// =======================================================================
		// Methods for traversing hierarchy
		
		getRoot: function(onItem){
			onItem(this.root);
		},
		
		mayHaveChildren: function(/*dojo.data.Item*/ item){
	       return item.children.length>0;
			
		},
		
		getChildren: function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete){
			   onComplete(this._childList(parentItem));
		},
		
		// =======================================================================
		// Inspecting items
		
		getIdentity: function(/* item */ item){
			return item.getID();
		},
		
		getLabel: function(/*dojo.data.Item*/ item){
			return item.getLabel();
		},
		
		modelChanged : function(type,changedResource){
			this.refresh();
		},
		
		_childList: function (parentNode)
		{
			return parentNode.children;
		},
		
		newItem: function(/* Object? */ args, /*Item?*/ parent){
		},
		
		pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy){
		},
		
		
		onChange: function(/*dojo.data.Item*/ item){
		},
		
		onChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){
		},
		refresh: function(){
			try {
				var node = this.root;
				this.onChildrenChange(node, this._childList(node));//this.onRefresh();
			}catch(e){
				console.error("error in VisualEditorOutline::refresh");
			}
		}
	});
});
