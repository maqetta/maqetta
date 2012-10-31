/**
 * @class davinci.js.Block
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSBlock", JSElement, {

	constructor: function() {
		this.nosemicolon = true;
		this.elementType = "JSBlock";
		this.nosemicolon = true;
	},

	getText: function(context) {
		context.indent += 2;
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		s += '{';
		for ( var i = 0; i < this.children.length; i++ ) {
			s = s + this.printNewLine(context);
			s = s + this.children[i].getText(context)
			+ (this.children[i].nosemicolon ? "" : ";");
		}
		context.indent -= 2;
		s = s + this.printNewLine(context);
		s = s + "}";
		return s;
	},

	getLabel: function() {
		return "{     }";
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