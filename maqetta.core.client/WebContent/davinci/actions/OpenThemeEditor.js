define([
        "dojo/_base/declare",
    	"./Action",
    	"../Workbench",
    	"../ui/widgets/ThemeSelection",
    	"davinci/ve/commands/ChangeThemeCommand",
    	"dojo/i18n!./nls/actions"
], function(declare, Action, Workbench, ThemeSelection, ChangeThemeCommand, langObj){

return declare("davinci.actions.OpenThemeEditor", null, {

	constructor: function(){
		this._themeChooser = new ThemeSelection({value: "                ", searchWorkspace: false});
		var diag = null;
		if(this._themeChooser.get('numberOfThemes') > 0) {
			diag = this._themeChooser;
		} else {
			diag = langObj.noEditableThemes;
		}
		//this._themeChooser.set('value', theme);
		Workbench.showModal(diag, langObj.editTheme, "width:110px");
		dojo.connect(this._themeChooser, "onChange", this, "_onChange");
	},

	_onChange: function() {
		var newTheme = this._themeChooser.attr('value');
		this._themeChooser.onClose();
		this._themeChooser.destroy();
		debugger;
		Workbench.openEditor({
			fileName: newTheme.file,
			content: newTheme
		});
	}
});
});
