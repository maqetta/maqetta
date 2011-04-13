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

dojo.declare("davinci.ve.RebuildPage", null, {
	/* rebuilds a pages imports based on widget dependancies.
	 * useful if dependancies break due to library path changes or missing deps.
	 * 
	 */
	constructor: function(args){
		dojo.mixin(this, args);
	},
	
	rebuildSource: function(source, resource){
		
		this._srcDocument =  davinci.model.Factory.newHTML();
		
		this._resourcePath = null;
		if(resource)
			this._resourcePath = new davinci.model.Path(resource.getPath());
		else 
			this._resourcePath = new davinci.model.Path("");
		
		this._srcDocument.setText(source, true);
		var elements = this._srcDocument.find({'elementType':"HTMLElement"});
		for(var i=0;i<elements.length;i++){
			var n = elements[i];
			var type = n.getAttribute("dojoType") || /*n.getAttribute("oawidget") ||*/ n.getAttribute("dvwidget");
			if(type!=null)
				this.loadRequires(type);
		}
		return this._srcDocument.getText();
		
	},
	getLibraryBase : function(id, version){
		return davinci.library.getLibRoot(id,version);
	},

	loadRequires: function(type){
		
		if(!type){
			return false;
		}
		var module = type.split(".")[0];
		if(module == "html"){
			// no require
			return true;
		}
		
		//var theme = this.getHeader().theme;
		var requires = davinci.ve.metadata.query(type, "require");
	//	var relativePrefix= this.getLibraryBase(requires['id'], requires['version']);
	
		if(requires==null) return;
		
        dojo.forEach(dojo.filter(requires, function (r){
        	return r.type == 'css';
        }), function(r) {
        	
        	var libVer = davinci.ve.metadata.query(type, "library")[r.$library].version;
    	    var libRoot = this.getLibraryBase(r.$library, libVer);
    	    var baseUrl = new  davinci.model.Path(libRoot);
    	    var relativeTo = baseUrl.relativeTo( this._resourcePath, true);
            var src = r.src;
            /*
            if (r.$library) {
                src = davinci.ve.metadata.query(type, "library")[r.$library].src + src;
            }
          	*/
           
           var absSource = src;
           while(absSource.charAt(0)=="." || absSource.charAt(0)=="/")
        	   absSource = absSource.substring(1);
           var scriptElements = this._srcDocument.find({'elementType':"CSSImport"});
           
           
           if(src)
           	src = relativeTo.append(src).toString();
           
           for(var p=0;p<scriptElements.length;p++){
        	   var url = scriptElements[p].url;
        	 
        	   if(url && url.indexOf(absSource) > -1){
        		   scriptElements[p].url = src;
        		   foundImport = true;
        	   }
        		   
        	   
           }
            
           if (!foundImport) {   
            this.addModeledStyleSheet(src) ;
           }
        }, this);
        dojo.forEach(dojo.filter(requires, function (r) {
        	return r.type == 'javascript';
        }), function(r) {
        	
        	var src = r.src;
            if(!src)
            	return;
            var absSource = src;
            while(absSource.charAt(0)=="." || absSource.charAt(0)=="/")
         	   absSource = absSource.substring(1);
            var libVer = davinci.ve.metadata.query(type, "library")[r.$library].version;
    	    var libRoot = this.getLibraryBase(r.$library, libVer);
    	    var baseUrl = new davinci.model.Path(libRoot);
    	    var relativeTo = baseUrl.relativeTo( this._resourcePath, true);
            var scriptElements = this._srcDocument.find({'elementType':"HTMLElement", 'tag':'script'});
            
            var foundImport = false;
            if(src)
            	src = relativeTo.append(src).toString();
            
            for(var p=0;p<scriptElements.length;p++){
         	   var url = scriptElements[p].getAttribute("src");
         	   if(url && url.indexOf(absSource) > -1){
         		   scriptElements[p].setAttribute("src", src);
         		   foundImport = true;
         	   }
            }
            if (!foundImport) {    // JavaScript URL
                /*
            	if (r.$library) {
                    src = davinci.ve.metadata.query(type, "library")[r.$library].src + src;
                }
                */
              
                this.addJavaScript(src);
            } 
        }, this);
		return true;
	},
	addModeledStyleSheet : function(url) {
       
        if (!this._srcDocument.hasStyleSheet(url)) {
            this._srcDocument.addStyleSheet(url, null, true);
           
        }
    },
    addJavaScript : function(url, text) {
	    if (url) {
            if(url.indexOf("dojo.js")>-1){
                	// nasty nasty nasty special case for dojo attribute thats required.. need to generalize in the metadata somehow.
               	this.addHeaderScript(url,{'djConfig':"parseOnLoad: true"});
              }
           	this.addHeaderScript(url);
        } 
    },

	// add script URL to HEAD
	addHeaderScript: function(url, attributes) {
		var script = new davinci.html.HTMLElement('script');
		script.addAttribute('type', 'text/javascript');
		script.addAttribute('src', url);
		
		if(attributes){
			for(var name in attributes){
				script.addAttribute(name, attributes[name]);
				
			}
		}
		
		 var head = this._srcDocument.find({'elementType':"HTMLElement",'tag':'head'}, true);
		 head.addChild(script);
	}
});