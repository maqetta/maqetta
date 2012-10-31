define([
    	"dojo/_base/declare",
    	"davinci/Workbench",
    	"davinci/ve/actions/ContextAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand"
], function(declare, Workbench, ContextAction, CompoundCommand, RemoveCommand){


return declare("davinci.ve.actions.DeleteAction", [ContextAction], {

	run: function(context){
		context = this.fixupContext(context);
		if(context){
			var selection = this._normalizeSelection(context);
			if(selection.length > 0){
				var command = undefined;
				if(selection.length === 1){
					var w = selection[0];
					var helper = w.getHelper();
					if(helper && helper.getRemoveCommand) {
						command = helper.getRemoveCommand(w);
						
					} else {
						command = new RemoveCommand(w/*selection[0]*/);
					}
				}else{
					command = new CompoundCommand();
					dojo.forEach(selection, function(w){
						var c;
						var helper = w.getHelper();
						if(helper && helper.getRemoveCommand) {
							c = helper.getRemoveCommand(w);
							
						} else {
							c = new RemoveCommand(w);
						}
						command.add(c /*new RemoveCommand(w)*/);
					});
				}
				context.select(null);
				context.getCommandStack().execute(command);
			}
		}
	},

	isEnabled: function(context){
		context = this.fixupContext(context);
		var e = Workbench.getOpenEditor();
		if (e && context) {
			var anySelection = (context.getSelection().length > 0);
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
	}
});
});