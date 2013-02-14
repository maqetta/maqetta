define([
	"dojo/_base/declare",
	"./_ReviewNavigatorCommon",
	"davinci/review/actions/PublishAction",
	"davinci/Runtime",
], function(declare, _ReviewNavigatorCommon, PublishAction, Runtime) {

var RestartVersionAction = declare("davinci.review.actions.RestartVersionAction", [_ReviewNavigatorCommon], {

	run: function(context) {
		var selection = this._getSelection(context);
		if (!selection || !selection.length) { return; }
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		var action = new PublishAction(item,true);
		action.run();
	},

	isEnabled: function(context) {
		var selection = this._getSelection(context);
		if (!selection || selection.length == 0) {
			return false;
		}
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		if (item.designerId == Runtime.userName) { 
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