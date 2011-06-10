dojo.provide("davinci.actions.SelectThemeAction");
dojo.require("davinci.actions.Action");
dojo.require("davinci.model.Resource");
dojo.require("davinci.ui.widgets.ThemeSelection");
dojo.require("davinci.ve.commands.ChangeThemeCommand");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.actions", "actionsLang");
var langObj = dojo.i18n.getLocalization("davinci.actions", "actionsLang");

dojo.declare("davinci.actions.SelectThemeAction", davinci.actions.Action, {
	
	run: function(selection){
		
		var e = davinci.Workbench.getOpenEditor();
		
		var theme = e.getContext().getTheme();
			

		this._themeChooser = new davinci.ui.widgets.ThemeSelection({value:theme});
		
		//this._themeChooser.set('value', theme);
		davinci.Workbench.showModal(this._themeChooser, langObj.selectTheme);//width needs to be adjusted to fit language
		dojo.connect(this._themeChooser, "onChange", this, "_changeTheme");  //I'm still thinking on where it would be best to make that change
		
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
