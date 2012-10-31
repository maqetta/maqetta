define(function() {

var IconItemHelper = function() {};
IconItemHelper.prototype = {

	create: function(widget, srcElement) {
		// Fix for #705.
		// The IconItem widget's startup logic registers an onclick
		// handler on its DOM node if there is a
		// "moveTo" property that has a reference to a view.
		// This built-in onclick handler will launch an animated
		// transition to make that view visible. This is good for runtime execution,
		// but we don't want this onclick handler to execute in the page editor.
		// So, register a "click" handler in the capture phase (happens before default bubble phase)
		// that calls stopPropagation(), which prevents the IconItem's onclick logic from getting invoked.
		// This allows event to bubble up to ancestor widgets, and therefore
		// will be caught by Maqetta and will cause a selection action to occur.
		var dijitWidget = widget.dijitWidget;
		if(dijitWidget){
			var domNode = dijitWidget.domNode;
			if(domNode){
				var parentNode = domNode.parentNode;
				if(parentNode){
					parentNode.addEventListener("click",function(e){
						e.stopPropagation();		
					}, true);
				}
			}
		}
	}

};

return IconItemHelper;

});