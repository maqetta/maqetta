dojo.provide("davinci.ui.OpenThemeDialog");
dojo.require("davinci.ui.widgets.ThemeSelection");


dojo.declare("davinci.ui.OpenThemeDialog",   [dijit._Widget, dijit._Templated], {
	
	
	templateString: dojo.cache("davinci.ui", "templates/OpenThemeDialog.html"),
	widgetsInTemplate: true,
	_themeChooser : null,
	
	_checkValid : function(){
		var isOk = true;
		var oldTheme = this._themeChooser.attr('value');
		
		if(oldTheme==null || oldTheme ==""){
			isOk = false;
			
			
		}
		this._okButton.set( 'disabled', !isOk);
	},
	
	onClose : function(){},
	
	okButton : function(){
		var newTheme = this._themeChooser.attr('value');
		this.onClose();
		
		davinci.Workbench.openEditor({
			fileName: newTheme.file,
			content: newTheme});
		this.destroy();
		
	},
	cancelButton : function(){
		this.onClose();
	}
	

});