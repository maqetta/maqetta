define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"davinci/Runtime",
	"davinci/Workbench",
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
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	Runtime,
	Workbench,
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

var AddStateWidget = declare("davinci.ve.actions.AddStateWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	widgetsInTemplate: true,

	veNls: veNls,
	commonNls: commonNls,
	
	postCreate: function(){
		this.addStateRemoveFromBase.set('checked', true);
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
		if (e.keyCode!=dojo.keys.ENTER) {
			if (this._isValid()) {
				this.okButton.set("disabled", false);
			} else {
				this.okButton.set("disabled", true);
			}
		}
	},

	onOk: function() {
		var newState = this.input.get("value");
		if(newState){
			var command = new CompoundCommand();
			//FIXME: Need to make this into a command so that it is undoable
			States.add(this.node, newState);
			var context;
			if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
				context = Runtime.currentEditor.currentEditor.context;
			}else{
				console.error('AddState.js - cannot determine context.')
				return;
			}
			
			var obj = context.getAllWidgetsEffectiveDisplay();
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
				command.add(new StyleCommand(widget, [{'display':displayValue}], newState));
				if(removeFromBase && (widgetsToShowInNewState.indexOf(widget) >= 0)){
					command.add(new StyleCommand(widget, [{'display':'none'}], null));
				}
			}
			
			context.getCommandStack().execute(command);
			//FIXME: setting focus:true should be undoable
			States.setState(newState, context.rootNode, {focus:true});
		}
	},

	onCancel: function() {
		this.onClose();
	}
});

return declare("davinci.ve.actions.AddState", [Action], {

	run: function(){
		var context;
		if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
			context = Runtime.currentEditor.currentEditor.context;
		}else{
			return;
		}
		var statesFocus = States.getFocus(context.rootNode);
		if(!statesFocus || !statesFocus.stateContainerNode){
			return;
		}

		var w = new davinci.ve.actions.AddStateWidget({node: statesFocus.stateContainerNode });

		Workbench.showModal(w, veNls.createNewState, null, null, true);
	}
});
});