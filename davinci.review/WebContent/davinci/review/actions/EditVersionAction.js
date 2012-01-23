dojo.provide("davinci.review.actions.EditVersionAction");

dojo.require("davinci.actions.Action");

dojo.declare("davinci.review.actions.EditVersionAction",davinci.actions.Action,{
	run: function(context){
		var selection = davinci.Runtime.getSelection();
		if(!selection) return;
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		var action = new davinci.review.actions.PublishAction(item);
		action.run();
	},

	shouldShow: function(context){
		return true;
	},
	
	isEnabled: function(context){
		if(davinci.review.Runtime.getRole()!="Designer") return false;
		var selection = davinci.Runtime.getSelection();
		return selection && selection.length > 0 ? true : false;
	}
});