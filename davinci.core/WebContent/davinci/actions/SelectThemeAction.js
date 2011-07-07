dojo.provide("davinci.actions.SelectThemeAction");
dojo.require("davinci.actions.Action");
dojo.require("davinci.resource");
dojo.require("davinci.ui.widgets.ThemeSelection");
dojo.require("davinci.ve.commands.ChangeThemeCommand");


dojo.declare("davinci.actions.SelectThemeAction", davinci.actions.Action, {
	
	run: function(selection){
		
		var e = davinci.Workbench.getOpenEditor();
		
		var theme = e.getContext().getTheme();
			
	
		this._themeChooser = new davinci.ui.widgets.ThemeSelection({'value':theme, workspaceOnly:false});
		
		//this._themeChooser.set('value', theme);
		davinci.Workbench.showModal(this._themeChooser, "Select a theme", "width:130px");
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
