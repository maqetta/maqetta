dojo.provide("davinci.libraries.dojo.dojo.data.ItemFileReadStoreHelper");

dojo.declare("davinci.libraries.dojo.dojo.data.ItemFileReadStoreHelper", null, {

	getData: function(/*Widget*/ widget, /*Object*/ options){
		if(!widget){
			return undefined;
		}

		var widgetData = widget._getData( options);
		var value = widget._srcElement.getAttribute('data');
		if (value){
			value = eval('newdata=' +value);
			widgetData.properties.data = value;
		} else {
		    if (widget._srcElement.getAttribute('url')) {
		        widgetData.properties.url = widget._srcElement.getAttribute('url'); 
		    } else if (widget.properties) {
		        widgetData.properties.url = widget.properties.url; // get url for undo from data
		    } 
		}
		return widgetData;
	},
	
    preProcess: function(node, context){
        var url = node.getAttribute("url");
        if (!url){
            return;
        }
        url = url.trim();
        var xhrParams = this.getXhrScriptPluginParameters(url, context);
        if (xhrParams){
           var dj = context.getDojo();
           dj.dojox.io.xhrScriptPlugin(xhrParams.url,xhrParams.callback);
        }
            
   
    },
    
    getXhrScriptPluginParameters: function(url, context){

        if (!url){
            return;// must be data
        }
        var scripts = context.model.children[1].getChildElements('script', true);
        for (var x=0; x < scripts.length; x++){
            if (scripts[x].children[0]){
                var child = scripts[x].children[0];
                var start = child.value.indexOf('dojox.io.xhrScriptPlugin');
                if(start > -1) {
                    var end = child.value.indexOf(')', start);
                    // check to see if it matches the store url
                    if (end > -1){
                        var pStart = child.value.indexOf('(', start);
                        var temp = child.value.substring(pStart+1,end);
                        var parms = temp.split(',');
                        if (parms.length == 2){
                            parms[0] = parms[0].replace(/'/g, "");
                            parms[0] = parms[0].replace(/"/g, "");
                            parms[1] = parms[1].replace(/'/g, "");
                            parms[1] = parms[1].replace(/"/g, "");
                            parms[0] = parms[0].trim();
                            if (parms[0] == url){ // must be the one we were looking for.
                                var xhrParams = [];
                                xhrParams.url = parms[0];
                                xhrParams.callback = parms[1];
                                return xhrParams;
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
	
});
