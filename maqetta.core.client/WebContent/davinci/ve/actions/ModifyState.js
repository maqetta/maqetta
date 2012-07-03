define([
	"dojo/_base/declare",
	"dojo/_base/Deferred",
	"dojo/_base/connect",
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
], function(declare, Deferred, connect, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Workbench, Action, veNls, commonNls, templateString, renameTemplateString){

var dialogCreateDeferred = null;

var ModifyStateWidget = declare("davinci.ve.actions.ModifyStateWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	widgetsInTemplate: true,

	veNls: veNls,
	commonNls: commonNls,
	
	postCreate: function(){
		this._connections = [];
		this._connections.push(connect.connect(dijit.byId('modify_state_rename_button'), "onClick", this, "renameState"));
		dialogCreateDeferred.then(function(){
			var conn = this._dialog.connect(this._dialog,"hide",function(e){
				this.onClose();
			}.bind(this));
			this._connections.push(conn);
		}.bind(this));
	},
	
	renameState: function(e) {
debugger;
return;
		var langObj = uiNLS;
		var loc = commonNLS;
		var select = dojo.byId('theme_select_themeset_theme_select');
		this._renameDialog = new Dialog({
			id: "rename",
			title: langObj.renameThemeSet,
			contentStyle: {width: 300},
			content: new davinci.ui.ThemeSetsDialogRenameWidget({})
		});
		this._renameDialog._themesetConnections = [];
		this._renameDialog._themesetConnections.push(dojo.connect(dijit.byId('theme_set_rename_ok_button'), "onClick", this, "onOkRename"));
		this._renameDialog._themesetConnections.push(dojo.connect(dijit.byId('theme_set_rename_cancel_button'), "onClick", this, "onCloseRename"));
		this._renameDialog._themesetConnections.push(dojo.connect(this._renameDialog, "onCancel", this, "onCloseRename"));
		this._renameDialog.show();
		var editBox = dijit.byId('theme_select_themeset_rename_textbox');
		editBox.attr('value', this._selectedThemeSet.name);
			dijit.selectInputText(editBox);
	},

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
	},
	    
	onClose: function(e){
		var connection;
		while (connection = this._connections.pop()){
			connect.disconnect(connection);
		}
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

		// Have to use a deferred because of chicken-and-egg problem.
		// We need to put event connection onto the dialog in the postCreate logic
		// for the modifyState widget, but the dialog value isn't available right
		// at that point because the dialog is created after its child widgets are created.
		dialogCreateDeferred = new Deferred();

		var node = this.getNode();

		var w = new davinci.ve.actions.ModifyStateWidget({node: node});
		var dialog = Workbench.showModal(w, veNls.modifyState);
		w._dialog = dialog;
		dialogCreateDeferred.resolve();
	},

	shouldShow: function(context){
		return this.getNode();
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