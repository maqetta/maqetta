define([
	"dojo/_base/declare",
	"./layout/ContainerInput"
], function(
	declare,
	ContainerInput
) {

return declare("davinci.libraries.dojo.dijit.ToolbarInput", ContainerInput, {

	propertyName: "label",
	supportsHTML: true
	
});

});