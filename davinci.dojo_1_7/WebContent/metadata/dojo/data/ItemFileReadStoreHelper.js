dojo.provide("davinci.libraries.dojo.dojo.data.ItemFileReadStoreHelper");

dojo.declare("davinci.libraries.dojo.dojo.data.ItemFileReadStoreHelper", null, {

	getData: function(/*Widget*/ widget, /*Object*/ options){
		if(!widget){
			return undefined;
		}

		var widgetData = widget._getData( options);
		var value = widget._srcElement.getAttribute('data');
		var url = widget._srcElement.getAttribute('url');
		var callback = widget._srcElement.getAttribute('jsonpcallback');
		if (value){
			var newdata;
			value = eval('newdata=' +value);
			widgetData.properties.data = value;
		} else {
			widgetData.properties.url = url;
			widgetData.properties.jsonpcallback = callback;
		}
		return widgetData;
	}

});
