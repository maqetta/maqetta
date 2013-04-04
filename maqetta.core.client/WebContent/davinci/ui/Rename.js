define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/Rename.html"

], function(declare, _Templated, _Widget,  uiNLS, commonNLS, templateString){
	
	return declare("davinci.ui.Rename",   [_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: templateString,
		_okButton: null,
		_newName : null,
		
		postMixInProperties : function() {
			var langObj = uiNLS;
			var dijitLangObj = commonNLS;
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
});
