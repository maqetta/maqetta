/**
 * @class davinci.js.Case
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSCase", JSElement, {

	constructor: function() {
		this.elementType = "JSCase";
		this.expr = null;
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		if (this.expr)
			s += "case " + this.expr.getText(context);
		else
			s += "default";
		s = s + " : ";
		return s;

	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (visitor.endVisit)
			visitor.endVisit(this);
	}

});
});