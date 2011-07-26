dojo.provide("davinci.ve.input.EdgeToEdgeListInput");
dojo.require("davinci.ve.input.ContainerInput");

dojo.declare("davinci.ve.input.EdgeToEdgeListInput", davinci.ve.input.ContainerInput, {

	propertyName: "label",
	multiLine: "true",
	childType: "dojox.mobile.ListItem",
	format: "rows",
	supportsHTML: "true",
	helpText:  "Enter one list item per line."

	
});
