define([
	    "dojo/_base/declare",
	    "davinci/review/model/Resource",
	    "davinci/ui/widgets/ResourceTreeModel"
], function(declare, Resource, ResourceTreeModel){
	
return declare("davinci.review.model.ReviewTreeModel", null, {

	foldersOnly : false,
	constructor: function(args) {
		this.root = Resource.getRoot();
		this.subscription = [dojo.subscribe("/davinci/review/resourceChanged", this, this.resourceChanged)];
	},

	destroy: function() {
		for (var i=0; i<this.subscriptions.length; i++)
			dojo.unsubscribe(this.subscription[i]);
	},

	getRoot: function(onItem) {
		onItem(this.root);
	},
	mayHaveChildren: function(/*dojo.data.Item*/ item) {
		return item.elementType=="ReviewVersion"&&!item.isDraft;

	},
	getChildren: function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete) {
		parentItem.getChildren(onComplete, true); // need to make the call sync, chrome is to fast for async
	},
	
	getIdentity: function(/* item */ item) {
		return item.getPath();
	},

	resourceChanged : function() {
		var parent=this.root;
		var newChildren;
		parent._isLoaded=false;
		parent.getChildren(function(children) { newChildren=children; }, true);
		this.onChildrenChange(parent,newChildren);
	},

	getLabel: function(/*dojo.data.Item*/ item) {
		var label=item.getName();
		if (item.elementType == "ReviewVersion" && item.isDraft) {
			label+=" (Draft)";
		}
		if (item.elementType == "ReviewFile") {
			var path = new davinci.model.Path(label);
			var segments = path.getSegments();
			label = segments[segments.length-1]+".rev";
		}
		return label;
	},

	newItem: function(/* Object? */ args, /*Item?*/ parent){ 
	},

	pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy) {
	},

	onChange: function(/*dojo.data.Item*/ item) {
	},

	onChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList) {
	}

});
});
