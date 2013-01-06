define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/Workbench",
	"dijit/registry",
	"davinci/ve/States",
	"davinci/actions/Action",
	"dojo/i18n!davinci/ve/nls/ve",
	"davinci/ve/actions/_AddUpdateStateWidget"
], function(
	declare,
	Runtime,
	Workbench,
	registry,
	States,
	Action,
	veNls,
	_AddUpdateStateWidget){

return declare("davinci.ve.actions.UpdateState", [Action], {

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
		var dialog = Workbench.showModal(w, veNls.updateCurrentState, null, null, true);
		
		// Tweak the AddState.html template to hide the state name DIV
		// and change the button label from "Create" to "Update"
		var addStateNameDiv = dialog.domNode.querySelector('.addStateNameDiv');
		if(addStateNameDiv){
			addStateNameDiv.style.display = 'none';
		}
		w.okButton.set("label", veNls.updateLabel);
	}
});
});