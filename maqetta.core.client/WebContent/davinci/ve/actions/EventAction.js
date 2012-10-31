//FIXME: This routine doesn't ever seem to be used. Remove?
define([
    	"dojo/_base/declare",
    	"davinci/actions/Action"
 ], function(declare, Action){


return declare("davinci.ve.actions.EventAction", [Action], {

	name: "events",
	iconClass: "editActionIcon editEventIcon",

	run: function(context){
		if(!context){
			return;
		}

		var dialog = davinci.ve.properties.edit.dialogs.eventDialog;
		var pane = undefined;
		if(!dialog){
			pane = davinci.ve.properties.edit.dialogs.createPane({}, "davinci.ve.properties.edit.EventPane");
			dialog = davinci.ve.properties.edit.dialogs.createDialog({title: this.label}, pane);
			dialog.connect(dialog, "onExecute", function(){
				pane.apply();
			});
			davinci.ve.properties.edit.dialogs.eventDialog = dialog;
		}else{
			pane = davinci.ve.properties.edit.dialogs.getPane(dialog);
			davinci.ve.properties.edit.dialogs.activateDialog(dialog);
		}
		pane.setContext(context);
		pane.update();
		dialog.show();
	},

	isEnabled: function(context){
		var selection = context.getSelection();
		var widget = (selection.length > 0 ? selection[selection.length - 1] : undefined);
		if(!widget){ // page
			return true;
		}
		var events = davinci.ve.metadata.query(widget, "events");
		for(var n in events){
			return true;
		}
		return false;
	},

	destroy: function() {
		if (davinci.ve.properties.edit.dialogs.eventDialog && davinci.ve.properties.edit.dialogs.eventDialog.destroyRecursive) {
			davinci.ve.properties.edit.dialogs.eventDialog.destroyRecursive();
			davinci.ve.properties.edit.dialogs.eventDialog = null;			
		}
	}

});
});
