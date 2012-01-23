define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"system/resource",
	"davinci/ui/widgets/ThemeSelection",
	"davinci/ve/commands/ChangeThemeCommand",
	"dojo/i18n!davinci/actions/nls/actions"
], function(declare, Action, resource, ThemeSelection, ChangeThemeCommand, langObj){

return declare("davinci.actions.SelectThemeAction", Action, {
	
	run: function(selection){
		var e = davinci.Workbench.getOpenEditor();
		
		var theme = e.getContext().getTheme();
		var ldojoVersion = e.getContext().getDojo().version.major +'.'+ e.getContext().getDojo().version.minor;
		
		this._themeChooser = new davinci.ui.widgets.ThemeSelection({'value':theme, workspaceOnly:false, dojoVersion: ldojoVersion });
		davinci.Workbench.showModal(this._themeChooser, langObj.selectTheme, "width:200px");//width needs to be adjusted to fit language
		dojo.connect(this._themeChooser, "onChange", this, "_changeTheme");
		
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