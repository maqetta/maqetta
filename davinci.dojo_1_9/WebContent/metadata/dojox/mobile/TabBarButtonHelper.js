define([
	"dojo/query"
], function(query) {

var TabBarButtonHelper = function() {};
TabBarButtonHelper.prototype = {
	
	create: function(widget, srcElement){
		// Fix for #705.
		// The TabBarButton widget's startup logic registers an onclick
		// handler on one of its interior DOM nodes if there is a
		// "moveTo" property that has a reference to a view.
		// This built-in onclick handler will launch an animated
		// transition to make that view visible. This is good for runtime execution,
		// but we don't want this onclick handler to execute in the page editor.
		// So, register a "click" handler in the capture phase (happens before default bubble phase)
		// that calls stopPropagation(), which prevents the TabBarButton's onclick logic from getting invoked.
		// This allows event to bubble up to ancestor widgets, and therefore
		// will be caught by Maqetta and will cause a selection action to occur.
		var dijitWidget = widget.dijitWidget;
		if(dijitWidget){
			var domNode = dijitWidget.domNode;
			var mblTabBarButtonAnchorNode = query('.mblTabBarButtonAnchor',domNode)[0];
			if(mblTabBarButtonAnchorNode){
				mblTabBarButtonAnchorNode.addEventListener("click",function(e){
					e.stopPropagation();		
				}, true);
			}
		}
	}

};

return TabBarButtonHelper;

});