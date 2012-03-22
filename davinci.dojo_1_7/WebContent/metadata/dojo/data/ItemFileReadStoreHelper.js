define([
	"dojo/_base/array",
	"davinci/html/HTMLElement",
	"davinci/html/HTMLText"
], function(
	array,
	HTMLElement,
	HTMLText
) {

var ItemFileReadStoreHelper = function() {};
ItemFileReadStoreHelper.prototype = {

	getData: function(/*Widget*/ widget, /*Object*/ options){
		if(!widget){
			return undefined;
		}

		var widgetData = widget._getData( options);
		var value = widget._srcElement.getAttribute('data');
		if (value){
			widgetData.properties.data = JSON.parse(value);;
		} else {
			if (widget._srcElement.getAttribute('url')) {
				widgetData.properties.url = widget._srcElement.getAttribute('url'); 
			} else if (widget.properties) {
				widgetData.properties.url = widget.properties.url; // get url for undo from data
			} 
		}
		return widgetData;
	},
	
	preProcessData: function(data){
		// clean up the store items so that the store can be recreated if undo or redo
		if (data.properties.data){
			if (data.properties.data.items) {
				data.properties.data.items.forEach(function(item){
					delete item._0;
					delete item._RI;
					delete item._S;
					delete item._widgetId;
				});
			} else {
				var d = JSON.parse(data.properties.data);
				data.properties.data = d;
			}
		}
		return data;
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
           try{
        	   dj.require('dojo/data/ItemFileReadStore'); // needed for first loading of html file
        	   dj.require('dojox/io/xhrScriptPlugin');	  // needed for first loading of html file
               dj.dojox.io.xhrScriptPlugin(xhrParams.url,xhrParams.callback);
           }catch(e){
               console.warn("FAILED: failure for loading dojox.io.xhrScriptPlugin("+xhrParams.url+","+xhrParams.callback+");");
           }
        }
    },
    
    getXhrScriptPluginParameters: function(url, context) {
        if (!url){
            return;// must be data
        }
        var scripts = context.model.children[1].getChildElements('script', true);
        for (var x=0; x < scripts.length; x++){
            if (scripts[x].children[0]){
                var child = scripts[x].children[0];
                var start = child.value.indexOf('dojox/io/xhrScriptPlugin');
                if(start > -1) {
                    // look for function
                    start  = child.value.indexOf('function', start);
                    if (start > -1) {
                        var end = child.value.indexOf('}', start);
                        // check to see if it matches the store url
                        if (end > -1){
                            var pStart = child.value.indexOf('{', start);
                            var temp = child.value.substring(pStart+1,end);
                            var urlStart = temp.indexOf(url);
                            if (urlStart > -1){
                                var urlStop = temp.indexOf(')', urlStart),
                                    urlTemp = temp.substring(urlStart, urlStop ),
                                    parms = urlTemp.split(',');
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
            }
        }
        return null;
    },
    
    setXhrScriptPluginParameters: function(url, context) {
        var htmlElement = context._srcDocument.getDocumentElement();
        var head = htmlElement.getChildElement("head");
        var scriptTags=head.getChildElements("script");
        array.forEach(scriptTags, function (scriptTag){
            var text=scriptTag.getElementText();
            if (text.length) {
                // Look for a require(['dojox/io/xhrScriptPlugin']); in the document
                var start = text.indexOf('dojox/io/xhrScriptPlugin');
                if (start > 0){
                    var stop = text.indexOf(']', start);
                    if (stop > start){
                        var newText;
                        var end = text.indexOf(';', stop);
                        // check for ,function(x)
                        start  = text.indexOf('function', stop, end);
                        if (start > -1) {
                            // function is defined 
                            var endOfFunction = text.indexOf('}', start);
                            var urlStart = text.indexOf(url, stop, endOfFunction);
                            if (urlStart < 0) {
                                // callback not defined, so just add it
                                var objStart = text.indexOf('(', start);
                                var objStop = text.indexOf(')', start);
                                var objName = text.substring(objStart+1,objStop);
                                objName = objName.trim();
                                newText = text.substring(0,endOfFunction) + ' ' + objName + '('+url+');'+ text.substring(endOfFunction);
                            }
                        } else {
                            // function is not defined
                            newText = text.substring(0,stop+1) + ',function(xhrScriptPlugin){xhrScriptPlugin('+url+');}' + text.substring(stop+1);
                        }
                        if (newText){
                            // create a new script element
                            var script = new HTMLElement('script');
                            script.addAttribute('type', 'text/javascript');
                            script.script = "";
                            head.insertBefore(script, scriptTag);
                            var newScriptText = new HTMLText();
                            newScriptText.setText(newText); 
                            script.addChild(newScriptText); 
                            scriptTag.parent.removeChild(scriptTag);
                        }
                    }
                }
            }
        });
    }
	
};

return ItemFileReadStoreHelper;

});
