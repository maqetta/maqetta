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
		// and if parent is BODY or a ContentPane, then set initial size to 100%
		if(args && !args.position && pw.type && (pw.type == 'dijit.layout.ContentPane')){
			return {width:'100%',height:'100%'};
		}
	}
};

return TabContainerHelper;

});