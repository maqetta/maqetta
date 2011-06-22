dojo.provide("davinci.ve.RebuildPage");

dojo.require("davinci.commands.CommandStack");
dojo.require("davinci.ve.tools.SelectTool");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.util");
dojo.require("davinci.ve.Focus");
dojo.require("davinci.actions.SelectLayoutAction");
dojo.require("davinci.library");
dojo.require("davinci.ve.Context");
dojo.require("davinci.model.Path");
dojo.require("davinci.ve.Context");


dojo.declare("davinci.ve.RebuildPage", davinci.ve.Context, {
	/* rebuilds a pages imports based on widget dependancies.
	 * useful if dependancies break due to library path changes or missing deps.
	 * 
	 * this uses the library type loader from the Contex.js class
	 * 
	 */
	constructor: function(args){
		dojo.mixin(this, args);
	},
	
	
	getPageCss : function(){
		// returns CSS known to be in the page (our libs, sorta hacky)
		return ["app.css"];
	},
	
	getPageJs : function(){
		// returns CSS known to be in the page (our libs, sorta hacky)
		return ["maqetta/States.js","maqetta/maqetta.js" ];
	},
	
	
	rebuildSource: function(source, resource){
		
		var relativePrefix = "";
		this._srcDocument =  davinci.model.Factory.newHTML();
		
		this._resourcePath = null;
		if(resource)
			this._resourcePath = new davinci.model.Path(resource.getPath());
		else 
			this._resourcePath = new davinci.model.Path("");
		var folderDepth=this._resourcePath.getSegments().length-1;
		if (folderDepth){
			for (var i=0;i<folderDepth;i++){
				relativePrefix+="../";
			}
		}
		this._srcDocument.setText(source, true);
		var themeMetaobject = this.loadThemeMeta(this._srcDocument);
		
		var elements = this._srcDocument.find({'elementType':"HTMLElement"});
		for(var i=0;i<elements.length;i++){
			var n = elements[i];
			var type = n.getAttribute("dojoType") || /*n.getAttribute("oawidget") ||*/ n.getAttribute("dvwidget");
			if(type!=null)
				this.loadRequires(type, true, true, relativePrefix);
		}
		if(themeMetaobject)
			this.changeThemeBase(themeMetaobject['theme'], relativePrefix);
		
		var cssChanges = this.getPageCss();
		var jsChanges = this.getPageJs();
		
		var basePath = new davinci.model.Path(relativePrefix);
		
		for(var i=0;i<cssChanges.length;i++){
			var filename = basePath.append(cssChanges[i]);
			this.addModeledStyleSheet(filename.toString(), cssChanges[i]);
		}
		
		for(var i=0;i<jsChanges.length;i++){
			var filename = basePath.append(jsChanges[i]);
			this.addJavaScript(filename.toString(), null,null,null, jsChanges[i]);
		}
		
		return this._srcDocument.getText();
		
	},


	
	addModeledStyleSheet : function(url, baseSrcPath) {
		
		var elements = this._srcDocument.find({'elementType':"CSSImport"});
		
		for(var i=0;i<elements.length;i++){
			var n = elements[i];
			if(n.url && n.url.indexOf(baseSrcPath) > -1){
				n.url = url;
				return;
			}
		}
		
       this._srcDocument.addStyleSheet(url, null, true);
    },

    addJavaScript : function(url, text, doUpdateModel, doUpdateDojo, baseSrcPath) {
		var elements = this._srcDocument.find({'elementType':"HTMLElement", 'tag': 'script'});
		
		for(var i=0;i<elements.length;i++){
			var n = elements[i];
			var elementUrl = n.getAttribute("src");
			if(elementUrl && elementUrl.indexOf(baseSrcPath) > -1){
				n.setAttribute("src", url);
				return;
			}
		}
		
    	if (url) {
            if(url.indexOf("dojo.js")>-1){
                	// nasty nasty nasty special case for dojo attribute thats required.. need to generalize in the metadata somehow.
               	this.addHeaderScript(url,{'djConfig':"parseOnLoad: true"});
              }
           	this.addHeaderScript(url);
        }else if (text) {
        	this._scriptAdditions = this.addHeaderScriptSrc(text, this._scriptAdditions,this._srcDocument.find({'elementType':"HTMLElement",'tag':'head'}, true));
        }
    },

    changeThemeBase: function(theme, relativePrefix){
   
    	/*
		var modelHead =model.find({'elementType':"HTMLElement",'tag':'head'}, true)
		var modelBody = model.getChildElement('body');
		var modelStyle = model.getChildElements('style');
		*/
		// find the old theme file name
		var basePath = new davinci.model.Path(relativePrefix);
		
		var files = theme.files;
		for (var x=0; x<files.length; x++){
			var filename = basePath.append(theme.file.parent.getPath()).append(theme.files[x]);
			this.addModeledStyleSheet(filename, theme[files[x]]);

		}
	}
    

});