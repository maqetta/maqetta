define([
        "dojo/_base/declare",
    	"./Action",
    	"system/resource",
    	"davinci/ui/widgets/ThemeSetSelection",
    	"davinci/ve/commands/ChangeThemeCommand",
    	"dojo/i18n!./nls/actions"
], function(declare, Action, resource, ThemeSetSelection, ChangeThemeCommand, langObj){

return declare("davinci.actions.SelectThemeAction", Action, {
	run: function(selection){
		
		var e = davinci.Workbench.getOpenEditor();
		
		var theme = e.getContext().getTheme();
		var ldojoVersion = e.getContext().getDojo().version.major +'.'+ e.getContext().getDojo().version.minor;
		
		this._themeChooser = new davinci.ui.widgets.ThemeSetSelection({'value':theme, workspaceOnly:false, dojoVersion: ldojoVersion });
		this._themeChooser.buildRendering();
		//davinci.Workbench.showModal(this._themeChooser, langObj.selectTheme, "width:200px");//width needs to be adjusted to fit language
		//dojo.connect(this._themeChooser, "onChange", this, "_changeTheme");
		
	},

	_changeTheme : function(){
		var newTheme = this._themeChooser.attr('value');
		this._themeChooser.onClose();
		this._themeChooser.destroy();
		
		var e = davinci.Workbench.getOpenEditor();
		if (e && e.getContext)
			e.getContext().getCommandStack().execute(new davinci.ve.commands.ChangeThemeCommand(newTheme, e.getContext()));
	}
});
});
