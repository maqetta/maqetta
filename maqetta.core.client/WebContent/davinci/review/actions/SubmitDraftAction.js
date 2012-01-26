define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"davinci/review/actions/PublishAction",
	"davinci/Runtime",
], function(declare, Action, PublishAction, Runtime) {

if (typeof davinci.review.actions === "undefined") {
	davinci.review.actions = {};
}

var SubmitDraftAction = davinci.review.actions.SubmitDraftAction = declare("davinci.review.actions.SubmitDraftAction", Action, {

	run: function(context) {
		var selection = davinci.Runtime.getSelection();
		if(!selection) { 
			return;
		}
		var firstSelection = selection[0].resource;
		var item = firstSelection.elementType=="ReviewFile"?firstSelection.parent:firstSelection;
		var children;
		item.getChildren(function(c) {children=c;}, true);

		if (children&&children.length>0) {
			var location = davinci.Workbench.location().match(/http:\/\/.*:\d+\//);
			dojo.xhrGet({
				url: location + "maqetta/cmd/managerVersion",
				sync:false,
				handleAs:"text",
				content:{
					'type' :'publish',
					'vTime':item.timeStamp}
			}).then(function (result) {
				if (result=="OK") {
					if (typeof hasToaster == "undefined") {
						new dojox.widget.Toaster({
							position: "br-left",
							duration: 4000,
							messageTopic: "/davinci/review/resourceChanged"
						});
						hasToaster = true;
					}
					dojo.publish("/davinci/review/resourceChanged", [{message:"Submit the Draft successfully!", type:"message"}]);
				}
			});
			return;
		}

		var option = confirm("There is no file in this draft, edit it?");
		if(option){
			var action = new PublishAction(item);
			action.run();
		} else {
			return;
		}

	},

	shouldShow: function() {
		return true;
	},

	isEnabled: function(context) {
		if(davinci.Runtime.getRole()!="Designer") {
			return false;
		}
		var selection = Runtime.getSelection();
		if(!selection) {
			return false;
		}
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		if(item.isDraft) {
			return true;
		}
		return false;
	}

});

return SubmitDraftAction;

});