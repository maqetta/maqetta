define([
	"dojo/_base/declare",
	"davinci/ve/input/SmartInput",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/ModifyRichTextCommand",
	"davinci/XPathUtils",
	"davinci/html/HtmlFileXPathAdapter",
	"dijit/Editor",  // we need editor in order for the editor to be displayed
	"dijit/_editor/plugins/LinkDialog", // need the plugins for the editor toolbar
	"dijit/_editor/plugins/TextColor", // need the plugins for the editor toolbar
	"dijit/_editor/plugins/FontChoice", // need the plugins for the editor toolbar
	"dojox/html/entities",
	"dojo/i18n!../nls/ve",
	"dojo/i18n!dijit/nls/common"
], function(declare, SmartInput, CompoundCommand, ModifyRichTextCommand, 
		XPathUtils, HtmlFileXPathAdapter, Editor, LinkDialog, 
		TextColor, FontChoice, Entities, veNls, commonNls){


return declare("davinci.ve.input.RichTextInput", [SmartInput], {

	property: 'richText',
    displayOnCreate: 'true',
	
    
	getHelpText: function(){
		return veNls.richTextInputHelp;
	},
    
    show: function(widgetId){ 

		this._widget = davinci.ve.widget.byId(widgetId);

		var width = 400;
		var height = 265;
		this._loading(height, width);
		var content = this._getTemplate();
		this._inline.set("content",  content); 
		var children = this._inline.getChildren();
		for (var i=0; i < children.length; i++){
			if (children[i].id === 'davinciIleb'){
				this._inline.eb = children[i];
				break;
			}		
		}
		var text = this._widget._srcElement.getElementText(this._context); // just the inside text
		this._inline.eb.set('value',text);
		this._connection.push(dojo.connect(this._inline, "onBlur", this, "onOk"));  
		this._connection.push(dojo.connect(this._inline.eb, "onMouseDown", this, "stopEvent")); 
		this._connection.push(dojo.connect(this._inline.eb, "onClick", this, "updateSimStyle"));
		this._connectHelpDiv();
		this._connectResizeHandle();
		this._connectSimDiv();
		this.updateFormats();
		this._loadingDiv.style.backgroundImage = 'none'; // turn off spinner
		this._inline.eb.focus();
		this.resize(null);
		
	},
	
	updateWidget: function(value){
	
		if (this._widget._destroyed) {
			return;
		}

		var node = this._node(this._widget);
        var context=this._widget.getContext();
		var inlineEditProp = this.property;
		var values={};
		if (value && (typeof value == 'string')){
			value = value.replace(/\n/g, ''); // new lines breaks create widget richtext
		}
		values[inlineEditProp]=value;
		values.richText = Entities.decode( values.richText); // get back to reg html
		var customMap = [
			                   ["\u00a0", "nbsp"]
		                     ];
        values.richText = Entities.encode( values.richText, customMap);
        
        var compoundCommand = new CompoundCommand();
		var modifyCommand = new ModifyRichTextCommand(this._widget, values, context);
		compoundCommand.add(modifyCommand);
		
		this._widget._edit_context.getCommandStack().execute(compoundCommand);
		this._widget=modifyCommand.newWidget;	
		this._widget._edit_context._focuses[0]._selectedWidget = this._widget; // get the focus on the current node
		context.select(this._widget, null, false); // redraw the box around the widget

	},

	_getTemplate: function() {
		// XXX TODO this should be moved to an HTML template file.
		var editBox = ''+
		'<div id="iedResizeDiv"  class="iedResizeDiv" style="width: 400px; height: 245px;" >' + 
		"<div dojoType=\"dijit.Editor\" width=\"600\" height=\"200\" id=\"davinciIleb\"  style=\"border-width: 0px;\" plugins=\"['undo','redo','|','cut','copy','paste','|','bold','italic','underline','strikethrough','foreColor','hiliteColor','insertHorizontalRule','createLink','unlink','insertImage','delete','removeFormat','|', 'insertOrderedList','insertUnorderedList','indent', 'outdent', 'justifyLeft', 'justifyCenter', 'justifyRight','fontName', 'fontSize', 'formatBlock']\" > </div>"+
			'<div id="smartInputSim" class="smartInputSim" ></div>'+
			'<div id="iedResizeHandle" dojoType="dojox.layout.ResizeHandle" targetId="iedResizeDiv" constrainMin="true" maxWidth="900" maxHeight="900" minWidth="400" minHeight="200"  activeResize="true" intermediateChanges="true" ></div>' +
		'</div>';

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
	             				'</div>'+
             				'</td> ' +
         				'</tr>'+
         				'<tr> '+
         					'<td class="smartInputTd1"> <input id="davinci.ve.input.SmartInput_radio_html" showlabel="true" type="radio" dojoType="dijit.form.RadioButton"> </input>  </td> '+
         					'<td class="smartInputTd2">'+
         						'<div id="davinci.ve.input.SmartInput_radio_html_width_div" class="smartInputRadioTextDiv">'+
         						'</div>'+
             				'</td> '+
     					'</tr> '+
 					'</tbody>'+ 
					'</table> '+
				'<div class="smartInputHelpDiv" > '+
	        		'<span id="davinci.ve.input.SmartInput_img_help" title="Help" class="inlineEditHelp" > </span>'+
		        	'<span class="smartInputSpacerSpan" >'+
		        	'<button id="davinci.ve.input.SmartInput_ok"  dojoType="dijit.form.Button" type="submit" class="inlineEditHelpOk" >'+commonNls.buttonOk+'</button> <button id=davinci.ve.input.SmartInput_cancel dojoType="dijit.form.Button" class="inlineEditHelpCancel"> '+commonNls.buttonCancel+'</button>  '+
		        	'</span>   '+
		        '</div> '+
		        '<div id="davinci.ve.input.SmartInput_div_help" style="display:none;" class="smartInputHelpTextDiv" > '+
		        	'<div dojoType="dijit.layout.ContentPane" style="text-align: left; padding:0; " >'+this.getHelpText()+ '</div> '+
		        	'<div style="text-align: left; padding:0; height:2px;" ></div> '+
		        '</div> '+
	        '</div>' + 
        '</div> '+
        '';
			return template;
	},
	
	updateFormats: function(){
		
		var disabled = true;
		
		// NOTE: if you put a break point in here while debugging it will break the dojoEllipsis
		var localDojo = this._widget.getContext().getDojo();
		var textObj = dojo.byId("davinci.ve.input.SmartInput_radio_text_width_div");
		var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
		var textRadio = dijit.byId('davinci.ve.input.SmartInput_radio_text');
		var table = dojo.byId('davinci.ve.input.SmartInput_table');
		dojo.style(textRadio.domNode, 'display', 'none');
		dojo.style(htmlRadio.domNode, 'display', 'none');
		dojo.style(table, 'display', 'none');
		
		
	},
	
	resize: function(e){
		this.inherited("resize", arguments);
		var tagetObj = dojo.byId("iedResizeDiv");
		var targetEditBoxDijit = dijit.byId("davinciIleb");
		targetEditBoxDijit.resize({h: tagetObj.clientHeight -12, w: tagetObj.clientWidth});
		var smartInputRadioDivWidth = tagetObj.clientWidth -12;
		var obj = dojo.byId("davinci.ve.input.SmartInput_radio_div");
		dojo.style(obj,'width',smartInputRadioDivWidth+ "px");
		
	},
	


	updateSimStyle: function(e){
		
		var n = dijit.byId("davinciIleb");
		var targetEditBoxDijit = dojo.query(".dijitEditorIFrame", n.domNode);
		var simObj = dojo.byId("smartInputSim");
		if (simObj){
			var s = dojo.style(targetEditBoxDijit[0]);
			dojo.style(simObj,'backgroundColor',s.backgroundColor);
			dojo.style(simObj,'height','22px');
		}
		
		
	}
			
		
});
});