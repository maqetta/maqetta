define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/library",
        "system/resource",
        "davinci/workbench/Preferences",
        "davinci/Runtime",
        "davinci/Workbench",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/NewProjectTemplate.html",
        "dijit/form/Button",
        "dijit/form/ComboBox",
        "dijit/form/CheckBox",
        "dojo/store/Memory"
        
],function(declare, lang, _Templated, _Widget,  Library, Resource, Preferences, 
		Runtime, Workbench, uiNLS, commonNLS, templateString,
		Button, ValidationTextBox, CheckBox, Memory){

	// Allow any unicode alpha, dijit, period or hyphen
	// This is validation regex used by server: "^[\p{L}\d\.\-]+$", but browsers don't support \p
	var regex = "^[A-Za-z0-9\.\-]+$";
	
	return dojo.declare("davinci.ui.NewProjectTemplate",   [_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: templateString,
		_okButton: null,
		_projectTemplateName: null,
		
		postMixInProperties: function() {
			var langObj = uiNLS;
			var dijitLangObj = commonNLS;
			dojo.mixin(this, langObj);
			dojo.mixin(this, dijitLangObj);
			this.inherited(arguments);
		},

		postCreate: function(){
			this.inherited(arguments);
			dojo.connect(this._projectTemplateName, "onChange", this, '_checkValid');
			var projectTemplates = Runtime.getSiteConfigData("projectTemplates");
			var data = [];
			if(projectTemplates && projectTemplates.templates && projectTemplates.templates.length > 0){
				for(var i=0; i<projectTemplates.templates.length; i++){
					var template = projectTemplates.templates[i];
					if(template.folder && template.name){
						data.push({name:template.name, id:template.folder});
					}
				}
			}
			var store = new Memory({ data:data });
			this._projectTemplateName.set("store", store);
			this._projectTemplateName.set("regExp", regex);
			this._projectTemplateName.set("intermediateChanges", true);
		},
		
		_checkValid: function(){
			var valid = this._projectTemplateName.isValid();
			this._okButton.set('disabled', !valid);
			// ComboBox's fancy search logic replaces the standard ValidationTextBox logic
			// for updating validation error notices with each keystroke.
			// Force error notice updates with the following call.
			this._projectTemplateName._refreshState();
		},
		
		okButton: function() {
			var NewProjectTemplateName = this._projectTemplateName.get("value");
			var projectTemplates = Runtime.getSiteConfigData("projectTemplates");			
			var do_it = true;
			var email = Runtime.getUserEmail();
			if(projectTemplates && projectTemplates.templates && projectTemplates.templates.length > 0){
				for(var i=0; i<projectTemplates.templates.length; i++){
					var template = projectTemplates.templates[i];
					if(template.name == NewProjectTemplateName && template.authorEmail == email){
						var message = lang.replace(uiNLS.newProjectTemplateOverwrite, [NewProjectTemplateName]);
						do_it = confirm(message);
						break;
					}
				}
			}
			if(do_it){
				var sharing = this._projectTemplateShare.get("value");
				require(['davinci/ui/ProjectTemplates'], function(ProjectTemplates){
					var returnData = ProjectTemplates.create({
						projectTemplateName:NewProjectTemplateName,
						sharingSimple:sharing == "on" ? "all" : "none"
					});
					if(returnData.success){
						alert(lang.replace(uiNLS.newProjectTemplateCreationSuccess, [NewProjectTemplateName]));
					}else{
						alert(lang.replace(uiNLS.newProjectTemplateCreationFailure, [NewProjectTemplateName]));
					}
					
				});
				
			}else{
				alert(uiNLS.newProjectTemplateCancelled);
			}
		},
		
		_getValueAttr: function(){
			return this.value;
		},

		cancelButton: function(){
			this.cancel = true;
			this.onClose();
		},

		onClose: function(){}
	});
});

