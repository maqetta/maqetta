define([
	"dojo/_base/declare",
	"davinci/actions/Action",
], function(declare, Action){

return declare("davinci.review.actions.RestartVersionAction", Action, {

	run: function(context){
		var selection = davinci.Runtime.getSelection();
		if(!selection) return;
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		var action = new davinci.review.actions.PublishAction(item,true);
		action.run();
	},

	shouldShow: function(context){
		return true;
	},
	
	isEnabled: function(context){
		if(davinci.review.Runtime.getRole()!="Designer") return false;
		var selection = davinci.Runtime.getSelection();
		if(!selection || selection.length == 0) return false;
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		if(item.closed) return true;
		return false;
	}
});
});