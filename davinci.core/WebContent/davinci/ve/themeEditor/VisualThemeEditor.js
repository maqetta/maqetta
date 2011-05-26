dojo.provide("davinci.ve.themeEditor.VisualThemeEditor");
 

dojo.require("dijit.layout.ContentPane");
dojo.require("davinci.ve.themeEditor.Context");
dojo.require("davinci.ve.themeEditor.VisualThemeOutline");
dojo.require("davinci.workbench.Preferences");

/*
 * 
 * HTML rendered as the theme editor
 */

davinci.ve.themeEditor._themeHtml = dojo.moduleUrl("davinci.ve.themeEditor")+"davinci-dojo-theme-editor.html"; 



dojo.declare("davinci.ve.themeEditor.VisualThemeEditor", null, {
	

	constructor : function (themeEditor, element,filename,themeCssfiles, themeEditorHtmls,theme) {
		this._themeEditor = themeEditor;
		this.domNode = element;
		this.theme = theme;
		var resource= themeEditorHtmls[0]; 

		this.basePath=new davinci.model.Path(resource.getPath());

		var relativePrefix="";
	    var folderDepth=this.basePath.getSegments().length-1;
		if (folderDepth)
		{
			for (var i=0;i<folderDepth;i++)
				relativePrefix+="../";
		}

		this._handles=[];
		this.context = new davinci.ve.themeEditor.Context({
			editor:this._themeEditor,
			visualEditor:this,
			containerNode: this.domNode,
			baseURL : resource.getURL(),
			relativePrefix:relativePrefix,
			immediatePropertyUpdates: true
		});
	
		dojo.connect(this.context, "onSelectionChange",this, "onSelectionChange");

		var prefs=davinci.workbench.Preferences.getPreferences('davinci.ve.themeEditor.editorPrefs');
		if (prefs) {
			this.context.setPreferences(prefs);
		}
		// have the server insert the dojo URL dynamically 
		dojo.xhrGet({
				url: resource.getURL(),
				handleAs: "text",
				sync: true,
				content:{'updateRoot':'%root%', 'id':'dojo', 'version':'1.7'} //FIXME: Dojo version is hard-coded
			}).addCallback(dojo.hitch(this, function(result){
				this.setContent("DEFAULT_PAGE", 
								result,
								themeCssfiles);
			}));
    },
    
    onSelectionChange : function (){
    	
    },
    destroy : function(){
    	
    	
    },
	getDefaultContent : function (){
		return "";
	},
	getContent : function(){
		return this.context.getSource();
	},
	setContent : function(fileName, content, themeCssfiles){
		
		if(fileName.toLowerCase().indexOf(".css")>0){
			// add the style sheet to the theme editor
		}else if(fileName == "DEFAULT_PAGE"){
			var htmlFile = davinci.model.Factory.newHTML();
			htmlFile.setText(content);
			htmlFile.fileName = fileName; 
			htmlFile.themeCssfiles = themeCssfiles; // css files need to be added to doc before body content
			this.context.model = htmlFile;
			this.context._themeName = this.theme.name;
			if(!this.initialSet){
				this.context.deactivate();
				this.context._setSource(htmlFile, dojo.hitch(this, function(){
					this.savePoint = 0;
					this.context.activate();
//		css files need to be added to doc before body content wdr 4/6/11
//					for(var i = 0;i < themeCssfiles.length;i++){
//						this.insertCssFile(themeCssfiles[i]);	
//					}
					// Because widget sizing css rules were not included in the HEAD at page load,
					// we must resize all of the widgets manually after the browser has had a chance
					// to repaint.  To avoid this workaround, we should either move the CSS rules
					// to the head of the document prior to page load, or resize() should be called
					// directly to conform with the way Dijit works.
					setTimeout(dojo.hitch(this, function(){
						this.context.getDijit().registry.forEach(function(widget){
							if(widget.resize){ widget.resize({}); }
						});
//						dojo.publish("/davinci/states/state/changed", [{widget:'$all', newState:"Normal"}]); // send state message to get Theme and StatesView in same init state
					}), 1500);
					this.initialSet=true;
				}));
			}
		}
	},
	

//	insertCssFile : function (filename) { not used anymore wdr 4/6/11
//// XXX Doesn't look like this.imports is used anywhere
////		if(!this.imports){
////			this.imports = [];
////		}
//		if (filename.elementType && filename.elementType=="File") {
//		    // need to get relative path to current context
//		    filename = (new davinci.model.Path(this.context.relativePrefix)).append(resource.getPath()).toString();
//		}
//		// filename should be relative at this point
//	
////		this.imports.push(resource);
//		this.context.addModeledStyleSheet(filename);
//	},

	hotModifyCssRule : function(){
		
		
		
	},
	getOutline : function (){
		return null; // Theme editor does no support an outline.
//		if (!this.outline)
//			this.outline=new davinci.ve.themeEditor.VisualThemeOutline(this);
//		return this.outline;
	}
	
	

});

