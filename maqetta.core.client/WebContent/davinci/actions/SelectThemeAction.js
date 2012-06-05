define([
        "dojo/_base/declare",
    	"./Action",
    	"../ui/widgets/ThemeSetSelection",
    	"../ve/commands/ChangeThemeCommand",
    	"dojo/i18n!davinci/actions/nls/actions"
], function(declare, Action, ThemeSetSelection, ChangeThemeCommand, actionStrings){

return declare("davinci.actions.SelectThemeAction", Action, {
	run: function(selection){
		var okToSwitch = true;
		var e = davinci.Workbench.getOpenEditor();
		if (e && e.isDirty){
			//Give editor a chance to give us a more specific message
			var message = e.getOnUnloadWarningMessage();
			if (!message) {
				//No editor-specific message, so use our canned one
				message = dojo.string.substitute(actionStrings.filesHasUnsavedChanges, [e.fileName]);
			}
		    okToSwitch=confirm(message);
		}
		if (okToSwitch){
			var theme = e.getContext().getTheme();
			var ldojoVersion = e.getContext().getDojo().version.major +'.'+ e.getContext().getDojo().version.minor;
			
			this._themeChooser = new ThemeSetSelection({value:theme, workspaceOnly: false, dojoVersion: ldojoVersion});
			this._themeChooser.buildRendering();

		}
		
	},

	_changeTheme : function(){
		var newTheme = this._themeChooser.attr('value');
		this._themeChooser.onClose();
		this._themeChooser.destroy();
		
		var e = davinci.Workbench.getOpenEditor();
		if (e && e.getContext) {
			e.getContext().getCommandStack().execute(new ChangeThemeCommand(newTheme, e.getContext()));
		}
	}
});
});
