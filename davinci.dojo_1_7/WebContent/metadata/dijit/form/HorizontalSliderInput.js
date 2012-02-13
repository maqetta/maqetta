define(
[
	"dojo/_base/declare", 
	"../layout/ContainerInput", 
	"dijit/layout/ContentPane",
	"dijit/layout/BorderContainer", 
	"dijit/layout/LayoutContainer",
	"dijit/form/HorizontalSlider", 
	"dijit/form/HorizontalRule", 
	"dijit/form/HorizontalRuleLabels",  
	"dojo/i18n!../nls/dijit", 
	"dojo/i18n!dijit/nls/common"
],
function(declare, ContainerInput, ContentPane, BorderContainer, LayoutContainer,
		HorizontalSlider, HorizontalRule, HorizontalRuleLabels, langObj, dijitLangObj) {

return declare(ContainerInput, {

	//Data structure to hold entries for (potentially) new children of the slider
	_sliderChildrenEntries: null,
	
	show: function(widgetId) {
		this._widget = davinci.ve.widget.byId(widgetId);
		if (!this._inline) {
			//Set up the dialog
			var dimensions = this._getDialogDimensions();
			var width = dimensions.width;
			var height = dimensions.height;
			this._inline = new dijit.Dialog({
				title: this._getDialogTitle(),
				style: "width: " + width + "px; height: + " + height + "px",
				"class": "sliderDialog"
			});
			this._inline.onCancel = dojo.hitch(this, "_cancel");
			this._inline.callBackObj = this;
			
			//Get template for dialog contents
			var s = this._getTemplate(width, height);
		
			//Set content
			this._inline.attr("content", s);
			this._inline.show();

			//Loop through slider children to find Rule and RuleLabel elements
			this._sliderChildrenEntries = [];
			var data = this._widget.getData();
			var children = data.children;
			for(var i=0; i<children.length; i++){
				var child = children[i];
				
				if (this._isValidChildType(child.type)) {
					var childData = {
						"type": child.type,
						"properties": dojo.clone(child.properties)
					};
					
					if (childData.properties.isTempID) {
						// delete temp id so it does not make its way out to the source
						// when we recreate the children
						delete data.properties.id; 
					}
					
					this._sliderChildrenEntries.push(childData);
				} else {
					console.log('WARNING. HorizontalSliderInput.js show(). Invalid child of slider: type = ' + child.type);
				}
			}
			
			//Configure listeners for OK/Cancel buttons
			var obj = dijit.byId('okButton');
			obj.onClick = dojo.hitch(this, "updateWidget");
			obj = dijit.byId('cancelButton');
			obj.onClick = dojo.hitch(this, "_cancel");
			if (this._widget.inLineEdit_displayOnCreate){
				// hide cancel on widget creation #120
				delete this._widget.inLineEdit_displayOnCreate;
				dojo.style(obj.domNode, "display", "none");
			}
			
			this._updateDialog();
		}
	},
	
	hide: function(cancel) {
		if (this._inline) {
			//Clean up connections
			var connection;
			while (connection = this._connection.pop()){
				dojo.disconnect(connection);
			}
			
			//Destroy dialog and widgets
			this._inline.destroyRecursive();
			delete this._inline;
		}
		this.inherited(arguments);
	},
	
	//Updates underlying slider with (potentially) new set of children
	updateWidget: function() {
		var data = this._widget.getData();

		//Commit changes by executing ModifyCommand
		if (data.properties.isTempID) {
			// delete temp id so it does not make its way out to the source
			delete data.properties.id; 
		}
		var command =
				new davinci.ve.commands.ModifyCommand(this._widget,
						data.properties, this._sliderChildrenEntries, this._widget._edit_context);
		this._widget._edit_context.getCommandStack().execute(command);
		this._widget = command.newWidget;
		// get the focus on the current node
		this._widget._edit_context._focuses[0]._selectedWidget = this._widget; 
		var context = this._widget.getContext();
		// redraw the box around the widget
		context.select(this._widget, null, false); 
	},
	
	_cancel: function(){
		this.hide(true);
	},
	
	_updateDialog: function() {
		var sliderInputChildRows = dojo.query('.sliderInputChildRow', this.domNode);
		// Destroy all existing rows except for the heading row (#0)
		for(var i=sliderInputChildRows.length-1; i>0; i--){
			var rowNode = sliderInputChildRows[i];
			var typeSelectNodes = dojo.query('.sliderTypeSelect', rowNode);
			var typeSelect = dijit.byNode(typeSelectNodes[0]);
			typeSelect.destroyRecursive();
			var containerSelectNodes = dojo.query('.sliderContainerSelect', rowNode);
			var containerSelect = dijit.byNode(containerSelectNodes[0]);
			containerSelect.destroyRecursive();
			dojo.destroy(rowNode);
		}

		// Create a TR for each entry in array and insert after heading row
		var headerNode = sliderInputChildRows[0];
		var headerParentNode = headerNode.parentNode;
		var headerNextSibling = headerNode.nextSibling;
		
		if (this._sliderChildrenEntries.length > 0) {
			for(var i=0; i<this._sliderChildrenEntries.length; i++){
				var child = this._sliderChildrenEntries[i];
				var newRuleOrLabel = dojo.create('tr',{'className':'sliderInputChildRow'});
				newRuleOrLabel.innerHTML = this._getRowTemplate();
				headerParentNode.insertBefore(newRuleOrLabel, headerNextSibling);
				dojo.parser.parse(newRuleOrLabel);
				
				var labelNodes = dojo.query('.sliderInputChildLabel', newRuleOrLabel);
				labelNodes[0].innerHTML = ' #' + (i+1) + ':';
				
				var typeSelectNodes = dojo.query('.sliderTypeSelect', newRuleOrLabel);
				var typeSelect = dijit.byNode(typeSelectNodes[0]);
				typeSelect.attr('value', this._getSelectValueAssociatedWithType(child.type));
				this._connection.push(dojo.connect(typeSelect, 'onChange', dojo.hitch(this,function(){
					this._updateDataStructureChildren();
					this._updatePreview();
				})));
				
				var containerSelectNodes = dojo.query('.sliderContainerSelect', newRuleOrLabel);
				var containerSelect = dijit.byNode(containerSelectNodes[0]);
				containerSelect.attr('value', this._getRuleOrLabelContainer(child));
				this._connection.push(dojo.connect(containerSelect, 'onChange', dojo.hitch(this,function(){
					this._updateDataStructureChildren();
					this._updatePreview();
				})));
				
				var plusNode = dojo.query('.sliderInputPlusButton', newRuleOrLabel)[0];
				var plusButton = dijit.byNode(plusNode);
				plusButton.attr('title', langObj.bgdAddStop);
				this._connection.push(dojo.connect(plusButton, 'onClick', dojo.hitch(this, function(rownum){
					var newRowData = this._createNewChildData(this._getWidgetTypeForRuleLabels());
					this._sliderChildrenEntries.splice(rownum+1, 0, newRowData);
					this._updateDialog();
				}, i)));
				
				var minusNode = dojo.query('.sliderInputMinusButton', newRuleOrLabel)[0];
				var minusButton = dijit.byNode(minusNode);
				minusButton.attr('title', langObj.bgdRemoveStop);
				this._connection.push(dojo.connect(minusButton, 'onClick', dojo.hitch(this, function(rownum){
					// Remove row <rownum>
					this._sliderChildrenEntries.splice(rownum, 1);
					this._updateDialog();
				}, i)));
			}
		} else {
			//There are no rules or labels defined
			var newNoChildrenRow = dojo.create('tr',{'className':'sliderInputChildRow'});
			newNoChildrenRow.innerHTML = this._getRowTemplate();
			headerParentNode.insertBefore(newNoChildrenRow, headerNextSibling);
			dojo.parser.parse(newNoChildrenRow);
			
			var labelNodes = dojo.query('.sliderInputChildLabel', newNoChildrenRow);
			labelNodes[0].innerHTML = '';
			
			var typeSelectNodes = dojo.query('.sliderTypeSelect', newNoChildrenRow);
			var typeSelect = dijit.byNode(typeSelectNodes[0]);
			typeSelect.attr('value', this._getSelectValueAssociatedWithType(this._getWidgetTypeForRuleLabels()));
			typeSelect.attr('disabled', 'disabled');
			
			var containerSelectNodes = dojo.query('.sliderContainerSelect', newNoChildrenRow);
			var containerSelect = dijit.byNode(containerSelectNodes[0]);
			containerSelect.attr('disabled', 'disabled');
			
			var plusNode = dojo.query('.sliderInputPlusButton', newNoChildrenRow)[0];
			var plusButton = dijit.byNode(plusNode);
			plusButton.attr('title', langObj.bgdAddStop);
			this._connection.push(dojo.connect(plusButton, 'onClick', dojo.hitch(this, function(rownum){
				var newRowData = this._createNewChildData(this._getWidgetTypeForRuleLabels());
				this._sliderChildrenEntries.splice(rownum+1, 0, newRowData);
				this._updateDialog();
			}, i)));
			
			var minusNode = dojo.query('.sliderInputMinusButton', newNoChildrenRow)[0];
			var minusButton = dijit.byNode(minusNode);
			minusButton.attr('disabled', 'disabled');
		}
		
		//Update the preview of the slider
		this._updatePreview();
	},
	
	_updatePreview: function(){
		var s = this._getPreviewContent();
		
        //Set the content
        var obj = dijit.byId('previewArea');
        obj.attr("content", s);		
	},
	
	_getPreviewContent: function(){
		//Construct template for slider based on dialog settings
		var s = '<div dojoType="' + this._getWidgetTypeForSlider() + '" style="' +
				this._getWidgetStyleForSlider() + '">'; 
		
		//Add child rules and labels
		for(var i=0; i<this._sliderChildrenEntries.length; i++){
			var sliderChild = this._sliderChildrenEntries[i];
			
			if (sliderChild.type === this._getWidgetTypeForRule()) {
				s += '   <div dojoType="' + this._getWidgetTypeForRule() + '"'; 
				if (sliderChild.properties.container) {
					s += '	container="' + sliderChild.properties.container + '"';
				}
				if (sliderChild.properties.count) {
					s += '	count="' + sliderChild.properties.count + '"';
				}
				if (sliderChild.properties.ruleStyle) {
					s += '	ruleStyle="' + sliderChild.properties.ruleStyle + '"';
				}
				if (sliderChild.properties.style) {
					s += '	style="' + sliderChild.properties.style + '"';
				}
				s += '	 ></div>';
			} else if (sliderChild.type === this._getWidgetTypeForRuleLabels()) {
				s += '  <ol dojoType="' + this._getWidgetTypeForRuleLabels() + '"';
				if (sliderChild.properties.container) {
					s += '	container="' + sliderChild.properties.container + '"';
				}
				if (sliderChild.properties.count) {
					s += '	count="' + sliderChild.properties.count + '"';
				}
				if (sliderChild.properties.ruleStyle) {
					s += '	ruleStyle="' + sliderChild.properties.ruleStyle + '"';
				}
				if (sliderChild.properties.labelStyle) {
					s += '	labelStyle="' + sliderChild.properties.labelStyle + '"';
				}
				if (sliderChild.properties.labels) {
					s += '	labels="' + sliderChild.properties.labels + '"';
				}
				if (sliderChild.properties.numericMargin) {
					s += '	numericMargin="' + sliderChild.properties.numericMargin + '"';
				}
				if (sliderChild.properties.minimum) {
					s += '	minimum="' + sliderChild.properties.minimum + '"';
				}
				if (sliderChild.properties.maximum) {
					s += '	maximum="' + sliderChild.properties.maximum + '"';
				}
				if (sliderChild.properties.constraints) {
					s += '	constraints="' + sliderChild.properties.constraints + '"';
				}
				if (sliderChild.properties.style) {
					s += '	style="' + sliderChild.properties.style + '"';
				}
				s += '	></ol>';
			}	
		}
		
		//End slider div
		s += '</div>';
		
        //Return content
		return s;
	},
	
	_getRuleOrLabelContainer: function(child) {
		return child.properties.container;
	},
	
	_isValidChildType: function(type) {
		return type === this._getWidgetTypeForRule() || this._getWidgetTypeForRuleLabels();
	},
	
	_getSelectValueAssociatedWithType: function(type) {
		var value = null;
		if (type === this._getWidgetTypeForRule()) {
			value = "rules";
		} else if (type === this._getWidgetTypeForRuleLabels()) {
			value = "labels";
		} else {
			console.log('WARNING. HorizontalSliderInput.js _getSelectValueAssociatedWithType(). Invalid child type for slider: type = ' + type);
		}
		return value;
	},
	
	_getTypeFromSelectValue: function(selectVal) {
		var value = null;
		if (selectVal === "rules") {
			value = this._getWidgetTypeForRule();
		} else if (selectVal === "labels") {
			value = this._getWidgetTypeForRuleLabels();
		} else {
			console.log('WARNING. HorizontalSliderInput.js _getTypeFromSelectValue(). Invalid combo box value: val = ' + selectVal);
		}
		return value;
	},
	
	_updateDataStructureChildren: function(){

		var sliderInputChildRows = dojo.query('.sliderInputChildRow', this.domNode);
		// Ignore the heading row (#0)
		for(var i=1; i<sliderInputChildRows.length; i++){
			var ruleOrLabelData = this._sliderChildrenEntries[i-1];
			
			var rowNode = sliderInputChildRows[i];
			var typeSelectNodes = dojo.query('.sliderTypeSelect', rowNode);
			var typeSelect = dijit.byNode(typeSelectNodes[0]);
			var containerSelectNodes = dojo.query('.sliderContainerSelect', rowNode);
			var containerSelect = dijit.byNode(containerSelectNodes[0]);
			
			//Get values from dijits on the row and put back into data structure
			var newType = this._getTypeFromSelectValue(typeSelect.attr('value'));
			if (newType != ruleOrLabelData.type) {
				//We've had a type change, so we need to update the style prop so dimensions are appropriate
				//for the child type. We'll do this by creating a dummy child of the 
				//new type and getting the style off of that.
				var dummyNewChild = this._createNewChildData(newType);
				ruleOrLabelData.properties.style = dummyNewChild.properties.style;
				
				if (newType === this._getWidgetTypeForRule()) {
					//We've switched from labels to rule, and many properties for
					//labels are not at all applicable to rules. So, let's remove them
					delete ruleOrLabelData.properties.labelStyle;
					delete ruleOrLabelData.properties.labels;
					delete ruleOrLabelData.properties.numericMargin;
					delete ruleOrLabelData.properties.minimum;
					delete ruleOrLabelData.properties.maximum;
					delete ruleOrLabelData.properties.constraints;
				}
			}
			ruleOrLabelData.type = newType;
			ruleOrLabelData.properties.container = containerSelect.attr('value');
		}
	},
	
	_createNewChildData: function(type) {
		var childData = {
			"type": type,
			"properties": this._getPropertiesForNewChildData(type)
		};
		return childData;
	},
	
	_getTemplate: function(width, height) {
		//Start of main div
		var s = '<div dojoType="dijit.layout.BorderContainer" design="headline" gutters="false" ';
		s += '		style="width: ' + width + 'px; height:' + (height - 20) + 'px" liveSplitters="false" id="borderContainer">';
		
		//Start styles
		s += '	<style type="text/css">';
		s += '		.sliderDialog .dijitDialogPaneContent {';
		s += '			padding:0px;';
		s += '		}';
		s += '		.sliderInputChildRow {';
		s += '			margin:0.3em 0em 1em 1em;';
		s += '		}';
		s += '		.sliderInputChildRow > table {';
		s += '			width:27em;';
		s += '		}';
		s += '		.sliderInputChildRow th {';
		s += '			text-align:center;';
		s += '			font-style:italic;';
		s += '		}';
		s += '		.sliderInputChildRow .dijitSelect {';
		s += '			margin:2;';
		s += '		}';
		s += '		.sliderInputDiv {';
		s += '			background-color:#d8d8d8;';
		s += '		}';
		s += '		div.sliderInputDiv, .sliderInputDiv td, .sliderInputDiv.sliderInputUrlSectionLabel {';
		s += '			padding:2px 5px;';
		s += '		}';
		s += '		.sliderInputCol1 {';
		s += '			width:10px;';
		s += '		}';
		s += '		.sliderInputPlusMinusButtons {';
		s += '			white-space:nowrap;';
		s += '			width:50px;';
		s += '		}';
		s += '		.sliderInputOptsLabel {';
		s += '			text-align:right;';
		s += '			padding-right: 6px;';
		s += '			white-space:nowrap;';
		s += '			width:1.4em';
		s += '		}';
		s += '		.sliderTypeSelect .dijitButtonText{';
		s += '			width:3em;';
		s += '			text-align:left;';
		s += '		}';
		s += '		.sliderContainerSelect .dijitButtonText{';
		s += '			width:9em;';
		s += '			text-align:left;';
		s += '		}';
		s += '		.sliderTypeSelect .dijitButtonText{';
		s += '			width:3em;';
		s += '			text-align:left;';
		s += '		}';
		
		//Make a style to facilite putting a transparent div over the preview to prevent user input
		s += '		.sliderPreviewDisablingDiv';
		s += '			{';
		// Do not display it on entry 
		s += '				display: block;';
		 
		//Display it on the layer with index 1001.
		//Make sure this is the highest z-index value
		//used by layers on that page.
		s += '			    z-index:1001;';
		     
		//make it cover the whole screen
		s += '				position: absolute;';
		s += ' 				top: 0%;';
		s += '				left: 0%;'; 
		s += '    			width: 100%;';
		s += '    			height: 100%;';
		 
		//make it white but fully transparent
		s += '    			background-color: white;';
		s += '    			opacity:.00;';
		s += '    			filter: alpha(opacity=00);'; 
		s += '}';
		
		//End of styles
		s += '	</style>';
		
		//Center region
		s += '	<div dojoType="dijit.layout.ContentPane" region="center">';

		s += '		<table width="100%">';
		s += '			<tr class="sliderInputDiv sliderInputChildrenLabel">';
		s += '				<td colspan="5">' + langObj.ruleAndLabelsHeader + '</td>';
		s += '			</tr>';
		s += '			<tr class="sliderInputChildRow">';
		s += '				<th></th>';
		s += '				<th></th>';
		s += '				<th>' + langObj.typeColHeader + '</th>';
		s += '				<th>' + langObj.containerColHeader + '</th>';
		s += '				<th></th>';
		s += '			</tr>';
		s += '			<!--  child rows for rules and rule labels added dynamically -->';
		s += '			<tr class="sliderInputBeforeOptionsLabel sliderInputOptionsLabelRow"></tr>';
		s += '		</table>';
        
        //end center region
        s += '	</div>';
		
        //Preview area -- "trailing" region
		s += '		<div dojoType="dijit.layout.ContentPane" style="width: 40%;" region="trailing" >';
		s += '			<table width="100%">';
		s += '				<tr class="sliderInputDiv sliderInputChildrenLabel">';
		s += '					<td>' + langObj.preview + '</td>';
		s += '				</tr>';
		s += '				<!--  child rows for rules and rule labels added dynamically -->';
		s += '				<tr>';
		s += '					<td>';
		s += '						<div class="sliderPreviewDisablingDiv" ></div>';
		s += '						<div dojoType="dijit.layout.ContentPane" id="previewArea">'; 
		s += '						</div>';
		s += '					</td>';
		s += '				</tr>';
		s += '			</table>';
        s += '		</div>';
        
        //OK/Cancel button area on bottom
		s += '	<div dojoType="dijit.layout.LayoutContainer" style="height: 4em;" region="bottom">';
		s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="left" style="width: 40%"></div>';
		s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="client" style="width: 100px">';
		s += '			<button dojoType="dijit.form.Button" type="button" id="okButton" > '+dijitLangObj.buttonOk+' </button>';
		s += '			<button dojoType="dijit.form.Button" type="button" id="cancelButton"> '+dijitLangObj.buttonCancel+' </button>';
		s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="right" style="width: 40%"></div>';
		s += '		</div>';
		s += '	</div>';

		//End outer div
		s += '</div>';
		
		//Return template
		return s;
	},
	
	_getRowTemplate: function() {
		//Data entry row template
		var rowTemplate 
					= "<tr class='sliderInputChildRow' style='display:none;'>";
		rowTemplate += "	<td class='sliderInputCol1'></td>";
		rowTemplate += "	<td class='sliderInputOptsLabel sliderInputChildLabel'>Template:</td>";
		rowTemplate += "	<td>";
		rowTemplate += "		<select class='sliderTypeSelect' dojoType='dijit.form.Select'>";
		rowTemplate += "			<option value=\"rules\">"+ langObj.rulesSelectEntry + "</option>";
		rowTemplate += "			<option value=\"labels\">"+ langObj.labelsSelectEntry + "</option>";
		rowTemplate += "		</select>";
		rowTemplate += "	</td>";
		rowTemplate += "	<td>";
		rowTemplate += "		<select class='sliderContainerSelect' dojoType='dijit.form.Select'>";
		
		var containerOptions = this._getContainerOptions();
		for(var i=0; i<containerOptions.length; i++){
			rowTemplate += "		<option value=\"" + containerOptions[i] + "\">" + containerOptions[i] + "</option>";
		}
		
		rowTemplate += "		</select>";
		rowTemplate += "	</td>";
		rowTemplate += "	<td class='sliderInputPlusMinusButtons'>";
		rowTemplate += "		<span class='sliderInputPlusButton' dojoType='dijit.form.Button'>+</span>";
		rowTemplate += "		<span class='sliderInputMinusButton' dojoType='dijit.form.Button'>-</span>";
		rowTemplate += "	</td>";
		rowTemplate += "</tr>";
			
		return rowTemplate;
	},
	
	/*************************************************************
	 * Functions subclass should override
	 *************************************************************/
	_getDialogTitle: function() {
		return langObj.horizontalSliderDialog;
	},
	
	_getDialogDimensions: function() {
		return { 
			"width": 550,
			"height": 250
		};
	},
	
	_getWidgetTypeForSlider: function() {
		return "dijit.form.HorizontalSlider";
	},
	
	_getWidgetStyleForSlider: function() {
		return "width: 200px;";
	},
	
	_getWidgetTypeForRule: function() {
		return "dijit.form.HorizontalRule";
	},
	
	_getWidgetTypeForRuleLabels: function() {
		return "dijit.form.HorizontalRuleLabels";
	},
	
	_getPropertiesForNewChildData: function(type) {
		var props = null;
		if (type === this._getWidgetTypeForRule()) {
			props = {
				"style": "height:5px;",
				"container": "bottomDecoration"
			};
		} else {
			props = {
				"container": "bottomDecoration",
				"style": "height:20px;"
			};
		}
		return props;
	},
	

	_getContainerOptions: function() {
		return [
			"bottomDecoration", "topDecoration"
		];
	}
});
});