
define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/ErrorDialog.html",
        "dijit/form/Button",
        
],function(declare, _Templated, _Widget, uiNLS, commonNLS, templateString){
	return declare("davinci.ui.ErrorDialog",   [_Widget, _Templated], {
		
		/* message */
		errorText : "I am error!",
		/* cancel button text */
		cancelButtonText : "",
		/* call back when user clicks "Cancel" */
		cancelCallBack : function(){},
		/* ok button text */
		okButtonText : "OK",
		/* ok button call back */
		okCallBack : function(){},
	
	
		
		templateString: templateString,
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
			//if no cancel button text, just hide it 
			
			if(value==null || value==""){
				dojo.addClass(this._cancelButton.domNode, "dijitHidden");
			}else{
				dojo.removeClass(this._cancelButton.domNode, "dijitHidden");
			}
			
			dojo.attr(this._cancelButton,'label',  value);
		},
		_setOkButtonTextAttr : function(value){
			dojo.attr(this._okButton, 'label', value);
		},
		
	
	});
});