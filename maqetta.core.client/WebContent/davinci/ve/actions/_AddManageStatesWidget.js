define([
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/_base/event",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/workbench/Preferences",
	"davinci/ve/States",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/StyleCommand",
	"davinci/ve/commands/AppStateCommand",
	"davinci/actions/Action",
	"dojo/i18n!davinci/ve/nls/ve",
	"dojo/i18n!dijit/nls/common",
	"dojo/text!./templates/AddState.html",
	"dijit/form/TextBox",
	"dijit/form/Select",
	"dijit/form/CheckBox",
	"dijit/form/Button"
], function(
	declare,
	domStyle,
	event,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	Runtime,
	Workbench,
	Preferences,
	States,
	CompoundCommand,
	StyleCommand,
	AppStateCommand,
	Action,
	veNls,
	commonNls,
	templateString,
	TextBox,
	Select,
	CheckBox,
	Button){

return declare("davinci.ve.actions._AddManageStatesWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	widgetsInTemplate: true,

	veNls: veNls,
	commonNls: commonNls,

	_isValid: function() {
		// Special check for ManageStates.js dialog, which hides the state name field
		// found in the template. If the DIV surrounding the state name field is hidden (display:none),
		// then activate the OK button
		var addStateNameDiv = this.domNode.querySelector('.addStateNameDiv');
		if(addStateNameDiv){
			var displayValue = domStyle.get(addStateNameDiv, 'display');
			if(displayValue == 'none'){
				return true;
			}
		}
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
		if (e.keyCode!=dojo.keys.ENTER) {
			if (this._isValid()) {
				this.okButton.set("disabled", false);
			} else {
				this.okButton.set("disabled", true);
			}
		}
	},

	onOk: function() {
		var context;
		if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
			context = Runtime.currentEditor.currentEditor.context;
		}else{
			console.error('_AddManageStatesWidget.js (from '+this._calledBy+' - cannot determine context.')
			return;
		}
		var statesFocus = States.getFocus(context.rootNode);
		if(!statesFocus || !statesFocus.stateContainerNode){
			return;
		}
		var currentState = States.getState(statesFocus.stateContainerNode);
		var newState = this.input.get("value");
		var applyToState = this._calledBy == 'AddState' ? newState : currentState;

		// Proceed if either the state name input box has a value (ie non-empty string)
		// or if the dialog was invoked by ManageStates.js (in which case input box is hidden)
		if(newState){
			var context;
			if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
				context = Runtime.currentEditor.currentEditor.context;
			}else{
				console.error('AddState.js - cannot determine context.')
				return;
			}
			var command = new CompoundCommand();
			if(newState){
				command.add(new AppStateCommand({
					action:'add',
					state:newState,
					stateContainerNode:this.node,
					context:context
				}));
			}
			context.getCommandStack().execute(command);
		}
	},

	onCancel: function() {
		this.onClose();
	}
});

});