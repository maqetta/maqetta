define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"davinci/Workbench",
	"davinci/actions/Action",
	"dojo/i18n!davinci/ve/nls/ve",
	"dojo/i18n!dijit/nls/common",
	"dojo/text!./templates/ModifyState.html",
	"dojo/text!./templates/RenameState.html",
	"dijit/form/TextBox"
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Workbench, Action, veNls, commonNls, templateString, renameTemplateString){

var ModifyStateWidget = declare("davinci.ve.actions.ModifyStateWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	widgetsInTemplate: true,

	veNls: veNls,
	commonNls: commonNls,

	_isValid: function() { 
		var state = this.input.get("value");
		// TODO: Replace alerts with inline error messages
		if (!state) {
			return false;
		} else if (davinci.ve.states.hasState(this.node, state)) {
			alert(dojo.string.substitute(veNls.stateNameExists, { name: state }));
			return false;
		}
		return true;
	},

	_onKeyPress: function(e) {
		if (e.keyCode==dojo.keys.ENTER) {
			if(this._isValid()){
				this.onOk();
			}
		} else {
			if (this._isValid()) {
				this.okButton.set("disabled", false);
			} else {
				this.okButton.set("disabled", true);
			}
		}
	},

	onOk: function() {
		davinci.ve.states.modify(this.node, this.input.get("value"));
	},

	onCancel: function() {
		this.onClose();
	}
});

declare("davinci.ve.actions.RenameState", [_WidgetBase, _TemplatedMixin], {
	templateString: renameTemplateString,
	widgetsInTemplate: true,
	veNls: veNls,
	commonNls: commonNls
});

return declare("davinci.ve.actions.ModifyState", [Action], {

	run: function(context){
		var node = this.getNode();

		var w = new davinci.ve.actions.ModifyStateWidget({node: node});

		Workbench.showModal(w, veNls.modifyState);
	},

	shouldShow: function(context){
		return this.getNoe();
	},

	isEnabled: function(context){
		return this.getNode();
	},

	getNode: function(node) {
		if (!node) {
			node = davinci.ve.states.getContainer();
		}
		return node;
	}
});
});