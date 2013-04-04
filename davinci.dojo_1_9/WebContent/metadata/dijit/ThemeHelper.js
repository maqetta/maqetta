define([
    "dojo/_base/array",
    "dojo/dom-style",
    "davinci/Runtime",
    "davinci/model/Path",
    "davinci/html/HTMLElement",
    "davinci/html/HTMLText",
    "davinci/html/CSSImport",
    "davinci/Theme",
    "davinci/model/Factory",
    "dojo/_base/sniff"
], function(
    array,
    domStyle,
    Runtime,
    Path,
    HTMLElement,
    HTMLText,
    CSSImport,
    Theme,
    Factory,
    has
) {

return {
	/**
	 * Called when widgets is added or deleted.
	 * Looks at current document and decide if we need to update the document
	 * to include or exclude document.css
	 */
	widgetAddedOrDeleted: function(context, resetEverything){
		
		var dojoOptions = Runtime.getSiteConfigData('dojoOptions');
		var include_document_css = (dojoOptions && dojoOptions.include_document_css) || {};
		
		// Include only if at least one dijit widget and no dojox.mobile widgets.
		function checkWidgetTypePrefix(widget, prefix){
			if(widget.type.indexOf(prefix)===0){
				return true;
			}
			var children = widget.getChildren();
			for(var j=0; j<children.length; j++){
				var retval = checkWidgetTypePrefix(children[j], prefix);
				if(retval){
					return retval;
				}
			}
			return false;
		}
		var anyDojoxMobileWidgets = false;
		var topWidgets = context.getTopWidgets();
		for(var i=0; i<topWidgets.length; i++){
			anyDojoxMobileWidgets = checkWidgetTypePrefix(topWidgets[i], 'dojox/mobile/');
			if(anyDojoxMobileWidgets){
				break;
			}
		}
		// If the current document has changed from having zero dojox.mobile widgets to at least one
		// or vice versa, then either remove or add document.css.
		var themeCssRootArr = context._themeUrl.split('/');
		themeCssRootArr.pop();
		var documentFileName= themeCssRootArr.join('/') + '/' + context.theme.conditionalFiles[0];
		if(resetEverything ||context.anyDojoxMobileWidgets !== anyDojoxMobileWidgets){
			var documentCssHeader, documentCssImport, themeCssHeader, themeCssImport;
			var header = dojo.clone( context.getHeader());
			for(var ss=0; ss<header.styleSheets.length; ss++){
				if(header.styleSheets[ss] == documentFileName){
					documentCssHeader = header.styleSheets[ss];
				}
				if(header.styleSheets[ss] == context._themeUrl){
					themeCssHeader = header.styleSheets[ss];
				}
			}
			var imports = context.model.find({elementType:'CSSImport'});
			for(var imp=0; imp<imports.length; imp++){
				if(imports[imp].url == documentFileName){
					documentCssImport = imports[imp];
				}
				if(imports[imp].url == context._themeUrl){
					themeCssImport = imports[imp];
				}
			}
			// If resetEverything flag is set, or is at least one dojo mobile widget, or
			// if include_document_css.desktop === false, then delete all current occurrences
			// of document.css. 
			// Note: if there are no dojoxmobile widgets, and if include_document_css.desktop !== false,
			// then the next block will add document.css back in.
			if(resetEverything || 
					(!anyDojoxMobileWidgets && include_document_css.desktop === false) || 
					(anyDojoxMobileWidgets && include_document_css.mobile !== true)){
				if(documentCssHeader){
					var idx = header.styleSheets.indexOf(documentCssHeader);
					if(idx >= 0){
						header.styleSheets.splice(idx, 1);
						context.setHeader(header);
					}
				}
				if(documentCssImport){
					var parent = documentCssImport.parent;
					parent.removeChild(documentCssImport);
					documentCssImport.close(); // removes the instance from the Factory
					context.onContentChange(); 
					context.editor.editorContainer.save(true); // save working copy
				}
				documentCssHeader = documentCssImport = null;
			}
			if((!anyDojoxMobileWidgets && include_document_css.desktop !== false) ||
					(anyDojoxMobileWidgets && include_document_css.mobile === true)){
				if(!documentCssHeader && themeCssHeader){
					var themeCssRootArr = themeCssHeader.split('/');
					themeCssRootArr.pop();
					var documentCssFileName = themeCssRootArr.join('/') +  '/' + context.theme.conditionalFiles[0];
					header = dojo.clone(header);
					header.styleSheets.splice(0, 0, documentCssFileName);
					context.setHeader(header);
				}
				if(!documentCssImport && themeCssImport){
					var themeCssRootArr = themeCssImport.url.split('/');
					themeCssRootArr.pop();
					var documentCssFileName = themeCssRootArr.join('/') +  '/' + context.theme.conditionalFiles[0];
					var basePath = context.getFullResourcePath().getParentPath();
					var documentCssPath = basePath.append(documentCssFileName).toString();
					var documentCssFile = system.resource.findResource(documentCssPath);
					var parent = themeCssImport.parent;
					if(parent && documentCssFile){
						var css = new CSSImport();
						css.url = documentCssFileName;
						var args = {url:documentCssPath, includeImports: true};
						var cssFile = Factory.getModel(args); 
						css.cssFile = cssFile; 
						parent.addChild(css,0);
					}
				}
			}
			if(anyDojoxMobileWidgets && !context.anyDojoxMobileWidgets){
				// this is the first time we found a mobile widget so ensure the mobile
				// css files are loaded 
				context._configDojoxMobile(true); // no need to refresh the deviceTheme.loadDevice the require will have done it.
			}
			context.anyDojoxMobileWidgets = anyDojoxMobileWidgets;
		}
	}, 


					
	preThemeConfig: function(context) {
		
		function addStyleSheet(url){
			var doc = context.getDocument();
			var headElem = doc.getElementsByTagName('head')[0]
			dojo.withDoc(doc, function() {
		        var link = dojo.create('link', {
		            rel: 'stylesheet',
		            type: 'text/css',
		            href: url
		        });
		        headElem.appendChild(link);
			});
		}

		var themeBase = Theme.getThemeLocation(); 
		var relPath = themeBase.relativeTo(context.visualEditor.basePath, true);
		var conditionalCssFiles = [];
		context.theme.conditionalFiles.forEach(function(file){
			var relPathFile = relPath.toString()+'/'+context.theme.name+'/'+file;
			addStyleSheet(relPathFile);
			var cssFile = Factory.getModel({
				url: themeBase.toString() + '/'+context.theme.name+'/'+file,
			    includeImports: true,
			});
			conditionalCssFiles.push(cssFile);
			context.editor._loadedCSSConnects.push(dojo.connect(cssFile, 'onChange', context,'_themeChange'));
			
		}.bind(this));
		context.cssFiles = context.cssFiles.concat(conditionalCssFiles);
		
	},

  
};

});