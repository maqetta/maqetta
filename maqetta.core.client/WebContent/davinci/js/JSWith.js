/**
 * @class davinci.js.With
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement",
], function(declare, JSExpression) {

return declare("davinci.js.JSWith", JSElement, {

	constructor: function() {
		this.elementType = "JSWith";
		this.expr = null;
		this.action = null;
		this.nosemicolon = true;
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		s += "with ( " + this.expr.getText(context) + " )";
		context.indent += 2;
		s = s + this.printStatement(context, this.action);
		context.indent -= 2;
		return s;
	},

	getLabel: function() {

		return "with ( " + this.expr.getText(context) + " )";
	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			this.action.visit(visitor);
		}
		if (visitor.endVisit) {
			visitor.endVisit(this);
		}
	}

});
});
