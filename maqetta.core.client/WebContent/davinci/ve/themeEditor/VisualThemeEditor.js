define([
    	"dojo/_base/declare",
    	"davinci/Runtime",
    	"davinci/Workbench",
    	"davinci/ve/themeEditor/Context",
    	"davinci/workbench/Preferences",
    	"davinci/model/Path",
    	"davinci/model/Factory",
    	"davinci/Theme",
    	"dijit/Dialog"
], function(declare, Runtime, Workbench, Context, Preferences, Path, Factory, Theme, Dialog) {

return declare([], {

/*
 * 
 * HTML rendered as the theme editor
 */


	constructor: function (themeEditor, element,filename,themeCssFiles, themeEditorHtmls,theme) {
		this.THEME_EDITOR_SPEC = 0.81;
		this._themeEditor = themeEditor;
		this.domNode = element;
		this.theme = theme;
		var resource= themeEditorHtmls[0]; 

		this.basePath=new Path(resource.getPath());

		this.loadingDiv = dojo.create("div", {
			className: "loading",
			innerHTML: dojo.replace(
					'<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;{0}</td></tr></table>',
					["Loading..."]) // FIXME: i18n
			},
			this.domNode.parentNode,
			"first");

		this._handles=[];
		this.context = new Context({
			editor: this._themeEditor,
			visualEditor: this,
			containerNode: this.domNode,
			baseURL: resource.getURL(),
			theme: theme
		});

		dojo.connect(this.context, "onSelectionChange",this, "onSelectionChange");

		var prefs=Preferences.getPreferences('davinci.ve.themeEditor.editorPrefs', Workbench.getProject());
		if (prefs) {
			this.context.setPreferences(prefs);
		}
		// have the server insert the dojo URL dynamically 
		
		dojo.xhrGet({
				url: resource.getURL(),
				handleAs: "text",
				sync: false,
				content:{} 
			}).addCallback(dojo.hitch(this, function(result){
				this.setContent("DEFAULT_PAGE", 
								result,
								themeCssFiles);
			}));
    },
    
    onSelectionChange: function (){
    },

    destroy: function(){
    },

    getDefaultContent: function (){
		return "";
	},

	getContent: function(){
		return this.context.getSource();
	},

	setContent: function(fileName, content, themeCssFiles){
		
		if(fileName.toLowerCase().indexOf(".css")>0){
			// add the style sheet to the theme editor
		}else if(fileName == "DEFAULT_PAGE"){
			var htmlFile = Factory.newHTML();
			htmlFile.fileName = fileName;
			htmlFile.setText(content);
			// #23 adjust for where html is located 
			var themeBase = Theme.getThemeLocation();
			var relPath = themeBase.relativeTo(this.basePath, true);
			htmlFile.themeCssFiles = [];
			themeCssFiles.forEach(function(file){
				htmlFile.themeCssFiles.push(relPath.toString()+'/'+this.theme.name+'/'+file); // #23 css files need to be added to doc before body content
			}.bind(this));
			this.context.model = htmlFile;
			this.context._themeName = this.theme.name;
			if(!this.initialSet){
				this.context.deactivate();
				this.context._setSource(htmlFile, function(failureInfo) {
					this.savePoint = 0;
					
					//FIXME: include a LINK element for document.css for all themes.
					//Just so happens that desktop Dojo themes have document.css
					//and mobile themes don't.
					//We need to drive this from theme metadata somehow.
					//See issue #2381
					var workspaceUrl = Runtime.getUserWorkspaceUrl();
					var documentCssPathRel = this.basePath.getParentPath().append('document.css').toString();
					var documentCssPathAbs = workspaceUrl + documentCssPathRel;
					this.context.loadStyleSheet(documentCssPathAbs);

					this.context.activate();
//		css files need to be added to doc before body content wdr 4/6/11
//					for(var i = 0;i < themeCssFiles.length;i++){
//						this.insertCssFile(themeCssFiles[i]);	
//					}
					// Because widget sizing css rules were not included in the HEAD at page load,
					// we must resize all of the widgets manually after the browser has had a chance
					// to repaint.  To avoid this workaround, we should either move the CSS rules
					// to the head of the document prior to page load, or resize() should be called
					// directly to conform with the way Dijit works.
					setTimeout(dojo.hitch(this, function(){
						this.context.getTopWidgets().forEach(function(widget){
							if (widget.resize){
								widget.resize({});
							}
						});
						dojo.publish("/davinci/states/state/changed", [{
							editorClass: 'davinci.themeEditor.ThemeEditor',
							widget: '$all', 
							newState: "Normal",
							context: this.context}]); // send state message to get Theme and StatesView in same init state
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
					if (this.theme.specVersion < this.THEME_EDITOR_SPEC){
						this.themeVersionError();
					}

					if (failureInfo.errorMessage) {
						this.loadingDiv.innerHTML = failureInfo.errorMessage;
					} else if (failureInfo instanceof Error) {
						var message = "Uh oh! An error has occurred:<br><b>" + failureInfo.message + "</b>";
						if (failureInfo.fileName) {
							message += "<br>file: " + failureInfo.fileName + "<br>line: " + failureInfo.lineNumber;
						}
						if (failureInfo.stack) {
							message += "<br>" + failureInfo.stack;
						}
						this.loadingDiv.innerHTML = message;
						dojo.addClass(loading, 'error');
					} else {
						if (this.loadingDiv.parentNode) {
							this.loadingDiv.parentNode.removeChild(this.loadingDiv);							
						}
						delete this.loadingDiv;
					}
				}, this);
			}
		}
	},
	
	themeVersionWarn: function(){
		//FIXME: i18n
		var message = 'Theme version does not match workspace version this could produce unexpected results. We suggest recreating the custom theme using the current version of Maqetta and deleting the existing theme.';

		this._dialog = new Dialog({
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
	
	themeVersionError: function(){
		//FIXME: i18n
		var message = 'Theme version does not match workspace version. You must clone the custom theme using the current version of Maqetta.';
		this._dialog = new Dialog({
			id: "maqetta.themeVersionMismatch",
			title:"Theme Version Error",
			onCancel:function(){
				this.destroyRecursive(false);
				this.editorContainer.save(false); // force a save
				this.editorContainer.forceClose(this, true);
			},
			style: 'width:250px;'
		});
		this._dialog.editorContainer = this._themeEditor.editorContainer;
		var formHTML = '<table>' + 
							'<tr><td></td><td>'+message+'</td><td></td></tr>'+
							'<tr><td></td><td align="center"><button data-dojo-type="dijit.form.Button" type="button" id="themeErrorOk" >Ok</button></td><td></td></tr>'+
						'</table>';
		
		this._dialog.setContent(formHTML);
		var ok = dijit.byId('themeErrorOk');
		ok.domNode.onclick = dojo.hitch(this, 'themeVersionErrorOk');
		this._dialog.show();
	},
	
	themeVersionErrorOk: function(){
		if (this._dialog){
			this._dialog.editorContainer.save(false); // force a save
			this._dialog.editorContainer.forceClose(this, true);
			this._dialog.hide();
			this._dialog.destroyRecursive(false);
			delete this._dialog;
		}

	},

	hotModifyCssRule: function(){
	},

	getOutline: function (){
		return null; // Theme editor does no support an outline.
	}
});
});