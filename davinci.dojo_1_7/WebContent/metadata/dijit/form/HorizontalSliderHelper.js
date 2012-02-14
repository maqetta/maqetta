define([
"dojo/_base/declare",
"dojo/dom-construct", // domConstruct.place
], function(declare, domConstruct){

var HorizontalSliderHelper = function() {};

HorizontalSliderHelper.prototype = {

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
	},
	
	_getDecorationLabel: function() {
		return "topDecoration";
	},
	
	/**
	 * HorizontalSlider, due to its support for placing rules and labels in the
	 * 'topDecoration' container, keeps its children in two locations 
	 * (its 'domNode' is not the same as its 'containerNode' which is not the same as
	 * 'topDecoration'). We try to handle adding a child widget as gracefully as
	 * possible in light of that.
	 * 
	 * @param  {davinci.ve._Widget} widget
	 * @param  {dijit._Widget} childWidget
	 * @param  {int?} insertIndex
	 */
	addChild: function(widget, childWidget, insertIndex){
		
		var refNode = widget.dijitWidget.containerNode;
		var decorationNode = this._getDecoration(widget.dijitWidget);
		if (childWidget.container && childWidget.container === this._getDecorationLabel()) { 
			// We want to add the new child to the decoration container rather than the containerNode
			refNode = decorationNode; 
		} else {
			// The insert index would have been based on the total number of children in the slider (rather 
			// than number of children in the containerNode), so let's take a shot at adjusting the index
			if (insertIndex && typeof insertIndex == "number") {
				//Use Max.math to make sure this doesn't go negative 
				insertIndex = Math.max(insertIndex - this._getDecoration(widget.dijitWidget).childElementCount, 0);
			}
		}
		
		if(insertIndex && typeof insertIndex == "number"){
			//Make sure index isn't too big
			if (insertIndex > refNode.childElementCount) {
				insertIndex = refNode.childElementCount;
			}
			
			//Adjust the ref node within the container based on index
			if(refNode.childElementCount >= insertIndex){
				refNode = refNode.childNodes[insertIndex-1];
				insertIndex = "after";
			}
		}
		
		//Place the new child
		domConstruct.place(childWidget.domNode, refNode, insertIndex);

		// If I've been started but the child widget hasn't been started,
		// start it now.  Make sure to do this after widget has been
		// inserted into the DOM tree, so it can see that it's being controlled by me,
		// so it doesn't try to size itself.
		if(this._started && !childWidget._started){
			childWidget.startup();
		}
	}
};

return HorizontalSliderHelper;

});