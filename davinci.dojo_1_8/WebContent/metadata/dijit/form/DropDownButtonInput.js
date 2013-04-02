define([
        "dojo/_base/declare",
    	"../layout/ContainerInput",
        "dojo/i18n!../nls/dijit",
        "dojox/html/entities",
    	"dojo/i18n!davinci/ve/nls/ve",
    	"dojo/i18n!dijit/nls/common"
], function(declare, ContainerInput, nls, entities, veNls, commonNls){

return declare(ContainerInput, {

	propertyName: "label",
		
	format: "rows",
	
	multiLine: "true",
	
	supportsHTML: "true",
	
	helpText: "",
	
	constructor : function() {
		this.helpText = nls.dropDownButtonInputHelp;
	},
	
	serialize: function(widget, callback, value) {
		var result = [];
		var data = widget.getData();
		var menu = data.children[0];

		result.push(data.properties[this.propertyName]);

		if (menu) {
			var menuItems = menu.children;
			for (var j = 0; j < menuItems.length; j++) {
				var menuItem = menuItems[j];
				result.push("> " + menuItem.properties[this.propertyName]);
			}
		}
		
		result = this.serializeItems(result);

		callback(result); 
	},
	
	update: function(widget, values) {
		var data = widget.getData();
		var menu = data.children[0];
		var label, menuItems, menuItemIndex = -1;
		for (var i = 0; i < values.length; i++) {
			var value = values[i];
			var indent = value.indent;
			var text = value.text;
			
			if (i == 0) {
				label = text;
			} else {
				menuItemIndex++;
				menuItems = menu.children;
				var menuItem = menuItems[menuItemIndex];
				if (menuItem) {
					menuItem.properties.label = text;
				} else {
					menuItem = this.createMenuItemData(text);
					menuItems.push(menuItem);
				}			
			}
		}

		if (menuItems && (menuItemIndex + 1 > 0)) {
			var length = menuItems.length;
			for (var i = menuItemIndex + 1; i < length; i++) {
				menuItems.pop();
			}
		}
				
		var command = new davinci.ve.commands.ModifyCommand(widget, { label: label }, [menu]);
		this._getContext().getCommandStack().execute(command);
		return command.newWidget;
	},
	
	createMenuItemData: function(value) {
		return { 
			type: "dijit/MenuItem", 
			properties: { label: value }
		};
	},
	
	parse: function(input) {
		var result = this.parseItems(entities.decode(input));
		// i think we need to re-encode the result.text here
		if (this._format === 'text'){
			result.forEach(function(item) { item.text = entities.encode(item.text); });
		}
		return result;
	},

	setFormat: function(value){
		var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
		var textRadio = dijit.byId('davinci.ve.input.SmartInput_radio_text');
		var n = dojo.create("div", { innerHTML: value});
		var format = n.children.length ? 'html' : 'text';
		if (format === 'html'){
			htmlRadio.set('checked', true);
			textRadio.set('checked', false);
		}else{ 
			htmlRadio.set('checked', false);
			textRadio.set('checked', true);
		}
		this._format = format;
	},

	help: function(display){
		var helpDiv = dojo.byId('davinci.ve.input.SmartInput_div_help');
		var radioDiv = dojo.byId('davinci.ve.input.SmartInput_radio_div');
		if (display){
			dojo.style(helpDiv, 'display', '');
			//dojo.style(radioDiv, 'height', '150px');
		}else{
			dojo.style(helpDiv, 'display', 'none');
//			if (this.isHtmlSupported()){
//				dojo.style(radioDiv, 'height', '60px');
//			} else {
//				dojo.style(radioDiv, 'height', '40px'); // div can be smaller, no text is displayed
//			}
		}
	},

	updateFormats: function(){
		var value = this._inline.eb.attr('value');
		var disabled = true;
		if (this.containsHtmlMarkUp(value)) {
			disabled = false;
		}
		
		// NOTE: if you put a break point in here while debugging it will break the dojoEllipsis
		var localDojo = this._widget.getContext().getDojo();
		var textObj = dojo.byId("davinci.ve.input.SmartInput_radio_text_width_div");
		//var what = entities.encode(dojox.html.entities.encode(value));
		var what = entities.encode(value);
		textObj.innerHTML = '<div class="dojoxEllipsis">' + dojo.replace(nls.plainText, [what]) + '</div>';
		var htmlObj = dojo.byId("davinci.ve.input.SmartInput_radio_html_width_div");
		htmlObj.innerHTML = '<div id="davinci.ve.input.SmartInput_radio_html_div" class="dojoxEllipsis">'+veNls.htmlMarkup+'</div>';
		var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
		var textRadio = dijit.byId('davinci.ve.input.SmartInput_radio_text');
		var table = dojo.byId('davinci.ve.input.SmartInput_table');
		htmlRadio.setDisabled(disabled);
		textRadio.setDisabled(disabled);
		if (disabled){
			dojo.addClass(textObj,'inlineEditDisabled');
			dojo.addClass(htmlObj,'inlineEditDisabled');
			htmlRadio.set('checked', false);
			textRadio.set('checked', true);
		}else{
			dojo.removeClass(textObj,'inlineEditDisabled');
			dojo.removeClass(htmlObj,'inlineEditDisabled');
		}
		if (!disabled && this.isHtmlSupported()){
			dojo.style(textRadio.domNode, 'display', '');
			dojo.style(htmlRadio.domNode, 'display', '');
			dojo.style(htmlObj, 'display', '');
			dojo.style(textObj, 'display', '');
			dojo.style(table, 'display', '');
		} else {
			dojo.style(textRadio.domNode, 'display', 'none');
			dojo.style(htmlRadio.domNode, 'display', 'none');
			dojo.style(htmlObj, 'display', 'none');
			dojo.style(textObj, 'display', 'none');
			dojo.style(table, 'display', 'none');
		}
	},

	_getTemplate: function(){
		var editBox = ''+
			'<div id="iedResizeDiv" class="iedResizeDiv" >' + 
//		       '<input id="davinciIleb" class="davinciIleb smartInputTextBox" type="text"  dojoType="dijit.form.TextBox"  />' +
			   '<textarea  dojoType="dijit.form.SimpleTextarea" name="davinciIleb" style="width:200px; height:30px;" trim="true" id="davinciIleb" class="smartInputTextArea" ></textarea>'+
			   '<div id="smartInputSim" class="smartInputSim" ></div>'+
				'<div id="iedResizeHandle" dojoType="dojox.layout.ResizeHandle" targetId="iedResizeDiv" constrainMin="true" maxWidth="200" maxHeight="600" minWidth="200" minHeight="55"  activeResize="true" intermediateChanges="true" ></div>' +
	//			'<div id="iedResizeHandle" dojoType="dojox.layout.ResizeHandle" targetId="iedResizeDiv" constrainMin="true" maxWidth="200" maxHeight="200" minWidth="200" minHeight="19" resizeAxis="x" activeResize="true" intermediateChanges="true" ></div>' +
			'</div>';
		if (this.multiLine === "true"){
			editBox = ''+
			'<div id="iedResizeDiv" class="iedResizeDiv" >' + 
				'<textarea  dojoType="dijit.form.SimpleTextarea" name="davinciIleb" style="width:200px; height:60px;" trim="true" id="davinciIleb" class="smartInputTextArea" ></textarea>'+
				'<div id="smartInputSim" class="smartInputSim" ></div>'+
//				'<div id="smartInputSim" style="height:10px; border-color: #B5BCC7; border-style: solid; border-width: 0px 3px 3px 3px;  background-color: #F7FCFF;"></div>'+
				'<div id="iedResizeHandle" dojoType="dojox.layout.ResizeHandle" targetId="iedResizeDiv" constrainMin="true" maxWidth="200" maxHeight="600" minWidth="200" minHeight="80"  activeResize="true" intermediateChanges="true" ></div>' +
			'</div>';
		}
		var template = ''+ editBox +
		'<div  id="davinci.ve.input.SmartInput_div"  class="davinciVeInputSmartInputDiv" >' + 
			'<div id="davinci.ve.input.SmartInput_radio_div" class="smartInputRadioDiv" >' + 
				'<table id="davinci.ve.input.SmartInput_table"> ' +
					'<tbody>' + 
						'<tr> ' +
							'<td class="smartInputTd1" > ' +
								'<input id="davinci.ve.input.SmartInput_radio_text" showlabel="true" type="radio" dojoType="dijit.form.RadioButton" disabled="false" readOnly="false" intermediateChanges="false" checked="true"> </input> '+
	             			'</td> ' +
	             			'<td class="smartInputTd2" >'+ 
	             				'<div id="davinci.ve.input.SmartInput_radio_text_width_div" class="smartInputRadioTextDiv">'+
//	             				'<div id="davinci.ve.input.SmartInput_radio_text_div" class="dojoxEllipsis">'+
//	             					'Plain text (Button)xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'+
//	             				'</div>'+
	             				'</div>'+
             				'</td> ' +
         				'</tr>'+
         				'<tr> '+
         					'<td class="smartInputTd1"> <input id="davinci.ve.input.SmartInput_radio_html" showlabel="true" type="radio" dojoType="dijit.form.RadioButton"> </input>  </td> '+
         					'<td class="smartInputTd2">'+
         						'<div id="davinci.ve.input.SmartInput_radio_html_width_div" class="smartInputRadioTextDiv">'+
//         						'<div id="davinci.ve.input.SmartInput_radio_html_div" class="dojoxEllipsis">'+
//         							'HTML markup'+
//         						'</div>'+
         						'</div>'+
             				'</td> '+
     					'</tr> '+
 					'</tbody>'+ 
					'</table> '+
				'<div class="smartInputHelpDiv" > '+
	        		'<span id="davinci.ve.input.SmartInput_img_help"  title="Help" class="inlineEditHelp" > </span>'+
		        	'<span class="smartInputSpacerSpan" >'+
		        	'<button id="davinci.ve.input.SmartInput_ok"  dojoType="dijit.form.Button" type="submit" class="inlineEditHelpOk" >'+commonNls.buttonOk+'</button> <button id=davinci.ve.input.SmartInput_cancel dojoType="dijit.form.Button" class="inlineEditHelpCancel"> '+commonNls.buttonCancel+'</button>  '+
		        	'</span>   '+
		        '</div> '+
		        '<div id="davinci.ve.input.SmartInput_div_help" style="display:none;" class="smartInputHelpTextDiv" > '+
		        	'<div dojoType="dijit.layout.ContentPane" style="text-align: left; padding:0; height:80px;" >'+this.getHelpText()+ '</div> '+
		        	'<div style="text-align: left; padding:0; height:2px;" ></div> '+
		        '</div> '+
	        '</div>' + 
        '</div> '+
        '';
			return template;
	},

	end: true
});
});
