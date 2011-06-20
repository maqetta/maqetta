dojo.provide("davinci.ui.OpenThemeDialog");
dojo.require("davinci.ui.widgets.ThemeSelection");


dojo.declare("davinci.ui.OpenThemeDialog",   [dijit._Widget, dijit._Templated], {
	
	
	templateString: dojo.cache("davinci.ui", "templates/OpenThemeDialog.html"),
	widgetsInTemplate: true,
	_themeChooser : null,
	
	startup : function(){
		
		this.inherited(arguments);
		var value = this._themeChooser.get('numberOfThemes') ;
		if(value<1){
			alert( "No user themes found in workspace.  Please create a new theme before editing.");
			setTimeout(dojo.hitch(this,function(){
					 				
								    this.destroyRecursive();
									this.onClose();}, 500));
			
			
		}
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