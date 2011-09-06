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
		
		if ( !( resource && resource.extension && resource.extension == "html")) return source;
		
		
		this.model = this._srcDocument =  davinci.model.Factory.getNewFromResource(resource);
		
		this._resourcePath = null;
		if(resource)
			this._resourcePath = new davinci.model.Path(resource.getPath());
		else 
			this._resourcePath = new davinci.model.Path("");
		
		this.model.fileName = this._resourcePath.toString();
		/* big cheat here.  removing 1 layer of .. for prefix of project, could figure this out with logic and have infinite project depth */
		
		this._srcDocument.setText(source, true);

		 
        var themeMetaobject = davinci.ve.metadata.loadThemeMeta(this._srcDocument);

        var elements = this._srcDocument.find({'elementType' : "HTMLElement"});
        
        this.loadRequires("html.body", true, true,true);
        
        for ( var i = 0; i < elements.length; i++ ) {
            var n = elements[i];
            var type = n.getAttribute("dojoType")
                    || /* n.getAttribute("oawidget") || */n
                            .getAttribute("dvwidget");
            if (type != null){
            	this.loadRequires(type, true, true, true);
            }
        }
      
        if (themeMetaobject)
            this.changeThemeBase(themeMetaobject['theme'],
                    this._resourcePath);

        /*
        var cssChanges = this.getPageCss();
        var jsChanges = this.getPageJs();

        for ( var i = 0; i < cssChanges.length; i++ ) {
        	var filename = new davinci.model.Path(cssChanges[i]).relativeTo(this._resourcePath);
            //var filename = basePath.append(cssChanges[i]);
            this.addModeledStyleSheet(filename.toString(), cssChanges[i]);
        }

        for ( var i = 0; i < jsChanges.length; i++ ) {
        	var filename = new davinci.model.Path(jsChanges[i]).relativeTo(this._resourcePath);
            this.addJavaScript(filename.toString(), null, null, null,
                    jsChanges[i]);
        }
		*/
		return this._srcDocument.getText();
		
	},


	
	addModeledStyleSheet : function(url, baseSrcPath) {
		// "baseSrcPath" is the tail of the style sheet path
		// * this is so we can determine if a link already exists in the file but has the 
		// * wrong directory
		 //
		
		var elements = this._srcDocument.find({'elementType':"CSSImport"});
		
		for(var i=0;i<elements.length;i++){
			var n = elements[i];
			if(n.url && n.url.indexOf(baseSrcPath) > -1){
				n.setUrl(url);
				return;
			}
		}
		
       this._srcDocument.addStyleSheet(url, null, true);
    },
 
    _findScriptAdditions : function(){
    	// this is a bit gross and dojo specific, but...... guess a necisary evil.
    	   	
    	var documentHeader = this._srcDocument.find({'elementType':"HTMLElement",'tag':'head'}, true);
    	var scriptsInHeader = documentHeader.find({elementType:"HTMLElement", 'tag':'script'});
    	for(var i=0;i<scriptsInHeader.length;i++){
    		var text = scriptsInHeader[i].getText();
    		if(text.indexOf("dojo.require") > -1)
    			return scriptsInHeader[i];
    	}
    	// no requires js header area found
    	return null;
    	
    },
    /*
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
        	this._scriptAdditions = this.addHeaderScriptSrc(text, this._findScriptAdditions(),this._srcDocument.find({'elementType':"HTMLElement",'tag':'head'}, true));
        }
    },
	*/
    changeThemeBase: function(theme, resourcePath){
    	
    	// find the old theme file name
		var files = theme.files;
		/* fixme CHEATING, should determine this programatically */
		var parentPath = (new davinci.model.Path(theme.file.parent.getPath()));
	
		for (var x=0; x<files.length; x++){
			var filename = parentPath.append(theme.files[x]);
			var relativePath = filename.relativeTo(resourcePath, true);
			
			this.addModeledStyleSheet(relativePath.toString(), new davinci.model.Path(theme.files[x]), true);

		}
	}
    

});