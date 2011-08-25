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
			relativePrefix:relativePrefix
		});
	
		dojo.connect(this.context, "onSelectionChange",this, "onSelectionChange");

		var prefs=davinci.workbench.Preferences.getPreferences('davinci.ve.themeEditor.editorPrefs', davinci.Runtime.getProject());
		if (prefs) {
			this.context.setPreferences(prefs);
		}
		// have the server insert the dojo URL dynamically 
		
		dojo.xhrGet({
				url: resource.getURL(),
				handleAs: "text",
				sync: true,
				content:{/*'updateRoot':'%root%', 'id':theme.libId, 'version':theme.libVersion*/} //FIXME: Dojo version is hard-coded
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
						dojo.publish("/davinci/states/state/changed", [{widget:'$all', newState:"Normal"}]); // send state message to get Theme and StatesView in same init state
					}), 1500);
					this.initialSet=true;

					var ldojoVersion = this.context.getDojo().version.major +'.'+ this.context.getDojo().version.minor;
					if (ldojoVersion !== this.theme.version){
						var cookieName = 'maqetta_'+this.theme.name+'_'+this.theme.version;
						var warnCookie = dojo.cookie(cookieName);
						if (!warnCookie){
							dojo.cookie(cookieName, "true");
							this.themeVersionWarn();
						}
					}
				}));
				
			}
		}
	},
	
	themeVersionWarn: function(){
		var message = 'Theme version does not match workspace version this could produce unexpected results. We suggest recreating the custom theme using the current version of Maqetta and deleting the existing theme.';

		this._dialog = new dijit.Dialog({
			id: "maqetta.themeVersionMismatch",
			title:"Theme Version Warning",
			onCancel:function(){
				this.destroyRecursive(false);
			},
			style: 'width:250px;'
		});
		var formHTML = '<table>' + 
							'<tr><td></td><td>'+message+'</td><td></td></tr>'+
							'<tr><td></td><td align="center"><button data-dojo-type="dijit.form.Button" type="button" id="themeWarnOk" >Ok</button></td><td></td></tr>'+
						'</table>';
		
		this._dialog.setContent(formHTML);
		var ok = dijit.byId('themeWarnOk');
		ok.domNode.onclick = dojo.hitch(this, 'themeVersionWarnOk');
		this._dialog.show();
	},
	
	themeVersionWarnOk: function(){

		if (this._dialog){
			this._dialog.hide();
			this._dialog.destroyRecursive(false);
			delete this._dialog;
		}
	},

	hotModifyCssRule : function(){
		
		
		
	},
	getOutline : function (){
		return null; // Theme editor does no support an outline.

	}
	
	

});

