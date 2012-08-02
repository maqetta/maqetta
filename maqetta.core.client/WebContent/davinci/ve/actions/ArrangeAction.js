define([
		"dojo/_base/declare",
		"./_ReorderAction",
		"davinci/commands/CompoundCommand",
		"davinci/ve/commands/ReparentCommand"
], function(declare, _ReorderAction, CompoundCommand, ReparentCommand){


return declare("davinci.ve.actions.ArrangeAction", [_ReorderAction], {
	
	/**
	 * This is the routine that performs the actions for the MoveToFront command.
	 * @param {Object} context  context object for current visual editor
	 */
	// FIXME: Need to preserve order for siblings that are being moved at once
	run: function(context){
		// This is a dropdown button. Actions are only available on dropdown menu
	},

	/**
	 * Enable this command if this command would actually make a change to the document.
	 * Otherwise, disable.
	 */
	isEnabled: function(context){
		return true;
	},

	shouldShow: function(context){
		context = this.fixupContext(context);
		var editor = context.editor;
		return (editor && editor.declaredClass == 'davinci.ve.PageEditor');
	}
});
});