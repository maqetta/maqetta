//FIXME: This routine doesn't ever seem to be used. Remove?
define([
    	"dojo/_base/declare",
    	"davinci/actions/Action"
 ], function(declare, Action){


return declare("davinci.ve.actions.PropertyAction", [Action], {

	name: "properties",
	iconClass: "editActionIcon editPropertyIcon",
	shortcut: {keyCode: dojo.keys.ENTER, altKey: true}, // Alt+ENTER

	run: function(context){
		if(!context){
			return;
		}

		var dialog = davinci.ve.properties.edit.dialogs.propertyDialog;
		var pane = undefined;
		if(!dialog){
			pane = davinci.ve.properties.edit.dialogs.createPane({}, "davinci.ve.properties.edit.PropertyPane");
			dialog = davinci.ve.properties.edit.dialogs.createDialog({title: this.label}, pane);
			dialog.connect(dialog, "onExecute", function(){
				pane.apply();
			});
			davinci.ve.properties.edit.dialogs.propertyDialog = dialog;
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
		var properties = davinci.ve.metadata.query(widget, "property");
		for(var n in properties){
			return true;
		}
		return false;
	},

	destroy: function() {
		if (davinci.ve.properties.edit.dialogs.propertyDialog && davinci.ve.properties.edit.dialogs.propertyDialog.destroyRecursive) {
			davinci.ve.properties.edit.dialogs.propertyDialog.destroyRecursive();
			davinci.ve.properties.edit.dialogs.propertyDialog = null;
		}
	}
});
});