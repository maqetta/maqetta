define([
	"dojo/_base/declare",
	"dojo/dom-geometry",
	"davinci/ve/commands/ModifyRichTextCommand",
	"dijit/layout/ContentPane",
	"dijit/form/SimpleTextarea",
	"dijit/form/TextBox",
	"dojox/html/entities",
	"dojox/html/ellipsis",
	"dojox/layout/ResizeHandle",
	"dojo/i18n!davinci/ve/nls/ve",
	"dojo/i18n!dijit/nls/common"
], function(declare, domGeometry, ModifyRichTextCommand, ContentPane, SimpleTextarea, TextBox, entities, ellipsis, ResizeHandle, veNls, commonNls){

	// temporary workaround for nls.  the i18n dependencies aren't loading properly
//	veNls = dojo.i18n.getLocalization("davinci.ve","ve");
//	commonNls = dojo.i18n.getLocalization("dijit","common");

return declare("davinci.ve.input.SmartInput", null, {

	property: null,
	_X_MOVE_RANGE: 10,
	_Y_MOVE_RANGE: 10,
	_POINTER_TOP_OFFSET: -13,
	
	multiLine: "false",
	//supportsHTML: "false",
	//helpText:  'If you use any markup characters (&lt;,&gt;,&amp;), you need to specify whether the text represents literal (plain) text or HTML markup that should be parsed (using an innerHTML assignment).',
	
	displayOnCreate: "true",
	_connection: [],
	
	getHelpText: function(){
		if (this.helpText) {
			return this.helpText;
		}
		if (this.isHtmlSupported()){
			return veNls.smartInputHelp1;
		} 
		return veNls.smartInputHelp2;
		
	},
	
	isHtmlSupported: function(){
		if (!this.supportsHTML){
			if ( this._widget.type.match("^html")=='html') { // default for html widgets is html is supported
				this.supportsHTML = "true";
			} else {
				this.supportsHTML = "false";
			}
		}
		
		if (typeof(this.supportsHTML) === 'boolean'){
			return this.supportsHTML;
		}
		
		if (this.supportsHTML=== 'true'){
			return true;
		} else {
			return false;
		}
	
	},
	
	parse: function(input) {
		return input;
	},

	parseItems: function(input) {
		if (this.trim) input = dojo.trim(input);
		var items;
		if (input.match(/[^\\][\r\n]/)) {
			items = this.parseItemsInRows(input);
		} else {
			items = this.parseItemsInColumns(input);
		}
		return items;
	},
	
	parseItemsInRows: function(input) {
		var items = this.splitRows(input);

		//TODO: try dojo.map
		var length = items.length;
		for (var i = 0; i < length; i++) {
			var item = items[i];
			item = this.parseItem(item);
			items[i] = item;
		}
		return items;
	},
	
	parseItemsInColumns: function(input) {
		var items = this.splitColumns(input);
		
		//TODO: try dojo.map
		var length = items.length;
		for (var i = 0; i < length; i++) {
			var item = items[i];
			item = this.parseItem(item);
			items[i] = item;
		}
		return items;
	},
	
	parseGrid: function(input) {
		var rows = this.splitRows(input);
		
		var numRows = rows.length;
		for (var i = 0; i < numRows; i++) {
			var row = rows[i];
			var items = this.parseItemsInColumns(row);
			rows[i] = items;
		}
		return rows;		
	},

	parseItem: function (item) {
		var regex=/^([-~!>|(*)[+\]]*) ?(.*)$/;
		var specialChars=null;
		var text = item;
		
		var result=item.match(regex);
		if (result) {
			specialChars=result[1];
			text=result[2];
		}
		
		var indent=0;
		var disabled=false;
		var selected=false;
		var closednode=false;
		
		if (specialChars) {
			for (var i = 0; i < specialChars.length; i++){
				var c = specialChars[i];
				switch(c) {
					case '-':
					case '~':
					case '!':
						disabled = true;
						break;
					case '>':
						indent++;
						break;
					case '*':
					case '+':
						selected = true;
						break;
					default:
				}
			}
		}
		
		var parsedItem = {original:item, specialChars:specialChars, text:text, indent:indent, disabled:disabled, selected:selected};
		return parsedItem;
	},

	splitRows: function (text) {
		var split = [];
		var i;
		var line = "";
		var escaped = false;
		for(i = 0; i < text.length; i++){
			var c = text.charAt(i);
			switch(c){
				case '\\':
					if (escaped) {
						line += c;
					}
					escaped = !escaped;
					break;
				case 'r':
					if (escaped) {
						line += '\r';
						escaped = false;
					} else {
						line += c;
					}
					break;
				case 'n':
					if (escaped) {
						line += '\n';
						escaped = false;
					} else {
						line += c;
					}
					break;
				case '\r':
				case '\n':
					if (escaped) {
						line += c;
						escaped = false;
					} else {
						if (this.trim) line = dojo.trim(line);
						split.push(line);
						line = "";
					}
					break;
				default:
					line += c;
					escaped = false;
			}
		}
		if (line) {
			if (this.trim) line = dojo.trim(line);
			split.push(line);
		}
		return split;
	},
	
	splitColumns: function (text) {
		var split = [];
		var i;
		var line = "";
		var escaped = false;
		for(i = 0; i < text.length; i++){
			var c = text.charAt(i);
			switch(c){
				case '\\':
					if (escaped) {
						line += c;
					}
					escaped = !escaped;
					break;
				case 'r':
					if (escaped) {
						line += '\r';
						escaped = false;
					} else {
						line += c;
					}
					break;
				case 'n':
					if (escaped) {
						line += '\n';
						escaped = false;
					} else {
						line += c;
					}
					break;
				case ',':
					if (escaped) {
						line += c;
						escaped = false;
					} else {
						if (this.trim) line = dojo.trim(line);
						split.push(line);
						line = "";
					}
					break;
				default:
					line += c;
					escaped = false;
			}
		}
		if (line) {
			if (this.trim) line = dojo.trim(line);
			split.push(line);
		}
		return split;
	},
	
	serializeItems: function(items) {
		var result = this.format == "columns" ? this.serializeColumns(items) : this.serializeRows(items);
		return result;
	},
	
	serializeColumns: function(items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			item = item.replace(/\\/g, "\\\\");
			items[i] = item.replace(/,/g, "\\,");
		}
		var result = items.join(", ");
		return result;
	},
	
	serializeRows: function(items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			item = item.replace(/\\/g, "\\\\");
			items[i] = item.replace(/\n/g, "\\\n");
		}
		var result = items.join("\n");
		return result;
	},
	
	inlineEditActive: function() {
		if(this._inline && this._inline.style.display != "none" && this._inline.eb){
			return true;
		}else{
			return false;
		}
	},
	
	show: function(widgetId) {
		this._widget = davinci.ve.widget.byId(widgetId);
		
		if (!this._inline) {
			this._createInline();

		}


		var updateEditBoxValue = dojo.hitch(this, function(value){
			this._inline.style.display = "block";
			this.setFormat(value);
			var customMap = [
			                  ["\u0026","amp"], 
			                  ["\u0022","quot"],
			                  ["\u003C","lt"], 
			                  ["\u003E","gt"]/*,
			                  ["\u00A0","nbsp"]*/
		                     ]; 
			value = entities.decode(value, customMap);
			this._inline.eb.set('value', String(value));
			this.updateFormats();
			this.help(false);  // first time, don't display help but resize as needed
			dijit.selectInputText(this._inline.eb.textbox);
			this.updateSimStyle();
			this._inline.eb.textbox.focus();
		});

		var node = this._node(this._widget);
		
		var property = this.property;
		var djprop = (property==="maq_innerText") ? "innerHTML" : property;
		var value;
		if (property) {
			if (node) {
				value = dojo.attr(node, djprop);
			} else if (djprop === "innerHTML" || djprop == "textContent"){
				value = this._widget._srcElement.getElementText(this._context); // wdr
				// Collapse all white space before showing content
				value = value.replace(/\s+/g,' ');

			}else {
				value = this._widget.attr(property);
			}
		}
		
		if (this.serialize) {
			this.serialize(node || this._widget, updateEditBoxValue, value);
		}
		else if (property) {
			updateEditBoxValue(value);
		}
	},
		
	_createInline: function(){

		
		if (this.multiLine && this.multiLine != "false"){
			this._loading(115, 200 /*, 'auto', 'auto'*/);
			var t = this._getTemplate();
			this._inline.set("content",t);
		}else {
			this._loading(85, 200);
			var t = this._getTemplate();
			this._inline.set("content",t);
		}

		this._inline.eb = dijit.byId("davinciIleb");
		this._connection.push(dojo.connect(this._inline.eb, "onMouseDown", this, "stopEvent"));
		this._connection.push(dojo.connect(this._inline.eb, "onKeyDown", this, "stopEvent_Intercept_Enter"));
		this._connection.push(dojo.connect(this._inline.eb, "onKeyUp", this, "handleEvent"));
		if (this.multiLine == "true"){                                  
/*FIXME: TO DIRECT TO PROPS PALETTE, NEED TO DISABLE */
			this._connection.push(dojo.connect(this._inline.eb, "onBlur", this, "onBlur"));
/*ENDFIXME*/
			this._connectSimDiv();

		}

		
		var text = this._widget._srcElement.getElementText(this._context); // just the inside text
		this._inline.eb.setValue(text);
		this._loadingDiv.style.backgroundImage = 'none'; // turn off spinner
		this._inline._setStyleAttr({display: "block"});
		this._connectHelpDiv();
		this._connectResizeHandle();
		/* 
		 * dijit/focus._onBlurNode is setting a setTimeout to deal with OnBlur events.
		 * 
		   // if the blur event isn't followed by a focus event then mark all widgets as inactive.
			if(this._clearActiveWidgetsTimer){
				clearTimeout(this._clearActiveWidgetsTimer);
			}
			this._clearActiveWidgetsTimer = setTimeout(lang.hitch(this, function(){
				delete this._clearActiveWidgetsTimer;
				this._setStack([]);
				this.prevNode = null;
			}), 100);
          * 
          *  SmartInput is setting the focus on the smart input widget box so when the dijit.focus
          *  setTimeout fires the _setStack changes the focus, fire our onBlur closing the edit box.
          *  This only seems to be an issue for SackContainerInput and mostly for Accordion.
          *  So I added the timeout below to wait until after the diji.focus has fired.
          *  FIXME: There must be a better solution than this!
		 */
		
		window.setTimeout(function(){
			if(this._inline && this._inline.eb && this._inline.eb.textbox){
				this._inline.eb.textbox.focus();
			}
/*FIXME: DISABLING FOR NOW */
			this._connection.push(dojo.connect(this._inline, "onBlur", this, "onOk")); //comment out for debug
/*ENDFIXME*/
		}.bind(this), 500);
		
		this.resize(null);

	
	},
	
	_connectHelpDiv: function(){
		var help = dojo.byId('davinci.ve.input.SmartInput_img_help');
		this._connection.push(dojo.connect(help, "onclick", this, "toggleHelp"));
		// since the button is a submit button, we need to listen to _onSubmit as it is expecting a form widget
		this._connection.push(dojo.connect(dijit.byId('davinci.ve.input.SmartInput_ok'), "_onSubmit", this, "onOk")); // same effect ad click away..
		this._connection.push(dojo.connect(dijit.byId('davinci.ve.input.SmartInput_cancel'), "onClick", this, "onCancel")); // same effect ad click away..
	},
	
	_findSmartInputContainer: function(frameNode){
/*FIXME: With new design, put SmartInput onto BODY*/
		return document.body;
/*FIXME: TO DIRECT TO PROPS PALETTE, NEED TO DISABLE*/
		var smartInputContainer = frameNode.parentNode;
		while(!dojo.hasClass(smartInputContainer,'dijitContentPane')){
			smartInputContainer = smartInputContainer.parentNode;
		}
		return smartInputContainer;
/*ENDFIXME*/
/*FIXME: TO DIRECT TO PROPS PALETTE, NEED TO ENABLE
		return document.querySelector('.primaryPropertiesContainer') || document.body;
*/
	},
	
	_loading: function(height, width /*, styleHeight, styleWidth*/){

		var iframeNode = this._widget._edit_context.frameNode;
		var doc = iframeNode.ownerDocument;
		var loading = doc.createElement("div");
		var smartInputContainer = this._findSmartInputContainer(iframeNode);
		if(!smartInputContainer){
		//loading.innerHTML='<table><tr><td>'+langObj.loading+'</td></tr></table>';
			return;
		}
		smartInputContainer.appendChild(loading);
		this._loadingDiv = loading;
/*FIXME: TO DIRECT TO PROPS PALETTE, NEED TO DISABLE*/
		dojo.addClass(loading,'smartInputLoading');
/*ENDFIXME*/
		var inline= doc.createElement("div");
		inline.id = 'ieb';
/*FIXME: TO DIRECT TO PROPS PALETTE, NEED TO DISABLE*/
		dojo.addClass(inline,'inlineEdit dijitTooltipContainer');
/*ENDFIXME*/
		var inlinePointer = doc.createElement("div");
		inlinePointer.id = 'iebPointer';
		//dojo.addClass(inlinePointer,'inlineEditConnectorBelow');
		this._inline = inline;
		smartInputContainer.appendChild(inline);
		smartInputContainer.appendChild(inlinePointer);
/*FIXME: TO DIRECT TO PROPS PALETTE, NEED TO DISABLE*/
		var m2 = new dojo.dnd.Moveable("ieb");
		this._connection.push(dojo.connect(m2, "onMoveStart", this, "onMoveStart")); 
		this._connection.push(dojo.connect(m2, "onMoveStop", this, "onMoveStop")); 
/*ENDFIXME*/

		var pFloatingPane = new ContentPane({}, inline);
		
		this._inline = pFloatingPane;

		// lets position the coverup
		var veContentArea = dijit.byId("editorsStackContainer").domNode; 
		var p = domGeometry.position(veContentArea);
		this._loadingDiv.style.position = "absolute";
		this._loadingDiv.style.left = p.x+"px";
		this._loadingDiv.style.top = p.y+"px";
		this._loadingDiv.style.width = p.w+"px";
		this._loadingDiv.style.height = p.h+"px";

		var box = this._widget.getMarginBox();
		var iframe_box = dojo.position(iframeNode);
		var contentPane_box = dojo.position(smartInputContainer);
		// Take into account iframe shifting due to mobile silhouettes
		// The extra -1 needed to avoid extra pixel shift, probably for a border
		var silhouette_shift_x = (iframe_box.x - contentPane_box.x) + smartInputContainer.scrollLeft - 1;
		var silhouette_shift_y = (iframe_box.y - contentPane_box.y) + smartInputContainer.scrollTop - 1;
		var clientHeight = smartInputContainer.clientHeight;
		var clientWidth = smartInputContainer.clientWidth;
        // find the correct placement of box  based on client viewable area
		var yOffset = 26;
		var top = yOffset;
		var pointerLocation = 0;
		if ((box.y + height + yOffset) < clientHeight){
			top = box.y /*box.t*/  +  yOffset;
			dojo.addClass(inlinePointer,'inlineEditConnectorBelow');
		}else if((box.y - height /*- yOffset*/) > 0){
			top = box.y - height /*- yOffset /*box.t*/ ;
			//dojo.addClass(inlinePointer,'inlineEditConnectorAbove');
			pointerLocation = height + 12;
		} else {
			top = 0 /*box.t*/  + yOffset ;
		}
		var left = '0';
;
		if ((box.x + width + 20) < clientWidth){
			left = box.x /*box.t*/  ;
		}else if((box.x + width) > clientWidth){
			var t = box.x - width + box.w /*20*/ /*box.t*/;
			
			if (t < 0){
				t = 0;
			}
			left = t ;
		} 
		left += silhouette_shift_x;
		top += silhouette_shift_y;
		
		this._inline._setStyleAttr({display: "block", /*backgroundColor: "red",*/ top: top + 'px', left: left + 'px',  padding:"1px", overflow: "hidden", backgroundImage: "none"}); // padding needed to keep scroll bars off
		this._startTop = top;
		this._startLeft = left;
		dojo.style(inlinePointer, 'left', box.x + 20 + silhouette_shift_x + 'px');
		//dojo.style(inlinePointer, 'left', left + 20 + pointerLocation +  'px');
		
		dojo.style(inlinePointer, 'top', top + pointerLocation + this._POINTER_TOP_OFFSET  + 'px');
				

	},
	
	handleEvent: function(event){
		switch (event.keyCode) {
			case 13: // enter
				var multiLine = this.multiLine;

				if (!multiLine || multiLine == "false" || this._lastKeyCode == 13 || event.ctrlKey) {
					this.onOk();
				} else if (event.which == dojo.keys.ENTER && event.ctrlKey) {
					this.onOk();
				}
				break;

			case 27: // ESC
				this.onCancel();
				break;

			default:
				this.updateFormats();
		}

		this._lastKeyCode = event.keyCode;
		this.updateSimStyle();
	},
	
	onOk: function(e){
		this.hide();
	},
	
	onCancel: function(e){
		this.hide(true);
	},
	
//	onMouseOver: function(e){
//		dojo.addClass(e.target, "inlineEditHelpOkCancel");
//		
//	},
//	
//	onMouseOut: function(e){
//		dojo.removeClass(e.target, "inlineEditHelpOkCancel");
//	},
	
	onMoveStart: function(mover){
	
		dojo.style('iebPointer', 'display', 'none');
		
	},
	
	onMoveStop: function(mover){
		
		var left = dojo.style('ieb', 'left');
		var top = dojo.style('ieb', 'top');
		var moveLeft = this._startLeft - left;
		var moveTop = top - this._startTop;
		if (moveTop < this._Y_MOVE_RANGE &&  moveTop > (-this._Y_MOVE_RANGE) ){
			dojo.style('iebPointer', 'display', '');
			dojo.style('iebPointer', 'top', this._startTop + this._POINTER_TOP_OFFSET + moveTop + 'px');
		}else{
			dojo.style('iebPointer', 'display', 'none'); // out or range so we are done
			return;
		}
		if (moveLeft < this._X_MOVE_RANGE &&  moveLeft > (-this._X_MOVE_RANGE)){
			dojo.style('iebPointer', 'display', '');
		}else{
			dojo.style('iebPointer', 'display', 'none'); // out or range so we are done
			return;
		}
		
		
	},
		
	stopEvent: function(e){
		// Don't let mousedown event bubble up to daVinci main processing.
		// Mainline logic of daVinci will interpret it as an attempt to select an object
		// and since the click is in the inline edit control, which isn't a document widget,
		// this will end up as an unselect-all action.
		//FIXME stopPropation() doesn't work on old IEs
		e.stopPropagation();
		this.updateSimStyle();
	},
	
	stopEvent_Intercept_Enter: function(e){
		this.stopEvent(e);
		// For single-line SmartInput, don't let Enter key
		// wipe out the currently selected text input
		if(e.keyCode == 13 && !this.multiLine){
			e.preventDefault();
		}
	},
	
	
	_node: function() {
		var node;
		var path = this.path;
		var selector = this.selector;
		if (path || selector) {
			node = this._widget.domNode; 
			if (path) {
				node = dojo.getObject(path, false, this._widget);
			}
			if (selector) {
				node = dojo.query(selector, node)[0];
			}
		}
		return node;
	},
	
	updateWidget: function(value){
		
		if (this._widget._destroyed)
			return;

			if (this.parse) {
				value = this.parse(value);
			}

			var node = this._node(this._widget);
			var context=this._widget.getContext();
			var inlineEditProp = this.property;
			var djprop = (inlineEditProp==="maq_innerText") ? "innerHTML" : inlineEditProp;
			if (this.update) {
					
				var updatedWidget = this.update(node || this._widget, value, inlineEditProp);
                if (updatedWidget) {
                    this._widget = updatedWidget; // FIXME: this was this_selectedWidget
                }
                //dojo.publish("/davinci/ui/selectionPropertiesChange",[{editor:null, widget:this._selectedWidget, subwidget:null, cssValues:null, computedCssValues:null}]); // update the object pallete
				//this._selectedWidget._edit_context.select(this._selectedWidget, null, false); // redraw the box around the widget
                context.select(this._widget, null, false); // redraw the box around the
            }
			else if (inlineEditProp) {
				if (node) {
					dojo.attr(node, djprop, value); // FIXME: Make this work with serialization/undo stack
					// FIXME: Need to serialize changes into the model
					// The follow code, however, doesn't work for some reason. May need to ask Phil.
					// Also, the code doesn't take into account 'selector'. Model needs something like
					// dojo.query to put a property on a particular node.
					//var srcElement = this._selectedWidget._srcElement;	//FIXME: Shouldn't there be a getSourceElement in widget.js?
					//srcElement.addAttribute(inlineEditProp, value);
				} else {
					var values={};
					if (value && (typeof value == 'string')){
						value = value.replace(/\n/g, ''); // new lines breaks create widget richtext
					}
					var children = null;
					if (inlineEditProp == 'textContent'){
						// set the children to be the same as the textContect so the dom is correct.
						children = value;
						
					}else{
						values[inlineEditProp]=value;
					}
					var command;

					if (djprop === 'innerHTML'){
						values.richText = values[inlineEditProp];
						delete values[inlineEditProp];
						command = new ModifyRichTextCommand(this._widget, values, null, context);
					}else{
						command = new davinci.ve.commands.ModifyCommand(this._widget, values, children, context);
					}
					this._widget._edit_context.getCommandStack().execute(command);
					this._widget=command.newWidget;	
					this._widget._edit_context._focuses[0]._selectedWidget = this._widget; // get the focus on the current node
				}
                context.select(this._widget, null, false); // redraw the box around the widget
			}

	},
	
	hide: function(cancel){
		if (this._inline) {
			var value;
			while (connection = this._connection.pop()){
				if (connection) {
					dojo.disconnect(connection);
				}
			}
			var smartInputContainer = this._findSmartInputContainer(this._widget._edit_context.frameNode);
			if(!smartInputContainer){
				console.log('ERROR. SmartInput.js _loading(). No ancestor ContentPane');
				return;
			}
			if (this._loadingDiv) {
				smartInputContainer.removeChild(this._loadingDiv);
			}
			if(this._inline.style.display != "none" && this._inline.eb){
				value = this._inline.eb.get('value');
				this._value = value;
				this._format = this.getFormat();
				this._inline.style.display = "none";
				if (this._inline.eb){
					this._inline.eb.destroyRecursive();
					delete this._inline.eb;
				}
				this._inline.destroyRecursive();
				delete this._inline;  
                var iebPointer = smartInputContainer.ownerDocument.getElementById('iebPointer');
				smartInputContainer.removeChild(iebPointer);
				
				if(value != null && !cancel){
				if (!this.disableEncode && this._format === 'text' ) // added to support dijit.TextBox that does not support html markup in the value and should not be encoded. wdr
						value = entities.encode(value);
				
					this.updateWidget(value);
				}
				var context=this._widget.getContext();
				var userdoc = context.getDocument();	// inner document = user's document
				userdoc.defaultView.focus();	// Make sure the userdoc is the focus object for keyboard events
			}
 
		}
	},
	
	getFormat: function(){
		var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
		var format = 'text';
		if (htmlRadio && htmlRadio.checked)
			format = 'html';
		return format;
	},
	
		

		containsHtmlMarkUp: function (str){
			
//			var str2 =  entities.encode(str);
//			if (str === str2) {
//				return false;
//			} 
//			return true;
			
			var n = dojo.create("div", { innerHTML: str});
			if (n.children.length > 0){
				return true;
			}else{
				return false;
			}
		},
		
		toggleHelp: function(){

			var help = dojo.byId('davinci.ve.input.SmartInput_img_help');
			if (dojo.hasClass(help, "inlineEditHelpSelected")){
				this.help(false);
			} else {
				this.help(true);
			}
			dojo.toggleClass(help, "inlineEditHelpSelected");
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
//				if (this.isHtmlSupported()){
//					dojo.style(radioDiv, 'height', '60px');
//				} else {
//					dojo.style(radioDiv, 'height', '40px'); // div can be smaller, no text is displayed
//				}
			}
		},
		
		updateFormats: function(){
			
			var value = this._inline.eb.get('value');
			var disabled = true;
			if (this.containsHtmlMarkUp(value)) {
				disabled = false;
			}
			
			// NOTE: if you put a break point in here while debugging it will break the dojoEllipsis
			var localDojo = this._widget.getContext().getDojo();
			var textObj = dojo.byId("davinci.ve.input.SmartInput_radio_text_width_div");
			//var what = entities.encode(dojox.html.entities.encode(value));
			var what = entities.encode(value);
			textObj.innerHTML = '<div class="dojoxEllipsis">' + dojo.replace('Plain text ({0})', [what]) + '</div>'; // FIXME: i18n
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
		
		resize: function(e){
			var targetObj = dojo.byId("iedResizeDiv");
			var targetEditBoxDijit = dijit.byId("davinciIleb");
			var boxWidth = targetObj.clientWidth  - 5;
			var boxheight = targetObj.clientHeight -6;
			var smartInputRadioDivWidth = targetObj.clientWidth -10;
			boxWidth = targetObj.clientWidth  /*+2*/ -8;
			boxheight = targetObj.clientHeight  -20; // new for text area
			smartInputRadioDivWidth = targetObj.clientWidth -9;
			var simObj = dojo.byId("smartInputSim");
			dojo.style(simObj,'width',boxWidth + 10 + "px");
			this.updateSimStyle();
		
			if (targetEditBoxDijit) {
				targetEditBoxDijit._setStyleAttr({width: boxWidth + "px", height: boxheight + "px", maxHeight: boxheight + "px"}); // needed for multi line
				targetEditBoxDijit._setStyleAttr({width: targetObj.clientWidth + "px"});
			}
			var obj = dojo.byId("davinci.ve.input.SmartInput_radio_div");
			dojo.style(obj,'width',smartInputRadioDivWidth+ 2 +"px");
			obj = dojo.byId("davinci.ve.input.SmartInput_radio_text_width_div");
			dojo.style(obj,'width',targetObj.clientWidth -50 + "px");
			obj = dojo.byId("davinci.ve.input.SmartInput_radio_html_width_div");
			dojo.style(obj,'width',targetObj.clientWidth -50 + "px");
		},
		
		onBlur: function(e){
			this.updateSimStyle(e);
		},
		
		updateSimStyle: function(e){
			
			var targetEditBoxDijit = dijit.byId("davinciIleb");
			var simObj = dojo.byId("smartInputSim");
			if (simObj){
				var s = dojo.style(targetEditBoxDijit.domNode);
				dojo.style(simObj,'borderColor',s.borderTopColor);
				dojo.style(simObj,'backgroundColor',s.backgroundColor);
			}
			
		},

		_getTemplate: function(){
			var editBox = ''+
				'<div id="iedResizeDiv" class="iedResizeDiv" >' + 
//			       '<input id="davinciIleb" class="davinciIleb smartInputTextBox" type="text"  dojoType="dijit.form.TextBox"  />' +
				   '<textarea  dojoType="dijit.form.SimpleTextarea" name="davinciIleb" trim="true" id="davinciIleb" class="smartInputTextArea" ></textarea>'+
				   '<div id="smartInputSim" class="smartInputSim" ></div>'+
					'<div id="iedResizeHandle" dojoType="dojox.layout.ResizeHandle" targetId="iedResizeDiv" constrainMin="true" maxWidth="200" maxHeight="600" minWidth="200" minHeight="55"  activeResize="true" intermediateChanges="true" ></div>' +
		//			'<div id="iedResizeHandle" dojoType="dojox.layout.ResizeHandle" targetId="iedResizeDiv" constrainMin="true" maxWidth="200" maxHeight="200" minWidth="200" minHeight="19" resizeAxis="x" activeResize="true" intermediateChanges="true" ></div>' +
				'</div>';
			if (this.multiLine === "true"){
				editBox = ''+
				'<div id="iedResizeDiv" class="iedResizeDiv" >' + 
					'<textarea  dojoType="dijit.form.SimpleTextarea" name="davinciIleb" trim="true" id="davinciIleb" class="smartInputTextAreaMulti" ></textarea>'+
					'<div id="smartInputSim" class="smartInputSim" ></div>'+
//					'<div id="smartInputSim" style="height:10px; border-color: #B5BCC7; border-style: solid; border-width: 0px 3px 3px 3px;  background-color: #F7FCFF;"></div>'+
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
//		             				'<div id="davinci.ve.input.SmartInput_radio_text_div" class="dojoxEllipsis">'+
//		             					'Plain text (Button)xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'+
//		             				'</div>'+
		             				'</div>'+
	             				'</td> ' +
             				'</tr>'+
             				'<tr> '+
             					'<td class="smartInputTd1"> <input id="davinci.ve.input.SmartInput_radio_html" showlabel="true" type="radio" dojoType="dijit.form.RadioButton"> </input>  </td> '+
             					'<td class="smartInputTd2">'+
             						'<div id="davinci.ve.input.SmartInput_radio_html_width_div" class="smartInputRadioTextDiv">'+
//             						'<div id="davinci.ve.input.SmartInput_radio_html_div" class="dojoxEllipsis">'+
//             							'HTML markup'+
//             						'</div>'+
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
			        	'<div dojoType="dijit.layout.ContentPane" class="smartInputHelpTextDivContentPane "style="padding:0;" >'+this.getHelpText()+ '</div> '+
			        	'<div style="text-align: left; padding:0; height:2px;" ></div> '+
			        '</div> '+
		        '</div>' + 
	        '</div> '+
	        '';
 			return template;
		},
		
		_connectResizeHandle: function(){
			var resizeHandle = dijit.byId('iedResizeHandle');
			this._connection.push(dojo.connect(resizeHandle, "onResize", this, "resize"));
		},
		
		_connectSimDiv: function(){
			this._connection.push(dojo.connect(this._inline.eb, "onFocus", this, "updateSimStyle"));
			this._connection.push(dojo.connect(this._inline.eb, "onMouseOver", this, "updateSimStyle")); 
			this._connection.push(dojo.connect(this._inline.eb, "onMouseOut", this, "updateSimStyle"));
			this._connection.push(dojo.connect(dojo.byId(' davinci.ve.input.SmartInput_div'), "onclick", this, "updateSimStyle"));
		}
});
});
