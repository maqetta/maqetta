define(function() {

var ButtonHelper = function() {};
ButtonHelper.prototype = {

		getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
			// summary:
			//		The child in the markup of a button tag is its text content, so return that.
			//
			if (widget && widget.getTagName().toUpperCase() == "BUTTON") {
				return widget.domNode.innerHTML;
			}
			
			return undefined;
		}
	};

return ButtonHelper;

});
