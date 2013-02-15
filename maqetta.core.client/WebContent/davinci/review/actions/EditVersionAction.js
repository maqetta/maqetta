define([
	"dojo/_base/declare",
	"./_ReviewNavigatorCommon",
	"./PublishAction",
	"../../Runtime",
	"dojox/widget/Toaster",
	"dojo/i18n!./nls/actions"
], function(declare, _ReviewNavigatorCommon, PublishAction, Runtime, Toaster, nls) {

return declare("davinci.review.actions.EditVersionAction", [_ReviewNavigatorCommon], {

	run: function(context) {
		var selection = this._getSelection(context);
		if(!selection || !selection.length) return;
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		var action = new PublishAction(item);
		action.run();
	},

	isEnabled: function(context) {
		var selection = this._getSelection(context);
		if (selection && selection.length > 0) {
			var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
			if (item.designerId == Runtime.userName) { 
				//Only enable if the current user is also the review's designer
				return true;
			}
		} 
		return false;
	}
});
});