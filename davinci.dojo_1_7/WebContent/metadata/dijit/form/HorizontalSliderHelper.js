define([
"dojo/_base/declare"
], function(declare){

return declare("davinci.libraries.dojo.dijit.form.HorizontalSliderHelper", null, {

	/**
	 * HorizontalSlider, due to its support for placing rules and labels in the
	 * 'topDecoration' container, keeps its children in two locations 
	 * (its 'domNode' is not the same as its 'containerNode' which is not the same as
	 * 'topDecoration'). We handle that here.
	 * 
	 * @param  {davinci.ve._Widget} widget
	 * @param  {boolean} attach
	 * @return {Array}
	 */
	getChildren: function(widget, attach) {
		function getWidget(node) {
			if (attach) {
				return davinci.ve.widget.getWidget(node);
			} else {
				var widget = node._dvWidget;
				if (widget) {
					return widget;
				}
			}
		}

		var dijitWidget = widget.dijitWidget;
		// First, get children from slider's containerNode.
		var children = widget._getChildren(attach);

		// Second, look at the children in the slider's topDecoration section. Go in reverse order 
		// since we'll be adding the widgets (if they exist) to the front of children 
		// to have proper order in Visual Editor
		var decoration = this._getDecoration(dijitWidget);
		for(var node = decoration.lastChild; node; node = node.previousSibling){
			var childWidget = getWidget(node);
			
			// Use unshift() to front of array, so that
			// array order matches order of elements in Visual Editor.
			children.unshift(childWidget);
		}

		return children;
	},

	_getDecoration: function(dijitWidget) {
		return dijitWidget.topDecoration;
	}
});
});