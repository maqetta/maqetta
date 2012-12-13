define([
	"dojo/dom-construct",
	"dojo/_base/array",
	"davinci/ve/widget"
], function(domConstruct, arr, Widget) {
                         
var ListItemHelper = function() {};
ListItemHelper.prototype = {

	create: function(widget, srcElement) {
		var dijitWidget = widget.dijitWidget;
		// Fix for #705.
		// The ListItem widget's startup logic registers an onclick
		// handler, and if the 'moveTo' property has a reference to a view,
		// then this built-in onclick handler will launch an animated
		// transition to make that view visible. This is good for runtime execution,
		// but we don't want this onclick handler to execute in the page editor.
		// So, register a onClick (and onTouchStart) function that returns false, which causes
		// the ListItem widget to forgo its normal processing.
		// But the click event will bubble up to ancestor widgets, and therefore
		// will be caught by Maqetta and will cause a selection action to occur.
		if(dijitWidget){
			dijitWidget.onClick = function(){
				return false;
			}
			dijitWidget.onTouchStart = function(){
				return false;
			}
		}
	},

	getChildrenData: function(/*Widget*/ widget, /*Object*/ options) {
		var data = [];

		// always add the text first
		data.push(widget.dijitWidget.labelNode.innerHTML);

		// now add any children
		widget.getChildren().forEach(function(w) {
			data.push(w.getData());
		});

		return data;
	},

	getChildren: function(widget, attach) {
		var dijitWidget = widget.dijitWidget;
		var children = [];

		arr.forEach(dijitWidget.containerNode.children, function(node) {
			// Enabling some ListItem properties can create DOM children.  We
			// want to ignore those since they aren't proper "widgets" in the
			// Maqetta sense.
			if (node === dijitWidget.labelNode ||
					node === dijitWidget.iconNode ||
					node === dijitWidget.rightTextNode ||
					node === dijitWidget.rightIconNode ||
					node === dijitWidget.rightIcon2Node ||
					node === dijitWidget.deleteIconNode) {
				return;
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
	}
};

return ListItemHelper;

});