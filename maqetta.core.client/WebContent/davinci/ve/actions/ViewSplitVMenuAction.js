define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/ContextAction"
], function(declare, ContextAction){


return declare("davinci.ve.actions.ViewSplitVMenuAction", [ContextAction], {

	run: function(context){
		context = this.fixupContext(context);
		if(context && context.editor && context.editor.switchDisplayModeSplitVertical){
			context.editor.switchDisplayModeSplitVertical();
		}
	}
});
});