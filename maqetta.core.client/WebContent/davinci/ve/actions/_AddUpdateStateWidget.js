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
	Action,
	veNls,
	commonNls,
	templateString,
	TextBox,
	Select,
	CheckBox,
	Button){

return declare("davinci.ve.actions._AddUpdateStateWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	widgetsInTemplate: true,

	veNls: veNls,
	commonNls: commonNls,
	
	postCreate: function(){
		this.addStateRemoveFromBase.set('checked', true);
	},

	_isValid: function() {
		// Special check for UpdateState.js dialog, which hides the state name field
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
			console.error('_AddUpdateStateWidget.js (from '+this._calledBy+' - cannot determine context.')
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
		// or if the dialog was invoked by UpdateState.js (in which case input box is hidden)
		if(newState || (this._calledBy == 'UpdateState' && currentState)){
			var context;
			if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
				context = Runtime.currentEditor.currentEditor.context;
			}else{
				console.error('AddState.js - cannot determine context.')
				return;
			}
			var command = new CompoundCommand();
			if(newState){
				//FIXME: Need to make this into a command so that it is undoable
				States.add(this.node, newState);
			}
			
			var obj = context.getAllWidgetsEffectiveDisplay(currentState);
			var allWidgets = obj.allWidgets;	// Array of all widgets
			var effectiveDisplay = obj.effectiveDisplay;	// Corresponding array of effective 'display' values
			
			var widgetsToShowInNewState = [];
			var moveWhichWidgets = this.moveWhichWidgets.get('value');
			if(moveWhichWidgets == 'allVisible'){
				for(var i=0; i<allWidgets.length; i++){
					if(effectiveDisplay[i] != 'none'){
						widgetsToShowInNewState.push(allWidgets[i]);
					}
				}
			}else if(moveWhichWidgets == 'allSelected'){
				widgetsToShowInNewState = context.getSelection().slice(0);	// clone operation
			}
			var widgetsToShowInNewState_Adjusted = widgetsToShowInNewState.slice(0);	// clone operation
			
			// Make sure that all visible descendants for any selected containers
			// will be visible in the new state
			for(var i=0; i< allWidgets.length; i++){
				var widget = allWidgets[i];
				var displayValue = effectiveDisplay[i];
				if(displayValue != 'none' && widgetsToShowInNewState_Adjusted.indexOf(widget) < 0){
					var parent = widget.getParent();
					while(parent && parent.domNode && parent.domNode.tagName.toUpperCase() != 'BODY'){
						if(widgetsToShowInNewState_Adjusted.indexOf(parent) >= 0){
							widgetsToShowInNewState_Adjusted.push(widget);
							break;
						}
						parent = parent.getParent();
					}
				}
			}
			
			// Make sure any container widget gets shown in new state when 
			// that container has a descendant in widgetsToShowInNewState_Adjusted
			for(var i=0; i< widgetsToShowInNewState_Adjusted.length; i++){
				var widget = widgetsToShowInNewState_Adjusted[i];
				var parent = widget.getParent();
				while(parent && parent.domNode && parent.domNode.tagName.toUpperCase() != 'BODY'){
					var showIndex = widgetsToShowInNewState_Adjusted.indexOf(parent);
					if(showIndex < 0){
						widgetsToShowInNewState_Adjusted.push(parent);
					}
					parent = parent.getParent();
				}
			}
			var removeFromBase = this.addStateRemoveFromBase.get('checked');
			
			// Create StyleCommands for each widget to set its 'display' value for new state
			// If removeFromBase value has been set, then any widgets moved to new state
			// will be removed from the base/NORMAL state.
			for(var i=0; i< allWidgets.length; i++){
				var widget = allWidgets[i];
				var displayValue = (widgetsToShowInNewState_Adjusted.indexOf(widget) >= 0) ? effectiveDisplay[i] : 'none';
				command.add(new StyleCommand(widget, [{'display':displayValue}], applyToState));
				if(removeFromBase && (widgetsToShowInNewState.indexOf(widget) >= 0)){
					command.add(new StyleCommand(widget, [{'display':'none'}], null));
				}
			}
			
			context.getCommandStack().execute(command);
			//FIXME: setting focus:true should be undoable
			States.setState(applyToState, context.rootNode, {focus:true});
			
			var editorPrefsId = 'davinci.ve.editorPrefs';
			var projectBase = Workbench.getProject();
			var editorPrefs = Preferences.getPreferences(editorPrefsId, projectBase);
			editorPrefs.statesMoveWhich = moveWhichWidgets;
			editorPrefs.statesRemoveFromBase = removeFromBase;
			Preferences.savePreferences(editorPrefsId, projectBase, editorPrefs);
		}
	},

	onCancel: function() {
		this.onClose();
	}
});

});