dojo.provide("davinci.review.actions.ReviewFileTreeModel");
dojo.require("davinci.resource");


dojo.declare(
	"davinci.review.actions.ReviewFileTreeModel",
	null,
{
	
   foldersOnly : false,
		
	constructor: function(args)	
	{
			this.root=args && args.root;
			//this.subscription=dojo.subscribe("/davinci/resource/resourceChanged",this,this.resourceChanged);
			this.foldersOnly=args && args.foldersOnly;
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
       return item.elementType=="Folder";
		
	},
	
	getChildren: function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete){
		if (!this.foldersOnly)
		{
			parentItem.getChildren(onComplete, true); // need to make the call sync, chrome is to fast for async
		}
		else
		{
			parentItem.getChildren(function (items){
				var children=[];
				var i;
				for (i=0;i<items.length;i++)
					if (items[i].elementType=="Folder")
						children.push(items[i]);
				onComplete(children);
			});
		}
			
	},
	
	// =======================================================================
	// Inspecting items
	
	getIdentity: function(/* item */ item){
	
		return item.getPath();
	},
	
	getLabel: function(/*dojo.data.Item*/ item){

		var label=item.getName();
		if (item.link)
			label=label+'  ['+item.link+']';
		return label;
	},
	
	resourceChanged : function(type,changedResource)
	{
		if (type=='created'||type=='deleted')
		{
			var parent=changedResource.parent;
			var newChildren;
			parent.getChildren(function(children){newChildren=children;});
			this.onChildrenChange(parent,newChildren);
		}
	},
	
	newItem: function(/* Object? */ args, /*Item?*/ parent){
	},
	
	pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy){
	},
	
	
	onChange: function(/*dojo.data.Item*/ item){
	},
	
	onChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){
	}
});

