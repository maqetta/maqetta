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
//FIXME: Doesn't work with nested states
		var node = this.getNode();
		var state = this.getState(arguments[1] || arguments[0]);
		davinci.ve.states.remove(node, state);
	},

	isEnabled: function(context){
		return this.getNode();
	},

	shouldShow: function(context){
		return this.getNode();
	},
	
	getNode: function(node) {
		if (!node) {
			node = davinci.ve.states.getContainer();
		}
		return node;
	},
	
	getState: function(state) {
		var node = this.getNode();
		if (!state || typeof state != "string") {
			state = davinci.ve.states.getState(node);
		}
		return state;
	}
});
});
