dojo.provide("davinci.review.actions.DeleteVersionAction");

dojo.require("davinci.actions.Action");
dojo.require("dojox.widget.Toaster");

dojo.declare("davinci.review.actions.DeleteVersionAction",davinci.actions.Action,{
	run: function(context){
	var selection = davinci.Runtime.getSelection();
	if(!selection) return;
	
	okToClose=confirm("Are you sure you want to delete this version");
	if(!okToClose)
		return;
	var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		dojo.xhrGet({url:"./cmd/managerVersion",sync:false,handleAs:"text",
			content:{
			'type' :'delete',
			'vTime':item.timeStamp}
		}).then(function (result){
			if (result=="OK")
            {
            	if(typeof hasToaster == "undefined"){
	            	new dojox.widget.Toaster({
	            			position: "br-left",
	            			duration: 4000,
	            			messageTopic: "/davinci/review/resourceChanged"
	            	});
	            	hasToaster = true;
            	}
            	dojo.publish("/davinci/review/resourceChanged", [{message:"Delete the version successfully!", type:"message"},"delete",item]);
            	for(var i=0;i<item.children.length;i++){
            			dojo.publish("/davinci/resource/resourceChanged",["deleted",item.children[i]]);
            	}
            }
		});
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