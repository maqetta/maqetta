dojo.provide("davinci.libraries.dojo.dojox.mobile.EdgeToEdgeListInput");
dojo.require("davinci.libraries.dojo.dijit.layout.ContainerInput");

dojo.declare("davinci.libraries.dojo.dojox.mobile.EdgeToEdgeListInput", davinci.libraries.dojo.dijit.layout.ContainerInput, {

	propertyName: "label",
	multiLine: "true",
	childType: "dojox.mobile.ListItem",
	format: "rows",
	supportsHTML: "true",
	helpText:  "Enter one list item per line."

	
});
