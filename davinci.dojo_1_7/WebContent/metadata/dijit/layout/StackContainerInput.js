dojo.provide("davinci.libraries.dojo.dijit.layout.StackContainerInput");
dojo.require("davinci.libraries.dojo.dijit.layout.ContainerInput");

dojo.declare("davinci.libraries.dojo.dijit.layout.StackContainerInput", davinci.libraries.dojo.dijit.layout.ContainerInput, {

	propertyName: "title",
	
	childType: "dijit.layout.ContentPane",
	supportsHTML: "true",
	helpText: 'Enter a comma-separated list of values, each value is used as the label.<br /> If you use any markup characters (&lt;,&gt;,&amp;), you need to specify whether the text represents literal (plain) text or HTML markup that should be parsed (using an innerHTML assignment).'

		
});