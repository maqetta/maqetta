define([
	"dojo/_base/declare",
	"./Context",
	"../model/Path",
	"davinci/model/Factory",
	"dojo/Deferred",
	"dojo/promise/all",
	"davinci/ve/commands/ChangeThemeCommand"
], function(declare, Context, Path, Factory, Deferred, all, ChangeThemeCommand) {

return declare(null, {
	/* rebuilds a pages imports based on widget dependencies.
	 * useful if dependencies break due to library path changes or missing deps.
	 * 
	 * this uses the library type loader from the Contex.js class
	 * 
	 */
	constructor: function(args){
		dojo.mixin(this, args);

		//FIXME: Instantiating a new Context object so we can use loadRequires.  Need to factor this better.
		// This module shouldn't have any dependency on the visual editor code.
		this.context = new Context();
	},
	
	//FIXME: We should be traversing the page looking for CSS and JS files
	//not hardcoding app.css and app.js
	getPageCss: function(){
		// returns CSS known to be in the page (our libs, sorta hacky)
		return ["app.css"];
	},
	
	getPageJs: function(){
		// returns JS known to be in the page (our libs, sorta hacky)
		return ["app.js" ];
	},
	
	
	rebuildSource: function(source, resource, theme, themeSet){
		if ( !( resource && resource.extension && resource.extension == "html")) {
			var deferred = new Deferred();
			deferred.resolve(source);
	        return deferred;
		}

		this.context.model = this.context._srcDocument = Factory.getNewFromResource(resource); //getModel({url: resource.getPath()}); // 2453 getNewFromResource(resource);
		
		var resourcePath = new Path(resource ? resource.getPath() : "");
		
		this.context.model.fileName = resourcePath.toString();
		/* big cheat here.  removing 1 layer of .. for prefix of project, could figure this out with logic and have infinite project depth */
		
		this.context._srcDocument.setText(source, true);
		
		/* make sure this isn't an HTML fragment */
		var headless = this.context._srcDocument.find({elementType: "HTMLElement", 'tag':'html'}, true);
		if(headless==null){
			var deferred = new Deferred();
			deferred.resolve(source);
	        return deferred;
		}
		 
        var elements = this.context._srcDocument.find({elementType: "HTMLElement"}),
        	promises = [];

        promises.push(this.context.loadRequires("html.body", true, true, true));
        
        for ( var i = 0; i < elements.length; i++ ) {
            var n = elements[i];
            var type = n.getAttribute("data-dojo-type") || n.getAttribute("dojoType") || n.getAttribute("dvwidget");
            if (type != null){
            	promises.push(this.context.loadRequires(type.replace(/\./g, "/"), true, true, true));
            }
        }

        if (theme) {
            this.changeThemeBase(theme, resourcePath);
        }
        
        if (themeSet && themeSet.mobileTheme ){
        	var c = new ChangeThemeCommand(themeSet, this.context);
        	c._dojoxMobileAddTheme(this.context, themeSet.mobileTheme);
        }
       
        var cssChanges = this.getPageCss();
        var jsChanges = this.getPageJs();

        var basePath = this.context._getCurrentBasePath();
        var resourceParentPath = resourcePath.getParentPath();
        for ( var i = 0; i < cssChanges.length; i++ ) {
            var cssFilePath = basePath.append(cssChanges[i]);
            var cssFileString = cssFilePath.relativeTo(resourceParentPath).toString();
            this.addModeledStyleSheet(cssFileString, cssChanges[i]);
        }

        for ( var i = 0; i < jsChanges.length; i++ ) {
            var jsFilePath = basePath.append(jsChanges[i]);
            var jsFileString = jsFilePath.relativeTo(resourceParentPath).toString();
            this.addJavaScript(jsFileString, null, null, null, jsChanges[i]);
        }
        var deferred = new Deferred();
        all(promises).then(function(){
        	deferred.resolve(this.context._srcDocument.getText());
        }.bind(this));
        return deferred;
	},
	
	addModeledStyleSheet: function(url, baseSrcPath) {
		// "baseSrcPath" is the tail of the style sheet path
		// * this is so we can determine if a link already exists in the file but has the 
		// * wrong directory
		 //
		
		var elements = this.context._srcDocument.find({elementType: "CSSImport"});
		if (elements.some(function(n) {
			if(n.url && n.url.indexOf(baseSrcPath) > -1){
				n.setUrl(url);
				return true;
			}
		})) {
			return;
		}

		/*FIXME: This is needed for LINK elements	
       this.context._srcDocument.addStyleSheet(url, null, true);
*/
    },

    addJavaScript: function(url, text, doUpdateModel, doUpdateDojo, baseSrcPath) {
		var elements = this.context._srcDocument.find({elementType: "HTMLElement", tag: 'script'});
		if (elements.some(function(n) {
			var elementUrl = n.getAttribute("src");
			if(elementUrl && elementUrl.indexOf(baseSrcPath) > -1){
				n.setAttribute("src", url);
				return true;
			}			
		})) {
			return;
		}

    	if (url) {
            if(url.indexOf("dojo.js")>-1){
                	// nasty nasty nasty special case for dojo attribute thats required.. need to generalize in the metadata somehow.
               	this.context.addHeaderScript(url,{'data-dojo-config': "parseOnLoad: true"});
            }
           	this.context.addHeaderScript(url);
        }
    },

    changeThemeBase: function(theme, resourcePath){
    	
		var parentPath = new Path(theme.getFile().parent.getPath());
		var addFile = function(file) {
			var filename = parentPath.append(file);
			var relativePath = filename.relativeTo(resourcePath, true);
			this.addModeledStyleSheet(relativePath.toString(), new Path(file), true);
		}.bind(this);

		theme.files.forEach(addFile);
		if (theme.conditionalFiles) {
			theme.conditionalFiles.forEach(addFile);
		}
	}
});
});
