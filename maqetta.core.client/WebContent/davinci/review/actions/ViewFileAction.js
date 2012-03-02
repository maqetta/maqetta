define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"davinci/Runtime",
], function(declare, Action, Runtime) {

var ViewFileAction = declare("davinci.review.actions.ViewFileAction", [Action], {

	run: function(context) {
		var selection = Runtime.getSelection();
		if (!selection) {
			return;
		}
		var item = selection[0].resource;
		if (Runtime.getMode()=="reviewPage") {
			davinci.Workbench.openEditor({
				fileName: item,
				content: item.getText()
			});
		} else if (Runtime.getMode()=="designPage") {
//			window.open(davinci.Workbench.location()+"review/"+Runtime.userName+"/"+item.parent.timeStamp+"/"+
//					item.name+"/default");
			davinci.Workbench.openEditor({
				fileName: item,
				content: item.getText()
			});
		}
	},

	shouldShow: function(context) {
		return true;
	},

	isEnabled: function(context) {
		var selection = Runtime.getSelection();
		if (!selection || selection.length === 0) {
			return false;
		}
		var item = selection[0].resource;
		return item.elementType=="ReviewFile";
	}

});

return ViewFileAction;

});