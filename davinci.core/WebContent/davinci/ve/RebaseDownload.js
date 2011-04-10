dojo.provide("davinci.ve.RebaseDownload");
dojo.require("davinci.ve.RebuildPage");

dojo.require("davinci.commands.CommandStack");
dojo.require("davinci.ve.tools.SelectTool");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.util");
dojo.require("davinci.ve.Focus");
dojo.require("davinci.actions.SelectLayoutAction");
dojo.require("davinci.library");
dojo.require("davinci.ve.Context");

dojo.declare("davinci.ve.RebaseDownload", davinci.ve.RebuildPage, {
	
	/* libs should look like:
	 * [{id:'dojo', version '1.8' base:'http://blahblahblah/dojo/'}]
	 * this class will return the modified source
	 * 
	 */
	constructor: function(libs){
		this.libs = libs;
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
	
		if(!requires)
			return;

        dojo.forEach(dojo.filter(requires, function (r){
        	return r.type == 'css';
        }), function(r) {
        	
        	var libVer = davinci.ve.metadata.query(type, "library")[r.$library].version;
    	    var libRoot = this.getLibraryBase(r.$library, libVer);
    	  
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
           	src = libRoot + "/" + src;
           
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
    	    
    	    
            var scriptElements = this._srcDocument.find({'elementType':"HTMLElement", 'tag':'script'});
            
            var foundImport = false;
            if(src)
            	src =libRoot + "/" + src;
            
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
	getLibraryBase : function(id, version){
		for(var name in this.libs){
			var item = this.libs[name];
			if(item['id']==id && item['version']==version)
				return item['base'];
		}
		return davinci.library.getLibRoot(id,version) || "";
	}
	
});