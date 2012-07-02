define([
    	"dojo/_base/declare",
    	"davinci/actions/Action"
], function(declare, Action){


return declare("davinci.ve.actions.RemoveState", [Action], {

	run: function(context){
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
