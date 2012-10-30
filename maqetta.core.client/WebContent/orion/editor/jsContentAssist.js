/*******************************************************************************
 * @license
 * Copyright (c) 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global define */

define("orion/editor/jsContentAssist", [], function() {

	/**
	 * Properties common to all objects - ECMA 262, section 15.2.4.
	 * @see addPropertyProposals
	 */
	var objectProps = [
		{name: "toString"}, 
		{name: "toLocaleString"}, 
		{name: "valueOf"}, 
		{name: "hasOwnProperty", args: ["property"]},
		{name: "isPrototypeOf", args: ["object"]},
		{name: "propertyIsEnumerable", args: ["property"]}
	];

	/**
	 * Properties common to all Strings - ECMA 262, section 15.5.4
	 * @see addPropertyProposals
	 */
	var stringProps = [
		{name: "charAt", args: ["index"]},
		{name: "charCodeAt", args: ["index"]},
		{name: "concat", args: ["array"]},
		{name: "indexOf", args: ["searchString", "[position]"]},
		{name: "lastIndexOf", args: ["searchString", "[position]"]},
		{name: "length", field: true},
		{name: "localeCompare", args: ["object"]},
		{name: "match", args: ["regexp"]},
		{name: "replace", args: ["searchValue", "replaceValue"]},
		{name: "search", args: ["regexp"]},
		{name: "slice", args: ["start", "end"]},
		{name: "split", args: ["separator", "[limit]"]},
		{name: "substring", args: ["start", "[end]"]},
		{name: "toLowerCase"},
		{name: "toLocaleLowerCase"},
		{name: "toUpperCase"},
		{name: "toLocaleUpperCase"},
		{name: "trim"}
	];

	/**
	 * Returns a string of all the whitespace at the start of the current line.
	 * @param {String} buffer The document
	 * @param {Integer} offset The current selection offset
	 */
	function leadingWhitespace(buffer, offset) {
		var whitespace = "";
		offset = offset-1;
		while (offset > 0) {
			var c = buffer.charAt(offset--);
			if (c === '\n' || c === '\r') {
				//we hit the start of the line so we are done
				break;
			}
			if (/\s/.test(c)) {
				//we found whitespace to add it to our result
				whitespace = c.concat(whitespace);
			} else {
				//we found non-whitespace, so reset our result
				whitespace = "";
			}

		}
		return whitespace;
	}
	
	/**
	 * Returns the current line up to, but not including, the prefix
	 */
	function prefixLine(prefix, buffer, startOffset) {
		var offset = startOffset-1;
		while (offset > 0) {
			var c = buffer.charAt(offset);
			if (c === '\n' || c === '\r') {
				//we hit the start of the line so we are done
				break;
			}
			offset--;
		}
		return buffer.substring(offset+1, (startOffset-prefix.length));
	}
	
	/**
	 * Attempts to infer the type of the receiver of a function.
	 */
	function inferType(prefix, buffer, offset) {
		var line = prefixLine(prefix, buffer, offset);
		//Note: we already know at this point the line ends with a dot
		//if the last character is a quote and there is an odd number of quotes on the line, then we have a string literal
		if (line.length > 1 && (line.charAt(line.length-2) === "\"" || line.charAt(line.length-2) === "'")) {
			return "String";
		}
		//we failed to infer the type
		return null;
	}

	/** 
	 * Removes prefix from string.
	 * @param {String} prefix
	 * @param {String} string
	 */
	function chop(prefix, string) {
		return string.substring(prefix.length);
	}
	
	/**
	 * Adds proposals for the given property descriptions (methods and fields) to the proposal list.
	 * @param properties {Array} Array of property description objects. Each object
	 * has a 'name' property indicating the function name, and an 'args' property
	 * which is an array of strings indicating the function arguments. Example: {name: "charAt", args: ["index"]}.
	 * A property can also have a 'field' boolean property indicating it is a field. If the 'field'
	 * property is not specified it is assumed to be a function.
	 * @param objectName {String} The name of the object associated with these functions
	 * @param prefix {String} The content assist prefix
	 * @param offset {Number} The buffer offset for which content assist was invoked.
	 * @param proposals {Array} The current array of proposal objects.
	 */
	function addPropertyProposals(properties, objectName, prefix, offset, proposals) {
		var text, description, positions, endOffset;
		for (var i = 0; i < properties.length; i++) {
			var name = properties[i].name;
			//don't bother computing proposals that don't match
			if (name.indexOf(prefix) !== 0) {
				continue;
			}
			var args = properties[i].args;
			if (!args || args.length === 0) {
				//don't use linked mode for functions with no arguments
				text = name + (properties[i].field ? "" : "()");
				description = text + " - " + objectName;
				proposals.push({proposal: chop(prefix, text), description: description});
				continue;
			}
			text = name + "(";
			//add linked mode position for each function argument
			positions = [];
			endOffset = offset + name.length+1 - prefix.length;
			for (var argIndex = 0; argIndex < args.length; argIndex++) {
				positions.push({offset: endOffset, length: args[argIndex].length});
				endOffset += args[argIndex].length+2;//add extra for comma and space
				//add argument to completion string
				text += args[argIndex];
				if (argIndex < args.length - 1) {
					text += ", ";
				}
			}
			text += ")";
			description = text + " - " + objectName;
			endOffset--;//no comma after last argument
			proposals.push({proposal: chop(prefix, text), description: description, positions: positions, escapePosition: endOffset});
		}
	}

	/**
	 * Returns proposals for completion on members of an object
	 */
	function getMemberProposals(prefix, buffer, offset) {
		var proposals = [];

		var type = inferType(prefix, buffer, offset);
		if (type === "String") {
			addPropertyProposals(stringProps, "String", prefix, offset, proposals);
		}
		
		//properties common to all objects
		addPropertyProposals(objectProps, "Object", prefix, offset, proposals);

		return proposals;
	}

	/**
	 * Returns proposals for javascript templates
	 */
	function getTemplateProposals(prefix, buffer, offset) {
		//any returned positions need to be offset based on current cursor position and length of prefix
		var startOffset = offset-prefix.length;
		var proposals = [];
		var whitespace = leadingWhitespace(buffer, offset);
		//common vars for each proposal
		var text, description, positions, endOffset;
		if ("if".indexOf(prefix) === 0) {
			//if statement
			text = "if (condition) {\n" + whitespace + "\t\n" + whitespace + '}';
			description = "if - if statement";
			positions = [{offset: startOffset+4, length: 9}];
			endOffset = startOffset+whitespace.length+18;//after indentation inside if body
			proposals.push({proposal: chop(prefix, text), description: description, positions: positions, escapePosition: endOffset});
			//if/else statement
			text = "if (condition) {\n" + whitespace + "\t\n" + whitespace + "} else {\n" + whitespace + "\t\n" + whitespace + "}";
			description = "if - if else statement";
			positions = [{offset: startOffset+4, length: 9}];
			endOffset = startOffset+whitespace.length+18;//after indentation inside if body
			proposals.push({proposal: chop(prefix, text), description: description, positions: positions, escapePosition: endOffset});
		}
		if ("for".indexOf(prefix) === 0) {
			//for loop
			text = "for (var i = 0; i < array.length; i++) {\n" + whitespace + "\t\n" + whitespace + '}';
			description = "for - iterate over array";
			positions = [{offset: startOffset+9, length: 1}, {offset: startOffset+20, length: 5}];
			endOffset = startOffset+whitespace.length+42;//after indentation inside for loop body
			proposals.push({proposal: chop(prefix, text), description: description, positions: positions, escapePosition: endOffset});
			//for ... in statement
			text = "for (var property in object) {\n" + whitespace + "\tif (object.hasOwnProperty(property)) {\n" + 
				whitespace + "\t\t\n" + whitespace + "\t}\n" + whitespace + '}';
			description = "for..in - iterate over properties of an object";
			positions = [{offset: startOffset+9, length: 8}, {offset: startOffset+21, length: 6}];
			endOffset = startOffset+(2*whitespace.length)+73;//after indentation inside if statement body
			proposals.push({proposal: chop(prefix, text), description: description, positions: positions, escapePosition: endOffset});
		}
		//while loop
		if ("while".indexOf(prefix) === 0) {
			text = "while (condition) {\n" + whitespace + "\t\n" + whitespace + '}';
			description = "while - while loop with condition";
			positions = [{offset: startOffset+7, length: 9}];
			endOffset = startOffset+whitespace.length+21;//after indentation inside while loop body
			proposals.push({proposal: chop(prefix, text), description: description, positions: positions, escapePosition: endOffset});
		}
		//do/while loop
		if ("do".indexOf(prefix) === 0) {
			text = "do {\n" + whitespace + "\t\n" + whitespace + "} while (condition);";
			description = "do - do while loop with condition";
			positions = [{offset: startOffset+16, length: 9}];
			endOffset = startOffset+whitespace.length+6;//after indentation inside do/while loop body
			proposals.push({proposal: chop(prefix, text), description: description, positions: positions, escapePosition: endOffset});
		}
		//switch statement
		if ("switch".indexOf(prefix) === 0) {
			text = "switch (expression) {\n" + whitespace + "\tcase value1:\n" + whitespace + "\t\t\n" +
			whitespace + "\t\tbreak;\n" + whitespace + "\tdefault:\n" + whitespace + "}";
			description = "switch - switch case statement";
			positions = [{offset: startOffset+8, length: 10}, {offset: startOffset + 28, length: 6}];
			endOffset = startOffset+(2*whitespace.length)+38;//after indentation inside first case statement
			proposals.push({proposal: chop(prefix, text), description: description, positions: positions, escapePosition: endOffset});
		}
		if ("try".indexOf(prefix) === 0) {
			//try..catch statement
			text = "try {\n" + whitespace + "\t\n" + whitespace + "} catch (err) {\n" + whitespace + "}";
			description = "try - try..catch statement";
			endOffset = startOffset+whitespace.length+7;//after indentation inside try statement
			proposals.push({proposal: chop(prefix, text), description: description, escapePosition: endOffset});
			//try..catch..finally statement
			text = "try {\n" + whitespace + "\t\n" + whitespace + "} catch (err) {\n" + whitespace +
				"} finally {\n" + whitespace + "}";
			description = "try - try..catch statement with finally block";
			endOffset = startOffset+whitespace.length+7;//after indentation inside try statement
			proposals.push({proposal: chop(prefix, text), description: description, escapePosition: endOffset});
		}
		return proposals;
	}

	/**
	 * Returns proposals for javascript keywords.
	 */
	function getKeyWordProposals(prefix, buffer, offset) {
		var keywords = ["break", "case", "catch", "continue", "debugger", "default", "delete", "do", "else", "finally", 
			"for", "function", "if", "in", "instanceof", "new", "return", "switch", "this", "throw", "try", "typeof", 
			"var", "void", "while", "with"];
		var proposals = [];
		for (var i = 0; i < keywords.length; i++) {
			if (keywords[i].indexOf(prefix) === 0) {
				proposals.push({proposal: chop(prefix, keywords[i]), description: keywords[i] });
			}
		}
		return proposals;
	}

	/**
	 * Given a block of javascript and a current index, skip any string literal or
	 * comment starting at that position. Returns the index of the character after the
	 * end of the comment or string. If the current character does not start a comment
	 * or string, the unchanged index is returned.
	 */
	function skipCommentsAndStrings(buffer, index) {
		var c = buffer.charAt(index);
		switch (c) {
			case "/" :
				if (buffer.charAt(index+1) === "/") {
					//we hit a line comment.. skip to end of line
					index = buffer.indexOf("\n", index) + 2;
					if (index === 1) {
						return buffer.length;
					}
				} else if (buffer.charAt(index+1) === "*") {
					//we hit a block comment, so jump to end of comment
					index = buffer.indexOf("*/", index+2) + 2;
					if (index === 1) {
						return buffer.length;
					}
				} else {
					//we hit a regular expression, so jump to end of expression or end of line
					var lineEnd = buffer.indexOf("\n", index);
					if (lineEnd < 0) {
						lineEnd = buffer.length;
					}
					var regexEnd = buffer.indexOf("/", index+1);
					//skip escaped frontslash inside regex
					while (regexEnd > 0 && regexEnd < lineEnd && buffer.charAt(regexEnd-1) === "\\") {
						regexEnd = buffer.indexOf("/", regexEnd+1);
					}
					index = (regexEnd > 0 && lineEnd > regexEnd) ? regexEnd : lineEnd;
					//skip the regex or line terminator character
					index++;
				}
				break;
			case "\"":
			case "\'":
				//we hit a string so jump to end of string or line, whichever comes first
				var lineEnd = buffer.indexOf("\n", index);
				if (lineEnd < 0) {
					lineEnd = buffer.length;
				}
				var stringEnd = buffer.indexOf(c, index+1);
				//skip escaped quotes
				while (stringEnd > 0 && stringEnd < lineEnd && buffer.charAt(stringEnd-1) === "\\") {
					stringEnd = buffer.indexOf(c, stringEnd+1);
				}
				index = (stringEnd > 0 && lineEnd > stringEnd) ? stringEnd : lineEnd;
				//skip the string or line terminator character
				index++;
				break;
		}
		return index;
	}

	/**
	 * Given a block of javascript and the index of an opening brace, return the location
	 * of the matching closing brace, or the end of the block if no matching brace is found.
	 */
	function findClosingBrace(buffer, start) {
		var index = start, braceDepth = 0;
		while (index < buffer.length) {
			index = skipCommentsAndStrings(buffer, index);
			var c = buffer.charAt(index);
			switch (c) {
				case "{":
					braceDepth++;
					break;
				case "}":
					if (--braceDepth === 0) {
						//we found the end!
						return index;
					}
					break;
			}
			index++;
		}
		return index;
	}
	
	/**
	 * Returns an array of all variables declared in the given block. Nested closures
	 * are skipped.
	 * @param block {String} A block of JavaScript code
	 * @return {Array(String)} All variable names declared in the block
	 */
	function collectVariables(block) {
		var variables = [];
		var index = 0;
		while ((index = skipCommentsAndStrings(block, index)) < block.length) {
			var subBlock = block.substring(index);
			if (subBlock.match(/^var\s/)) {
				//block starts a variable declaration statement
				//TODO variable assigned to a function has no semi-colon
				var endDeclaration = block.indexOf(";", index);
				if (endDeclaration < 0) {
					endDeclaration = block.length;
				}
				//TODO handle multiple declarations in a single statement
				var names = block.substring(index+3, endDeclaration).match(/[\w]+/);
				if (names) {
					variables.push(names[0]);
					index += names[0].length;
				}
				
				//skip to end of variable declaration
				index = endDeclaration+1;
			} else if (subBlock.match(/^function[\s(]/)) {
				//block starts a function declaration, so skip the function
				index = findClosingBrace(block, index);
			} else {
				//skip any words and trailing whitespace that start at current cursor position
				var words = block.substring(index).match(/^\w[\w\s\()]+/);
				if (words) {
					index += words[0].length;
				} else {
					//nothing interesting here, go to next char and repeat
					index++;
				}
			}
		}
		return variables;
	}
	
	/**
	 * Given a block of javascript, and a current cursor position, return the string of
	 * the enclosing function. Returns null if no function is founed. The returned
	 * function might not be well-formed but this function will make a best effort.
	 */
	function findEnclosingFunction(buffer, offset) {
		var block = buffer.substring(0, offset);
		var lastFunction = block.lastIndexOf("function");
		if (lastFunction >= 0) {
			var funcStart = block.indexOf("{", lastFunction);
			var funcEnd = findClosingBrace(buffer, funcStart);
			if (funcEnd < offset) {
				//this is a peer function - look for its parent closure
				return findEnclosingFunction(buffer, lastFunction);
			}
			//we found the enclosing function
			return buffer.substring(lastFunction, funcEnd);
		}
		//nothing found
		return null;
	}

	/**
	 * Returns proposals for variables and arguments within the current function scope.
	 */
	function recursiveGetFunctionProposals(prefix, buffer, startOffset) {
		var proposals = [];
		var start, i;
		
		//search only the function containing the current cursor position
		var block = findEnclosingFunction(buffer, startOffset);
		var funcStart = 0;
		if (block) {
			funcStart = buffer.indexOf(block);
			//collect function arguments
			start = block.indexOf("(");
			var end = block.indexOf(")");
			if (start >= 0 && end >= 0) {
				var argList = block.substring(start+1, end);
				var args = argList.split(",");
				for (i = 0; i < args.length; i++) {
					var arg = args[i].trim();
					if (arg.indexOf(prefix) === 0) {
						proposals.push({proposal: chop(prefix, arg), description: arg});
					}
				}
			}
			//skip to opening brace to start function
			start = block.indexOf("{");
			if (start > 0) {
				block = block.substring(start+1);
			}
		} else {
			//no function found, assume the whole script is one closure
			block = buffer;
		}
		//add proposals for all variables in the function
		var variables = collectVariables(block);
		for (i = 0; i < variables.length; i++) {
			if (variables[i].indexOf(prefix) === 0) {
				proposals.push({proposal: chop(prefix, variables[i]), description: variables[i]});
			}
		}
		//recurse on parent closure
		if (funcStart > 0) {
			proposals = proposals.concat(recursiveGetFunctionProposals(prefix, buffer, funcStart));
		}
		return proposals;
	}
	
	/**
	 * Given a block of javascript, remove all comments and literals (strings, regex).
	 * @param block {String} The javascript text
	 */
	function removeCommentsAndLiterals(block) {
		var cleanBlock = "";
		var index = 0;
		while (index < block.length) {
			index = skipCommentsAndStrings(block, index);
			cleanBlock += block.charAt(index++);
		}
		return cleanBlock;
	}
	
	/**
	 * Returns proposals for variables and arguments within the current function scope.
	 */
	function getFunctionProposals(prefix, buffer, startOffset) {
		var bufferPrefix = buffer.substring(0,startOffset);
		var cleanBuffer = removeCommentsAndLiterals(bufferPrefix);
		var removedChars = bufferPrefix.length-cleanBuffer.length;
		return recursiveGetFunctionProposals(prefix, cleanBuffer, startOffset-removedChars);
	}

	/**
	 * @name orion.editor.JavaScriptContentAssistProvider
	 * @class Provides content assist for JavaScript keywords.
	 */

	function JavaScriptContentAssistProvider() {}

	JavaScriptContentAssistProvider.prototype = /** @lends orion.editor.JavaScriptContentAssistProvider.prototype */
	{
		computeProposals: function(buffer, offset, context) {
			var prefix = context.prefix;
			var proposals = [];
			if (offset > 0) {
				//if the character preceding the prefix is a '.' character, then we are completing an object member
				var precedingChar = buffer.charAt(offset - prefix.length - 1);
				if (precedingChar === '.') {
					return getMemberProposals(prefix, buffer, offset);
				}
			}
			//we are not completing on an object member, so suggest templates and keywords
			proposals = proposals.concat(getFunctionProposals(prefix, buffer, offset-prefix.length));
			proposals = proposals.concat(getTemplateProposals(prefix, buffer, offset));
			proposals = proposals.concat(getKeyWordProposals(prefix, buffer, offset));
			return proposals;
		}
	};

	return {
		JavaScriptContentAssistProvider: JavaScriptContentAssistProvider
	};
});