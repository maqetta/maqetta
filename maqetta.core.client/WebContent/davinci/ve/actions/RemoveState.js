define([
		"dojo/_base/declare",
		"davinci/Runtime",
		"davinci/ve/States",
		"davinci/actions/Action",
		"davinci/commands/CompoundCommand",
		"davinci/ve/commands/AppStateCommand"
], function(declare, Runtime, States, Action, CompoundCommand, AppStateCommand){


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
		if(state){
			var command = new CompoundCommand();
			command.add(new AppStateCommand({
				action:'remove',
				state:state,
				stateContainerNode:node,
				context:context
			}));
			context.getCommandStack().execute(command);
		}
	}
});
});
