define("davinci/ui/widgets/TransformTreeMixin", ["dijit/Tree"], function(tree) {

// Adds the capability to filter and/or re-order elements in a tree, e.g. alphabetically
// The proper way to do this would be through the data store, but there's presently no way
// to pass sort options to store.fetch, and no option to arrange anything but top-level nodes
// So, we'll do it in the widget as a mixin, iterating through an optional array on a
// property called 'transforms', similar to what was done in davinci.ui.widgets.Tree.

	var postCreate = dijit.Tree.prototype.postCreate;
	dijit.Tree.prototype.postCreate = function() {
		// override _onItemChildrenChange before it's connected in postCreate()
		var _onItemChildrenChange = dijit.Tree.prototype._onItemChildrenChange;
		dijit.Tree.prototype._onItemChildrenChange = function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){
			if (this.transforms) {
				this.transforms.forEach(function(transform){
					newChildrenList = transform(newChildrenList);
				});
			}
			_onItemChildrenChange.apply(this, [parent, newChildrenList]);
		}

		// override model.getChildren() to apply the transforms
		var getChildren = this.model.getChildren;
		this.model.getChildren = dojo.hitch(this, function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete, /*function*/ onError){
			var completeHandler=onComplete;
			if (this.transforms) {
				completeHandler=dojo.hitch(this, function (items) {
					this.transforms.forEach(function(transform){
						items = transform(items);
					});
					onComplete(items);
				});
			}
			getChildren.apply(this.model, [parentItem, completeHandler, onError]);
		});

		postCreate.apply(this);
	};
});
