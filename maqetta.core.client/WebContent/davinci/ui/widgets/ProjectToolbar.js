define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "system/resource",
        "davinci/Workbench",
        "../Rename",
        "dojo/dom-attr",
        "dojo/text!./templates/projectToolbar.html",
        "dojo/i18n!../nls/ui",
        "dijit/form/Button",
        "dijit/form/TextBox",
        "dijit/form/RadioButton",
        "dijit/layout/ContentPane",
        "./ProjectSelection"
],function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, systemResource, Workbench, Rename, domAttr, templateString, uiNLS){
	
	return declare("davinci.ui.widgets.ProjectToolbar",   [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: templateString,

		postCreate: function(){
			this.connect(this._projectSelection, "onChange", this._projectSelectionChanged);
			this._currentProject = this._projectSelection.get("value");
		},
		
		onChange: function(){
		},

		_projectSelectionChanged: function(){
			var newProject = this._projectSelection.get("value");
			if(newProject==this._currentProject) {
				return;
			}
			Workbench.loadProject(newProject);
		}

	});
});