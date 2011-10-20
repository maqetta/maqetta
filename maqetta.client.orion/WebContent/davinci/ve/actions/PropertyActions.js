dojo.provide("davinci.ve.actions.PropertyActions");

//dojo.require("davinci.ve.properties.edit.dialogs"); // FIXME: missing
dojo.require("davinci.actions.Action");
dojo.require("davinci.ve.metadata");

dojo.declare("davinci.ve.actions.PropertyAction", davinci.actions.Action, {

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

dojo.declare("davinci.ve.actions.StyleAction", davinci.ve.actions.Action, {

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

dojo.declare("davinci.ve.actions.EventAction", davinci.ve.actions.Action, {

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

