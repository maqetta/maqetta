define([
    "dojo/_base/array",
    "dojo/dom-style",
    "davinci/model/Path",
    "davinci/html/HTMLElement",
    "davinci/html/HTMLText",
    "davinci/Theme",
    "dojo/_base/sniff"
], function(
    array,
    domStyle,
    Path,
    HTMLElement,
    HTMLText,
    Theme,
    has
) {

return {

	getHeadStyleString: function() {
	    return '';
	},
	
	preThemeConfig: function(context) {
		
		if(!has("webkit")) {
			/*
			 * Only add the compat CSS files if no webkit
			 */
			var themeRoot = Theme.getThemeLocation();
			var relFilePath = themeRoot.relativeTo('./'+themeRoot+'/'+context.theme.name+'/'+context.theme.themeEditorHtmls[0], true);
			var relativePath = '';
			for (var i = 0; i < relFilePath.segments.length; i++){
				relativePath = relativePath +relFilePath.segments[i]+'/';
			}
			if (context.theme.compatFiles) {
				for(var i = 0; i < context.theme.compatFiles.length; i++){
					var compatCss = relativePath+context.theme.name+'/'+context.theme.compatFiles[i]
					var link = context.getDocument().createElement("link");
					link.href = compatCss;
					link.type = "text/css";
					link.rel = "stylesheet";
					var head = context.getDocument().getElementsByTagName('head')[0];
					head.appendChild(link);
				}
			}
		}
	},
	
	getHeadImports: function(theme){
	    return '';
	},
	
	
	onContentChange: function(context, theme){
		if(!context || !context.editor || !context.editor.isActiveEditor()){
			return;
		}
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
			if(nodes.length>0){
				var props = ['backgroundAttachment', 'backgroundClip', 'backgroundColor', 'backgroundImage', 
				             'backgroundOrigin', 'backgroundPosition', 'backgroundRepeat', 'backgroundSize',
				             'color','fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant'];
				// Using setTimeout because BODY style may not be fully baked
				// due to browser quirks with delayed computation of computed style.
				setTimeout(function(){
					var body_style = domStyle.get(body);
					for(var i=0; i<nodes.length; i++){
						var style = nodes[i].style;
						props.forEach(function(prop){
							style[prop] = body_style[prop];
						});
					}
				},50);
			}	
		}
	}
  
};

});