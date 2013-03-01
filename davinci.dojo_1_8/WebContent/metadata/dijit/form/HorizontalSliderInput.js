define(
[
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"../layout/ContainerInput", 
	"dijit/layout/ContentPane",
	"dijit/layout/BorderContainer", 
	"dijit/layout/LayoutContainer",
	"dijit/form/HorizontalSlider", 
	"dijit/form/HorizontalRule", 
	"dijit/form/HorizontalRuleLabels", 
	"davinci/Workbench",
	"dojo/text!./templates/horizontalSliderInput.html",
	"dojo/text!./templates/horizontalSliderInputRowTemplate.html",
	"davinci/css!./templates/horizontalSliderInput.css",
	"dojo/i18n!../nls/dijit", 
	"dojo/i18n!dijit/nls/common"
],
function(declare, 
		_WidgetBase,
		_TemplatedMixin,
		_WidgetsInTemplateMixin,
		ContainerInput, 
		ContentPane, 
		BorderContainer, 
		LayoutContainer,
		HorizontalSlider, 
		HorizontalRule, 
		HorizontalRuleLabels, 
		Workbench,
		mainTemplateString,
		rowTemplate,
		cssForTemplate,
		langObj, 
		dijitLangObj) {

var ContinerInputWidget = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: mainTemplateString,

	langObj: langObj,
	dijitLangObj: dijitLangObj,

	postCreate: function() {
		if (this.widget.inLineEdit_displayOnCreate) {
			// hide cancel on widget creation #120
			delete this.widget.inLineEdit_displayOnCreate;
			dojo.style(this.cancelButton.domNode, "display", "none");
		}
	},

	resize: function(coords) {
		this.borderContainer.resize();
	},

	_onCancel: function() {
		this.onClose();
	}
});

return declare(ContainerInput, {

	//Data structure to hold entries for (potentially) new children of the slider
	_sliderChildrenEntries: null,
	
	_substitutedRowTemplate: null,
	
	_substitutedMainTemplate: null,
	
	show: function(widgetId) {
		this._widget = davinci.ve.widget.byId(widgetId);
		//Set up the dialog
		var dimensions = this._getDialogDimensions();
		var width = dimensions.width;
		var height = dimensions.height;

		var s = this._getTemplate(width, height);

		function _onOK() {
			this.updateWidget();
		}

		this.contentWidget = new ContinerInputWidget({widget: this._widget});
		this._inline = Workbench.showModal(this.contentWidget, this._getDialogTitle(), {width: width, height: height}, dojo.hitch(this, _onOK));

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
					delete childData.properties.id; 
				}
				
				this._sliderChildrenEntries.push(childData);
			} else {
				console.log('WARNING. HorizontalSliderInput.js show(). Invalid child of slider: type = ' + child.type);
			}
		}
		
		this._updateDialog();
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
				typeSelect.set('value', this._getSelectValueAssociatedWithType(child.type));
				this._connection.push(dojo.connect(typeSelect, 'onChange', dojo.hitch(this,function(){
					this._updateDataStructureChildren();
					this._updatePreview();
				})));
				
				var containerSelectNodes = dojo.query('.sliderContainerSelect', newRuleOrLabel);
				var containerSelect = dijit.byNode(containerSelectNodes[0]);
				containerSelect.set('value', this._getRuleOrLabelContainer(child));
				this._connection.push(dojo.connect(containerSelect, 'onChange', dojo.hitch(this,function(){
					this._updateDataStructureChildren();
					this._updatePreview();
				})));
				
				var plusNode = dojo.query('.sliderInputPlusButton', newRuleOrLabel)[0];
				var plusButton = dijit.byNode(plusNode);
				plusButton.set('title', langObj.bgdAddStop);
				this._connection.push(dojo.connect(plusButton, 'onClick', dojo.hitch(this, function(rownum){
					var newRowData = this._createNewChildData(this._getWidgetTypeForRuleLabels());
					this._sliderChildrenEntries.splice(rownum+1, 0, newRowData);
					this._updateDialog();
				}, i)));
				
				var minusNode = dojo.query('.sliderInputMinusButton', newRuleOrLabel)[0];
				var minusButton = dijit.byNode(minusNode);
				minusButton.set('title', langObj.bgdRemoveStop);
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
			typeSelect.set('value', this._getSelectValueAssociatedWithType(this._getWidgetTypeForRuleLabels()));
			typeSelect.set('disabled', 'disabled');
			
			var containerSelectNodes = dojo.query('.sliderContainerSelect', newNoChildrenRow);
			var containerSelect = dijit.byNode(containerSelectNodes[0]);
			containerSelect.set('disabled', 'disabled');
			
			var plusNode = dojo.query('.sliderInputPlusButton', newNoChildrenRow)[0];
			var plusButton = dijit.byNode(plusNode);
			plusButton.set('title', langObj.bgdAddStop);
			this._connection.push(dojo.connect(plusButton, 'onClick', dojo.hitch(this, function(rownum){
				var newRowData = this._createNewChildData(this._getWidgetTypeForRuleLabels());
				this._sliderChildrenEntries.splice(rownum+1, 0, newRowData);
				this._updateDialog();
			}, i)));
			
			var minusNode = dojo.query('.sliderInputMinusButton', newNoChildrenRow)[0];
			var minusButton = dijit.byNode(minusNode);
			minusButton.set('disabled', 'disabled');
		}
		
		//Update the preview of the slider
		this._updatePreview();
	},
	
	_updatePreview: function(){
		var s = this._getPreviewContent();
		
		//Set the content
    var obj = this.contentWidget.previewArea;
    obj.set("content", s);		
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
				
				var sliderChildProps = sliderChild.properties;
				var name = null;
				for (name in sliderChildProps) {
					if (sliderChildProps.hasOwnProperty(name)) {
						s += '	' + name + '="' + sliderChild.properties[name] + '"'; 
					}
				}
				s += '	 ></div>';
			} else if (sliderChild.type === this._getWidgetTypeForRuleLabels()) {
				s += '  <ol dojoType="' + this._getWidgetTypeForRuleLabels() + '"';
				var sliderChildProps = sliderChild.properties;
				var name = null;
				for (name in sliderChildProps) {
					if (sliderChildProps.hasOwnProperty(name)) {
						s += '	' + name + '="' + sliderChild.properties[name] + '"'; 
					}
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
			var newType = this._getTypeFromSelectValue(typeSelect.get('value'));
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
			ruleOrLabelData.properties.container = containerSelect.get('value');
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
		if (!this._substitutedMainTemplate) {
			this._substitutedMainTemplate = 
				dojo.replace(mainTemplateString, {
					//width: width + "px",
					//height: (height - 20) + "px",
					ruleAndLabelsHeader: langObj.ruleAndLabelsHeader,
					typeColHeader: langObj.typeColHeader,
					containerColHeader: langObj.containerColHeader,
					preview: langObj.preview,
					buttonOk: dijitLangObj.buttonOk,
					buttonCancel: dijitLangObj.buttonCancel
				});
		}
			
		return this._substitutedMainTemplate;
	},
	
	_getRowTemplate: function() {
		if (!this._substitutedRowTemplate) {
			var containerOptions = this._getContainerOptions();
			this._substitutedRowTemplate = 
				dojo.replace(rowTemplate, {
					containerOptions0: containerOptions[0],
					containerOptions1: containerOptions[1],
					rulesSelectEntry: langObj.rulesSelectEntry,
					labelsSelectEntry: langObj.labelsSelectEntry
				});
		}
			
		return this._substitutedRowTemplate;
	},

	destroy: function() {
		dojo.forEach(this._connection, function(c) {
				dojo.disconnect(c);
		})
	},
	
	/*************************************************************
	 * Functions subclass should override
	 *************************************************************/
	_getDialogTitle: function() {
		return langObj.horizontalSliderDialog;
	},
	
	_getDialogDimensions: function() {
		return { 
			"width": 610,
			"height": 250
		};
	},
	
	_getWidgetTypeForSlider: function() {
		return "dijit/form/HorizontalSlider";
	},
	
	_getWidgetStyleForSlider: function() {
		return "width: 200px;";
	},
	
	_getWidgetTypeForRule: function() {
		return "dijit/form/HorizontalRule";
	},
	
	_getWidgetTypeForRuleLabels: function() {
		return "dijit/form/HorizontalRuleLabels";
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