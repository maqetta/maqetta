define([
	"dojo/_base/declare",
	"./Action",
	"../Workbench"
], function(declare, Action, Workbench){

return declare("davinci.actions.RedoAction", Action, {

	run: function(selection){
		var e = Workbench.getOpenEditor();
		if (e && e.getContext) {
	//	if (e.declaredClass == 'davinci.themeEditor.ThemeEditor') // this is a hack to only support undo for theme editor for 0.5
			e.getContext().getCommandStack().redo();
	//		davinci.Runtime.commandStack.redo();
		}
	},
	
	isEnabled: function(selection){
		var e = Workbench.getOpenEditor();
		var context = e && e.getContext && e.getContext();
		if (e && context) {
			var canRedo = context.getCommandStack().canRedo();
			if(e.declaredClass == 'davinci.ve.PageEditor' || e.declaredClass == 'davinci.ve.themeEditor.ThemeEditor'){
				return canRedo;
			}
		} else {
			return false;
		}
		//	return davinci.Runtime.commandStack.canRedo();
	}
});
});
