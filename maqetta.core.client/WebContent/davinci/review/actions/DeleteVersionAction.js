define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"davinci/Runtime",
	"dojox/widget/Toaster",
	"dojo/i18n!./nls/actions"
], function(declare, Action, Runtime, Toaster, nls) {

var DeleteVersionAction = declare("davinci.review.actions.DeleteVersionAction", [Action], {

	run: function(context) {
		var selection = context.getSelection ? context.getSelection() : null;
		if (!selection || !selection.length) { return; }

		okToClose=confirm(nls.areYouSureDelete);
		if(!okToClose)
			return;
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		var cmdURL = davinci.Workbench.location() + "cmd/managerVersion";
		dojo.xhrGet({
			url: cmdURL,
			sync: false,
			handleAs: "text",
			content: {
				'type' :'delete',
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
				dojo.publish("/davinci/review/resourceChanged", [{message:nls.deleteSuccessful, type:"message"},"delete",item]);
				for (var i=0;i<item.children.length;i++) {
					dojo.publish("/davinci/resource/resourceChanged",["deleted",item.children[i]]);
				}
			}
		});
	},

	shouldShow: function(context) {
		return true;
	},

	isEnabled: function(context) {
		if (davinci.Runtime.getRole()!="Designer") { return false; }
		var selection = context.getSelection ? context.getSelection() : null;
		return selection && selection.length > 0 ? true : false;
	}

});

return DeleteVersionAction;

});