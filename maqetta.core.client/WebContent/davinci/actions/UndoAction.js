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
		var context = e && e.getContext && e.getContext();
		if (e && context) {
			var canUndo = context.getCommandStack().canUndo();
			if(e.declaredClass == 'davinci.ve.PageEditor' || e.declaredClass == 'davinci.ve.themeEditor.ThemeEditor'){
				return canUndo;
			}
		} else {
			return false;
		}
	//	return (davinci.Runtime.commandStack.canUndo());
	}
});
});
