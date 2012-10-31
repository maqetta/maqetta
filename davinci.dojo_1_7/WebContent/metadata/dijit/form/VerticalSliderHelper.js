define(
[
	"dojo/_base/declare", 
	"./HorizontalSliderHelper"
],
function(declare, HorizontalSliderHelper) {

return declare(HorizontalSliderHelper, {	
	_getSecondaryDecoration: function(dijitWidget) {
		return dijitWidget.leftDecoration;
	},
	
	_getSecondaryDecorationLabel: function() {
		return "leftDecoration";
	},
	
	_getMainDecoration: function(dijitWidget) {
		return dijitWidget.rightDecoration;
	},
	
	_getMainDecorationLabel: function() {
		return "rightDecoration";
	},
	
	/**
	 * VerticalSlider is treated as a single control in the Visual Editor. But, the user 
	 * also needs to be able to individually select its children (e.g., VerticalRule and 
	 * VerticalRuleLabels) to further customize. So, we'll let the Visual Editor know
	 * the regions within the VerticalSlider container that should be covered up by target
	 * overlays. Basically, all of the rectangles within the container except for the left/right
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
		var leftDecoration = this._getSecondaryDecoration(dijitWidget);
		var rightDecoration = this._getMainDecoration(dijitWidget);
		
		//left overlays
		var overlayRectangle;
		if (leftDecoration.offsetWidth > 0) {
			//upper left
			overlayRectangle = {
				x: mainDomNode.offsetLeft,
				y: mainDomNode.offsetTop,
				width: leftDecoration.offsetWidth,
				height: leftDecoration.offsetTop
			};
			overlays.push(overlayRectangle);
			
			//left middle
			overlayRectangle = {
				x: mainDomNode.offsetLeft,
				y: mainDomNode.offsetTop + leftDecoration.offsetTop,
				width: this._MIDDLE_OVERLAY_HEIGHT,
				height: leftDecoration.offsetHeight
			};
			overlays.push(overlayRectangle);
			
		
			//lower left
			overlayRectangle = {
				x: mainDomNode.offsetLeft,
				y: mainDomNode.offsetTop + leftDecoration.offsetTop + leftDecoration.offsetHeight,
				width: leftDecoration.offsetWidth,
				height: leftDecoration.offsetTop
			};
			overlays.push(overlayRectangle);
		}
		
		//main overlay
		overlayRectangle = {
			x: mainDomNode.offsetLeft + leftDecoration.offsetWidth,
			y: mainDomNode.offsetTop,
			width: mainDomNode.offsetWidth - leftDecoration.offsetWidth - rightDecoration.offsetWidth,
			height: mainDomNode.offsetHeight
		};
		overlays.push(overlayRectangle);
	
		//right overlays
		if (rightDecoration.offsetWidth > 0) {
			//upper right
			overlayRectangle = {
				x: mainDomNode.offsetLeft + rightDecoration.offsetLeft,
				y: mainDomNode.offsetTop,
				width: rightDecoration.offsetWidth,
				height: rightDecoration.offsetTop
			};
			overlays.push(overlayRectangle);
			
			//right middle
			overlayRectangle = {
				x: mainDomNode.offsetLeft + mainDomNode.offsetWidth - this._MIDDLE_OVERLAY_HEIGHT,
				y: mainDomNode.offsetTop + rightDecoration.offsetTop,
				width: this._MIDDLE_OVERLAY_HEIGHT,
				height: rightDecoration.offsetHeight
			};
			overlays.push(overlayRectangle);
		
			//lower right
			overlayRectangle = {
				x: mainDomNode.offsetLeft + rightDecoration.offsetLeft,
				y: mainDomNode.offsetTop + rightDecoration.offsetTop + rightDecoration.offsetHeight,
				width: rightDecoration.offsetWidth,
				height: rightDecoration.offsetTop
			};
			overlays.push(overlayRectangle);
		}

		//Return calculated overlays
		return overlays;
	}
});
});