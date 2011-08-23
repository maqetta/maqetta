dojo.provide("davinci.libraries.dojo.dojox.mobile.ViewHelper");


dojo.declare("davinci.libraries.dojo.dojox.mobile.ViewHelper", null, {

	/**
	 * Override default dojox.mobile.View behavior, which is to automatically
	 * hide ("display: none") any additional Views added to page.  This causes
	 * the Outline view to be out of sync with the Visual Editor -- Outline
	 * shows a View as visible (open eyeball), but in the VE the View has
	 * "display: none" set.
	 * 
	 * DEV NOTES: Had to rely on 'setInterval' since nothing else would work.
	 * In the case where a View is hidden, the Dojox code publishes no event
	 * and calls no function to which I could dojo.connect(). Plus, the code
	 * that hides the View DOM node takes place in a 'setTimeout', potentially
	 * introducing timing issues between that code and this. For these reasons,
	 * I had to settle for a 'setInterval' that keeps getting called until
	 * "display: none" is set on the View -- at that point, the code resets it
	 * to "display: block".
	 */
	create: function(widget, srcElement) {
		var view = widget.dijitWidget,
			node = widget.domNode;
		dojo.connect(view, 'startup', function() {
			// Since this may get called twice, check that we haven't already
			// created this interval.
			if (! widget._dvDisplayInterval) {
				widget._dvDisplayInterval = setInterval(function() {
					var win = dijit.getDocumentWindow(node.ownerDocument);
					if (win.dojox.mobile.currentView === view ||
							node.style.display === 'none') {
						node.style.display = 'block';
						clearInterval(widget._dvDisplayInterval);
						delete widget._dvDisplayInterval;
					}
				}, 100);
			}
		});
		dojo.publish("/davinci/states/list/changed",null);
	},
	
	setStyle: function(widget, state, style, value, silent) {
		//FIXME: Need to figure out how this relates to states.
		//Maybe need to update display for states for all sibling widgets
		//FIXME: Need to deal with other properties than just display
		if(typeof style.display == "string"){
			if(style.display == "none"){
				return false;
			}else{
				var domNode = widget.domNode;
				var display = dojo.style(domNode,"display");
				if(display=="none"){
					var nearestParentViewMgr = davinci.ve.states.nearestParentViewMgr(widget);
					davinci.ve.states.setView(nearestParentViewMgr, domNode.id);
					return true;
				}else{
					return false;
				}				
			}
		}
		return false;
	}

});