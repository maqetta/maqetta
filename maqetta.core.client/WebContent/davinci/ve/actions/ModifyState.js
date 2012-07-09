define([
	"dojo/_base/declare",
	"dojo/_base/Deferred",
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
		States,
		Dialog, 
		Runtime, 
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
		if(this.newName && this.newName !== this._statesFocus.state){
			States.rename(statesFocus.stateContainerNode, {oldName:this._statesFocus.state, newName:this.newName});
			var containerSrcElement = statesFocus.stateContainerNode._dvWidget && statesFocus.stateContainerNode._dvWidget._srcElement;
			if(containerSrcElement){
				var currentElement = null;
				var anyAttributeChanges = false;
				var value_regex = /^(.*davinci.states.setState\s*\(\s*)('[^']*'|"[^"]*")([^\)]*\).*)$/;
				var quoted_state_regex = /^(['"])(.*)(['"])$/;
				containerSrcElement.visit({ visit: dojo.hitch(this, function(node) {
					if (node.elementType == "HTMLElement") {
						currentElement = node;
					}else if (node.elementType == "HTMLAttribute") {
						var attrName = node.name;
						if(attrName && attrName.substr(0,2).toLowerCase() == 'on'){
							var value = node.value;
							var outerMatches = value.match(value_regex);
							if(outerMatches){
								// If here, the event attribute appears to have davinci.states.setState(blah) inside
								var innerMatches = outerMatches[2].match(quoted_state_regex);
								if(innerMatches){
									// If here, then innerMatches[2] contains the set state value
									if(innerMatches[2] == this._statesFocus.state){
										// If here, we need to replace the state name
										var newValue = outerMatches[1] + innerMatches[1] + this.newName + innerMatches[3] + outerMatches[3];
										currentElement.setAttribute(attrName, newValue);
										anyAttributeChanges = true;
									}
								}
							}
						}
					}
				})});
				if(anyAttributeChanges){
					editor._visualChanged();
				}
			}

		}
		var initialStateOn = this.initialState.get('checked');
		if(initialStateOn !== this.oldInitialStateOn){	
			// Get statesFocus again in case state was renamed.
			statesFocus = States.getFocus(context.rootNode);
			// Call setState() to cause updates everywhere.
			var initialState = initialStateOn ? statesFocus.state : null;
			States.setState(statesFocus.state, statesFocus.stateContainerNode, { initial:initialState, updateWhenCurrent:true });
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