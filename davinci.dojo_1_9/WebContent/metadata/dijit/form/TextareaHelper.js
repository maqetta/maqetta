define(function() {

var TextareaHelper = function() {};
TextareaHelper.prototype = {

	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		// summary:
		//		Returns the passed TextArea's text, so that the text appears as a direct descendant of the widget in the markup.
		//
		
		if(!widget){
			return undefined;
		}

		return widget.dijitWidget.getValue();
	}

};

return TextareaHelper;

});