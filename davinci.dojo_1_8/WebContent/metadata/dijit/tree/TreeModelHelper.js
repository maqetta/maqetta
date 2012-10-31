define([
	"../HTMLSubElementHelper"
], function(
	HTMLSubElementHelper
) {
	
var TreeModelHelper = function() {};
TreeModelHelper.prototype = {

	getData: function(/*Widget*/ widget, /*Object*/ options){
		if(!widget){
			return undefined;
		}

		// call the old _getData
		var data = widget._getData(options);

		var dj = widget.getContext().getDojo();
		dojo.withDoc(widget.getContext().getDocument(), function(){
			var storeId =widget._srcElement.getAttribute("store");
			if (storeId) {
				data.properties.store = dj.getObject(storeId);
			}
			
			var query = widget._srcElement.getAttribute("query");
			if (query) {
				data.properties.query = JSON.parse(query);
			}
		});
		
		return data;
	},
	
	// We need to provide getChildrenData because we're relying on <script> elements in the declarative HTML. We'll
	// delegate to HTMLSubElementHelper
	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		if (!this._htmlSubElementHelper) {
			this._htmlSubElementHelper = new HTMLSubElementHelper();
		}
		return this._htmlSubElementHelper.getChildrenData(widget, options);
	},
	
	//The actual store object sometimes finds it's way into the source 
	//element, and we really need the id to be written out to the HTML source
	//instead of the string "[Object]"
	cleanSrcElement: function(srcElement) {
		var store = srcElement.getAttribute("store");
		if (store && store.id) {
			srcElement.setAttribute("store", store.id);
		}
	}
};

return TreeModelHelper;

});