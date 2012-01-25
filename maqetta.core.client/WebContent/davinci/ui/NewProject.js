define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/library",
        "system/resource",
        "davinci/workbench/Preferences",
        "davinci/Runtime",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/NewProject.html",
        "dijit/form/Button",
        "dijit/form/RadioButton",
        "dijit/form/TextBox"
        
],function(declare, _Templated, _Widget,  Library, Resource, Preferences,  Runtime, uiNLS, commonNLS, templateString){
	return dojo.declare("davinci.ui.NewProject",   [_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: templateString,
		_okButton: null,
		_projectName : null,
		_eclipseSupport: null,
		
		postMixInProperties : function() {
			var langObj = uiNLS;
			var dijitLangObj = commonNLS;
			dojo.mixin(this, langObj);
			dojo.mixin(this, dijitLangObj);
			Resource.listProjects(dojo.hitch(this,this.setProjects));
			this.inherited(arguments);
		},
		setProjects : function(projects){
			this._projects = projects;
		},
		postCreate : function(){
			this.inherited(arguments);
			dojo.connect(this._projectName, "onkeyup", this, '_checkValid');
			
		},
		
		
		_checkValid : function(){
			
			// make sure the project name is OK.
			if(!this._projects) return false; // project data hasn't loaded
			var name = dojo.attr(this._projectName, "value");
			var valid = true;
			for(var i=0;i<this._projects.length && valid;i++){
				if(this._projects[i]==name) 
					valid = false;
			}
			this._okButton.set( 'disabled', !valid);
		},
		
		okButton : function(){
			var newProjectName = dojo.attr(this._projectName, "value");
			var isEclipse = dojo.attr(this._eclipseSupport,'checked');

			Resource.createProject(newProjectName, true, isEclipse);
			
			if(isEclipse){
				var prefValue = {webContentFolder:"./WebContent", themeFolder: "./WebContent/themes", widgetFolder: "./WebContent/widgets"};
				Preferences.savePreferences('davinci.ui.ProjectPrefs',newProjectName, prefValue);
			}
			
			if(Runtime.singleProjectMode())
				Runtime.loadProject(newProjectName);
			
			this.onClose();
		},
		
		_getEclipseProjectAttr : function(){
			 return dojo.attr(this._eclipseSupport, "checked");
		},
		
		_getValueAttr : function(){
			return this.value;
		},
		cancelButton: function(){
			this.cancel = true;
			this.onClose();
		},

		onClose : function(){}


		


	});
});

