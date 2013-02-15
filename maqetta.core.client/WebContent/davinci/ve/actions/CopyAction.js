define([
	"dojo/_base/declare",
	"./_CutCopyAction",
	"../../Runtime"
], function(declare, _CutCopyAction, Runtime){

return declare("davinci.ve.actions.CopyAction", [_CutCopyAction], {

	_invokeSourceEditorAction: function(context) {
		context.htmlEditor.copyAction.run();
	},
	
	_executeAction: function(context, selection, data, removeCommand) {
		var oldData = Runtime.clipboard;
		Runtime.clipboard = data;
		if(!oldData){
			context.onSelectionChange(selection); // force to enable Paste action
		}
	}
});
});