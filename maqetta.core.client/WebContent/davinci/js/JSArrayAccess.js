/**
 * @class davinci.js.ArrayAccess
 * @extends davinci.js.Expression
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSExpression"
], function(declare, JSExpression) {

return declare("davinci.js.JSArrayAccess", JSExpression, {

constructor: function() {
    this.elementType = "JSArrayAccess";
    this.array = null;
    this.index = null;
},

getText: function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += this.array.getText(context) + "[" + this.index.getText(context) + "]";
    return s;
},

visit: function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.array.visit(visitor);
        this.index.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
}

});
});