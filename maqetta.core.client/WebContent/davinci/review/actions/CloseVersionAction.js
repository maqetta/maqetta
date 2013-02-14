define([
	"dojo/_base/declare",
	"./_ReviewNavigatorCommon",
	"davinci/Runtime",
	"dojox/widget/Toaster",
	"dojo/i18n!./nls/actions"
], function(declare, _ReviewNavigatorCommon, Runtime, Toaster, nls) {

var CloseVersionAction = declare("davinci.review.actions.CloseVersionAction", [_ReviewNavigatorCommon], {

	run: function(context) {
		var selection = this._getSelection(context);
		if (!selection || !selection.length) { return; }
		okToClose=confirm(nls.areYouSureClose);
		if (!okToClose) { 
			return;
		}
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		dojo.xhrGet({
			url: "cmd/managerVersion",
			sync:false,
			handleAs:"text",
			content:{
				'type' :'close',
				'vTime':item.timeStamp
			}
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
				dojo.publish("/davinci/review/resourceChanged", [{message:nls.closeSuccessful, type:"message"},"closed",item]);
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
			if (!item.closed&&!item.isDraft) { 
				return true; 
			}
		}
		return false;
	}

});

return CloseVersionAction;

});