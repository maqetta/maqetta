define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/ContextAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand"
], function(declare, ContextAction, CompoundCommand, RemoveCommand){


return declare("davinci.ve.actions.CopyAction", [ContextAction], {


	run: function(context){
		context = this.fixupContext(context);
		if(context){
			if (context.declaredClass=="davinci.ve.PageEditor" && context._displayMode=="source")
			{
				context.htmlEditor.copyAction.run();
				return;
			}
			var selection = this._normalizeSelection(context);
			if(selection.length > 0){
				var command = new CompoundCommand();
				var data = [];
				dojo.forEach(selection, function(w){
					//TODO: GENERALIZE THIS
					var d = w.getData(  {identify: false});
					if(d){
						data.push(d);
					}
				});
				var oldData = davinci.Runtime.clipboard;
				davinci.Runtime.clipboard=data;
				if(!oldData){
					context.onSelectionChange(selection); // force to enable Paste action
				}
			}
		}
	},

	isEnabled: function(context){
		context = this.fixupContext(context);
		return (context && context.getSelection().length > 0);
	}

});
});