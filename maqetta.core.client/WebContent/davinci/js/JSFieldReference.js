/**
 * @class davinci.js.FieldReference
 * @extends davinci.js.Expression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression"
], function(declare, JSExpression) {

return declare("davinci.js.JSFieldReference", JSExpression, {

	constructor: function() {
		this.elementType = "JSFieldReference";
		this.name = "";
		this.receiver = null;
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		return s + this.receiver.getText(context) + "." + this.name;
	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren)
			this.receiver.visit(visitor);

		if (visitor.endVisit)
			visitor.endVisit(this);
	}

});
});