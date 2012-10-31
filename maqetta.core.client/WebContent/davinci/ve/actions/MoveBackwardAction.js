define([
		"dojo/_base/declare",
		"./_ReorderAction",
		"davinci/commands/CompoundCommand",
		"davinci/ve/commands/ReparentCommand"
], function(declare, _ReorderAction, CompoundCommand, ReparentCommand){


return declare("davinci.ve.actions.MoveBackwardAction", [_ReorderAction], {

	name: "MoveBackward",
	iconClass: "editActionIcon editMoveBackwardIcon",
	
	/**
	 * This is the routine that performs the actions for the MoveToFront command.
	 * @param {Object} context  context object for current visual editor
	 */
	// FIXME: Need to preserve order for siblings that are being moved at once
	run: function(context){
		context = this.fixupContext(context);
		if(!context){
			return;
		}
		var selection = (context && context.getSelection) ? context.getSelection() : [];
		if(selection.length === 0){
			return;
		}
		if(!this.selectionSameParentAllAbsoluteAdjacent(selection)){
			return;
		}
		var widget;
		var parent = selection[0].getParent();
		var children = parent.getChildren();
		var absSiblings = this.getAbsoluteSiblings(selection[0]);
		var compoundCommand = new CompoundCommand();
		// Find the absolutely positioned widget just before the first one in the selection list
		var tempSelection = selection.slice(0);	// clone selection array
		for(var j=absSiblings.length-1; j>=0; j--){
			widget = absSiblings[j];
			var tempIndex = tempSelection.indexOf(widget);
			if(tempIndex>= 0){
				tempSelection.splice(tempIndex, 1);
			}else if(tempSelection.length === 0){
				// If we have encountered everything in tempSelection,
				// then "widget" is the first absolutely positioned widget after last one in the selection list
				break;
			}
		}
		var index = children.indexOf(widget);
		// By looping through absSiblings, we preserve the relative order of the 
		// currently selected widgets, while pushing all of those widgets to be topmost
		// within the given parent
		for(var i=absSiblings.length-1; i>=0; i--){
			widget = absSiblings[i];
			if(selection.indexOf(widget) >= 0){
				compoundCommand.add(new ReparentCommand(widget, parent, index));
			}
		}
		context.getCommandStack().execute(compoundCommand);
	},

	/**
	 * Enable this command if this command would actually make a change to the document.
	 * Otherwise, disable.
	 */
	isEnabled: function(context){
		context = this.fixupContext(context);
		var selection = (context && context.getSelection) ? context.getSelection() : [];
		if(selection.length === 0){
			return false;
		}
		if(!this.selectionSameParentAllAbsoluteAdjacent(selection)){
			return false;
		}
		var absSiblings = this.getAbsoluteSiblings(selection[0]);
		for(var j=0; j<selection.length; j++){
			var widget = selection[j];
			// If any of the currently selected widgets has a non-selected absolutely positioned sibling
			// earlier in the list of siblings, then activate this command
			if(absSiblings.indexOf(widget) > (selection.length-1)){
				return true;
			}
		}
		return false;
	}

});
});