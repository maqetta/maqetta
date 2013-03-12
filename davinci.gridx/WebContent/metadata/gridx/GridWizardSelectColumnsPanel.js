define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/layout/ContentPane",
	"dijit/form/Button",
	"dijit/form/MultiSelect",
	"./GridWizardPanel",
	"dojo/query",
	"davinci/ve/widget",
	"dojo/i18n!./nls/gridx",
	"dojo/text!./templates/gridWizardSelectColumns.html"
], function(declare, 
		_WidgetBase, 
		_TemplatedMixin, 
		_WidgetsInTemplateMixin, 
		ContentPane, 
		Button, 
		MultiSelect, 
		GridWizardPanel,
		query, 
		Widget,
		gridxNls, 
		templateString) {

return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, GridWizardPanel], {

	templateString: templateString,

	postMixInProperties: function() {
		this.inherited(arguments);
		dojo.mixin(this, gridxNls);
	},

	postCreate: function() {
		
	},
	
	getStepLabel: function() {
		return gridxNls.selectColumnsHeader;
	},

	populate: function(widget, compoundCommand, ignoreCurrentWidgetStructure) {
		var currentWidgetData = widget.getData();
		var currentWidgetStructure = null;
		if (!ignoreCurrentWidgetStructure) {
			// Get structure directly from the widget rather than parse our of data-dojo-props found in
			// currentWidgetData
			currentWidgetStructure = widget.attr("structure");
		}
		
		// Clean out source and target lists
		this._removeAllOptions(this.sourceColumnSelect);
		this._removeAllOptions(this.targetColumnSelect);
		
		// Find the respective commands for creating the table and the store
		var tableCommand = null;
		var storeCommand = null;
		dojo.some(compoundCommand._commands, function(command) {
			if (command._properties && command._properties.structure) {
				tableCommand = command;
			} else if (command._data && command._data.type) {
				if (command._data.type === "dojo/data/ItemFileReadStore" || (command._data.type === "dojox/data/CsvStore")){
					storeCommand = command;
				}
			}
		});
		
		// If the existing data store is of a different type (e.g., ItemFileReadStore vs. CsvStore) than
		// the command store OR the existing data store's URL is different than the command's data store (e.g., 
		// pointing at a different JSON source), then we can assume we've shifted for a fundamentally different 
		// data store
		var dataStoreShift = false;
		if (currentWidgetData.properties.store.declaredClass != storeCommand._data.type.replace(/\//g,'.') ||
				currentWidgetData.properties.store.url != storeCommand._data.properties.url) {
			dataStoreShift = true;
		}
			// Will be using fundamentally the same data store, so create options in target list 
			// based on the current structure in place
			
		var props = tableCommand._properties;
		var commandStructure = props.structure;
		
		dojo.forEach(commandStructure, function(commandStructureElement) {
			var option = this._createOption(commandStructureElement);
			
			//See if the structure entry built for the command (built from proposed data store
			//modifications) matches anything in the currently set widget structure
			if (currentWidgetStructure && !dataStoreShift) {
				var match = dojo.some(currentWidgetStructure, function(currentWidgetStructureElement) {
					if (currentWidgetStructureElement.field === commandStructureElement.field) {
						return true;
					}
				});
				
				if (!match) {
					//Not selected in current widget structure, so add to source side
					dojo.place(option, this.sourceColumnSelect.containerNode);
				}
			} else {
				//We're ignoring current widget structure, so put in target side
				dojo.place(option, this.targetColumnSelect.containerNode);
			}
		}.bind(this));
		
		if (!dataStoreShift) {
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
						var option = this._createOption(currentWidgetStructureElement);
						dojo.place(option, this.targetColumnSelect.containerNode);
					}
				}.bind(this));
			}
		}
		
		//if nothing added to target side, let's assume brand new data source and select all by default
		var targetOptions = this._getOptions(this.targetColumnSelect);
		if (targetOptions.length == 0) {
			this.sourceColumnSelect.invertSelection(); //Select all
			this._moveSourceColumns();
			this.targetColumnSelect.invertSelection(); //De-select all
		}
		
		//Save input values for later use in determining whether our data is "dirty"
		this._saveTargetOptions();
		
		//Update button enablement
		this._updateButtonEnablement();
		
		//Call super
		this.inherited(arguments);
	},
	
	_createOption: function(commandStructureElement) {
		var option = dojo.doc.createElement("option"); 
		option.value = commandStructureElement.field;
		
		var label = commandStructureElement.name.trim();
		if (label != commandStructureElement.field) {
			//Let's augment the label with the field id
			label = dojo.replace(gridxNls.columnOptionLabel, [label, commandStructureElement.field]);
		}
		option.innerHTML = label;
		
		return option;
	},
	
	getTargetColumnIds: function() {
		//Calculate selected column ids based on options in the target select list
		var selectedColumnOptions = this._getOptions(this.targetColumnSelect);
		var selectedColumnIds = dojo.map(
				selectedColumnOptions, function(option) {
					return option.value;
				});
		
		//Save input values for later use in determining whether our data is "dirty"
		this._saveTargetOptions();
		
		//Return column ids
		return selectedColumnIds;
	},
	
	isDirty: function() {
		var newOptions = this._getOptions(this.targetColumnSelect);
		var dirty = false;
		if (this._oldSelectedOptions && this._oldSelectedOptions.length == newOptions.length) {
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
	
	_saveTargetOptions: function() {
		this._oldSelectedOptions = this._getOptions(this.targetColumnSelect);
	},
	
	_moveSourceColumns: function() {
		//deselect everything in target list before moving items into target list
		this._deselectAllOptions(this.targetColumnSelect);
		
		// move all the selected values from left (source) to right (target)
		this.targetColumnSelect.addSelected(dijit.byId(this.sourceColumnSelect));
		
		//Update button enablement
		this._updateButtonEnablement();
	},
	
	_moveTargetColumns: function() {
		//deselect everything in source list before moving items into source list
		this._deselectAllOptions(this.sourceColumnSelect);
		
		// move all the selected values from right (target) to left (source)
		this.sourceColumnSelect.addSelected(dijit.byId(this.targetColumnSelect));
		
		//Update button enablement
		this._updateButtonEnablement();
	},
	
	_moveTargetColumnUp: function() {
		var selectedIndices = this._getSelectedOptionIndices(this.targetColumnSelect);
		if (selectedIndices.length == 1) {
			var index = selectedIndices[0];
			if (index > 0) {
				var options = this._getOptions(this.targetColumnSelect);
				dojo.place(options[index], options[index - 1], "before");
			}
		}
		
		//Update button enablement
		this._updateButtonEnablement();
	},
	
	_moveTargetColumnDown: function() {
		var selectedIndices = this._getSelectedOptionIndices(this.targetColumnSelect);
		if (selectedIndices.length == 1) {
			var index = selectedIndices[0];
			var options = this._getOptions(this.targetColumnSelect);
			
			if (index < options.length - 1) {
				dojo.place(options[index], options[index + 1], "after");
			}
		}
		
		//Update button enablement
		this._updateButtonEnablement();
	},
	
	_removeAllOptions: function(multiSelectList) {
		var optionElements = this._getOptions(multiSelectList);
		dojo.forEach(optionElements, function(option) {
			dojo.destroy(option);
		}.bind(this));
	},
	
	_deselectAllOptions: function(multiSelectList) {
		var optionElements = this._getOptions(multiSelectList);
		dojo.forEach(optionElements, function(option) {
			option.selected = false;
		}.bind(this));
	},
	
	_sourceColumnSelectChange: function() {
		var selection = this._getSelectedOptions(this.sourceColumnSelect); 
		if (selection.length > 0) {
			this.moveToTargetButton.set("disabled", false);
		} else {
			this.moveToTargetButton.set("disabled", true);
		}
	},
	
	_targetColumnSelectChange: function() {
		var selection = this._getSelectedOptionIndices(this.targetColumnSelect); 
		if (selection.length == 0) {
			this.moveToSourceButton.set("disabled", true);
			this.moveTargetColumnUpButton.set("disabled", true);
			this.moveTargetColumnDownButton.set("disabled", true);
		} else if (selection.length == 1) {
			this.moveToSourceButton.set("disabled", false);
			
			var selectedIndex = selection[0];
			//Enable up button if not first element in list
			if (selectedIndex > 0) { 
				this.moveTargetColumnUpButton.set("disabled", false);
			} else {
				this.moveTargetColumnUpButton.set("disabled", true);
			}
			//Enable down button if not last element in list
			if (selectedIndex < this._getOptions(this.targetColumnSelect).length - 1) {
				this.moveTargetColumnDownButton.set("disabled", false);
			} else {
				this.moveTargetColumnDownButton.set("disabled", true);
			}
		} else { //> 1
			this.moveToSourceButton.set("disabled", false);
			this.moveTargetColumnUpButton.set("disabled", true);
			this.moveTargetColumnDownButton.set("disabled", true);
		}
	},
	
	_sourceColumnSelectDblClick: function() {
		this._moveSourceColumns();
	},
	
	_targetColumnSelectDblClick: function() {
		this._moveTargetColumns();
	},
	
	_getOptions: function(multiSelectList) {
		var selectedColumnOptions = query("option",
				multiSelectList.containerNode);
		return selectedColumnOptions;
	},
	
	_getSelectedOptions: function(multiSelectList) {
		var options = this._getOptions(multiSelectList);
		var selectedOptions = dojo.filter(
				options, function(option) {
					if (option.selected) {
						return option;
					}
				});
		
		//Return option
		return selectedOptions;
	},
	
	_getSelectedOptionIndices: function(multiSelectList) {
		var options = this._getOptions(multiSelectList);
		var selectedIndices = [];
		dojo.forEach(options, function(option, index) {
			if (option.selected) {
				selectedIndices.push(index);
			}
		});
		
		//Return indices
		return selectedIndices;
	},
	
	_updateButtonEnablement: function() {
		this._sourceColumnSelectChange();
		this._targetColumnSelectChange();
	},
	
	isValid: function() {
		var result = true;
		
		var selectedColumnOptions = this._getOptions(this.targetColumnSelect);
		if (!selectedColumnOptions.length) {
			result = gridxNls.noColumnsSelected;
		}
		return result;
	}
});
});
