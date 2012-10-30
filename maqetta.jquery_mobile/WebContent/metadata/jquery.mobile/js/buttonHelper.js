define(function() {

var buttonHelper = function() {};
buttonHelper.prototype = {

		getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
			// summary:
			//		The child in the markup of a button tag is its text content, so return that.
			//
			if (widget && (widget.type.toUpperCase() === "BUTTON" || widget.type.toUpperCase() === "INPUT")) {
				return widget.element.text() || widget.element.val();
			}
			
			return undefined;
		}
	};

return ButtonHelper;

});
