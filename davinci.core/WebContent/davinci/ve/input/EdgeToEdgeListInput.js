dojo.provide("davinci.ve.input.EdgeToEdgeListInput");
dojo.require("davinci.ve.input.ContainerInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ve", "ve");
var langObj = dojo.i18n.getLocalization("davinci.ve", "ve");

dojo.declare("davinci.ve.input.EdgeToEdgeListInput", davinci.ve.input.ContainerInput, {

	propertyName: "label",
	multiLine: "true",
	childType: "dojox.mobile.ListItem",
	format: "rows",
	supportsHTML: "true",
	helpText:  langObj.edgeToEdgeListHelp

	
});
