/**
 * @class davinci.js.ForIn
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSForIn", JSElement, {

	constructor: function() {
		this.elementType = "JSForIn";
		this.iterationVar = null;
		this.collection = null;
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
		s += "for ( " + this.iterationVar.getText(context) + " in "
		+ this.collection.getText(context) + ")";
		context.indent += 2;
		s = s + this.printStatement(context, this.action);
		context.indent -= 2;
		return s;
	},

	getLabel: function() {
		return "for ( " + this.iterationVar.getLabel() + " in "
		+ this.collection.getLabel() + ")";
	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			this.action.visit(visitor);
		}
		if (visitor.endVisit)
			visitor.endVisit(this);
	}

});
});