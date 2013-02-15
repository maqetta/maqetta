define([
		"dojo/_base/declare",
		"davinci/Runtime",
    	"davinci/Workbench",
		"davinci/ve/States",
		"davinci/actions/Action",
    	"davinci/workbench/Preferences"
], function(declare, Runtime, Workbench, States, Action, Preferences){


return declare("davinci.ve.actions.NewWidgetsCurrentState", [Action], {

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
		editorPrefs.newWidgetsCurrentState = editorPrefs.newWidgetsCurrentState ? false : true;
		Preferences.savePreferences(id, base, editorPrefs);
		States.updateStateIcons(context);
	}
});
});
