define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojo/on",
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
	"dojo/text!./templates/ManageStates.html",
	"dijit/form/TextBox",
	"dijit/form/Select",
	"dijit/form/CheckBox",
	"dojox/form/TriStateCheckBox",
	"dijit/form/Button"
], function(
	declare,
	domConstruct,
	On,
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
	TriStateCheckBox,
	Button){

return declare("davinci.ve.actions._ManageStatesWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,
	widgetsInTemplate: true,
	_anyCheckBoxChanges: false,
	_states:[],				// array of all states in doc
	_stateContainers:[],	// array of all corresponding stateContainer nodes
	_checkBoxes:[],	// TriStateCheckBoxes for each of the states

	veNls: veNls,
	commonNls: commonNls,
	
	postCreate: function(){
		var context = this._getContext();
		if(!context){
			return;
		}
		this._anyCheckBoxChanges = false;
		var rootNode = context.rootNode;
		var manageStatesStatesListDiv = this.domNode.querySelector('.manageStatesStatesListDiv');
		if(manageStatesStatesListDiv){
			//Get list of all states (and corresponding stateContainers) in the doc
			var obj = this._getAllStatesInDoc();
			this._states = obj.states;
			this._stateContainers = obj.stateContainers;
			
			manageStatesStatesListDiv.style.width = '350px';
			manageStatesStatesListDiv.style.height = '100px';
			manageStatesStatesListDiv.style.border = '1px solid black';
			manageStatesStatesListDiv.style.overflowY = 'scroll';
			//Create table with TriStateCheckBox in col 1 and state name in col 2
			var table, tr, td;
			table = domConstruct.create('table', 
					{'class':'manageStatesStatesListTable',
					style:'width:100%',
					border:0, cellspacing:0, cellpadding:3}, 
					manageStatesStatesListDiv);
			for(var i=0; i<this._states.length; i++){
				tr = domConstruct.create('tr', {}, table);
				td = domConstruct.create('td', {'class':'manageStatesCheckboxCell'}, tr);
				var div = domConstruct.create('div', {id:'manageStatesTriState_'+i, 'class':'manageStatesCheckboxCell'}, td);
				this._checkBoxes[i] = new TriStateCheckBox({}, div);
				On(this._checkBoxes[i], 'change', function(){
					this._anyCheckBoxChanges = true;
				}.bind(this));
				domConstruct.create('td', {'class':'manageStatesStateNameCell', innerHTML:this._states[i]}, tr);
			}
		}
		On(this.moveWhichWidgets, 'change', function(){
			this.updateDialog();
			var moveWhichWidgets = this.moveWhichWidgets.get('value');
			var editorPrefsId = 'davinci.ve.editorPrefs';
			var projectBase = Workbench.getProject();
			var editorPrefs = Preferences.getPreferences(editorPrefsId, projectBase);
			editorPrefs.statesMoveWhich = moveWhichWidgets;
			Preferences.savePreferences(editorPrefsId, projectBase, editorPrefs);
		}.bind(this));
	},

	_isValid: function() {
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
	
	/**
	 * Returns list of all states in document.
	 * @returns {states:[{string}], stateContainers:[{element}]}, 
	 *		where states is a list of all state names
	 *		and stateContainers is the corresponding stateContainer node
	 */
	_getAllStatesInDoc: function(){
		var context;
		if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
			context = Runtime.currentEditor.currentEditor.context;
		}else{
			console.error('_ManageStatesWidget.js (from '+this._calledBy+' - cannot determine context.')
			return;
		}
		var states = [];
		var stateContainersList = [];
		var stateContainers = States.getAllStateContainers(context.rootNode);
		if(stateContainers){
			for(var i=0; i<stateContainers.length; i++){
				var statesList = States.getStates(stateContainers[i]);
				for(var j=0; j<statesList.length; j++){
					states.push(statesList[j]);
					stateContainersList.push(stateContainers[i]);
				}
			}
		}
		return {states:states, stateContainers:stateContainersList};
	},
	
	_getContext: function(){
		var context;
		if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
			context = Runtime.currentEditor.currentEditor.context;
		}else{
			console.error('_ManageStatesWidget.js (from '+this._calledBy+' - cannot determine context.')
		}
		return context;
	},

	/**
	 * Returns list of all widgets to be effected by this dialog
	 * @returns [{widgets}]
	 */
	_getAllEffectedWidgets: function(){
		var context = this._getContext();
		if(!context){
			return [];
		}
		var statesFocus = States.getFocus(context.rootNode);
		if(!statesFocus || !statesFocus.stateContainerNode){
			return;
		}
		var currentState = States.getState(statesFocus.stateContainerNode);
		var moveWhichWidgets = this.moveWhichWidgets.get('value');
		var obj = context.getAllWidgetsEffectiveDisplay(currentState);
		var allWidgets = obj.allWidgets;	// Array of all widgets
		var effectiveDisplay = obj.effectiveDisplay;	// Corresponding array of effective 'display' values
		var widgets = [];
		if(moveWhichWidgets == 'allVisible'){
			for(var i=0; i<allWidgets.length; i++){
				if(effectiveDisplay[i] != 'none'){
					widgets.push(allWidgets[i]);
				}
			}
		}else if(moveWhichWidgets == 'allSelected'){
			widgets = context.getSelection().slice(0);	// clone operation
		}
		return widgets;
	},

	updateDialog: function(){
		var context = this._getContext();
		if(!context){
			return;
		}
		var statesFocus = States.getFocus(context.rootNode);
		if(!statesFocus || !statesFocus.stateContainerNode){
			return;
		}
		var widgets = this._getAllEffectedWidgets();
		var manageStatesNoVisibleWidgets = this.domNode.querySelector('.manageStatesNoVisibleWidgets');
		var manageStatesNoSelectedWidgets = this.domNode.querySelector('.manageStatesNoSelectedWidgets');
		manageStatesNoVisibleWidgets.style.display = 'none';
		manageStatesNoSelectedWidgets.style.display = 'none';
		if(widgets.length == 0){
			if(moveWhichWidgets == 'allVisible'){
				manageStatesNoVisibleWidgets.style.display = 'inline';
			}else if(moveWhichWidgets == 'allSelected'){
				manageStatesNoSelectedWidgets.style.display = 'inline';
			}
		}
		for(var i=0; i<this._states.length; i++){
			var state = this._states[i];
			if(state == States.NORMAL || state == 'undefined'){
				state = undefined;
			}
			var count = 0;
			for(var j=0; j<widgets.length; j++){
				var widget = widgets[j];
				var obj = context.getEffectiveDisplayValue(widget, state);
				if(obj.effectiveDisplayValue != 'none'){
					if(!state && obj.effectiveState == 'undefined'){
						count++;
					}else if(state && obj.effectiveState == state){
						count++;
					}
				}
			}
			if(count == 0){
				this._checkBoxes[i].set('checked', false);
			}else if(count == widgets.length){
				this._checkBoxes[i].set('checked', true);
			}else{
				this._checkBoxes[i].set('checked', 'mixed');
			}
		}
	},

	onOk: function() {
		if(!this._anyCheckBoxChanges){
			return;
		}
		var context = this._getContext();
		if(!context){
			return;
		}
		var command;
		var widgets = this._getAllEffectedWidgets();
		for(var i=0; i<this._states.length; i++){
			var state = this._states[i];
			if(state == States.NORMAL || state == 'undefined'){
				state = undefined;
			}
			var value = this._checkBoxes[i].get('checked');
			if(value === true || value === false){
				for(var j=0; i<widgets.length; j++){
					var widget = widgets[j];
					if(!command){
						command = new CompoundCommand();
					}
					var displayValue = value ? '' : 'none !important';
					command.add(new StyleCommand(widget, [{'display':displayValue}], state));
				}
			}
		}
		if(command){
			context.getCommandStack().execute(command);
		}
	},

	onCancel: function() {
		this.onClose();
	}
});

});