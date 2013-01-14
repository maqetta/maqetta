define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/workbench/Preferences",
	"dijit/registry",
	"davinci/ve/States",
	"davinci/actions/Action",
	"dojo/i18n!davinci/ve/nls/ve",
	"davinci/ve/actions/_ManageStatesWidget"
], function(
	declare,
	Runtime,
	Workbench,
	Preferences,
	registry,
	States,
	Action,
	veNls,
	_ManageStatesWidget){

return declare("davinci.ve.actions.ManageStates", [Action], {

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
		if(States.manageStatesActive(context)){
			var w = new davinci.ve.actions._ManageStatesWidget({node: statesFocus.stateContainerNode });
			w._calledBy = 'ManageStates';
			w.okButton.set("label", veNls.updateLabel);
			var editorPrefsId = 'davinci.ve.editorPrefs';
			var projectBase = Workbench.getProject();
			var editorPrefs = Preferences.getPreferences(editorPrefsId, projectBase);
			if(editorPrefs && typeof editorPrefs.statesMoveWhich == 'string'){
				w.moveWhichWidgets.set('value', editorPrefs.statesMoveWhich);
			}
			w.updateDialog();
			var dialog = Workbench.showModal(w, veNls.manageStates, null, null, true);
		}

	}
});
});