dojo.provide("davinci.actions.UndoAction");
dojo.require("davinci.actions.Action");

dojo.declare("davinci.actions.UndoAction", davinci.actions.Action, {
	
	run: function(selection){
	var e = davinci.Workbench.getOpenEditor();
	if (e && e.getContext)
	//if (e.declaredClass == 'davinci.themeEditor.ThemeEditor') // this is a hack to only support undo for theme editor for 0.5
		e.getContext().getCommandStack().undo();
//		davinci.Runtime.commandStack.undo();
},

isEnabled: function(selection){
	var e = davinci.Workbench.getOpenEditor();
	if (e && e.getContext)
//	if (e.declaredClass == 'davinci.themeEditor.ThemeEditor') // this is a hack to only support undo for theme editor for 0.5
		return (e.getContext().getCommandStack().canUndo());
	else return false;
//	return (davinci.Runtime.commandStack.canUndo());
}


});
