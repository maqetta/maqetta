define([
	"dojo/_base/declare",
	"davinci/js/JSExpression"
], function(declare, JSExpression) {

return {

	/* String streams are the things fed to parsers (which can feed them
	 * to a tokenizer if they want). They provide peek and next methods
	 * for looking at the current character (next 'consumes' this
	 * character, peek does not), and a get method for retrieving all the
	 * text that was consumed since the last time get was called.
	 *
	 * An easy mistake to make is to let a StopIteration exception finish
	 * the token stream while there are still characters pending in the
	 * string stream (hitting the end of the buffer while parsing a
	 * token). To make it easier to detect such errors, the stringstreams
	 * throw an exception when this happens.
	 */

//	Make a stringstream stream out of an iterator that returns strings.
//	This is applied to the result of traverseDOM (see codemirror.js),
//	and the resulting stream is fed to the parser.
	stringStream: function(source) {
		// String that's currently being iterated over.
		var current = "";
		// Position in that string.
		var pos = 0;
		var offset=0;
		// Accumulator for strings that have been iterated over but not
		// get()-ed yet.
		var accum = "";
		// Make sure there are more characters ready, or throw
		// StopIteration.
		function ensureChars() {
			while (pos == current.length) {
				accum += current;
				current = ""; // In case source.next() throws
				pos = 0;
				try {
					current = source.next();
				} catch (e) {
					if (e != StopIteration) { 
						throw e; 
					} else { return false; }
				}
			}
			return true;
		}

		return {
			// peek: -> character
			// Return the next character in the stream.
			peek: function() {
				if (!ensureChars()) return null;
				return current.charAt(pos);
			},

			// next: -> character
			// Get the next character, throw StopIteration if at end, check
			// for unused content.
			next: function() {
				if (!ensureChars()) {
					if (accum.length > 0)
						throw "End of stringstream reached without emptying buffer ('" + accum + "').";
					else
						throw StopIteration;
				}
				return current.charAt(pos++);
			},

			// get(): -> string
			// Return the characters iterated over since the last call to
			// .get().
			get: function() {
				var temp = accum;
				accum = "";
				if (pos > 0){
					temp += current.slice(0, pos);
					current = current.slice(pos);
					pos = 0;
				}
				offset+=temp.length;
				return temp;
			},

			getOffset: function()  {
				return offset;
			},

			// Push a string back into the stream.
			push: function(str) {
				current = current.slice(0, pos) + str + current.slice(pos);
				offset-=str.length;
			},

			lookAhead: function(str, consume, skipSpaces, caseInsensitive) {
				function cased(str) { return caseInsensitive ? str.toLowerCase() : str; }
				str = cased(str);
				var found = false;

				var _accum = accum, _pos = pos;
				if (skipSpaces) {
					this.nextWhileMatches(/[\s\u00a0]/);
				}

				while (true) {
					var end = pos + str.length, left = current.length - pos;
					if (end <= current.length) {
						found = str == cased(current.slice(pos, end));
						pos = end;
						break;
					} else if (str.slice(0, left) == cased(current.slice(pos))) {
						accum += current; current = "";
						try {current = source.next();}
						catch (e) {if (e != StopIteration) throw e; break;}
						pos = 0;
						str = str.slice(left);
					} else {
						break;
					}
				}

				if (!(found && consume)) {
					current = accum.slice(_accum.length) + current;
					pos = _pos;
					accum = _accum;
				}

				return found;
			},

			// Wont't match past end of line.
			lookAheadRegex: function(regex, consume) {
				if (regex.source.charAt(0) != "^") {
					throw new Error("Regexps passed to lookAheadRegex must start with ^");
				}
				// Fetch the rest of the line
				while (current.indexOf("\n", pos) == -1) {
					try { 
						current += source.next(); 
					}catch (e) { 
						if (e != StopIteration) { 
							throw e; break; 
						} 
					}
				}
				var matched = current.slice(pos).match(regex);
				if (matched && consume) {
					pos += matched[0].length;
				}
				return matched;
			},

			// Utils built on top of the above
			// more: -> boolean
			// Produce true if the stream isn't empty.
			more: function() {
				return this.peek() !== null;
			},

			applies: function(test) {
				var next = this.peek();
				return (next !== null && test(next));
			},

			nextWhile: function(test) {
				var next;
				while ((next = this.peek()) !== null && test(next))
					this.next();
			},

			matches: function(re) {
				var next = this.peek();
				return (next !== null && re.test(next));
			},

			nextWhileMatches: function(re) {
				var next;
				while ((next = this.peek()) !== null && re.test(next))
					this.next();
			},

			equals: function(ch) {
				return ch === this.peek();
			},

			endOfLine: function() {
				var next = this.peek();
				return next == null || next == "\n";
			}
		};
	},

//	A framework for simple tokenizers. Takes care of newlines and
//	white-space, and of getting the text from the source stream into
//	the token object. A state is a function of two arguments -- a
//	string stream and a setState function. The second can be used to
//	change the tokenizer's state, and can be ignored for stateless
//	tokenizers. This function should advance the stream over a token
//	and return a string or object containing information about the next
//	token, or null to pass and have the (new) state be called to finish
//	the token. When a string is given, it is wrapped in a {style, type}
//	object. In the resulting object, the characters consumed are stored
//	under the content property. Any whitespace following them is also
//	automatically consumed, and added to the value property. (Thus,
//	content is the actual meaningful part of the token, while value
//	contains all the text it spans.)

	tokenizer: function(source, state) {
//		Newlines are always a separate token.
		function isWhiteSpace(ch) {
			// The messy regexp is because IE's regexp matcher is of the
			// opinion that non-breaking spaces are no whitespace.
			return ch != "\n" && /^[\s\u00a0]*$/.test(ch);
		}

		var tokenizer = {
				state: state,

				take: function(type) {
					if (typeof(type) == "string")
						type = {style: type, type: type};

					type.offset=source.getOffset();
					type.content = (type.content || "") + source.get();
//					console.log("offset="+type.offset+", content= "+type.content);   
					if (!/\n$/.test(type.content))
						source.nextWhile(isWhiteSpace);
					type.value = type.content + source.get();
					return type;
				},

				next: function () {
					if (!source.more()) throw StopIteration;

					var type;
					if (source.equals("\n")) {
						source.next();
						return this.take("whitespace");
					}

					if (source.applies(isWhiteSpace)) {
						type = "whitespace";
					} else {
						while (!type) {
							type = this.state(source, function(s) { tokenizer.state = s; });
						}
					}
					return this.take(type);
				}
		};
		return tokenizer;
	}

};

});