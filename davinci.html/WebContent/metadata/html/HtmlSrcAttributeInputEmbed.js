dojo.provide("davinci.libraries.html.html.HtmlSrcAttributeInputEmbed");
dojo.require("davinci.libraries.html.html.HtmlSrcAttributeInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.html.html", "html");
var langObj = dojo.i18n.getLocalization("davinci.libraries.html.html", "html");

dojo.declare("davinci.libraries.html.html.HtmlSrcAttributeInputEmbed", davinci.libraries.html.html.HtmlSrcAttributeInput, {
    constructor: function(/*Object*/ args){
        this.supportsAltText = false;
    }
});