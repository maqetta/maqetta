define([
	"dojo/_base/declare",
	"../actions/Action",
	"./PublishAction",
	"../Runtime",
	"dojox/widget/Toaster",
	"dojo/i18n!./nls/actions"
], function(declare, Action, PublishAction, Runtime, Toaster, nls) {

return declare("davinci.review.actions.EditVersionAction", Action, {

	run: function(context) {
		var selection = Runtime.getSelection();
		if(!selection) return;
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		var action = new PublishAction(item);
		action.run();
	},

	shouldShow: function(context) {
		return true;
	},

	isEnabled: function(context) {
		if(davinci.Runtime.getRole()!="Designer") {
			return false;
		}
		var selection = Runtime.getSelection();
		return selection && selection.length;
	}
});
});