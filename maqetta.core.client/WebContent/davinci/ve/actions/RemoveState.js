define([
		"dojo/_base/declare",
		"davinci/Runtime",
		"davinci/ve/States",
		"davinci/actions/Action"
], function(declare, Runtime, States, Action){


return declare("davinci.ve.actions.RemoveState", [Action], {

	run: function(){
		var context;
		if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
			context = Runtime.currentEditor.currentEditor.context;
		}else{
			return;
		}
		var statesFocus = States.getFocus(context.rootNode);
		if(!statesFocus || !statesFocus.state || statesFocus.state === States.NORMAL){
			return;
		}
		var node = statesFocus.stateContainerNode;
		var state = state = davinci.ve.states.getState(node);
		States.remove(node, state);
	}
});
});
