dojo.provide("dojox.grid.LazyTreeGridStoreModel");

dojo.require("dijit.tree.ForestStoreModel");

dojo.declare("dojox.grid.LazyTreeGridStoreModel", dijit.tree.ForestStoreModel, {

	// There are different approaches to get children for client-side
	// DataStore (e.g. dojo.data.ItemFileReadStore) or server-side DataStore
	// (e.g. dojox.data.QueryReadStore), so we need to be sure what kind of
	// DataStore is being used
	serverStore: false, // server side store
	
	constructor: function(/* Object */ args){
		this.serverStore = args.serverStore === true ? true : false;
	},

	mayHaveChildren: function(/*dojo.data.Item*/ item){
		var children = null;
		return dojo.some(this.childrenAttrs, function(attr){
				children = this.store.getValue(item, attr);
				if(dojo.isString(children)){
					return parseInt(children, 10) > 0 || children.toLowerCase() === "true" ? true : false;
				}else if(typeof children == "number"){
					return children > 0;
				}else if(typeof children == "boolean"){
					return children;
				}else if(this.store.isItem(children)){
					children = this.store.getValues(item, attr);
					return dojo.isArray(children) ? children.length > 0 : false;
				}else{
					return false;
				}
		}, this);
	},
	
	getChildren: function(/*dojo.data.Item*/parentItem, /*function(items, size)*/onComplete, /*function*/ onError, /*object*/queryObj){
		if(queryObj){
			var start = queryObj.start || 0,
				count = queryObj.count,
				parentId = queryObj.parentId,
				sort = queryObj.sort;
			if(parentItem === this.root){
				this.root.size = 0;
				this.store.fetch({
					start: start,
					count: count,
					sort: sort,
					query: this.query,
					onBegin: dojo.hitch(this, function(size){
						this.root.size = size;
					}),
					onComplete: dojo.hitch(this, function(items){
						onComplete(items, queryObj, this.root.size);
					}),
					onError: onError
				});
			}else{
				var store = this.store;
				if(!store.isItemLoaded(parentItem)){
					var getChildren = dojo.hitch(this, arguments.callee);
					store.loadItem({
						item: parentItem,
						onItem: function(parentItem){
							getChildren(parentItem, onComplete, onError, queryObj);
						},
						onError: onError
					});
					return;
				}
				if(this.serverStore && !this._isChildrenLoaded(parentItem)){
					this.childrenSize = 0;
					this.store.fetch({
						start: start,
						count: count,
						sort: sort,
						query: dojo.mixin({parentId: parentId}, this.query || {}),
						onBegin: dojo.hitch(this, function(size){
							this.childrenSize = size;
						}),
						onComplete: dojo.hitch(this, function(items){
							onComplete(items, queryObj, this.childrenSize);
						}),
						onError: onError
					});
				}else{
					this.inherited(arguments);
				}
			}
		}else{
			this.inherited(arguments);
		}
	},
	
	_isChildrenLoaded: function(parentItem){
		// summary:
		//		Check if all children of the given item have been loaded
		var children = null;
		return dojo.every(this.childrenAttrs, function(attr){
			children = this.store.getValues(parentItem, attr);
			return dojo.every(children, function(c){
				return this.store.isItemLoaded(c);
			}, this);
		}, this);
	}
});
