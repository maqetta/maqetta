define(function() {

return {

	create: function(widget, srcElement) {
		var dijitWidget = widget.dijitWidget;
		if(dijitWidget && dijitWidget.anchorNode){
			// Fix for #705.
			// The ListItem widget's startup logic registers an onclick
			// handler, and if the 'moveTo' property has a reference to a view,
			// then this built-in onclick handler will launch an animated
			// transition to make that view visible. This is good for runtime execution,
			// but we don't want this onclick handler to execute in the page editor.
			// So, register a "click" handler in the capture phase (happens before default bubble phase)
			// that calls stopPropagation(), which prevents the ListItem's onclick logic from getting invoked.
			// This allows event to bubble up to ancestor widgets, and therefore
			// will be caught by Maqetta and will cause a selection action to occur.
			dijitWidget.anchorNode.addEventListener("click",function(e){
				e.stopPropagation();		
			}, true);
		}
	},
	
	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		// Pull child markup from model
		var text = '';
		if(widget && widget._srcElement && widget._srcElement.children){
			var children = widget._srcElement.children;
			for(var i=0; i<children.length; i++){
				text += children[i].getText();
			}
		}
		return text;
	}

};

});