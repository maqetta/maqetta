dojo.provide("davinci.libraries.dojo.dojox.mobile.EdgeToEdgeDataListHelper");

dojo.declare("davinci.libraries.dojo.dojox.mobile.EdgeToEdgeDataListHelper", null, {

	getData: function(/*Widget*/ widget, /*Object*/ options){

		if(!widget){
			return undefined;
		}
	
		// call the old _getData
		var data = widget._getData(options);
	
		if (widget.dijitWidget.store){
			data.properties.store = widget.dijitWidget.store; // add the data old store if it has one.
			data.properties.query = widget.dijitWidget.query;
		}
		return data;
	},

	create: function(widget, srcElement){
	
		var storeId = srcElement.getAttribute("store");
		if(storeId){
			var storeWidget = davinci.ve.widget.byId(storeId);
	
			if (storeWidget /*&& storeWidget.properties*/ && widget.dijitWidget && widget.dijitWidget.store){  //wdr 3-11
				this.updateStore(widget.dijitWidget.store, storeWidget/*.properties*//*.data*/, widget);
	
			}
		
		}
		this.stopOnClickListItems(widget);
	
	},

	updateStore: function(store, /*properties*/ storeWidget, widget) { 
	
		var data = storeWidget._srcElement.getAttribute('data'); 
		var url = storeWidget._srcElement.getAttribute('url'); 
		if (data){ 
			var value = data; 
			var storeData = eval('storeData = '+value);
			var data = { identifier: storeData.identifier,  items:[] };
		
			var items = data.items;
			var storeDataItems = storeData.items;
			for (var r = 0; r < storeDataItems.length; r++){
				var item = new Object();
				var dataStoreItem = storeDataItems[r];
				for (var name in dataStoreItem){
					item[name] = dataStoreItem[name];
				}
				items.push(item);
			}
			
			// Kludge to force reload of store data
			store.clearOnClose = true;
			store.data = data;
			delete store.url; // wdr remove old url if switching
		}else{ // must be url data store
			// Kludge to force reload of store data
			store.clearOnClose = true;
			store.url = url; 
			delete store.data; // wdr remove old url if switching
		}
		store.close();
		store.fetch({
			query: this.query,
			queryOptions:{deep:true}, 
			onComplete: dojo.hitch(this, function(items){
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					console.warn("label=", i, "moveTo=", item);
				}
				widget.dijitWidget.refresh(); 
			})
		});
	
	
	}, 
	
	stopOnClickListItems: function(widget){
		var dijitWidget = widget.dijitWidget;
		if(dijitWidget && dijitWidget.containerNode){
			// Fix for #753.
			// The ListItem widget's startup logic registers an onclick
			// handler, and if the 'moveTo' property has a reference to a view,
			// then this built-in onclick handler will launch an animated
			// transition to make that view visible. This is good for runtime execution,
			// but we don't want this onclick handler to execute in the page editor.
			// So, register a "click" handler in the capture phase (happens before default bubble phase)
			// that calls stopPropagation(), which prevents the ListItem's onclick logic from getting invoked.
			// This allows event to bubble up to ancestor widgets, and therefore
			// will be caught by Maqetta and will cause a selection action to occur.
			dojo.query(".mblListItemAnchor", dijitWidget.containerNode).forEach(function(node, index, arr){
				node.addEventListener("click",function(e){
					e.stopPropagation();		
				}, true);
			});
		}
	}



});