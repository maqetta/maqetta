define([
"dojo/_base/declare",
"dojo/dom-construct" // domConstruct.place
], function(declare, domConstruct){

var HorizontalSliderHelper = function() {};

HorizontalSliderHelper.prototype = {
	_MIDDLE_OVERLAY_HEIGHT: 5,
		
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
		var decoration = this._getSecondaryDecoration(dijitWidget);
		for(var node = decoration.lastChild; node; node = node.previousSibling){
			var childWidget = getWidget(node);
			
			// Use unshift() to front of array, so that
			// array order matches order of elements in Visual Editor.
			children.unshift(childWidget);
		}

		return children;
	},

	_getSecondaryDecoration: function(dijitWidget) {
		return dijitWidget.topDecoration;
	},
	
	_getSecondaryDecorationLabel: function() {
		return "topDecoration";
	},
	
	_getMainDecoration: function(dijitWidget) {
		return dijitWidget.bottomDecoration;
	},
	
	_getMainDecorationLabel: function() {
		return "bottomDecoration";
	},
	
	/**
	 * HorizontalSlider, due to its support for placing rules and labels in the
	 * 'topDecoration' container, keeps its children in two locations 
	 * (its 'domNode' is not the same as its 'containerNode' which is not the same as
	 * 'topDecoration'). We try to handle adding a child widget as gracefully as
	 * possible in light of that.
	 * 
	 * @param  {davinci/ve/_Widget} parentWidget
	 * @param  {davinci/ve/_Widget} childWidget
	 * @param  {int?} insertIndex
	 */
	addChild: function(parentWidget, childWidget, insertIndex) {
		var parentDijitWidget = parentWidget.dijitWidget;
		var childDijitWidget = childWidget.dijitWidget;
		var refNode = parentDijitWidget.containerNode;
		var decorationNode = this._getSecondaryDecoration(parentDijitWidget);
		if (childDijitWidget.container && childDijitWidget.container === this._getSecondaryDecorationLabel()) {
			// We want to add the new child to the decoration container rather than the containerNode
			refNode = decorationNode; 
		} else {
			// The insert index would have been based on the total number of children in the slider (rather 
			// than number of children in the containerNode), so let's take a shot at adjusting the index
			if (insertIndex && typeof insertIndex == "number") {
				//Use Max.math to make sure this doesn't go negative 
				insertIndex = Math.max(insertIndex - this._getSecondaryDecoration(parentDijitWidget).childElementCount, 0);
			}
		}
		
		if(insertIndex && typeof insertIndex == "number"){
			//Make sure index isn't too big
			if (insertIndex > refNode.childElementCount) {
				insertIndex = refNode.childElementCount;
			}
			
			//Adjust the ref node within the container based on index
			if(refNode.childElementCount >= insertIndex && insertIndex > 0){
				refNode = refNode.childNodes[insertIndex-1];
				insertIndex = "after";
			}
		}
		
		//Place the new child
		domConstruct.place(childDijitWidget.domNode, refNode, insertIndex);

		// If I've been started but the child widget hasn't been started,
		// start it now.  Make sure to do this after widget has been
		// inserted into the DOM tree, so it can see that it's being controlled by me,
		// so it doesn't try to size itself.
		if(this._started && !childDijitWidget._started){
			childDijitWidget.startup();
		}
	},
	
	/**
	 * HorizontalSlider is treated as a single control in the Visual Editor. But, the user 
	 * also needs to be able to individually select its children (e.g., HorizontalRule and 
	 * HorizontalRuleLabels) to further customize. So, we'll let the Visual Editor know
	 * the regions within the HorizontalSlider container that should be covered up by target
	 * overlays. Basically, all of the rectangles within the container except for the top/bottom
	 * decorations are overlayed. This allows the user to select children within the decorations
	 * (since the decorations are left uncovered).
	 * 
	 * @param  {davinci.ve._Widget} widget
	 * @return {Array}
	 */
	getTargetOverlays: function(/*Widget*/ widget) {
		//Create an array to hold rectangles representing the area
		//we want user to see an overlay when mousing over the widget
		var overlays = [];
		
		//Of course, also have to deal with other orientation
		var dijitWidget = widget.dijitWidget;
		var mainDomNode = dijitWidget.domNode;
		var topDecoration = this._getSecondaryDecoration(dijitWidget);
		var bottomDecoration = this._getMainDecoration(dijitWidget);
		
		//upper overlays
		var overlayRectangle;
		if (topDecoration.offsetHeight > 0) {
			//upper left
			overlayRectangle = {
				x: mainDomNode.offsetLeft,
				y: mainDomNode.offsetTop,
				width: topDecoration.offsetLeft,
				height: topDecoration.offsetHeight
			};
			overlays.push(overlayRectangle);
			
			//upper middle
			overlayRectangle = {
				x: mainDomNode.offsetLeft + topDecoration.offsetLeft,
				y: mainDomNode.offsetTop + topDecoration.offsetTop,
				width: topDecoration.offsetWidth,
				height: this._MIDDLE_OVERLAY_HEIGHT
			};
			overlays.push(overlayRectangle);
			
		
			//upper right
			overlayRectangle = {
				x: mainDomNode.offsetLeft + topDecoration.offsetLeft + topDecoration.offsetWidth,
				y: mainDomNode.offsetTop,
				width: topDecoration.offsetLeft,
				height: topDecoration.offsetHeight
			};
			overlays.push(overlayRectangle);
		}
		
		//main overlay
		overlayRectangle = {
			x: mainDomNode.offsetLeft,
			y: mainDomNode.offsetTop + topDecoration.offsetHeight,
			width: mainDomNode.offsetWidth,
			height: bottomDecoration.offsetTop - topDecoration.offsetHeight
		};
		overlays.push(overlayRectangle);
		
		//lower overlays
		if (bottomDecoration.offsetHeight > 0) {
			//lower left
			overlayRectangle = {
				x: mainDomNode.offsetLeft,
				y: mainDomNode.offsetTop + bottomDecoration.offsetTop,
				width: bottomDecoration.offsetLeft,
				height: bottomDecoration.offsetHeight
			};
			overlays.push(overlayRectangle);
			
			//lower middle
			overlayRectangle = {
				x: mainDomNode.offsetLeft + bottomDecoration.offsetLeft,
				y: mainDomNode.offsetTop + bottomDecoration.offsetTop + bottomDecoration.offsetHeight - this._MIDDLE_OVERLAY_HEIGHT,
				width: bottomDecoration.offsetWidth,
				height: this._MIDDLE_OVERLAY_HEIGHT
			};
			overlays.push(overlayRectangle);
		
			//lower right
			overlayRectangle = {
				x: mainDomNode.offsetLeft + bottomDecoration.offsetLeft + bottomDecoration.offsetWidth,
				y: mainDomNode.offsetTop + bottomDecoration.offsetTop,
				width: bottomDecoration.offsetLeft,
				height: bottomDecoration.offsetHeight
			};
			overlays.push(overlayRectangle);
		}

		//Return calculated overlays
		return overlays;
	}
};

return HorizontalSliderHelper;

});