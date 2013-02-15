define([
		"dojo/_base/declare",
		"davinci/Runtime",
    	"davinci/Workbench",
		"davinci/ve/States",
		"davinci/actions/Action",
    	"davinci/workbench/Preferences"
], function(declare, Runtime, Workbench, States, Action, Preferences){


return declare("davinci.ve.actions.HighlightBaseWidgets", [Action], {

	run: function(){
		var context;
		if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
			context = Runtime.currentEditor.currentEditor.context;
		}else{
			return;
		}
		var id = 'davinci.ve.editorPrefs';
		var base = Workbench.getProject();
		var editorPrefs = Preferences.getPreferences(id, base);
		editorPrefs.highlightBaseWidgets = editorPrefs.highlightBaseWidgets ? false : true;
		Preferences.savePreferences(id, base, editorPrefs);
		// Causes base widget highlighting to be redone,
		// and also causes icon on StatesView toolbar to get updated
		context.updateFocusAll();	
	}
});
});
