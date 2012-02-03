define([
	"dojo/_base/declare",
	"./Action",
	"../Workbench"
], function(declare, Action, Workbench){

return declare("davinci.actions.UndoAction", Action, {	
	run: function(selection){
		var e = Workbench.getOpenEditor();
		if (e && e.getContext)
		//if (e.declaredClass == 'davinci.themeEditor.ThemeEditor') // this is a hack to only support undo for theme editor for 0.5
			e.getContext().getCommandStack().undo();
	//		davinci.Runtime.commandStack.undo();
	},
	
	isEnabled: function(selection){
		var e = Workbench.getOpenEditor();
		if (e && e.getContext) {
	//	if (e.declaredClass == 'davinci.themeEditor.ThemeEditor') // this is a hack to only support undo for theme editor for 0.5
			return e.getContext().getCommandStack().canUndo();
		} else {
			return false;
		}
	//	return (davinci.Runtime.commandStack.canUndo());
	}
});
});
