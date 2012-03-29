define([
	"dojo/_base/declare",
	"../../actions/Action",
	"./PublishAction",
	"../../Runtime",
	"dojox/widget/Toaster",
	"dojo/i18n!./nls/actions"
], function(declare, Action, PublishAction, Runtime, Toaster, nls) {

return declare("davinci.review.actions.EditVersionAction", [Action], {

	run: function(context) {
		var selection = context.getSelection ? context.getSelection() : null;
		if(!selection || !selection.length) return;
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		var action = new PublishAction(item);
		action.run();
	},

	shouldShow: function(context) {
		return true;
	},

	isEnabled: function(context) {
		var selection = context.getSelection ? context.getSelection() : null;
		if (selection && selection.length > 0) {
			var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
			if (item.designerId == davinci.Runtime.userName) { 
				//Only enable if the current user is also the review's designer
				return true;
			}
		} 
		return false;
	}
});
});