define([
    	"dojo/_base/declare",
    	"davinci/actions/Action"
], function(declare, Action){


return declare("davinci.ve.actions.RotateDeviceAction", [Action], {

	run: function(selection){
		var e = davinci.Workbench.getOpenEditor();
		var context = e.getContext();
		context.visualEditor.toggleOrientation();		
	},
	
	isEnabled: function(selection){
		var e = davinci.Workbench.getOpenEditor();
		if (e && e.getContext)
	//	if (e.declaredClass == 'davinci.themeEditor.ThemeEditor') // this is a hack to only support undo for theme editor for 0.5
			return (e.getContext().getCommandStack().canRedo());
		else return false;
		//	return davinci.Runtime.commandStack.canRedo();
	}
});
});