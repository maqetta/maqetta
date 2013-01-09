define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/OpenThemeDialog.html",
        "davinci/ui/widgets/ThemeSelection"

  ],function(declare, _Templated, _Widget,  uiNLS, commonNLS, templateString){
	return declare("davinci.ui.OpenThemeDialog",   [_Widget, _Templated], {
		templateString: templateString,
		widgetsInTemplate: true,
		_themeChooser : null,
		
		startup : function(){
			var langObj = uiNLS;
			this.inherited(arguments);
			var value = this._themeChooser.get('numberOfThemes') ;
			if(value<1){
				alert(langObj.noUserThemes);
				setTimeout(dojo.hitch(this,function(){
						 				
									    this.destroyRecursive();
									    this.cancel = true;
										this.onClose();}, 500));
				
				
			}
		},
		
		postMixInProperties : function() {
			var langObj = uiNLS;
			var dijitLangObj = commonNLS;
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
		
		
		okButton : function(){
			var newTheme = this._themeChooser.attr('value');
			
			davinci.Workbench.openEditor({
				fileName: newTheme.getFile(),
				content: newTheme});
		},
		cancelButton : function(){
			this.cancel = true;
			this.onClose();
		}
		

	});
});

