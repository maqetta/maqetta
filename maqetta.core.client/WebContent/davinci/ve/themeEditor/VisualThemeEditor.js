define([
    	"dojo/_base/declare",
    	"davinci/Workbench",
    	"./Context",
    	"davinci/workbench/Preferences",
    	"davinci/model/Path",
    	"davinci/html/HTMLFile",
    	"davinci/Theme",
    	"dojo/i18n!../nls/ve",
    	"dojo/cookie"
//    	"dojo/_base/sniff"
], function(declare, Workbench, Context, Preferences, Path, HTMLFile, Theme, veNls, cookie/*, has*/) {

return declare([], {

/*
 * 
 * HTML rendered as the theme editor
 */


	constructor: function (themeEditor, element,filename,themeCssFiles, themeEditorHtmls,theme) {
		this.THEME_EDITOR_SPEC = 1.0;
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
			baseURL: encodeURI(resource.getURL()),
			theme: theme
		});

		dojo.connect(this.context, "onSelectionChange",this, "onSelectionChange");

		var prefs=Preferences.getPreferences('davinci.ve.themeEditor.editorPrefs', Workbench.getProject());
		if (prefs) {
			this.context.setPreferences(prefs);
		}
		// have the server insert the dojo URL dynamically 
		
		dojo.xhrGet({
				url: encodeURI(resource.getURL()),
				handleAs: "text",
				content:{} 
			}).then(dojo.hitch(this, function(result){
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
		
		if (this.theme.specVersion < this.THEME_EDITOR_SPEC){
			var cookieName = 'maqetta_'+this.theme.name+'_'+this.theme.specVersion;
			var warnCookie = cookie(cookieName);
			if (!warnCookie){
				cookie(cookieName, "true");
				this.themeVersionWarn(); //just warn for now
			}
		}
		/*if(!has("webkit") && this.theme.type == "dojox.mobile"){
			Workbench.showMessage(veNls.vteWarningUnsuportedBrowserTitle, veNls.vteWarningUnsuportedBrowserMessage, {width: 250});
		}*/
		if(fileName.toLowerCase().indexOf(".css")>0){
			// add the style sheet to the theme editor
		}else if(fileName == "DEFAULT_PAGE"){
			var themeBase = Theme.getThemeLocation(); 
			htmlFile = new HTMLFile(); // each theme editor HTML needs to be it's own instance NO singleton from the model
			htmlFile.fileName = fileName;
			htmlFile.setText(content, true); // no import
			// #23 adjust for where html is located 
			var relPath = themeBase.relativeTo(this.basePath, true);
			htmlFile.themeCssFiles = [];
			themeCssFiles.forEach(function(file){
				// #23 css files need to be added to doc before body content
				htmlFile.themeCssFiles.push(relPath.toString()+'/'+this.theme.name+'/'+file);
			}.bind(this));
			this.context.model = htmlFile;
			if(!this.initialSet){
				this.context.deactivate();
				this.context._setSource(htmlFile, function(failureInfo) {
					try {
						if (failureInfo instanceof Error) {
							throw failureInfo;
						}

						this.savePoint = 0;

						// Make sure the theme css file is the last one in the head
						var doc = this.context.getDocument();
						dojo.some(doc.head.children, function(node) {
							if (node.tagName == 'LINK' && (node.getAttribute('href').indexOf(this.theme.files[0]) > -1) ) {
								doc.head.removeChild(node);
								doc.head.appendChild(node);
								return true;
							}
						}, this);

						//FIXME: include a LINK element for document.css for all themes.
						//Just so happens that desktop Dojo themes have document.css
						//and mobile themes don't.
						//We need to drive this from theme metadata somehow.
						//See issue #2381
	
						var helper;
						if (this.theme && this.theme.helper){
							helper = Theme.getHelper(this.theme);
							if (helper && helper.preThemeConfig){
								helper.preThemeConfig(this.context);
							} else if (helper && helper.then){ // it might not be loaded yet so check for a deferred
								helper.then(function(result){
									if (result.helper && result.helper.preThemeConfig){
										result.helper.preThemeConfig(this.context); 
										this.theme.helper = result.helper;
									}
								}.bind(this));
							}
						}
	
						this.context.activate();
	
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
							var warnCookie = cookie(cookieName);
							if (!warnCookie){
								cookie(cookieName, "true");
								this.themeVersionWarn(true);
							}
						}
					} catch(e) {
						failureInfo = e;
					} finally {
						if (failureInfo.errorMessage) {
							this.loadingDiv.innerHTML = failureInfo.errorMessage;
						} else if (failureInfo instanceof Error) {
							var message = "Uh oh! An error has occurred:<br><b>" + failureInfo.message + "</b>";
							if (failureInfo.fileName) {
								message += "<br>file: " + failureInfo.fileName + "<br>line: " + failureInfo.lineNumber;
							}
							if (failureInfo.stack) {
								message += "<br><pre>" + failureInfo.stack + "</pre>";
							}
							this.loadingDiv.innerHTML = message;
							dojo.addClass(this.loadingDiv, 'error');
						} else {
							if (this.loadingDiv.parentNode) {
								this.loadingDiv.parentNode.removeChild(this.loadingDiv);							
							}
							delete this.loadingDiv;
						}
					}
				}, this);
			}
		}
	},
	
	themeVersionWarn: function(toolkit){
		var msg = veNls.vteWarningMessage;
		if (toolkit) {
			msg = veNls.vteWarningToolkitMessage;
		} 
		Workbench.showMessage(veNls.vteWarningTitle, msg, {width: 250});
		
	},
	
	themeVersionError: function(){
		Workbench.showMessage(veNls.vteErrorTitle, veNls.vteErrorMessage, {width: 250}, dojo.hitch(this, "themeVersionErrorOk"));
	},
	
	themeVersionErrorOk: function(){
		this.context.editor.editorContainer.save(false); // force a save
		this.context.editor.editorContainer.forceClose(this, true);

		// destroy dialog by returning true
		return true;
	},

	hotModifyCssRule: function(){
	},

	getOutline: function (){
		return null; // Theme editor does no support an outline.
	}
});
});