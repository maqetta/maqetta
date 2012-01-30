/**
 * @class davinci.js.For
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSFor", JSElement, {

	constructor: function() {
		this.elementType = "JSFor";
		this.initializations = null;
		this.condition = null;
		this.increments = null;
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

		s += "for (";
		if (this.initializations != null)
			for ( var i = 0; i < this.initializations.length; i++ ) {
				if (i > 0)
					s = s + ", ";
				s = s + this.initializations[i].getText(context);
			}
		s = s + ";";
		if (this.condition != null)
			s = s + this.condition.getText(context);
		s = s + ";";

		if (this.increments != null)
			for ( var i = 0; i < this.increments.length; i++ ) {
				if (i > 0)
					s = s + ", ";
				s = s + this.increments[i].getText(context);
			}
		context.indent += 2;
		s = s + ")" + this.printStatement(context, this.action);
		context.indent -= 2;
		return s;
	},

	getLabel: function() {
		return "for";
	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			if (this.initializations)
				for ( var i = 0; i < this.initializations.length; i++ ) {
					this.initializations[i].visit(visitor);
				}
			if (this.condition)
				this.condition.visit(visitor);
			if (this.increments)
				for ( var i = 0; i < this.increments.length; i++ ) {
					this.increments[i].visit(visitor);
				}
			this.action.visit(visitor);
		}

		if (visitor.endVisit)
			visitor.endVisit(this);
	}

});
});
