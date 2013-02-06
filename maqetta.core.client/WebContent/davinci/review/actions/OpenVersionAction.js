define([
	"dojo/_base/declare",
	"./_ReviewNavigatorCommon",
	"davinci/Runtime",
	"dojox/widget/Toaster",
	"dojo/i18n!./nls/actions"
], function(declare, _ReviewNavigatorCommon, Runtime, Toaster, nls) {

var OpenVersionAction = declare("davinci.review.actions.OpenVersionAction", [_ReviewNavigatorCommon], {

	run: function(context) {
		var selection = this._getSelection(context);
		if (!selection || !selection.length)  { 
			return;
		}
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		dojo.xhrGet({
			url: "cmd/managerVersion",
			sync:false,
			handleAs:"text",
			content:{
				'type' :'open',
				'vTime':item.timeStamp}
		}).then(function (result) {
			if (result=="OK") {
				if (typeof hasToaster == "undefined") {
					new Toaster({
						position: "br-left",
						duration: 4000,
						messageTopic: "/davinci/review/resourceChanged"
					});
					hasToaster = true;
				}
				dojo.publish("/davinci/review/resourceChanged", [{message:nls.openSuccessful, type:"message"},"open",item]);
			}
		});
	},

	isEnabled: function(context) {
		var selection = this._getSelection(context);
		if (!selection || selection.length == 0) { 
			return false;
		}
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		if (item.designerId == Runtime.userName) { 
			//Only enable if the current user is also the review's designer
			if (item.closed&&item.closedManual&&!item.isDraft) { 
				return true;
			}
		}
		return false;
	}
});

return OpenVersionAction;

});