/**
 * @class davinci.js.JSElement
 * @constructor
 * @extends davinci.model.Model
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSModel"
], function(declare, JSModel) {

var pushComment = null;

var pushLabel = null;

return declare("davinci.js.JSElement", JSModel, {

	constructor: function() {
		this.elementType = "JSElement";
		if (pushComment !== null) {
			this.comment = pushComment;
			pushComment = null;

		}
		if (pushLabel !== null) {
			this.label = pushLabel;
			pushLabel = null;
		}
	},

	printNewLine: function(context) {
		var s = "\n";
		for ( var i = 0; i < context.indent; i++ )
			s = s + " ";
		return s;
	},

	printStatement: function(context, stmt) {
		return this.printNewLine(context) + stmt.getText(context) + (stmt.nosemicolon ? "" : ";");
	},

	add: function(e) {
		this.addChild(e);
	},

	init: function(start, stop, name) {
	},

	getLabel: function() {
		context = {};
		context.indent = 0;
		return this.getText(context);
	},

	getID: function() {
		return this.parent.getID() + ":" + this.startLine + ":" + this.getLabel();
	},

	getSyntaxPositions: function(lineNumber) {
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
					if (node.elementType == "JSFunction") {
						add(node.startLine, node.startCol, 8, "keyword");
						add2(node.leftParenPos, 1, "delimiter");
						add2(node.rightParenPos, 1, "delimiter");
						add2(node.leftBracePos, 1, "delimiter");
						add2(node.rightBracePos, 1, "delimiter");
					} else if (node.elementType == "JSVariableDeclaration") {
						add(node.startLine, node.startCol, 3, "keyword");
					} else if (node.elementType == "JSVariableFragment") {
						if (node.equalPos)
							add2(node.equalPos, 1, "operator");
						else
							add(node.startLine, node.startCol, 1, "name");
					} else if (node.elementType == "JSNameReference") {
						add(node.startLine, node.startCol, node.endCol - node.startCol, "name");
					}
				},
				endVisit : function(node) {
					return true;
				}
		};
		this.visit(visitor);
		return positions;
	}

});
});
