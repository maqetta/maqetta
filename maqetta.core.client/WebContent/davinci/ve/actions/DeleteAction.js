define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/ContextAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand"
], function(declare, ContextAction, CompoundCommand, RemoveCommand){


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
		return (context && context.getSelection().length > 0);
	}

});
});