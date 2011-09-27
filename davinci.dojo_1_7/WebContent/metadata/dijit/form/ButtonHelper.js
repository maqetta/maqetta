define(function() {
	return function(){
		this.getChildrenData = function(/*Widget*/ widget, /*Object*/ options){
			// summary:
			//		The child in the markup of a button tag is its text content, so return that.
			//
	
			if (widget && widget.getTagName() == "BUTTON") {
				return widget.dijitWidget.label;
			}
			
			return undefined;
		};
		
		this.getPropertyValue = function(/*Widget*/ widget, /*String*/ name){
			// summary:
			//		Mask label attribute if the button's tag is BUTTON.
			//
/*	
			if(!widget || !name){
				return undefined;
			}
*/
			var context = widget.getContext();

			if (context && widget.getTagName() == "BUTTON" && name == "label") {
				return undefined;
			}

			return widget._getPropertyValue(name);
		};
	};
});