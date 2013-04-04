define([
	"dojo/_base/declare",
	"./OptionsInput",
	"dojo/i18n!../nls/dijit"
], function(
	declare,
	OptionsInput,
	dijitNls
) {

return declare(OptionsInput, {

	supportsHTML: "false",
	helpText: "",
	
	constructor : function() {
		this.helpText = dijitNls.selectInputHelp;
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

});