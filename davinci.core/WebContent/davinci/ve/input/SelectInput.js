dojo.provide("davinci.ve.input.SelectInput");
dojo.require("davinci.ve.input.OptionsInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ve", "veLang");
var langObj = dojo.i18n.getLocalization("davinci.ve", "veLang");

dojo.declare("davinci.ve.input.SelectInput", davinci.ve.input.OptionsInput, {
	
	supportsHTML: "false",
	helpText: langObj.selectInputHelp,
	
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