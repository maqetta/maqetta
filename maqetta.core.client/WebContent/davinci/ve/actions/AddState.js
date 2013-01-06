define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/ve/States",
	"davinci/actions/Action",
	"dojo/i18n!davinci/ve/nls/ve",
	"davinci/ve/actions/_AddUpdateStateWidget"
], function(
	declare,
	Runtime,
	Workbench,
	States,
	Action,
	veNls,
	_AddUpdateStateWidget){

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

		var w = new davinci.ve.actions._AddUpdateStateWidget({node: statesFocus.stateContainerNode });

		Workbench.showModal(w, veNls.createNewState, null, null, true);
		w.okButton.set("disabled", true);

	}
});
});