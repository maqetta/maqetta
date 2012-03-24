define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"davinci/Runtime",
], function(declare, Action, Runtime) {

var ViewFileAction = declare("davinci.review.actions.ViewFileAction", [Action], {

	run: function(context) {
		var selection = context.getSelection ? context.getSelection() : null;
		if (!selection || !selection.length) { return; }
		var item = selection[0].resource;
		
		//Open editor
		davinci.Workbench.openEditor({
			fileName: item,
			content: item.getText()
		});
	},

	shouldShow: function(context) {
		return true;
	},

	isEnabled: function(context) {
		var selection = context.getSelection ? context.getSelection() : null;
		if (!selection || selection.length === 0) {
			return false;
		}
		var item = selection[0].resource;
		return item.elementType=="ReviewFile";
	}

});

return ViewFileAction;

});