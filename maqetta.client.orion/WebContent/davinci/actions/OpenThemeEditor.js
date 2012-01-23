define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"system/resource",
	"davinci/ve/commands/ChangeThemeCommand",
	"dojo/i18n!davinci/actions/nls/actions"
], function(declare, Action, resource, ChangeThemeCommand, langObj){

return declare("davinci.actions.OpenThemeEditor", null, {

	constructor: function(){
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
});
