/**
 * @class davinci.js.ArrayInitializer
 * @extends davinci.js.Expression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression"
], function(declare, JSExpression) {

return declare("davinci.js.JSArrayInitializer", JSExpression, {

	constructor: function() {
		this.elementType = "JSArrayInitializer";
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		s += "[";
		for ( var i = 0; i < this.children.length; i++ ) {
			if (i > 0)
				s = s + ", ";
			s = s + this.children[i].getText(context);
		}
		s = s + "]";
		return s;
	},

	visit: function(visitor) {
		var dontVisitChildren;
		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			for ( var i = 0; i < this.children.length; i++ ) {
				this.children[i].visit(visitor);
			}
		}
		if (visitor.endVisit)
			visitor.endVisit(this);
	}

});
});