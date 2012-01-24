define([
    	"dojo/_base/declare",
    	"davinci/libraries/html/html/HtmlSrcAttributeInput"
    ], function(declare, HtmlSrcAttributeInput){

return declare("davinci.libraries.html.html.HtmlSrcAttributeInputEmbed", HtmlSrcAttributeInput, {

	constructor: function(/*Object*/args) {
		this.supportsAltText = false;
	}
});
});