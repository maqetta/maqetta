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
	
	rebuildSource: function(source, resource){
		
		this._srcDocument =  davinci.model.Factory.newHTML();
		
		this._resourcePath = null;
		if(resource)
			this._resourcePath = new davinci.model.Path(resource.getPath());
		else 
			this._resourcePath = new davinci.model.Path("");
		
	
		var folderDepth=this._resourcePath.getSegments().length-1;
		if (folderDepth){
			for (var i=0;i<folderDepth;i++){
				this.relativePrefix+="../";
			}
		}
		
		
		this._srcDocument.setText(source, true);
		var elements = this._srcDocument.find({'elementType':"HTMLElement"});
		for(var i=0;i<elements.length;i++){
			var n = elements[i];
			var type = n.getAttribute("dojoType") || /*n.getAttribute("oawidget") ||*/ n.getAttribute("dvwidget");
			if(type!=null)
				this.loadRequires(type, true);
		}
		return this._srcDocument.getText();
		
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