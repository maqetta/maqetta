define([
	"dojo/_base/declare"
], function(declare) {

return declare("davinci.review.model.store.GeneralReviewReadStore", null, {

	constructor: function(args) {
		dojo.mixin(this, args);
		this._features = {"dojo.data.api.Read": true, "dojo.data.api.Identity": true};
		this._loadedItems = [];
	},

	getFeatures: function() {
		return this._features;
	},

	getIdentity: function(/* item */ item) {
		return item.getPath();
	},

	fetchItemByIdentity: function(/* object */ keywordArgs) {
		var candidate;
		if (keywordArgs.identity && this.isItemLoaded(keywordArgs.identity)) {
			// If the item is loaded, get the item and call onItem
			dojo.some(this._loadedItems, function(item) {
				if (keywordArgs.identity == this.getIdentity(item)) {
					candidate = item;
					return true;
				}
			}, this);
			if (candidate && keywordArgs.onItem) {
				var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
				keywordArgs.onItem.call(scope, candidate);
			}
		} else {
			throw new Error("GeneralReviewReadStore: The item cannot be found or it is not loaded!");
		}
	},

	getValue: function(	/* item */ item, /* attribute-name-string */ attribute,	/* value? */ defaultValue) {
		var ret = this.getValues(item, attribute);
		if (ret.length > 0) {
			return ret[0];
		}
	},

	getValues: function(/* item */ item, /* attribute-name-string */ attribute) {
		var ret = [];
		if (item[attribute]) {
			if(item[attribute].length >= 0){
				// Array
				ret = ret.concat(item[attribute]);
			} else {
				// Object
				ret.push(item[attribute]);
			}
		}
		return ret;
	},

	isItem: function(/* anything */ something) {
		if (typeof something == "string") {
			// If something is an identity (string), check if the item is loaded
			return dojo.some(this._loadedItems, function(item) {
				if (something == this.getIdentity(item)) { 
					return true;
				}
			}, this);
		} else if(something) {
			return typeof something.r != "undefined" && something.r === this;
		}
	},

	isItemLoaded: function(/* anything */ something) {
		var result = this.isItem(something);
		if (result && typeof something == "object") {
			result = something.isLoaded;
		}
		return result;
	},

	loadItem: function(/* object */ keywordArgs) {
		var item = keywordArgs.item;
		if (item) {
			var self = this;
			item.getChildren(function(children) {
				var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
				self._loadedItems = self._loadedItems.concat(children);
				item.children = children;
				item.isLoaded = true;
				dojo.forEach(children, function(child) {
					child.r = self; // Indicate that this item belongs to this store
				});
				keywordArgs.onItem && keywordArgs.onItem.call(scope, item);
			}, true);
		}
	},

	fetch: function(/* Object */ keywordArgs) {
		// Return the root node only
		if (keywordArgs.onComplete) {
			var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
			this.root.r = this;
			this._loadedItems.push(this.root);
			this.loadItem({item: this.root});
			keywordArgs.onComplete.call(scope, [this.root]);
		}
		return keywordArgs;
	},

	close: function(/*dojo.data.api.Request || keywordArgs || null */ request) {
		this._loadedItems.length = 0;
	},

	getLabel: function(/* item */ item) {
		throw new Error("GeneralReviewReadStore: getLabel method is abstract!");
	},

	hasAttribute: function(item, attribute) {
		return this.isItem(item) && (attribute == "children" ? item.elementType == "Folder" : typeof item[attribute]);
	}

});
});
