dojo.provide("davinci.ve.commands.ChangeThemeCommand");


dojo.declare("davinci.ve.commands.ChangeThemeCommand", null, {

	name: "changeTheme",

	constructor: function(newTheme, context){
		this._newTheme = newTheme;
		this._context = context;
		this._oldTheme = this._context.getTheme();
	},

	execute: function(){
		this._changeTheme(this._newTheme, this._oldTheme);

	},

	undo: function(){
		this._changeTheme(this._oldTheme, this._newTheme);
	},
	
	_changeTheme: function(newThemeInfo, oldTheme){
	    if (oldTheme){
	        this.removeTheme(oldTheme);
	    }
	    if (newThemeInfo){
	        this.addTheme(newThemeInfo);
	    }
	    var text = this._context.getModel().getText();
        var e = davinci.Workbench.getOpenEditor();
        e.setContent(e.fileName,text); // force regen of HTML Model to load new theme
     // Recompute styling properties in case we aren't in Normal state
        davinci.ve.states.resetState(this._context.rootWidget);
	},
	
		
	removeTheme: function(oldTheme){
	    var helper = davinci.theme.getHelper(oldTheme);
	    if (helper && helper.removeTheme){
	      helper.removeTheme(this._context, oldTheme);  
	    } else {
	        var modelDoc = this._context.getModel().getDocumentElement(); 
	        var d = this._context.getDocument();
	        var modelHead = modelDoc.getChildElement('head');
	        var b = d.getElementsByTagName("body");
	        var modelBody = modelDoc.getChildElement('body');
	        
	        var header = dojo.clone( this._context.getHeader());
	        var resourcePath = this._context.getFullResourcePath();
	        // find the old theme file name
	        function sameSheet(headerSheet, file){
	            return (headerSheet.indexOf(file) > -1)
	        }
	        
	        var files = oldTheme.files;
	        
	        for (var x=0; x<files.length; x++){
	            var filename = files[x];
	            for (var y=0; y<header.styleSheets.length; y++){
	                
	                if(sameSheet(header.styleSheets[y], filename)){
	                    // found the sheet to change
		                    
	                    var modelAttribute = modelBody.getAttribute('class');
	                    modelAttribute = modelAttribute.replace(oldTheme.className,'');
	                    header.bodyClass = modelAttribute;
	                    modelBody.removeAttribute('class');
	                    if (modelAttribute.length > 0){
	                        modelBody.addAttribute('class',modelAttribute, false);
	                    }
	                    this._context.setHeader(header);
	                    var importElements = modelHead.find({elementType:'CSSImport'});
	                    
	                    for(var i=0;i<importElements.length;i++){
	                        if(sameSheet(importElements[i].url, filename)){
	                            importElements[i].url = 'x';
	                            importElements[i].parent.removeChild(importElements[i]);
	                            delete importElements[i];
	                            break;
	                        }
	                    }   

	                }
	            }

	        }
	    }    
	      
	},
	
	addTheme: function(newThemeInfo){
	    var helper = davinci.theme.getHelper(newThemeInfo);
        if (helper && helper.addTheme){
          helper.addTheme(this._context, newThemeInfo);  
        } else {
    	    var modelDoc = this._context.getModel().getDocumentElement(); 
            var d = this._context.getDocument();
            var modelHead = modelDoc.getChildElement('head');
            var b = d.getElementsByTagName("body");
            var modelBody = modelDoc.getChildElement('body');
            
            var header = dojo.clone( this._context.getHeader());
            var resourcePath = this._context.getFullResourcePath();
          
           
            var ssPath = new davinci.model.Path(newThemeInfo.file.parent.getPath()).append(newThemeInfo.files[0]);
            newFilename = ssPath.relativeTo(resourcePath, true);
            header.styleSheets[header.styleSheets.length] = newFilename;
            
            var modelAttribute = modelBody.getAttribute('class');
            if (!modelAttribute){
                modelAttribute = ' '; 
            } 
            modelAttribute = modelAttribute + ' '+newThemeInfo.className;
            modelAttribute = modelAttribute.trim();
            header.bodyClass = modelAttribute;
            modelBody.removeAttribute('class');
            modelBody.addAttribute('class',modelAttribute, false);
            this._context.setHeader(header);
            var style = modelHead.getChildElement('style');
            if (!style) {
                style = new davinci.html.HTMLElement('style');
                modelHead.addChild(style);
            }
            var css = new davinci.html.CSSImport();
            css.url = newFilename.toString();
            style.addChild(css);
        }
	    
	}

});
