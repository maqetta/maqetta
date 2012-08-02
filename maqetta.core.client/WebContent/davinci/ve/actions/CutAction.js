define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/ContextAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand"
], function(declare, ContextAction, CompoundCommand, RemoveCommand){


return declare("davinci.ve.actions.CutAction", [ContextAction], {

	run: function(context){
		context = this.fixupContext(context);
		if(context){
		    if (context.declaredClass=="davinci.ve.PageEditor" && context._displayMode=="source")
		    {
		    	context.htmlEditor.cutAction.run();
		    	return;
		    }
			var selection = this._normalizeSelection(context);
			if(selection.length > 0){
				var command = new CompoundCommand();
				var data = [];
				dojo.forEach(selection, function(w){
					// FIXME: GENERALIZE
					var d = w.getData( {identify: false});
					if(d){
						data.push(d);
					}
					var helper = w.getHelper();
					var c;
					if(helper && helper.getRemoveCommand) {
						c = helper.getRemoveCommand(w);
						
					} else {
						c = new RemoveCommand(w);
					}
					command.add(c /*new RemoveCommand(w)*/);
				});
				
				
				
				davinci.Runtime.clipboard=data;
				context.select(null);
				context.getCommandStack().execute(command);
			}
		}
	},

	isEnabled: function(context){
		context = this.fixupContext(context);
		return (context && context.getSelection().length > 0);
	},

	shouldShow: function(context){
		context = this.fixupContext(context);
		var editor = context.editor;
		return (editor && editor.declaredClass == 'davinci.ve.PageEditor');
	}
});
});