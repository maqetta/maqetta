define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/library",
        "system/resource",
        "davinci/workbench/Preferences",
        "davinci/Runtime",
        "davinci/Workbench",
        "dijit/Menu",
        "dijit/MenuItem",
        "davinci/model/Path",
        "dijit/Tooltip",
        "dijit/form/DropDownButton",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/NewHTMLFromTemplateOptions.html",
        "dijit/form/Button",
        "davinci/ui/widgets/ThemeSetSelection",
        "davinci/Theme",
        "dijit/form/TextBox",
        "dijit/form/RadioButton"

],function(declare, _Templated, _Widget,  Library, Resource,  Preferences, Runtime,  Workbench, 
			Menu, MenuItem, Path, ToolTip, DropDownButton, uiNLS, commonNLS, templateString,
			Button, ThemeSelection, Theme
			){
	return declare("davinci.ui.widgets.NewHTMLFromTemplateOptions",   [_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: templateString,
		postCreate : function(){
			this.inherited(arguments);
			var langObj = this.langObj = uiNLS;
			this.templateLabel.innerHTML = langObj.nhftTemplateLabel;
			var base = Workbench.getProject();
			/*FIXME: Need to make templates folder configurable
			var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs', base);
			var projectTemplatesBase = new Path(base).append(prefs.templatesFolder);
			*/
			var projectTemplatesBase = new Path(base).append('templates');
			var allTemplates = system.resource.findResource("*.html", true, projectTemplatesBase.toString());
			var optsTemplate = [];
			this.templates = [];
			for(var i=0; i<allTemplates.length; i++){
				var template = allTemplates[i].getPath().toString();
				this.templates.push(template);
				optsTemplate.push({value:template, label:template});
			}
			this.templateSelect.addOption(optsTemplate);
			this.connect(this.templateSelect, 'onChange', dojo.hitch(this,function(){
				this._update_template();
			}));
			this._update_template();
		},
	
		startup: function(){
		},
	
		/**
		 * Update this.collapsed to the given value and add/remove classes in DOM tree
		 * @param {boolean} collapsed  New value for this.collapsed
		 */
		_update_template: function(){
		},
	
		getOptions: function(){
			var o = this._currentTemplate('getOptions');
			return{
				template: o
			};
		},
		_currentTemplate: function(callingFunc){
			var template = this.templateSelect.attr('value');
			var found = false;
			for(var i=0; i<this.templates.length; i++){
				var o = this.templates[i];
				if(o == template){
					found = true;
					break;
				}
			}
			if(!found){
				console.error('NewHTMLFromTemplateOptions. '+callingFunc+': invalid template='+template);
				o = this.templates[0];
			}
			return o;
		}
	
	});
});