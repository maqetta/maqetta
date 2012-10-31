define([
		"dojo/_base/declare",
		"dojo/_base/array",
		"dojo/dom-style",
		"davinci/ve/actions/ContextAction"
], function(declare, Array, DomStyle, ContextAction){


return declare("davinci.ve.actions._ReorderAction", [ContextAction], {
	
	/**
	 * Only show reorder commands on context menu for visual page editor
	 */
	shouldShow: function(context){
		context = this.fixupContext(context);
		return context && context.editor && context.editor.editorID == "davinci.ve.HTMLPageEditor";
	},
	
	/**
	 * Return true if all items in selection share the same parent
	 * and are all absolutely positioned
	 * @param {Object} selection  currently list of selected widgets
	 */
	selectionSameParentAllAbsolute: function(selection){
		if(selection.length === 0){
			return false;
		}
		var firstParent = selection[0].getParent();
		if(!firstParent){
			return false;
		}
		for(var i=0; i<selection.length; i++){
			var widget = selection[i];
			if(widget.getParent() != firstParent){
				return false;
			}
			var position = (widget && widget.domNode) ? DomStyle.get(widget.domNode, 'position') : null;
			if(position != 'absolute'){
				return false;
			}
		}
		return true;
	},
	
	/**
	 * Return true if all items in selection share the same parent
	 * and are all absolutely positioned, and all selected widgets are adjacent children
	 * @param {Object} selection  currently list of selected widgets
	 */
	selectionSameParentAllAbsoluteAdjacent: function(selection){
		if(!selection || selection.length === 0 || !this.selectionSameParentAllAbsolute(selection)){
			return false;
		}
		var parent = selection[0].getParent();
		if(!parent){
			return false;
		}
		var children = parent.getChildren();
		var minIndex = Number.MAX_VALUE;
		var maxIndex = Number.MIN_VALUE;
		for(var i=0; i<children.length; i++){
			var child = children[i];
			var index = selection.indexOf(child);
			if(index >=0){
				minIndex = (i < minIndex) ? i : minIndex;
				maxIndex = (i > maxIndex) ? i : maxIndex;
			}
		}
		if(maxIndex-minIndex+1 === selection.length){
			return true;
		}else{
			return false;
		}
	},

	/**
	 * Return all widget siblings that are absolutely positioned. 
	 * The list will include widget if it is absolutely positioned.
	 * @param {Object} widget  A dvWidget object
	 * @returns {Array[_dvWidget]}  all absolutely positioned siblings, possible including  widget
	 */
	getAbsoluteSiblings: function(widget){
		var parent = (widget && widget.getParent && widget.getParent());
		if(!parent){
			return [];
		}
		var siblings = (parent.getChildren && parent.getChildren());
		if(!siblings){
			return [];
		}
		var absSiblings = Array.filter(siblings, function(item){
			var position = (item && item.domNode) ? DomStyle.get(item.domNode, 'position') : null;
			return (position == 'absolute');
		});
		return absSiblings;
	}

});
});