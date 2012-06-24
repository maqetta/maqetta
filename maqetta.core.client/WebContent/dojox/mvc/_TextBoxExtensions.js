define([
	"dojo/_base/lang",
	"dijit/_WidgetBase",
	"dijit/form/ValidationTextBox",
	"dijit/form/NumberTextBox"
], function(lang, wb, vtb, ntb){
	/*=====
		wb = dijit._WidgetBase;
		vtb = dijit.form.ValidationTextBox;
		ntb = dijit.form.NumberTextBox;
	=====*/

	// monkey patch dijit.form.ValidationTextBox.isValid to check this.inherited for isValid
	var oldValidationTextBoxIsValid = vtb.prototype.isValid;
	vtb.prototype.isValid = function(/*Boolean*/ isFocused){
		return (this.inherited("isValid", arguments) !== false && oldValidationTextBoxIsValid.apply(this, [isFocused]));
	};

	// monkey patch dijit.form.NumberTextBox.isValid to check this.inherited for isValid
	var oldNumberTextBoxIsValid = ntb.prototype.isValid;
	ntb.prototype.isValid = function(/*Boolean*/ isFocused){
		return (this.inherited("isValid", arguments) !== false && oldNumberTextBoxIsValid.apply(this, [isFocused]));
	};

	if(!lang.isFunction(wb.prototype.isValid)){
		wb.prototype.isValid = function(){
			var valid = this.get("valid");
			return typeof valid == "undefined" ? true : valid;
		};
	}

	wb.prototype._setValidAttr = function(value){
		this._set("valid", value);
		this.validate();
	};
});
