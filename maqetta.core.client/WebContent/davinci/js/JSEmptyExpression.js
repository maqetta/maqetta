/**
 * @class davinci.js.EmptyExpression
 * @extends davinci.js.Expression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression"
], function(declare, JSExpression) {

return declare("davinci.js.JSEmptyExpression", JSExpression, {

	constructor: function() {
		this.elementType = "JSEmptyExpression";
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		return s + "";
	}

});
});