define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/ContextAction",
    	"davinci/ve/tools/PasteTool"
], function(declare, ContextAction, PasteTool){


return declare("davinci.ve.actions.PasteAction", [ContextAction], {

	shortcut: {keyCode: 86, ctrlKey: true}, // Ctrl+v

	run: function(context){
		context = this.fixupContext(context);
		if(context){
			if (context.declaredClass=="davinci.ve.PageEditor" && context._displayMode=="source")
			{
				context.htmlEditor.pasteAction.run();
				return;
			}
			var data = davinci.Runtime.clipboard;
			if(data){
				context.setActiveTool(new PasteTool(data));
			}
		}
	},

	isEnabled: function(context){
		context = this.fixupContext(context);
		return !!(context && davinci.Runtime.clipboard);
	},

	shouldShow: function(context){
		context = this.fixupContext(context);
		var editor = context ? context.editor : null;
		return (editor && editor.declaredClass == 'davinci.ve.PageEditor');
	}
});
});
