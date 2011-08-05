dojo.provide("davinci.libraries.dojo.dojox.mobile.EdgeToEdgeListInput");
dojo.require("davinci.libraries.dojo.dijit.layout.ContainerInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.dojo.dojox", "dojox");

dojo.declare("davinci.libraries.dojo.dojox.mobile.EdgeToEdgeListInput", davinci.libraries.dojo.dijit.layout.ContainerInput, {

	propertyName: "label",
	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
	helpText:  "",
	
	constructor : function() {
		var langObj = dojo.i18n.getLocalization("davinci.libraries.dojo.dojox", "dojox");
		this.helpText = langObj.edgeToEdgeListHelp;
	}

	
});
