/**
 * @class davinci.js.JSParenExpression
 * @extends davinci.js.JSExpression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression",
], function(declare, JSExpression) {

return declare("davinci.js.JSParenExpression", JSExpression, {

	constructor: function() {
		this.elementType = "JSParenExpression";
		this.expression = null;
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		s += "(" + this.expression.getText(context) + ")";
		return s;
	},

	visit: function(visitor) {
		var dontVisitChildren;
		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			this.expression.visit(visitor);
		}
		if (visitor.endVisit) {
			visitor.endVisit(this);
		}
	}

});
});
