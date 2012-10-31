define([
], function() {
	
return /** @scope davinci.ve.utils.ImageUtils */ {

	/*
	 * Utility functions for html <img> nodes
	 */

	// IMG elements don't have a size until they are actually loaded
	// so selection/focus box will be wrong upon creation.
	// To fix, register an onload handler which calls updateFocus()
	ImageUpdateFocus: function(widget, context){
		if(context && widget && widget.domNode && widget.domNode.tagName === 'IMG'){
			var conn = dojo.connect(widget.domNode, 'onload', function(){
				var selection = context.getSelection();
				for (var i=0; i<selection.length; i++){
					if(selection[i] == widget){
						context.updateFocus(widget, i);
						break;
					}
				}
				dojo.disconnect(conn);
			});
		}
	}
};
});
