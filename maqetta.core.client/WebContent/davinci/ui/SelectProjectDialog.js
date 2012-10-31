define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"../Workbench",
	"dojo/i18n!davinci/ui/nls/ui",
	"dojo/text!./templates/SelectProjectDialog.html",
	"./widgets/ProjectSelection"
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Workbench, uiNLS, templateString) {

return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	uiNLS: uiNLS,

	postCreate: function() {
		this.currentProject = Workbench.getProject();

		this.currentProjectName.innerHTML = this.currentProject;
	},

	_onChange: function(e) {
		if (this.projectSelection.get("value") == this.currentProject) {
			this._okButton.set("disabled", true);
		} else {
			this._okButton.set("disabled", false);
		}
	},

	okButton: function() {
		var project = this.projectSelection.get("value");
		if (project) {
			Workbench.loadProject(project);
		}
	},

	cancelButton: function() {
		this.onClose();
	}
});
});

