define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/aspect",
	"dojo/Deferred",
	"dojo/dom-attr",
	"dijit/_Templated",
	"dijit/_Widget",
	"davinci/library",
	"system/resource",
	"davinci/workbench/Preferences",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/ui/ProjectTemplates",
	"dojo/i18n!davinci/ui/nls/ui",
	"dojo/i18n!dijit/nls/common",
	"dojo/text!./templates/NewProject.html",
	"dijit/form/Button",
	"dijit/form/RadioButton",
	"dijit/form/ValidationTextBox"
], function(
	declare,
	lang,
	on,
	aspect,
	Deferred,
	domAttr,
	_Templated,
	_Widget,
	Library,
	Resource,
	Preferences,
	Runtime,
	Workbench,
	ProjectTemplates,
	uiNLS,
	commonNLS,
	templateString
) {

	var noProjectTemplate = '_none_';

	// Allow any word char, period, underscore or hyphen
	// Better internationalized regex would be: "^[\p{L}\d\.\-]+$", but browsers don't support \p
	var BASE_REGEX = "^[\\w\\-\\.\\_]+$";

	return declare([_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: templateString,
		_okButton: null,
		_projectName: null,
		_eclipseSupport: null,
		_projectTemplate: noProjectTemplate,
		_regex: new RegExp(BASE_REGEX),
		_postCreateDeferred: null,
		
		constructor: function(){
			this._postCreateDeferred = new Deferred();
			Resource.listProjects(function(projects) {
				// Build a really fancy regular expression that prevents
				// exact match with any existing project names and
				// disallows the underscore character
				function to4bitHex(i){
					var result = "0000";
					if(i >= 0 && i <= 15){ result = "000" + i.toString(16); }
					else if (i >= 16 && i <= 255) { result = "00"  + i.toString(16); }
					else if (i >= 256 && i <= 4095) { result = "0"   + i.toString(16); }
					else if (i >= 4096 && i <= 65535) { result = i.toString(16); }
					return result;
				}
				this._allCurrentProjectNames = [];
				var regexString = ''
				for(var i=0; i<projects.length; i++){
					var projectName = projects[i].name;
					regexString += '(?!^';
					for(var j=0; j<projectName.length; j++){
						var ch = projectName.charCodeAt(j);
						regexString += '\\u'+to4bitHex(ch);	// Use 4-bit hex code for each char in project name
					}
					regexString += '$)';
				}
				regexString += BASE_REGEX;
				this._regex = new RegExp(regexString);
				this._postCreateDeferred.then(function(){
					this._projectName.set("regExp", regexString);
				}.bind(this));
			}.bind(this));

		},
		
		postMixInProperties: function() {
			var langObj = uiNLS;
			var dijitLangObj = commonNLS;
			lang.mixin(this, langObj);
			lang.mixin(this, dijitLangObj);
			Resource.listProjects(this.setProjects.bind(this));
			this.inherited(arguments);
		},

		setProjects: function(projects){
			this._projects = {};

			projects.forEach(function(project) {
				if (project) {
					this._projects[project.name] = true;
				}
			}, this);
		},

		postCreate: function(){
			this.inherited(arguments);
			on(this._projectName, 'keyup', this._checkValid.bind(this));
			var opts = [];
			this.projectTemplates.addOption(opts);
			this._useProjectTemplate.disabled = true;

			// The 1000 argument says to pull at most 1000 at once (which happens to be server's limit)
			ProjectTemplates.getIncremental(1000, function(projectTemplateList, returnData, allDone){
				this._updateTemplates(projectTemplateList);
				return false;	// false => continue retrieving data
			}.bind(this));
			
			this.projectTemplates.set('maxHeight', 200);
			this._projectName.set("regExp", BASE_REGEX);
			on(this._useProjectTemplate, "change", function(){
				this.projectTemplates.set("disabled", !this._useProjectTemplate.checked);
			}.bind(this));
			this.projectTemplates.set("disabled", !this._useProjectTemplate.checked);
			aspect.around(this._projectName, "_isValidSubset", function(originalIsValidSubset){
				// Override the base _isValidSubset() function because base widget logic
				// allows invalid string at start because user might be only partly done.
				// We need to override that logic.
				return function(){
					return false;
				};
			});
			this._postCreateDeferred.resolve();
		},

		_updateTemplates: function(projectTemplateList){
			var opts = [];
			if(projectTemplateList.length > 0){
				for(var i=0; i<projectTemplateList.length; i++){
					var template = projectTemplateList[i];
					if(template.folder && template.name){
						var authorSpan = template.authorEmail ? 
								'<span class="NewProjectTemplateAuthor">&nbsp;&nbsp;(Author: '+template.authorEmail+')</span>' :
								'';
						var label = authorSpan+'<span class="NewProjectTemplateName">'+template.name+'</span>';
						opts.push({value:template.folder, label:label});
					}
				}
				this._useProjectTemplate.disabled = false;
			}else{
				this._useProjectTemplate.disabled = true;
			}
			this.projectTemplates.addOption(opts);
			this.projectTemplates.set("disabled", !this._useProjectTemplate.checked);
		},

		_checkValid: function(){
			// make sure the project name is OK.
			if (!this._projects) {
				return false; // project data hasn't loaded
			}

			var valid = this._projectName.isValid();

			this._okButton.set('disabled', !valid);
		},
		
		okButton: function() {
			var newProjectName = this._projectName.get("value");
			var cloneExistingProject = domAttr.get(this._cloneExistingProject, 'checked');
			var projectToClone = cloneExistingProject ? Workbench.getProject() : '';
			var isEclipse = this._getEclipseProjectAttr();
			var useProjectTemplate = domAttr.get(this._useProjectTemplate, 'checked');
			var projectTemplateName = useProjectTemplate ? this.projectTemplates.get("value") : '';

			Resource.createProject({
				newProjectName: newProjectName,
				projectTemplateName: projectTemplateName,
				projectToClone: projectToClone,
				eclipseSupport: isEclipse
			}).then(function() {
				if (isEclipse) {
					Preferences.savePreferences(
							'davinci.ui.ProjectPrefs',
							newProjectName,
							{
								webContentFolder:"WebContent",
								themeFolder: "WebContent/themes",
								widgetFolder: "WebContent/lib/custom"
							}
					);
				}

				Workbench.loadProject(newProjectName);
			});
		},
		
		_getEclipseProjectAttr: function(){
			 return domAttr.get(this._eclipseSupport, "checked");
		},
		
		_getValueAttr: function(){
			return this.value;
		},
		
		_onChangeTemplate: function(newValue){
			this._projectTemplate = newValue;
		},

		cancelButton: function(){
			this.cancel = true;
			this.onClose();
		},

		onClose: function(){}
	});
});

