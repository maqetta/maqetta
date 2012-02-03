define([
	'dojo/_base/declare',
	'./JSExpression'
], function(declare, JSExpression) {

return declare(JSExpression, {

	constructor: function() {
		this.elementType = "JSNameReference";
		this.name = "";
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		return s + this.name;
	},

	visit: function(visitor) {
		visitor.visit(this);
		if (visitor.endVisit) {
			visitor.endVisit(this);
		}
	}

});

});