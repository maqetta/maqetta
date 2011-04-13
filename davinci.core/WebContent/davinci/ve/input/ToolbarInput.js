dojo.provide("davinci.ve.input.ToolbarInput");
dojo.require("davinci.ve.input.ContainerInput");

dojo.declare("davinci.ve.input.ToolbarInput", davinci.ve.input.ContainerInput, {

	propertyName: "label",
	
	childType: "dijit.form.Button"
	
});
