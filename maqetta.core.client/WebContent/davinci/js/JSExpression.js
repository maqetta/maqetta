/**
 * @class davinci.js.Expression
 * @constructor
 * @extends davinci.js.JSElement
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSExpression", JSElement, {

	constructor: function() {
		this.elementType = "JSExpression";
	},

	getText: function() {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		return s;
	}, 
	add: function(e) {
	}

});
});