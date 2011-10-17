dojo.provide("davinci.ui.NewProject");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");
dojo.require("dojox.widget.Standby");

dojo.declare("davinci.ui.NewProject",   [dijit._Widget,dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("davinci.ui", "templates/NewProject.html"),
	_okButton: null,
	_projectName : null,
	_eclipseSupport: null,
	
	postMixInProperties : function() {
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
		dojo.mixin(this, langObj);
		dojo.mixin(this, dijitLangObj);
		system.resource.listProjects(dojo.hitch(this,this.setProjects));
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

		system.resource.createProject(newProjectName, true, isEclipse);
		
		if(isEclipse){
			var prefValue = {webContentFolder:"./WebContent", themeFolder: "./WebContent/themes", widgetFolder: "./WebContent/widgets"};
			davinci.workbench.Preferences.savePreferences('davinci.ui.ProjectPrefs',newProjectName, prefValue);
		}
		
		if(davinci.Runtime.singleProjectMode())
			davinci.Runtime.loadProject(newProjectName);
		
		this.onClose();
	},
	
	_getEclipseProjectAttr : function(){
		 return dojo.attr(this._eclipseSupport, "checked");
	},
	
	_getValueAttr : function(){
		return this.value;
	},
	cancelButton: function(){
		this.onClose();
	},

	onClose : function(){}


	


});