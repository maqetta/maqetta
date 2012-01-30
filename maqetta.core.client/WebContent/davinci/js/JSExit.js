/**
 * @class davinci.js.Exit
 * @extends davinci.js.JSElement
 * @constructor "return" or "throw"
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSExit", JSElement, {

	constructor: function(statement) {
		this.elementType = "JSExit";
		this.statement = statement;
		this.expr = null;
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		s += this.statement;
		if (this.expr)
			s = s + " " + this.expr.getText(context);
		return s;
	}

});
});