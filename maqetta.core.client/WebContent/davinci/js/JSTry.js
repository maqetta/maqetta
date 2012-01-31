/**
 * @class davinci.js.JSTry
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement",
], function(declare, JSExpression) {

return declare("davinci.js.JSTry", JSElement, {

	constructor: function() {
		this.elementType = "JSTry";
		this.stmt = null;
		this.catchBlock = null;
		this.finallyBlock = null;
		this.catchArgument = null;
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}

		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}

		s += "try";
		s = s + this.printNewLine(context) + this.stmt.getText(context);
		if (this.catchBlock) {
			s = s + this.printNewLine(context) + "catch (" + this.catchArgument
			+ ")";
			s = s + this.printStatement(context, this.catchBlock);
		}
		if (this.finallyBlock) {
			s = s + this.printNewLine(context) + "finally";
			s = s + this.printStatement(context, this.finallyBlock);
		}
		return s;
	},

	getLabel: function() {
		return "try";
	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			this.stmt.visit(visitor);
			if (this.catchBlock)
				this.catchBlock.visit(visitor);
			if (this.finallyBlock)
				this.finallyBlock.visit(visitor);
		}
		if (visitor.endVisit) {
			visitor.endVisit(this);
		}
	}

});
});

