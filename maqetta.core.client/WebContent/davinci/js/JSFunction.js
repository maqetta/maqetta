/**
 * @class davinci.js.Function
 * @extends davinci.js.Expression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression"
], function(declare, JSExpression) {

return declare("davinci.js.JSFunction", JSExpression, {

	constructor: function() {
		this.elementType = "JSFunction";
		this.name = null;
		this.parms = [];
		this.namePosition = 0;
		this.nosemicolon = true;
	},

	add: function(e) {
		this.addChild(e);
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		s += "function ";
		if (this.name != null)
			s = s + this.name + " ";
		s = s + "(";
		for ( var i = 0; i < this.parms.length; i++ ) {
			if (i > 0)
				s = s + ",";
			s = s + this.parms[i].getText(context);
		}
		s = s + ")";
		s = s + this.printNewLine(context);
		context.indent += 2;
		s = s + '{';
		for ( var i = 0; i < this.children.length; i++ ) {
			s = s + this.printStatement(context, this.children[i]);
		}
		context.indent -= 2;
		s = s + this.printNewLine(context);
		s = s + "}";
		return s;
	},

	getLabel: function() {
		var s = "function ";
		if (this.name != null)
			s = s + this.name + " ";
		s = s + "(";
		var context = {};
		for ( var i = 0; i < this.parms.length; i++ ) {
			if (i > 0)
				s = s + ",";
			s = s + this.parms[i].getText(context);
		}
		s = s + ")";
		return s;
	},

	visit: function(visitor) {
		var dontVisitChildren;
		dontVisitChildren = visitor.visit(this);
		/* visit params before statements */
		if (!dontVisitChildren) {
			for ( var i = 0; i < this.children.length; i++ )
				this.children[i].visit(visitor);
		}
		if (visitor.endVisit)
			visitor.endVisit(this);
	}

});
});
