define([
	"dojo/_base/declare",
	"davinci/model/Model"
], function(declare, Model) {

if (!davinci.html) {
    davinci.html={};
}

davinci.html._noFormatElements = {
    span:true,
    b:true,
    it:true
};

davinci.html.escapeXml = function(value) {
    if(!value){
        return value;
    }
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};

davinci.html.unEscapeXml = function(value) {
    if(!value || typeof value !== "string") {
        return value;
    }
    return value.replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
};

return declare("davinci.html.HTMLModel", Model, {
});
});