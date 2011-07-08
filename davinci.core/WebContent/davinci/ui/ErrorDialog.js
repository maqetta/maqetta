dojo.provide("davinci.ui.ErrorDialog");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");

dojo.declare("davinci.ui.ErrorDialog",   [dijit._Widget, dijit._Templated], {
	
	/* message */
	errorText : "I am error!",
	/* cancel button text */
	cancelButtonText : "Cancel",
	/* call back when user clicks "Cancel" */
	cancelCallBack : function(){},
	/* ok button text */
	okButtonText : "OK",
	/* ok button call back */
	okCallBack : function(){},


	
	templateString: dojo.cache("davinci.ui", "templates/ErrorDialog.html"),
	widgetsInTemplate: true,
	_okButton : null,
	_cancelButton : null,
	_errorText : null,
	okButton : function(){this.okCallBack();this.onClose();},
	cancelButton : function(){this.cancelCallBack();this.onClose();},
	onClose:function(){},
	
	_setErrorTextAttr : function(value){
		this._errorText.innerHTML = value;
	},
	
	_setCancelCallBackAttr : function(value){
		this.cancelCallBack = value;
	},
	
	_setOkCallBackAttr : function(value){
		this.okCallBack = value;
	},
	
	_setCancelButtonTextAttr : function(value){
		dojo.attr(this._cancelButton,'label',  value);
	},
	_setOkButtonTextAttr : function(value){
		dojo.attr(this._okButton, 'label', value);
	},
	

});