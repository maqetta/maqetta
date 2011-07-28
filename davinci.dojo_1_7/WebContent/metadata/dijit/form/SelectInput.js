dojo.provide("davinci.libraries.dojo.dijit.form.SelectInput");
dojo.require("davinci.libraries.dojo.dijit.form.OptionsInput");

dojo.declare("davinci.libraries.dojo.dijit.form.SelectInput", davinci.libraries.dojo.dijit.form.OptionsInput, {
	
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