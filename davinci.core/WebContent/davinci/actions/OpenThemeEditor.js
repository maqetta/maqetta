dojo.provide("davinci.actions.OpenThemeEditor");
dojo.require("davinci.actions.Action");
dojo.require("davinci.resource");
dojo.require("davinci.ve.commands.ChangeThemeCommand");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.actions", "actions");
var langObj = dojo.i18n.getLocalization("davinci.actions", "actions");

dojo.declare("davinci.actions.OpenThemeEditor", null, {
	
	constructor: function(){
	
		this._themeChooser = new davinci.ui.widgets.ThemeSelection({value:"                "});
		
		//this._themeChooser.set('value', theme);
		davinci.Workbench.showModal(this._themeChooser, langObj.editTheme);//width needs to be adjusted to fit language
		dojo.connect(this._themeChooser, "onChange", this, "_onChange");   //I'm still thinking on where it would be best to make that change
		
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
