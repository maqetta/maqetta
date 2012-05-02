define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/layout/ContentPane",
	"dijit/form/Button",
	"dijit/form/MultiSelect",
	"dojo/query",
	"davinci/ve/widget",
	"dojo/i18n!./nls/gridx",
	"dojo/text!./templates/gridWizardSelectColumns.html"
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, ContentPane,  
		Button, MultiSelect, query, Widget, gridxNls, templateString) {

return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

	templateString: templateString,

	postMixInProperties: function() {
		this.inherited(arguments);
		dojo.mixin(this, gridxNls);
	},

	postCreate: function() {
		
	},

	populate: function(widget, compoundCommand, ignoreCurrentWidgetStructure) {
		var currentWidgetStructure = null;
		if (!ignoreCurrentWidgetStructure) {
			currentWidgetStructure = widget.attr("structure");
		}
		
		//Clean out source and target lists
		this._removeAllOptions(this.sourceColumnSelect);
		this._removeAllOptions(this.targetColumnSelect);
		
		//Get structure from the proposed command
		var lastCommand = compoundCommand._commands[compoundCommand._commands.length-1];
		var props = lastCommand._properties;
		var commandStructure = props.structure;
		
		//Create options in target list
		dojo.forEach(commandStructure, function(commandStructureElement) {
			var option = dojo.doc.createElement("option"); 
			option.value = commandStructureElement.field;
			option.innerHTML = commandStructureElement.name;
			
			//See if the structure entry built for the command (built from proposed data store
			//modifications) matches anything in the currently set widget structure
			if (currentWidgetStructure) {
				var match = dojo.some(currentWidgetStructure, function(currentWidgetStructureElement) {
					if (currentWidgetStructureElement.field === commandStructureElement.field) {
						return true;
					}
				});
				
				if (!match) {
					//Not selected in current widget structure, so add to source side
					this.sourceColumnSelect.containerNode.appendChild(option);
				}
			} else {
				//We're ignoring current widget structure, so put in target side
				this.targetColumnSelect.containerNode.appendChild(option);
			}
		}.bind(this));
		
		if (currentWidgetStructure) {
			dojo.forEach(currentWidgetStructure, function(currentWidgetStructureElement) {
				//See if the structure entry built for the command (built from proposed data store
				//modifications) matches anything in the currently set widget structure
				var match = dojo.some(commandStructure, function(commandStructureElement) {
					if (currentWidgetStructureElement.field === commandStructureElement.field) {
						return true;
					}
				});
				
				//If match between command structure and current widget structure we should indicate column
				//is selected by putting in target side
				if (match) {
					var option = dojo.doc.createElement("option"); 
					option.value = currentWidgetStructureElement.field;
					option.innerHTML = currentWidgetStructureElement.name;
					this.targetColumnSelect.containerNode.appendChild(option);
				}
			}.bind(this));
		}
		
		//Save input values for later use in determining whether our data is "dirty"
		this._saveSelectedOptions();
		
		//Mark populated
		this._isPopulated = true;
	},
	
	isPopulated: function() {
		return this._isPopulated;
	},
	
	getSelectedColumnIds: function() {
		//Calculate selected column ids based on options in the target select list
		var selectedColumnOptions = this._getOptions(this.targetColumnSelect);
		var selectedColumnIds = dojo.map(
				selectedColumnOptions, function(option) {
					return option.value;
				});
		
		//Save input values for later use in determining whether our data is "dirty"
		this._saveSelectedOptions();
		
		//Return column ids
		return selectedColumnIds;
	},
	
	isDirty: function() {
		var newOptions = this._getOptions(this.targetColumnSelect);
		var dirty = false;
		if (this._oldSelectedOptions.length == newOptions.length) {
			count = 0;
			dojo.some(this._oldSelectedOptions, function(oldOption) {
				var newOption = newOptions[count];
				if (oldOption.value != newOption.value ||
						oldOption.innerHTML != newOption.innerHTML) {
						dirty = true;
				}
				count++;
			});
		} else {
			//Lengths don't match, so we know there's a mismatch
			dirty = true;
		}
		return dirty;
	},
	
	_saveSelectedOptions: function() {
		this._oldSelectedOptions = this._getOptions(this.targetColumnSelect);
	},
	
	_moveSourceColumns: function() {
		// move all the selected values from left (source) to right (target)
		this.targetColumnSelect.addSelected(dijit.byId(this.sourceColumnSelect));
	},
	
	_moveTargetColumns: function() {
		// move all the selected values from right (target) to left (source)
		this.sourceColumnSelect.addSelected(dijit.byId(this.targetColumnSelect));
	},
	
	_removeAllOptions: function(multiSelectList) {
		var optionElements = query("option", multiSelectList.containerNode);
		dojo.forEach(optionElements, function(option) {
			multiSelectList.containerNode.removeChild(option);
		}.bind(this));
	},
	
	_getOptions: function(multiSelectList) {
		var selectedColumnOptions = query("option",
				multiSelectList.containerNode);
		return selectedColumnOptions;
	},
	
	isValid: function() {
		var selectedColumnOptions = this._getOptions(this.targetColumnSelect);
		if (!selectedColumnOptions.length) {
			this._validationMessage = gridxNls.noColumnsSelected;
			return false;
		}
		this._validationMessage = null;
		return true;
	},
	
	getValidationMessage: function() {
		return this._validationMessage;
	}
});
});
