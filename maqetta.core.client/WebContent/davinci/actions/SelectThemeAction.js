define([
        "dojo/_base/declare",
    	"./Action",
    	"../ui/widgets/ThemeSetSelection",
    	"../ve/commands/ChangeThemeCommand",
    	"dojo/i18n!davinci/actions/nls/actions",
    	"davinci/Workbench"
], function(declare, Action, ThemeSetSelection, ChangeThemeCommand, actionStrings, Workbench){

return declare("davinci.actions.SelectThemeAction", Action, {
	run: function(selection){
		var e = davinci.Workbench.getOpenEditor();
		if (e && e.isDirty){
			//Give editor a chance to give us a more specific message
			var message = e.getOnUnloadWarningMessage();
			if (!message) {
				//No editor-specific message, so use our canned one
				message = dojo.string.substitute(actionStrings.filesHasUnsavedChanges, [e.fileName]);
			}
			
			Workbench.showDialog({
				title: actionStrings.switchingThemes, 
				content: message,
				style: {width: 300},
				okCallback: dojo.hitch(this,this._okToSwitch), 
				okLabel: actionStrings.save, 
				hideCancel: null
			});
				   
		} else {
			this._okToSwitch();
		}
		
		
	},
	
	_okToSwitch: function(){
		var e = davinci.Workbench.getOpenEditor();
		if (e.isDirty) {
			e.save();
		}
		var theme = e.getContext().getTheme();
		var ldojoVersion = e.getContext().getDojo().version.major +'.'+ e.getContext().getDojo().version.minor;
		
		this._themeChooser = new ThemeSetSelection({value:theme, workspaceOnly: false, dojoVersion: ldojoVersion});
		this._themeChooser.buildRendering();

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
