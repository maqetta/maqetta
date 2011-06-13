dojo.provide("davinci.libraries.dojo.dojo.data.ItemFileReadStoreHelper");

dojo.declare("davinci.libraries.dojo.dojo.data.ItemFileReadStoreHelper", null, {


	getData: function(/*Widget*/ widget, /*Object*/ options){
		// summary:
		//		Serialize the passed DataGrid.
		//		Writes a dojo/method script tag as a child to the DataGrid to set the structure, if one doesn't already exist.
		//

		if(!widget){
			return undefined;
		}

		var widgetData = widget._getData( options);
		var value = widget._srcElement.getAttribute('data');
		var url = widget._srcElement.getAttribute('url');
//		var v2 = widget.getPropertyValue('data');
//		var data = { identifier: 'id', label: 'label', items:[], __json__: function(){ 
//			// Kludge to avoid too much recursion exception when storing data as json
//			// required because ItemFileReadStore adds cyclic references to data object
//			var self = {};
//			if (this.identifier) {
//				self.identifier = this.identifier;
//			}
//			if (this.label) {
//				self.label = this.label;
//			}
//			if (this.id) {
//				self.id = this.id;
//			}
//			if (this.items || this.children) {
//				var items = this.items || this.children;
//				var __json__ = arguments.callee;
//				
//				items = dojo.map(items, function(item){
//					var copy = dojo.mixin({}, item);
//					copy.__json__ = __json__;
//					delete copy._0;
//					delete copy._RI;
//					delete copy._S;
//					return copy;
//				});
//				
//				if (this.items) {
//					self.items = items;
//				} else if (this.children) {
//					self.children = items;
//				}
//			}
//			return self;
//		}
//		};
		/*var newdata; wdr 3-11
		value = eval('newdata=' +value);*/
//		value.__json__ =  function(){ 
//			// Kludge to avoid too much recursion exception when storing data as json
//			// required because ItemFileReadStore adds cyclic references to data object
//			var self = {};
//			if (this.identifier) {
//				self.identifier = this.identifier;
//			}
//			if (this.label) {
//				self.label = this.label;
//			}
//			if (this.id) {
//				self.id = this.id;
//			}
//			if (this.items || this.children) {
//				var items = this.items || this.children;
//				var __json__ = arguments.callee;
//				
//				items = dojo.map(items, function(item){
//					var copy = dojo.mixin({}, item);
//					copy.__json__ = __json__;
//					delete copy._0;
//					delete copy._RI;
//					delete copy._S;
//					return copy;
//				});
//				
//				if (this.items) {
//					self.items = items;
//				} else if (this.children) {
//					self.children = items;
//				}
//			}
//			return self;
//		}


		if (value){
			var newdata;
			value = eval('newdata=' +value);
			widgetData.properties.data = value;
		} else {
			widgetData.properties.url = url;
		}
		return widgetData;
	}

//	create: function(widget, srcElement){
//		
//		//this.replaceStoreData(widget);
//	},
//	
//	replaceStoreData: function(store, data) {
//		// Kludge to force reload of store data
//		store.clearOnClose = true;
//		//store.data = data;
//		store.close();
//		store.fetch({
//			query: this.query,
//			queryOptions:{deep:true}, 
//			onComplete: dojo.hitch(this, function(items){
//				/*for (var i = 0; i < items.length; i++) {
//					var item = items[i];
//					console.warn("i=", i, "item=", item);
//				}*/
//			})
//		});
//	}
	

});

