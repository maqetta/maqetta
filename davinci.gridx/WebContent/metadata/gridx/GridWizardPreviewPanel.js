define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/layout/ContentPane",
	"dijit/layout/BorderContainer",
	"dijit/form/TextBox",
	"dijit/form/ValidationTextBox",
	"dijit/form/Button",
	"dojo/data/ItemFileReadStore",
	"./GridWizardPanel",
	"gridx/Grid",
	"gridx/core/model/cache/Async",
    "gridx/modules/extendedSelect/Column",
    "gridx/modules/move/Column",
    "gridx/modules/dnd/Column",
    "gridx/modules/ColumnResizer",
	"davinci/css!gridx/resources/claro/Gridx.css",
	"davinci/css!gridx/resources/claro/Gridx_rtl.css",
	"dojo/i18n!./nls/gridx",
	"dojo/text!./templates/gridWizardPreview.html"
], function(
	declare,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	ContentPane,
	BorderContainer,
	TextBox,
	ValidationTextBox,
	Button,
	ItemFileReadStore,
	GridWizardPanel,
	Grid,
	Cache,
	SelectColumn,
	MoveColumn,
	DndColumn,
	ColumnResizer,
	GridXCSS,
	GridXRTL,
	gridxNls,
	templateString
) {

return declare([ContentPane, GridWizardPanel], {
	postMixInProperties: function() {
		this.inherited(arguments);
	},
	
	postCreate: function() {
		//Create data structure to keep track of connections
		this._connections = [];
		
		templateString = dojo.replace(templateString, {
			preview: gridxNls.preview,
			previewNote: gridxNls.previewNote,
			columnProperties: gridxNls.columnProperties,
			_widthRegExp: "^(auto)$|^([0-9]|([0-9]+[\\.]?([0-9]+)))(px|em|%|ex|in|cm|mm|pt|pc)$",
			invalidWidth: gridxNls.invalidWidth,
			fieldLabel: gridxNls.fieldLabel,
			labelLabel: gridxNls.labelLabel,
			widthLabel: gridxNls.widthLabel,
			resetAllWidths: gridxNls.resetAllWidths
		});
		this.set("content", templateString);
	},
	
	getStepLabel: function() {
		return gridxNls.configureColumnsHeader;
	},
	
	populate: function(widget, compoundCommand, selectedStructureFieldNames, gridInput) {
		//Reset flags
		this._columnWidthChangedSinceLastPopulate = false;
		this._gridBeenSized = false;
		
		//Reset the column props area
		this._clearColumnProperties();
		
		//Clean-up old grid since we'll be recreating it
		if (this._grid) {
			this._grid.destroyRecursive();
		}
		
		this._widget = widget;
		this._selectedStructureFieldNames = selectedStructureFieldNames;
		
		//Get data from the command
		var dataStoreProps = null;
		dojo.some(compoundCommand._commands, function(command) {
			if (command._data && command._data.properties) {
				dataStoreProps = command._data.properties;
				return true;
			}
		});

		//If URL-based data store, reuse the one from GridInput
		if (dataStoreProps.url && dataStoreProps.url != "") {
			this._gridStore = gridInput._urlDataStore;
		} else {
			//Create data store...
			this._gridStore = new ItemFileReadStore(dataStoreProps);
		}

		//Get table command
		var tableCommand = null;
		dojo.some(compoundCommand._commands, function(command) {
			if (command._properties && command._properties.structure) {
				tableCommand = command;
				return true;
			}
		});
		var tableProps = tableCommand._properties;
		var tableStructure = tableProps.structure;
		
		//Build table structure for the grid from the selected column ids
		var baseStructure = tableStructure;
		var previewStructure = [];
		dojo.forEach(selectedStructureFieldNames, function(selectedFieldName) {
			dojo.some(baseStructure, function(baseColumn) {
				if (baseColumn.field === selectedFieldName) {
					var previewColumn = dojo.mixin({}, baseColumn);
					delete previewColumn.id;
					previewColumn.name = previewColumn.name.trim();
					previewStructure.push(previewColumn);
					return true;
				}
			});
		});
		
		//Create preview grid
		var grid = this._grid = new Grid({
			cacheClass: Cache,
			//cacheSize: 0,
			store: this._gridStore,
			structure: previewStructure,
			modules:[
		         SelectColumn,
		         MoveColumn,
		         DndColumn,
		         ColumnResizer 
			],
		});
		
		//Fill the grid preview area with the grid
		var previewPanelGridContentPane = dijit.byId("previewPanelGridContentPane");
		
		// Set the size of the grid's immediate parent container to be the same
		// size as the grid is in the VE so user gets a true preview.
		var desiredWidth = dojo.style(this._widget.dijitWidget.domNode, "width") + "px";
		var desiredHeight = dojo.style(this._widget.dijitWidget.domNode, "height") + "px";
		dojo.style(previewPanelGridContentPane.domNode, "width", desiredWidth);
		dojo.style(previewPanelGridContentPane.domNode, "height", desiredHeight);
		previewPanelGridContentPane.set("content", grid);

		// Listen for resize, so we can cause the grid to lay itself out when it has dimensions. Otherwise,
		// GridX doesn't layout columns non-pixel width settings (like "auto" and percentage) very well
		this._connections.push(dojo.connect(
				grid, "resize", dojo.hitch(this, function(size) {
					if (!this._gridBeenSized) {
						this._grid.setColumns(this._grid.structure);
						this._gridBeenSized = true;
					}
				})));
		
		//Listen for column selection changes
		this._connections.push(dojo.connect(
				grid.select.column, "onSelectionChange", dojo.hitch(this, this._handleColumnSelectionChange)));
		
		//Listen for column resizes
		this._connections.push(dojo.connect(
				grid.columnResizer, "onResize", dojo.hitch(this, this._handleColumnResized)));
		
		//Listen for changes to the input fields in the column props sections
		var gridWizardPreviewLabelInput = dijit.byId("gridWizardPreviewLabelInput");
		this._connections.push(dojo.connect(
				gridWizardPreviewLabelInput, "onBlur", dojo.hitch(this, this._handleLabelInputChanged)));
		
		var gridWizardPreviewWidthInput = dijit.byId("gridWizardPreviewWidthInput");
		this._connections.push(dojo.connect(
				gridWizardPreviewWidthInput, "onBlur", dojo.hitch(this, this._handleWidthInputChanged)));
		
		//Listen for "Reset All" button click
		var gridWizardPreviewResetAllButton = dijit.byId("gridWizardPreviewResetAllButton");
		this._connections.push(dojo.connect(
				gridWizardPreviewResetAllButton, "onClick", dojo.hitch(this, this._handleResetAllWidths)));
		
		//Call super
		this.inherited(arguments);
	},

	isValid: function() {
		var result = true;
		var gridWizardPreviewWidthInput = dijit.byId("gridWizardPreviewWidthInput");
		if (!gridWizardPreviewWidthInput.get("disabled")) { //Make sure field enabled
			if (!gridWizardPreviewWidthInput.isValid()) {
				result = gridWizardPreviewWidthInput.invalidMessage;
			}
		}
		return result;
	},

	getUpdatedColumnStructure: function() {
		var newStructure = [];
		
		// Build new structure by looping over columns in GridX (since we know
		// columns from GridX are in the right order if user has dragged any
		// around)
		var gridColumns = this._grid.columns();
		var areAllRelativeWidth = this._allWidthsRelative(this._grid.structure);
		dojo.forEach(gridColumns, function(gridColumn) {
			//Get info for column in question
			var previewStructureElement = this._getPreviewStructureElement(gridColumn.id);
			
			var newStructureElement = dojo.mixin({}, previewStructureElement);
			if (this._columnWidthChangedSinceLastPopulate && !areAllRelativeWidth) {
				//GridX always gives width values in terms of "NNNpx", but if
				//user hasn't changed any widths, we want to keep "auto", "50%", etc.
				//rather than convert to pixels. So, only replace with GridX-provided
				//pixel values if user has actually changed a width val AND they
				//didn't change them all to relative values.
				newStructureElement.width = gridColumn.width;
			}
			
			newStructure.push(newStructureElement);
		}.bind(this));
		
		return newStructure;
	},
	
	// See if all of the widths in the structure are relative (e.g.,
	// either "auto" or expressed as a percentage.
	_allWidthsRelative: function(structure) {
		var allRelative = true;
		dojo.some(structure, function(structureElement) {
			var width = structureElement.width;
			if (!(width == "auto" || width.indexOf("%") > 0)) {
				allRelative = false;
				return true;
			}
		});
		return allRelative;
	},
	
	_getGridColumn: function(gridColumnId) {
		var returnColumn = null;
		var columns = this._grid.columns();
		dojo.some(columns, function(column) {
			if (column.id == gridColumnId) {
				returnColumn = column;
				return true;
			}
		});
		return returnColumn;
	},
	
	//When we communicated with GridX we do so with the internal
	//column id that GridX maintains rather than field name, so doing
	//a mapping between the two name spaces.
	_getGridIdFromFieldName: function(selectedFieldName) {
		var gridId = null;
		
		//Loop through to find match
		var columns = this._grid.columns();
		dojo.some(columns, function(column) {
			if (column.field() == selectedFieldName) {
				gridId = column.id;
				return true;
			}
		});

		return gridId;
	},
	
	_getPreviewStructureElement: function(gridColumnId) {
		var gridColumn = this._getGridColumn(gridColumnId);
		var structureFieldName = gridColumn.field();
		var foundStructureElement = null;
		dojo.some(this._grid.structure, function(structureElement) {
			if (structureElement.field == structureFieldName) {
				foundStructureElement = structureElement;
				return true;
			}
		}.bind(this));
		
		return foundStructureElement;
	},
	
	_getStructureOrderedBasedOnGrid: function() {
		var newStructure = [];
		
		var gridColumns = this._grid.columns();
		dojo.forEach(gridColumns, function(gridColumn) {
			//Get info for column in question
			var previewStructureElement = this._getPreviewStructureElement(gridColumn.id);
			newStructure.push(previewStructureElement);
		}.bind(this));

		return newStructure;
	},
	
	_setGridStructure: function(newStructure) {
		//Find the field name for the currently selected column
		var selectedFieldName = null;
		if (this._selectedGridColumnId) {
			var selectedColumn = this._getPreviewStructureElement(this._selectedGridColumnId);
			selectedFieldName = selectedColumn.field;
		}
		
		//It's possible user has dragged columns around
		var orderedStructure = this._getStructureOrderedBasedOnGrid(newStructure);
		
		//Set the ordered structure
		this._grid.setColumns(orderedStructure);
		
		// selected id may be different within grid (particular if column order has changed in the
		// structure), so let's find the new one
		if (selectedFieldName) {
			this._selectedGridColumnId = this._getGridIdFromFieldName(selectedFieldName);
		}
		
		//the grid's highlighting gets turned off when setColumns runs, so make sure the
		//previously selected column is still highlighted
		if (this._selectedGridColumnId) {
			this._selectGridColumn(this._selectedGridColumnId);
		}
	},
	
	_handleColumnSelectionChange: function(selectedColumn) {
		//We want to prevent infinite selection changes in the invalid data case
		if (this._ignoreSelectionChange) {
			return;
		}
		
		// We don't want to allow column selection change if they've entered bad data for currently
		// selected column, so re-select the previous column and abort
		if (this._selectedGridColumnId && !this._checkValidity()) {
			setTimeout(function() {
				this._ignoreSelectionChange = true;
				this._selectGridColumn(this._selectedGridColumnId);
				this._ignoreSelectionChange = false;
			}.bind(this), 0);
			return;
		}
		
		if (selectedColumn.length == 1) {
			//Keep track of what column was selected
			var selectedGridColumnId = this._selectedGridColumnId = selectedColumn[0];
			
			//Get info for column in question
			var previewStructureElement = this._getPreviewStructureElement(selectedGridColumnId);
			
			//Fill in column props
			this._populateColumnProperties(previewStructureElement);
		} else {
			//Either nothing is selected or multiple items are selected, so...
			
			//Clear our record of what was selected
			this._selectedGridColumnId = null;
			
			//Reset the column props area
			this._clearColumnProperties();
		}
	},
	
	_clearColumnProperties: function() {
		//Get references to the column property fields
		var gridWizardPreviewFieldOutput = dojo.byId("gridWizardPreviewFieldOutput");
		var gridWizardPreviewLabelInput = dijit.byId("gridWizardPreviewLabelInput");
		var gridWizardPreviewWidthInput = dijit.byId("gridWizardPreviewWidthInput");
		
		//Clear and disable property fields
		gridWizardPreviewFieldOutput.innerHTML = "";
		
		gridWizardPreviewLabelInput.set("value", "");
		gridWizardPreviewLabelInput.set("disabled", true);
		
		gridWizardPreviewWidthInput.set("value", "");
		gridWizardPreviewWidthInput.set("disabled", true);
	},
	
	_populateColumnProperties: function(structureElement) {
		//Get references to the column property fields
		var gridWizardPreviewFieldOutput = dojo.byId("gridWizardPreviewFieldOutput");
		var gridWizardPreviewLabelInput = dijit.byId("gridWizardPreviewLabelInput");
		var gridWizardPreviewWidthInput = dijit.byId("gridWizardPreviewWidthInput");

		//Fill and enable property fields
		gridWizardPreviewFieldOutput.innerHTML = structureElement.field;
		
		gridWizardPreviewLabelInput.set("value", structureElement.name);
		gridWizardPreviewLabelInput.set("disabled", false);
		
		gridWizardPreviewWidthInput.set("value", structureElement.width);
		gridWizardPreviewWidthInput.set("disabled", false);
	},

	_handleColumnResized: function(colId, width, oldWidth) {
		//We want to prevent infinite resizes in the invalid data case
		if (this._ignoreResize) {
			return;
		}
		
		if (colId != this._selectedGridColumnId) {
			// We don't want to allow manual column resizes on other columns if
			// they've entered bad data for currently selected column, so re-size
			// the new column and abort
			if (this._selectedGridColumnId && !this._checkValidity()) {
				setTimeout(function() {
					this._ignoreResize = true;
					this._grid.columnResizer.setWidth(colId, oldWidth);
					this._ignoreResize = false;
				}.bind(this), 0);
				return;
			} else {
				//Let's select the column being resized
				this._selectGridColumn(colId);
			}
		}
		
		//Update text box with new width
		var widthStr = width + "px";
		var gridWizardPreviewWidthInput = dijit.byId("gridWizardPreviewWidthInput");
		gridWizardPreviewWidthInput.set("value", widthStr);
		
		//Let's also update our model (e.g., table structure)
		var currentPreviewStructureElement = this._getPreviewStructureElement(this._selectedGridColumnId);
		currentPreviewStructureElement.width = widthStr;
		
		//Remember widths have changed
		this._columnWidthChangedSinceLastPopulate = true;
	},
	
	_handleLabelInputChanged: function(inputValue) {
		//Get the value from the field
		var gridWizardPreviewLabelInput = dijit.byId("gridWizardPreviewLabelInput");
		inputValue = gridWizardPreviewLabelInput.get("value");
		
		//Update the table structure and tell the grid to rebuild the columns
		var currentPreviewStructure = this._grid.structure;
		var currentPreviewStructureElement = this._getPreviewStructureElement(this._selectedGridColumnId);
		
		//If input value is different than structure value, then let's update the
		//structure.
		if (inputValue != currentPreviewStructureElement.name) {
			currentPreviewStructureElement.name = inputValue;
			this._setGridStructure(currentPreviewStructure);
		}
	},
	
	_handleWidthInputChanged: function() {
		//Get the value from the field
		var gridWizardPreviewWidthInput = dijit.byId("gridWizardPreviewWidthInput");
		var inputValue = gridWizardPreviewWidthInput.get("value");
		
		// We don't want to put bad width into the data model. You wouldn't normally want to
		// do this anyway, but gridx columns go to size 0 when bad width specified. So, it's doubly
		// bad in that you wouldn't be able to re-select the column in the preview to fix
		// the issue.
		if (!this._checkValidity()) {
			return;
		}
		
		//Update the table structure and tell the grid to rebuild the columns
		var currentPreviewStructure = this._grid.structure;
		var currentPreviewStructureElement = this._getPreviewStructureElement(this._selectedGridColumnId);
		
		// If input value is different than structure value, then let's
		// update the structure.
		if (inputValue != currentPreviewStructureElement.width) {
			currentPreviewStructureElement.width = inputValue;
			this._setGridStructure(currentPreviewStructure);

			//Remember we've modified column values
			this._columnWidthChangedSinceLastPopulate = true;
		}
	},
	
	_handleResetAllWidths: function() {
		//Reset flag for whether column widths have changed since all pixel values will be gone
		this._columnWidthChangedSinceLastPopulate = false;
		
		//Update the table structure and tell the grid to rebuild the columns
		var currentPreviewStructure = this._grid.structure;
		dojo.forEach(currentPreviewStructure, function(currentPreviewStructureElement) {
			currentPreviewStructureElement.width = "auto";
		});
		this._setGridStructure(currentPreviewStructure);
		
		//Update text field of selected item
		if (this._selectedGridColumnId) {
			var gridWizardPreviewWidthInput = dijit.byId("gridWizardPreviewWidthInput");
			gridWizardPreviewWidthInput.set("value", "auto");
		}
	},
	
	_selectGridColumn: function(gridColumnId) {
		//Clear current selection
		this._grid.select.column.clear();
		
		//Select the column
		this._grid.select.column.selectById(gridColumnId);
	},
	
	destroy: function() {
		//Call superclass
		this.inherited(arguments);
		
		//Clean up connections
		this._connections.forEach(dojo.disconnect);
		delete this._connections;
	}
});
});