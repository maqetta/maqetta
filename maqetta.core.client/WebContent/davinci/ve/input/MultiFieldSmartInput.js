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
	Tooltip
) {

 

var MultiFieldSmartInput = declare(SmartInput, {

	property: [{"property":"placeholder", "multiLine": false}, {"property":"value", "multiLine": false}],
	//propertyDisplayLabels: ['Hint', 'Value'],
	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",
	supportsHTML: "false", 

	//helpText: "Enter values....",

	_substitutedMainTemplate: null,
	
	
	_getEditor: function() {
		return Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this._getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	},
	
	getHelpText: function() {
		var str="";
		this.property.forEach(function(p){
			var description = this._widget.metadata.property[p.property].description;
			var title = this._widget.metadata.property[p.property].title;
			if (!title) {
				title = p.property;
			}
			if (description) {
				str = str + "<i>"+title+":</i> "+ entities.encode(description) + "<br>";
			}
		}.bind(this));
		return str;
		
	},
	
	getTitle: function(prop) {
		
		if (this._widget.metadata.property[prop].title) {
			return this._widget.metadata.property[prop].title;
		} else {
			return prop;
		}
	},
	
	onOk: function(e){

		var context = this._getContext();
		var props = {};
		this.property.forEach (function(p) {
			var targetEditBoxDijit = dijit.byId('MultiFieldSmartInput_SmartInput_'+p.property);
			props[p.property] = targetEditBoxDijit.getValue();
		}.bind(this));
		var command =  new ModifyCommand(this._widget, props, null, context);
		context.getCommandStack().execute(command);
		//Hide
		this.hide(); 
	},

	hide: function(){

			//this.inherited(arguments, [ true ]); // we already updated the widget so just do a hide like cancel
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
					this._inline.destroyRecursive();
					delete this._inline;  
	                var iebPointer = smartInputContainer.ownerDocument.getElementById('iebPointer');
					smartInputContainer.removeChild(iebPointer);
					
				/*	if(value != null && !cancel){
					if (!this.disableEncode && this._format === 'text' ) // added to support dijit.TextBox that does not support html markup in the value and should not be encoded. wdr
							value = entities.encode(value);
					
						this.updateWidget(value);
					}*/
					var context=this._widget.getContext();
					var userdoc = context.getDocument();	// inner document = user's document
					userdoc.defaultView.focus();	// Make sure the userdoc is the focus object for keyboard events
				}
	 
			}

	},
	
	
	show: function(widgetId) {
		debugger;
		this._widget = Widget.byId(widgetId);
		var data = this._widget.getData();
		
			
		var width = 200;
		var height = 255;
		this._loading(height, width);
			
		dojo.addClass('ieb', "MultiFieldSmartInput");
		var content = this._getTemplate();
		this._inline.attr("content", content);
		//this._inline.eb = dijit.byId("davinciIleb");
//		this._connection.push(dojo.connect(this._inline, "onBlur", this, "onOk")); 
		//this._connection.push(dojo.connect(this._inline.eb, "onKeyUp", this, "handleEvent"));
		this._connectHelpDiv();
		this._connectResizeHandle();
		this._connectSimDiv();
		if (this._loadingDiv) {
			this._loadingDiv.style.backgroundImage = 'none'; // turn off spinner
		}
	/*	var labelTextBox = dijit.byId("MultiFieldSmartInput_SmartInput_label_editbox"); 
		if (data.properties[this.property[0].property]) {
			labelTextBox.setValue(data.properties[this.property[0].property]);
		}
		this._connection.push(dojo.connect(labelTextBox, "onMouseDown", this, "stopEvent"));
		this._inline.eb = dijit.byId("davinciIleb");
		if (data.properties[this.property[1].property]) {
			this._inline.eb.setValue( data.properties[this.property[1].property]);
		}
		this._connection.push(dojo.connect(this._inline.eb, "onMouseDown", this, "stopEvent"));*/
		

		
		/*if (this.containsHtmlMarkUp(str)) {
			//var html = this._widget.getPropertyValue('escapeHTMLInData');
			var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
			var textRadio = dijit.byId('davinci.ve.input.SmartInput_radio_text');
	
			if(html){
				htmlRadio.set("checked", false);
				textRadio.set("checked", true);
			}else{
				htmlRadio.set("checked", true);
				textRadio.set("checked", false);					
			}
		}
*/
		this.updateFormats();
		//this._inline.eb.focus();
		this.connectEditBoxes();
		this.setStartSize();
		this.resize(null);

	},
	
	connectEditBoxes: function() {
		debugger;
		this.property.forEach (function(p) {
			var targetDijit = dijit.byId('MultiFieldSmartInput_SmartInput_'+p.property);
			this._connection.push(dojo.connect(targetDijit, "onMouseDown", this, "stopEvent"));
			var checkboxDiv = dojo.byId('MultiFieldSmartInput_SmartInput_checkbox_div_'+p.property);
			if (p.supportsHTML) {
				targetDijit = dijit.byId('MultiFieldSmartInput_SmartInput_checkbox_'+p.property);
				this._connection.push(dojo.connect(targetDijit, "onClick", this, "htmlCheckbox"));
				 new Tooltip({
					 	id: 'MultiFieldSmartInput_SmartInput_checkbox_'+p.property+'_tooltip',
			            connectId: [checkboxDiv],
			            label: "the text for the tooltip"
			        });
			} else {
				dojo.style(checkboxDiv, 'display', 'none');
			}
			
		}.bind(this));
		
		
	},
	
	htmlCheckbox: function(e) {
		debugger;
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
		debugger;
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
			this.updateFormats();
		}
		this._lastKeyCode = event.keyCode;
		this.updateSimStyle();
	},
	
	updateFormats: function() {
	
			this.inherited(arguments);
			/*if (!this.supportsEscapeHTMLInData) {
				var textObj = dojo.byId("davinci.ve.input.SmartInput_radio_text_width_div");
				var htmlObj = dojo.byId("davinci.ve.input.SmartInput_radio_html_width_div");
				var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
				var textRadio = dijit.byId('davinci.ve.input.SmartInput_radio_text');
				
				dojo.style(htmlObj, 'display', 'none');
				dojo.style(textObj, 'display', 'none');
				dojo.style(htmlRadio.domNode, 'display', 'none');
				dojo.style(textRadio.domNode, 'display', 'none');

		}*/
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
		//var targetEditBoxDijit = dijit.byId("davinciIleb");
		//var labelEditBoxDijit = dijit.byId("MultiFieldSmartInput_SmartInput_label_editbox");
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
		
		//var table = dojo.byId("davinci.ve.input.MultiFieldSmartInput_table");
		var data = this._widget.getData();
		var tableContent = "";
		this.property.forEach(function(p){
			var description = this._widget.metadata.property[p.property].description;
			var title = this._widget.metadata.property[p.property].title;
			var value = data.properties[p.property]  ||  ""; 
			//value = value ? value : "";
			tableContent +=  '<tr><td class="MultiFieldSmartInput_SmartInput_label" >'+this.getTitle(p.property)+'</td>'+
							'<td> <div class="MultiFieldSmartInput_SmartInput_value">'+
							    '<input type="text" name="MultiFieldSmartInput_SmartInput_'+p.property+
							    '"  data-dojo-type="dijit/form/TextBox" data-dojo-props="trim:true" value="'+value+
							    '" id="MultiFieldSmartInput_SmartInput_'+p.property+'">'+
						    ' </div></td>'+
						    '<td class="MultiFieldSmartInput_SmartInput_checkbox">'+
						    	'<div id="MultiFieldSmartInput_SmartInput_checkbox_div_'+p.property+'">' +
						    	'<input id="MultiFieldSmartInput_SmartInput_checkbox_'+p.property+'" name="MultiFieldSmartInput_SmartInput_checkbox_'+p.property+'" data-dojo-type="dijit/form/CheckBox" />'+
						    	'<label for="MultiFieldSmartInput_SmartInput_checkbox_'+p.property+'">html</label>'+
						    	'</div>'+
						    '</td></tr>';
			if (p.multiLine) {
				/*<td class="MultiFieldSmartInput_SmartInput_label" >{value}</td> 
		        <td>
		        	<div class="MultiFieldSmartInput_SmartInput_value">
		           <textarea  dojoType="dijit.form.SimpleTextarea" name="davinciIleb"  trim="true" id="davinciIleb" class="smartInputTextAreaMulti"></textarea>
		           	</div>
		        </td>*/
			} else {
				
			}
/*			var tr = dojo.create("tr", {
	        	innerHTML: innerHtml,
	    	}, table);*/
			
		}.bind(this));
		return tableContent;
		
	},
	
	updateFormats: function(){},
	updateSimStyle: function(){},
	

});


return MultiFieldSmartInput;

});