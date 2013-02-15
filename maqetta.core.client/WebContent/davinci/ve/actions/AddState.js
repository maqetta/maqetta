define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/workbench/Preferences",
	"davinci/ve/States",
	"davinci/actions/Action",
	"dojo/i18n!davinci/ve/nls/ve",
	"davinci/ve/actions/_AddManageStatesWidget"
], function(
	declare,
	Runtime,
	Workbench,
	Preferences,
	States,
	Action,
	veNls,
	_AddManageStatesWidget){

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

		var w = new davinci.ve.actions._AddManageStatesWidget({node: statesFocus.stateContainerNode });
		w._calledBy = 'AddState';

		Workbench.showModal(w, veNls.createNewState, null, null, true);
		w.okButton.set("disabled", true);
	}
});
});