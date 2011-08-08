dojo.provide("davinci.libraries.dojo.dijit.layout.StackContainerInput");
dojo.require("davinci.libraries.dojo.dijit.layout.ContainerInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.dojo.dijit", "dijit");

dojo.declare("davinci.libraries.dojo.dijit.layout.StackContainerInput", davinci.libraries.dojo.dijit.layout.ContainerInput, {


	propertyName: "title",

	supportsHTML: "true",
	helpText: "",
	
	constructor : function() {
		var langObj = dojo.i18n.getLocalization("davinci.libraries.dojo.dijit", "dijit");
		this.helpText = langObj.stackContainerInputHelp;
	}

		
});