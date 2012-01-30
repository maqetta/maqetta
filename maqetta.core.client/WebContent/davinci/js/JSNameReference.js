/**
 * @class davinci.js.NameReference
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.NameReference = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "JSNameReference";
    this.name = "";
};
davinci.Inherits(davinci.js.NameReference, davinci.js.Expression);

davinci.js.NameReference.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    return s + this.name;
};

davinci.js.NameReference.prototype.visit = function(visitor) {
    visitor.visit(this);
    if (visitor.endVisit)
        visitor.endVisit(this);
};

