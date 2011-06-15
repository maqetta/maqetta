dojo.provide("davinci.ve.input.AccordionContainerInput");
dojo.require("davinci.ve.input.StackContainerInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ve", "veLang");
var langObj = dojo.i18n.getLocalization("davinci.ve", "veLang");

dojo.declare("davinci.ve.input.AccordionContainerInput", davinci.ve.input.StackContainerInput, {
	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
    helpText:  langObj.accordionContainerInputHelp

});