/**
 * @class davinci.js.JSSwitch
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement",
], function(declare, JSExpression) {

return declare("davinci.js.JSSwitch", JSElement, {

	constructor: function() {
		this.elementType = "JSSwitch";
		this.expr = null;
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
		s += "switch (" + this.expr.getText(context) + " )";
		s = s + this.printNewLine(context) + "{";
		context.indent += 2;
		for ( var i = 0; i < this.children.length; i++ ) {
			s = s + this.printStatement(context, this.children[i]);
		}
		context.indent -= 2;
		s = s + this.printNewLine(context) + "}";
		return s;

	},

	getLabel: function() {
		return "switch (" + this.expr.getLabel() + " )";
	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			this.expr.visit(visitor);
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

