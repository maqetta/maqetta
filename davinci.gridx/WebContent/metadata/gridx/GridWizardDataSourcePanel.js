define([
	"dojo/_base/declare",
	"dijit/layout/ContentPane",
	"./GridInput",
	"dojo/i18n!./nls/gridx"
], function(declare, ContentPane, GridInput, gridxNls) {

return declare(null, {

	populate: function(widgetId, parentContentPane) {
		//Create GridInput (which we'll embed rather than have as standalone dialog)
		this._gridInput = new GridInput();
		this._gridInput._embeddingContentPane = parentContentPane;
		this._gridInput.show(widgetId);
		
		//Save input values for later use in determining whether our data is "dirty"
		this._saveInputValues();
		
		//Mark as populated
		this._isPopulated = true;
	},
	
	isPopulated: function() {
		return this._isPopulated;
	},
	
	getUpdateWidgetCommand: function(callback){ 
		//Get the command
		this._gridInput.getUpdateWidgetCommand(callback);
		
		//Save input values for later use in determining whether our data is "dirty"
		this._saveInputValues();
	},
	
	isValid: function() {
		var inputValues = this._getInputValues();
		if (!inputValues.mainTextAreaValue) {
			if (inputValues.dropDownSelectValue === "dummyData") {
				this._validationMessage = gridxNls.commaSeparatedDataRequired;
			} else if (inputValues.dropDownSelectValue === "file") {
				this._validationMessage = gridxNls.dataFileRequired;
			} else if (inputValues.dropDownSelectValue === "url") {
				this._validationMessage = gridxNls.urlRequired;
			}
			return false;
		}
		this._validationMessage = null;
		return true;
	},
	
	getValidationMessage: function() {
		return this._validationMessage;
	},
	
	isDirty: function() {
		var newInputValues = this._getInputValues();
		var dirty = true;
		if (this._savedInputValues) {
			dirty = newInputValues.dropDownSelectValue != this._savedInputValues.dropDownSelectValue
					|| newInputValues.mainTextAreaValue != this._savedInputValues.mainTextAreaValue
					|| newInputValues.callbackTextBoxValue != this._savedInputValues.callbackTextBoxValue;
		}
		return dirty;
	},
	
	_saveInputValues: function() {
		this._savedInputValues = this._getInputValues();
	},
	
	_getInputValues: function() {
		var values = {};
		
		//Get the data store type drop down (of type "dojox.form.DropDownSelect")
		var dropDownSelect = dijit.byId("davinci.ve.input.DataGridInput.dataStoreType");
		values.dropDownSelectValue = dropDownSelect.get("value");
		
		//Get the main text area of type (of type "dijit.form.SimpleTextarea")
		var mainTextArea = dijit.byId("davinciIleb");
		values.mainTextAreaValue = mainTextArea.get("value");

		//Get the callback text box of type (of type "dijit.form.TextBox")
		var callbackTextBox = dijit.byId("davinci.ve.input.SmartInput_callback_editbox");
		values.callbackTextBoxValue = callbackTextBox.get("value");
		
		return values;
	},
	
	destroy: function() {
		this._gridInput.hide();
	}
});
});
