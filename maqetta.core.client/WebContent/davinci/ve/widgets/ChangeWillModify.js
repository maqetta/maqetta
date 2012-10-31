define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/i18n!../nls/ve",
	"dojo/i18n!davinci/ui/nls/ui",
	"dojo/text!./templates/ChangeWillModify.html",
	"dijit/form/CheckBox",
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, veNLS, uiNLS, templateString) {

return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	langObj: veNLS,
	uiNLS: uiNLS,

	buildRendering: function() {
		var helpLink = "<a href='app/docs/index.html#CreatingStyleRulesWithAppCss' target='_blank'>"+ veNLS.creatingStyleRules +"</a>";
		this.insteadOfChanging = dojo.string.substitute(veNLS.insteadOfChanging,[helpLink]);
		this.inherited(arguments);
	},

	postCreate: function() {
	}
});
});
