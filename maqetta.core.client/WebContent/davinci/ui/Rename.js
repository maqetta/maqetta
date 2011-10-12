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
		if(!this.invalid)
			this.invalid = {};
		
		this.inherited(arguments);
	},
	postCreate : function(){
		this.inherited(arguments);
		dojo.connect(this._newName, "onkeyup", this, '_checkValid');
		if(this.value){
			this._setValueAttr(this.value);
		}
		
		if(this.invalid){
			this._setInvalidAttr(this.invalid);
		}
		
	},
	
	_setInvalidAttr : function(values){
		this.invalid = values;
	},
	
	_checkValid : function(){
		
		// make sure the project name is OK.
		var name = dojo.attr(this._newName, "value");
		var valid = (name!=null && name.length>0);
		
		for(var i=0;i<this.invalid.length && valid;i++){
			if(this.invalid[i]==name) 
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
	
	_setValueAttr : function(value){
		
		this.value = value;
		if(this._newName){
			dojo.attr(this._newName, "value", this.value);
		}
		this._checkValid();
	},
	
	
	cancelButton: function(){
		this.cancel = true;
		this.onClose();
	},

	_getCancelAttr : function(value){
		return this.cancel;
	},
	
	onClose : function(){}


	


});