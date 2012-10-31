/**
 * @class davinci.js.ConditionalExpression
 * @extends davinci.js.Expression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression"
], function(declare, JSExpression) {

return declare("davinci.js.JSConditionalExpression", JSExpression, {

	constructor: function() {
		this.condition = null;
		this.trueValue = null;
		this.falseValue = null;
		this.elementType = "JSConditionalExpression";
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		s += this.condition.getText(context) + " ? "
		+ this.trueValue.getText(context) + " : "
		+ this.falseValue.getText(context);
		return s;
	},

	visit: function(visitor) {
		var dontVisitChildren;
		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			this.condition.visit(visitor);
			this.trueValue.visit(visitor);
			this.falseValue.visit(visitor);
		}
		if (visitor.endVisit)
			visitor.endVisit(this);
	}

});
});