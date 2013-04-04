define([
	"davinci/ve/widget",
	"../../dijit/HTMLSubElementHelper"
], function(
	Widget,
	HTMLSubElementHelper
) {

var Memory = function() {};
Memory.prototype = {

	getData: function(/*Widget*/ widget, /*Object*/ options){
		if(!widget){
			return undefined;
		}

		var widgetData = widget._getData( options);
		var value = widget._srcElement.getAttribute('data');
		if (value){
			widgetData.properties.data = JSON.parse(value);
		} 
		return widgetData;
	},
	
	// We need to provide getChildrenData because we're relying on <script> elements in the declarative HTML. We'll
	// delegate to HTMLSubElementHelper
	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		if (!this._htmlSubElementHelper) {
			this._htmlSubElementHelper = new HTMLSubElementHelper();
		}
		return this._htmlSubElementHelper.getChildrenData(widget, options);
	}
};

return Memory;

});
