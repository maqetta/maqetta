/**
 * @class davinci.js.Branch
 * @extends davinci.js.JSElement
 * @constructor "continue" or "break"
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSBlock", JSElement, {

	constructor: function(statement) {
		this.elementType = "JSBranch";
		this.statement = statement;
		this.targetLabel = null;
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		s += this.statement;
		if (this.targetLabel)
			s = s + " " + this.targetLabel;
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