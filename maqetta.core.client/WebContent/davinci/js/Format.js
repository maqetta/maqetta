define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/workbench/Preferences"
], function(declare, Runtime, Workbench, Preferences) {

// XXX This most likely does not work.
var Format = function(model, opt) {

	var options = opt || Preferences.getPreferences("davinci.js.format", Workbench.getProject());
	var indentLevel = 0;
	var output=[];
	var newline = "\n";
	var linepos=0;

	function addWhitespace(count) {
		if (count == 0) {
			return;
		}
		output.push("                                                                                                                         ".substring(0,count));
		linepos += count;
	}

	function addStrings() {
		if (arguments) {
			for (var i=0;i<arguments.length;i++) {
				if (typeof arguments[i]=='string') {
					output.push(arguments[i]);
					linepos+=arguments[i].length;
				} else {
					addWhitespace(arguments[i]);
				}
			}
		}
	}

	function addString(s) {
		output.push(s);
		linepos+=s.length;
	}

	function newLine(ch) {
		if (output.length > 0) {
			output.push(newline);
		}
		addWhitespace(indentLevel);
		linepos=indentLevel;
		if (ch) {
			addString(ch);
		}
	}

	function formatStatement(node, visitor) {
		newLine();
		node.visit(visitor);
		if (!node.nosemicolon) {
			addString(";");
		}
	}

	function formatStmtOrBlock(node, visitor) {
		if (node.elementType != "JSBlock") { 
			indentLevel += 2;
			newLine();
		} else {
			addString(" ");
		}
		node.visit(visitor);
		if (node.elementType != "JSBlock") { 
			if (!node.nosemicolon) {
				addString(";");
			}
			indentLevel-=2;
		}
	}

	function escapeChars(str, escapequote) {
		return str.replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").   replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r"); ;
	}

	var visitor = {
			visit : function (node) {
				var dontVisitChildren=true;
				if (node.comment) {
					var comment=node.comment;
					for (var i = 0; i<comment.comments.length; i++) {
						if (i > 0) {
							addWhitespace(indentLevel);
						}
						if (comment.comments[i].commentType == "line") {
							addStrings("//" , comment.comments[i].s, newline);
						} else if(comment.comments[i].commentType == "block") {
							addStrings( "/*" , comment.comments[i].s, "*/", newline);
						}	
					}
					addWhitespace(indentLevel);
				}
				if (node.label) {
					addStrings(node.label.s,options['labelSpace'],":", options['labelSpace']);
					if (options['breakOnLabel']) {
						addStrings(Format.newline,indentLevel);
					}
				}

				switch (node.elementType) {
				case "JSWhile":
					addString("while (");
					Format.visit(node.expr);
					addString(")");
					formatStmtOrBlock(node.action, Format);
					break;
				case "JSExpression":
					break;
				case "JSNameReference":
					addString(node.name);
					break;
				case "JSFunction": {
					addString("function");
					if (node.name != null) {
						addString(" " + node.name);
					}
					addString(" (");
					for (var i=0; i<node.parms.length; i++) {
						if (i > 0) {
							addStrings(",", options['functionParamSpaceing']);
						}
						addString(node.parms[i].name);
					}
					addString(")");
					if (options['functionNewLine']) {
						newLine('{');
					} else {
						addString(' {');
					}
					indentLevel +=  options['functionIndent'];
					for (var i=0; i<node.children.length; i++) {
						formatStatement(node.children[i], Format);
					}
					indentLevel -=  options['functionIndent'];
					newLine('}');
					if (node.name != null) {
						addString(newline);
					}
					dontVisitChildren=true;
				}
				break;
				case "JSFieldReference":
					Format.visit(node.receiver);
					addString("." + node.name);
					break;
				case "JSFunctionCall":
					Format.visit(node.receiver);
					addString("(");
					for (var i=0; i<node.parms.length; i++) {
						if (i > 0) {
							addStrings(",",options['functionParamSpaceing']);
						}
						Format.visit(node.parms[i]);
					}
					addString(")");
					break;
				case "JSBinaryOperation":
					Format.visit(node.left);
					addString(node.operator);
					Format.visit(node.right);

					break;
				case "JSLiteral":
					switch (node.type) {
					case "char":
						addString( "'"+escapeChars(node.value,"'")+"'");
						break;
					case "string":
						addString( '"'+escapeChars(node.value,'"')+'"');
						break;
					case "number":
						addString(node.value);
						break;
					case "null":
					case "this":
					case "undefined":
					case "true":
					case "false":
					default:
						addString( node.type);
					}
					break;
				case "JSParenExpression":
					addString("(");
					Format.visit(node.expression);
					addString(")");
					break;
				case "JSAllocationExpression":
					addString("new ");
					Format.visit(node.expression);
					if (node.arguments != null) {
						addString("(");
						for (var i=0; i<node.arguments.length; i++) {
							if (i > 0) {
								addString(", ");
							}
							Format.visit(node.arguments[i]);
						}
						addString(")");
					}
					break;
				case "JSFunctionExpression":
					Format.visit(node.func);
					break;
				case "JSUnaryExpression":
					addString(node.operator);
					Format.visit(node.expr);
					break;
				case "JSObjectLiteral":
					addString("{");
					var storeindent = indentLevel;
					indentLevel = linepos;
					for (var i=0; i<node.children.length; i++){
						if(i > 0) {
							newLine();
						}
						Format.visit(node.children[i]);
						if (i < node.children.length-1) {
							addString(",") ;
						}
					}
					indentLevel--;
					if (node.children.length > 0) {
						newLine();
					}
					indentLevel = storeindent;
					addString("}");
					break;
				case "JSObjectLiteralField":
					if (node.nameType == '(string)') {
						addString("'" + node.name + "'");
					} else { 
						addString(node.name);
					}
					addStrings(options['objectLitFieldSpace'], ":", options['objectLitFieldSpace']);
					Format.visit(node.initializer);
					break;
				case "JSArrayAccess":
					Format.visit(node.array);
					addString("[");
					Format.visit(node.index);
					addString("]");
					break;
				case "JSArrayInitializer":
					addString("[");
					for (var i=0; i<node.children.length; i++){
						if (i > 0) {
							addString(", ");
						}
						Format.visit(node.children[i]);
					}
					addString("]");
					break;
				case "JSPrefixPostfixExpression":
					if (node.isPrefix) {
						addString(node.operator);
					}
					Format.visit(node.expr);
					if (!node.isPrefix)
						addString(node.operator);
					break;
				case "JSConditionalExpression":
					Format.visit(node.condition);
					addString(" ? ");
					Format.visit(node.trueValue) ;
					addString(" : ");
					Format.visit(node.falseValue);
					break;
				case "JSEmptyExpression":
					break;
				case "JSVariableDeclaration":
					addString("var ");
					indentLevel += 4;
					for (var i=0; i<node.children.length; i++) {
						if (i > 0) {
							addString(",");
							if (node.children.length>3) {
								newLine();
							} else {
								addString(" ");
							}
						}
						Format.visit(node.children[i]);
					}
					indentLevel-=4;	
					break;
				case "JSVariableFragment":
					addString(node.name);
					if (node.init != null) {
						addStrings(options['varAssignmentSpaceing'], "=", options['varAssignmentSpaceing']);
						Format.visit(node.init);
					}
					break;
				case "JSBlock":
					if(options['blockNewLine']) {
						newLine();
					}
					addString("{");
					indentLevel += options['blockIndent'];
					for (var i=0; i<node.children.length; i++) {
						formatStatement(node.children[i], Format);
					}
					indentLevel-=options['blockIndent'];
					newLine('}');
					break;
				case "JSIf":
					var addSemi = true;
					var pushIndent = indentLevel;
					addStrings("if ", options['ifStmtSpacing'], "(");
					Format.visit(node.expr);
					addString(")");
					if (node.trueStmt.elementType != "JSBlock") {
						indentLevel += 2;
						newLine();
						Format.visit(node.trueStmt);
						if (!node.trueStmt.nosemicolon) {
							addString(";");
						}
						indentLevel -= 2;
						addSemi = false;
					} else {
						addString(" ");
						Format.visit(node.trueStmt) ;
					}
					if (node.elseStmt != null) {
						newLine();
						addStrings(options['ifStmtSpacing'], "else", options['ifStmtSpacing']);
						if (node.elseStmt.elementType != "JSBlock") {
							indentLevel += 2;
							newLine();
							Format.visit(node.elseStmt);
							if (!node.elseStmt.nosemicolon) {
								addString(";");
							}
							indentLevel-=2;
							addSemi = false;
						} else {
							addString(" ");
							Format.visit(node.elseStmt) ;
						}
					}
					break;
				case "JSTry":
					addString("try");
					formatStatement(node.stmt, Format);
					if (node.catchBlock) {
						newLine("catch(");
						addString(node.catchArgument + ")");
						formatStatement(node.catchBlock, Format);
					}
					if (node.finallyBlock) {
						newLine("finally");
						formatStatement(node.finallyBlock, Format);
					}
					break;
				case "JSFor":
					addString("for (");
					if (node.initializations != null)
						for ( var i = 0; i < node.initializations.length; i++) {
							if (i > 0) {
								addStrings("," ,options['forParamSpacing']);
							}
							Format.visit(node.initializations[i]);
						}
					addString(";");
					if (node.condition != null) {
						Format.visit(node.condition);
					}
					addString(";");
					if (node.increments != null) {
						for ( var i = 0; i < node.increments.length; i++) {
							if (i>0) 
								addStrings("," ,options['forParamSpacing']);
							Format.visit(node.increments[i]);
						}
					}
					addString(")");
					formatStmtOrBlock(node.action, Format);
					break;
				case "JSForIn":
					addString("for (");
					Format.visit(node.iterationVar);
					addString(" in ");
					Format.visit(node.collection);
					addString(")");
					formatStmtOrBlock(node.action, Format);
					break;
				case "JSWith":
					addString("with (");
					Format.visit(node.expr);
					context.indent += 2;
					addString(")");
					formatStmtOrBlock(node.action, Format);
					break;
				case "JSDebugger":
					addString("debugger");
					break;
				case "JSBranch":
					addString(node.statement);
					if (node.targetLabel)
						addString(" "+node.targetLabel);
					break;
				case "JSExit":
					addString(node.statement);
					if (node.expr)
						addString(" "+node.expr);
					break;
				case "JSDo":
					addString("do");
					formatStmtOrBlock(node.action, Format);
					newLine("while(");
					Format.visit(node.expr);
					addString(")");
					break;
				case "JSSwitch":
					addString("switch (");
					Format.visit(node.expr);
					addString(")");
					if (options['blockNewLine']) {
						newLine();
					} else {
						addString(" ");
					}
					addString("{");
					indentLevel+= options['switchSpacing'];
					for (var i=0; i<node.children.length; i++) {
						if (node.children[i].elementType != "JSCase") {
							indentLevel += options['switchSpacing'];
							formatStatement(node.children[i], Format);
							indentLevel -= options['switchSpacing'];
						} else {
							newLine();
							Format.visit(node.children[i]);
						}
					}
					indentLevel -= options['switchSpacing'];
					newLine("}");
					break;
				case "JSCase":
					if (node.expr) {
						addString("case ");
						Format.visit(node.expr);
					} else {
						addString("default");
					}
					addString(":");
					break;
				case "JSFile":
					for (var i=0; i<node.children.length; i++) {
						formatStatement(node.children[i],this);
					}
					dontVisitChildren = true;
					break;
				default:
					break;	
				}
				return dontVisitChildren;

			}
	};

	model.visit(visitor);

	return output.join("");
};

return {
	format: Format
};

});