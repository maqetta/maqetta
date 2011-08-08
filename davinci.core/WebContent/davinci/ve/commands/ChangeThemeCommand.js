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
	
		var modelDoc = this._context.getModel().getDocumentElement(); 
	
		var d = this._context.getDocument();
		var modelHead = modelDoc.getChildElement('head');
		var b = d.getElementsByTagName("body");
		var modelBody = modelDoc.getChildElement('body');
		var modelStyle = modelHead.getChildElements('style');
		var header = dojo.clone( this._context.getHeader());
		
		
		// find the old theme file name
		
			
		var files = oldTheme.files;
		for (var x=0; x<files.length; x++){
			var filename = oldTheme.file.parent.getPath()+'/'+ oldTheme.files[x];
			filename = filename.substring(2); // remove the ./ from the parent path
			var newFilename;
			for (var y=0; y<header.styleSheets.length; y++){
				function stripDotSlash(filename){
					if(filename.substr(0,2)=="./")
						return filename.substring(2); // remove the ./ from the parent path
					else
						return filename;
				}
				var ss_stripped = stripDotSlash(header.styleSheets[y]);
				if(ss_stripped === filename){
					// found the sheet to change
					newFilename = newThemeInfo.file.parent.getPath()+'/'+newThemeInfo.files[0]; // might need to change this is we ever support more than on css
					newFilename = newFilename.substring(2); // remove the ./ from the parent path
					header.styleSheets[y] = newFilename;
					
					var modelAttribute = modelBody.getAttribute('class');
					modelAttribute = modelAttribute.replace(oldTheme.className,newThemeInfo.className);
				
					header.bodyClass = modelAttribute;
					
					modelBody.removeAttribute('class');
					modelBody.addAttribute('class',modelAttribute, false);
					this._context.setHeader(header);
					for (var elm=0; elm<modelStyle.length; elm++){
						var children = modelStyle[elm].children;
						for (var ch = 0; ch < children.length; ch++ ){
							var child = children[ch];
							var url_stripped = stripDotSlash(child.url);
							if (child.elementType == 'CSSImport' && url_stripped == filename){
								child.url = newFilename;
								break;
							}
						}
					}
					//e._visualChanged();
					var text = this._context.getModel().getText();
					var e = davinci.Workbench.getOpenEditor();
					
					e.setContent(e.fileName,text); // force regen of HTML Model to load new theme

				}
			}

		}
	}

});
