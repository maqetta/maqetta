define([
    "dojo/_base/array",
    "dojo/dom-style",
    "davinci/model/Path",
    "davinci/html/HTMLElement",
    "davinci/html/HTMLText"
], function(
    array,
    domStyle,
    Path,
    HTMLElement,
    HTMLText
) {

return {

	getHeadStyleString: function() {
	    return '';
	},
	
	preThemeConfig: function(context) {
		
        var dm = context.getDojo().getObject("dojox.mobile", true);
        var base = context._visualEditor.theme.base;
        dm.themeFiles = [];
        dm.themeMap=[[".*",base,[context._visualEditor.theme.files[0]]]];

	},
	
	getHeadImports: function(theme){
	    return '';
	},
	
	addTheme: function(context, theme){
	    // add the theme to the dojox.mobile.themeMap
        context.loadRequires("dojox.mobile.View", true); //  use this widget to get the correct requires added to the file.
	    var htmlElement = context._srcDocument.getDocumentElement();
        var head = htmlElement.getChildElement("head");
        var scriptTags=head.getChildElements("script");

        array.forEach(scriptTags, function (scriptTag){
            var text=scriptTag.getElementText();
            if (text.length) {
                // Look for a require('dojox.mobile'); in the document, if found set the themeMap 
                var start = text.indexOf('dojox.mobile');
                if (start > 0){
                    var stop = text.indexOf(';', start);
                    if (stop > start){
                        var themeMap;
                        if (theme.themeMap){
                            themeMap = theme.themeMap;
                            if (themeMap.toLowerCase() === 'default'){
                                themeMap = null;
                            } else {
                                themeMap = text.substring(0,stop+1) + '\ndojox.mobile.themeMap=' +
                                        themeMap + ';' + text.substring(stop + 1);
                            }
                        } else {
                            var ssPath = new Path(theme.file.parent.getPath()).append(theme.files[0]);
                            var resourcePath = context.getFullResourcePath();
                            var newFilename = ssPath.relativeTo(resourcePath, true);
                            var base = "iphone";
                            if (theme.base){
                                base = theme.base;
                            }
                            themeMap = text.substring(0,stop+1) + '\ndojox.mobile.themeMap=[[".*","' +
                                    base + '",["' + newFilename + '"]]];' + text.substring(stop+1);
                        }
                        if(themeMap){
                            // create a new script element
                            var script = new HTMLElement('script');
                            script.addAttribute('type', 'text/javascript');
                            script.script = "";
                            head.insertBefore(script, scriptTag);
                            var newScriptText = new HTMLText();
                            newScriptText.setText(themeMap); 
                            script.addChild(newScriptText); 
                            scriptTag.parent.removeChild(scriptTag);
                        }
                        
                    }
                }
             }
        }, this);
        var device = context.getMobileDevice() || 'none';
        var dm = context.getDojo().getObject("dojox.mobile", true);
        dm.loadDeviceTheme(device);
	},
	
	removeTheme: function(context, theme) {
	    // remove the theme from the dojox.mobile.themeMap
        var htmlElement = context._srcDocument.getDocumentElement();
        var head = htmlElement.getChildElement("head");
        var scriptTags=head.getChildElements("script");
        var resourcePath = context.getFullResourcePath();
        var ssPath = new Path(theme.file.parent.getPath()).append(theme.files[0]);
        var newFilename = ssPath.relativeTo(resourcePath, true);
        array.forEach(scriptTags, function (scriptTag){
            var text=scriptTag.getElementText();
            var stop = 0;
            var start;
            if (text.length) {
                // Look for a dojox.mobile.themeMap in the document, if found set the themeMap
                while ((start = text.indexOf('dojox.mobile.themeMap', stop)) > -1 ){ // might be more than one.
                    stop = text.indexOf(';', start);
                    if (stop > start){
                        text = text.substring(0,start) + text.substring(stop+1);
                      }
                }
                var script = new HTMLElement('script');
                script.addAttribute('type', 'text/javascript');
                script.script = "";
                head.insertBefore(script, scriptTag);
                var newScriptText = new HTMLText();
                newScriptText.setText(text); 
                script.addChild(newScriptText); 
                scriptTag.parent.removeChild(scriptTag);
             }
        }, this);
        var device = context.getMobileDevice() || 'none';
        var dm = context.getDojo().getObject("dojox.mobile", true);
        var dj = context.getDojo();
        var url = dj.moduleUrl('dojox.mobile', 'themes/iphone/ipad.css');
        // reset themeMap to default
        dm.themeMap=[
            ["Android","android",[]],
            ["BlackBerry","blackberry",[]],
            ["iPad","iphone",[url]],
            ["Custom","custom",[]],
            [".*","iphone",[]]
        ];
        dm.loadDeviceTheme(device);
	},
	
	onContentChange: function(context, theme){
		var userDoc, useBodyFontBackgroundClass;
		if(context && context.rootNode){
			userDoc = context.rootNode.ownerDocument;
		}
		if(theme){
			useBodyFontBackgroundClass = theme.useBodyFontBackgroundClass;
		}
		if(userDoc && useBodyFontBackgroundClass){
			var nodes = userDoc.querySelectorAll('.'+useBodyFontBackgroundClass);
			var body = userDoc.body;
			var body_style = domStyle.get(body);
			if(nodes.length>0){
				var props = ['backgroundAttachment', 'backgroundClip', 'backgroundColor', 'backgroundImage', 
				             'backgroundOrigin', 'backgroundPosition', 'backgroundRepeat', 'backgroundSize',
				             'color','fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant'];
				for(var i=0; i<nodes.length; i++){
					var style = nodes[i].style;
					props.forEach(function(prop){
						style[prop] = body_style[prop];
					});
				}
			}	
		}
	}
  
};

});