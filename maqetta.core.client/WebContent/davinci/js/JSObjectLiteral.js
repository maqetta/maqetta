/**
 * @class davinci.js.JSObjectLiteral
 * @extends davinci.js.JSExpression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression",
], function(declare, JSExpression) {

return declare("davinci.js.JSObjectLiteral", JSExpression, {

	constructor: function() {
		this.elementType = "JSObjectLiteral";
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		s += '{';
		context.indent += 2;
		for ( var i = 0; i < this.children.length; i++ ) {
			if (i > 0)
				s = s + ", ";
			s = s + this.printNewLine(context);
			s = s + this.children[i].getText(context);
		}
		context.indent -= 2;
		s = s + this.printNewLine(context);
		s = s + "}";
		return s;
	},

	getLabel: function() {
		return "{}";
	},

	visit: function(visitor) {
		var dontVisitChildren;
		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			for ( var i = 0; i < this.children.length; i++ ) {
				this.children[i].visit(visitor);
			}
		}
		if (visitor.endVisit) {
			visitor.endVisit(this);
		}
	}

});
});
