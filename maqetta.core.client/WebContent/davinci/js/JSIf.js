/**
 * @class davinci.js.JSIf
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement",
], function(declare, JSExpression) {

return declare("davinci.js.JSIf", JSElement, {

	constructor: function() {
		this.elementType = "JSIf";
		this.expr = null;
		this.trueStmt = null;
		this.elseStmt = null;
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
		s += "if (" + this.expr.getText(context) + ")";
		context.indent += 2;
		s = s + this.printStatement(context, this.trueStmt);
		if (this.elseStmt != null) {
			context.indent -= 2;
			s = s + this.printNewLine(context) + "else";
			context.indent += 2;
			s = s + this.printStatement(context, this.elseStmt);
		}
		context.indent -= 2;
		return s;
	},

	getLabel: function() {
		return "if (" + this.expr.getLabel() + ")";
	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			this.expr.visit(visitor);
			if (this.trueStmt)
				this.trueStmt.visit(visitor);
			if (this.elseStmt)
				this.elseStmt.visit(visitor);
		}
		if (visitor.endVisit) {
			visitor.endVisit(this);
		}
	}

});
});