define([
	"dojo/_base/declare",
	"dojo/Deferred",
	"dojo/_base/connect",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/popup",
	"dijit/focus",
	"davinci/ve/States",
	"davinci/ui/Dialog",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/actions/Action",
	"dojo/i18n!davinci/ve/nls/ve",
	"dojo/i18n!dijit/nls/common",
	"dojo/text!./templates/ModifyState.html",
	"dijit/form/TextBox",
	"dijit/form/ValidationTextBox",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AppStateCommand"
], function(
		declare, 
		Deferred, 
		connect,
		_WidgetBase, 
		_TemplatedMixin, 
		_WidgetsInTemplateMixin,
		dijitPopup,
		dijitFocus,
		States,
		Dialog, 
		Runtime, 
		Workbench, 
		Action, 
		veNls, 
		commonNls, 
		templateString, 
		TextBox,
		ValidationTextBox,
		CompoundCommand,
		AppStateCommand){

var dialogCreateDeferred = null;

var ModifyStateWidget = declare("davinci.ve.actions.ModifyStateWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	widgetsInTemplate: true,

	veNls: veNls,
	commonNls: commonNls,
	isNormalState: false,
	newName: null,
	oldInitialStateOn: null,
	
	postCreate: function(){
		this._connections = [];
		var state_rename_tooltip_dialog = dijit.byId('state_rename_tooltip_dialog');
		dialogCreateDeferred.then(function(){
			if(!this._statesFocus.state || this._statesFocus.state === States.NORMAL){
				this.isNormalState = true;
			}
			var modify_state_old_name_node = dojo.byId('modify_state_old_name');
			if(modify_state_old_name_node){
				if(this._statesFocus && this._statesFocus.state && !this.isNormalState){
					modify_state_old_name_node.innerHTML = this._statesFocus.state;
				}else{
					modify_state_old_name_node.innerHTML = '<i>'+States.NORMAL+'</i>';
					this.renameButton.set('disabled', true);
				}
			}
			var initialStateOn = (States.getInitial(this._statesFocus.stateContainerNode) === this._statesFocus.state);
			this.oldInitialStateOn = initialStateOn;
			this.initialState.set('checked', initialStateOn);
			if(initialStateOn && this.isNormalState){
				// Note: if in Normal state and Normal state is initial,
				// everything in dialog will be disabled.
				this.initialState.set('disabled', true);
			}
			this._dialog.connect(this._dialog,"hide",function(e){
				this.onClose();
			}.bind(this));
			this.okButton.connect(this.okButton, "onClick", dojo.hitch(this, function(e){
				this.onOk(e);
			}));
			this.cancelButton.connect(this.cancelButton, "onClick", dojo.hitch(this, function(e){
				this.onCancel(e);
			}));
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
		var state_rename_cancel_button = dijit.byId('state_rename_cancel');
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
		state_rename_cancel_button.connect(state_rename_do_it_button, "onMouseDown", function(e){
			// See comment above
			e.stopPropagation();
		});
		state_rename_do_it_button.connect(state_rename_do_it_button, "onClick", function(e){
			this.renameStateDoIt(e);
		}.bind(this));
		state_rename_cancel_button.connect(state_rename_cancel_button, "onClick", function(e){
			var state_rename_tooltip_dialog = dijit.byId('state_rename_tooltip_dialog');
			dijitPopup.close(state_rename_tooltip_dialog);
		}.bind(this));
	},
	
	renameStateDoIt: function(e){
		var modify_state_old_name_node = dojo.byId('modify_state_old_name');
		var modify_state_new_name_widget = dijit.byId('state_rename_new_name');
		var newName = modify_state_new_name_widget ? modify_state_new_name_widget.get('value') : null;
		var state_rename_tooltip_dialog = dijit.byId('state_rename_tooltip_dialog');
		if(modify_state_old_name_node && newName){
			modify_state_old_name_node.innerHTML = newName;
			this.newName = newName;
		}
		if(state_rename_tooltip_dialog){
			dijitPopup.close(state_rename_tooltip_dialog);
		}
	},
	
	renameStateHideTooltipDialog: function(e){
	},

	onOk: function(e) {
		var context, editor;
		if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
			editor = Runtime.currentEditor;
			context = Runtime.currentEditor.currentEditor.context;
		}else{
			return;
		}
		var statesFocus = States.getFocus(context.rootNode);
		if(!statesFocus || !statesFocus.stateContainerNode){
			return;
		}
		var newName;
		if(this.newName && this.newName !== this._statesFocus.state){
			newName = this.newName;
		}
		var initialState;
		var initialStateOn = this.initialState.get('checked');
		if(initialStateOn !== this.oldInitialStateOn){
			// Hacky code - AppStateCommand looks for string "undefined" to represent NORMAL/base state
			var stateName = statesFocus.state ? statesFocus.state : "undefined";
			initialState = initialStateOn ? stateName : null;
		}
		if(newName || initialState){
			var command = new CompoundCommand();
			command.add(new AppStateCommand({
				action:'modify',
				state:statesFocus.state,
				stateContainerNode:statesFocus.stateContainerNode,
				context:context,
				newState:newName,
				initialState:initialState
			}));
			context.getCommandStack().execute(command);
		}
		
		this.onClose();
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

	run: function(){
		var context;
		if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
			context = Runtime.currentEditor.currentEditor.context;
		}else{
			return;
		}
		var statesFocus = States.getFocus(context.rootNode);
		if(!statesFocus){
			return;
		}

		// Have to use a deferred because of chicken-and-egg problem.
		// We need to put event connection onto the dialog in the postCreate logic
		// for the modifyState widget, but the dialog value isn't available right
		// at that point because the dialog is created after its child widgets are created.
		dialogCreateDeferred = new Deferred();

		var w = new davinci.ve.actions.ModifyStateWidget();
		var dialog = Workbench.showModal(w, veNls.modifyState);
		this._dialog = w._dialog = dialog;
		w._statesFocus = statesFocus;
		dialogCreateDeferred.resolve();
	}
});
});