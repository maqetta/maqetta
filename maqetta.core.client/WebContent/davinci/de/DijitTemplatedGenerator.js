dojo.provide("davinci.de.DijitTemplatedGenerator");
dojo.require("davinci.library");
dojo.require("davinci.ve.metadata");


dojo.declare("davinci.de.DijitTemplatedGenerator", null, {

	value : {js:"", metadata:""},
	metadata : {},
	dijitName : null,
	
	
	constructor: function(args){
		dojo.mixin(this, args);
	},
	
	buildSource: function(model, dijitName){
		
		
		this.value.js = "";
	
		this.dijitName = dijitName;
		this.metadata = {id:dijitName, name: dijitName, spec:"1.0", version: "1.0", require:[]};
		this.model = this._srcDocument =  model;
		/* no need to bother with the theme */
		//var themeMetaobject = davinci.ve.metadata.loadThemeMeta(this._srcDocument);

		var elements = this._srcDocument.find({'elementType' : "HTMLElement"});
		this.value.js+="dojo.provide('" + dijitName + "');\n\n";
		this.value.js+="dojo.require('dijit._Templated');\n\n";
		
		
		/* build the dojo.requires(...) top bits */
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
        /* build the templated class */
    	this.value.js+="dojo.declare('" + this.dijitName + "', [dijit._Widget, dijit._Templated],{\n" ;
    	var html =  this._srcDocument.find({'elementType' : "HTMLElement", 'tag':'body'}, true);
    	var bodyChildren = html.children;
    	
    	var htmlString = "\t\t<div>"
    	for(var i=0;i<bodyChildren.length;i++){
    		htmlString += bodyChildren[i].getText();
    	}
    	
    	htmlString +="</div>";
    	this.value.js+='\ttemplateString:"' + this.escapeHtml(htmlString) + '",\n' ;
    	this.value.js+='\twidgetsInTemplate:true\n' ;
    	this.value.js+="\n});";
    	
    	this.metadata.content = "<div></div>"
    	this.metadata.require.push({type:"javascript", $text:"dojo.require(\'" + dijitName + "');"});
    	
    	
    	this.value.metadata = dojo.toJson(this.metadata);
		return this.value;
		
	},

	escapeHtml : function(text){
		
		var newText = text.replace(/"/g, "\\\"");
		newText = newText.replace(/\n/g,"");
		return newText;
	},
	
	addMetaData : function(row){
		
		for(var i=0;i<this.metadata.require.length;i++){
			var m = this.metadata.require[i];
			if(m.$library==row.$library && m.src==row.src && m.type==row.type)
				return;
		}
		
		this.metadata.require.push({$library:row.$library, src:row.src, type:row.type});
	},
	
	loadRequires: function(type, updateSrc, doUpdateModelDojoRequires, skipDomUpdate) {
		
		/* this method is used heavily in RebuildPage.js, so please watch out when changing  API! */
		if (!type) {
			return false;
		}
		
		var module = type.split(".")[0];
		var requires = davinci.ve.metadata.query(type, "require");
		if (!requires) {
			return true;
		}
		/* builds out the metadata object.
		 * dojo.requires(..) are added to the js file itself.  
		 * the only deps that make it to metadata are .js and .css includes
		 * 
		 */
		
		return dojo.every(requires, function(r) {
			if(r.$library) this.addMetaData({$library:r.$library, src:r.src, type:r.type});
			if(r.type=="javascript" && r.$text){
				
				if(!(this.value.js.indexOf(r.$text)>0))
					this.value.js+= r.$text + "\n";
			}
			return true;
		}, this);
	},
	
	

});