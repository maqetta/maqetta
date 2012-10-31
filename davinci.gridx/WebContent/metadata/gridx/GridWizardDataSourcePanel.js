define([
	"dojo/_base/declare",
	"dijit/layout/ContentPane",
	"./GridInput",
	"./GridWizardPanel",
	"dojo/i18n!./nls/gridx"
], function(declare, ContentPane, GridInput, GridWizardPanel, gridxNls) {

return declare([ContentPane, GridWizardPanel], {
	postCreate: function() {
		var dataSourceInputContainer = this._dataSourceInputContainer = new ContentPane();
		dojo .addClass(dataSourceInputContainer.domNode, "dataSourcePanelDataSourceInputContainer");
		this.setContent(dataSourceInputContainer);
	},
	
	getStepLabel: function() {
		return gridxNls.dataSourceHeader;
	},

	populate: function(widget) {
		//Create GridInput (which we'll embed rather than have as standalone dialog)
		this._gridInput = new GridInput();
		this._gridInput._embeddingContentPane = this._dataSourceInputContainer;
		this._gridInput.show(widget.id);
		
		//Save input values for later use in determining whether our data is "dirty"
		this._saveInputValues();
		
		//Call super
		this.inherited(arguments);
	},
	
	resize: function(size) {
		this.inherited(arguments);

		if (this._gridInput && (!this._oldSize || this._oldSize.w != size.w || this._oldSize.h != size.h)) {
			//Set size of main div in GridInput
			var ieb = dojo.byId("ieb");
			dojo.style(ieb, "width", size.w - 30 + "px");
			
			//Set size of resize div in GridInput
			var targetObj = dojo.byId("iedResizeDiv");
			dojo.style(targetObj, "width", size.w - 30 + "px");
			dojo.style(targetObj, "height", size.h - 100 + "px");
			
			this._gridInput.resize();
			
			this._oldSize = size;
		}
	},
	
	getUpdateWidgetCommand: function(callback){ 
		//Save input values for later use in determining whether our data is "dirty"
		this._saveInputValues();
		
		//Get the command
		this._gridInput.getUpdateWidgetCommand(callback);
	},
	
	isValid: function() {
		var result = true;
		var inputValues = this._getInputValues();
		if (!inputValues.mainTextAreaValue) {
			if (inputValues.dropDownSelectValue === "dummyData") {
				result = gridxNls.commaSeparatedDataRequired;
			} else if (inputValues.dropDownSelectValue === "file") {
				result  = gridxNls.dataFileRequired;
			} else if (inputValues.dropDownSelectValue === "url") {
				result  = gridxNls.urlRequired;
			}
		}
		return result;
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
		this.inherited(arguments);
		
		this._gridInput.hide();
	}
});
});
