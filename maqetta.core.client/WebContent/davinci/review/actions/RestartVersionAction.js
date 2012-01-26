define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"davinci/review/actions/PublishAction",
	"davinci/Runtime",
], function(declare, Action, PublishAction, Runtime) {

if (typeof davinci.review.actions === "undefined") {
	davinci.review.actions = {};
}

var RestartVersionAction = davinci.review.actions.RestartVersionAction = declare("davinci.review.actions.RestartVersionAction", Action, {

	run: function(context) {
		var selection = Runtime.getSelection();
		if(!selection) { 
			return;
		}
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		var action = new PublishAction(item,true);
		action.run();
	},

	shouldShow: function(context) {
		return true;
	},

	isEnabled: function(context) {
		if (Runtime.getRole()!="Designer") { 
			return false;
		}
		var selection = Runtime.getSelection();
		if (!selection || selection.length == 0) {
			return false;
		}
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		if (item.closed) {
			return true;
		}
		return false;
	}

});

return RestartVersionAction;

});