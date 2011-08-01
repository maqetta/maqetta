dojo.provide("davinci.libraries.dojo.dojox.mobile.SpinWheelSlotInput");
dojo.require("davinci.ve.input.SmartInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.dojo.dojox", "dojox");
var langObj = dojo.i18n.getLocalization("davinci.libraries.dojo.dojox", "dojox");

dojo.declare("davinci.libraries.dojo.dojox.mobile.SpinWheelSlotInput", davinci.ve.input.SmartInput, {

	property: "value",
	supportsHTML: "false",
	displayOnCreate: "false",
	helpText: langObj.spinWheelSlotHelp,
	
	serialize: function(widget, updateEditBoxValue, value) {


		value = '';
		var result = widget.attr('labels');
		var labelFrom = widget.attr('labelFrom');
		var labelTo = widget.attr('labelTo');
		value = '';
		if (labelFrom < labelTo){
			var labelFrom = widget.attr('labelFrom');
			var labelTo = widget.attr('labelTo');
			value = labelFrom + '-' + labelTo;
		} else {
			for (var i = 0; i < result.length; i++){
				value += (i>0)?",":"";
				value += result[i];
			}
		}
		this.updateEditBoxValue(value); 
	},
	
	
	updateWidget: function(value){
		
		if (this._widget._destroyed)
			return;
		var values = {};
		var result = value.split('-'); 
		if (result.length === 2 && isFinite(result[0]) && isFinite(result[1]) && (result[0] < result[1]) ){
			values.labelFrom = result[0];
			values.labelTo = result[1];
			values.labels ='';
		} else {
			result = value.split(','); 
			if (result.length > 1) { // first check for array of values
				values.labels = result;
				values.labelFrom = '';
				values.labelTo = '';
			} else {
				content = this.getHelpText();
				title = 'Invalid Value';
				 var errorDialog = new davinci.ui.Error({errorText: content});
		            davinci.Workbench.showModal(errorDialog, title);
				return;
			}
		}
		

		var node = this._node(this._widget);
        var context=this._widget.getContext();
	
		command = new davinci.ve.commands.ModifyCommand(this._widget, values, context);
		this._widget._edit_context.getCommandStack().execute(command);
		this._widget=command.newWidget;	
		this._widget._edit_context._focuses[0]._selectedWidget = this._widget; // get the focus on the current node
        context.select(this._widget, null, false); // redraw the box around the widget

	},
	
	updateEditBoxValue: function(value){

		this._inline.style.display = "block";
		this.setFormat(value);
		this._inline.eb.attr('value', String(value));
		this.updateFormats();
		this.help(false);  // first time, don't display help but resize as needed
		dijit.selectInputText(this._inline.eb.textbox);
		this.updateSimStyle();
	}
});