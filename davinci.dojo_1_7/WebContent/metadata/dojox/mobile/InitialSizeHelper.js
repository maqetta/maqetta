define([
	"dojo/_base/declare"
], function(declare) {

return declare([], {
	
	/**
	 * Helper function called to establish widget size at initial creation time
	 * @param {object} args  holds following values:
	 * 		parent - target parent widget for initial creation
	 * 		size - {w:(number), h:(number)}
	 *		position - /* if an object, then widget is created with absolute positioning
	 * 		
	 */
	initialSize: function(args){
		// If widget is being added at an absolute location (i.e., there is a value for args.position),
		if(args && args.position){
			// If user dragged out a size, use the width that the user specified,
			// but don't set the height so that initial version of widget
			// uses the automatic widget size.
			// You see, for most dojox.mobile widgets, the CSS is set up
			// assuming a particular height for the widget.
			if(args.size && typeof args.size.w == 'number'){
				return { w:args.size.w };
			// Otherwise, use just dropped a widget onto canvas or clicked to specify widget position,
			// so set the default with to 300.
			}else{
				return { w:300 };
			}
		}
	}

});

});