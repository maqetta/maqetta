define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"./ViewHelper",
	"davinci/ve/widget"
], function(
	declare,
	domConstruct,
	ViewHelper,
	Widget
) {

return declare(ViewHelper, {

	/**
	 * Disable the scrolling mechanism at design time (only) because it conflicts
	 * with mouse events necessary to set the selection in Maqetta.
	 */
	create: function(widget, srcElement) {
		this.inherited(arguments);
		if (widget.dijitWidget){
			widget.dijitWidget.disableTouchScroll = true;
		}

	},

	addChild: function(parentWidget, childWidget, index) {
		var parentDijitWidget = parentWidget.dijitWidget,
			childDomNode = childWidget.domNode,
			children = parentWidget.getChildren(),
			header = parentDijitWidget.fixedHeader,
			footer = parentDijitWidget.fixedFooter,
			containerNode = parentDijitWidget.containerNode;
		if(childDomNode == header){
			domConstruct.place(childDomNode, parentWidget.domNode, 0);
		}else if(childDomNode == footer){
			domConstruct.place(childDomNode, parentWidget.domNode, "last");
		}else{
			var refSibling = (typeof index == 'number' && index >= 0 && index < children.length) ?
					children[index] : undefined;
			var adjustedIndex;
			if(refSibling){
				// Have to use childNodes because dojo.place deals with
				// DOM nodes, not element children
				for(var i=0; i<containerNode.childNodes.length; i++){
					var node = containerNode.childNodes[i];
					if(node.nodeType == 1){
						if(node == refSibling.domNode){
							adjustedIndex = i;
							break;
						}
					}
				}
			}
			// make sure we place widgets in the containerNode
			domConstruct.place(childDomNode, containerNode, adjustedIndex);
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
				return Widget.getWidget(node);
			}

			var widget = node._dvWidget;
			if (widget) {
				return widget;
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
			// Use unshift() to add 'fixedHeader' to front of array, so that
			// array order matches order of elements in Visual Editor.
			children.unshift(getWidget(header));
		}
		if(footer && footer.parentNode === dijitWidget.domNode){
			children.push(getWidget(footer));
		}
		return children;
	}

});

});