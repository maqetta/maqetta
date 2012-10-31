define([
		"dojo/_base/declare",
		"davinci/ve/actions/ContextAction"
], function(declare, ContextAction){


return declare("davinci.ve.actions._SelectAncestorAction", [ContextAction], {
	
	/**
	 * Only show reorder commands on context menu for visual page editor
	 */
	shouldShow: function(context){
		context = this.fixupContext(context);
		return context && context.editor && context.editor.editorID == "davinci.ve.HTMLPageEditor";
	},
	
	/**
	 * Return true if something is selection and 
	 * if all items in selection share the same parent
	 * and that parent is not the BODY
	 * @param {Object} selection  currently list of selected widgets
	 */
	selectionSameParentNotBody: function(selection){
		if(!selection || selection.length === 0){
			return false;
		}
		var firstParent = selection[0].getParent();
		if(!firstParent || !firstParent.domNode){
			return false;
		}
		if(firstParent.domNode.tagName == 'BODY'){
			return false;
		}
		for(var i=0; i<selection.length; i++){
			if(selection[i].getParent() != firstParent){
				return false;
			}
		}
		return true;
	}
	
});
});