/**
 * @class davinci.js.JSFunctionCall
 * @extends davinci.js.JSExpression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression",
], function(declare, JSExpression) {

return declare("davinci.js.JSFunctionCall", JSExpression, {

	constructor: function() {
		this.elementType = "JSFunctionCall";
		this.receiver = null;
		this.parms = [];
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}

		s += this.receiver.getText(context) + "(";
		for ( var i = 0; i < this.parms.length; i++ ) {
			if (i > 0)
				s = s + ", ";
			s = s + this.parms[i].getText(context);
		}
		s = s + ")";
		return s;
	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren)
			for ( var i = 0; i < this.parms.length; i++ )
				this.parms[i].visit(visitor);
		if (visitor.endVisit) {
			visitor.endVisit(this);
		}
	}

});
});
