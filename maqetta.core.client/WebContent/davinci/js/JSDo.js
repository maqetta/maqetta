/**
 * @class davinci.js.Do
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSDo", JSElement, {

	constructor: function() {
		this.elementType = "JSDo";
		this.expr = null;
		this.action = null;
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		s += "do";
		context.indent += 2;
		s = s + this.printStatement(context, this.action);
		context.indent -= 2;
		var s = s + this.printNewLine(context) + "while ( "
		+ this.expr.getText(context) + " )";
		return s;

	},

	getLabel: function() {
		return "do while";
	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			this.expr.visit(visitor);
			this.action.visit(visitor);
		}
		if (visitor.endVisit)
			visitor.endVisit(this);
	}

});
});