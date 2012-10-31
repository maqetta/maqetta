define([
		"dojo/_base/declare",
		"./_ReorderAction",
		"davinci/commands/CompoundCommand",
		"davinci/ve/commands/ReparentCommand"
], function(declare, _ReorderAction, CompoundCommand, ReparentCommand){


return declare("davinci.ve.actions.OtherAction", [_ReorderAction], {
	
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
		var editor = context ? context.editor : null;
		return (editor && editor.declaredClass == 'davinci.ve.PageEditor');
	}
});
});