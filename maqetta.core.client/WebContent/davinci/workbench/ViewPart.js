define([
    "dojo/_base/declare",
	"./_ToolbaredContainer",
	"../ve/States",
	"../Runtime"
], function(declare, ToolbaredContainer, States, Runtime) {

return declare("davinci.workbench.ViewPart", ToolbaredContainer, {
		
	constructor: function(params, srcNodeRef){
    	this.viewExt=params.view;
    	this.subscriptions=[];
    	this.publishing={};
	},
	
	startup: function()
	{
		this.inherited(arguments);
		this.domNode.view=this;
		if (this.viewExt.startup) {
			this.viewExt.startup();
		}
	},

	subscribe: function(topic,func) {
		this.subscriptions.push(dojo.subscribe(topic,this,func));
	},

	publish: function (topic,data) {
		this.publishing[topic]=true;
		try {
			dojo.publish(topic,data);
		} catch(e) {
			console.error(e);
		}
		delete this.publishing[topic];
	},

	destroy: function() {
		dojo.forEach(this.subscriptions, dojo.unsubscribe);
		delete this.subscriptions;
	},
	
	_getViewActions: function() {
		var viewID=this.toolbarID || this.viewExt.id;
		var viewActions = [];
		Runtime.getExtensions('davinci.viewActions', function(ext){
			if (viewID == ext.viewContribution.targetID) {
				viewActions.push(ext.viewContribution);
				return true;
			}
		});
		return viewActions;
	}
});
});
