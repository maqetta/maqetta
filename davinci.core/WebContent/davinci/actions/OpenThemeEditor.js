dojo.provide("davinci.actions.OpenThemeEditor");
dojo.require("davinci.actions.Action");
dojo.require("davinci.resource");
dojo.require("davinci.ve.commands.ChangeThemeCommand");


dojo.declare("davinci.actions.OpenThemeEditor", null, {
	
	constructor: function(){
	
		this._themeChooser = new davinci.ui.widgets.ThemeSelection({value:"                "});
		
		//this._themeChooser.set('value', theme);
		davinci.Workbench.showModal(this._themeChooser, "Edit Theme", "width:110px");
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
