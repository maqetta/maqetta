dojo.provide("davinci.workbench.ViewPart");
 
dojo.require("davinci.workbench._ToolbaredContainer");
dojo.require("davinci.ve.States");

dojo.declare("davinci.workbench.ViewPart",davinci.workbench._ToolbaredContainer, {
		
	constructor: function(params, srcNodeRef){
    	this.viewExt=params.view;
    	this.subscriptions=[];
    	this.publishing={};
	},
	
	startup: function()
	{
		
		this.inherited(arguments);
		this.domNode.view=this;
//		dojo.addClass(this.domNode, "bbtView");
		if (this.viewExt.startup)
			this.viewExt.startup();
	},
	


	subscribe: function(topic,func)
	{
		var isStatesSubscription = topic.indexOf("/davinci/states") == 0;
		var subscription = isStatesSubscription ? davinci.states.subscribe(topic,this,func) : dojo.subscribe(topic,this,func);
		this.subscriptions.push(subscription);
	},
	
	
	publish: function (topic,data)
	{
		this.publishing[topic]=true;
		try {
			dojo.publish(topic,data);
		} catch(e) {
			console.error(e);
		}
		delete this.publishing[topic];
		
	},
	
	destroy: function()
	{
		dojo.forEach(this.subscriptions, function(item) {
			var topic = item[0];
			var isStatesSubscription = topic.indexOf("/davinci/states") == 0;
			if (isStatesSubscription) {
				davinci.states.unsubscribe(item);
			} else {
				dojo.unsubscribe(item);
			}
		});
		delete this.subscriptions;
	},
	
	_getViewActions : function()
	{
		var viewID=this.toolbarID || this.viewExt.id;
		
		var viewActions=[];
		var extensions = davinci.Runtime.getExtensions('davinci.viewActions', function(ext){
			if (viewID==ext.viewContribution.targetID)
			{
				viewActions.push(ext.viewContribution);
				return true;
			}
				
		});
		return viewActions;
        
	}
});
