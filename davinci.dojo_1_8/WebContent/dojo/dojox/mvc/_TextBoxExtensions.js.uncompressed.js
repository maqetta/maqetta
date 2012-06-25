define("dojox/mvc/_TextBoxExtensions", [
	"dojo/_base/lang",
	"dijit/_WidgetBase",
	"dijit/form/ValidationTextBox",
	"dijit/form/NumberTextBox"
], function(lang, WidgetBase, ValidationTextBox, NumberTextBox){

	// monkey patch dijit/form/ValidationTextBox.isValid to check this.inherited for isValid
	var oldValidationTextBoxIsValid = ValidationTextBox.prototype.isValid;
	ValidationTextBox.prototype.isValid = function(/*Boolean*/ isFocused){
		return (this.inherited("isValid", arguments) !== false && oldValidationTextBoxIsValid.apply(this, [isFocused]));
	};

	// monkey patch dijit/form/NumberTextBox.isValid to check this.inherited for isValid
	var oldNumberTextBoxIsValid = NumberTextBox.prototype.isValid;
	NumberTextBox.prototype.isValid = function(/*Boolean*/ isFocused){
		return (this.inherited("isValid", arguments) !== false && oldNumberTextBoxIsValid.apply(this, [isFocused]));
	};

	if(!lang.isFunction(WidgetBase.prototype.isValid)){
		WidgetBase.prototype.isValid = function(){
			var valid = this.get("valid");
			return typeof valid == "undefined" ? true : valid;
		};
	}

	WidgetBase.prototype._setValidAttr = function(value){
		this._set("valid", value);
		this.validate();
	};
});
