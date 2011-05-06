dojo.provide("davinci.libraries.dojo.dijit.tree.ForestStoreModelHelper");

dojo.declare("davinci.libraries.dojo.dijit.tree.ForestStoreModelHelper", null, {

	getData: function(/*Widget*/ widget, /*Object*/ options){

	if(!widget){
		return undefined;
	}

	// call the old _getData
	var data = widget._getData(options);

	var dj = widget.getContext().getDojo();
	dojo.withDoc(widget.getContext().getDocument(), function(){
		var storeId =widget._srcElement.getAttribute("store");
		if (storeId)
			data.properties.store = dj.getObject(storeId);
	});
	
	return data;
}//,
//
//
//create: function(widget, srcElement){
//debugger;
//	var storeId = srcElement.getAttribute("store");
//	if(storeId){
//		var storeWidget = davinci.ve.widget.byId(storeId);
//
//		if (storeWidget /*&& storeWidget.properties*/ && widget.dijitWidget && widget.dijitWidget.store){  //wdr 3-11
//			this.updateStore(widget.dijitWidget.store, storeWidget/*.properties*//*.data*/);
//			//this.replaceStoreData(widget.dijitWidget.store, storeWidget.properties.data);
//		}
//	
//	}
//
//},
//
//updateStore: function(store, /*properties*/ storeWidget) { //wdr 3-11
//	debugger;
//	var data = storeWidget._srcElement.getAttribute('data'); //wdr 3-11
//	var url = storeWidget._srcElement.getAttribute('url'); //wdr 3-11
//	if (/*properties.*/data){ //wdr 3-11
//		var value = /*properties.*/data; // wdr 3-11
//		var storeData = eval('storeData = '+value);
//		var data = { identifier: storeData.identifier,  items:[] };
//	
//		var items = data.items;
//		var storeDataItems = storeData.items;
//		for (var r = 0; r < storeDataItems.length; r++){
//			var item = new Object();
//			var dataStoreItem = storeDataItems[r];
//			for (var name in dataStoreItem){
//				//item[name] = dataStoreItem[name][0];
//				item[name] = dataStoreItem[name];
//			}
//			items.push(item);
//		}
//		
//		// Kludge to force reload of store data
//		store.clearOnClose = true;
//		//if (!store.data)
//		store.data = data;
//		delete store.url; // wdr remove old url if switching
//		store.close();
//		store.fetch({
//			query: this.query,
//			queryOptions:{deep:true}, 
//			onComplete: dojo.hitch(this, function(items){
//				for (var i = 0; i < items.length; i++) {
//					var item = items[i];
//					console.warn("i=", i, "item=", item);
//				}
//			})
//		});
//	}else{ // must be url data store
//		// Kludge to force reload of store data
//		store.clearOnClose = true;
//		store.url = /*properties.*/url; // wdr 3-11
//		delete store.data; // wdr remove old url if switching
//		store.close();
//	}
//	
//
//}



});