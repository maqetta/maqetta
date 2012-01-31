define([
	"dojo/_base/declare",
	"davinci/html/CSSElement"
], function(declare, CSSElement) {

return declare("davinci.html.CSSAtRule", CSSElement, {

	constructor: function() {
		this.elementType = "CSSAtRule";
	},

	getCSSFile: function() {
		return this.parent;
	},
	
	getText: function(context) {
		s = "@";
		s = s + this.name + " " + this.value + "\n";
		return s;
	}
});
});
