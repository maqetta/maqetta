define([
    	"dojo/_base/declare",
    	"davinci/Workbench",
    	"davinci/ve/actions/ContextAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand",
    	"davinci/ve/widget"
], function(declare, Workbench,ContextAction, CompoundCommand, RemoveCommand, Widget){


return declare("davinci.ve.actions.CutAction", [ContextAction], {

	run: function(context){
		context = this.fixupContext(context);
		if(context){
		    if (context.declaredClass=="davinci.ve.PageEditor" && context._displayMode=="source")
		    {
		    	this._invokeSourceEditorAction(context);
		    	return;
		    }
			var selection = this._normalizeSelection(context);
			if(selection.length > 0){
				var command = new CompoundCommand();
				var data = [];
				var reorderedSelection = context.reorderPreserveSiblingOrder(selection);
				dojo.forEach(reorderedSelection, function(w){
					var d = w.getData( {identify: false});
					if(d){
						data.push(d);
					}
					var helper = w.getHelper();
					var c;
					if(helper && helper.getRemoveCommand) {
						c = helper.getRemoveCommand(w);
						
						// Look for associated widgets in compound command (for things like
						// grids, trees, etc.) and add that as a special field to the widget
						// data.
						if (c.name === "compound") {
							// Let's loop (backwards) through the sub commands and 
							// get the data for the widgets being deleted (skipping the
							// very last one which by convention should be the widget
							// itself).
							var associatedCopiedWidgetData = [];
							var commands = c._commands;
							for (var i = commands.length - 1; i > 0; i--) {
								var subCommand = commands[i];
								if (subCommand.name === "remove") {
									var subCommandWidget = Widget.byId(subCommand._id);
									var subCommandWidgetData = subCommandWidget.getData( {identify: false});
									associatedCopiedWidgetData.push(subCommandWidgetData);
								}
							}
							d.associatedCopiedWidgetData = associatedCopiedWidgetData;
						}
						
					} else {
						c = new RemoveCommand(w);
					}
					command.add(c /*new RemoveCommand(w)*/);
				});

				// Execute the copy or paste action (delegated to subclass)
				this._executeAction(context, selection, data, command);
			}
		}
	},

	isEnabled: function(context){
		context = this.fixupContext(context);
		var e = Workbench.getOpenEditor();
		if (e && context) {
			var anySelection = context.getSelection().length > 0;
			if(e.declaredClass == 'davinci.ve.PageEditor'){
				var displayMode = e.getDisplayMode();
				return anySelection && displayMode != 'source';
			}else{
				return anySelection;
			}
		}else{
			return false;
		}
	},

	shouldShow: function(context){
		context = this.fixupContext(context);
		var editor = context ? context.editor : null;
		return (editor && editor.declaredClass == 'davinci.ve.PageEditor');
	},
	
	_invokeSourceEditorAction: function(context) {
		// Subclass should overrride
	},
	
	_executeAction: function(context, selection, data, removeCommand) {
		// Subclass should overrride
	}
});
});