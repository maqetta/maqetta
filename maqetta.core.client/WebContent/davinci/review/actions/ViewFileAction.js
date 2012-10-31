define([
	"dojo/_base/declare",
	"./_ReviewNavigatorCommon",
	"davinci/Runtime",
], function(declare, _ReviewNavigatorCommon, Runtime) {

var ViewFileAction = declare("davinci.review.actions.ViewFileAction", [_ReviewNavigatorCommon], {

	run: function(context) {
		var selection = this._getSelection(context);
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
		var selection = this._getSelection(context);
		if (!selection || selection.length === 0) {
			return false;
		}
		var item = selection[0].resource;
		return item.elementType=="ReviewFile";
	}

});

return ViewFileAction;

});