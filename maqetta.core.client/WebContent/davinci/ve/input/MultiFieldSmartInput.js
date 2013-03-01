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
	"dojo/i18n!dijit/nls/common",
	//"dojo/i18n!./nls/webContent",
	"dojo/text!./templates/MultiFieldSmartInput.html",
	"dojo/text!./templates/MultiFieldTableRowSmartInput.html",
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
	commonNls,
//	webContent,
	mainTemplateString,
	trTemplateString,
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
			var tooltip = dijit.byId('MultiFieldSmartInput_SmartInput_checkbox_'+p.property+'_tooltip');
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
				var description = this._widget.metadata.property[p.property].description;
				if (p.helpText) {
					description = p.helpText;
				}
				if (description) {
					str = str + "<i>"+this.getTitle(p.property)+":</i> "+ entities.encode(description) + "<br>";
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
			if (this.property[i].property == prop) {
				return this.property[i];
			}
		}
	},
	
	onOk: function(e){

		var context = this._getContext();
		var props = {};
		this.property.forEach (function(p) {
			var targetEditBoxDijit = dijit.byId('MultiFieldSmartInput_SmartInput_'+p.property);
			var checkbox = dijit.byId('MultiFieldSmartInput_SmartInput_checkbox_'+p.property);
			var value = targetEditBoxDijit.getValue();
			if (!p.supportsHTML || !checkbox.checked) { // encode if plan text
				value = entities.encode(value);
			}
			props[p.property] = value;
		}.bind(this));
		var command =  new ModifyCommand(this._widget, props, null, context);
		context.getCommandStack().execute(command);
		//Hide
		this.hide(); 
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
	
		var targetEdit = dijit.byId('MultiFieldSmartInput_SmartInput_'+this.property[0].property);
		dijit.selectInputText(targetEdit.textbox);
		targetEdit.focus();
		this.connectEditBoxes();
		this.setStartSize();
		this.resize(null);

	},
	
	connectEditBoxes: function() {

		this.property.forEach (function(p) {
			var targetDijit = dijit.byId('MultiFieldSmartInput_SmartInput_'+p.property);
			this._connection.push(dojo.connect(targetDijit, "onMouseDown", this, "stopEvent"));
			this._connection.push(dojo.connect(targetDijit, "onKeyUp", this, "handleEvent"));
			var checkboxDiv = dojo.byId('MultiFieldSmartInput_SmartInput_checkbox_div_'+p.property);
			targetDijit = dijit.byId('MultiFieldSmartInput_SmartInput_checkbox_'+p.property);
			this._connection.push(dojo.connect(targetDijit, "onClick", this, "htmlCheckbox"));
			new Tooltip({
				 	id: 'MultiFieldSmartInput_SmartInput_checkbox_'+p.property+'_tooltip',
		            connectId: [checkboxDiv],
		            label: "the text for the tooltip"
		       });
		
			this.updateFormats(p.property);
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
		if (event.keyCode == 13) {
			var multiLine = this.multiLine;
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

		var editBox = dijit.byId('MultiFieldSmartInput_SmartInput_'+prop);
		var value = editBox.getValue();
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
		this.property.forEach (function(p) {
			var targetEditBoxDijit = dijit.byId('MultiFieldSmartInput_SmartInput_'+p.property);
			targetEditBoxDijit._setStyleAttr({width: targetObj.clientWidth - (labelWidth + checkboxWidth + 20) + "px"});
		}.bind(this));
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
			//value = value ? value : "";
			tableContent +=
				dojo.replace(trTemplateString, {
						label: this.getTitle(p.property),
						textboxId: 'MultiFieldSmartInput_SmartInput_'+p.property,
						textboxValue: value,
						checkboxDivId: 'MultiFieldSmartInput_SmartInput_checkbox_div_'+p.property,
						checkboxId: 'MultiFieldSmartInput_SmartInput_checkbox_'+p.property,
						checked: checked
				});
/*			if (p.multiLine) {
				
			} else {
				
			}*/
			
		}.bind(this));
		return tableContent;
		
	},
	
	updateSimStyle: function(){},
	

});


return MultiFieldSmartInput;

});