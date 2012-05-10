define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/library",
        "system/resource",
        "davinci/Runtime",
        "davinci/model/Path",
        "davinci/Workbench",
        "davinci/workbench/Preferences",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/newtheme.html",
        "davinci/Theme",
        "davinci/ui/widgets/ThemeSelection",
        "dijit/form/Button",
        "dijit/form/ValidationTextBox"

],function(declare, _Templated, _Widget,  Library, Resource, Runtime, Path, Workbench, Preferences, 
			uiNLS, commonNLS, templateString, Theme, ThemeSelection, Button, ValidationTextBox){
	return declare("davinci.ui.NewTheme",   [dijit._Widget, dijit._Templated], {
		templateString: templateString,
		widgetsInTemplate: true,
		_themeSelection: null,
		_okButton : null,
		_folder : null,
		_themeName : null,
		_folder : null,
		_version : null,
		_selector : null,
		_themeLocation : null,
		_error1 : null,
		_error2 : null,
		_error3 : null,
		_error4 : null,
		_errorMsg : null,
	    /*
	     * CSS identifier validation RegExp
	     * 
	     * see http://www.w3.org/TR/CSS21/syndata.html#tokenization
	     * 
	     *     ident    [-]?{nmstart}{nmchar}*
	     *     nmstart  [_a-z]|{nonascii}|{escape}
	     *     nonascii [^\0-\237]
	     *     unicode  \\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?
	     *     escape   {unicode}|\\[^\n\r\f0-9a-f]
	     *     nmchar   [_a-z0-9-]|{nonascii}|{escape}
	     * 
	     */             
		_themeValidator: /^[-]?([_a-z]|[^\0-\237]|\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\[^\n\r\f0-9a-f])([_a-z0-9-]|[^\0-\237]|\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\[^\n\r\f0-9a-f])*$/i,
		
		postMixInProperties : function() {
			var langObj = uiNLS;
			var dijitLangObj = commonNLS;
			dojo.mixin(this, langObj);
			dojo.mixin(this, dijitLangObj);
			this.inherited(arguments);
		},

		postCreate : function(){
			this.inherited(arguments);
			
			dojo.connect(this._themeSelection, "onChange", this, '_baseThemeChanged');
			
			/* wire up error handlers */
			dojo.connect(this._themeSelection, "onChange", this, '_checkValid');
			
			/*
			 * Override the ValidationTextBox 'validator' method.
			 */
			this._selector.validator = dojo.hitch(this, function(value, constraints) {
	            var isValid = this._themeValidator.test(value);
	            this._okButton.set( 'disabled', !isValid);
		        return isValid;
			});
			
		},
		
		_baseThemeChanged : function(){
			
			this._theme = this._themeSelection.get("value");
			
		},
		
		_createTheme : function(){
			
			this._okButton.set( 'disabled', true);
			var langObj = uiNLS;
			var oldTheme = this._themeSelection.attr('value');
			var selector = dojo.attr(this._selector, 'value');
			var themeName = selector;
			var version = null;
			var base = selector;
		
			var newBase = this._getThemeLocation();
			var r1=  Resource.findResource(newBase+'/'+base+'.theme');
			if(r1){
				alert(langObj.themeAlreadyExists);
			}else{
				// put up theme create message
				this._loading = dojo.create("div",null, dojo.body(), "first");
				this._loading.innerHTML=dojo.string.substitute('<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;${0}...</td></tr></table>', [langObj.creatingTheme]);
				dojo.addClass(this._loading, 'loading');
				dojo.style(this._loading, 'opacity', '0.5');
			    var basePath = this.getBase();
			    // first we clone the theme which creates temp css files
				var deferedList = Theme.CloneTheme(themeName,  version, selector, newBase, oldTheme, true);
				deferedList.then(function(results){
					
				    var error = false;
			        for (var x=0; x < results.length; x++){
			            if(!results[x][0] ){
			                error = true;
			            }  
			        }
			        if (!error){
			        	// #23
			        	var found = Theme.getTheme(base, true);
			            if (found){
			        		found.file.isNew = false; // the file has been saved so don't delete it when closing editor without first save.
			                Workbench.openEditor({
			                       fileName: found.file,
			                       content: found.file.getText()});
			            } else {
			            	if (this._loading){ // remove the loading div
				    			this._loading.parentNode.removeChild(this._loading);
				    			delete this._loading;
				    		}
			                // error message
			                alert(langObj.errorCreatingTheme + base);
			                
			            }
			        } else {
			    		if (this._loading){ // remove the loading div
			    			this._loading.parentNode.removeChild(this._loading);
			    			delete this._loading;
			    		}
			        } 
			    }.bind(this));
			
			}
			
			
	  	},
		
		/*
		 * @return the project for the target theme.
		 */
		getBase : function(){
			if(Workbench.singleProjectMode()){
				return Workbench.getProject();
			}
		},
		
		_getThemeLocation : function(){
			
			var selector = dojo.attr(this._selector, 'value');
			
			//var resource = Resource.findResource("./themes");

			/* the directory is virtual, so create an actual instance */
			//if(resource.libraryId)
			//	resource.mkdir();
			var base = this.getBase();
			var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
			
			var projectThemeBase = (new Path(base).append(prefs['themeFolder']));
			
			return  projectThemeBase.append(selector).toString();
		},
		
		_checkValid : function(){
			
			var isOk = true;
			var oldTheme = this._themeSelection.attr('value');
			
			if( oldTheme==null || oldTheme =="" ) { isOk = false;}

			this._okButton.set( 'disabled', !isOk);
		},
		
		okButton : function(){
			this._createTheme();
			this.onClose();
		},
		
		cancelButton: function(){
			this.cancel = true;
			this.onClose();
		},

		onClose : function(){}
	

		


	});
});

