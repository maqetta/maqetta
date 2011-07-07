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
}

});