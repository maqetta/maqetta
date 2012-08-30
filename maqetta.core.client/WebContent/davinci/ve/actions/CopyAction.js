define([
    	"dojo/_base/declare",
    	"davinci/Workbench",
    	"./_CutCopyAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand"
], function(declare, Workbench, _CutCopyAction, CompoundCommand, RemoveCommand){


return declare("davinci.ve.actions.CopyAction", [_CutCopyAction], {

	_invokeSourceEditorAction: function(context) {
		context.htmlEditor.copyAction.run();
	},
	
	_executeAction: function(context, selection, data, removeCommand) {
		var oldData = davinci.Runtime.clipboard;
		davinci.Runtime.clipboard=data;
		if(!oldData){
			context.onSelectionChange(selection); // force to enable Paste action
		}
	}
});
});