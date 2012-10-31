//FIXME: This routine doesn't ever seem to be used. Remove?
define([
    	"dojo/_base/declare",
    	"davinci/actions/Action"
 ], function(declare, Action){


return declare("davinci.ve.actions.StyleAction", [Action], {

	name: "styles",
	iconClass: "editActionIcon editPropertyIcon",

	run: function(context){
		if(!context){
			return;
		}

		var dialog = davinci.ve.properties.edit.dialogs.styleDialog;
		var pane = undefined;
		if(!dialog){
			pane = davinci.ve.properties.edit.dialogs.createPane({}, "davinci.ve.properties.edit.StylePane");
			dialog = davinci.ve.properties.edit.dialogs.createDialog({title: this.label}, pane);
			dialog.connect(dialog, "onExecute", function(){
				pane.apply();
			});
			davinci.ve.properties.edit.dialogs.styleDialog = dialog;
		}else{
			pane = davinci.ve.properties.edit.dialogs.getPane(dialog);
			davinci.ve.properties.edit.dialogs.activateDialog(dialog);
		}
		pane.setContext(context);
		pane.update();
		dialog.show();
	},

	destroy: function() {
		if (davinci.ve.properties.edit.dialogs.styleDialog && davinci.ve.properties.edit.dialogs.styleDialog.destroyRecursive) {
			davinci.ve.properties.edit.dialogs.styleDialog.destroyRecursive();
			davinci.ve.properties.edit.dialogs.styleDialog = null;
		}
	}

});
});