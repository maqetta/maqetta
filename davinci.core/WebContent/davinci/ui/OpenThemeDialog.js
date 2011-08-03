dojo.provide("davinci.ui.OpenThemeDialog");
dojo.require("davinci.ui.widgets.ThemeSelection");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");

dojo.declare("davinci.ui.OpenThemeDialog",   [dijit._Widget, dijit._Templated], {
	
	
	templateString: dojo.cache("davinci.ui", "templates/OpenThemeDialog.html"),
	widgetsInTemplate: true,
	_themeChooser : null,
	
	startup : function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		this.inherited(arguments);
		var value = this._themeChooser.get('numberOfThemes') ;
		if(value<1){
			alert(langObj.noUserThemes);
			setTimeout(dojo.hitch(this,function(){
					 				
								    this.destroyRecursive();
									this.onClose();}, 500));
			
			
		}
	},
	
	postMixInProperties : function() {
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
		dojo.mixin(this, langObj);
		dojo.mixin(this, dijitLangObj);
		this.inherited(arguments);
	},
	
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