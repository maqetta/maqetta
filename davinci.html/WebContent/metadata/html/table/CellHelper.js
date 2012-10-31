define([
	"dojo/_base/declare",
	"./TableMatrix"
], function(declare, TableMatrix) {

return declare(null, {
	getChildrenData: function(widget, options) {
		var domNode = widget.domNode;
		// Check if text node is the only child. If so, return text content as
        // the child data. We do this so we can maintain innerHTML like "&nbsp";
        if (domNode.childNodes.length === 1 && domNode.firstChild.nodeType === 3) {
        	return domNode.innerHTML.trim();
        } else {
        	return widget._getChildrenData(options);
        }
	}
});

});