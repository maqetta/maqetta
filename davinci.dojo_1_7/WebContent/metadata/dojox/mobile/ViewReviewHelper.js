dojo.provide("davinci.libraries.dojo.dojox.mobile.ViewReviewHelper");

dojo.declare("davinci.libraries.dojo.dojox.mobile.ViewReviewHelper", null, {

	init: function(widget, viewController) {
		if(viewController){
			var nearestParentViewMgr = viewController.nearestParentViewMgr(widget);
			viewController.setViewMgr(nearestParentViewMgr, this);
		}
	},
	
	getViews: function(widget){
		var views={};
		var node = widget.domNode;
		if(node){
			for(var i = 0; i < node.children.length; i++){
				var child = node.children[i];
				if(dojo.hasClass(child, "mblView")){
					views[child.id]=child.id;
				}
			}
		}
		return views;
	}

});