dojo.provide("davinci.ve.input.TabBarInput");
dojo.require("davinci.ve.input.ContainerInput");

dojo.declare("davinci.ve.input.TabBarInput", davinci.ve.input.ContainerInput, {

	propertyName: "label",
	
	childType: "dojox.mobile.TabBarButton" // should really get this from the widget metadata
	
});
