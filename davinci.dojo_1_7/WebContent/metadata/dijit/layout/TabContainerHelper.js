define(function() {

var TabContainerHelper = function() {};
TabContainerHelper.prototype = {
	/**
	 * Helper function called to establish widget size at initial creation time
	 * @param {object} args  holds following values:
	 * 		parent - target parent widget for initial creation
	 */
	initialSize: function(args){
		var pw = args.parent;
		// If widget is not being added at an absolute location (i.e., no value for args.position)
		// and if parent is BODY or a ContentPane, and user didn't drag out a size (ie no value for args.size),
		// then set initial size to 100%
		if(args && !args.position && !args.size && pw.type && (pw.type == 'dijit.layout.ContentPane')){
			return {w:'100%',h:'100%'};
		}
	}
};

return TabContainerHelper;

});