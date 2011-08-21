dojo.provide("davinci.libraries.dojo.dojox.mobile.ViewRTHelper");

dojo.declare("davinci.libraries.dojo.dojox.mobile.ViewRTHelper", null, {

	init: function(widget, viewController) {
		if(viewController){
			var nearestParentViewMgr = viewController.nearestParentViewMgr(widget);
			viewController.setViewMgr(nearestParentViewMgr, this);
		}
	},
	
	getViews: function(widget){
		return [];
	}

});