define(
[
	"dojo/_base/declare", 
	"maq-metadata-dojo/dijit/layout/ContainerInput", 
	"davinci/ve/widget",
	"davinci/ui/Dialog",
	"./TableMatrix",
	"dojo/text!./templates/tableInput.html",
	"davinci/css!./templates/tableInput.css",
	"dojo/i18n!../nls/html", 
	"dojo/i18n!dijit/nls/common",
	"dijit/layout/ContentPane", //used in template
	"dijit/layout/BorderContainer", //used in template
	"dijit/layout/LayoutContainer", //used in template
	"dijit/form/Button",//used in template
	"dijit/form/NumberSpinner"//used in template
],
function(declare, 
		ContainerInput, 
		Widget,
		Dialog,
		TableMatrix,
		mainTemplateString,
		cssForTemplate,
		langObj, 
		dijitLangObj) {

return declare(ContainerInput, {

	_substitutedMainTemplate: null,
	
	show: function(widgetId) {
		this._widget = davinci.ve.widget.byId(widgetId);

		function _onSubmit() {
			if (this._isUserInputValid()) {
				this.updateWidget();
			}
		}

		this._inline = Dialog.showModal(this._getTemplate(), langObj.tableDialog, {width:700,	height:300}, dojo.hitch(this, _onSubmit)); 
			
		//Configure inputs
		this._configureInputControls();
		
		//Set-up preview area
		this._setupPreviewArea();

		//Configure listeners for Cancel button
		var cancelButton = dijit.byId('tableInputCancelButton');
		this._connection.push(dojo.connect(cancelButton, 'onClick', dojo.hitch(this,function(){
			this._inline.onCancel();
		})));
		if (this._widget.inLineEdit_displayOnCreate){
			// hide cancel on widget creation #120
			delete this._widget.inLineEdit_displayOnCreate;
			dojo.style(cancelButton.domNode, "display", "none");
		}
		
		this._updatePreview();
	},
	
	_configureInputControls: function() {
		//Get widget data
		var data = this._widget.getData();
		var properties = data.properties;
		
		//Create table matrix to facilitate calculation of #rows, #cols, etc.
		var matrix = TableMatrix(this._widget.domNode);
		
		//Number of rows
		var value = matrix.getNumRows();
		this._configureSpinner("tableInputNumRows", {min:1,max:1000,places:0}, value);

		//Number of cols
		value = matrix.getNumCols();;
		this._configureSpinner("tableInputNumCols", {min:1,max:100,places:0}, value);
		
		/* It turns out document.css messes up cellpadding/cellspacing on tables, so get rid of for now...
		//Cellspacing
		value = properties.cellspacing ? properties.cellspacing : 0;
		this._configureSpinner("tableInputCellspacing", {min:0,max:100,places:0}, value);
		
		//Cellpadding
		value = properties.cellpadding ? properties.cellpadding : 0;
		this._configureSpinner("tableInputCellpadding", {min:0,max:100,places:0}, value);
		*/
		
		//Border
		value = properties.border ? properties.border : 0;
		this._configureSpinner("tableInputBorder", {min:0,max:50,places:0}, value);
		
		//Border collapse
		value = this._getValueFromStyleStr(properties.style, "border-collapse");
		value = value ? value : dojo.style(this._widget.domNode, "border-collapse");
		var borderCollapseSelect = dijit.byId("tableInputBorderCollapse");
		borderCollapseSelect.set("value", value);
		this._connection.push(dojo.connect(
				borderCollapseSelect, "onChange", dojo.hitch(this, this._handleValueChange)));
		
		//Table layout
		value = this._getValueFromStyleStr(properties.style, "table-layout");
		value = value ? value : dojo.style(this._widget.domNode, "table-layout");
		var tableLayoutSelect = dijit.byId("tableInputTableLayout");
		tableLayoutSelect.set("value", value);
		this._connection.push(dojo.connect(
				tableLayoutSelect, "onChange", dojo.hitch(this, this._handleValueChange)));
		
		//First row header
		var firstRowHeaderCheckbox = dijit.byId("tableInputFirstRowHeader");
		firstRowHeaderCheckbox.set("value", matrix.isFirstRowHeader());
		this._connection.push(dojo.connect(
				firstRowHeaderCheckbox, "onChange", dojo.hitch(this, this._handleValueChange)));
		
		//Let's store away the initial values so we can be smarter about what we update on OK
		this._initialSettings = this._getUserInput();
	},
	
	_configureSpinner: function(spinnerId, constraints, value) {
		var spinner = dijit.byId(spinnerId);
		spinner.set("constraints", constraints);
		spinner.set("value", value);
		//can't use "onChange" to find out about user interactions with spinner buttons, so 
		//connect to "_setValueAttr" (even though would rather not)
		this._connection.push(dojo.connect(
				spinner, "_setValueAttr", dojo.hitch(this, this._handleValueChange)));
	},
	
	_handleValueChange: function() {
		this._updatePreview();
	},
	
	_setupPreviewArea: function() {
		var previewRegion = dijit.byId("tableInputPreviewRegion");
		previewRegionPadding = dojo.style(previewRegion.domNode, "padding");
		var desiredWidth = (dojo.style(previewRegion.domNode, "width") - previewRegionPadding*2) + "px";
		var desiredHeight = (dojo.style(previewRegion.domNode, "height") - previewRegionPadding*2 - 20) + "px";
		var previewArea = dijit.byId("tableInputPreviewArea");
		dojo.style(previewArea.domNode, "width", desiredWidth);
		dojo.style(previewArea.domNode, "height", desiredHeight);
	},
	
	hide: function(cancel) {
		if (this._inline) {
			//Clean up connections
			var connection;
			while (connection = this._connection.pop()){
				dojo.disconnect(connection);
			}			
		}
		this.inherited(arguments);
	},
	
	//Updates underlying HTML table with (potentially) new set of children
	updateWidget: function() {
		if (!this._isUserInputChanged(this._getUserInput())) {
			//If user didn't make any changes, no reason to do a modify event
			return;
		}

		var data = this._widget.getData();
		
		//Get the new settings specified by the user
		var userInput = this._getUserInput();
	
		//create new properties to be applied to the widget
		var styleStr = this._getUpdatedStyleStr(data.properties.style, "table-layout", userInput.tableLayout);
		styleStr = this._getUpdatedStyleStr(styleStr, "border-collapse", userInput.borderCollapse);
		var newTableProperties = {
			cellspacing: userInput.cellspacing,
			cellpadding: userInput.cellpadding,
			border: userInput.border,
			style: styleStr
		};
		
		//Figure out how the table's child elements need to be modified
		var newTableChildren = this._getNewTableChildren(data, userInput);
		var command =
				new davinci.ve.commands.ModifyCommand(this._widget,
						newTableProperties, newTableChildren, this._widget._edit_context);
		this._widget._edit_context.getCommandStack().execute(command);
		this._widget = command.newWidget;
		// get the focus on the current node
		this._widget._edit_context._focuses[0]._selectedWidget = this._widget; 
		var context = this._widget.getContext();
		// redraw the box around the widget
		context.select(this._widget, null, false); 
	},
	
	_getNewTableChildren: function(data, userInput) {
		var newChildren = [];
		
		var addedColgroup = false;
		dojo.forEach(data.children, function(child) {
			if (child.type == "html.colgroup") {
				newChildren.push(this._getNewColgroupData(child, userInput));
				addedColgroup = true;
			} else if (child.type == "html.tbody") {
				newChildren.push(this._getNewBodyData(child, userInput));
			/*
			} else if (child.type = "tr") { 
				NOTE: while it's not required for there to be a tbody, this case doesn't 
				seem to happen even if I remove <tbody> from source. There seems to be 
				an implicit <tbody> present in the widget tree.
			*/
			} else {
				// not a type we're currently doing special processing 
				// of (e.g., likely thead, etc.), so just push
				newChildren.push(dojo.clone(child));
			}
		}.bind(this));
		
		//If we never found a colgroup, let's create one for the user
		if (!addedColgroup) {
			var newColgroup = this._getNewColgroupData(TableMatrix.createTableColGroupData(), userInput);
			newChildren.unshift(newColgroup);
		}
		
		// clean up temp ids in child tree (since potentially doing a lot of cloning)
		this._cleanTempIds(newChildren);

		return newChildren;
	},
	
	_cleanTempIds: function(children) {
		dojo.forEach(children, function(child) {
			if (child.properties && child.properties.isTempID) {
				// delete temp id so it does not make its way out to the source
				delete child.properties.id; 
			}
			if (child.children) {
				//recurse
				this._cleanTempIds(child.children);
			}
		}.bind(this));
	},

	_getNewColgroupData: function(colgroup, userInput) {
		var newColgroupChildren = [];
		
		var numCols = userInput.numCols;
		var adjustedColCount = 0; //Need to take span on <col> into account
		dojo.forEach(colgroup.children, function(child) {
			if (child.type == "html.col") {
				if (adjustedColCount < numCols) {
					var span = child.properties.span;
					span = span ? Number(span) : 1;
					if (adjustedColCount + span > numCols) {
						span = adjustedColCount + span - numCols;
						child.properties.span = span.toString();
					}
					newColgroupChildren.push(dojo.clone(child));
					adjustedColCount += span;
				}
			} else {
				// not a type we're currently doing special processing for, so just push
				newColgroupChildren.push(dojo.clone(child));
			}
		}.bind(this));
		if (adjustedColCount < numCols) {
			//need to create some new <col> elements on the end
			for (var cols = adjustedColCount; cols < numCols; cols++) {
				var newCol = TableMatrix.createTableColData();
				newColgroupChildren.push(newCol);
			}
		}
		
		var newColgroupData = dojo.clone(colgroup);
		newColgroupData.children = newColgroupChildren;
		return newColgroupData;
	},

	_getNewBodyData: function(body, userInput) {
		var newBodyChildren = [];
		
		var numRows = userInput.numRows;
		var rowCount = 0; //Need to take span on <col> into account
		dojo.forEach(body.children, function(child) {
			if (child.type == "html.tr") {
				if (rowCount < numRows) {
					newBodyChildren.push(this._getNewRowData(child, userInput, (rowCount == 0)));
					rowCount++;
				}
			} else {
				// not a type we're currently doing special processing for, so just push
				newColgroupChildren.push(dojo.clone(child));
			}
		}.bind(this));
		if (rowCount < numRows) {
			for (var rows = rowCount; rows < numRows; rows++) {
				var isFirstRow = (rowCount == 0 && rows == 0);
				var newRow = this._getNewRowData(TableMatrix.createTableRowData(), userInput, isFirstRow);
				newBodyChildren.push(newRow);
			};
		}
		//Create tbody
		var newBodyData = dojo.clone(body);
		newBodyData.children = newBodyChildren;
		return newBodyData;
	},

	_getNewRowData: function(row, userInput, isFirstRow) {
		var newRowChildren = [];
		var numCols = userInput.numCols;
		var adjustedColCount = 0;
		dojo.forEach(row.children, function(child) {
			if (child.type == "html.td" || child.type=="html.th") {
				if (adjustedColCount < numCols) {
					var colspan = child.properties.colspan;
					colspan = colspan ? Number(colspan) : 1;
					if (adjustedColCount + colspan > numCols) {
						colspan = adjustedColCount + colspan - numCols;
						child.properties.colspan = colspan.toString();
					}
					
					//clone the cell
					var clonedChild = dojo.clone(child);
					
					//handle header row
					if (isFirstRow) {
						if (userInput.firstRowHeader) {
							clonedChild.type = "html.th";
							clonedChild.tagName = "th";
						} else {
							clonedChild.type = "html.td";
							clonedChild.tagName = "td";
						}
					}
					
					//push the new child to the list
					newRowChildren.push(clonedChild);
					
					//increment counter
					adjustedColCount += colspan;
				}
			} else {
				// not a type we're currently doing special processing for, so just push
				newColgroupChildren.push(dojo.clone(child));
			}
		}.bind(this));
		if (adjustedColCount < numCols) {
			//need to create some new <th> or <th> elements on the end of the row
			for (var cols = adjustedColCount; cols < numCols; cols++) {
				var newElement = null;
				if (isFirstRow && userInput.firstRowHeader) {
					newElement = TableMatrix.createTableHeaderData();
				} else {
					newElement = TableMatrix.createTableCellData();
				}
				newRowChildren.push(newElement);
			}
		}
		
		var newRowData = dojo.clone(row);
		newRowData.children = newRowChildren;
		return newRowData;
	},
	
	_getUpdatedStyleStr: function(styleString, attrName, attrValue) {
		var styleArray = Widget.parseStyleValues(styleString);
		Widget.setStyleProperty(styleArray, attrName, attrValue);
		return Widget.getStyleString(styleArray);
	},

	_getValueFromStyleStr: function(styleString, attrName) {
		var styleArray = Widget.parseStyleValues(styleString);
		var value = Widget.retrieveStyleProperty(styleArray, attrName);
		return value;
	},
	
	_getUserInput: function() {
		return {
			numRows: dijit.byId("tableInputNumRows").get("value"),
			numCols: dijit.byId("tableInputNumCols").get("value"),
			/* It turns out document.css messes up cellpadding/cellspacing on tables, so get rid of for now...
			cellspacing: dijit.byId("tableInputCellspacing").get("value"),
			cellpadding: dijit.byId("tableInputCellpadding").get("value"),
			*/
			border: dijit.byId("tableInputBorder").get("value"),
			borderCollapse: dijit.byId("tableInputBorderCollapse").get("value"),
			tableLayout: dijit.byId("tableInputTableLayout").get("value"),
			firstRowHeader: dijit.byId("tableInputFirstRowHeader").get("value")
		};
	},
	
	_isUserInputChanged: function(newInput) {
		return this._initialSettings.numRows != newInput.numRows ||
			this._initialSettings.numCols != newInput.numCols ||
			/* It turns out document.css messes up cellpadding/cellspacing on tables, so get rid of for now...
			this._initialSettings.cellspacing != newInput.cellspacing ||
			this._initialSettings.cellpadding != newInput.cellpadding ||
			*/
			this._initialSettings.border != newInput.border ||
			this._initialSettings.borderCollapse != newInput.borderCollapse ||
			this._initialSettings.tableLayout != newInput.tableLayout ||
			this._initialSettings.firstRowHeader != newInput.firstRowHeader;
	},
	
	_isUserInputValid: function() {
		return dijit.byId("tableInputNumRows").isValid() &&
			dijit.byId("tableInputNumCols").isValid() &&
			/* It turns out document.css messes up cellpadding/cellspacing on tables, so get rid of for now...
			dijit.byId("tableInputCellspacing").isValid() &&
			dijit.byId("tableInputCellpadding").isValid() &&
			*/
			dijit.byId("tableInputBorder").isValid();
	},
	
	_updatePreview: function(){
		if (!this._isUserInputValid()) {
			return;
		}
		
		var s = this._getPreviewContent();
		
        //Set the content
        var obj = dijit.byId('tableInputPreviewArea');
        obj.set("content", s);		
	},
	
	_getPreviewContent: function(){
		//Clean-up if previously generated a preview
		if (this.previewTable) {
			dojo.destroy(this.previewTable);
			this.previewTable = null;
		}
		
		var userInput = this._getUserInput();
		
		//Create table
		var table = this.previewTable = dojo.doc.createElement("table");
		/* It turns out document.css messes up cellpadding/cellspacing on tables, so get rid of for now...
		dojo.attr(table, "cellspacing", userInput.cellspacing);
		dojo.attr(table, "cellpadding", userInput.cellpadding);
		*/
		dojo.attr(table, "border", userInput.border);
		dojo.style(table, "border-collapse", userInput.borderCollapse);
		dojo.style(table, "table-layout", userInput.tableLayout);
		dojo.style(table, "width", "100%");
		dojo.addClass(table, "tableElementPreview");

		var tbody = dojo.doc.createElement("tbody");
		table.appendChild(tbody);
		
		var numRows = userInput.numRows;
		var numCols = userInput.numCols;
		for (var rows = 0; rows < numRows; rows++) {
			var row = dojo.doc.createElement("tr");
			for (var cols = 0; cols < numCols; cols++) {
				var cell = null;
				if (rows == 0 && userInput.firstRowHeader) {
					cell = dojo.doc.createElement("th");
					//Try to mark header row without compromising the preview too much
					cell.innerHTML = "TH"; 
				} else {
					cell = dojo.doc.createElement("td");
					cell.innerHTML  = "&nbsp;";
				}
				dojo.addClass(cell, "tableElementPreview");
				row.appendChild(cell);
			}
			tbody.appendChild(row);
		}
		
		return table;
	},
	
	_getTemplate: function(width, height) {
		if (!this._substitutedMainTemplate) {
			this._substitutedMainTemplate = 
				dojo.replace(mainTemplateString, {
					propertiesHeader: langObj.propertiesHeader,
					numRows: langObj.numRows,
					numCols: langObj.numCols,
					/* It turns out document.css messes up cellpadding/cellspacing on tables, so get rid of for now...
					cellspacing: langObj.cellspacing,
					cellpadding: langObj.cellpadding,
					*/
					border: langObj.border,
					borderCollapse: langObj.borderCollapse,
					tableLayout: langObj.tableLayout,
					firstRowHeader: langObj.firstRowHeader,
					preview: langObj.preview,
					buttonOk: dijitLangObj.buttonOk,
					buttonCancel: dijitLangObj.buttonCancel
				});
		}
			
		return this._substitutedMainTemplate;
	},

	resize: function() {
		dijit.byId("tableInputBorderContainer").resize();
	}
});
});