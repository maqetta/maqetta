dojo.provide("davinci.ve.input.SelectInput");
dojo.require("davinci.ve.input.OptionsInput");

dojo.declare("davinci.ve.input.SelectInput", davinci.ve.input.OptionsInput, {
	
	supportsHTML: "false",
	helpText: 'Enter multiple lines of text each line will correspond to a option item in the list. <br /> Indicate the default option to be selected with the "+" at the start of the line. ',
	
	getProperties: function(widget, options) {
		var oldValue = widget.attr("value");
		var value;
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			if (option.selected) {
				value = option.text;
				break;
			} else if(option.text == oldValue) {
				value = oldValue;
			}
		}
		return {value:value};
	}

});