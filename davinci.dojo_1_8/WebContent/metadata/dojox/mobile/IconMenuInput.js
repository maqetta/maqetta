define([
	"dojo/_base/declare",
	"./IconContainerInput",
	"dojo/i18n!../../dojox/nls/dojox"
], function(
	declare,
	IconContainerInput,
	dojoxNLS
) {

return declare(IconContainerInput, {
	childType: "dojox/mobile/IconMenuItem",
	dialogTitle: dojoxNLS.iconMenuTitle
});
});
