define([
    	"dojo/_base/declare",
    	"../../Workbench",
    	"./ContextAction",
    	"../tools/PasteTool",
    	"../../Runtime"
], function(declare, Workbench, ContextAction, PasteTool, Runtime){

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
			var data = Runtime.clipboard;
			if(data){
				context.setActiveTool(new PasteTool(data));
			}
		}
	},

	isEnabled: function(context){
		context = this.fixupContext(context);
		var e = Workbench.getOpenEditor();
		if (e && context) {
			if(e.declaredClass == 'davinci.ve.PageEditor'){
				var displayMode = e.getDisplayMode();
				return Runtime.clipboard && displayMode != 'source';
			}else{
				return Runtime.clipboard;
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
