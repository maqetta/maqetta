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
	},
	
	setView: function(widget, newState, updateWhenCurrent, _silent){
		if (arguments.length < 2) {
			newState = arguments[0];
			widget = undefined;
		}
		debugger;
		widget = this._getWidget(widget);
		if (!widget || !widget.states || (!updateWhenCurrent && widget.states.current == newState)) {
			return;
		}
		var oldState = widget.states.current;
		
		if (this.isNormalState(newState)) {
			if (!widget.states.current) return;
			delete widget.states.current;
			newState = undefined;
		} else {
			widget.states.current = newState;
		}
		if (!_silent) {
			this.publish("/davinci/states/state/changed", [{widget:widget, newState:newState, oldState:oldState}]);
			this.publish("/davinci/states/list/changed", null);
		}
		this._updateSrcState (widget);		
	}

});