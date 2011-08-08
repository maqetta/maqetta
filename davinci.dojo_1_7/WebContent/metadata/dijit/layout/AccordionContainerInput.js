dojo.provide("davinci.libraries.dojo.dijit.layout.AccordionContainerInput");
dojo.require("davinci.libraries.dojo.dijit.layout.StackContainerInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.dojo.dijit", "dijit");

dojo.declare("davinci.libraries.dojo.dijit.layout.AccordionContainerInput", davinci.libraries.dojo.dijit.layout.StackContainerInput, {
	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
    helpText:  "",
    
    constructor : function() {
		var langObj = dojo.i18n.getLocalization("davinci.libraries.dojo.dijit", "dijit");
		this.helpText = langObj.accordionContainerInputHelp;
	}

});