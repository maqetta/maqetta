define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"davinci/review/actions/PublishAction",
	"davinci/Runtime",
], function(declare, Action, PublishAction, Runtime) {

var RestartVersionAction = declare("davinci.review.actions.RestartVersionAction", [Action], {

	run: function(context) {
		var selection = context.getSelection ? context.getSelection() : null;
		if (!selection || !selection.length) { return; }
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		var action = new PublishAction(item,true);
		action.run();
	},

	shouldShow: function(context) {
		return true;
	},

	isEnabled: function(context) {
		var selection = context.getSelection ? context.getSelection() : null;
		if (!selection || selection.length == 0) {
			return false;
		}
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		if (item.designerId == davinci.Runtime.userName) { 
			//Only enable if the current user is also the review's designer
			if (item.closed) {
				return true;
			}
		}
		return false;
	}

});

return RestartVersionAction;

});