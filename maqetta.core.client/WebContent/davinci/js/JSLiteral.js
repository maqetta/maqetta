/**
 * @class davinci.js.JSLiteral
 * @extends davinci.js.JSExpression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression",
], function(declare, JSExpression) {

return declare("davinci.js.JSLiteral", JSExpression, {

	constructor: function() {
		this.elementType = "JSLiteral";
		this.value = null;
		this.type = type;
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}

		switch (this.type) {
		case "char":
			return s + "'" + this.value + "'";
		case "string":
			return s + '"' + this.value + '"';
		case "null":
		case "this":
		case "undefined":
		case "true":
		case "false":
			return s + this.type;
		}
		return s + this.value;
	}

});
});
