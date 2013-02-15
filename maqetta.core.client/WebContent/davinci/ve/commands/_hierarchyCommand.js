define([
    	"dojo/_base/declare"
], function(declare){

return declare("davinci.ve.commands._hierarchyCommand", null, {

	/**
	 * Check if an ancestor widget needs to be refreshed due to a change with
	 * one of its children (in particular, this widget) based on "refreshOnDescendantChange"
	 * property for an ancestor widget.
	 * 
	 * @param  {davinci.ve._Widget} widget
	 * 				The widget instance that has been modified.
	 * @return {null | davinci.ve._Widget} 
	 * 				if ancestor widget has the 'refreshOnDescendantChange' attribute set
	 * 				in its metadata, returns that ancestor widget
	 */
	_isRefreshOnDescendantChange: function(widget) {
		var ancestor;
		var w = widget;
		while(w && w.domNode && w.domNode.tagName != "BODY"){
			var parent = w.getParent();
			if(parent && davinci.ve.metadata.queryDescriptor(parent.type, "refreshOnDescendantChange")){
				ancestor = parent;
			}
			w = parent;
		}
		return ancestor;
	}

});
});