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
			var widgetsToMove = [];
			var allVisibleWidgets = context.getAllVisibleWidgets();
			var moveWhichWidgets = this.moveWhichWidgets.get('value');
			if(moveWhichWidgets == 'allVisible'){
				widgetsToMove = allVisibleWidgets;
			}else if(moveWhichWidgets == 'allSelected'){
				widgetsToMove = context.getSelection();
			}
			var removeFromBase = this.addStateRemoveFromBase.get('checked');
			for(var i=0; i< allVisibleWidgets.length; i++){
				var widget = allVisibleWidgets[i];
				var moveThisWidget = (widgetsToMove.indexOf(widget) >= 0);
				var displayValue = moveThisWidget ? '' : 'none';
				command.add(new StyleCommand(widget, [{'display':displayValue}], newState));
				if(removeFromBase && moveThisWidget){
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