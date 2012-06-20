define([
	"dojo/_base/declare"
], function(declare) {

return declare("davinci.html.ui.HTMLOutlineModel", null, {
	constructor: function(root) {
		this.root = root;
		this.subscription = dojo.subscribe("/davinci/ui/modelChanged", this, this._modelChanged);
	},

	getRoot: function(onItem, onError) {
		onItem(this.root);
	},

	getIdentity: function(item) {
		return item.getID();
	},

	getLabel: function(item) {
		return item.getLabel().replace("<", "&lt");
	},

	_getChildren: function(item) {
		var children = [];
		if (item.elementType == "HTMLFile" || item.elementType == "HTMLElement") {
			dojo.forEach(item.children, function(child) {
				if (child.elementType == "HTMLElement") {
					children.push(child);
				}
			});
		}
		return children; 
	},

	mayHaveChildren: function(item) {
		return (item.children.length > 0);
	},

	getChildren: function(item, onComplete, onError) {
		onComplete(this._getChildren(item));
	},

	_modelChanged: function() {
		this.onChildrenChange(this.root, this._getChildren(this.root));
	},

	destroy: function() {
		dojo.unsubscribe(this.subscription);
	}
})
});
