define([
	"dojo/_base/declare",
	"dojo/_base/Deferred",
	"dojo/_base/connect",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/popup",
	"dijit/focus",
	"davinci/ui/Dialog",
	"davinci/Workbench",
	"davinci/actions/Action",
	"dojo/i18n!davinci/ve/nls/ve",
	"dojo/i18n!dijit/nls/common",
	"dojo/text!./templates/ModifyState.html",
	"dijit/form/TextBox",
	"dijit/form/ValidationTextBox"
], function(
		declare, 
		Deferred, 
		connect, 
		_WidgetBase, 
		_TemplatedMixin, 
		_WidgetsInTemplateMixin,
		dijitPopup,
		dijitFocus,
		Dialog, 
		Workbench, 
		Action, 
		veNls, 
		commonNls, 
		templateString, 
		TextBox){

var dialogCreateDeferred = null;

var ModifyStateWidget = declare("davinci.ve.actions.ModifyStateWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	widgetsInTemplate: true,

	veNls: veNls,
	commonNls: commonNls,
	_renamed: false,
	
	postCreate: function(){
		this._connections = [];
		var state_rename_tooltip_dialog = dijit.byId('state_rename_tooltip_dialog');
		dialogCreateDeferred.then(function(){
			this._dialog.connect(this._dialog,"hide",function(e){
				this.onClose();
			}.bind(this));
			var state_rename_tooltip_dialog = dijit.byId('state_rename_tooltip_dialog');
			if(state_rename_tooltip_dialog){
				state_rename_tooltip_dialog.connect(state_rename_tooltip_dialog,"onShow",function(e){
					this.renameStateShowTooltipDialog(e);
				}.bind(this));
				state_rename_tooltip_dialog.connect(state_rename_tooltip_dialog,"onHide",function(e){
					this.renameStateHideTooltipDialog(e);
				}.bind(this));
			}
		}.bind(this));
	},
	
	renameStateShowTooltipDialog: function(e){
		var modify_state_old_name_node = dojo.byId('modify_state_old_name');
		var state_rename_new_name_node = dojo.byId('state_rename_new_name');
		var state_rename_new_name_widget = dijit.byId('state_rename_new_name');
		if(modify_state_old_name_node && state_rename_new_name_widget){
			var state_rename_new_name = modify_state_old_name_node.innerText;
			state_rename_new_name_widget.set('value', state_rename_new_name);
		}
		dijitFocus.focus(state_rename_new_name_node);
		var state_rename_do_it_button = dijit.byId('state_rename_do_it');
		state_rename_do_it_button.connect(state_rename_do_it_button, "onMouseDown", function(e){
			// There is something funny going on in Maqetta with mousedown listeners
			// where focus is getting reassigned. This messes up Dojo's logic for 
			// DropDownButton/ToolTipDialog where it checks if focus has moved out
			// of the ToolTipDialog, and if so, then it hides the ToolTipDialog.
			// As a result, the Maqetta mousedown listener changes focus, which triggers
			// onBlur on the DropDownButton, which triggers hiding the dialog
			// before the onClick event would ever fire.
			e.stopPropagation();
		});
		state_rename_do_it_button.connect(state_rename_do_it_button, "onClick", function(e){
			this.renameStateDoIt(e);
		}.bind(this));
	},
	
	renameStateDoIt: function(e){
		var modify_state_old_name_node = dojo.byId('modify_state_old_name');
		var modify_state_old_name = modify_state_old_name_node.innerHTML;
		var modify_state_new_name_widget = dijit.byId('state_rename_new_name');
		var new_name = modify_state_new_name_widget ? modify_state_new_name_widget.get('value') : null;
		var state_rename_tooltip_dialog = dijit.byId('state_rename_tooltip_dialog');
		if(modify_state_old_name_node && new_name && modify_state_old_name !== new_name){
			modify_state_old_name_node.innerHTML = new_name;
			this._renamed = true;
		}
		if(state_rename_tooltip_dialog){
			dijitPopup.close(state_rename_tooltip_dialog);
		}
	},
	
	renameStateHideTooltipDialog: function(e){
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
		this._dialog = w._dialog = dialog;
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