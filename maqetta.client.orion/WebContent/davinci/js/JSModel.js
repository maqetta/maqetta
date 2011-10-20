dojo.provide("davinci.js.JSModel");
dojo.require("davinci.model.Model");
// dojo.require("davinci.model.parser.Parser");

// FIXME: these are globals
var pushComment = null;
var pushLabel = null;

if (!davinci.js) {
    davinci.js = {};
}

/**
 * @class davinci.js.JSElement
 * @constructor
 * @extends davinci.model.Model
 */
davinci.js.JSElement = function() {

    this.inherits(davinci.model.Model);
    this.elementType = "JSElement";
    if (pushComment != null) {
        this.comment = pushComment;
        pushComment = null;

    }
    if (pushLabel != null) {
        this.label = pushLabel;
        pushLabel = null;
    }
};

davinci.Inherits(davinci.js.JSElement, davinci.model.Model);

davinci.js.JSElement.prototype.printNewLine = function(context) {
    var s = "\n";
    for ( var i = 0; i < context.indent; i++ )
        s = s + " ";
    return s;
};

davinci.js.JSElement.prototype.printStatement = function(context, stmt) {

    return this.printNewLine(context) + stmt.getText(context)
            + (stmt.nosemicolon ? "" : ";");
};

davinci.js.JSElement.prototype.add = function(e) {
    this.addChild(e);
};

davinci.js.JSElement.prototype.init = function(start, stop, name) {

};

davinci.js.JSElement.prototype.getLabel = function() {
    context = {};
    context.indent = 0;
    return this.getText(context);
};

davinci.js.JSElement.prototype.getID = function() {
    return this.parent.getID() + ":" + this.startLine + ":" + this.getLabel();
};

davinci.js.JSElement.prototype.getSyntaxPositions = function(lineNumber) {
    var positions = [];

    function add(line, col, length, type) {
        if ((typeof lineNumber == "undefined") || lineNumber == line)
            positions.push({
                line : line,
                col : col,
                length : length,
                type : type
            });
    }

    function add2(pos, length, type) {
        if ((typeof lineNumber == "undefined") || lineNumber == pos[0])
            positions.push({
                line : pos[0],
                col : pos[1],
                length : length,
                type : type
            });
    }
    var visitor = {

        visit : function(node) {
            if (node.elementType == "Function") {
                add(node.startLine, node.startCol, 8, "keyword");
                add2(node.leftParenPos, 1, "delimiter");
                add2(node.rightParenPos, 1, "delimiter");
                add2(node.leftBracePos, 1, "delimiter");
                add2(node.rightBracePos, 1, "delimiter");
            } else if (node.elementType == "VariableDeclaration") {
                add(node.startLine, node.startCol, 3, "keyword");
            } else if (node.elementType == "VariableFragment") {
                if (node.equalPos)
                    add2(node.equalPos, 1, "operator");
                else
                    add(node.startLine, node.startCol, 1, "name");
            } else if (node.elementType == "NameReference") {

                add(node.startLine, node.startCol, node.endCol - node.startCol,
                        "name");

            }

        },
        endVisit : function(node) {
            return true;
        }
    };
    this.visit(visitor);
    return positions;
};

// dojo.declare("davinci.js.JSElement", davinci.model.Model, {
// elementType : "JSElement",
// 
// add : function(e){
// this.addChild(e);
// }
// }
// );

/**
 * @class davinci.js.JSFile
 * @constructor
 * @extends davinci.js.JSElement
 */
davinci.js.JSFile = function(origin) {

    this.inherits(davinci.js.JSElement);
    this.elementType = "JSFile";
    this.nosemicolon = true;
    this._textContent = "";
    // id only, never loaded
    if (origin)
        this.origin = origin;

};
davinci.Inherits(davinci.js.JSFile, davinci.js.JSElement);

davinci.js.JSFile.prototype.getText = function(context) {
    return this._textContent;
};

davinci.js.JSFile.prototype.setText = function(text) {
    this._textContent = text;
};

davinci.js.JSFile.prototype.getLabel = function() {
    return this.fileName;
};

davinci.js.JSFile.prototype.getID = function() {
    return this.fileName;
};

davinci.js.JSFile.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren)
        for ( var i = 0; i < this.children.length; i++ ) {
            this.children[i].visit(visitor);
        }
    if (visitor.endVisit)
        visitor.endVisit(this);

};
//
// davinci.js.JSFile.prototype.getSyntaxPositions = function(lineNumber){
// var positions
// =davinci.js.JSElement.prototype.getSyntaxPositions.apply(this,[lineNumber]);
//	
//
// for (var i=0;i<this.errors.length;i++)
// {
// var line=this.errors[i].line;
// if ((typeof lineNumber =="undefined") || lineNumber==line)
// positions.push({line:line,col:this.errors[i].character,length:this.errors[i].length,
// type:"error"});
// }
//	
// return positions;
// }

// dojo.declare("davinci.js.JSFile", davinci.js.JSElement, {
// elementType : "JSFile",
//	
// getText : function () {},
// setText : function (text) {
// davinci.js.JSElement.parse(text,this);
// }
//
//	
// });

/**
 * @class davinci.js.Expression
 * @constructor
 * @extends davinci.js.JSElement
 */
davinci.js.Expression = function() {

    this.inherits(davinci.js.JSElement);
    this.elementType = "Expression";
};
davinci.Inherits(davinci.js.Expression, davinci.js.JSElement);

davinci.js.Expression.prototype.getText = function() {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }

    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }

    return s;

};
davinci.js.Expression.prototype.add = function(e) {
};

// dojo.declare("davinci.js.Expression", davinci.js.JSElement, {
// elementType : "Expression",
//	
// getText : function () {},
// add : function(e){}
//	
// });
//

/**
 * @class davinci.js.Function
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.Function = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "Function";
    this.name = null;
    this.parms = [];
    this.namePosition = 0;

    this.nosemicolon = true;

};
davinci.Inherits(davinci.js.Function, davinci.js.Expression);
davinci.js.Function.prototype.add = function(e) {
    this.addChild(e);
};

davinci.js.Function.prototype.getText = function(context) {
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
};

davinci.js.Function.prototype.getLabel = function() {
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
};

davinci.js.Function.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    /* visit params before statements */

    if (!dontVisitChildren) {
        /* visit params like children ?? */
        /*
         * for (var i=0;i<this.parms.length; i++) this.parms[i].visit(visitor);
         */

        for ( var i = 0; i < this.children.length; i++ )
            this.children[i].visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);

};

/**
 * @class davinci.js.NameReference
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.NameReference = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "NameReference";
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

/**
 * @class davinci.js.FieldReference
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.FieldReference = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "FieldReference";
    this.name = "";
    this.receiver = null;
};
davinci.Inherits(davinci.js.FieldReference, davinci.js.Expression);

davinci.js.FieldReference.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    return s + this.receiver.getText(context) + "." + this.name;
};

davinci.js.FieldReference.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren)
        this.receiver.visit(visitor);

    if (visitor.endVisit)
        visitor.endVisit(this);
};

// dojo.declare("davinci.js.FieldReference", davinci.js.Expression, {
// elementType : "FieldReference",
// name : "",
// receiver : null,
//	
// getText : function () {}
//	
// });

/**
 * @class davinci.js.FunctionCall
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.FunctionCall = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "FunctionCall";
    this.receiver = null;
    this.parms = [];
};
davinci.Inherits(davinci.js.FunctionCall, davinci.js.Expression);

davinci.js.FunctionCall.prototype.getText = function(context) {
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
};

davinci.js.FunctionCall.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren)
        for ( var i = 0; i < this.parms.length; i++ )
            this.parms[i].visit(visitor);
    if (visitor.endVisit)
        visitor.endVisit(this);
};

// dojo.declare("davinci.js.FunctionCall", davinci.js.Expression, {
// elementType : "FunctionCall",
// parms : [],
// receiver : null,
//
// constructor : function ()
// {
// this.parms=[];
// },
//	
// getText : function () {}
//	
// });

/**
 * @class davinci.js.BinaryOperation
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.BinaryOperation = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "BinaryOperation";
    this.left = null;
    this.right = null;
    this.operator = 0;

};
davinci.Inherits(davinci.js.BinaryOperation, davinci.js.Expression);
davinci.js.BinaryOperation.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    return s + this.left.getText(context) + this.operator
            + this.right.getText(context);
};

davinci.js.BinaryOperation.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.left.visit(visitor);
        this.right.visit(visitor);
    }

    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.Literal
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.Literal = function(type) {

    this.inherits(davinci.js.Expression);
    this.elementType = "Literal";
    this.value = null;
    this.type = type;
};

davinci.Inherits(davinci.js.Literal, davinci.js.Expression);
davinci.js.Literal.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }

    switch (this.type) {
    case "char":
        return s + "'" + this.value + "'";
    case "string":
        return s + '"' + this.value + '"';
    case "null":
    case "this":
    case "undefined":
    case "true":
    case "false":
        return s + this.type;
    }
    return s + this.value;
};

// dojo.declare("davinci.js.Literal", davinci.js.Expression, {
// elementType : "Literal",
// value : null,
// type : null,
//
// getText : function () {}
//	
// });
//
//

/**
 * @class davinci.js.ParenExpression
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.ParenExpression = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "ParenExpression";
    this.expression = null;
};

davinci.Inherits(davinci.js.ParenExpression, davinci.js.Expression);
davinci.js.ParenExpression.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += "(" + this.expression.getText(context) + ")";
    return s;
};

davinci.js.ParenExpression.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.expression.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.AllocationExpression
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.AllocationExpression = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "AllocationExpression";
    this.expression = null;
    this.arguments = null;
};

davinci.Inherits(davinci.js.AllocationExpression, davinci.js.Expression);
davinci.js.AllocationExpression.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }

    s += "new " + this.expression.getText(context);
    if (this.arguments != null) {
        s = s + "(";
        for ( var i = 0; i < this.arguments.length; i++ ) {
            if (i > 0)
                s = s + ", ";
            s = s + this.arguments[i].getText(context);
        }
        s = s + ")";
    }
    return s;
};

davinci.js.AllocationExpression.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.expression.visit(visitor);
    }

    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.FunctionExpression
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.FunctionExpression = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "FunctionExpression";
    this.func = null;
};

davinci.Inherits(davinci.js.FunctionExpression, davinci.js.Expression);
davinci.js.FunctionExpression.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += this.func.getText(context);
    return s;
};

davinci.js.FunctionExpression.prototype.getLabel = function() {
    return this.func.getLabel();
};

davinci.js.AllocationExpression.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);

    if (!dontVisitChildren) {
        if (this.func) {
            debugger;
            this.func.visit(visitor);
        } else if (this.expression) {
            this.expression.visit(visitor);
        }

    }

    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.UnaryExpression
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.UnaryExpression = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "UnaryExpression";
    this.operator = null;
    this.expr = null;
};

davinci.Inherits(davinci.js.UnaryExpression, davinci.js.Expression);
davinci.js.UnaryExpression.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += this.operator + " " + this.expr.getText(context);
    return s;
};

davinci.js.UnaryExpression.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.expr.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.ObjectLiteral
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.ObjectLiteral = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "ObjectLiteral";
};

davinci.Inherits(davinci.js.ObjectLiteral, davinci.js.Expression);
davinci.js.ObjectLiteral.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += '{';
    context.indent += 2;
    for ( var i = 0; i < this.children.length; i++ ) {
        if (i > 0)
            s = s + ", ";
        s = s + this.printNewLine(context);
        s = s + this.children[i].getText(context);
    }
    context.indent -= 2;
    s = s + this.printNewLine(context);
    s = s + "}";
    return s;
};

davinci.js.ObjectLiteral.prototype.getLabel = function() {
    return "{}";
};

davinci.js.ObjectLiteral.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        for ( var i = 0; i < this.children.length; i++ ) {
            this.children[i].visit(visitor);
        }
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.ObjectLiteralField
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.ObjectLiteralField = function() {

    this.inherits(davinci.js.Expression);
    this.elementType = "ObjectLiteralField";
    this.name = "";
    this.nameType = "";
    this.initializer = null;
};

davinci.Inherits(davinci.js.ObjectLiteralField, davinci.js.Expression);
davinci.js.ObjectLiteralField.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    if (this.nameType == '(string)')
        s = "'" + this.name + "'";
    else
        s = this.name;
    s = s + " : " + this.initializer.getText(context);
    return s;
};

davinci.js.ObjectLiteralField.prototype.getLabel = function() {
    var s;
    if (this.nameType == '(string)')
        s = "'" + this.name + "'";
    else
        s = this.name;
    s = s + " : " + this.initializer.getLabel();
    return s;
};

davinci.js.ObjectLiteralField.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.initializer.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.ArrayAccess
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.ArrayAccess = function() {
    this.inherits(davinci.js.Expression);
    this.elementType = "ArrayAccess";
    this.array = null;
    this.index = null;
};

davinci.Inherits(davinci.js.ArrayAccess, davinci.js.Expression);
davinci.js.ArrayAccess.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }

    s += this.array.getText(context) + "[" + this.index.getText(context) + "]";
    return s;
};

davinci.js.ArrayAccess.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.array.visit(visitor);
        this.index.visit(visitor);
    }

    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.ArrayInitializer
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.ArrayInitializer = function() {
    this.inherits(davinci.js.Expression);
    this.elementType = "ArrayInitializer";
};

davinci.Inherits(davinci.js.ArrayInitializer, davinci.js.Expression);
davinci.js.ArrayInitializer.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += "[";
    for ( var i = 0; i < this.children.length; i++ ) {
        if (i > 0)
            s = s + ", ";
        s = s + this.children[i].getText(context);
    }
    s = s + "]";
    return s;
};

davinci.js.ArrayInitializer.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        for ( var i = 0; i < this.children.length; i++ ) {
            this.children[i].visit(visitor);
        }
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.PrefixPostfixExpression
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.PrefixPostfixExpression = function() {
    this.inherits(davinci.js.Expression);
    this.isPrefix = false;
    this.expr = null;
    this.operator = null;
    this.elementType = "PrefixPostfixExpression";
};

davinci.Inherits(davinci.js.PrefixPostfixExpression, davinci.js.Expression);
davinci.js.PrefixPostfixExpression.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    if (this.isPrefix)
        s = s + this.operator;
    s = s + this.expr.getText(context);
    if (!this.isPrefix)
        s = s + this.operator;
    return s;
};

davinci.js.PrefixPostfixExpression.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.expr.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.ConditionalExpression
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.ConditionalExpression = function() {
    this.inherits(davinci.js.Expression);
    this.condition = null;
    this.trueValue = null;
    this.falseValue = null;
    this.elementType = "ConditionalExpression";
};

davinci.Inherits(davinci.js.ConditionalExpression, davinci.js.Expression);
davinci.js.ConditionalExpression.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += this.condition.getText(context) + " ? "
            + this.trueValue.getText(context) + " : "
            + this.falseValue.getText(context);
    return s;
};

davinci.js.ConditionalExpression.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.condition.visit(visitor);
        this.trueValue.visit(visitor);
        this.falseValue.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.Label
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.Label = function(name) {
    this.inherits(davinci.js.JSElement);
    this.elementType = "Label";
    this.nosemicolon = true;
    this.s = name;
};

davinci.Inherits(davinci.js.Label, davinci.js.JSElement);

davinci.js.Label.prototype.getText = function(context) {

    return this.s + " : ";
};

/**
 * @class davinci.js.UnparsedRegion
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.UnparsedRegion = function(content) {
    this.inherits(davinci.js.JSElement);
    this.elementType = "UnparsedRegion";
    this.s = content;
};

davinci.Inherits(davinci.js.UnparsedRegion, davinci.js.JSElement);

davinci.js.UnparsedRegion.prototype.getText = function(context) {

    return this.s;
};

/**
 * @class davinci.js.Comment
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.Comment = function() {
    this.inherits(davinci.js.JSElement);
    this.elementType = "Comment";
    this.nosemicolon = true;
};

davinci.Inherits(davinci.js.Comment, davinci.js.JSElement);
davinci.js.Comment.prototype.addComment = function(type, startLne, startOffst,
        stopLne, stopOffst, text) {

    if (this.comments == null) {
        this.comments = [];

    }

    this.comments[this.comments.length] = {
        commentType : type,
        startLine : startLne,
        startOffset : startOffst,
        stopLine : stopLne,
        stopOffset : stopOffst,
        s : text
    };

};

davinci.js.Comment.prototype.getText = function(context) {
    var s = "";

    for ( var i = 0; i < this.comments.length; i++ ) {
        if (this.comments[i].commentType == "line") {
            s += "//" + this.comments[i].s + "\n";
        } else if (this.comments[i].commentType == "block") {
            s += "/*" + this.comments[i].s + "*/\n";
        }
    }
    return s;
};

/**
 * @class davinci.js.EmptyExpression
 * @extends davinci.js.Expression
 * @constructor
 */
davinci.js.EmptyExpression = function() {
    this.inherits(davinci.js.Expression);
    this.elementType = "EmptyExpression";
};

davinci.Inherits(davinci.js.EmptyExpression, davinci.js.Expression);
davinci.js.EmptyExpression.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    return s + "";
};

/**
 * @class davinci.js.VariableDeclaration
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.VariableDeclaration = function() {

    this.inherits(davinci.js.JSElement);

    this.elementType = "VariableDeclaration";
    this.value = null;
    this.type = null;
};
davinci.Inherits(davinci.js.VariableDeclaration, davinci.js.JSElement);
davinci.js.VariableDeclaration.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += "var ";
    for ( var i = 0; i < this.children.length; i++ ) {
        if (i > 0)
            s = s + ", ";
        s = s + this.children[i].getText(context);
    }
    return s;
};

davinci.js.VariableDeclaration.prototype.visit = function(visitor) {
    var dontVisitChildren;
    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        for ( var i = 0; i < this.children.length; i++ ) {
            this.children[i].visit(visitor);
        }
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

// dojo.declare("davinci.js.VariableDeclaration", davinci.js.JSElement, {
// elementType : "VariableDeclaration",
//	
// getText : function () {}
//	
// });
//

/**
 * @class davinci.js.VariableFragment
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.VariableFragment = function() {

    this.inherits(davinci.js.JSElement);
    this.elementType = "VariableFragment";
    this.name = "";
    this.init = null;
};
davinci.Inherits(davinci.js.VariableFragment, davinci.js.JSElement);
davinci.js.VariableFragment.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += this.name;
    if (this.init != null) {
        s = s + " = " + this.init.getText(context);
    }
    return s;
};
davinci.js.VariableFragment.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        if (this.init)
            this.init.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.Block
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.Block = function() {
    this.inherits(davinci.js.JSElement);
    this.nosemicolon = true;
    this.elementType = "Block";
    this.nosemicolon = true;
};
davinci.Inherits(davinci.js.Block, davinci.js.JSElement);

davinci.js.Block.prototype.getText = function(context) {
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
};

davinci.js.Block.prototype.getLabel = function() {

    return "{     }";
};

davinci.js.Block.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        for ( var i = 0; i < this.children.length; i++ ) {
            this.children[i].visit(visitor);
        }
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};
/**
 * @class davinci.js.If
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.If = function() {
    this.inherits(davinci.js.JSElement);
    this.elementType = "If";
    this.expr = null;
    this.trueStmt = null;
    this.elseStmt = null;
    this.nosemicolon = true;
};
davinci.Inherits(davinci.js.If, davinci.js.JSElement);

davinci.js.If.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += "if (" + this.expr.getText(context) + ")";
    context.indent += 2;
    s = s + this.printStatement(context, this.trueStmt);
    if (this.elseStmt != null) {
        context.indent -= 2;
        s = s + this.printNewLine(context) + "else";
        context.indent += 2;
        s = s + this.printStatement(context, this.elseStmt);
    }
    context.indent -= 2;
    return s;
};
davinci.js.If.prototype.getLabel = function() {

    return "if (" + this.expr.getLabel() + ")";
    ;
};

davinci.js.If.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.expr.visit(visitor);
        if (this.trueStmt)
            this.trueStmt.visit(visitor);
        if (this.elseStmt)
            this.elseStmt.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.Try
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.Try = function() {
    this.inherits(davinci.js.JSElement);
    this.elementType = "Try";
    this.stmt = null;
    this.catchBlock = null;
    this.finallyBlock = null;
    this.catchArgument = null;
};
davinci.Inherits(davinci.js.Try, davinci.js.JSElement);

davinci.js.Try.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }

    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }

    s += "try";
    s = s + this.printNewLine(context) + this.stmt.getText(context);
    if (this.catchBlock) {
        s = s + this.printNewLine(context) + "catch (" + this.catchArgument
                + ")";
        s = s + this.printStatement(context, this.catchBlock);
    }
    if (this.finallyBlock) {
        s = s + this.printNewLine(context) + "finally";
        s = s + this.printStatement(context, this.finallyBlock);
    }
    return s;
};

davinci.js.Try.prototype.getLabel = function() {

    return "try";
};

davinci.js.Try.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.stmt.visit(visitor);
        if (this.catchBlock)
            this.catchBlock.visit(visitor);
        if (this.finallyBlock)
            this.finallyBlock.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.For
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.For = function() {
    this.inherits(davinci.js.JSElement);
    this.elementType = "For";
    this.initializations = null;
    this.condition = null;
    this.increments = null;
    this.action = null;
    this.nosemicolon = true;
};
davinci.Inherits(davinci.js.For, davinci.js.JSElement);

davinci.js.For.prototype.getText = function(context) {
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
};

davinci.js.For.prototype.getLabel = function() {

    return "for";
};

davinci.js.For.prototype.visit = function(visitor) {
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
};

/**
 * @class davinci.js.ForIn
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.ForIn = function() {
    this.inherits(davinci.js.JSElement);
    this.elementType = "ForIn";
    this.iterationVar = null;
    this.collection = null;
    this.action = null;
    this.nosemicolon = true;
};
davinci.Inherits(davinci.js.ForIn, davinci.js.JSElement);

davinci.js.ForIn.prototype.getText = function(context) {
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
};

davinci.js.ForIn.prototype.getLabel = function() {

    return "for ( " + this.iterationVar.getLabel() + " in "
            + this.collection.getLabel() + ")";
};

davinci.js.ForIn.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.action.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.With
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.With = function() {
    this.inherits(davinci.js.JSElement);
    this.elementType = "With";
    this.expr = null;
    this.action = null;
    this.nosemicolon = true;
};
davinci.Inherits(davinci.js.With, davinci.js.JSElement);

davinci.js.With.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += "with ( " + this.expr.getText(context) + " )";
    context.indent += 2;
    s = s + this.printStatement(context, this.action);
    context.indent -= 2;
    return s;
};

davinci.js.With.prototype.getLabel = function() {

    return "with ( " + this.expr.getText(context) + " )";
};
davinci.js.With.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.action.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};
/**
 * @class davinci.js.While
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.While = function() {
    this.inherits(davinci.js.JSElement);
    this.elementType = "While";
    this.expr = null;
    this.action = null;
    this.nosemicolon = true;
};
davinci.Inherits(davinci.js.While, davinci.js.JSElement);

davinci.js.While.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += "while ( " + this.expr.getText(context) + " )";
    context.indent += 2;
    s = s + this.printStatement(context, this.action);
    context.indent -= 2;
    return s;
};

davinci.js.While.prototype.getLabel = function() {

    return "while ( " + this.expr.getLabel() + " )";
};

davinci.js.While.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.expr.visit(visitor);
        this.action.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};
/**
 * @class davinci.js.Debugger
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.Debugger = function(statement) {
    this.inherits(davinci.js.JSElement);
    this.elementType = "Debugger";
};
davinci.Inherits(davinci.js.Debugger, davinci.js.JSElement);

davinci.js.Debugger.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    return s + "debugger";
};

/**
 * @class davinci.js.Branch
 * @extends davinci.js.JSElement
 * @constructor "continue" or "break"
 */
davinci.js.Branch = function(statement) {
    this.inherits(davinci.js.JSElement);
    this.elementType = "Branch";
    this.statement = statement;
    this.targetLabel = null;
};
davinci.Inherits(davinci.js.Branch, davinci.js.JSElement);

davinci.js.Branch.prototype.getText = function(context) {
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
};

davinci.js.Branch.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (visitor.endVisit)
        visitor.endVisit(this);
};
/**
 * @class davinci.js.Exit
 * @extends davinci.js.JSElement
 * @constructor "return" or "throw"
 */
davinci.js.Exit = function(statement) {
    this.inherits(davinci.js.JSElement);
    this.elementType = "Exit";
    this.statement = statement;
    this.expr = null;
};
davinci.Inherits(davinci.js.Exit, davinci.js.JSElement);

davinci.js.Exit.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += this.statement;
    if (this.expr)
        s = s + " " + this.expr.getText(context);
    return s;
};

/**
 * @class davinci.js.Do
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.Do = function() {
    this.inherits(davinci.js.JSElement);
    this.elementType = "Do";
    this.expr = null;
    this.action = null;
};
davinci.Inherits(davinci.js.Do, davinci.js.JSElement);

davinci.js.Do.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += "do";
    context.indent += 2;
    s = s + this.printStatement(context, this.action);
    context.indent -= 2;
    var s = s + this.printNewLine(context) + "while ( "
            + this.expr.getText(context) + " )";
    return s;

};

davinci.js.Do.prototype.getLabel = function() {

    return "do while";
};

davinci.js.Do.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (!dontVisitChildren) {
        this.expr.visit(visitor);
        this.action.visit(visitor);
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};
/**
 * @class davinci.js.Switch
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.Switch = function() {
    this.inherits(davinci.js.JSElement);
    this.elementType = "Switch";
    this.expr = null;
    this.nosemicolon = true;
};
davinci.Inherits(davinci.js.Switch, davinci.js.JSElement);

davinci.js.Switch.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    s += "switch (" + this.expr.getText(context) + " )";
    s = s + this.printNewLine(context) + "{";
    context.indent += 2;
    for ( var i = 0; i < this.children.length; i++ ) {
        s = s + this.printStatement(context, this.children[i]);
    }
    context.indent -= 2;
    s = s + this.printNewLine(context) + "}";
    return s;

};

davinci.js.Switch.prototype.getLabel = function() {

    return "switch (" + this.expr.getLabel() + " )";
};

davinci.js.Switch.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);

    if (!dontVisitChildren) {
        this.expr.visit(visitor);
        for ( var i = 0; i < this.children.length; i++ ) {
            this.children[i].visit(visitor);
        }
    }
    if (visitor.endVisit)
        visitor.endVisit(this);
};

/**
 * @class davinci.js.Case
 * @extends davinci.js.JSElement
 * @constructor
 */
davinci.js.Case = function() {
    this.inherits(davinci.js.JSElement);
    this.elementType = "Case";
    this.expr = null;
};
davinci.Inherits(davinci.js.Case, davinci.js.JSElement);

davinci.js.Case.prototype.getText = function(context) {
    var s = "";
    if (this.comment) {
        s += this.printNewLine(context) + this.comment.getText(context);
    }
    if (this.label) {
        s += this.printNewLine(context) + this.label.getText(context);
    }
    if (this.expr)
        s += "case " + this.expr.getText(context);
    else
        s += "default";
    s = s + " : ";
    return s;

};

davinci.js.Case.prototype.visit = function(visitor) {
    var dontVisitChildren;

    dontVisitChildren = visitor.visit(this);
    if (visitor.endVisit)
        visitor.endVisit(this);
};

//davinci.js.JSElement.parse =davinci.model.parser.parse;
