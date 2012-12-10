define([
	"dojo/dom-construct",
	"dojo/_base/array",
	"davinci/ve/widget"
], function(domConstruct, arr, Widget) {
                         
var ListItemHelper = function() {};
ListItemHelper.prototype = {

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

	getChildren: function(widget, attach) {
		var dijitWidget = widget.dijitWidget;
		var children = [];

		arr.forEach(dijitWidget.containerNode.children, function(node) {
			// don't record the label
			if (node === dijitWidget.labelNode) {
				return false;
			}

			if (attach) {
				children.push(require("davinci/ve/widget").getWidget(node));
			} else {
				var widget = node._dvWidget;
				if (widget) {
					children.push(widget);
				}
			}
		});

		return children;
	},

	addChild: function(widget, child, index) {
		var node = widget.getContainerNode();

		// +1 as we have the label
		var place;
		if (typeof(index) == "number") {
			place = index + 1;
		}
		
		domConstruct.place(child.domNode, node, place);
	}
};

return ListItemHelper;

});