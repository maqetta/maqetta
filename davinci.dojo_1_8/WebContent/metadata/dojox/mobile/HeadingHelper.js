define([
	"dojo/_base/declare",
	"dojo/query",
	"./_FixedElemMixin",
	"./InitialSizeHelper"
], function(
	declare,
	query,
	_FixedElemMixin,
	InitialSizeHelper
) {

return declare([_FixedElemMixin, InitialSizeHelper], {

	create: function(widget, srcElement){
		// Fix for #705.
		// The Heading widget's startup logic registers an onclick
		// handler on the back arrow's DOM node if there is both
		// a "back" and "moveTo" property that has a reference to a view.
		// This built-in onclick handler will launch an animated
		// transition to make that view visible. This is good for runtime execution,
		// but we don't want this onclick handler to execute in the page editor.
		// So, register a "click" handler in the capture phase (happens before default bubble phase)
		// that calls stopPropagation(), which prevents the Heading's onclick logic from getting invoked.
		// This allows event to bubble up to ancestor widgets, and therefore
		// will be caught by Maqetta and will cause a selection action to occur.
		var dijitWidget = widget.dijitWidget;
		if(dijitWidget){
			var domNode = dijitWidget.domNode;
			var mblArrowButtonNode = query('.mblArrowButton',domNode)[0];
			if(mblArrowButtonNode){
				mblArrowButtonNode.addEventListener("click",function(e){
					e.stopPropagation();		
				}, true);
			}
		}
	},

	getData: function(/*Widget*/ widget, /*Object*/ options) {
		var data = widget._getData(options);

		// the backButton, defined by the back property, creates a child ToolbarButton
		// when set.  So we want to make sure we don't include it in any getData
		// calls.
		if (widget.dijitWidget.backButton) {
			data.children.splice(0,1)
		}
		return data;
	}
});

});