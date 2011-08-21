dojo.provide("davinci.libraries.dojo.dojox.mobile.ViewReviewHelper");

dojo.declare("davinci.libraries.dojo.dojox.mobile.ViewReviewHelper", null, {

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