define([
	"dojo/_base/declare",
	"dijit/form/_TextBoxMixin",
	"davinci/ve/input/SmartInput",
	"davinci/Workbench",
	"davinci/ve/commands/ModifyCommand",
	"dojo/i18n!../nls/dojox"
], function(
	declare,
	_TextBoxMixin,
	SmartInput,
	Workbench,
	ModifyCommand,
	dojoxNls
) {

return declare(SmartInput, {

	property: "value",
	supportsHTML: "false",
	displayOnCreate: "false",
	helpText: "",
	
	constructor : function() {
		this.helpText = dojoxNls.spinWheelSlotHelp;
	},
	
	serialize: function(widget, updateEditBoxValue, value) {
		var labelFrom = widget.attr('labelFrom');
		var labelTo = widget.attr('labelTo');
		if (labelFrom < labelTo) {
			value = labelFrom + '-' + labelTo;
		} else {
			value = '';
			var result = widget.attr('labels');
			for (var i = 0, len = result.length; i < len; i++) {
				value += (i > 0) ? "," : "";
				value += result[i];
			}
		}
		this.updateEditBoxValue(value); 
	},
	
	updateWidget: function(value) {
		if (this._widget._destroyed) {
			return;
		}
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
				var content = this.getHelpText();
				var title = 'Invalid Value';
				Workbench.showMessage(title, content);
				return;
			}
		}

		var node = this._node(this._widget),
			context = this._widget.getContext(),
			command = new ModifyCommand(this._widget, values, context);
		this._widget._edit_context.getCommandStack().execute(command);
		this._widget=command.newWidget;	
		this._widget._edit_context._focuses[0]._selectedWidget = this._widget; // get the focus on the current node
        context.select(this._widget, null, false); // redraw the box around the widget
	},
	
	updateEditBoxValue: function(value) {
		this._inline.style.display = "block";
		this.setFormat(value);
		this._inline.eb.attr('value', String(value));
		this.updateFormats();
		this.help(false);  // first time, don't display help but resize as needed
		_TextBoxMixin.selectInputText(this._inline.eb.textbox);
		this.updateSimStyle();
	}

});

});