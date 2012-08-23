define([
    	"dojo/_base/declare",
    	"davinci/Workbench",
    	"davinci/ve/actions/ContextAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand"
], function(declare, Workbench, ContextAction, CompoundCommand, RemoveCommand){


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