define([
	"dojo/_base/declare"
], function(
	declare
) {

return declare(null, {
	_fillBodyAsOnlyChild: false,

	/**
	 * Helper function called to establish widget size at initial creation time
	 * @param {object} args  holds following values:
	 * 		parent - target parent widget for initial creation
	 */
	initialSize: function(args){
		var returnVal = null;
		
		// If widget is not being added at an absolute location (i.e., no value for args.position)
		// and if parent is BODY,  widget is only child, and user didn't drag out a size (ie no value for args.size),
		// then set initial size to 100%. In all other cases, we'll defer to the CreateTool.
		if(args && !args.position && !args.size) {
			returnVal = {
				w: '100%',
				h: '300px'
			};

			//Let's look at our parent
			var parentWidget = args.parent;
			var parentWidgetType = parentWidget.type;
			var parentChildren = parentWidget.getData().children;
			if (parentWidget.type) {
				if (parentWidgetType == 'html.body') {
					//Being added to BODY
					if (!parentChildren || parentChildren.length){
						//Widget is first child, so fill body if fillBodyAsOnlyChild flag tells us to
						returnVal = {
							w: '100%',
							h: this._fillBodyAsOnlyChild ? '100%' : "300px"
						};
					}
				} else if (parentWidgetType == 'dijit/layout/ContentPane' ||
						parentWidgetType == 'html.div' ||
						parentWidgetType == 'html.form' ||
						parentWidgetType == 'html.fieldset') {
					//Being added to another well known container type
					if (!parentChildren || !parentChildren.length){
						//Widget is first child, so fill container
						returnVal = {
							w: '100%',
							h: '100%'
						};
					}
				} 
			}
		}
		return returnVal;
	}
});
});