/**
 * @class davinci.js.BinaryOperation
 * @extends davinci.js.Expression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression"
], function(declare, JSExpression) {

return declare("davinci.js.JSBinaryOperation", JSExpression, {

	constructor: function() {
		this.elementType = "JSBinaryOperation";
		this.left = null;
		this.right = null;
		this.operator = 0;

	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		return s + this.left.getText(context) + this.operator
		+ this.right.getText(context);
	},

	visit: function(visitor) {
		var dontVisitChildren;
		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			this.left.visit(visitor);
			this.right.visit(visitor);
		}

		if (visitor.endVisit)
			visitor.endVisit(this);
	}

});
});