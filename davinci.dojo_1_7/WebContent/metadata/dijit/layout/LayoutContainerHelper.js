define(function() {

var LayoutContainerHelper = function() {};
LayoutContainerHelper.prototype = {
	/**
	 * Helper function called to establish widget size at initial creation time
	 * @param {object} args  holds following values:
	 * 		parent - target parent widget for initial creation
	 */
	initialSize: function(args){
		// If widget is not being added at an absolute location (i.e., no value for args.position)
		// and if parent is BODY,  widget is only child, and user didn't drag out a size (ie no value for args.size),
		// then set initial size to 100%. In all other cases, we'll defer to the CreateTool.
		var parentWidget = args.parent;
		var parentChildren = parentWidget.getData().children;
		if(args && !args.position && !args.size && parentWidget.type && (parentWidget.type == 'html.body') && !parentChildren.length){
			return {w:'100%',h:'100%'};
		}
	}
};

return LayoutContainerHelper;

});