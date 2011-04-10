dojo.provide("eclipse.TextStyler");

/*******************************************************************************
 * Copyright (c) 2010 IBM Corporation and others All rights reserved. This
 * program and the accompanying materials are made available under the terms of
 * the Eclipse Public License v1.0 which accompanies this distribution, and is
 * available at http://www.eclipse.org/legal/epl-v10.html
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*global document window navigator */

//var eclipse = eclipse || {};

eclipse.TextStyler = (function() {

	var JS_KEYWORDS =
		["break", "continue", "do", "for", /*"import",*/ "new", "this", /*"void",*/ 
		 "case", "default", "else", "function", "in", "return", "typeof", "while",
		 "comment", "delete", "export", "if", /*"label",*/ "switch", "var", "with",
		 "abstract", "implements", "protected", /*"boolean",*/ /*"instanceOf",*/ "public", 
		 /*"byte", "int", "short", "char",*/ "interface", "static", 
		 /*"double", "long",*/ "synchronized", "false", /*"native",*/ "throws", 
		 "final", "null", "transient", /*"float",*/ "package", "true", 
		 "goto", "private", "catch", "enum", "throw", "class", "extends", "try", 
		 "const", "finally", "debugger", "super", "undefined"];

	var JAVA_KEYWORDS =
		["abstract",
		 "boolean", "break", "byte",
		 "case", "catch", "char", "class", "continue",
		 "default", "do", "double",
		 "else", "extends",
		 "false", "final", "finally", "float", "for",
		 "if", "implements", "import", "instanceof", "int", "interface",
		 "long",
		 "native", "new", "null",
		 "package", "private", "protected", "public",
		 "return",
		 "short", "static", "super", "switch", "synchronized",
		 "this", "throw", "throws", "transient", "true", "try",
		 "void", "volatile",
		 "while"];

	var CSS_KEYWORDS =
		["color", "text-align", "text-indent", "text-decoration", 
		 "font", "font-style", "font-family", "font-weight", "font-size", "font-variant", "line-height",
		 "background", "background-color", "background-image", "background-position", "background-repeat", "background-attachment",
		 "list-style", "list-style-image", "list-style-position", "list-style-type", 
		 "outline", "outline-color", "outline-style", "outline-width",
		 "border", "border-left", "border-top", "border-bottom", "border-right", "border-color", "border-width", "border-style",
		 "border-bottom-color", "border-bottom-style", "border-bottom-width",
		 "border-left-color", "border-left-style", "border-left-width",
		 "border-top-color", "border-top-style", "border-top-width",
		 "border-right-color", "border-right-style", "border-right-width",
		 "padding", "padding-left", "padding-top", "padding-bottom", "padding-right",
		 "margin", "margin-left", "margin-top", "margin-bottom", "margin-right",
		 "width", "height", "left", "top", "right", "bottom",
		 "min-width", "max-width", "min-height", "max-height",
		 "display", "visibility",
		 "clip", "cursor", "overflow", "overflow-x", "overflow-y", "position", "z-index",
		 "vertical-align", "horizontal-align",
		 "float", "clear"
		];

	// Scanner constants
	var UNKOWN = 1;
	var KEYWORD = 2;
	var STRING = 3;
	var COMMENT = 4;
	var WHITE = 5;
	var WHITE_TAB = 6;
	var WHITE_SPACE = 7;

	// Styles 
	var isIE = document.selection && window.ActiveXObject && /MSIE/.test(navigator.userAgent);
	var commentStyle = {styleClass: "token_comment"};
	var javadocStyle = {styleClass: "token_javadoc"};
	var stringStyle = {styleClass: "token_string"};
	var keywordStyle = {styleClass: "token_keyword"};
	var spaceStyle = {styleClass: "token_space"};
	var tabStyle = {styleClass: "token_tab"};
	var bracketStyle = {styleClass: isIE ? "token_bracket" : "token_bracket_outline"};
	var caretLineStyle = {styleClass: "line_caret"};
	
	var Scanner = (function() {
		function Scanner (keywords, whitespacesVisible) {
			this.keywords = keywords;
			this.whitespacesVisible = whitespacesVisible;
			this.setText("");
		}
		
		Scanner.prototype = {
			getOffset: function() {
				return this.offset;
			},
			getStartOffset: function() {
				return this.startOffset;
			},
			getData: function() {
				return this.text.substring(this.startOffset, this.offset);
			},
			getDataLength: function() {
				return this.offset - this.startOffset;
			},
			_read: function() {
				if (this.offset < this.text.length) {
					return this.text.charCodeAt(this.offset++);
				}
				return -1;
			},
			_unread: function(c) {
				if (c !== -1) { this.offset--; }
			},
			nextToken: function() {
				this.startOffset = this.offset;
				while (true) {
					var c = this._read();
					switch (c) {
						case -1: return null;
						case 47:	// SLASH -> comment
							c = this._read();
							if (c === 47) {
								while (true) {
									c = this._read();
									if ((c === -1) || (c === 10)) {
										this._unread(c);
										return COMMENT;
									}
								}
							}
							this._unread(c);
							return UNKOWN;
						case 39:	// SINGLE QUOTE -> char const
							while(true) {
								c = this._read();
								switch (c) {
									case 39:
										return STRING;
									case -1:
										this._unread(c);
										return STRING;
									case 92: // BACKSLASH
										c = this._read();
										break;
								}
							}
							break;
						case 34:	// DOUBLE QUOTE -> string
							while(true) {
								c = this._read();
								switch (c) {
									case 34: // DOUBLE QUOTE
										return STRING;
									case -1:
										this._unread(c);
										return STRING;
									case 92: // BACKSLASH
										c = this._read();
										break;
								}
							}
							break;
						case 32: // SPACE
						case 9: // TAB
							if (this.whitespacesVisible) {
								return c === 32 ? WHITE_SPACE : WHITE_TAB;
							}
							do {
								c = this._read();
							} while(c === 32 || c === 9);
							this._unread(c);
							return WHITE;
						default:
							var isCSS = this.isCSS;
							if ((97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || (48 <= c && c <= 57) || (0x2d === c && isCSS)) { //LETTER OR UNDERSCORE OR NUMBER
								var off = this.offset - 1;
								do {
									c = this._read();
								} while((97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || (48 <= c && c <= 57) || (0x2d === c && isCSS));  //LETTER OR UNDERSCORE OR NUMBER
								this._unread(c);
								var word = this.text.substring(off, this.offset);
								//TODO slow
								for (var i=0; i<this.keywords.length; i++) {
									if (this.keywords[i] === word) { return KEYWORD; }
								}
							}
							return UNKOWN;
					}
				}
			},
			setText: function(text) {
				this.text = text;
				this.offset = 0;
				this.startOffset = 0;
			}
		};
		return Scanner;
	}());
	
	var WhitespaceScanner = (function() {
		function WhitespaceScanner () {
			Scanner.call(this, null, true);
		}
		WhitespaceScanner.prototype = new Scanner(null);
		WhitespaceScanner.prototype.nextToken = function() {
			this.startOffset = this.offset;
			while (true) {
				var c = this._read();
				switch (c) {
					case -1: return null;
					case 32: // SPACE
						return WHITE_SPACE;
					case 9: // TAB
						return WHITE_TAB;
					default:
						do {
							c = this._read();
						} while(!(c === 32 || c === 9 || c === -1));
						this._unread(c);
						return UNKOWN;
				}
			}
		};
		
		return WhitespaceScanner;
	}());
	
	function TextStyler (editor, lang) {
		this.commentStart = "/*";
		this.commentEnd = "*/";
		var keywords = [];
		switch (lang) {
			case "java": keywords = JAVA_KEYWORDS; break;
			case "js": keywords = JS_KEYWORDS; break;
			case "css": keywords = CSS_KEYWORDS; break;
		}
		this.whitespacesVisible = false;
		this.highlightCaretLine = true;
		this._scanner = new Scanner(keywords, this.whitespacesVisible);
		//TODO this scanner is not the best/correct way to parse CSS
		if (lang === "css") {
			this._scanner.isCSS = true;
		}
		this._whitespaceScanner = new WhitespaceScanner();
		this.editor = editor;
		this.commentOffset = 0;
		this.commentOffsets = [];
		this._currentBracket = undefined; 
		this._matchingBracket = undefined;
		
		editor.addEventListener("Selection", this, this._onSelection);
		editor.addEventListener("ModelChanged", this, this._onModelChanged);
		editor.addEventListener("Destroy", this, this._onDestroy);
		editor.addEventListener("LineStyle", this, this._onLineStyle);
	}
	
	TextStyler.prototype = {
		destroy: function() {
			var editor = this.editor;
			if (editor) {
				editor.removeEventListener("Selection", this, this._onSelection);
				editor.removeEventListener("ModelChanged", this, this._onModelChanged);
				editor.removeEventListener("Destroy", this, this._onDestroy);
				editor.removeEventListener("LineStyle", this, this._onLineStyle);
				this.editor = null;
			}
		},
		setHighlightCaretLine: function(highlight) {
			this.highlightCaretLine = highlight;
		},
		setWhitespacesVisible: function(visible) {
			this.whitespacesVisible = visible;
			this._scanner.whitespacesVisible = visible;
		},
		_binarySearch: function(offsets, offset, low, high) {
			while (high - low > 2) {
				var index = (((high + low) >> 1) >> 1) << 1;
				var end = offsets[index + 1];
				if (end > offset) {
					high = index;
				} else {
					low = index;
				}
			}
			return high;
		},
		_computeComments: function(end) {
			// compute comments between commentOffset and end
			if (end <= this.commentOffset) { return; }
			var model = this.editor.getModel();
			var charCount = model.getCharCount();
			var e = end;
			// Uncomment to compute all comments
//			e = charCount;
			var t = /*start == this.commentOffset && e == end ? text : */model.getText(this.commentOffset, e);
			if (this.commentOffsets.length > 1 && this.commentOffsets[this.commentOffsets.length - 1] === charCount) {
				this.commentOffsets.length--;
			}
			var offset = 0;
			while (offset < t.length) {
				var begin = (this.commentOffsets.length & 1) === 0;
				var search = begin ? this.commentStart : this.commentEnd;
				var index = t.indexOf(search, offset);
				if (index !== -1) {
					this.commentOffsets.push(this.commentOffset + (begin ? index : index + search.length));
				} else {
					break;
				}
				offset = index + search.length;
			}
			if ((this.commentOffsets.length & 1) === 1) { this.commentOffsets.push(charCount); }
			this.commentOffset = e;
		},
		_getCommentRanges: function(start, end) {
			this._computeComments (end);
			var commentCount = this.commentOffsets.length;
			var commentStart = this._binarySearch(this.commentOffsets, start, -1, commentCount);
			if (commentStart >= commentCount) { return []; }
			if (this.commentOffsets[commentStart] > end) { return []; }
			var commentEnd = Math.min(commentCount - 2, this._binarySearch(this.commentOffsets, end, commentStart - 1, commentCount));
			if (this.commentOffsets[commentEnd] > end) { commentEnd = Math.max(commentStart, commentEnd - 2); }
			return this.commentOffsets.slice(commentStart, commentEnd + 2);
		},
		_getLineStyle: function(lineIndex) {
			if (this.highlightCaretLine) {
				var editor = this.editor;
				var model = this.editor.getModel();
				var selection = editor.getSelection();
				if (selection.start === selection.end && model.getLineAtOffset(selection.start) === lineIndex) {
					return caretLineStyle;
				}
			}
			return null;
		},
		_getStyles: function(text, start) {
			var end = start + text.length;
			var model = this.editor.getModel();
			
			// get comment ranges that intersect with range
			var commentRanges = this._getCommentRanges (start, end);
			var styles = [];
			
			// for any sub range that is not a comment, parse code generating tokens (keywords, numbers, brackets, line comments, etc)
			var offset = start;
			for (var i = 0; i < commentRanges.length; i+= 2) {
				var commentStart = commentRanges[i];
				if (offset < commentStart) {
					this._parse(text.substring(offset - start, commentStart - start), offset, styles);
				}
				var style = commentStyle;
				if ((commentRanges[i+1] - commentStart) > (this.commentStart.length + this.commentEnd.length)) {
					var o = commentStart + this.commentStart.length;
					if (model.getText(o, o + 1) === "*") { style = javadocStyle; }
				}
				if (this.whitespacesVisible) {
					var s = Math.max(offset, commentStart);
					var e = Math.min(end, commentRanges[i+1]);
					this._parseWhitespace(text.substring(s - start, e - start), s, styles, style);
				} else {
					styles.push({start: commentRanges[i], end: commentRanges[i+1], style: style});
				}
				offset = commentRanges[i+1];
			}
			if (offset < end) {
				this._parse(text.substring(offset - start, end - start), offset, styles);
			}
			return styles;
		},
		_parse: function(text, offset, styles) {
			var scanner = this._scanner;
			scanner.setText(text);
			var token;
			while ((token = scanner.nextToken())) {
				var tokenStart = scanner.getStartOffset() + offset;
				var style = null;
				if (tokenStart === this._matchingBracket) {
					style = bracketStyle;
				} else {
					switch (token) {
						case KEYWORD: style = keywordStyle; break;
						case STRING:
							if (this.whitespacesVisible) {
								this._parseWhitespace(scanner.getData(), tokenStart, styles, stringStyle);
								continue;
							} else {
								style = stringStyle;
							}
							break;
						case COMMENT: 
							if (this.whitespacesVisible) {
								this._parseWhitespace(scanner.getData(), tokenStart, styles, commentStyle);
								continue;
							} else {
								style = commentStyle;
							}
							break;
						case WHITE_TAB:
							if (this.whitespacesVisible) {
								style = tabStyle;
							}
							break;
						case WHITE_SPACE:
							if (this.whitespacesVisible) {
								style = spaceStyle;
							}
							break;
					}
				}
				styles.push({start: tokenStart, end: scanner.getOffset() + offset, style: style});
			}
		},
		_parseWhitespace: function(text, offset, styles, s) {
			var scanner = this._whitespaceScanner;
			scanner.setText(text);
			var token;
			while ((token = scanner.nextToken())) {
				var tokenStart = scanner.getStartOffset() + offset;
				var style = s;
				switch (token) {
					case WHITE_TAB:
						style = tabStyle;
						break;
					case WHITE_SPACE:
						style = spaceStyle;
						break;
				}
				styles.push({start: tokenStart, end: scanner.getOffset() + offset, style: style});
			}
		},
		_findBrackets: function(bracket, closingBracket, text, textOffset, start, end) {
			var result = [];
			
			// get comment ranges that intersect with range
			var commentRanges = this._getCommentRanges (start, end);
			
			// for any sub range that is not a comment, parse code generating tokens (keywords, numbers, brackets, line comments, etc)
			var offset = start, scanner = this._scanner, token, tokenData;
			for (var i = 0; i < commentRanges.length; i+= 2) {
				var commentStart = commentRanges[i];
				if (offset < commentStart) {
					scanner.setText(text.substring(offset - start, commentStart - start));
					while ((token = scanner.nextToken())) {
						if (scanner.getDataLength() !== 1) { continue; }
						tokenData = scanner.getData();
						if (tokenData === bracket) {
							result.push(scanner.getStartOffset() + offset - start + textOffset);
						}
						if (tokenData === closingBracket) {
							result.push(-(scanner.getStartOffset() + offset - start + textOffset));
						}
					}
				}
				offset = commentRanges[i+1];
			}
			if (offset < end) {
				scanner.setText(text.substring(offset - start, end - start));
				while ((token = scanner.nextToken())) {
					if (scanner.getDataLength() !== 1) { continue; }
					tokenData = scanner.getData();
					if (tokenData === bracket) {
						result.push(scanner.getStartOffset() + offset - start + textOffset);
					}
					if (tokenData === closingBracket) {
						result.push(-(scanner.getStartOffset() + offset - start + textOffset));
					}
				}
			}
			return result;
		},
		_onDestroy: function(e) {
			this.destroy();
		},
		_onLineStyle: function (e) {
			e.style = this._getLineStyle(e.lineIndex);
			e.ranges = this._getStyles(e.lineText, e.lineStart);
		},
		_onSelection: function(e) {
			var oldSelection = e.oldValue;
			var newSelection = e.newValue;
			var editor = this.editor;
			var model = editor.getModel();
			var lineIndex;
			if (this._matchingBracket !== undefined) {
				lineIndex = model.getLineAtOffset(this._matchingBracket);
				editor.redrawLines(lineIndex, lineIndex + 1);
				this._matchingBracket = this._currentBracket = undefined;
			}
			if (this.highlightCaretLine) {
				var oldLineIndex = model.getLineAtOffset(oldSelection.start);
				lineIndex = model.getLineAtOffset(newSelection.start);
				var newEmpty = newSelection.start === newSelection.end;
				var oldEmpty = oldSelection.start === oldSelection.end;
				if (!(oldLineIndex === lineIndex && oldEmpty && newEmpty)) {
					if (oldEmpty) {
						editor.redrawLines(oldLineIndex, oldLineIndex + 1);
					}
					if ((oldLineIndex !== lineIndex || !oldEmpty) && newEmpty) {
						editor.redrawLines(lineIndex, lineIndex + 1);
					}
				}
			}
			if (newSelection.start !== newSelection.end || newSelection.start === 0) {
				return;
			}
			var caret = editor.getCaretOffset();
			if (caret === 0) { return; }
			var brackets = "{}()[]<>";
			var bracket = model.getText(caret - 1, caret);
			var bracketIndex = brackets.indexOf(bracket, 0);
			if (bracketIndex === -1) { return; }
			var closingBracket;
			if (bracketIndex & 1) {
				closingBracket = brackets.substring(bracketIndex - 1, bracketIndex);
			} else {
				closingBracket = brackets.substring(bracketIndex + 1, bracketIndex + 2);
			}
			lineIndex = model.getLineAtOffset(caret);
			var lineText = model.getLine(lineIndex);
			var lineStart = model.getLineStart(lineIndex);
			var lineEnd = model.getLineEnd(lineIndex);
			brackets = this._findBrackets(bracket, closingBracket, lineText, lineStart, lineStart, lineEnd);
			for (var i=0; i<brackets.length; i++) {
				var sign = brackets[i] >= 0 ? 1 : -1;
				if (brackets[i] * sign === caret - 1) {
					var level = 1;
					this._currentBracket = brackets[i] * sign;
					if (bracketIndex & 1) {
						i--;
						for (; i>=0; i--) {
							sign = brackets[i] >= 0 ? 1 : -1;
							level += sign;
							if (level === 0) {
								this._matchingBracket = brackets[i] * sign;
								editor.redrawLines(lineIndex, lineIndex + 1);
								return;
							}
						}
						lineIndex -= 1;
						while (lineIndex >= 0) {
							lineText = model.getLine(lineIndex);
							lineStart = model.getLineStart(lineIndex);
							lineEnd = model.getLineEnd(lineIndex);
							brackets = this._findBrackets(bracket, closingBracket, lineText, lineStart, lineStart, lineEnd);
							for (var j=brackets.length - 1; j>=0; j--) {
								sign = brackets[j] >= 0 ? 1 : -1;
								level += sign;
								if (level === 0) {
									this._matchingBracket = brackets[j] * sign;
									editor.redrawLines(lineIndex, lineIndex + 1);
									return;
								}
							}
							lineIndex--;
						}
					} else {
						i++;
						for (; i<brackets.length; i++) {
							sign = brackets[i] >= 0 ? 1 : -1;
							level += sign;
							if (level === 0) {
								this._matchingBracket = brackets[i] * sign;
								editor.redrawLines(lineIndex, lineIndex + 1);
								return;
							}
						}
						lineIndex += 1;
						var lineCount = model.getLineCount ();
						while (lineIndex < lineCount) {
							lineText = model.getLine(lineIndex);
							lineStart = model.getLineStart(lineIndex);
							lineEnd = model.getLineEnd(lineIndex);
							brackets = this._findBrackets(bracket, closingBracket, lineText, lineStart, lineStart, lineEnd);
							for (var k=0; k<brackets.length; k++) {
								sign = brackets[k] >= 0 ? 1 : -1;
								level += sign;
								if (level === 0) {
									this._matchingBracket = brackets[k] * sign;
									editor.redrawLines(lineIndex, lineIndex + 1);
									return;
								}
							}
							lineIndex++;
						}
					}
					break;
				}
			}
		},
		_onModelChanged: function(e) {
			var start = e.start;
			var removedCharCount = e.removedCharCount;
			var addedCharCount = e.addedCharCount;
			if (this._matchingBracket && start < this._matchingBracket) { this._matchingBracket += addedCharCount + removedCharCount; }
			if (this._currentBracket && start < this._currentBracket) { this._currentBracket += addedCharCount + removedCharCount; }
			if (start >= this.commentOffset) { return; }
			var model = this.editor.getModel();
			
//			window.console.log("start=" + start + " added=" + addedCharCount + " removed=" + removedCharCount)
//			for (var i=0; i< this.commentOffsets.length; i++) {
//				window.console.log(i +"="+ this.commentOffsets[i]);
//			}

			var commentCount = this.commentOffsets.length;
			var extra = Math.max(this.commentStart.length - 1, this.commentEnd.length - 1);
			if (commentCount === 0) {
				this.commentOffset = Math.max(0, start - extra);
				return;
			}
			var charCount = model.getCharCount();
			var oldCharCount = charCount - addedCharCount + removedCharCount;
			var commentStart = this._binarySearch(this.commentOffsets, start, -1, commentCount);
			var end = start + removedCharCount;
			var commentEnd = this._binarySearch(this.commentOffsets, end, commentStart - 1, commentCount);
//			window.console.log("s=" + commentStart + " e=" + commentEnd);
			var ts;
			if (commentStart > 0) {
				ts = this.commentOffsets[--commentStart];
			} else {
				ts = Math.max(0, Math.min(this.commentOffsets[commentStart], start) - extra);
				--commentStart;
			}
			var te;
			var redrawEnd = charCount;
			if (commentEnd + 1 < this.commentOffsets.length) {
				te = this.commentOffsets[++commentEnd];
				if (end > (te - this.commentEnd.length)) {
					if (commentEnd + 2 < this.commentOffsets.length) { 
						commentEnd += 2;
						te = this.commentOffsets[commentEnd];
						redrawEnd = te + 1;
						if (redrawEnd > start) { redrawEnd += addedCharCount - removedCharCount; }
					} else {
						te = Math.min(oldCharCount, end + extra);
						this.commentOffset = te;
					}
				}
			} else {
				te = Math.min(oldCharCount, end + extra);
				this.commentOffset = te;
				if (commentEnd > 0 && commentEnd === this.commentOffsets.length) {
					commentEnd = this.commentOffsets.length - 1;
				}
			}
			if (ts > start) { ts += addedCharCount - removedCharCount; }
			if (te > start) { te += addedCharCount - removedCharCount; }
			
//			window.console.log("commentStart="+ commentStart + " commentEnd=" + commentEnd + " ts=" + ts + " te=" + te)

			if (this.commentOffsets.length > 1 && this.commentOffsets[this.commentOffsets.length - 1] === oldCharCount) {
				this.commentOffsets.length--;
			}
			
			var offset = 0;
			var newComments = [];
			var t = model.getText(ts, te);
			if (this.commentOffset < te) { this.commentOffset = te; }
			while (offset < t.length) {
				var begin = ((commentStart + 1 + newComments.length) & 1) === 0;
				var search = begin ? this.commentStart : this.commentEnd;
				var index = t.indexOf(search, offset);
				if (index !== -1) {
					newComments.push(ts + (begin ? index : index + search.length));
				} else {
					break;
				}
				offset = index + search.length;
			}
//			window.console.log("lengths=" + newComments.length + " " + (commentEnd - commentStart) + " t=<" + t + ">")
//			for (var i=0; i< newComments.length; i++) {
//				window.console.log(i +"=>"+ newComments[i]);
//			}
			var redraw = (commentEnd - commentStart) !== newComments.length;
			if (!redraw) {
				for (var i=0; i<newComments.length; i++) {
					offset = this.commentOffsets[commentStart + 1 + i];
					if (offset > start) { offset += addedCharCount - removedCharCount; }
					if (offset !== newComments[i]) {
						redraw = true;
						break;
					} 
				}
			}
			
			var args = [commentStart + 1, (commentEnd - commentStart)].concat(newComments);
			Array.prototype.splice.apply(this.commentOffsets, args);
			for (var k=commentStart + 1 + newComments.length; k< this.commentOffsets.length; k++) {
				this.commentOffsets[k] += addedCharCount - removedCharCount;
			}
			
			if ((this.commentOffsets.length & 1) === 1) { this.commentOffsets.push(charCount); }
			
			if (redraw) {
//				window.console.log ("redraw " + (start + addedCharCount) + " " + redrawEnd);
				this.editor.redrawRange(start + addedCharCount, redrawEnd);
			}

//			for (var i=0; i< this.commentOffsets.length; i++) {
//				window.console.log(i +"="+ this.commentOffsets[i]);
//			}

		}
	};
	return TextStyler;
}());
