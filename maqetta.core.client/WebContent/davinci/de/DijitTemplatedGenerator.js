dojo.provide("davinci.de.DijitTemplatedGenerator");
dojo.require("davinci.library");
dojo.require("davinci.ve.metadata");


dojo.declare("davinci.de.DijitTemplatedGenerator", null, {

	value : {js:"", widget:""},
	metadata : {},
	
	constructor: function(args){
		dojo.mixin(this, args);
	},
	
	buildSource: function(model, dijitName){
		debugger;
		this.model = this._srcDocument =  model
		var themeMetaobject = davinci.ve.metadata.loadThemeMeta(this._srcDocument);
        var elements = this._srcDocument.find({'elementType' : "HTMLElement"});
		this.value.js+="dojo.provide('" + dijitName + "');\n\n";
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
      
    	this.value.js+="dojo.declare('" + name + "', diji._Templated,{\n" ;
    	
    	var html =  this._srcDocument.find({'elementType' : "HTMLElement", 'tag':'body'}, true);
    	
    	
    	this.value.js+='\ttemplateString:"' + this.escapeHtml(html) + '"\n' ;
    	
    	
    	this.value.js+="\n};";
       
		
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
    	this.value.widget = dojo.fromJson(this.metadata);
		return this.value;
		
	},

	escapeHtml : function(text){
		return text.replace("\"", "\\\"");
	},
	
	loadRequires: function(type, updateSrc, doUpdateModelDojoRequires, skipDomUpdate) {
		
		/* this method is used heavily in RebuildPage.js, so please watch out when changing  API! */
		if (!type) {
			return false;
		}
		
		var module = type.split(".")[0];
		/*
		if (module == "html") {
			// no require
			return true;
		}
		*/
		var requires = davinci.ve.metadata.query(type, "require");
		if (!requires) {
			return true;
		}

		/* add metadata to the entire widgets metadata */
		dojo.mixin(this.metadata, requires);
		
		return dojo.every(requires, function(r) {
		
			var src = r.src;
			if (src) {	// resource with URL
				src = src.toString();
			  
				switch (r.type) {
					case "javascript":
						this.value.js +=src + "\n";
						break;
					default:
						console.warn("Unhandled metadata resource type '" + r.type +
								"' for widget '" + type + "'");
				}
			} else {  // resource with text content
				switch (r.type) {
					case "javascript":
						this.value.js +=r.$text + "\n";
						break;
					default:
						console.warn("Unhandled metadata resource type '" + r.type +
								"' for widget '" + type + "'");
				}
			}
			return true;
		}, this);
	},
	
	

});