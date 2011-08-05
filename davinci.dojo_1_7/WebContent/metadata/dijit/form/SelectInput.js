dojo.provide("davinci.libraries.dojo.dijit.form.SelectInput");
dojo.require("davinci.libraries.dojo.dijit.form.OptionsInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.dojo.dijit", "dijit");

dojo.declare("davinci.libraries.dojo.dijit.form.SelectInput", davinci.libraries.dojo.dijit.form.OptionsInput, {
	
	supportsHTML: "false",
	helpText: "",
	
	constructor : function() {
		var langObj = dojo.i18n.getLocalization("davinci.libraries.dojo.dijit", "dijit");
		this.helpText = langObj.selectInputHelp;
	},
	
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