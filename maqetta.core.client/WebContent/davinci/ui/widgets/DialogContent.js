define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/layout/ContentPane",
	"dojo/text!./templates/DialogContent.html",
	"dojo/i18n!davinci/ve/nls/common",
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, ContentPane, templateString, veNLS) {

return declare("davinci.ui.widgets.DialogContent", [ContentPane, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
  templateString: templateString,
	widgetsInTemplate: true,

	veNLS: veNLS,

	content: null,
	okLabel: null,
	hideCancel: false,

	buildRendering: function() {
		this.inherited(arguments);

		if (this.okLabel) {
			this.okButton.set("label", this.okLabel);
		}

		if (this.hideCancel) {
			this.cancelButton.domNode.style.display = "none";
		}
	},

	onClose: function() {
	},

	onCancel: function() {
	}
});
});
