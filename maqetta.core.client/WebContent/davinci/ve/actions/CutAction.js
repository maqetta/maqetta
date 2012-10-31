define([
    	"dojo/_base/declare",
    	"davinci/Workbench",
    	"./_CutCopyAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand",
    	"davinci/ve/widget"
], function(declare, Workbench, _CutCopyAction, CompoundCommand, RemoveCommand, Widget){


return declare("davinci.ve.actions.CutAction", [_CutCopyAction], {

	_invokeSourceEditorAction: function(context) {
		context.htmlEditor.cutAction.run();
	},
	
	_executeAction: function(context, selection, data, removeCommand) {
		davinci.Runtime.clipboard=data;
		context.select(null);
		context.getCommandStack().execute(removeCommand);
	}
});
});