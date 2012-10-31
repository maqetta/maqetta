define([
], function(
) {

var ContentPaneHelper = function() {
	//FIXME: Need helper added to StatesView palette
};

ContentPaneHelper.prototype = {
		
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
			// If user did not drag out a size, set initial size to 300
			if(!args.size){
				return { w:300 };
			}
		}
	}

};

return ContentPaneHelper;

});