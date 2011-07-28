dojo.provide("davinci.libraries.dojo.dijit.layout.AccordionContainerInput");
dojo.require("davinci.libraries.dojo.dijit.layout.StackContainerInput");

dojo.declare("davinci.libraries.dojo.dijit.layout.AccordionContainerInput", davinci.libraries.dojo.dijit.layout.StackContainerInput, {
	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
    helpText:  "If you use any markup characters (&lt;,&gt;,&amp;), you need to specify whether the text represents literal (plain) text or HTML markup that should be parsed (using an innerHTML assignment)."

});