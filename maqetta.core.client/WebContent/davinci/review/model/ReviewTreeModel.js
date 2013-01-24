define([
	    "dojo/_base/declare",
	    "davinci/Runtime",
	    "davinci/model/Path",
	    "davinci/review/model/Resource"
], function(declare, Runtime, Path, Resource){
	
return declare("davinci.review.model.ReviewTreeModel", null, {

	foldersOnly: false,

	constructor: function(args) {
		this.root = Resource.getRoot();
		this.subscription = [dojo.subscribe("/davinci/review/resourceChanged", this, this.resourceChanged)];
	},

	destroy: function() {
		this.subscriptions.forEach(dojo.unsubscribe);
	},

	getRoot: function(onItem) {
		onItem(this.root);
	},

	mayHaveChildren: function(/*dojo.data.Item*/ item) {
		return item.elementType == "ReviewVersion" && !item.isDraft;
	},
	
	getChildren: function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete, /*function(items)*/ onError) {
		parentItem.getChildren(onComplete, onError);
	},
	
	getIdentity: function(/* item */ item) {
		return item.getPath();
	},

	resourceChanged: function(result, type, changedResource) {
		// Remove the changed resource and its children from the tree. Shortly, we will
		// tell the tree about it's new children. But, if a child's identity matches the 
		// identity of an existing item in the model, it will not be replaced with the 
		// new data. Hence, the need to delete the changed resource before adding it back
		// in.
		if (changedResource) {
			if (changedResource._isLoaded) {
				changedResource.getChildren(function(children) { children.forEach(this.onDelete, this); }.bind(this), true);
			}
			
			this.onDelete(changedResource);
		}
		
		// Reload the children. 
		var parent = this.root;
		parent._isLoaded = false;
		parent.getChildren(function(children) { 
			//Add new children
			this.onChildrenChange(parent, children);
		}.bind(this));
	},

	getLabel: function(/*dojo.data.Item*/ item) {
		var label = item.getName();
		if (item.elementType == "ReviewVersion" && item.isDraft) {
			label += " (Draft)";
		}
		if (item.elementType == "ReviewFile") {
			var path = new Path(label);
			var segments = path.getSegments();
			var editorExtension = Runtime.getExtension("davinci.editor", function (extension){
				return extension.id === "davinci.review.CommentReviewEditor";
			});
			var extension = "."+editorExtension.extensions;
			label = segments[segments.length-1] + extension;
		}
		return label;
	},

	newItem: function(/* Object? */ args, /*Item?*/ parent){ 
	},

	pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy) {
	},

	onChange: function(/*dojo.data.Item*/ item) {
	},
	
	onDelete: function(/*dojo.data.Item*/ item) {
	},

	onChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList) {
	}

});
});
