dojo.provide("davinci.ve.input.StackContainerInput");
dojo.require("davinci.ve.input.ContainerInput");

dojo.declare("davinci.ve.input.StackContainerInput", davinci.ve.input.ContainerInput, {

	propertyName: "title",
	
	childType: "dijit.layout.ContentPane",
	supportsHTML: "true",
	helpText: 'Enter a comma-separated list of values, each value is used as the label.<br /> If you use any markup characters (&lt;,&gt;,&amp;), you need to specify whether the text represents literal (plain) text or HTML markup that should be parsed (using an innerHTML assignment).'

		
});