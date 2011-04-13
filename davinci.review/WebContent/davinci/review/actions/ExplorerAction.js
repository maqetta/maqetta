dojo.provide("davinci.review.actions.ExplorerAction");

dojo.require("davinci.actions.Action");
dojo.require("dojox.widget.Toaster");

dojo.declare("davinci.review.EditVersion",davinci.actions.Action,{
	run: function(context){
		if(!context.select) return;
		var item = context.select.elementType=="ReviewFile"?context.select.parent:context.select;
		var action = new davinci.review.actions.PublishAction(item);
		action.run();
	},
	
	shouldShow: function(context){
		return true;
	},
	
	isEnabled: function(context){
		if(davinci.review.Runtime.getRole()!="Designer") return false;
		return true;
	}
});

dojo.declare("davinci.review.CloseVersion",davinci.actions.Action,{
	run: function(context){
		if(!context.select) return;
		var item = context.select.elementType=="ReviewFile"?context.select.parent:context.select;
		dojo.xhrGet({url:"./cmd/managerVersion",sync:false,handleAs:"text",
			content:{
			'type' :'close',
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
            	dojo.publish("/davinci/review/resourceChanged", [{message:"Close the version successfully!", type:"message"}]);
            }
		});
	},

	shouldShow: function(context){
		return true;
	},
	
	isEnabled: function(context){
		if(davinci.review.Runtime.getRole()!="Designer") return false;
		return true;
	}
});

