dojo.provide("davinci.libraries.dojo.dojox.mobile.ViewReviewHelper");

dojo.declare("davinci.libraries.dojo.dojox.mobile.ViewReviewHelper", null, {

	init: function(widget, viewController) {
		if(viewController){
			var nearestParentViewMgr = viewController.nearestParentViewMgr(widget);
			viewController.setViewMgr(nearestParentViewMgr, this);
		}
		dojo.subscribe("/davinci/ui/widgetSelected",dojo.hitch(this,function(e){
			var widget=e[0];
			if(widget && widget.domNode && dojo.hasClass(widget.domNode,"mblView") && widget.domNode.id){
				davinci.ve.states.setState(widget.domNode.id);
			}
		}));
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
	},
	
	getView: function(viewContainerWidget){
		if(viewContainerWidget){
			var node = viewContainerWidget.domNode;
			if(node && node.ownerDocument){
				for(var i = 0; i < node.children.length; i++){
					var child = node.children[i];
					if(dojo.hasClass(child, "mblView")){
						var display = dojo.style(child,"display");
						if(dojo.style(child,"display")!="none"){
							return child.id;
						}
					}
				}
			}
		}
		return null;
	},
	
	setView: function(viewContainerWidget, newView, updateWhenCurrent, _silent){
		if(viewContainerWidget && typeof newView == "string"){
			var context = viewContainerWidget._edit_context;
			var node = viewContainerWidget.domNode;
			if(node && node.ownerDocument && context){
				var dj = node.ownerDocument.defaultView.dojo;
				var newSelectedViewNode = dj.byId(newView);
				if(newSelectedViewNode){
					for(var i = 0; i < node.children.length; i++){
						var child = node.children[i];
						if(dojo.hasClass(child, "mblView")){
							if(child == newSelectedViewNode){
								child.style.display = "block";
								if(child._dvWidget){
									context.select(child._dvWidget);									
								}
							}else{
								child.style.display = "none";							
							}
						}
					}
				}							
			}
		}
	}

});