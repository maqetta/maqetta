dojo.provide("davinci.actions.OpenThemeEditor");
dojo.require("davinci.actions.Action");
dojo.require("system.resource");
dojo.require("davinci.ve.commands.ChangeThemeCommand");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.actions", "actions");

dojo.declare("davinci.actions.OpenThemeEditor", null, {
	
	constructor: function(){
	
		var langObj = dojo.i18n.getLocalization("davinci.actions", "actions");
		this._themeChooser = new davinci.ui.widgets.ThemeSelection({value:"                ", 'searchWorkspace':false});
		var diag = null;
		if(this._themeChooser.get('numberOfThemes') > 0)
			diag = this._themeChooser;
		else
			diag = langObj.noEditableThemes;
		//this._themeChooser.set('value', theme);
		davinci.Workbench.showModal(diag, langObj.editTheme, "width:110px");
		dojo.connect(this._themeChooser, "onChange", this, "_onChange");
		
	},

	_onChange : function(){
		var newTheme = this._themeChooser.attr('value');
		this._themeChooser.onClose();
		this._themeChooser.destroy();
		davinci.Workbench.openEditor({
			fileName: newTheme.file,
			content: newTheme});
	}
	
	

});
