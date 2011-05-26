define(["dojo/_base/array", "./ListItem"],function(darray, ListItem){
	// module:
	//		dojox/mobile/_DataListMixin
	// summary:
	//		Mixin for widgets to generate the list items corresponding to the data
	//		provider object.
	// description:
	//		By mixing this class into the widgets, the list item nodes are generated
	//		as the child nodes of the widget and automatically re-generated
	//		whenever the corresponding data items are modified.

	return dojo.declare("dojox.mobile._DataListMixin", null,{
		// store: Object
		//		Reference to data provider object
		store: null,

		// query: Object
		//		A query that can be passed to 'store' to initially filter the items.
		query: null,

		queryOptions: null,

		buildRendering: function(){
			this.inherited(arguments);
			if(!this.store){ return; }
			var store = this.store;
			this.store = null;
			this.setStore(store, this.query, this.queryOptions);
		},

		setStore: function(store, query, queryOptions){
			if(store === this.store){ return; }
			this.store = store;
			this.query = query;
			this.queryOptions = queryOptions;
			if(store && store.getFeatures()["dojo.data.api.Notification"]){
				dojo.forEach(this._conn || [], dojo.disconnect);
				this._conn = [
					dojo.connect(store, "onSet", this, "onSet"),
					dojo.connect(store, "onNew", this, "onNew"),
					dojo.connect(store, "onDelete", this, "onDelete")
				];
			}
			this.refresh();
		},

		refresh: function() {
			// summary:
			//		Generate the list items.
			if(!this.store){ return; }
			this.store.fetch({
				query: this.query,
				queryOptions: this.queryOptions,
				onComplete: dojo.hitch(this, "generateList"),
				onError: dojo.hitch(this, "onError")
			});
		},

		createListItem: function(item) {
			var attr = {};
			var arr = this.store.getLabelAttributes(item);
			var labelAttr = arr ? arr[0] : null;
			dojo.forEach(this.store.getAttributes(item), function(name){
				if(name === labelAttr){
					attr["label"] = this.store.getLabel(item);
				}else{
					attr[name] = this.store.getValue(item, name);
				}
			}, this);
			var w = new ListItem(attr);
			item._widgetId = w.id;
			return w;
		},

		generateList: function(/*Array*/items, /*Object*/ dataObject) {
			dojo.forEach(this.getChildren(), function(child){
				child.destroyRecursive();
			});
			dojo.forEach(items, function(item, index){
				this.addChild(this.createListItem(item));
			}, this);
		}, 

		onError: function(errText){
		},

		onSet: function(/* item */ item,
			/* attribute-name-string */ attribute,
			/* object | array */ oldValue,
			/* object | array */ newValue){
		},

		onNew: function(/* item */ newItem, /*object?*/ parentInfo){
			this.addChild(this.createListItem(newItem));
		},

		onDelete: function(/* item */ deletedItem){
			dijit.byId(deletedItem._widgetId).destroyRecursive();
		}
	});
});
