define([
	"dojo/_base/declare",
	"./StackContainerInput",
	"dojo/i18n!../nls/dijit"
], function(
	declare,
	StackContainerInput,
	dijitNls
) {

return declare("davinci.libraries.dojo.dijit.layout.AccordionContainerInput", StackContainerInput, {
	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
    helpText:  "",
    
    constructor : function() {
		this.helpText = dijitNls.accordionContainerInputHelp;
	}
});

});