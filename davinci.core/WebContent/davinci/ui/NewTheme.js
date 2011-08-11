dojo.provide("davinci.ui.NewTheme");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.MenuItem");
dojo.require("dijit.Menu");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ComboBox");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");

dojo.require("davinci.library");
dojo.require("davinci.ve.RebaseDownload");
dojo.require("dojox.widget.Standby");
dojo.require("davinci.ui.widgets.FolderSelection");
dojo.require("davinci.ui.widgets.ThemeSelection");
dojo.require("davinci.theme.ThemeUtils");

dojo.declare("davinci.ui.NewTheme",   [dijit._Widget, dijit._Templated], {
	
	templateString: dojo.cache("davinci.ui", "templates/newtheme.html"),
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
	_themeValidator: /^[-]?([_a-z]|[^\0-\237]|\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\[^\n\r\f0-9a-f])([_a-z0-9-]|[^\0-\237]|\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\[^\n\r\f0-9a-f])*$/i,
	
	postMixInProperties : function() {
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
		dojo.mixin(this, langObj);
		dojo.mixin(this, dijitLangObj);
		this.inherited(arguments);
	},

	postCreate : function(){
		this.inherited(arguments);
		
		dojo.connect(this._themeSelection, "onChange", this, '_baseThemeChanged');
		
		/* wire up error handlers */
		dojo.connect(this._themeSelection, "onChange", this, '_checkValid');
		//dojo.connect(this._folder, "onblur", this, '_checkValid');
		//dojo.connect(this._version, "onblur", this, '_checkValid');
		//dojo.connect(this._selector, "onkeypress", this, '_checkValid');
		dojo.connect(this._selector, "onkeyup", this, '_checkValid');
		//dojo.connect(this._location, "onblur", this, '_checkValid');
		
		
	},
	
	_baseThemeChanged : function(){
		
		this._theme = this._themeSelection.get("value");
		//dojo.attr(this._themeName, 'value', this._theme.name);
	//	dojo.attr(this._selector, 'value', this._theme.className);
	//	var newVersion = parseFloat(this._theme.version);
	//	dojo.attr(this._version, 'value', ++newVersion);
	//	var selector = dojo.attr(this._selector, 'value');
	//	var newBase = selector + "-" + newVersion;
		
		
	//	dojo.attr(this._themeLocation, 'value', newBase);
		
	},
	
	_createTheme : function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var oldTheme = this._themeSelection.attr('value');
	//	var targetFolder = this._themeLocation.attr('value');
		var selector = dojo.attr(this._selector, 'value');
		var themeName = selector;
		var version = null
		var base = selector;
	
		var newBase = this._getThemeLocation();
		var r1=  davinci.resource.findResource(base);
		if(r1)
			alert(langObj.themeAlreadyExists);
		else
			davinci.theme.CloneTheme(themeName,  version, selector, newBase, oldTheme, true);
	},
	
	/*
	 * @return the project for the target theme.
	 */
	getProject : function(){
		if(davinci.Runtime.singleProjectMode()){
			return davinci.Runtime.getProject();
		}
	},
	
	_getThemeLocation : function(){
		var selector = dojo.attr(this._selector, 'value');
		
		//var resource = davinci.resource.findResource("./themes");

		/* the directory is virtual, so create an actual instance */
		//if(resource.libraryId)
		//	resource.mkdir();
		
		
		return  this.getProject() + "/themes/" + selector;
	},
	
	_checkValid : function(){
		
		var isOk = true;
		var oldTheme = this._themeSelection.attr('value');
		
		if(oldTheme==null || oldTheme ==""){
			isOk = false;
			
			
		}
		var selector = dojo.attr(this._selector, 'value');
		
		/*
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
		if ( selector==null || selector == "" || ! this._themeValidator.test(selector) ) {
			isOk = false;
		}
		this._okButton.set( 'disabled', !isOk);
	},
	
	okButton : function(){
		this._createTheme();
		this.onClose();
	},
	
	cancelButton: function(){
		this.onClose();
	},

	onClose : function(){}


	


});