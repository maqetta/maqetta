dojo.provide("davinci.ui.Rename");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");
dojo.require("dojox.widget.Standby");

dojo.declare("davinci.ui.Rename",   [dijit._Widget,dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("davinci.ui", "templates/Rename.html"),
	_okButton: null,
	_newName : null,
	_eclipseSupport: null,
	
	postMixInProperties : function() {
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
		dojo.mixin(this, langObj);
		dojo.mixin(this, dijitLangObj);
		this.inherited(arguments);
	},
	postCreate : function(){
		this.inherited(arguments);
		dojo.connect(this._newName, "onkeyup", this, '_checkValid');
	},
	
	_setInvalidNames : function(values){
		this._invalid = values;
	},
	
	_checkValid : function(){
		
		// make sure the project name is OK.
		var name = dojo.attr(this._newName, "value");
		var valid = true;
		for(var i=0;i<this._invalid.length && valid;i++){
			if(this._invalid[i]==name) 
				valid = false;
		}
		this._okButton.set( 'disabled', !valid);
	},
	
	okButton : function(){
		this.value = dojo.attr(this._newName, "value");
			
		this.onClose();
	},
	
	_getValueAttr : function(){
		return this.value;
	},
	
	cancelButton: function(){
		this.onClose();
	},

	onClose : function(){}


	


});