dojo.provide("davinci.ve.input.AccordionContainerInput");
dojo.require("davinci.ve.input.StackContainerInput");

dojo.declare("davinci.ve.input.AccordionContainerInput", davinci.ve.input.StackContainerInput, {
	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
    helpText:  "If you use any markup characters (&lt;,&gt;,&amp;), you need to specify whether the text represents literal (plain) text or HTML markup that should be parsed (using an innerHTML assignment)."

});