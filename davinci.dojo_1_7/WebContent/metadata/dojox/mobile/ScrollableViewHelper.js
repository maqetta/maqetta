dojo.provide("davinci.libraries.dojo.dojox.mobile.ScrollableViewHelper");
dojo.require("davinci.libraries.dojo.dojox.mobile.ViewHelper");


dojo.declare("davinci.libraries.dojo.dojox.mobile.ScrollableViewHelper", [davinci.libraries.dojo.dojox.mobile.ViewHelper], {

	/**
	 * Disable the scrolling mechanism at design time (only) because it conflicts
	 * with mouse events necessary to set the selection in Maqetta.
	 */
	create: function(widget, srcElement) {
		this.inherited(arguments);
		if (widget.dijitWidget){
		    widget.dijitWidget.disableScroll(true);
		}

	}

});