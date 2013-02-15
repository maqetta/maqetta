define([
    	"dojo/_base/declare",
    	"./_CutCopyAction",
    	"../../Runtime"
], function(declare, _CutCopyAction, Runtime){


return declare("davinci.ve.actions.CutAction", [_CutCopyAction], {

	_invokeSourceEditorAction: function(context) {
		context.htmlEditor.cutAction.run();
	},
	
	_executeAction: function(context, selection, data, removeCommand) {
		Runtime.clipboard = data;
		context.select(null);
		context.getCommandStack().execute(removeCommand);
	}
});
});