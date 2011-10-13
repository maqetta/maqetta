dojo.provide("davinci.libraries.dojo.dojox.mobile.ScrollableViewHelper");

dojo.require("davinci.libraries.dojo.dojox.mobile.ViewHelper");
dojo.require("davinci.ve.widget");


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

	},

	/**
	 * ScrollableView, due to its support for fixed headers and footers, keeps
	 * its children in two locations (its 'domNode' is not the same as its
	 * 'containerNode'). We handle that here.
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

		var dijitWidget = widget.dijitWidget,
			// First, get children from ScrollableView's containerNode.
			children = widget._getChildren(attach),
			header = dijitWidget.fixedHeader,
			footer = dijitWidget.fixedFooter;

		// Second, see if header/footer is outside of containerNode, and if so,
		// add them to array.
		// NOTE: The following code follows the impl of ScrollableView.getChildren().
		if (header && header.parentNode === dijitWidget.domNode) {
			children.push(getWidget(header));
		}
		if(footer && footer.parentNode === dijitWidget.domNode){
			children.push(getWidget(footer));
		}
		return children;
	}

});