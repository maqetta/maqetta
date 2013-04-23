define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dojo/dom-style",
	"davinci/Runtime",
	"davinci/ve/input/SmartInput",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"dojox/html/entities",
	"dijit/form/DateTextBox",
	"dijit/form/TimeTextBox",
	"dojo/i18n!dijit/nls/common",
	//"dojo/i18n!./nls/webContent",
	"dojo/text!./templates/MultiFieldSmartInput.html",
	"dojo/text!./templates/MultiFieldTableRowSmartInput.html",
	"dojo/text!./templates/MultiFieldMultiLineTableRowSmartInput.html",
	"dijit/Tooltip",
	"davinci/css!./templates/MultiFieldSmartInput.css"
], function(
	declare,
	lang,
	connect,
	style,
	Runtime,
	SmartInput,
	Widget,
	ModifyCommand,
	entities,
	DateTextBox,
	TimeTextBox,
	commonNls,
//	webContent,
	mainTemplateString,
	trTemplateString,
	trMultiLineTemplateString,
	Tooltip
) {

 

var MultiFieldSmartInput = declare(SmartInput, {

	property: [{"property":"placeholder", "multiLine": false}, {"property":"value", "multiLine": false}],
	displayOnCreate: "true",
	delimiter: ", ",
	multiLine: "true",
	supportsHTML: "false", 
	//helpText: "Enter values....",
	_substitutedMainTemplate: null,
	
	destroyTooltips: function() {
		this.property.forEach (function(p) {
			var prop = p.property || p.child.property;
			var tooltip = dijit.byId('MultiFieldSmartInput_SmartInput_checkbox_'+prop+'_tooltip');
			tooltip.destroyRecursive();			
		}.bind(this));
	},
	_getEditor: function() {
		return Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this._getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	},
	
	getHelpText: function() {
		var str="";
		if (this.helpText) {
			str = this.helpText;
		} else {
			this.property.forEach(function(p){
				var prop = p.property || p.child.property;
				var description = this._widget.metadata.property[prop] ? this._widget.metadata.property[prop].description : null;
				if (p.helpText) {
					description = p.helpText;
				}
				if (description) {
					str = str + "<i>"+this.getTitle(prop)+":</i> "+ entities.encode(description) + "<br>";
				}
			}.bind(this));
		}
		if (str.length < 1) {
			str = 'The toolkit provider has not supplied help for this widget, please consult your provider.';
		}
		return str;
		
	},
	
	getTitle: function(prop) {
		return prop; // just use the prop as the title.
		/*if (this._widget.metadata.property[prop].title) {
			return this._widget.metadata.property[prop].title;
		} else {
			return prop;
		}*/
	},
	
	getPropertyObject: function(prop) {
		for (var i = 0; i < this.property.length; i++ ) {
			var property = this.property[i].property || this.property[i].child.property;
			if (this.property[i].property && (this.property[i].property == prop)) {
				return this.property[i];
			} else if (this.property[i].child && (this.property[i].child.property == prop)) {
				return this.property[i].child;
			}
		}
	},
	
	onOk: function(e){

		var context = this._getContext();
		var props = {};
		var children = null;
		this.property.forEach (function(p) {
			var prop = p.property || p.child.property;
			var value = this._getStringValueOfTextBox(prop);
			var checkbox = dijit.byId('MultiFieldSmartInput_SmartInput_checkbox_'+prop);
			if (!p.supportsHTML || !checkbox.checked) { // encode if plan text
				value = entities.encode(value);
			}
		//	if (p.multiLine) {
				if (p.child) {
					children = this.parseChildren(p, value);
					if (p.property) {
						// some multiline widgets support value for selection, it breaks others.
						// so only included if required.
						props[p.property] = this.getSelectedOption(this._widget, children);;
					}
				} else {
					props[p.property] = value;
				}
				
			/*} else {
				props[p.property] = value;
			}*/
		}.bind(this));
		var command =  new ModifyCommand(this._widget, props, children, context);
		context.getCommandStack().execute(command);
		//Hide
		this.hide(); 
	},
	
	parseChildren: function(p, value) {
		var data = this._widget.getData();
		var items = this.parseItems(value);
		var children = data.children;// this.getChildren(widget);
		
		for (var i = 0; i < items.length; i++) {
			var value = items[i];
			var text = value.text;
			if (!p.child.supportsHTML){
				items[i].text = dojox.html.entities.decode(text);
			}
			if (i < children.length) {
				var child = children[i];
				child.children = text;
				child.properties.value = text;
				child.properties.selected = value.selected;
			} else {
				//  new child
				child = {};
				child.type = p.child.type;
				child.properties = {};
				child.properties[p.child.property] = text;
				if (value.selected) {
					child.properties.selected = value.selected;
				}
				child.children = text || value;
				children.push(child);
				
			}
			
		}
		
		if (items.length > 0) {
			var length = children.length;
			for (var i = items.length; i < length; i++) {
				children.pop();
			}
		}
		return children;
		
		/*var command = new ModifyCommand(widget, this.getProperties(widget, values), children);
		this._getContext().getCommandStack().execute(command);
		return command.newWidget;*/
	},

	hide: function(){

			if (this._inline) {
				var value;
				while (connection = this._connection.pop()){
					if (connection) {
						dojo.disconnect(connection);
					}
				}
				var smartInputContainer = this._findSmartInputContainer(this._widget._edit_context.frameNode);
				if(!smartInputContainer){
					console.log('ERROR. MultiFieldSmartInput.js _loading(). No ancestor ContentPane');
					return;
				}
				if (this._loadingDiv) {
					smartInputContainer.removeChild(this._loadingDiv);
				}
				if(this._inline.style.display != "none" ){
					this._format = this.getFormat();
					this._inline.style.display = "none";
					this.destroyTooltips();
					this._inline.destroyRecursive();
					delete this._inline;  
	                var iebPointer = smartInputContainer.ownerDocument.getElementById('iebPointer');
					smartInputContainer.removeChild(iebPointer);
					var context=this._widget.getContext();
					var userdoc = context.getDocument();	// inner document = user's document
					userdoc.defaultView.focus();	// Make sure the userdoc is the focus object for keyboard events
				}
	 
			}

	},
	
	
	show: function(widgetId) {
		this._lastKeyCode = 0;
		this._widget = Widget.byId(widgetId);
		var data = this._widget.getData();
		
			
		var width = 200;
		var height = 255;
		this._loading(height, width);
			
		dojo.addClass('ieb', "MultiFieldSmartInput");
		var content = this._getTemplate();
		this._inline.attr("content", content);
		this._connection.push(dojo.connect(this._inline, "onBlur", this, "onOk")); 
		this._connectHelpDiv();
		this._connectResizeHandle();
		this._connectSimDiv();
		if (this._loadingDiv) {
			this._loadingDiv.style.backgroundImage = 'none'; // turn off spinner
		}
		var prop = this.property[0].property || this.property[0].child.property;
		var targetEdit = dijit.byId('MultiFieldSmartInput_SmartInput_'+prop);
		dijit.selectInputText(targetEdit.textbox);
		targetEdit.focus();
		this.connectEditBoxes();
		this.setStartSize();
		this.resize(null);

	},
	
	connectEditBoxes: function() {

		this.property.forEach (function(p) {
			var prop = p.property || p.child.property
			var targetDijit = dijit.byId('MultiFieldSmartInput_SmartInput_'+prop);
			this._connection.push(dojo.connect(targetDijit, "onMouseDown", this, "stopEvent"));
			this._connection.push(dojo.connect(targetDijit, "onKeyUp", this, "handleEvent"));
			var checkboxDiv = dojo.byId('MultiFieldSmartInput_SmartInput_checkbox_div_'+prop);
			targetDijit = dijit.byId('MultiFieldSmartInput_SmartInput_checkbox_'+prop);
			this._connection.push(dojo.connect(targetDijit, "onClick", this, "htmlCheckbox"));
			new Tooltip({
				 	id: 'MultiFieldSmartInput_SmartInput_checkbox_'+prop+'_tooltip',
		            connectId: [checkboxDiv],
		            label: "the text for the tooltip"
		       });
		
			this.updateFormats(prop);
		}.bind(this));
		
		
	},
	
	containsHtml: function(value){
		var n = dojo.create("div", { innerHTML: value});
		var format = n.children.length ? 'html' : 'text';
		return format;

	},
	
	htmlCheckbox: function(e) {

		var id = e.currentTarget.id.split("_");
		var prop = id[id.length-1];
		var editBox = dijit.byId('MultiFieldSmartInput_SmartInput_'+prop);
		var targetDijit = dijit.byId(e.currentTarget.id+'_tooltip');
		var text = editBox.getValue();
		var format = 'html';
		if (!e.currentTarget.checked) {
			text = entities.encode(text);
			format = 'text'
		} 
		targetDijit.attr('label','Format contents as '+format+':<br>'+text);
	
	},
	
	setStartSize: function() {
		// calculate the height based on the edit boxs
		var tds = dojo.query('.MultiFieldSmartInput_SmartInput_value', 'davinci.ve.input.MultiFieldSmartInput_table');
		// Find the widest label
		var height = 0;
		tds.forEach(function(td){
				height += td.clientHeight + 5;
		});
		var targetObj = dojo.byId("iedResizeDiv");
		var target = dijit.byId("iedResizeDiv");
		//targetObj._setStyleAttr({width: boxWidth + "px", height: boxheight + "px", maxHeight: boxheight + "px"}); // needed for multi line
		dojo.style('iedResizeDiv', 'height', height  + 5 + "px");
		dojo.style('iedResizeDiv', 'minHeight', height  + 5 + "px");
	},


	
	handleEvent: function(event){
		var multiLine = false;
		for (var i = 0; i < this.property.length; i++) {
			var p = this.property[i];
			var prop = p.property || p.child.property;
			if (event.currentTarget.id.indexOf('MultiFieldSmartInput_SmartInput_'+prop) > -1) {
				multiLine = p.multiLine;
				break;
			}
		}
		
		if (event.keyCode == 13) {
			if (!multiLine || multiLine == "false" || this._lastKeyCode == 13){ // back to back CR
				this.onOk();
			}
		} else {
			var x = event.target.id.split("_");
			var prop = x[x.length-1];
			this.updateFormats(prop);
		}
		this._lastKeyCode = event.keyCode;
		this.updateSimStyle();
	},
	
	updateFormats: function(prop) {

		var value = this._getStringValueOfTextBox(prop);
		var disabled = true;
		
		if (this.getPropertyObject(prop).supportsHTML && this.containsHtmlMarkUp(value)) {
			dojo.style('MultiFieldSmartInput_SmartInput_checkbox_div_'+prop,'display', '');
		} else {
			dojo.style('MultiFieldSmartInput_SmartInput_checkbox_div_'+prop,'display', 'none');
		}
		
		var tooltip = dijit.byId('MultiFieldSmartInput_SmartInput_checkbox_'+prop+'_tooltip');
		var checkbox = dijit.byId('MultiFieldSmartInput_SmartInput_checkbox_'+prop);
		var format = 'html';
		if (!checkbox.checked) {
			value = entities.encode(value);
			format = 'text'
		} 
		tooltip.attr('label','Format contents as '+format+':<br>'+value);
		this.resize(null);
				

	},
	serializeChildren: function(data) {
		
		var result = [];
		data.children.forEach(function(child){
			var text = child.properties.value ? child.properties.value : child.children;
			text = entities.decode(text);
			var selected = (child.properties.selected || data.properties.value == text) ? "+" : "";
			result.push(selected + text);
		}.bind(this));
			
		return result = this.serializeItems(result);
 
	},
		
	resize: function(e) {
	//	this.inherited(arguments);	
		var labelWidth = 40;
		
		var tds = dojo.query('.MultiFieldSmartInput_SmartInput_label', 'davinci.ve.input.MultiFieldSmartInput_table');
		// Find the widest label
		tds.forEach(function(td){
			if (td.clientWidth > labelWidth) {
				labelWidth = td.clientWidth;
			}
		});
		// set all label tds to the widest label
		tds.forEach(function(td){
			if (td.clientWidth < labelWidth) {
				dojo.style(td, 'width',  labelWidth + "px");
			}
		});
		var checkboxWidth = 0;
		tds = dojo.query('.MultiFieldSmartInput_SmartInput_checkbox', 'davinci.ve.input.MultiFieldSmartInput_table');
		// Find the widest checkbox
		tds.forEach(function(td){
			if (td.clientWidth > checkboxWidth) {
				checkboxWidth = td.clientWidth;
			}
		});
		// set all checkbox tds to the widest label
		tds.forEach(function(td){
			if (td.clientWidth < checkboxWidth) {
				dojo.style(td, 'width',  checkboxWidth + "px");
			}
		});
		var targetObj = dojo.byId("iedResizeDiv");
		var boxWidth = targetObj.clientWidth	- 5;
		var boxheight = targetObj.clientHeight -6;
		boxWidth = targetObj.clientWidth	/*+2*/ -8;
		boxheight = targetObj.clientHeight	-50; // new for text area
		if (boxheight < 25) {
			boxheight = 25;
		}
		var multiLineEditBoxs = [];
		var singleLineEditBoxsHeight = 0;
		this.property.forEach (function(p) {
			var prop = p.property || p.child.property
			var targetEditBoxDijit = dijit.byId('MultiFieldSmartInput_SmartInput_'+prop);
			targetEditBoxDijit._setStyleAttr({width: targetObj.clientWidth - (labelWidth + checkboxWidth + 20) + "px"});
			if (p.multiLine) {
				multiLineEditBoxs.push(targetEditBoxDijit);
			} else {
				singleLineEditBoxsHeight += targetEditBoxDijit.domNode.clientHeight;	
			}
		}.bind(this));
		if (multiLineEditBoxs.length > 0) {
			// we have multiline boxes to devide up the leftover hieght
			var unusedHeight = targetObj.clientHeight - singleLineEditBoxsHeight;
			var height = (unusedHeight- 25) / multiLineEditBoxs.length  ;
			multiLineEditBoxs.forEach(function(textBox){
				textBox._setStyleAttr({height: height + "px", maxHeight: height + "px"});
			}.bind(this));
		}
		/*if (targetEditBoxDijit) {
			targetEditBoxDijit._setStyleAttr({width: boxWidth + "px", height: boxheight + "px", maxHeight: boxheight + "px"}); // needed for multi line
		}
		targetEditBoxDijit._setStyleAttr({width: targetObj.clientWidth - (labelWidth + 20) + "px"});
		labelEditBoxDijit._setStyleAttr({width: targetObj.clientWidth - (labelWidth + 20) + "px"});*/
				
		dojo.style('ieb', 'width', targetObj.clientWidth + 15 + "px");
		dojo.style('davinci.ve.input.SmartInput_radio_div', 'width', targetObj.clientWidth +  5 + "px");
		

	},

	_getTemplate: function() {
		//if (!this._substitutedMainTemplate) {
			this._substitutedMainTemplate = 
				dojo.replace(mainTemplateString, {
						buttonOk: commonNls.buttonOk,
						buttonCancel: commonNls.buttonCancel,
						tableContent: this._addPropertiesToHTML(),
						helpText: this.getHelpText()
				});
	//	}

		return this._substitutedMainTemplate;
	},
	
	_addPropertiesToHTML: function(){
		
		var data = this._widget.getData();
		var tableContent = "";
		this.property.forEach(function(p){
			var value = data.properties[p.property]  ||  ""; 
			var checked = this.containsHtmlMarkUp(value) ? "checked" : "";
			var prop = p.property || p.child.property;
			if (p.child) {
				value = this.serializeChildren(data);
			}
			if (p.multiLine) {
				tableContent +=
					dojo.replace(trMultiLineTemplateString, {
							label: this.getTitle(prop),
							textboxId: 'MultiFieldSmartInput_SmartInput_'+prop,
							textboxValue: value,
							checkboxDivId: 'MultiFieldSmartInput_SmartInput_checkbox_div_'+prop,
							checkboxId: 'MultiFieldSmartInput_SmartInput_checkbox_'+prop,
							checked: checked
					});
			} else {
				var format = this._widget.metadata.property[prop] ? this._widget.metadata.property[prop].format : null;
				var textboxType = "dijit/form/TextBox";
				if (format) {
					if (format == 'date'){
						textboxType = "dijit/form/DateTextBox";
					} else if (format == 'time'){
						textboxType = "dijit/form/TimeTextBox";
					}
				}
				tableContent +=
				dojo.replace(trTemplateString, {
						label: this.getTitle(prop),
						textboxType: textboxType,
						textboxId: 'MultiFieldSmartInput_SmartInput_'+prop,
						textboxValue: value,
						checkboxDivId: 'MultiFieldSmartInput_SmartInput_checkbox_div_'+prop,
						checkboxId: 'MultiFieldSmartInput_SmartInput_checkbox_'+prop,
						checked: checked
				});
			}
			
		}.bind(this));
		return tableContent;
		
	},
	
	getSelectedOption: function(widget, options) {

		var value="";
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			if (option.properties.selected) {
				value = option.properties.value;
				break;
			} 
		}
		return value;
	},
	
	_getStringValueOfTextBox: function(prop) {
		var targetEditBoxDijit = dijit.byId('MultiFieldSmartInput_SmartInput_'+prop);
		var value = targetEditBoxDijit.getValue();
		if (value && (value instanceof Date)) { // Date
			if (targetEditBoxDijit instanceof DateTextBox ) {
					value = value.toISOString().substring(0, 10);
			} else if (targetEditBoxDijit instanceof TimeTextBox ) {
					value = "T" + value.toTimeString().substring(0, 8);
			}
		} 
		return value;
	},
	
	updateSimStyle: function(){},
	

});


return MultiFieldSmartInput;

});