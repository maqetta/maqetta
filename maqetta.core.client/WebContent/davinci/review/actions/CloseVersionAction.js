define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"davinci/Runtime",
	"dojox/widget/Toaster",
	"dojo/i18n!./nls/actions"
], function(declare, Action, Runtime, Toaster, nls) {

var CloseVersionAction = declare("davinci.review.actions.CloseVersionAction", [Action], {

	run: function(context) {
		var selection = context.getSelection ? context.getSelection() : null;
		if (!selection || !selection.length) { return; }
		okToClose=confirm(nls.areYouSureClose);
		if (!okToClose) { 
			return;
		}
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		var location = davinci.Workbench.location().match(/http:\/\/.*:\d+\//);
		dojo.xhrGet({
			url: location + "maqetta/cmd/managerVersion",
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

	shouldShow: function(context) {
		return true;
	},

	isEnabled: function(context) {
		if (davinci.Runtime.getRole()!="Designer") { 
			return false;
		}
		var selection = context.getSelection ? context.getSelection() : null;
		if (!selection || selection.length == 0) { 
			return false;
		}
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		if (!item.closed&&!item.isDraft) { 
			return true; 
		}
		return false;
	}

});

return CloseVersionAction;

});