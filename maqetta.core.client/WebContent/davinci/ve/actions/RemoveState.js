define([
    	"dojo/_base/declare",
    	"davinci/actions/Action"
], function(declare, Action){


return declare("davinci.ve.actions.RemoveState", [Action], {

	run: function(context){
		var widget = this.getWidget();
		var state = this.getState(arguments[1] || arguments[0]);
		davinci.ve.states.remove(widget, state);
	},

	isEnabled: function(context){
		return this.getWidget();
	},

	shouldShow: function(context){
		return this.getWidget();
	},
	
	getWidget: function(widget) {
		if (!widget) {
			widget = davinci.ve.states.getContainer();
		}
		return widget;
	},
	
	getState: function(state) {
		if (!state || typeof state != "string") {
			state = davinci.ve.states.getState();
		}
		return state;
	}
});
});
