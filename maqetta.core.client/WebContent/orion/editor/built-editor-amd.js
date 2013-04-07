/* orion editor */ 
/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors: IBM Corporation - initial API and implementation
 *******************************************************************************/

/*global define navigator*/
define('orion/util',[],function() {

	var userAgent = navigator.userAgent;
	var isIE = parseFloat(userAgent.split("MSIE")[1]) || undefined; //$NON-NLS-0$
	var isFirefox = parseFloat(userAgent.split("Firefox/")[1] || userAgent.split("Minefield/")[1]) || undefined; //$NON-NLS-1$ //$NON-NLS-0$
	var isOpera = userAgent.indexOf("Opera") !== -1; //$NON-NLS-0$
	var isChrome = parseFloat(userAgent.split("Chrome/")[1]) || undefined; //$NON-NLS-0$
	var isSafari = userAgent.indexOf("Safari") !== -1 && !isChrome; //$NON-NLS-0$
	var isWebkit = parseFloat(userAgent.split("WebKit/")[1]) || undefined; //$NON-NLS-0$
	var isAndroid = userAgent.indexOf("Android") !== -1; //$NON-NLS-0$
	var isIPad = userAgent.indexOf("iPad") !== -1; //$NON-NLS-0$
	var isIPhone = userAgent.indexOf("iPhone") !== -1; //$NON-NLS-0$
	var isIOS = isIPad || isIPhone;
	var isMac = navigator.platform.indexOf("Mac") !== -1; //$NON-NLS-0$
	var isWindows = navigator.platform.indexOf("Win") !== -1; //$NON-NLS-0$
	var isLinux = navigator.platform.indexOf("Linux") !== -1; //$NON-NLS-0$
	var platformDelimiter = isWindows ? "\r\n" : "\n"; //$NON-NLS-1$ //$NON-NLS-0$

	function formatMessage(msg) {
		var args = arguments;
		return msg.replace(/\$\{([^\}]+)\}/g, function(str, index) { return args[(index << 0) + 1]; });
	}
	
	var XHTML = "http://www.w3.org/1999/xhtml"; //$NON-NLS-0$
	function createElement(document, tagName) {
		if (document.createElementNS) {
			return document.createElementNS(XHTML, tagName);
		}
		return document.createElement(tagName);
	}

	return {
		formatMessage: formatMessage,
		
		createElement: createElement,
		
		/** Browsers */
		isIE: isIE,
		isFirefox: isFirefox,
		isOpera: isOpera,
		isChrome: isChrome,
		isSafari: isSafari,
		isWebkit: isWebkit,
		isAndroid: isAndroid,
		isIPad: isIPad,
		isIPhone: isIPhone,
		isIOS: isIOS,
		
		/** OSs */
		isMac: isMac,
		isWindows: isWindows,
		isLinux: isLinux,
		
		platformDelimiter: platformDelimiter
	};
});

/*******************************************************************************
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/
 
/*global define */
define("orion/editor/eventTarget", [], function() { //$NON-NLS-0$
	/** 
	 * Constructs a new EventTarget object.
	 * 
	 * @class 
	 * @name orion.editor.EventTarget
	 */
	function EventTarget() {
	}
	/**
	 * Adds in the event target interface into the specified object.
	 *
	 * @param {Object} object The object to add in the event target interface.
	 */
	EventTarget.addMixin = function(object) {
		var proto = EventTarget.prototype;
		for (var p in proto) {
			if (proto.hasOwnProperty(p)) {
				object[p] = proto[p];
			}
		}
	};
	EventTarget.prototype = /** @lends orion.editor.EventTarget.prototype */ {
		/**
		 * Adds an event listener to this event target.
		 * 
		 * @param {String} type The event type.
		 * @param {Function|EventListener} listener The function or the EventListener that will be executed when the event happens. 
		 * @param {Boolean} [useCapture=false] <code>true</code> if the listener should be trigged in the capture phase.
		 * 
		 * @see #removeEventListener
		 */
		addEventListener: function(type, listener, useCapture) {
			if (!this._eventTypes) { this._eventTypes = {}; }
			var state = this._eventTypes[type];
			if (!state) {
				state = this._eventTypes[type] = {level: 0, listeners: []};
			}
			var listeners = state.listeners;
			listeners.push({listener: listener, useCapture: useCapture});
		},
		/**
		 * Dispatches the given event to the listeners added to this event target.
		 * @param {Event} evt The event to dispatch.
		 */
		dispatchEvent: function(evt) {
			var type = evt.type;
			this._dispatchEvent("pre" + type, evt); //$NON-NLS-0$
			this._dispatchEvent(type, evt);
			this._dispatchEvent("post" + type, evt); //$NON-NLS-0$
		},
		_dispatchEvent: function(type, evt) {
			var state = this._eventTypes ? this._eventTypes[type] : null;
			if (state) {
				var listeners = state.listeners;
				try {
					state.level++;
					if (listeners) {
						for (var i=0, len=listeners.length; i < len; i++) {
							if (listeners[i]) {
								var l = listeners[i].listener;
								if (typeof l === "function") { //$NON-NLS-0$
									l.call(this, evt);
								} else if (l.handleEvent && typeof l.handleEvent === "function") { //$NON-NLS-0$
									l.handleEvent(evt);
								}
							}
						}
					}
				} finally {
					state.level--;
					if (state.compact && state.level === 0) {
						for (var j=listeners.length - 1; j >= 0; j--) {
							if (!listeners[j]) {
								listeners.splice(j, 1);
							}
						}
						if (listeners.length === 0) {
							delete this._eventTypes[type];
						}
						state.compact = false;
					}
				}
			}
		},
		/**
		 * Returns whether there is a listener for the specified event type.
		 * 
		 * @param {String} type The event type
		 * 
		 * @see #addEventListener
		 * @see #removeEventListener
		 */
		isListening: function(type) {
			if (!this._eventTypes) { return false; }
			return this._eventTypes[type] !== undefined;
		},		
		/**
		 * Removes an event listener from the event target.
		 * <p>
		 * All the parameters must be the same ones used to add the listener.
		 * </p>
		 * 
		 * @param {String} type The event type
		 * @param {Function|EventListener} listener The function or the EventListener that will be executed when the event happens. 
		 * @param {Boolean} [useCapture=false] <code>true</code> if the listener should be trigged in the capture phase.
		 * 
		 * @see #addEventListener
		 */
		removeEventListener: function(type, listener, useCapture){
			if (!this._eventTypes) { return; }
			var state = this._eventTypes[type];
			if (state) {
				var listeners = state.listeners;
				for (var i=0, len=listeners.length; i < len; i++) {
					var l = listeners[i];
					if (l && l.listener === listener && l.useCapture === useCapture) {
						if (state.level !== 0) {
							listeners[i] = null;
							state.compact = true;
						} else {
							listeners.splice(i, 1);
						}
						break;
					}
				}
				if (listeners.length === 0) {
					delete this._eventTypes[type];
				}
			}
		}
	};
	return {EventTarget: EventTarget};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/
 
/*global define*/

define("orion/editor/textModel", ['orion/editor/eventTarget', 'orion/util'], function(mEventTarget, util) { //$NON-NLS-2$  //$NON-NLS-1$ //$NON-NLS-0$

	/**
	 * Constructs a new TextModel with the given text and default line delimiter.
	 *
	 * @param {String} [text=""] the text that the model will store
	 * @param {String} [lineDelimiter=platform delimiter] the line delimiter used when inserting new lines to the model.
	 *
	 * @name orion.editor.TextModel
	 * @class The TextModel is an interface that provides text for the view. Applications may
	 * implement the TextModel interface to provide a custom store for the view content. The
	 * view interacts with its text model in order to access and update the text that is being
	 * displayed and edited in the view. This is the default implementation.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.TextView}<br/>
	 * {@link orion.editor.TextView#setModel}
	 * </p>
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function TextModel(text, lineDelimiter) {
		this._lastLineIndex = -1;
		this._text = [""];
		this._lineOffsets = [0];
		this.setText(text);
		this.setLineDelimiter(lineDelimiter);
	}

	TextModel.prototype = /** @lends orion.editor.TextModel.prototype */ {
		/**
		 * @class This object describes the options to use while finding occurrences of a string in a text model.
		 * @name orion.editor.FindOptions
		 *
		 * @property {String} string the search string to be found.
		 * @property {Boolean} [regex=false] whether or not the search string is a regular expression.
		 * @property {Boolean} [wrap=false] whether or not to wrap search.
		 * @property {Boolean} [wholeWord=false] whether or not to search only whole words.
		 * @property {Boolean} [caseInsensitive=false] whether or not search is case insensitive.
		 * @property {Boolean} [reverse=false] whether or not to search backwards.
		 * @property {Number} [start=0] The start offset to start searching
		 * @property {Number} [end=charCount] The end offset of the search. Used to search in a given range.
		 */
		/**
		 * @class This object represents a find occurrences iterator.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextModel#find}<br/>
		 * </p>		 
		 * @name orion.editor.FindIterator
		 * 
		 * @property {Function} hasNext Determines whether there are more occurrences in the iterator.
		 * @property {Function} next Returns the next matched range {start,end} in the iterator.
		 */	
		/**
		 * Finds occurrences of a string in the text model.
		 *
		 * @param {orion.editor.FindOptions} options the search options
		 * @return {orion.editor.FindIterator} the find occurrences iterator.
		 */
		find: function(options) {
			if (this._text.length > 1) {
				this._text = [this._text.join("")];
			}
			var string = options.string;
			var regex = options.regex;
			var pattern = string;
			if (!regex && string) {
				pattern = string.replace(/([\\$\^*\/+?\.\(\)|{}\[\]])/g, "\\$&"); //$NON-NLS-0$
			}
			var current = null, skip;
			if (pattern) {
				var reverse = options.reverse;
				var wrap = options.wrap;
				var wholeWord = options.wholeWord;
				var caseInsensitive = options.caseInsensitive;
				var start = options.start || 0;
				var end = options.end;
				var isRange = options.end !== undefined;
				var flags = "";
				if (flags.indexOf("g") === -1) { flags += "g"; } //$NON-NLS-1$ //$NON-NLS-0$
				if (caseInsensitive) {
					if (flags.indexOf("i") === -1) { flags += "i"; } //$NON-NLS-1$ //$NON-NLS-0$
				}
				if (wholeWord) {
					pattern = "\\b" + pattern + "\\b"; //$NON-NLS-1$ //$NON-NLS-0$
				}
				var text = this._text[0], result, lastIndex, offset = 0;
				if (isRange) {
					text = text.substring(start, end);
					offset = start;
				}
				var re = new RegExp(pattern, flags);
				if (reverse) {
					skip = function() {
						var match = null;
						re.lastIndex = 0;
						while (true) {
							lastIndex = re.lastIndex;
							result = re.exec(text);
							if (lastIndex === re.lastIndex) {
								return null;
							}
							if (result) {
								if (result.index < start) {
									match = {start: result.index + offset, end: re.lastIndex + offset};
								} else {
									if (!wrap || match) {
										break;
									}
									start = text.length;
									match = {start: result.index + offset, end: re.lastIndex + offset};
								}
							} else {
								break;
							}
						}
						if (match) { start = match.start; }
						return match;
					};
				} else {
					if (!isRange) {
						re.lastIndex = start;
					}
					skip = function() {
						while (true) {
							lastIndex = re.lastIndex;
							result = re.exec(text);
							if (lastIndex === re.lastIndex) {
								return null;
							}
							if (result) {
								return {start: result.index + offset, end: re.lastIndex + offset};
							}
							if (lastIndex !== 0) {
								if (wrap) {
									continue;
								}
							}
							break;
						}
						return null;
					};
				}
				current = skip();
			}
			return {
				next: function() {
					var result = current;
					if (result) { current = skip(); }
					return result;					
				},
				hasNext: function() {
					return current !== null;
				}
			};
		},
		/**
		 * Returns the number of characters in the model.
		 *
		 * @returns {Number} the number of characters in the model.
		 */
		getCharCount: function() {
			var count = 0;
			for (var i = 0; i<this._text.length; i++) {
				count += this._text[i].length;
			}
			return count;
		},
		/**
		 * Returns the text of the line at the given index.
		 * <p>
		 * The valid indices are 0 to line count exclusive.  Returns <code>null</code> 
		 * if the index is out of range. 
		 * </p>
		 *
		 * @param {Number} lineIndex the zero based index of the line.
		 * @param {Boolean} [includeDelimiter=false] whether or not to include the line delimiter. 
		 * @returns {String} the line text or <code>null</code> if out of range.
		 *
		 * @see #getLineAtOffset
		 */
		getLine: function(lineIndex, includeDelimiter) {
			var lineCount = this.getLineCount();
			if (!(0 <= lineIndex && lineIndex < lineCount)) {
				return null;
			}
			var start = this._lineOffsets[lineIndex];
			if (lineIndex + 1 < lineCount) {
				var text = this.getText(start, this._lineOffsets[lineIndex + 1]);
				if (includeDelimiter) {
					return text;
				}
				var end = text.length, c;
				while (((c = text.charCodeAt(end - 1)) === 10) || (c === 13)) {
					end--;
				}
				return text.substring(0, end);
			} else {
				return this.getText(start); 
			}
		},
		/**
		 * Returns the line index at the given character offset.
		 * <p>
		 * The valid offsets are 0 to char count inclusive. The line index for
		 * char count is <code>line count - 1</code>. Returns <code>-1</code> if
		 * the offset is out of range.
		 * </p>
		 *
		 * @param {Number} offset a character offset.
		 * @returns {Number} the zero based line index or <code>-1</code> if out of range.
		 */
		getLineAtOffset: function(offset) {
			var charCount = this.getCharCount();
			if (!(0 <= offset && offset <= charCount)) {
				return -1;
			}
			var lineCount = this.getLineCount();
			if (offset === charCount) {
				return lineCount - 1; 
			}
			var lineStart, lineEnd;
			var index = this._lastLineIndex;
			if (0 <= index && index < lineCount) {
				lineStart = this._lineOffsets[index];
				lineEnd = index + 1 < lineCount ? this._lineOffsets[index + 1] : charCount;
				if (lineStart <= offset && offset < lineEnd) {
					return index;
				}
			}
			var high = lineCount;
			var low = -1;
			while (high - low > 1) {
				index = Math.floor((high + low) / 2);
				lineStart = this._lineOffsets[index];
				lineEnd = index + 1 < lineCount ? this._lineOffsets[index + 1] : charCount;
				if (offset <= lineStart) {
					high = index;
				} else if (offset < lineEnd) {
					high = index;
					break;
				} else {
					low = index;
				}
			}
			this._lastLineIndex = high;
			return high;
		},
		/**
		 * Returns the number of lines in the model.
		 * <p>
		 * The model always has at least one line.
		 * </p>
		 *
		 * @returns {Number} the number of lines.
		 */
		getLineCount: function() {
			return this._lineOffsets.length;
		},
		/**
		 * Returns the line delimiter that is used by the view
		 * when inserting new lines. New lines entered using key strokes 
		 * and paste operations use this line delimiter.
		 *
		 * @return {String} the line delimiter that is used by the view when inserting new lines.
		 */
		getLineDelimiter: function() {
			return this._lineDelimiter;
		},
		/**
		 * Returns the end character offset for the given line. 
		 * <p>
		 * The end offset is not inclusive. This means that when the line delimiter is included, the 
		 * offset is either the start offset of the next line or char count. When the line delimiter is
		 * not included, the offset is the offset of the line delimiter.
		 * </p>
		 * <p>
		 * The valid indices are 0 to line count exclusive.  Returns <code>-1</code> 
		 * if the index is out of range. 
		 * </p>
		 *
		 * @param {Number} lineIndex the zero based index of the line.
		 * @param {Boolean} [includeDelimiter=false] whether or not to include the line delimiter. 
		 * @return {Number} the line end offset or <code>-1</code> if out of range.
		 *
		 * @see #getLineStart
		 */
		getLineEnd: function(lineIndex, includeDelimiter) {
			var lineCount = this.getLineCount();
			if (!(0 <= lineIndex && lineIndex < lineCount)) {
				return -1;
			}
			if (lineIndex + 1 < lineCount) {
				var end = this._lineOffsets[lineIndex + 1];
				if (includeDelimiter) {
					return end;
				}
				var text = this.getText(Math.max(this._lineOffsets[lineIndex], end - 2), end);
				var i = text.length, c;
				while (((c = text.charCodeAt(i - 1)) === 10) || (c === 13)) {
					i--;
				}
				return end - (text.length - i);
			} else {
				return this.getCharCount();
			}
		},
		/**
		 * Returns the start character offset for the given line.
		 * <p>
		 * The valid indices are 0 to line count exclusive.  Returns <code>-1</code> 
		 * if the index is out of range. 
		 * </p>
		 *
		 * @param {Number} lineIndex the zero based index of the line.
		 * @return {Number} the line start offset or <code>-1</code> if out of range.
		 *
		 * @see #getLineEnd
		 */
		getLineStart: function(lineIndex) {
			if (!(0 <= lineIndex && lineIndex < this.getLineCount())) {
				return -1;
			}
			return this._lineOffsets[lineIndex];
		},
		/**
		 * Returns the text for the given range.
		 * <p>
		 * The end offset is not inclusive. This means that character at the end offset
		 * is not included in the returned text.
		 * </p>
		 *
		 * @param {Number} [start=0] the zero based start offset of text range.
		 * @param {Number} [end=char count] the zero based end offset of text range.
		 *
		 * @see #setText
		 */
		getText: function(start, end) {
			if (start === undefined) { start = 0; }
			if (end === undefined) { end = this.getCharCount(); }
			if (start === end) { return ""; }
			var offset = 0, chunk = 0, length;
			while (chunk<this._text.length) {
				length = this._text[chunk].length; 
				if (start <= offset + length) { break; }
				offset += length;
				chunk++;
			}
			var firstOffset = offset;
			var firstChunk = chunk;
			while (chunk<this._text.length) {
				length = this._text[chunk].length; 
				if (end <= offset + length) { break; }
				offset += length;
				chunk++;
			}
			var lastOffset = offset;
			var lastChunk = chunk;
			if (firstChunk === lastChunk) {
				return this._text[firstChunk].substring(start - firstOffset, end - lastOffset);
			}
			var beforeText = this._text[firstChunk].substring(start - firstOffset);
			var afterText = this._text[lastChunk].substring(0, end - lastOffset);
			return beforeText + this._text.slice(firstChunk+1, lastChunk).join("") + afterText; 
		},
		/**
		 * Notifies all listeners that the text is about to change.
		 * <p>
		 * This notification is intended to be used only by the view. Application clients should
		 * use {@link orion.editor.TextView#event:onModelChanging}.
		 * </p>
		 * <p>
		 * NOTE: This method is not meant to called directly by application code. It is called internally by the TextModel
		 * as part of the implementation of {@link #setText}. This method is included in the public API for documentation
		 * purposes and to allow integration with other toolkit frameworks.
		 * </p>
		 *
		 * @param {orion.editor.ModelChangingEvent} modelChangingEvent the changing event
		 */
		onChanging: function(modelChangingEvent) {
			return this.dispatchEvent(modelChangingEvent);
		},
		/**
		 * Notifies all listeners that the text has changed.
		 * <p>
		 * This notification is intended to be used only by the view. Application clients should
		 * use {@link orion.editor.TextView#event:onModelChanged}.
		 * </p>
		 * <p>
		 * NOTE: This method is not meant to called directly by application code. It is called internally by the TextModel
		 * as part of the implementation of {@link #setText}. This method is included in the public API for documentation
		 * purposes and to allow integration with other toolkit frameworks.
		 * </p>
		 *
		 * @param {orion.editor.ModelChangedEvent} modelChangedEvent the changed event
		 */
		onChanged: function(modelChangedEvent) {
			return this.dispatchEvent(modelChangedEvent);
		},
		/**
		 * Sets the line delimiter that is used by the view
		 * when new lines are inserted in the model due to key
		 * strokes and paste operations. The line delimiter of
		 * existing lines are unchanged unless the to <code>all</code>
		 * argument is <code>true</code>.
		 * <p>
		 * If lineDelimiter is "auto", the delimiter is computed to be
		 * the first delimiter found in the current text. If lineDelimiter
		 * is undefined or if there are no delimiters in the current text, the
		 * platform delimiter is used.
		 * </p>
		 *
		 * @param {String} lineDelimiter the line delimiter that is used by the view when inserting new lines.
		 * @param {Boolean} [all=false] whether or not the delimiter of existing lines are changed.
		 */
		setLineDelimiter: function(lineDelimiter, all) {
			if (lineDelimiter === "auto") { //$NON-NLS-0$
				lineDelimiter = undefined;
				if (this.getLineCount() > 1) {
					lineDelimiter = this.getText(this.getLineEnd(0), this.getLineEnd(0, true));
				}
			}
			this._lineDelimiter = lineDelimiter ? lineDelimiter : util.platformDelimiter;
			if (all) {
				var lineCount = this.getLineCount();
				if (lineCount > 1) {
					var lines = new Array(lineCount);
					for (var i=0; i<lineCount; i++) {
						lines[i] = this.getLine(i);
					}
					this.setText(lines.join(this._lineDelimiter));
				}
			}
		},
		/**
		 * Replaces the text in the given range with the given text.
		 * <p>
		 * The end offset is not inclusive. This means that the character at the 
		 * end offset is not replaced.
		 * </p>
		 * <p>
		 * The text model must notify the listeners before and after the
		 * the text is changed by calling {@link #onChanging} and {@link #onChanged}
		 * respectively. 
		 * </p>
		 *
		 * @param {String} [text=""] the new text.
		 * @param {Number} [start=0] the zero based start offset of text range.
		 * @param {Number} [end=char count] the zero based end offset of text range.
		 *
		 * @see #getText
		 */
		setText: function(text, start, end) {
			if (text === undefined) { text = ""; }
			if (start === undefined) { start = 0; }
			if (end === undefined) { end = this.getCharCount(); }
			if (start === end && text === "") { return; }
			var startLine = this.getLineAtOffset(start);
			var endLine = this.getLineAtOffset(end);
			var eventStart = start;
			var removedCharCount = end - start;
			var removedLineCount = endLine - startLine;
			var addedCharCount = text.length;
			var addedLineCount = 0;
			var lineCount = this.getLineCount();
			
			var cr = 0, lf = 0, index = 0;
			var newLineOffsets = [];
			while (true) {
				if (cr !== -1 && cr <= index) { cr = text.indexOf("\r", index); } //$NON-NLS-0$
				if (lf !== -1 && lf <= index) { lf = text.indexOf("\n", index); } //$NON-NLS-0$
				if (lf === -1 && cr === -1) { break; }
				if (cr !== -1 && lf !== -1) {
					if (cr + 1 === lf) {
						index = lf + 1;
					} else {
						index = (cr < lf ? cr : lf) + 1;
					}
				} else if (cr !== -1) {
					index = cr + 1;
				} else {
					index = lf + 1;
				}
				newLineOffsets.push(start + index);
				addedLineCount++;
			}
		
			var modelChangingEvent = {
				type: "Changing", //$NON-NLS-0$
				text: text,
				start: eventStart,
				removedCharCount: removedCharCount,
				addedCharCount: addedCharCount,
				removedLineCount: removedLineCount,
				addedLineCount: addedLineCount
			};
			this.onChanging(modelChangingEvent);
			
			//TODO this should be done the loops below to avoid getText()
			if (newLineOffsets.length === 0) {
				var startLineOffset = this.getLineStart(startLine), endLineOffset;
				if (endLine + 1 < lineCount) {
					endLineOffset = this.getLineStart(endLine + 1);
				} else {
					endLineOffset = this.getCharCount();
				}
				if (start !== startLineOffset) {
					text = this.getText(startLineOffset, start) + text;
					start = startLineOffset;
				}
				if (end !== endLineOffset) {
					text = text + this.getText(end, endLineOffset);
					end = endLineOffset;
				}
			}
			
			var changeCount = addedCharCount - removedCharCount;
			for (var j = startLine + removedLineCount + 1; j < lineCount; j++) {
				this._lineOffsets[j] += changeCount;
			}
			var args = [startLine + 1, removedLineCount].concat(newLineOffsets);
			Array.prototype.splice.apply(this._lineOffsets, args);
			
			var offset = 0, chunk = 0, length;
			while (chunk<this._text.length) {
				length = this._text[chunk].length; 
				if (start <= offset + length) { break; }
				offset += length;
				chunk++;
			}
			var firstOffset = offset;
			var firstChunk = chunk;
			while (chunk<this._text.length) {
				length = this._text[chunk].length; 
				if (end <= offset + length) { break; }
				offset += length;
				chunk++;
			}
			var lastOffset = offset;
			var lastChunk = chunk;
			var firstText = this._text[firstChunk];
			var lastText = this._text[lastChunk];
			var beforeText = firstText.substring(0, start - firstOffset);
			var afterText = lastText.substring(end - lastOffset);
			var params = [firstChunk, lastChunk - firstChunk + 1];
			if (beforeText) { params.push(beforeText); }
			if (text) { params.push(text); }
			if (afterText) { params.push(afterText); }
			Array.prototype.splice.apply(this._text, params);
			if (this._text.length === 0) { this._text = [""]; }
			
			var modelChangedEvent = {
				type: "Changed", //$NON-NLS-0$
				start: eventStart,
				removedCharCount: removedCharCount,
				addedCharCount: addedCharCount,
				removedLineCount: removedLineCount,
				addedLineCount: addedLineCount
			};
			this.onChanged(modelChangedEvent);
		}
	};
	mEventTarget.EventTarget.addMixin(TextModel.prototype);
	
	return {TextModel: TextModel};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
 
/*globals define*/

define("orion/editor/textTheme", //$NON-NLS-0$
[
	'require', //$NON-NLS-0$
	'orion/editor/eventTarget', //$NON-NLS-0$
	'orion/util' //$NON-NLS-0$
], function(require, mEventTarget, util) {
	var THEME_PREFIX = "orion-theme-"; //$NON-NLS-0$
	
	var Themes = {};

	/**
	 * Constructs a new text theme. 
	 * 
	 * @class A TextTheme is a class used to specify an editor theme.
	 * @name orion.editor.TextTheme
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function TextTheme(options) {
		options = options || {};
		this._document = options.document || document;
	}

	/**
	 * Gets an instance of <code>orion.editor.TextTheme</code> by name. If the name
	 * paramenter is not speficed the default text theme instance is returned.
	 * Subsequent calls of <code>getTheme</code> with the same name will return
	 * the same instance.
	 */
	TextTheme.getTheme = function(name) {
		name = name || "default"; //$NON-NLS-0$
		var theme = Themes[name];
		if (!theme) {
			theme = Themes[name] = new TextTheme();
		}
		return theme;
	};

	TextTheme.prototype = /** @lends orion.editor.TextTheme.prototype */ {
		/**
		 * Returns the theme className.
		 *
		 * @see #setThemeClass
		 */
		getThemeClass: function() {
			return this._themeClass;
		},
		/**
		 * @class This object represents a style sheet for a theme manager.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextTheme#setThemeClass}
		 * </p>
		 * @name orion.editor.ThemeStyleSheet
		 * 
		 * @property {String} href The href of the stylesheet
		 */
		/**
		 * Sets the theme className and style sheet.
		 * <p>
		 * If the <code>stylesheet</code> parameter is a string, it represents an inline
		 * CSS and it will be added to the document as a <i>STYLE</i> tag element.  If the
		 * <code>stylesheet</code> parameter is a <code>orion.editor.ThemeStyleSheet</code>,
		 * its href property is loaded as either a <i>STYLE</i> tag element or as a <i>LINK</i>
		 * tag element.
		 * </p>
		 * <p>
		 * Listeners of the ThemeChanged event are notify once the styled sheet is loaded
		 * into the document.
		 * </p>
		 *
		 * @param {String} className the new theme className.
		 * @param {String|orion.editor.ThemeStyleSheet} styleSheet the CSS stylesheet for the new theme className.
		 *
		 * @see #getThemeClass
		 * @see #onThemeChanged
		 */
		 setThemeClass: function(className, styleSheet) {
			var self = this;
			var oldThemeClass = self._themeClass;	
			self._themeClass = className;
			this._load(className, styleSheet, function() {
				self.onThemeChanged({
					type: "ThemeChanged", //$NON-NLS-0$
					oldValue: oldThemeClass,
					newValue: self.getThemeClass()
				});
			});
		},
		/**
		 * @class This is the event sent when the theme className or style sheet has changed.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextTheme}<br/>
		 * {@link orion.editor.TextTheme#event:onThemeChanged}
		 * </p>
		 * @name orion.editor.ThemeChangedEvent
		 * 
		 * @property {String} oldValue The old theme clasName.
		 * @property {String} newValue The new theme className.
		 */
		/**
		 * This event is sent when the theme clasName has changed and its style sheet has been loaded in the document.
		 *
		 * @event
		 * @param {orion.editor.ThemeChangedEvent} themeChangedEvent the event
		 */
		onThemeChanged: function(themeChangedEvent) {
			return this.dispatchEvent(themeChangedEvent);
		},
		/**
		 * @private
		 */
		buildStyleSheet: function(themeClass, settings) {
			
			var result = [];
			result.push("");
			
			//view container
			var family = settings.fontFamily;
			if (family === "sans serif") { //$NON-NLS-0$
				family = '"Menlo", "Consolas", "Vera Mono", "monospace"'; //$NON-NLS-0$
			} else {
				family = 'monospace'; //$NON-NLS-0$
			}	
			
			result.push("." + themeClass + " {"); //$NON-NLS-1$ //$NON-NLS-0$
			result.push("\tfont-family: " + family + ";"); //$NON-NLS-1$ //$NON-NLS-0$
			result.push("\tfont-size: " + settings.fontSize + ";"); //$NON-NLS-1$ //$NON-NLS-0$
			result.push("\tcolor: " + settings.text + ";"); //$NON-NLS-1$ //$NON-NLS-0$
			result.push("}"); //$NON-NLS-0$
			
			//From textview.css
			result.push("." + themeClass + ".textview {"); //$NON-NLS-1$ //$NON-NLS-0$
			result.push("\tbackground-color: " + settings.background + ";"); //$NON-NLS-1$ //$NON-NLS-0$
			result.push("}"); //$NON-NLS-0$
			
			function defineRule(className, value, isBackground) {
				result.push("." + themeClass + " ." + className + " {"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
				result.push("\t" + (isBackground ? "background-color" : "color") + ": " + value + ";"); //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
				result.push("}"); //$NON-NLS-0$
			}
			
			//From rulers.css
			defineRule("ruler.annotations", settings.annotationRuler, true); //$NON-NLS-0$
			defineRule("ruler.lines", settings.annotationRuler, true); //$NON-NLS-0$
			defineRule("ruler.folding", settings.annotationRuler, true); //$NON-NLS-0$
			defineRule("ruler.overview", settings.overviewRuler, true); //$NON-NLS-0$
			defineRule("rulerLines", settings.lineNumber, false); //$NON-NLS-0$
			defineRule("rulerLines.even", settings.lineNumberEven, false); //$NON-NLS-0$
			defineRule("rulerLines.odd", settings.lineNumberOdd, false); //$NON-NLS-0$
			
			//From annotations.css
			defineRule("annotationLine.currentLine", settings.currentLine, true); //$NON-NLS-0$
			
			//From default-theme.css
			defineRule("entity-name-tag", settings.keyword, false); //$NON-NLS-0$
			defineRule("entity-other-attribute-name", settings.attribute, false); //$NON-NLS-0$
			defineRule("string-quoted", settings.string, false); //$NON-NLS-0$
			
			//From textstyler.css
			defineRule("line_caret", settings.currentLine, true); //$NON-NLS-0$
			defineRule("token_keyword", settings.keyword, false); //$NON-NLS-0$
			defineRule("token_string", settings.string, false); //$NON-NLS-0$
			defineRule("token_singleline_comment", settings.comment, false); //$NON-NLS-0$
			defineRule("token_multiline_comment", settings.comment, false); //$NON-NLS-0$
			defineRule("token_doc_comment", settings.comment, false); //$NON-NLS-0$
			defineRule("token_doc_html_markup", settings.comment, false); //$NON-NLS-0$
			
			return result.join("\n"); //$NON-NLS-0$
		},
		/**
		 * @private
		 */
		_createStyle: function(className, styleSheet, callback, link) {
			var document = this._document;
			var id = THEME_PREFIX + className;
			var node = document.getElementById(id);
			if (node) {
				if (link || node.firstChild.data === styleSheet) {
					return;
				}
				node.removeChild(node.firstChild);
				node.appendChild(document.createTextNode(styleSheet));
			} else {
				if (link) {
					node = util.createElement(document, "link"); //$NON-NLS-0$
					node.rel = "stylesheet"; //$NON-NLS-0$
					node.type = "text/css"; //$NON-NLS-0$
					node.href = styleSheet;
					node.addEventListener("load", function() { //$NON-NLS-0$
						callback();
					});
				} else {
					node = util.createElement(document, "style"); //$NON-NLS-0$
					node.appendChild(document.createTextNode(styleSheet));
				}
				node.id = id;
				var head = document.getElementsByTagName("head")[0] || document.documentElement; //$NON-NLS-0$
				head.appendChild(node);
			}
			if (!link) {
				callback();
			}
		},
		/**
		 * @private
		 */
		_load: function (className, styleSheet, callback) {
			if (!className) {
				callback();
				return;
			}
			if (typeof styleSheet === "string") { //$NON-NLS-0$
				this._createStyle(className, styleSheet, callback);
				return;
			}
			var href = styleSheet.href;
			var extension = ".css"; //$NON-NLS-0$
			if (href.substring(href.length - extension.length) !== extension) {
				href += extension;
			}
			if (/^\//.test(href) || /[a-zA-Z0-9]+:\/\//i.test(href) || !require.toUrl /* almond cannot load dynamically */) {
				this._createStyle(className, href, callback, true);
			} else {
				var self = this;
				require(["text!" + href], function(cssText) { //$NON-NLS-0$
					self._createStyle(className, cssText, callback, false);
				});
			}
		}
	};
	mEventTarget.EventTarget.addMixin(TextTheme.prototype);
	
	return {
		TextTheme: TextTheme
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/

/*global define */

define("orion/editor/projectionTextModel", ['orion/editor/textModel', 'orion/editor/eventTarget'], function(mTextModel, mEventTarget) { //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$

	/**
	 * @class This object represents a projection range. A projection specifies a
	 * range of text and the replacement text. The range of text is relative to the
	 * base text model associated to a projection model.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.ProjectionTextModel}<br/>
	 * {@link orion.editor.ProjectionTextModel#addProjection}<br/>
	 * </p>		 
	 * @name orion.editor.Projection
	 * 
	 * @property {Number} start The start offset of the projection range. 
	 * @property {Number} end The end offset of the projection range. This offset is exclusive.
	 * @property {String|orion.editor.TextModel} [text=""] The projection text to be inserted
	 */
	/**
	 * Constructs a new <code>ProjectionTextModel</code> based on the specified <code>TextModel</code>.
	 *
	 * @param {orion.editor.TextModel} baseModel The base text model.
	 *
	 * @name orion.editor.ProjectionTextModel
	 * @class The <code>ProjectionTextModel</code> represents a projection of its base text
	 * model. Projection ranges can be added to the projection text model to hide and/or insert
	 * ranges to the base text model.
	 * <p>
	 * The contents of the projection text model is modified when changes occur in the base model,
	 * projection model or by calls to {@link #addProjection} and {@link #removeProjection}.
	 * </p>
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.TextView}<br/>
	 * {@link orion.editor.TextModel}
	 * {@link orion.editor.TextView#setModel}
	 * </p>
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function ProjectionTextModel(baseModel) {
		this._model = baseModel;	/* Base Model */
		this._projections = [];
	}

	ProjectionTextModel.prototype = /** @lends orion.editor.ProjectionTextModel.prototype */ {
		/**
		 * Adds a projection range to the model.
		 * <p>
		 * The model must notify the listeners before and after the the text is
		 * changed by calling {@link #onChanging} and {@link #onChanged} respectively. 
		 * </p>
		 * @param {orion.editor.Projection} projection The projection range to be added.
		 * 
		 * @see #removeProjection
		 */
		addProjection: function(projection) {
			if (!projection) {return;}
			//start and end can't overlap any exist projection
			var model = this._model, projections = this._projections;
			projection._lineIndex = model.getLineAtOffset(projection.start);
			projection._lineCount = model.getLineAtOffset(projection.end) - projection._lineIndex;
			var text = projection.text;
			if (!text) { text = ""; }
			if (typeof text === "string") { //$NON-NLS-0$
				projection._model = new mTextModel.TextModel(text, model.getLineDelimiter());
			} else {
				projection._model = text;
			}
			var eventStart = this.mapOffset(projection.start, true);
			var removedCharCount = projection.end - projection.start;
			var removedLineCount = projection._lineCount;
			var addedCharCount = projection._model.getCharCount();
			var addedLineCount = projection._model.getLineCount() - 1;
			var modelChangingEvent = {
				type: "Changing", //$NON-NLS-0$
				text: projection._model.getText(),
				start: eventStart,
				removedCharCount: removedCharCount,
				addedCharCount: addedCharCount,
				removedLineCount: removedLineCount,
				addedLineCount: addedLineCount
			};
			this.onChanging(modelChangingEvent);
			var index = this._binarySearch(projections, projection.start);
			projections.splice(index, 0, projection);
			var modelChangedEvent = {
				type: "Changed", //$NON-NLS-0$
				start: eventStart,
				removedCharCount: removedCharCount,
				addedCharCount: addedCharCount,
				removedLineCount: removedLineCount,
				addedLineCount: addedLineCount
			};
			this.onChanged(modelChangedEvent);
		},
		/**
		 * Returns all projection ranges of this model.
		 * 
		 * @return {orion.editor.Projection[]} The projection ranges.
		 * 
		 * @see #addProjection
		 */
		getProjections: function() {
			return this._projections.slice(0);
		},
		/**
		 * Gets the base text model.
		 *
		 * @return {orion.editor.TextModel} The base text model.
		 */
		getBaseModel: function() {
			return this._model;
		},
		/**
		 * Maps offsets between the projection model and its base model.
		 *
		 * @param {Number} offset The offset to be mapped.
		 * @param {Boolean} [baseOffset=false] <code>true</code> if <code>offset</code> is in base model and
		 *	should be mapped to the projection model.
		 * @return {Number} The mapped offset
		 */
		mapOffset: function(offset, baseOffset) {
			var projections = this._projections, delta = 0, i, projection;
			if (baseOffset) {
				for (i = 0; i < projections.length; i++) {
					projection = projections[i];
					if (projection.start > offset) { break; }
					if (projection.end > offset) { return -1; }
					delta += projection._model.getCharCount() - (projection.end - projection.start);
				}
				return offset + delta;
			}
			for (i = 0; i < projections.length; i++) {
				projection = projections[i];
				if (projection.start > offset - delta) { break; }
				var charCount = projection._model.getCharCount();
				if (projection.start + charCount > offset - delta) {
					return -1;
				}
				delta += charCount - (projection.end - projection.start);
			}
			return offset - delta;
		},
		/**
		 * Removes a projection range from the model.
		 * <p>
		 * The model must notify the listeners before and after the the text is
		 * changed by calling {@link #onChanging} and {@link #onChanged} respectively. 
		 * </p>
		 * 
		 * @param {orion.editor.Projection} projection The projection range to be removed.
		 * 
		 * @see #addProjection
		 */
		removeProjection: function(projection) {
			//TODO remove listeners from model
			var i, delta = 0;
			for (i = 0; i < this._projections.length; i++) {
				var p = this._projections[i];
				if (p === projection) {
					projection = p;
					break;
				}
				delta += p._model.getCharCount() - (p.end - p.start);
			}
			if (i < this._projections.length) {
				var model = this._model;
				var eventStart = projection.start + delta;
				var addedCharCount = projection.end - projection.start;
				var addedLineCount = projection._lineCount;
				var removedCharCount = projection._model.getCharCount();
				var removedLineCount = projection._model.getLineCount() - 1;
				var modelChangingEvent = {
					type: "Changing", //$NON-NLS-0$
					text: model.getText(projection.start, projection.end),
					start: eventStart,
					removedCharCount: removedCharCount,
					addedCharCount: addedCharCount,
					removedLineCount: removedLineCount,
					addedLineCount: addedLineCount
				};
				this.onChanging(modelChangingEvent);
				this._projections.splice(i, 1);
				var modelChangedEvent = {
					type: "Changed", //$NON-NLS-0$
					start: eventStart,
					removedCharCount: removedCharCount,
					addedCharCount: addedCharCount,
					removedLineCount: removedLineCount,
					addedLineCount: addedLineCount
				};
				this.onChanged(modelChangedEvent);
			}
		},
		/** @ignore */
		_binarySearch: function (array, offset) {
			var high = array.length, low = -1, index;
			while (high - low > 1) {
				index = Math.floor((high + low) / 2);
				if (offset <= array[index].start) {
					high = index;
				} else {
					low = index;
				}
			}
			return high;
		},
		/**
		 * @see orion.editor.TextModel#getCharCount
		 */
		getCharCount: function() {
			var count = this._model.getCharCount(), projections = this._projections;
			for (var i = 0; i < projections.length; i++) {
				var projection = projections[i];
				count += projection._model.getCharCount() - (projection.end - projection.start);
			}
			return count;
		},
		/**
		 * @see orion.editor.TextModel#getLine
		 */
		getLine: function(lineIndex, includeDelimiter) {
			if (lineIndex < 0) { return null; }
			var model = this._model, projections = this._projections;
			var delta = 0, result = [], offset = 0, i, lineCount, projection;
			for (i = 0; i < projections.length; i++) {
				projection = projections[i];
				if (projection._lineIndex >= lineIndex - delta) { break; }
				lineCount = projection._model.getLineCount() - 1;
				if (projection._lineIndex + lineCount >= lineIndex - delta) {
					var projectionLineIndex = lineIndex - (projection._lineIndex + delta);
					if (projectionLineIndex < lineCount) {
						return projection._model.getLine(projectionLineIndex, includeDelimiter);
					} else {
						result.push(projection._model.getLine(lineCount));
					}
				}
				offset = projection.end;
				delta += lineCount - projection._lineCount;
			}
			offset = Math.max(offset, model.getLineStart(lineIndex - delta));
			for (; i < projections.length; i++) {
				projection = projections[i];
				if (projection._lineIndex > lineIndex - delta) { break; }
				result.push(model.getText(offset, projection.start));
				lineCount = projection._model.getLineCount() - 1;
				if (projection._lineIndex + lineCount > lineIndex - delta) {
					result.push(projection._model.getLine(0, includeDelimiter));
					return result.join("");
				}
				result.push(projection._model.getText());
				offset = projection.end;
				delta += lineCount - projection._lineCount;
			}
			var end = model.getLineEnd(lineIndex - delta, includeDelimiter);
			if (offset < end) {
				result.push(model.getText(offset, end));
			}
			return result.join("");
		},
		/**
		 * @see orion.editor.TextModel#getLineAtOffset
		 */
		getLineAtOffset: function(offset) {
			var model = this._model, projections = this._projections;
			var delta = 0, lineDelta = 0;
			for (var i = 0; i < projections.length; i++) {
				var projection = projections[i];
				if (projection.start > offset - delta) { break; }
				var charCount = projection._model.getCharCount();
				if (projection.start + charCount > offset - delta) {
					var projectionOffset = offset - (projection.start + delta);
					lineDelta += projection._model.getLineAtOffset(projectionOffset);
					delta += projectionOffset;
					break;
				}
				lineDelta += projection._model.getLineCount() - 1 - projection._lineCount;
				delta += charCount - (projection.end - projection.start);
			}
			return model.getLineAtOffset(offset - delta) + lineDelta;
		},
		/**
		 * @see orion.editor.TextModel#getLineCount
		 */
		getLineCount: function() {
			var model = this._model, projections = this._projections;
			var count = model.getLineCount();
			for (var i = 0; i < projections.length; i++) {
				var projection = projections[i];
				count += projection._model.getLineCount() - 1 - projection._lineCount;
			}
			return count;
		},
		/**
		 * @see orion.editor.TextModel#getLineDelimiter
		 */
		getLineDelimiter: function() {
			return this._model.getLineDelimiter();
		},
		/**
		 * @see orion.editor.TextModel#getLineEnd
		 */
		getLineEnd: function(lineIndex, includeDelimiter) {
			if (lineIndex < 0) { return -1; }
			var model = this._model, projections = this._projections;
			var delta = 0, offsetDelta = 0;
			for (var i = 0; i < projections.length; i++) {
				var projection = projections[i];
				if (projection._lineIndex > lineIndex - delta) { break; }
				var lineCount = projection._model.getLineCount() - 1;
				if (projection._lineIndex + lineCount > lineIndex - delta) {
					var projectionLineIndex = lineIndex - (projection._lineIndex + delta);
					return projection._model.getLineEnd (projectionLineIndex, includeDelimiter) + projection.start + offsetDelta;
				}
				offsetDelta += projection._model.getCharCount() - (projection.end - projection.start);
				delta += lineCount - projection._lineCount;
			}
			return model.getLineEnd(lineIndex - delta, includeDelimiter) + offsetDelta;
		},
		/**
		 * @see orion.editor.TextModel#getLineStart
		 */
		getLineStart: function(lineIndex) {
			if (lineIndex < 0) { return -1; }
			var model = this._model, projections = this._projections;
			var delta = 0, offsetDelta = 0;
			for (var i = 0; i < projections.length; i++) {
				var projection = projections[i];
				if (projection._lineIndex >= lineIndex - delta) { break; }
				var lineCount = projection._model.getLineCount() - 1;
				if (projection._lineIndex + lineCount >= lineIndex - delta) {
					var projectionLineIndex = lineIndex - (projection._lineIndex + delta);
					return projection._model.getLineStart (projectionLineIndex) + projection.start + offsetDelta;
				}
				offsetDelta += projection._model.getCharCount() - (projection.end - projection.start);
				delta += lineCount - projection._lineCount;
			}
			return model.getLineStart(lineIndex - delta) + offsetDelta;
		},
		/**
		 * @see orion.editor.TextModel#getText
		 */
		getText: function(start, end) {
			if (start === undefined) { start = 0; }
			var model = this._model, projections = this._projections;
			var delta = 0, result = [], i, projection, charCount;
			for (i = 0; i < projections.length; i++) {
				projection = projections[i];
				if (projection.start > start - delta) { break; }
				charCount = projection._model.getCharCount();
				if (projection.start + charCount > start - delta) {
					if (end !== undefined && projection.start + charCount > end - delta) {
						return projection._model.getText(start - (projection.start + delta), end - (projection.start + delta));
					} else {
						result.push(projection._model.getText(start - (projection.start + delta)));
						start = projection.end + delta + charCount - (projection.end - projection.start);
					}
				}
				delta += charCount - (projection.end - projection.start);
			}
			var offset = start - delta;
			if (end !== undefined) {
				for (; i < projections.length; i++) {
					projection = projections[i];
					if (projection.start > end - delta) { break; }
					result.push(model.getText(offset, projection.start));
					charCount = projection._model.getCharCount();
					if (projection.start + charCount > end - delta) {
						result.push(projection._model.getText(0, end - (projection.start + delta)));
						return result.join("");
					}
					result.push(projection._model.getText());
					offset = projection.end;
					delta += charCount - (projection.end - projection.start);
				}
				result.push(model.getText(offset, end - delta));
			} else {
				for (; i < projections.length; i++) {
					projection = projections[i];
					result.push(model.getText(offset, projection.start));
					result.push(projection._model.getText());
					offset = projection.end;
				}
				result.push(model.getText(offset));
			}
			return result.join("");
		},
		/** @ignore */
		_onChanging: function(text, start, removedCharCount, addedCharCount, removedLineCount, addedLineCount) {
			var model = this._model, projections = this._projections, i, projection, delta = 0, lineDelta;
			var end = start + removedCharCount;
			for (; i < projections.length; i++) {
				projection = projections[i];
				if (projection.start > start) { break; }
				delta += projection._model.getCharCount() - (projection.end - projection.start);
			}
			/*TODO add stuff saved by setText*/
			var mapStart = start + delta, rangeStart = i;
			for (; i < projections.length; i++) {
				projection = projections[i];
				if (projection.start > end) { break; }
				delta += projection._model.getCharCount() - (projection.end - projection.start);
				lineDelta += projection._model.getLineCount() - 1 - projection._lineCount;
			}
			/*TODO add stuff saved by setText*/
			var mapEnd = end + delta, rangeEnd = i;
			this.onChanging(mapStart, mapEnd - mapStart, addedCharCount/*TODO add stuff saved by setText*/, removedLineCount + lineDelta/*TODO add stuff saved by setText*/, addedLineCount/*TODO add stuff saved by setText*/);
			projections.splice(projections, rangeEnd - rangeStart);
			var count = text.length - (mapEnd - mapStart);
			for (; i < projections.length; i++) {
				projection = projections[i];
				projection.start += count;
				projection.end += count;
				projection._lineIndex = model.getLineAtOffset(projection.start);
			}
		},
		/**
		 * @see orion.editor.TextModel#onChanging
		 */
		onChanging: function(modelChangingEvent) {
			return this.dispatchEvent(modelChangingEvent);
		},
		/**
		 * @see orion.editor.TextModel#onChanged
		 */
		onChanged: function(modelChangedEvent) {
			return this.dispatchEvent(modelChangedEvent);
		},
		/**
		 * @see orion.editor.TextModel#setLineDelimiter
		 */
		setLineDelimiter: function(lineDelimiter) {
			this._model.setLineDelimiter(lineDelimiter);
		},
		/**
		 * @see orion.editor.TextModel#setText
		 */
		setText: function(text, start, end) {
			if (text === undefined) { text = ""; }
			if (start === undefined) { start = 0; }
			var eventStart = start, eventEnd = end;
			var model = this._model, projections = this._projections;
			var delta = 0, lineDelta = 0, i, projection, charCount, startProjection, endProjection, startLineDelta = 0;
			for (i = 0; i < projections.length; i++) {
				projection = projections[i];
				if (projection.start > start - delta) { break; }
				charCount = projection._model.getCharCount();
				if (projection.start + charCount > start - delta) {
					if (end !== undefined && projection.start + charCount > end - delta) {
						projection._model.setText(text, start - (projection.start + delta), end - (projection.start + delta));
						//TODO events - special case
						return;
					} else {
						startLineDelta = projection._model.getLineCount() - 1 - projection._model.getLineAtOffset(start - (projection.start + delta));
						startProjection = {
							projection: projection,
							start: start - (projection.start + delta)
						};
						start = projection.end + delta + charCount - (projection.end - projection.start);
					}
				}
				lineDelta += projection._model.getLineCount() - 1 - projection._lineCount;
				delta += charCount - (projection.end - projection.start);
			}
			var mapStart = start - delta, rangeStart = i, startLine = model.getLineAtOffset(mapStart) + lineDelta - startLineDelta;
			if (end !== undefined) {
				for (; i < projections.length; i++) {
					projection = projections[i];
					if (projection.start > end - delta) { break; }
					charCount = projection._model.getCharCount();
					if (projection.start + charCount > end - delta) {
						lineDelta += projection._model.getLineAtOffset(end - (projection.start + delta));
						charCount = end - (projection.start + delta);
						end = projection.end + delta;
						endProjection = {
							projection: projection,
							end: charCount
						};
						break;
					}
					lineDelta += projection._model.getLineCount() - 1 - projection._lineCount;
					delta += charCount - (projection.end - projection.start);
				}
			} else {
				for (; i < projections.length; i++) {
					projection = projections[i];
					lineDelta += projection._model.getLineCount() - 1 - projection._lineCount;
					delta += projection._model.getCharCount() - (projection.end - projection.start);
				}
				end = eventEnd = model.getCharCount() + delta;
			}
			var mapEnd = end - delta, rangeEnd = i, endLine = model.getLineAtOffset(mapEnd) + lineDelta;
			
			//events
			var removedCharCount = eventEnd - eventStart;
			var removedLineCount = endLine - startLine;
			var addedCharCount = text.length;
			var addedLineCount = 0;
			var cr = 0, lf = 0, index = 0;
			while (true) {
				if (cr !== -1 && cr <= index) { cr = text.indexOf("\r", index); } //$NON-NLS-0$
				if (lf !== -1 && lf <= index) { lf = text.indexOf("\n", index); } //$NON-NLS-0$
				if (lf === -1 && cr === -1) { break; }
				if (cr !== -1 && lf !== -1) {
					if (cr + 1 === lf) {
						index = lf + 1;
					} else {
						index = (cr < lf ? cr : lf) + 1;
					}
				} else if (cr !== -1) {
					index = cr + 1;
				} else {
					index = lf + 1;
				}
				addedLineCount++;
			}
			
			var modelChangingEvent = {
				type: "Changing", //$NON-NLS-0$
				text: text,
				start: eventStart,
				removedCharCount: removedCharCount,
				addedCharCount: addedCharCount,
				removedLineCount: removedLineCount,
				addedLineCount: addedLineCount
			};
			this.onChanging(modelChangingEvent);
			
//			var changeLineCount = model.getLineAtOffset(mapEnd) - model.getLineAtOffset(mapStart) + addedLineCount;
			model.setText(text, mapStart, mapEnd);
			if (startProjection) {
				projection = startProjection.projection;
				projection._model.setText("", startProjection.start);
			}		
			if (endProjection) {
				projection = endProjection.projection;
				projection._model.setText("", 0, endProjection.end);
				projection.start = projection.end;
				projection._lineCount = 0;
			}
			projections.splice(rangeStart, rangeEnd - rangeStart);
			var changeCount = text.length - (mapEnd - mapStart);
			for (i = rangeEnd; i < projections.length; i++) {
				projection = projections[i];
				projection.start += changeCount;
				projection.end += changeCount;
//				if (projection._lineIndex + changeLineCount !== model.getLineAtOffset(projection.start)) {
//					log("here");
//				}
				projection._lineIndex = model.getLineAtOffset(projection.start);
//				projection._lineIndex += changeLineCount;
			}
			
			var modelChangedEvent = {
				type: "Changed", //$NON-NLS-0$
				start: eventStart,
				removedCharCount: removedCharCount,
				addedCharCount: addedCharCount,
				removedLineCount: removedLineCount,
				addedLineCount: addedLineCount
			};
			this.onChanged(modelChangedEvent);
		}
	};
	mEventTarget.EventTarget.addMixin(ProjectionTextModel.prototype);

	return {ProjectionTextModel: ProjectionTextModel};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/

/*global define */

define("orion/keyBinding", ['orion/util'], function(util) { //$NON-NLS-1$ //$NON-NLS-0$

	/**
	 * Constructs a new key binding with the given key code and modifiers.
	 * 
	 * @param {String|Number} keyCode the key code.
	 * @param {Boolean} mod1 the primary modifier (usually Command on Mac and Control on other platforms).
	 * @param {Boolean} mod2 the secondary modifier (usually Shift).
	 * @param {Boolean} mod3 the third modifier (usually Alt).
	 * @param {Boolean} mod4 the fourth modifier (usually Control on the Mac).
	 * 
	 * @class A KeyBinding represents of a key code and a modifier state that can be triggered by the user using the keyboard.
	 * @name orion.editor.KeyBinding
	 * 
	 * @property {String|Number} keyCode The key code.
	 * @property {Boolean} mod1 The primary modifier (usually Command on Mac and Control on other platforms).
	 * @property {Boolean} mod2 The secondary modifier (usually Shift).
	 * @property {Boolean} mod3 The third modifier (usually Alt).
	 * @property {Boolean} mod4 The fourth modifier (usually Control on the Mac).
	 *
	 * @see orion.editor.TextView#setKeyBinding
	 */
	function KeyBinding (keyCode, mod1, mod2, mod3, mod4) {
		if (typeof(keyCode) === "string") { //$NON-NLS-0$
			this.keyCode = keyCode.toUpperCase().charCodeAt(0);
		} else {
			this.keyCode = keyCode;
		}
		this.mod1 = mod1 !== undefined && mod1 !== null ? mod1 : false;
		this.mod2 = mod2 !== undefined && mod2 !== null ? mod2 : false;
		this.mod3 = mod3 !== undefined && mod3 !== null ? mod3 : false;
		this.mod4 = mod4 !== undefined && mod4 !== null ? mod4 : false;
	}
	KeyBinding.prototype = /** @lends orion.editor.KeyBinding.prototype */ {
		/**
		 * Returns whether this key binding matches the given key event.
		 * 
		 * @param e the key event.
		 * @returns {Boolean} <code>true</code> whether the key binding matches the key event.
		 */
		match: function (e) {
			if (this.keyCode === e.keyCode) {
				var mod1 = util.isMac ? e.metaKey : e.ctrlKey;
				if (this.mod1 !== mod1) { return false; }
				if (this.mod2 !== e.shiftKey) { return false; }
				if (this.mod3 !== e.altKey) { return false; }
				if (util.isMac && this.mod4 !== e.ctrlKey) { return false; }
				return true;
			}
			return false;
		},
		/**
		 * Returns whether this key binding is the same as the given parameter.
		 * 
		 * @param {orion.editor.KeyBinding} kb the key binding to compare with.
		 * @returns {Boolean} whether or not the parameter and the receiver describe the same key binding.
		 */
		equals: function(kb) {
			if (!kb) { return false; }
			if (this.keyCode !== kb.keyCode) { return false; }
			if (this.mod1 !== kb.mod1) { return false; }
			if (this.mod2 !== kb.mod2) { return false; }
			if (this.mod3 !== kb.mod3) { return false; }
			if (this.mod4 !== kb.mod4) { return false; }
			return true;
		} 
	};
	return {KeyBinding: KeyBinding};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 *		Mihai Sucan (Mozilla Foundation) - fix for Bug#334583 Bug#348471 Bug#349485 Bug#350595 Bug#360726 Bug#361180 Bug#362835 Bug#362428 Bug#362286 Bug#354270 Bug#361474 Bug#363945 Bug#366312 Bug#370584
 ******************************************************************************/

/*global define document*/

define("orion/editor/textView", ['orion/editor/textModel', 'orion/keyBinding', 'orion/editor/eventTarget', 'orion/editor/textTheme', 'orion/util'], function(mTextModel, mKeyBinding, mEventTarget, mTextTheme, util) { //$NON-NLS-5$ //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$

	/** @private */
	function getWindow(document) {
		return document.defaultView || document.parentWindow;
	}
	/** @private */
	function addHandler(node, type, handler, capture) {
		if (typeof node.addEventListener === "function") { //$NON-NLS-0$
			node.addEventListener(type, handler, capture === true);
		} else {
			node.attachEvent("on" + type, handler); //$NON-NLS-0$
		}
	}
	/** @private */
	function removeHandler(node, type, handler, capture) {
		if (typeof node.removeEventListener === "function") { //$NON-NLS-0$
			node.removeEventListener(type, handler, capture === true);
		} else {
			node.detachEvent("on" + type, handler); //$NON-NLS-0$
		}
	}
	/** @private */
	function applyStyle(style, node, reset) {
		if (reset) {
			node.className = "";
			var attrs = node.attributes;
			for (var i= attrs.length; i-->0;) {
				if (!util.isIE || util.isIE >= 9 || (util.isIE < 9 && attrs[i].specified)) {
					node.removeAttribute(attrs[i].name); 
				}
			}
		}
		if (!style) {
			return;
		}
		if (style.styleClass) {
			node.className = style.styleClass;
		}
		var properties = style.style;
		if (properties) {
			for (var s in properties) {
				if (properties.hasOwnProperty(s)) {
					node.style[s] = properties[s];
				}
			}
		}
		var attributes = style.attributes;
		if (attributes) {
			for (var a in attributes) {
				if (attributes.hasOwnProperty(a)) {
					node.setAttribute(a, attributes[a]);
				}
			}
		}
	}
	/** @private */
	function clone(obj) {
		/*Note that this code only works because of the limited types used in TextViewOptions */
		if (obj instanceof Array) {
			return obj.slice(0);
		}
		return obj;
	}
	/** @private */
	function compare(s1, s2) {
		if (s1 === s2) { return true; }
		if (s1 && !s2 || !s1 && s2) { return false; }
		if ((s1 && s1.constructor === String) || (s2 && s2.constructor === String)) { return false; }
		if (s1 instanceof Array || s2 instanceof Array) {
			if (!(s1 instanceof Array && s2 instanceof Array)) { return false; }
			if (s1.length !== s2.length) { return false; }
			for (var i = 0; i < s1.length; i++) {
				if (!compare(s1[i], s2[i])) {
					return false;
				}
			}
			return true;
		}
		if (!(s1 instanceof Object) || !(s2 instanceof Object)) { return false; }
		var p;
		for (p in s1) {
			if (s1.hasOwnProperty(p)) {
				if (!s2.hasOwnProperty(p)) { return false; }
				if (!compare(s1[p], s2[p])) {return false; }
			}
		}
		for (p in s2) {
			if (!s1.hasOwnProperty(p)) { return false; }
		}
		return true;
	}
	/** @private */
	function convertDelimiter(text, addTextFunc, addDelimiterFunc) {
		var cr = 0, lf = 0, index = 0, length = text.length;
		while (index < length) {
			if (cr !== -1 && cr <= index) { cr = text.indexOf("\r", index); } //$NON-NLS-0$
			if (lf !== -1 && lf <= index) { lf = text.indexOf("\n", index); } //$NON-NLS-0$
			var start = index, end;
			if (lf === -1 && cr === -1) {
				addTextFunc(text.substring(index));
				break;
			}
			if (cr !== -1 && lf !== -1) {
				if (cr + 1 === lf) {
					end = cr;
					index = lf + 1;
				} else {
					end = cr < lf ? cr : lf;
					index = (cr < lf ? cr : lf) + 1;
				}
			} else if (cr !== -1) {
				end = cr;
				index = cr + 1;
			} else {
				end = lf;
				index = lf + 1;
			}
			addTextFunc(text.substring(start, end));
			addDelimiterFunc();
		}
	}
	/** @private */
	function getBorder(node) {
		var left,top,right,bottom;
		var window = getWindow(node.ownerDocument);
		if (window.getComputedStyle) {
			var style = window.getComputedStyle(node, null);
			left = style.getPropertyValue("border-left-width"); //$NON-NLS-0$
			top = style.getPropertyValue("border-top-width"); //$NON-NLS-0$
			right = style.getPropertyValue("border-right-width"); //$NON-NLS-0$
			bottom = style.getPropertyValue("border-bottom-width"); //$NON-NLS-0$
		} else if (node.currentStyle) {
			left = node.currentStyle.borderLeftWidth;
			top = node.currentStyle.borderTopWidth;
			right = node.currentStyle.borderRightWidth;
			bottom = node.currentStyle.borderBottomWidth;
		}
		return {
			left: parseInt(left, 10) || 0,
			top: parseInt(top, 10) || 0,
			right: parseInt(right, 10) || 0,
			bottom: parseInt(bottom, 10) || 0
		};
	}
	/** @private */
	function getPadding(node) {
		var left,top,right,bottom;
		var window = getWindow(node.ownerDocument);
		if (window.getComputedStyle) {
			var style = window.getComputedStyle(node, null);
			left = style.getPropertyValue("padding-left"); //$NON-NLS-0$
			top = style.getPropertyValue("padding-top"); //$NON-NLS-0$
			right = style.getPropertyValue("padding-right"); //$NON-NLS-0$
			bottom = style.getPropertyValue("padding-bottom"); //$NON-NLS-0$
		} else if (node.currentStyle) {
			left = node.currentStyle.paddingLeft;
			top = node.currentStyle.paddingTop;
			right = node.currentStyle.paddingRight;
			bottom = node.currentStyle.paddingBottom;
		}
		return {
			left: parseInt(left, 10) || 0, 
			top: parseInt(top, 10) || 0,
			right: parseInt(right, 10) || 0,
			bottom: parseInt(bottom, 10) || 0
		};
	}
	/** @private */
	function getLineTrim(line) {
		var trim = line._trim;
		if (!trim) {
			trim = getPadding(line);
			var border = getBorder(line);
			trim.left += border.left;
			trim.top += border.top;
			trim.right += border.right;
			trim.bottom += border.bottom;
			line._trim = trim;
		}
		return trim;
	}
	
	/**
	 * @class
	 * @private
	 * @name orion.editor.Animation
	 * @description Creates an animation.
	 * @param {Object} options Options controlling the animation.
	 * @param {Array} options.curve Array of 2 values giving the start and end points for the animation.
	 * @param {Number} [options.duration=350] Duration of the animation, in milliseconds.
	 * @param {Function} [options.easing]
	 * @param {Function} [options.onAnimate]
	 * @param {Function} [options.onEnd]
	 * @param {Number} [options.rate=20] The time between frames, in milliseconds.
	 */
	var Animation = /** @ignore */ (function() {
		function Animation(options) {
			this.options = options;
		}
		/**
		 * Plays this animation.
		 * @methodOf orion.editor.Animation.prototype
		 * @name play
		 */
		Animation.prototype.play = function() {
			var duration = (typeof this.options.duration === "number") ? this.options.duration : 350, //$NON-NLS-0$
			    rate = (typeof this.options.rate === "number") ? this.options.rate : 20, //$NON-NLS-0$
			    easing = this.options.easing || this.defaultEasing,
			    onAnimate = this.options.onAnimate || function() {},
			    start = this.options.curve[0],
			    end = this.options.curve[1],
			    range = (end - start),
			    startedAt = -1,
				propertyValue,
				self = this;

			function onFrame() {
				startedAt = (startedAt === -1) ? new Date().getTime() : startedAt;
				var now = new Date().getTime(),
				    percentDone = (now - startedAt) / duration;
				if (percentDone < 1) {
					var eased = easing(percentDone);
					propertyValue = start + (eased * range);
					onAnimate(propertyValue);
				} else {
					onAnimate(end);
					self.stop();
				}
			}
			this.interval = this.options.window.setInterval(onFrame, rate);
		};
		/**
		 * Stops this animation.
		 * @methodOf orion.editor.Animation.prototype
		 */
		Animation.prototype.stop = function() {
			this.options.window.clearInterval(this.interval);
		    var onEnd = this.options.onEnd || function () {};
			onEnd();
		};
		Animation.prototype.defaultEasing = function(x) {
			return Math.sin(x * (Math.PI / 2));
		};
		return Animation;
	}());
	
	/** 
	 * Constructs a new Selection object.
	 * 
	 * @class A Selection represents a range of selected text in the view.
	 * @name orion.editor.Selection
	 */
	function Selection (start, end, caret) {
		/**
		 * The selection start offset.
		 *
		 * @name orion.editor.Selection#start
		 */
		this.start = start;
		/**
		 * The selection end offset.
		 *
		 * @name orion.editor.Selection#end
		 */
		this.end = end;
		/** @private */
		this.caret = caret; //true if the start, false if the caret is at end
	}
	Selection.prototype = /** @lends orion.editor.Selection.prototype */ {
		/** @private */
		clone: function() {
			return new Selection(this.start, this.end, this.caret);
		},
		/** @private */
		collapse: function() {
			if (this.caret) {
				this.end = this.start;
			} else {
				this.start = this.end;
			}
		},
		/** @private */
		extend: function (offset) {
			if (this.caret) {
				this.start = offset;
			} else {
				this.end = offset;
			}
			if (this.start > this.end) {
				var tmp = this.start;
				this.start = this.end;
				this.end = tmp;
				this.caret = !this.caret;
			}
		},
		/** @private */
		setCaret: function(offset) {
			this.start = offset;
			this.end = offset;
			this.caret = false;
		},
		/** @private */
		getCaret: function() {
			return this.caret ? this.start : this.end;
		},
		/** @private */
		toString: function() {
			return "start=" + this.start + " end=" + this.end + (this.caret ? " caret is at start" : " caret is at end"); //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		},
		/** @private */
		isEmpty: function() {
			return this.start === this.end;
		},
		/** @private */
		equals: function(object) {
			return this.caret === object.caret && this.start === object.start && this.end === object.end;
		}
	};
	/** @private */
	function TextRect (rect) {
		this.left = rect.left;
		this.top = rect.top;
		this.right = rect.right;
		this.bottom = rect.bottom;
	}
	TextRect.prototype = /** @lends orion.editor.TextRect.prototype */ {
		/** @private */
		toString: function() {
			return "{l=" + this.left + ", t=" + this.top + ", r=" + this.right + ", b=" + this.bottom + "}"; //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		}
	};
	/** 
	 * Constructs a new TextLine object.
	 * 
	 * @class A TextLine represents a line of text in the view.
	 * @name orion.editor.TextLine
	 * @private
	 */
	function TextLine (view, lineIndex, lineDiv) {
		/**
		 * The view.
		 *
		 * @name orion.editor.TextLine#view
		 * @private
		 */
		this.view = view;
		/**
		 * The line index.
		 *
		 * @name orion.editor.TextLine#lineIndex
		 * @private
		 */
		this.lineIndex = lineIndex;
		
		this._lineDiv = lineDiv;
	}
	TextLine.prototype = /** @lends orion.editor.TextLine.prototype */ {
		/** @private */
		create: function(parent, div) {
			if (this._lineDiv) { return; }
			var child = this._lineDiv = this._createLine(parent, div, this.lineIndex);
			child._line = this;
			return child;
		},
		_createLine: function(parent, div, lineIndex) {
			var view = this.view;
			var model = view._model;
			var lineText = model.getLine(lineIndex);
			var lineStart = model.getLineStart(lineIndex);
			var e = {type:"LineStyle", textView: view, lineIndex: lineIndex, lineText: lineText, lineStart: lineStart}; //$NON-NLS-0$
			if (lineText.length < 2000) {
				view.onLineStyle(e);
			}
			var lineDiv = div || util.createElement(parent.ownerDocument, "div"); //$NON-NLS-0$
			if (!div || !compare(div.viewStyle, e.style)) {
				applyStyle(e.style, lineDiv, div);
				if (div) { div._trim = null; }
				lineDiv.viewStyle = e.style;
				lineDiv.setAttribute("role", "presentation"); //$NON-NLS-1$ //$NON-NLS-0$
			}
			lineDiv.lineIndex = lineIndex;
			var ranges = [];
			var data = {tabOffset: 0, ranges: ranges};
			this._createRanges(e.ranges, lineText, 0, lineText.length, lineStart, data);
			
			/*
			* A trailing span with a whitespace is added for three different reasons:
			* 1. Make sure the height of each line is the largest of the default font
			* in normal, italic, bold, and italic-bold.
			* 2. When full selection is off, Firefox, Opera and IE9 do not extend the 
			* selection at the end of the line when the line is fully selected. 
			* 3. The height of a div with only an empty span is zero.
			*/
			var c = " "; //$NON-NLS-0$
			if (!view._fullSelection && util.isIE < 9) {
				/* 
				* IE8 already selects extra space at end of a line fully selected,
				* adding another space at the end of the line causes the selection 
				* to look too big. The fix is to use a zero-width space (\uFEFF) instead. 
				*/
				c = "\uFEFF"; //$NON-NLS-0$
			}
			if (util.isWebkit) {
				/*
				* Feature in WekKit. Adding a regular white space to the line will
				* cause the longest line in the view to wrap even though "pre" is set.
				* The fix is to use the zero-width non-joiner character (\u200C) instead.
				* Note: To not use \uFEFF because in old version of Chrome this character 
				* shows a glyph;
				*/
				c = "\u200C"; //$NON-NLS-0$
			}
			ranges.push({text: c, style: view._metrics.largestFontStyle, ignoreChars: 1});
			
			var range, span, style, oldSpan, oldStyle, text, oldText, end = 0, oldEnd = 0, next;
			var changeCount, changeStart;
			if (div) {
				var modelChangedEvent = div.modelChangedEvent;
				if (modelChangedEvent) {
					if (modelChangedEvent.removedLineCount === 0 && modelChangedEvent.addedLineCount === 0) {
						changeStart = modelChangedEvent.start - lineStart;
						changeCount = modelChangedEvent.addedCharCount - modelChangedEvent.removedCharCount;
					} else {
						changeStart = -1;
					}
					div.modelChangedEvent = undefined;
				}
				oldSpan = div.firstChild;
			}
			for (var i = 0; i < ranges.length; i++) {
				range = ranges[i];
				text = range.text;
				end += text.length;
				style = range.style;
				if (oldSpan) {
					oldText = oldSpan.firstChild.data;
					oldStyle = oldSpan.viewStyle;
					if (oldText === text && compare(style, oldStyle)) {
						oldEnd += oldText.length;
						oldSpan._rectsCache = undefined;
						span = oldSpan = oldSpan.nextSibling;
						continue;
					} else {
						while (oldSpan) {
							if (changeStart !== -1) {
								var spanEnd = end;
								if (spanEnd >= changeStart) {
									spanEnd -= changeCount;
								}
								var t = oldSpan.firstChild.data;
								var length = t ? t.length : 0;
								if (oldEnd + length > spanEnd) { break; }
								oldEnd += length;
							}
							next = oldSpan.nextSibling;
							lineDiv.removeChild(oldSpan);
							oldSpan = next;
						}
					}
				}
				span = this._createSpan(lineDiv, text, style, range.ignoreChars);
				if (oldSpan) {
					lineDiv.insertBefore(span, oldSpan);
				} else {
					lineDiv.appendChild(span);
				}
				if (div) {
					div.lineWidth = undefined;
				}
			}
			if (div) {
				var tmp = span ? span.nextSibling : null;
				while (tmp) {
					next = tmp.nextSibling;
					div.removeChild(tmp);
					tmp = next;
				}
			} else {
				parent.appendChild(lineDiv);
			}
			return lineDiv;
		},
		_createRanges: function(ranges, text, start, end, lineStart, data) {
			if (start >= end) { return; }
			if (ranges) {
				for (var i = 0; i < ranges.length; i++) {
					var range = ranges[i];
					if (range.end <= lineStart + start) { continue; }
					var styleStart = Math.max(lineStart + start, range.start) - lineStart;
					if (styleStart >= end) { break; }
					var styleEnd = Math.min(lineStart + end, range.end) - lineStart;
					if (styleStart < styleEnd) {
						styleStart = Math.max(start, styleStart);
						styleEnd = Math.min(end, styleEnd);
						if (start < styleStart) {
							this._createRange(text, start, styleStart, null, data);
						}
						while (i + 1 < ranges.length && ranges[i + 1].start - lineStart === styleEnd && compare(range.style, ranges[i + 1].style)) {
							range = ranges[i + 1];
							styleEnd = Math.min(lineStart + end, range.end) - lineStart;
							i++;
						}
						this._createRange(text, styleStart, styleEnd, range.style, data);
						start = styleEnd;
					}
				}
			}
			if (start < end) {
				this._createRange(text, start, end, null, data);
			}
		},
		_createRange: function(text, start, end, style, data) {
			if (start >= end) { return; }
			var tabSize = this.view._customTabSize, range;
			if (tabSize && tabSize !== 8) {
				var tabIndex = text.indexOf("\t", start); //$NON-NLS-0$
				while (tabIndex !== -1 && tabIndex < end) {
					if (start < tabIndex) {
						range = {text: text.substring(start, tabIndex), style: style};
						data.ranges.push(range);
						data.tabOffset += range.text.length;
					}
					var spacesCount = tabSize - (data.tabOffset % tabSize);
					if (spacesCount > 0) {
						//TODO hack to preserve tabs in getDOMText()
						var spaces = "\u00A0"; //$NON-NLS-0$
						for (var i = 1; i < spacesCount; i++) {
							spaces += " "; //$NON-NLS-0$
						}
						range = {text: spaces, style: style, ignoreChars: spacesCount - 1};
						data.ranges.push(range);
						data.tabOffset += range.text.length;
					}
					start = tabIndex + 1;
					tabIndex = text.indexOf("\t", start); //$NON-NLS-0$
				}
			}
			if (start < end) {
				range = {text: text.substring(start, end), style: style};
				data.ranges.push(range);
				data.tabOffset += range.text.length;
			}
		},
		_createSpan: function(parent, text, style, ignoreChars) {
			var isLink = style && style.tagName === "A"; //$NON-NLS-0$
			if (isLink) { parent.hasLink = true; }
			var tagName = isLink && this.view._linksVisible ? "a" : "span"; //$NON-NLS-1$ //$NON-NLS-0$
			var document = parent.ownerDocument;
			var child = util.createElement(parent.ownerDocument, tagName);
			child.appendChild(document.createTextNode(text));
			applyStyle(style, child);
			if (tagName === "A") { //$NON-NLS-0$
				var self = this.view;
				var window = this._getWindow();
				addHandler(child, "click", function(e) { return self._handleLinkClick(e ? e : window.event); }, false); //$NON-NLS-0$
			}
			child.viewStyle = style;
			if (ignoreChars) {
				child.ignoreChars = ignoreChars;
			}
			return child;
		},
		_ensureCreated: function() {
			if (this._lineDiv) { return this._lineDiv; }
			return (this._createdDiv = this.create(this.view._clientDiv, null));
		},
		/** @private */
		getBoundingClientRect: function(offset, absolute) {
			var child = this._ensureCreated();
			var view = this.view;
			if (offset === undefined) {
				return this._getLineBoundingClientRect(child, true);
			}
			var model = view._model;
			var document = child.ownerDocument;
			var lineIndex = this.lineIndex;
			var result = null;
			if (offset < model.getLineEnd(lineIndex)) {
				var lineOffset = model.getLineStart(lineIndex);
				var lineChild = child.firstChild;
				while (lineChild) {
					var textNode = lineChild.firstChild;
					var nodeLength = textNode.length; 
					if (lineChild.ignoreChars) {
						nodeLength -= lineChild.ignoreChars;
					}
					if (lineOffset + nodeLength > offset) {
						var index = offset - lineOffset;
						var range;
						if (view._isRangeRects) {
							range = document.createRange();
							range.setStart(textNode, index);
							range.setEnd(textNode, index + 1);
							result = new TextRect(range.getBoundingClientRect());
						} else if (util.isIE) {
							range = document.body.createTextRange();
							range.moveToElementText(lineChild);
							range.collapse();
							range.moveEnd("character", index + 1); //$NON-NLS-0$
							range.moveStart("character", index); //$NON-NLS-0$
							result = new TextRect(range.getBoundingClientRect());
						} else {
							var text = textNode.data;
							lineChild.removeChild(textNode);
							lineChild.appendChild(document.createTextNode(text.substring(0, index)));
							var span = util.createElement(document, "span"); //$NON-NLS-0$
							span.appendChild(document.createTextNode(text.substring(index, index + 1)));
							lineChild.appendChild(span);
							lineChild.appendChild(document.createTextNode(text.substring(index + 1)));
							result = new TextRect(span.getBoundingClientRect());
							lineChild.innerHTML = "";
							lineChild.appendChild(textNode);
							if (!this._createdDiv) {
								/*
								 * Removing the element node that holds the selection start or end
								 * causes the selection to be lost. The fix is to detect this case
								 * and restore the selection. 
								 */
								var s = view._getSelection();
								if ((lineOffset <= s.start && s.start < lineOffset + nodeLength) ||  (lineOffset <= s.end && s.end < lineOffset + nodeLength)) {
									view._updateDOMSelection();
								}
							}
						}
						if (util.isIE) {
							var window = getWindow(child.ownerDocument);
							var xFactor = window.screen.logicalXDPI / window.screen.deviceXDPI;
							var yFactor = window.screen.logicalYDPI / window.screen.deviceYDPI;
							result.left = result.left * xFactor;
							result.right = result.right * xFactor;
							result.top = result.top * yFactor;
							result.bottom = result.bottom * yFactor;
						}
						break;
					}
					lineOffset += nodeLength;
					lineChild = lineChild.nextSibling;
				}
			}
			var rect = this.getBoundingClientRect();
			if (!result) {
				if (view._wrapMode) {
					var rects = this.getClientRects();
					result = rects[rects.length - 1];
					result.left = result.right;
					result.left += rect.left;
					result.top += rect.top;
					result.right += rect.left;
					result.bottom += rect.top;
				} else {
					result = new TextRect(rect);
					result.left = result.right;
				}
			}
			if (absolute || absolute === undefined) {
				result.left -= rect.left;
				result.top -= rect.top;
				result.right -= rect.left;
				result.bottom -= rect.top;
			}
			return result;
		},
		/** @private */
		_getClientRects: function(element, parentRect) {
			var rects, newRects, rect, i;
			if (!element._rectsCache) {
				rects = element.getClientRects();
				newRects = new Array(rects.length);
				for (i = 0; i<rects.length; i++) {
					rect = newRects[i] = new TextRect(rects[i]);
					rect.left -= parentRect.left;
					rect.top -= parentRect.top;
					rect.right -= parentRect.left;
					rect.bottom -= parentRect.top;
				}
				element._rectsCache = newRects;
			}
			rects = element._rectsCache;
			newRects = [rects.length];
			for (i = 0; i<rects.length; i++) {
				newRects[i] = new TextRect(rects[i]);
			}
			return newRects;
		},
		/** @private */
		getClientRects: function(lineIndex) {
			if (!this.view._wrapMode) { return [this.getBoundingClientRect()]; }
			var child = this._ensureCreated();
			//TODO [perf] cache rects
			var result = [];
			var lineChild = child.firstChild, i, r, parentRect = child.getBoundingClientRect();
			while (lineChild) {
				var rects = this._getClientRects(lineChild, parentRect);
				for (i = 0; i < rects.length; i++) {
					var rect = rects[i], j;
					if (rect.top === rect.bottom) { continue; }
					var center = rect.top + (rect.bottom - rect.top) / 2;
					for (j = 0; j < result.length; j++) {
						r = result[j];
						if ((r.top <= center && center < r.bottom)) {
							break;
						}
					}
					if (j === result.length) {
						result.push(rect);
					} else {
						if (rect.left < r.left) { r.left = rect.left; }
						if (rect.top < r.top) { r.top = rect.top; }
						if (rect.right > r.right) { r.right = rect.right; }
						if (rect.bottom > r.bottom) { r.bottom = rect.bottom; }
					}
				}
				lineChild = lineChild.nextSibling;
			}
			if (lineIndex !== undefined) {
				return result[lineIndex];
			}
			return result;
		},
		/** @private */
		_getLineBoundingClientRect: function (child, noTrim) {
			var rect = new TextRect(child.getBoundingClientRect());
			if (this.view._wrapMode) {
			} else {
				rect.right = rect.left;
				var lastChild = child.lastChild;
				//Remove any artificial trailing whitespace in the line
				while (lastChild && lastChild.ignoreChars === lastChild.firstChild.length) {
					lastChild = lastChild.previousSibling;
				}
				if (lastChild) {
					var lastRect = lastChild.getBoundingClientRect();
					rect.right = lastRect.right + getLineTrim(child).right;
				}
			}
			if (noTrim) {
				var padding = getLineTrim(child);
				rect.left = rect.left + padding.left;
				rect.right = rect.right - padding.right;
			}
			return rect;
		},
		/** @private */
		getLineCount: function () {
			if (!this.view._wrapMode) { return 1; }
			return this.getClientRects().length;
		},
		/** @private */
		getLineIndex: function(offset) {
			if (!this.view._wrapMode) { return 0; }
			var rects = this.getClientRects();
			var rect = this.getBoundingClientRect(offset);
			var center = rect.top + ((rect.bottom - rect.top) / 2);
			for (var i = 0; i < rects.length; i++) {
				if (rects[i].top <= center && center < rects[i].bottom) {
					return i;
				}
			}
			return rects.length - 1;
		},
		/** @private */
		getLineStart: function (lineIndex) {
			if (!this.view._wrapMode || lineIndex === 0) {
				return this.view._model.getLineStart(lineIndex);
			}
			var rects = this.getClientRects();
			return this.getOffset(rects[lineIndex].left + 1, rects[lineIndex].top + 1);
		},
		/** @private */
		getOffset: function(x, y) {
			var view = this.view;
			var model = view._model;
			var lineIndex = this.lineIndex;
			var lineStart = model.getLineStart(lineIndex);
			var lineEnd = model.getLineEnd(lineIndex);
			if (lineStart === lineEnd) {
				return lineStart;
			}
			var child = this._ensureCreated();
			var lineRect = this.getBoundingClientRect(), rects, rect;
			if (view._wrapMode) {
				rects = this.getClientRects();
				if (y < rects[0].top) {
					y = rects[0].top;
				}
				for (var i = 0; i < rects.length; i++) {
					rect = rects[i];
					if (rect.top <= y && y < rect.bottom) {
						break;
					}
				}
				if (x < rect.left) { x = rect.left; }
				if (x > rect.right) { x = rect.right - 1; }
			} else {
				if (x < 0) { x = 0; }
				if (x > (lineRect.right - lineRect.left)) { x = lineRect.right - lineRect.left; }
			}
			var document = child.ownerDocument;
			var window = getWindow(document);
			var xFactor = util.isIE ? window.screen.logicalXDPI / window.screen.deviceXDPI : 1;
			var yFactor = util.isIE ? window.screen.logicalYDPI / window.screen.deviceYDPI : 1;
			var offset = lineStart;
			var lineChild = child.firstChild;
			done:
			while (lineChild) {
				var textNode = lineChild.firstChild;
				var nodeLength = textNode.length;
				if (lineChild.ignoreChars) {
					nodeLength -= lineChild.ignoreChars;
				}
				var rangeLeft, rangeTop, rangeRight, rangeBottom;
				rects = this._getClientRects(lineChild, lineRect);
				for (var j = 0; j < rects.length; j++) {
					rect = rects[j];
					if (rect.left <= x && x < rect.right && (!view._wrapMode || (rect.top <= y && y < rect.bottom))) {
						var range, start, end;
						if (util.isIE || view._isRangeRects) {
							range = view._isRangeRects ? document.createRange() : document.body.createTextRange();
							var high = nodeLength;
							var low = -1;
							while ((high - low) > 1) {
								var mid = Math.floor((high + low) / 2);
								start = low + 1;
								end = mid === nodeLength - 1 && lineChild.ignoreChars ? textNode.length : mid + 1;
								if (view._isRangeRects) {
									range.setStart(textNode, start);
									range.setEnd(textNode, end);
								} else {
									range.moveToElementText(lineChild);
									range.move("character", start); //$NON-NLS-0$
									range.moveEnd("character", end - start); //$NON-NLS-0$
								}
								rects = range.getClientRects();
								var found = false;
								for (var k = 0; k < rects.length; k++) {
									rect = rects[k];
									rangeLeft = rect.left * xFactor - lineRect.left;
									rangeRight = rect.right * xFactor - lineRect.left;
									rangeTop = rect.top * yFactor - lineRect.top;
									rangeBottom = rect.bottom * yFactor - lineRect.top;
									if (rangeLeft <= x && x < rangeRight && (!view._wrapMode || (rangeTop <= y && y < rangeBottom))) {
										found = true;
										break;
									}
								}
								if (found) {
									high = mid;
								} else {
									low = mid;
								}
							}
							offset += high;
							start = high;
							end = high === nodeLength - 1 && lineChild.ignoreChars ? textNode.length : Math.min(high + 1, textNode.length);
							if (view._isRangeRects) {
								range.setStart(textNode, start);
								range.setEnd(textNode, end);
							} else {
								range.moveToElementText(lineChild);
								range.move("character", start); //$NON-NLS-0$
								range.moveEnd("character", end - start); //$NON-NLS-0$
							}
							rect = range.getClientRects()[0];
							rangeLeft = rect.left * xFactor - lineRect.left;
							rangeRight = rect.right * xFactor - lineRect.left;
							//TODO test for character trailing (wrong for bidi)
							if (x > (rangeLeft + (rangeRight - rangeLeft) / 2)) {
								offset++;
							}
						} else {
							var newText = [];
							for (var q = 0; q < nodeLength; q++) {
								newText.push("<span>"); //$NON-NLS-0$
								if (q === nodeLength - 1) {
									newText.push(textNode.data.substring(q));
								} else {
									newText.push(textNode.data.substring(q, q + 1));
								}
								newText.push("</span>"); //$NON-NLS-0$
							}
							lineChild.innerHTML = newText.join("");
							var rangeChild = lineChild.firstChild;
							while (rangeChild) {
								rect = rangeChild.getBoundingClientRect();
								rangeLeft = rect.left - lineRect.left;
								rangeRight = rect.right - lineRect.left;
								if (rangeLeft <= x && x < rangeRight) {
									//TODO test for character trailing (wrong for bidi)
									if (x > rangeLeft + (rangeRight - rangeLeft) / 2) {
										offset++;
									}
									break;
								}
								offset++;
								rangeChild = rangeChild.nextSibling;
							}
							if (!this._createdDiv) {
								lineChild.innerHTML = "";
								lineChild.appendChild(textNode);
								/*
								 * Removing the element node that holds the selection start or end
								 * causes the selection to be lost. The fix is to detect this case
								 * and restore the selection. 
								 */
								var s = view._getSelection();
								if ((offset <= s.start && s.start < offset + nodeLength) || (offset <= s.end && s.end < offset + nodeLength)) {
									view._updateDOMSelection();
								}
							}
						}
						break done;
					}
				}
				offset += nodeLength;
				lineChild = lineChild.nextSibling;
			}
			return Math.min(lineEnd, Math.max(lineStart, offset));
		},
		/** @private */
		getNextOffset: function (offset, unit, direction) {
			if (unit === "line") { //$NON-NLS-0$
				var view = this.view;
				var model = view._model;
				var lineIndex = model.getLineAtOffset(offset);
				if (direction > 0) {
					return model.getLineEnd(lineIndex);
				}
				return model.getLineStart(lineIndex);
			}
			if (unit === "wordend") { //$NON-NLS-0$
				return this._getNextOffset_W3C(offset, unit, direction);
			}
			return util.isIE ? this._getNextOffset_IE(offset, unit, direction) : this._getNextOffset_W3C(offset, unit, direction);
		},
		/** @private */
		_getNextOffset_W3C: function (offset, unit, direction) {
			function _isPunctuation(c) {
				return (33 <= c && c <= 47) || (58 <= c && c <= 64) || (91 <= c && c <= 94) || c === 96 || (123 <= c && c <= 126);
			}
			function _isWhitespace(c) {
				return c === 32 || c === 9;
			}
			if (unit === "word" || unit === "wordend") { //$NON-NLS-1$ //$NON-NLS-0$
				var view = this.view;
				var model = view._model;
				var lineIndex = model.getLineAtOffset(offset);
				var lineText = model.getLine(lineIndex);
				var lineStart = model.getLineStart(lineIndex);
				var lineEnd = model.getLineEnd(lineIndex);
				var lineLength = lineText.length;
				var offsetInLine = offset - lineStart;
				
				
				var c, previousPunctuation, previousLetterOrDigit, punctuation, letterOrDigit;
				if (direction > 0) {
					if (offsetInLine === lineLength) { return lineEnd; }
					c = lineText.charCodeAt(offsetInLine);
					previousPunctuation = _isPunctuation(c); 
					previousLetterOrDigit = !previousPunctuation && !_isWhitespace(c);
					offsetInLine++;
					while (offsetInLine < lineLength) {
						c = lineText.charCodeAt(offsetInLine);
						punctuation = _isPunctuation(c);
						if (unit === "wordend") { //$NON-NLS-0$
							if (!punctuation && previousPunctuation) { break; }
						} else {
							if (punctuation && !previousPunctuation) { break; }
						}
						letterOrDigit  = !punctuation && !_isWhitespace(c);
						if (unit === "wordend") { //$NON-NLS-0$
							if (!letterOrDigit && previousLetterOrDigit) { break; }
						} else {
							if (letterOrDigit && !previousLetterOrDigit) { break; }
						}
						previousLetterOrDigit = letterOrDigit;
						previousPunctuation = punctuation;
						offsetInLine++;
					}
				} else {
					if (offsetInLine === 0) { return lineStart; }
					offsetInLine--;
					c = lineText.charCodeAt(offsetInLine);
					previousPunctuation = _isPunctuation(c); 
					previousLetterOrDigit = !previousPunctuation && !_isWhitespace(c);
					while (0 < offsetInLine) {
						c = lineText.charCodeAt(offsetInLine - 1);
						punctuation = _isPunctuation(c);
						if (unit === "wordend") { //$NON-NLS-0$
							if (punctuation && !previousPunctuation) { break; }
						} else {
							if (!punctuation && previousPunctuation) { break; }
						}
						letterOrDigit  = !punctuation && !_isWhitespace(c);
						if (unit === "wordend") { //$NON-NLS-0$
							if (letterOrDigit && !previousLetterOrDigit) { break; }
						} else {
							if (!letterOrDigit && previousLetterOrDigit) { break; }
						}
						previousLetterOrDigit = letterOrDigit;
						previousPunctuation = punctuation;
						offsetInLine--;
					}
				}
				return lineStart + offsetInLine;
			}
			return offset + direction;
		},
		/** @private */
		_getNextOffset_IE: function (offset, unit, direction) {
			var child = this._ensureCreated();
			var view = this.view;
			var model = view._model;
			var lineIndex = this.lineIndex;
			var result = 0, range, length;
			var lineOffset = model.getLineStart(lineIndex);
			var document = child.ownerDocument;
			var lineChild;
			if (offset === model.getLineEnd(lineIndex)) {
				lineChild = child.lastChild;
				while (lineChild && lineChild.ignoreChars) {
					lineChild = lineChild.previousSibling;
				}
				if (!lineChild) {
					return lineOffset;
				}
				range = document.body.createTextRange();
				range.moveToElementText(lineChild);
				length = range.text.length;
				range.moveEnd(unit, direction);
				result = offset + range.text.length - length;
			} else if (offset === lineOffset && direction < 0) {
				result = lineOffset;
			} else {
				lineChild = child.firstChild;
				while (lineChild) {
					var textNode = lineChild.firstChild;
					var nodeLength = textNode.length;
					if (lineChild.ignoreChars) {
						nodeLength -= lineChild.ignoreChars;
					}
					if (lineOffset + nodeLength > offset) {
						range = document.body.createTextRange();
						if (offset === lineOffset && direction < 0) {
							range.moveToElementText(lineChild.previousSibling);
						} else {
							range.moveToElementText(lineChild);
							range.collapse();
							range.moveEnd("character", offset - lineOffset); //$NON-NLS-0$
						}
						length = range.text.length;
						range.moveEnd(unit, direction);
						result = offset + range.text.length - length;
						break;
					}
					lineOffset = nodeLength + lineOffset;
					lineChild = lineChild.nextSibling;
				}
			}
			return result;
		},
		/** @private */
		destroy: function() {
			var div = this._createdDiv;
			if (div) {
				div.parentNode.removeChild(div);
				this._createdDiv = null;
			}
		}
	};
	
	/**
	 * @class This object describes the options for the text view.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.TextView}<br/>
	 * {@link orion.editor.TextView#setOptions}
	 * {@link orion.editor.TextView#getOptions}	 
	 * </p>		 
	 * @name orion.editor.TextViewOptions
	 *
	 * @property {String|DOMElement} parent the parent element for the view, it can be either a DOM element or an ID for a DOM element.
	 * @property {orion.editor.TextModel} [model] the text model for the view. If it is not set the view creates an empty {@link orion.editor.TextModel}.
	 * @property {Boolean} [readonly=false] whether or not the view is read-only.
	 * @property {Boolean} [fullSelection=true] whether or not the view is in full selection mode.
	 * @property {Boolean} [tabMode=true] whether or not the tab keypress is consumed by the view or is used for focus traversal.
	 * @property {Boolean} [expandTab=false] whether or not the tab key inserts white spaces.
	 * @property {orion.editor.TextTheme} [theme=orion.editor.TextTheme.getTheme()] the TextTheme manager. TODO more info on this
	 * @property {String} [themeClass] the CSS class for the view theming.
	 * @property {Number} [tabSize=8] The number of spaces in a tab.
	 * @property {Boolean} [wrapMode=false] whether or not the view wraps lines.
	 * @property {Number} [scrollAnimation=0] the time duration in miliseconds for scrolling animation. <code>0</code> means no animation.
	 */
	/**
	 * Constructs a new text view.
	 * 
	 * @param {orion.editor.TextViewOptions} options the view options.
	 * 
	 * @class A TextView is a user interface for editing text.
	 * @name orion.editor.TextView
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function TextView (options) {
		this._init(options || {});
	}
	
	TextView.prototype = /** @lends orion.editor.editor.prototype */ {
		/**
		 * Adds a ruler to the text view at the specified position.
		 * <p>
		 * The position is relative to the ruler location.
		 * </p>
		 *
		 * @param {orion.editor.Ruler} ruler the ruler.
		 * @param {Number} [index=length] the ruler index.
		 */
		addRuler: function (ruler, index) {
			ruler.setView(this);
			var rulers = this._rulers;
			if (index !== undefined) {
				var i, sideIndex;
				for (i = 0, sideIndex=0; i < rulers.length && sideIndex < index; i++) {
					if (ruler.getLocation() === rulers[i].getLocation()) {
						sideIndex++;
					}
				}
				rulers.splice(sideIndex, 0, ruler);
				index = sideIndex;
			} else {
				rulers.push(ruler);
			}
			this._createRuler(ruler, index);
			this._update();
		},
		computeSize: function() {
			var w = 0, h = 0;
			var model = this._model, clientDiv = this._clientDiv;
			if (!clientDiv) { return {width: w, height: h}; }
			var clientWidth = clientDiv.style.width;
			/*
			* Feature in WekKit. Webkit limits the width of the lines
			* computed below to the width of the client div.  This causes
			* the lines to be wrapped even though "pre" is set.  The fix
			* is to set the width of the client div to a "0x7fffffffpx"
			* before computing the lines width.  Note that this value is
			* reset to the appropriate value further down.
			*/
			if (util.isWebkit) {
				clientDiv.style.width = "0x7fffffffpx"; //$NON-NLS-0$
			}
			var lineCount = model.getLineCount();
			for (var lineIndex=0; lineIndex<lineCount; lineIndex++) {
				var line = this._getLine(lineIndex);
				var rect = line.getBoundingClientRect();
				w = Math.max(w, rect.right - rect.left);
				h += rect.bottom - rect.top;
				line.destroy();
			}
			if (util.isWebkit) {
				clientDiv.style.width = clientWidth;
			}
			var viewPadding = this._getViewPadding();
			w += viewPadding.right + viewPadding.left + this._metrics.scrollWidth;
			h += viewPadding.bottom + viewPadding.top + this._metrics.scrollWidth;
			return {width: w, height: h};
		},
		/**
		 * Converts the given rectangle from one coordinate spaces to another.
		 * <p>The supported coordinate spaces are:
		 * <ul>
		 *   <li>"document" - relative to document, the origin is the top-left corner of first line</li>
		 *   <li>"page" - relative to html page that contains the text view</li>
		 * </ul>
		 * </p>
		 * <p>All methods in the view that take or return a position are in the document coordinate space.</p>
		 *
		 * @param rect the rectangle to convert.
		 * @param rect.x the x of the rectangle.
		 * @param rect.y the y of the rectangle.
		 * @param rect.width the width of the rectangle.
		 * @param rect.height the height of the rectangle.
		 * @param {String} from the source coordinate space.
		 * @param {String} to the destination coordinate space.
		 *
		 * @see #getLocationAtOffset
		 * @see #getOffsetAtLocation
		 * @see #getTopPixel
		 * @see #setTopPixel
		 */
		convert: function(rect, from, to) {
			if (!this._clientDiv) { return; }
			var scroll = this._getScroll();
			var viewPad = this._getViewPadding();
			var viewRect = this._viewDiv.getBoundingClientRect();
			if (from === "document") { //$NON-NLS-0$
				if (rect.x !== undefined) {
					rect.x += - scroll.x + viewRect.left + viewPad.left;
				}
				if (rect.y !== undefined) {
					rect.y += - scroll.y + viewRect.top + viewPad.top;
				}
			}
			//At this point rect is in the widget coordinate space
			if (to === "document") { //$NON-NLS-0$
				if (rect.x !== undefined) {
					rect.x += scroll.x - viewRect.left - viewPad.left;
				}
				if (rect.y !== undefined) {
					rect.y += scroll.y - viewRect.top - viewPad.top;
				}
			}
			return rect;
		},
		/**
		 * Destroys the text view. 
		 * <p>
		 * Removes the view from the page and frees all resources created by the view.
		 * Calling this function causes the "Destroy" event to be fire so that all components
		 * attached to view can release their references.
		 * </p>
		 *
		 * @see #onDestroy
		 */
		destroy: function() {
			/* Destroy rulers*/
			for (var i=0; i< this._rulers.length; i++) {
				this._rulers[i].setView(null);
			}
			this.rulers = null;
			
			this._destroyView();

			var e = {type: "Destroy"}; //$NON-NLS-0$
			this.onDestroy(e);

			this._parent = null;
			this._model = null;
			this._theme = null;
			this._selection = null;
			this._doubleClickSelection = null;
			this._keyBindings = null;
			this._actions = null;
		},
		/**
		 * Gives focus to the text view.
		 */
		focus: function() {
			if (!this._clientDiv) { return; }
			/*
			* Feature in Chrome. When focus is called in the clientDiv without
			* setting selection the browser will set the selection to the first dom 
			* element, which can be above the client area. When this happen the 
			* browser also scrolls the window to show that element.
			* The fix is to call _updateDOMSelection() before calling focus().
			*/
			this._updateDOMSelection();
			if (util.isOpera) { this._clientDiv.blur(); }
			this._clientDiv.focus();
			/*
			* Feature in Safari. When focus is called the browser selects the clientDiv
			* itself. The fix is to call _updateDOMSelection() after calling focus().
			*/
			this._updateDOMSelection();
		},
		/**
		 * Check if the text view has focus.
		 *
		 * @returns {Boolean} <code>true</code> if the text view has focus, otherwise <code>false</code>.
		 */
		hasFocus: function() {
			return this._hasFocus;
		},
		/**
		 * Returns the action description for a given action ID.
		 *
		 * @returns {orion.editor.ActionDescrition} the action description
		 */
		getActionDescription: function(actionID) {
			var action = this._actions[actionID];
			if (action) {
				return action.actionDescription;
			}
			return undefined;
		},
		/**
		 * Returns all action IDs defined in the text view.
		 * <p>
		 * There are two types of actions, the predefined actions of the view 
		 * and the actions added by application code.
		 * </p>
		 * <p>
		 * The predefined actions are:
		 * <ul>
		 *   <li>Navigation actions. These actions move the caret collapsing the selection.</li>
		 *     <ul>
		 *       <li>"lineUp" - moves the caret up by one line</li>
		 *       <li>"lineDown" - moves the caret down by one line</li>
		 *       <li>"lineStart" - moves the caret to beginning of the current line</li>
		 *       <li>"lineEnd" - moves the caret to end of the current line </li>
		 *       <li>"charPrevious" - moves the caret to the previous character</li>
		 *       <li>"charNext" - moves the caret to the next character</li>
		 *       <li>"pageUp" - moves the caret up by one page</li>
		 *       <li>"pageDown" - moves the caret down by one page</li>
		 *       <li>"wordPrevious" - moves the caret to the previous word</li>
		 *       <li>"wordNext" - moves the caret to the next word</li>
		 *       <li>"textStart" - moves the caret to the beginning of the document</li>
		 *       <li>"textEnd" - moves the caret to the end of the document</li>
		 *     </ul>
		 *   <li>Selection actions. These actions move the caret extending the selection.</li>
		 *     <ul>
		 *       <li>"selectLineUp" - moves the caret up by one line</li>
		 *       <li>"selectLineDown" - moves the caret down by one line</li>
		 *       <li>"selectLineStart" - moves the caret to beginning of the current line</li>
		 *       <li>"selectLineEnd" - moves the caret to end of the current line </li>
		 *       <li>"selectCharPrevious" - moves the caret to the previous character</li>
		 *       <li>"selectCharNext" - moves the caret to the next character</li>
		 *       <li>"selectPageUp" - moves the caret up by one page</li>
		 *       <li>"selectPageDown" - moves the caret down by one page</li>
		 *       <li>"selectWordPrevious" - moves the caret to the previous word</li>
		 *       <li>"selectWordNext" - moves the caret to the next word</li>
		 *       <li>"selectTextStart" - moves the caret to the beginning of the document</li>
		 *       <li>"selectTextEnd" - moves the caret to the end of the document</li>
		 *       <li>"selectAll" - selects the entire document</li>
		 *     </ul>
		 *   <li>Edit actions. These actions modify the text view text</li>
		 *     <ul>
		 *       <li>"deletePrevious" - deletes the character preceding the caret</li>
		 *       <li>"deleteNext" - deletes the charecter following the caret</li>
		 *       <li>"deleteWordPrevious" - deletes the word preceding the caret</li>
		 *       <li>"deleteWordNext" - deletes the word following the caret</li>
		 *       <li>"tab" - inserts a tab character at the caret</li>
		 *       <li>"shiftTab" - noop</li>
		 *       <li>"toggleTabMode" - toggles tab mode.</li>
		 *       <li>"toggleWrapMode" - toggles wrap mode.</li>
		 *       <li>"enter" - inserts a line delimiter at the caret</li>
		 *     </ul>
		 *   <li>Clipboard actions.</li>
		 *     <ul>
		 *       <li>"copy" - copies the selected text to the clipboard</li>
		 *       <li>"cut" - copies the selected text to the clipboard and deletes the selection</li>
		 *       <li>"paste" - replaces the selected text with the clipboard contents</li>
		 *     </ul>
		 * </ul>
		 * </p>
		 *
		 * @param {Boolean} [defaultAction=false] whether or not the predefined actions are included.
		 * @returns {String[]} an array of action IDs defined in the text view.
		 *
		 * @see #invokeAction
		 * @see #setAction
		 * @see #setKeyBinding
		 * @see #getKeyBindings
		 */
		getActions: function (defaultAction) {
			var result = [];
			var actions = this._actions;
			for (var i in actions) {
				if (actions.hasOwnProperty(i)) {
					if (!defaultAction && actions[i].defaultHandler) { continue; }
					result.push(i);
				}
			}
			return result;
		},
		/**
		 * Returns the bottom index.
		 * <p>
		 * The bottom index is the line that is currently at the bottom of the view.  This
		 * line may be partially visible depending on the vertical scroll of the view. The parameter
		 * <code>fullyVisible</code> determines whether to return only fully visible lines. 
		 * </p>
		 *
		 * @param {Boolean} [fullyVisible=false] if <code>true</code>, returns the index of the last fully visible line. This
		 *    parameter is ignored if the view is not big enough to show one line.
		 * @returns {Number} the index of the bottom line.
		 *
		 * @see #getTopIndex
		 * @see #setTopIndex
		 */
		getBottomIndex: function(fullyVisible) {
			if (!this._clientDiv) { return 0; }
			return this._getBottomIndex(fullyVisible);
		},
		/**
		 * Returns the bottom pixel.
		 * <p>
		 * The bottom pixel is the pixel position that is currently at
		 * the bottom edge of the view.  This position is relative to the
		 * beginning of the document.
		 * </p>
		 *
		 * @returns {Number} the bottom pixel.
		 *
		 * @see #getTopPixel
		 * @see #setTopPixel
		 * @see #convert
		 */
		getBottomPixel: function() {
			if (!this._clientDiv) { return 0; }
			return this._getScroll().y + this._getClientHeight();
		},
		/**
		 * Returns the caret offset relative to the start of the document.
		 *
		 * @returns the caret offset relative to the start of the document.
		 *
		 * @see #setCaretOffset
		 * @see #setSelection
		 * @see #getSelection
		 */
		getCaretOffset: function () {
			var s = this._getSelection();
			return s.getCaret();
		},
		/**
		 * Returns the client area.
		 * <p>
		 * The client area is the portion in pixels of the document that is visible. The
		 * client area position is relative to the beginning of the document.
		 * </p>
		 *
		 * @returns the client area rectangle {x, y, width, height}.
		 *
		 * @see #getTopPixel
		 * @see #getBottomPixel
		 * @see #getHorizontalPixel
		 * @see #convert
		 */
		getClientArea: function() {
			if (!this._clientDiv) { return {x: 0, y: 0, width: 0, height: 0}; }
			var scroll = this._getScroll();
			return {x: scroll.x, y: scroll.y, width: this._getClientWidth(), height: this._getClientHeight()};
		},
		/**
		 * Returns the horizontal pixel.
		 * <p>
		 * The horizontal pixel is the pixel position that is currently at
		 * the left edge of the view.  This position is relative to the
		 * beginning of the document.
		 * </p>
		 *
		 * @returns {Number} the horizontal pixel.
		 *
		 * @see #setHorizontalPixel
		 * @see #convert
		 */
		getHorizontalPixel: function() {
			if (!this._clientDiv) { return 0; }
			return this._getScroll().x;
		},
		/**
		 * Returns all the key bindings associated to the given action ID.
		 *
		 * @param {String} actionID the action ID.
		 * @returns {orion.editor.KeyBinding[]} the array of key bindings associated to the given action ID.
		 *
		 * @see #setKeyBinding
		 * @see #setAction
		 */
		getKeyBindings: function (actionID) {
			var result = [];
			var keyBindings = this._keyBindings;
			for (var i = 0; i < keyBindings.length; i++) {
				if (keyBindings[i].actionID === actionID) {
					result.push(keyBindings[i].keyBinding);
				}
			}
			return result;
		},
		/**
		 * Returns the line height for a given line index.  Returns the default line
		 * height if the line index is not specified.
		 *
		 * @param {Number} [lineIndex] the line index.
		 * @returns {Number} the height of the line in pixels.
		 *
		 * @see #getLinePixel
		 */
		getLineHeight: function(lineIndex) {
			if (!this._clientDiv) { return 0; }
			return this._getLineHeight(lineIndex);
		},
		/**
		 * Returns the line index for a given line pixel position relative to the document.
		 *
		 * @param {Number} [y] the line pixel.
		 * @returns {Number} the line index for the specified pixel position.
		 *
		 * @see #getLinePixel
		 */
		getLineIndex: function(y) {
			if (!this._clientDiv) { return 0; }
			return this._getLineIndex(y);
		},
		/**
		 * Returns the top pixel position of a given line index relative to the beginning
		 * of the document.
		 * <p>
		 * Clamps out of range indices.
		 * </p>
		 *
		 * @param {Number} lineIndex the line index.
		 * @returns {Number} the pixel position of the line.
		 *
		 * @see #setTopPixel
		 * @see #getLineIndex
		 * @see #convert
		 */
		getLinePixel: function(lineIndex) {
			if (!this._clientDiv) { return 0; }
			return this._getLinePixel(lineIndex);
		},
		/**
		 * Returns the {x, y} pixel location of the top-left corner of the character
		 * bounding box at the specified offset in the document.  The pixel location
		 * is relative to the document.
		 * <p>
		 * Clamps out of range offsets.
		 * </p>
		 *
		 * @param {Number} offset the character offset
		 * @returns the {x, y} pixel location of the given offset.
		 *
		 * @see #getOffsetAtLocation
		 * @see #convert
		 */
		getLocationAtOffset: function(offset) {
			if (!this._clientDiv) { return {x: 0, y: 0}; }
			var model = this._model;
			offset = Math.min(Math.max(0, offset), model.getCharCount());
			var lineIndex = model.getLineAtOffset(offset);
			var line = this._getLine(lineIndex);
			var rect = line.getBoundingClientRect(offset);
			line.destroy();
			var x = rect.left;
			var y = this._getLinePixel(lineIndex) + rect.top;
			return {x: x, y: y};
		},
		/**
		 * Returns the specified view options.
		 * <p>
		 * The returned value is either a <code>orion.editor.TextViewOptions</code> or an option value. An option value is returned when only one string paremeter
		 * is specified. A <code>orion.editor.TextViewOptions</code> is returned when there are no paremeters, or the parameters are a list of options names or a
		 * <code>orion.editor.TextViewOptions</code>. All view options are returned when there no paremeters.
		 * </p>
		 *
		 * @param {String|orion.editor.TextViewOptions} [options] The options to return.
		 * @return {Object|orion.editor.TextViewOptions} The requested options or an option value.
		 *
		 * @see #setOptions
		 */
		getOptions: function() {
			var options;
			if (arguments.length === 0) {
				options = this._defaultOptions();
			} else if (arguments.length === 1) {
				var arg = arguments[0];
				if (typeof arg === "string") { //$NON-NLS-0$
					return clone(this["_" + arg]); //$NON-NLS-0$
				}
				options = arg;
			} else {
				options = {};
				for (var index in arguments) {
					if (arguments.hasOwnProperty(index)) {
						options[arguments[index]] = undefined;
					}
				}
			}
			for (var option in options) {
				if (options.hasOwnProperty(option)) {
					options[option] = clone(this["_" + option]); //$NON-NLS-0$
				}
			}
			return options;
		},
		/**
		 * Returns the text model of the text view.
		 *
		 * @returns {orion.editor.TextModel} the text model of the view.
		 */
		getModel: function() {
			return this._model;
		},
		/**
		 * Returns the character offset nearest to the given pixel location.  The
		 * pixel location is relative to the document.
		 *
		 * @param x the x of the location
		 * @param y the y of the location
		 * @returns the character offset at the given location.
		 *
		 * @see #getLocationAtOffset
		 */
		getOffsetAtLocation: function(x, y) {
			if (!this._clientDiv) { return 0; }
			var lineIndex = this._getLineIndex(y);
			var line = this._getLine(lineIndex);
			var offset = line.getOffset(x, y - this._getLinePixel(lineIndex));
			line.destroy();
			return offset;
		},
		/**
		 * Get the view rulers.
		 *
		 * @returns the view rulers
		 *
		 * @see #addRuler
		 */
		getRulers: function() {
			return this._rulers.slice(0);
		},
		/**
		 * Returns the text view selection.
		 * <p>
		 * The selection is defined by a start and end character offset relative to the
		 * document. The character at end offset is not included in the selection.
		 * </p>
		 * 
		 * @returns {orion.editor.Selection} the view selection
		 *
		 * @see #setSelection
		 */
		getSelection: function () {
			var s = this._getSelection();
			return {start: s.start, end: s.end};
		},
		/**
		 * Returns the text for the given range.
		 * <p>
		 * The text does not include the character at the end offset.
		 * </p>
		 *
		 * @param {Number} [start=0] the start offset of text range.
		 * @param {Number} [end=char count] the end offset of text range.
		 *
		 * @see #setText
		 */
		getText: function(start, end) {
			var model = this._model;
			return model.getText(start, end);
		},
		/**
		 * Returns the top index.
		 * <p>
		 * The top index is the line that is currently at the top of the view.  This
		 * line may be partially visible depending on the vertical scroll of the view. The parameter
		 * <code>fullyVisible</code> determines whether to return only fully visible lines. 
		 * </p>
		 *
		 * @param {Boolean} [fullyVisible=false] if <code>true</code>, returns the index of the first fully visible line. This
		 *    parameter is ignored if the view is not big enough to show one line.
		 * @returns {Number} the index of the top line.
		 *
		 * @see #getBottomIndex
		 * @see #setTopIndex
		 */
		getTopIndex: function(fullyVisible) {
			if (!this._clientDiv) { return 0; }
			return this._getTopIndex(fullyVisible);
		},
		/**
		 * Returns the top pixel.
		 * <p>
		 * The top pixel is the pixel position that is currently at
		 * the top edge of the view.  This position is relative to the
		 * beginning of the document.
		 * </p>
		 *
		 * @returns {Number} the top pixel.
		 *
		 * @see #getBottomPixel
		 * @see #setTopPixel
		 * @see #convert
		 */
		getTopPixel: function() {
			if (!this._clientDiv) { return 0; }
			return this._getScroll().y;
		},
		/**
		 * Executes the action handler associated with the given action ID.
		 * <p>
		 * The application defined action takes precedence over predefined actions unless
		 * the <code>defaultAction</code> paramater is <code>true</code>.
		 * </p>
		 * <p>
		 * If the application defined action returns <code>false</code>, the text view predefined
		 * action is executed if present.
		 * </p>
		 *
		 * @param {String} actionID the action ID.
		 * @param {Boolean} [defaultAction] whether to always execute the predefined action.
		 * @returns {Boolean} <code>true</code> if the action was executed.
		 *
		 * @see #setAction
		 * @see #getActions
		 */
		invokeAction: function (actionID, defaultAction) {
			if (!this._clientDiv) { return; }
			var action = this._actions[actionID];
			if (action) {
				if (!defaultAction && action.handler) {
					if (action.handler()) { return; }
				}
				if (action.defaultHandler) { return action.defaultHandler(); }
			}
			return false;
		},
		/**
		* Returns if the view is destroyed.
		* @returns {Boolean} <code>true</code> if the view is destroyed.
		*/
		isDestroyed: function () {
			return !this._clientDiv;
		},
		/** 
		 * @class This is the event sent when the user right clicks or otherwise invokes the context menu of the view. 
		 * <p> 
		 * <b>See:</b><br/> 
		 * {@link orion.editor.TextView}<br/> 
		 * {@link orion.editor.TextView#event:onContextMenu} 
		 * </p> 
		 * 
		 * @name orion.editor.ContextMenuEvent 
		 * 
		 * @property {Number} x The pointer location on the x axis, relative to the document the user is editing. 
		 * @property {Number} y The pointer location on the y axis, relative to the document the user is editing. 
		 * @property {Number} screenX The pointer location on the x axis, relative to the screen. This is copied from the DOM contextmenu event.screenX property. 
		 * @property {Number} screenY The pointer location on the y axis, relative to the screen. This is copied from the DOM contextmenu event.screenY property. 
		 * @property {Boolean} defaultPrevented Determines whether the user agent context menu should be shown. It is shown by default.
		 * @property {Function} preventDefault If called prevents the user agent context menu from showing.
		 */ 
		/** 
		 * This event is sent when the user invokes the view context menu. 
		 * 
		 * @event 
		 * @param {orion.editor.ContextMenuEvent} contextMenuEvent the event 
		 */ 
		onContextMenu: function(contextMenuEvent) {
			return this.dispatchEvent(contextMenuEvent); 
		}, 
		onDragStart: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDrag: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDragEnd: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDragEnter: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDragOver: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDragLeave: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDrop: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		/**
		 * @class This is the event sent when the text view is destroyed.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onDestroy}
		 * </p>
		 * @name orion.editor.DestroyEvent
		 */
		/**
		 * This event is sent when the text view has been destroyed.
		 *
		 * @event
		 * @param {orion.editor.DestroyEvent} destroyEvent the event
		 *
		 * @see #destroy
		 */
		onDestroy: function(destroyEvent) {
			return this.dispatchEvent(destroyEvent);
		},
		/**
		 * @class This object is used to define style information for the text view.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onLineStyle}
		 * </p>		 
		 * @name orion.editor.Style
		 * 
		 * @property {String} styleClass A CSS class name.
		 * @property {Object} style An object with CSS properties.
		 * @property {String} tagName A DOM tag name.
		 * @property {Object} attributes An object with DOM attributes.
		 */
		/**
		 * @class This object is used to style range.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onLineStyle}
		 * </p>		 
		 * @name orion.editor.StyleRange
		 * 
		 * @property {Number} start The start character offset, relative to the document, where the style should be applied.
		 * @property {Number} end The end character offset (exclusive), relative to the document, where the style should be applied.
		 * @property {orion.editor.Style} style The style for the range.
		 */
		/**
		 * @class This is the event sent when the text view needs the style information for a line.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onLineStyle}
		 * </p>		 
		 * @name orion.editor.LineStyleEvent
		 * 
		 * @property {orion.editor.TextView} textView The text view.		 
		 * @property {Number} lineIndex The line index.
		 * @property {String} lineText The line text.
		 * @property {Number} lineStart The character offset, relative to document, of the first character in the line.
		 * @property {orion.editor.Style} style The style for the entire line (output argument).
		 * @property {orion.editor.StyleRange[]} ranges An array of style ranges for the line (output argument).		 
		 */
		/**
		 * This event is sent when the text view needs the style information for a line.
		 *
		 * @event
		 * @param {orion.editor.LineStyleEvent} lineStyleEvent the event
		 */
		onLineStyle: function(lineStyleEvent) {
			return this.dispatchEvent(lineStyleEvent);
		},
		/**
		 * @class This is the event sent when the text in the model has changed.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onModelChanged}<br/>
		 * {@link orion.editor.TextModel#onChanged}
		 * </p>
		 * @name orion.editor.ModelChangedEvent
		 * 
		 * @property {Number} start The character offset in the model where the change has occurred.
		 * @property {Number} removedCharCount The number of characters removed from the model.
		 * @property {Number} addedCharCount The number of characters added to the model.
		 * @property {Number} removedLineCount The number of lines removed from the model.
		 * @property {Number} addedLineCount The number of lines added to the model.
		 */
		/**
		 * This event is sent when the text in the model has changed.
		 *
		 * @event
		 * @param {orion.editor.ModelChangedEvent} modelChangedEvent the event
		 */
		onModelChanged: function(modelChangedEvent) {
			return this.dispatchEvent(modelChangedEvent);
		},
		/**
		 * @class This is the event sent when the text in the model is about to change.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onModelChanging}<br/>
		 * {@link orion.editor.TextModel#onChanging}
		 * </p>
		 * @name orion.editor.ModelChangingEvent
		 * 
		 * @property {String} text The text that is about to be inserted in the model.
		 * @property {Number} start The character offset in the model where the change will occur.
		 * @property {Number} removedCharCount The number of characters being removed from the model.
		 * @property {Number} addedCharCount The number of characters being added to the model.
		 * @property {Number} removedLineCount The number of lines being removed from the model.
		 * @property {Number} addedLineCount The number of lines being added to the model.
		 */
		/**
		 * This event is sent when the text in the model is about to change.
		 *
		 * @event
		 * @param {orion.editor.ModelChangingEvent} modelChangingEvent the event
		 */
		onModelChanging: function(modelChangingEvent) {
			return this.dispatchEvent(modelChangingEvent);
		},
		/**
		 * @class This is the event sent when the text is modified by the text view.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onModify}
		 * </p>
		 * @name orion.editor.ModifyEvent
		 */
		/**
		 * This event is sent when the text view has changed text in the model.
		 * <p>
		 * If the text is changed directly through the model API, this event
		 * is not sent.
		 * </p>
		 *
		 * @event
		 * @param {orion.editor.ModifyEvent} modifyEvent the event
		 */
		onModify: function(modifyEvent) {
			return this.dispatchEvent(modifyEvent);
		},
		onMouseDown: function(mouseEvent) {
			return this.dispatchEvent(mouseEvent);
		},
		onMouseUp: function(mouseEvent) {
			return this.dispatchEvent(mouseEvent);
		},
		onMouseMove: function(mouseEvent) {
			return this.dispatchEvent(mouseEvent);
		},
		onMouseOver: function(mouseEvent) {
			return this.dispatchEvent(mouseEvent);
		},
		onMouseOut: function(mouseEvent) {
			return this.dispatchEvent(mouseEvent);
		},
		/**
		 * @class This is the event sent when the selection changes in the text view.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onSelection}
		 * </p>		 
		 * @name orion.editor.SelectionEvent
		 * 
		 * @property {orion.editor.Selection} oldValue The old selection.
		 * @property {orion.editor.Selection} newValue The new selection.
		 */
		/**
		 * This event is sent when the text view selection has changed.
		 *
		 * @event
		 * @param {orion.editor.SelectionEvent} selectionEvent the event
		 */
		onSelection: function(selectionEvent) {
			return this.dispatchEvent(selectionEvent);
		},
		/**
		 * @class This is the event sent when the text view scrolls.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onScroll}
		 * </p>		 
		 * @name orion.editor.ScrollEvent
		 * 
		 * @property oldValue The old scroll {x,y}.
		 * @property newValue The new scroll {x,y}.
		 */
		/**
		 * This event is sent when the text view scrolls vertically or horizontally.
		 *
		 * @event
		 * @param {orion.editor.ScrollEvent} scrollEvent the event
		 */
		onScroll: function(scrollEvent) {
			return this.dispatchEvent(scrollEvent);
		},
		/**
		 * @class This is the event sent when the text is about to be modified by the text view.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onVerify}
		 * </p>
		 * @name orion.editor.VerifyEvent
		 * 
		 * @property {String} text The text being inserted.
		 * @property {Number} start The start offset of the text range to be replaced.
		 * @property {Number} end The end offset (exclusive) of the text range to be replaced.
		 */
		/**
		 * This event is sent when the text view is about to change text in the model.
		 * <p>
		 * If the text is changed directly through the model API, this event
		 * is not sent.
		 * </p>
		 * <p>
		 * Listeners are allowed to change these parameters. Setting text to null
		 * or undefined stops the change.
		 * </p>
		 *
		 * @event
		 * @param {orion.editor.VerifyEvent} verifyEvent the event
		 */
		onVerify: function(verifyEvent) {
			return this.dispatchEvent(verifyEvent);
		},
		/**
		 * @class This is the event sent when the text view is focused.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onFocus}<br/>
		 * </p>
		 * @name orion.editor.FocusEvent
		 */
		/**
		 * This event is sent when the text view is focused.
		 *
		 * @event
		 * @param {orion.editor.FocusEvent} focusEvent the event
		 */
		onFocus: function(focusEvent) {
			return this.dispatchEvent(focusEvent);
		},
		/**
		 * @class This is the event sent when the text view goes out of focus.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onBlur}<br/>
		 * </p>
		 * @name orion.editor.BlurEvent
		 */
		/**
		 * This event is sent when the text view goes out of focus.
		 *
		 * @event
		 * @param {orion.editor.BlurEvent} blurEvent the event
		 */
		onBlur: function(blurEvent) {
			return this.dispatchEvent(blurEvent);
		},
		/**
		 * Redraws the entire view, including rulers.
		 *
		 * @see #redrawLines
		 * @see #redrawRange
		 * @see #setRedraw
		 */
		redraw: function() {
			if (this._redrawCount > 0) { return; }
			var lineCount = this._model.getLineCount();
			this.redrawRulers(0, lineCount);
			this.redrawLines(0, lineCount); 
		},
		redrawRulers: function(startLine, endLine) {
			if (this._redrawCount > 0) { return; }
			var rulers = this.getRulers();
			for (var i = 0; i < rulers.length; i++) {
				this.redrawLines(startLine, endLine, rulers[i]);
			}
		},
		/**
		 * Redraws the text in the given line range.
		 * <p>
		 * The line at the end index is not redrawn.
		 * </p>
		 *
		 * @param {Number} [startLine=0] the start line
		 * @param {Number} [endLine=line count] the end line
		 *
		 * @see #redraw
		 * @see #redrawRange
		 * @see #setRedraw
		 */
		redrawLines: function(startLine, endLine, ruler) {
			if (this._redrawCount > 0) { return; }
			if (startLine === undefined) { startLine = 0; }
			if (endLine === undefined) { endLine = this._model.getLineCount(); }
			if (startLine === endLine) { return; }
			var div = this._clientDiv;
			if (!div) { return; }
			if (ruler) {
				var location = ruler.getLocation();//"left" or "right"
				var divRuler = location === "left" ? this._leftDiv : this._rightDiv; //$NON-NLS-0$
				div = divRuler.firstChild;
				while (div) {
					if (div._ruler === ruler) {
						break;
					}
					div = div.nextSibling;
				}
			}
			if (ruler) {
				div.rulerChanged = true;
			} else {
				if (this._lineHeight) {
					this._resetLineHeight(startLine, endLine);
				}
			}
			if (!ruler || ruler.getOverview() === "page") { //$NON-NLS-0$
				var child = div.firstChild;
				while (child) {
					var lineIndex = child.lineIndex;
					if (startLine <= lineIndex && lineIndex < endLine) {
						child.lineChanged = true;
					}
					child = child.nextSibling;
				}
			}
			if (!ruler) {
				if (!this._wrapMode) {
					if (startLine <= this._maxLineIndex && this._maxLineIndex < endLine) {
						this._checkMaxLineIndex = this._maxLineIndex;
						this._maxLineIndex = -1;
						this._maxLineWidth = 0;
					}
				}
			}
			this._queueUpdate();
		},
		/**
		 * Redraws the text in the given range.
		 * <p>
		 * The character at the end offset is not redrawn.
		 * </p>
		 *
		 * @param {Number} [start=0] the start offset of text range
		 * @param {Number} [end=char count] the end offset of text range
		 *
		 * @see #redraw
		 * @see #redrawLines
		 * @see #setRedraw
		 */
		redrawRange: function(start, end) {
			if (this._redrawCount > 0) { return; }
			var model = this._model;
			if (start === undefined) { start = 0; }
			if (end === undefined) { end = model.getCharCount(); }
			var startLine = model.getLineAtOffset(start);
			var endLine = model.getLineAtOffset(Math.max(start, end - 1)) + 1;
			this.redrawLines(startLine, endLine);
		},
		/**
		 * Removes a ruler from the text view.
		 *
		 * @param {orion.editor.Ruler} ruler the ruler.
		 */
		removeRuler: function (ruler) {
			var rulers = this._rulers;
			for (var i=0; i<rulers.length; i++) {
				if (rulers[i] === ruler) {
					rulers.splice(i, 1);
					ruler.setView(null);
					this._destroyRuler(ruler);
					this._update();
					break;
				}
			}
		},
		resize: function() {
			if (!this._clientDiv) { return; }
			this._handleResize(null);
		},
		/**
		 * @class This object describes an action for the text view.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#setAction}
		 * </p>		 
		 * @name orion.editor.ActionDescription
		 *
		 * @property {String} [name] the name to be used when showing the action as text.
		 */
		/**
		 * Associates an application defined handler to an action ID.
		 * <p>
		 * If the action ID is a predefined action, the given handler executes before
		 * the default action handler.  If the given handler returns <code>true</code>, the
		 * default action handler is not called.
		 * </p>
		 *
		 * @param {String} actionID the action ID.
		 * @param {Function} handler the action handler.
		 * @param {orion.editor.ActionDescription} [actionDescription=undefined] the action description.
		 *
		 * @see #getActions
		 * @see #invokeAction
		 */
		setAction: function(actionID, handler, actionDescription) {
			if (!actionID) { return; }
			var actions = this._actions;
			var action = actions[actionID];
			if (!action) { 
				action = actions[actionID] = {};
			}
			action.handler = handler;
			action.actionDescription = actionDescription;
		},
		/**
		 * Associates a key binding with the given action ID. Any previous
		 * association with the specified key binding is overwriten. If the
		 * action ID is <code>null</code>, the association is removed.
		 * 
		 * @param {orion.editor.KeyBinding} keyBinding the key binding
		 * @param {String} actionID the action ID
		 */
		setKeyBinding: function(keyBinding, actionID) {
			var keyBindings = this._keyBindings;
			for (var i = 0; i < keyBindings.length; i++) {
				var kb = keyBindings[i]; 
				if (kb.keyBinding.equals(keyBinding)) {
					if (actionID) {
						kb.actionID = actionID;
					} else {
						if (kb.predefined) {
							kb.actionID = null;
						} else {
							keyBindings.splice(i, 1);
						}
					}
					return;
				}
			}
			if (actionID) {
				keyBindings.push({keyBinding: keyBinding, actionID: actionID});
			}
		},
		/**
		 * Sets the caret offset relative to the start of the document.
		 *
		 * @param {Number} caret the caret offset relative to the start of the document.
		 * @param {Boolean|Number} [show=true] if <code>true</code>, the view will scroll the minimum amount necessary to show the caret location. If
		 *					<code>show</code> is a <code>Number</code>, the view will scroll the minimum amount necessary to show the caret location plus a
		 *					percentage of the client area height. The parameter is clamped to the [0,1] range.  In either case, the view will only scroll
		 *					if the new caret location is visible already.
		 * @param {Function} [callback] if callback is specified and <code>scrollAnimation</code> is not zero, view scrolling is animated and
		 *					the callback is called when the animation is done. Otherwise, callback is callback right away. The callback is not
		 *					if the view does not scroll.
		 *
		 * @see #getCaretOffset
		 * @see #setSelection
		 * @see #getSelection
		 */
		setCaretOffset: function(offset, show, callback) {
			var charCount = this._model.getCharCount();
			offset = Math.max(0, Math.min (offset, charCount));
			var selection = new Selection(offset, offset, false);
			this._setSelection (selection, show === undefined || show, true, callback);
		},
		/**
		 * Sets the horizontal pixel.
		 * <p>
		 * The horizontal pixel is the pixel position that is currently at
		 * the left edge of the view.  This position is relative to the
		 * beginning of the document.
		 * </p>
		 *
		 * @param {Number} pixel the horizontal pixel.
		 *
		 * @see #getHorizontalPixel
		 * @see #convert
		 */
		setHorizontalPixel: function(pixel) {
			if (!this._clientDiv) { return; }
			pixel = Math.max(0, pixel);
			this._scrollView(pixel - this._getScroll().x, 0);
		},
		/**
		 * Sets whether the view should update the DOM.
		 * <p>
		 * This can be used to improve the performance.
		 * </p><p>
		 * When the flag is set to <code>true</code>,
		 * the entire view is marked as needing to be redrawn. 
		 * Nested calls to this method are stacked.
		 * </p>
		 *
		 * @param {Boolean} redraw the new redraw state
		 * 
		 * @see #redraw
		 */
		setRedraw: function(redraw) {
			if (redraw) {
				if (--this._redrawCount === 0) {
					this.redraw();
				}
			} else {
				this._redrawCount++;
			}
		},
		/**
		 * Sets the text model of the text view.
		 *
		 * @param {orion.editor.TextModel} model the text model of the view.
		 */
		setModel: function(model) {
			if (!model) { return; }
			if (model === this._model) { return; }
			this._model.removeEventListener("preChanging", this._modelListener.onChanging); //$NON-NLS-0$
			this._model.removeEventListener("postChanged", this._modelListener.onChanged); //$NON-NLS-0$
			var oldLineCount = this._model.getLineCount();
			var oldCharCount = this._model.getCharCount();
			var newLineCount = model.getLineCount();
			var newCharCount = model.getCharCount();
			var newText = model.getText();
			var e = {
				type: "ModelChanging", //$NON-NLS-0$
				text: newText,
				start: 0,
				removedCharCount: oldCharCount,
				addedCharCount: newCharCount,
				removedLineCount: oldLineCount,
				addedLineCount: newLineCount
			};
			this.onModelChanging(e);
			this._model = model;
			e = {
				type: "ModelChanged", //$NON-NLS-0$
				start: 0,
				removedCharCount: oldCharCount,
				addedCharCount: newCharCount,
				removedLineCount: oldLineCount,
				addedLineCount: newLineCount
			};
			this.onModelChanged(e); 
			this._model.addEventListener("preChanging", this._modelListener.onChanging); //$NON-NLS-0$
			this._model.addEventListener("postChanged", this._modelListener.onChanged); //$NON-NLS-0$
			this._reset();
			this._update();
		},
		/**
		 * Sets the view options for the view.
		 *
		 * @param {orion.editor.TextViewOptions} options the view options.
		 * 
		 * @see #getOptions
		 */
		setOptions: function (options) {
			var defaultOptions = this._defaultOptions();
			for (var option in options) {
				if (options.hasOwnProperty(option)) {
					var newValue = options[option], oldValue = this["_" + option]; //$NON-NLS-0$
					if (compare(oldValue, newValue)) { continue; }
					var update = defaultOptions[option] ? defaultOptions[option].update : null;
					if (update) {
						update.call(this, newValue);
						continue;
					}
					this["_" + option] = clone(newValue); //$NON-NLS-0$
				}
			}
		},
		/**
		 * Sets the text view selection.
		 * <p>
		 * The selection is defined by a start and end character offset relative to the
		 * document. The character at end offset is not included in the selection.
		 * </p>
		 * <p>
		 * The caret is always placed at the end offset. The start offset can be
		 * greater than the end offset to place the caret at the beginning of the
		 * selection.
		 * </p>
		 * <p>
		 * Clamps out of range offsets.
		 * </p>
		 * 
		 * @param {Number} start the start offset of the selection
		 * @param {Number} end the end offset of the selection
		 * @param {Boolean|Number} [show=true] if <code>true</code>, the view will scroll the minimum amount necessary to show the caret location. If
		 *					<code>show</code> is a <code>Number</code>, the view will scroll the minimum amount necessary to show the caret location plus a
		 *					percentage of the client area height. The parameter is clamped to the [0,1] range.  In either case, the view will only scroll
		 *					if the new caret location is visible already.
		 * @param {Function} [callback] if callback is specified and <code>scrollAnimation</code> is not zero, view scrolling is animated and
		 *					the callback is called when the animation is done. Otherwise, callback is callback right away. The callback is not
		 *					if the view does not scroll.
		 *
		 * @see #getSelection
		 */
		setSelection: function (start, end, show, callback) {
			var caret = start > end;
			if (caret) {
				var tmp = start;
				start = end;
				end = tmp;
			}
			var charCount = this._model.getCharCount();
			start = Math.max(0, Math.min (start, charCount));
			end = Math.max(0, Math.min (end, charCount));
			var selection = new Selection(start, end, caret);
			this._setSelection(selection, show === undefined || show, true, callback);
		},
		/**
		 * Replaces the text in the given range with the given text.
		 * <p>
		 * The character at the end offset is not replaced.
		 * </p>
		 * <p>
		 * When both <code>start</code> and <code>end</code> parameters
		 * are not specified, the text view places the caret at the beginning
		 * of the document and scrolls to make it visible.
		 * </p>
		 *
		 * @param {String} text the new text.
		 * @param {Number} [start=0] the start offset of text range.
		 * @param {Number} [end=char count] the end offset of text range.
		 *
		 * @see #getText
		 */
		setText: function (text, start, end) {
			var reset = start === undefined && end === undefined;
			if (start === undefined) { start = 0; }
			if (end === undefined) { end = this._model.getCharCount(); }
			this._modifyContent({text: text, start: start, end: end, _code: true}, !reset);
			if (reset) {
				this._columnX = -1;
				this._setSelection(new Selection (0, 0, false), true);
				
				/*
				* Bug in Firefox.  For some reason, the caret does not show after the
				* view is refreshed.  The fix is to toggle the contentEditable state and
				* force the clientDiv to loose and receive focus if it is focused.
				*/
				if (util.isFirefox) {
					this._fixCaret();
				}
			}
		},
		/**
		 * Sets the top index.
		 * <p>
		 * The top index is the line that is currently at the top of the text view.  This
		 * line may be partially visible depending on the vertical scroll of the view.
		 * </p>
		 *
		 * @param {Number} topIndex the index of the top line.
		 *
		 * @see #getBottomIndex
		 * @see #getTopIndex
		 */
		setTopIndex: function(topIndex) {
			if (!this._clientDiv) { return; }
			this._scrollView(0, this._getLinePixel(Math.max(0, topIndex)) - this._getScroll().y);
		},
		/**
		 * Sets the top pixel.
		 * <p>
		 * The top pixel is the pixel position that is currently at
		 * the top edge of the view.  This position is relative to the
		 * beginning of the document.
		 * </p>
		 *
		 * @param {Number} pixel the top pixel.
		 *
		 * @see #getBottomPixel
		 * @see #getTopPixel
		 * @see #convert
		 */
		setTopPixel: function(pixel) {
			if (!this._clientDiv) { return; }
			this._scrollView(0, Math.max(0, pixel) - this._getScroll().y);
		},
		/**
		 * Scrolls the selection into view if needed.
		 *
		 * @returns true if the view was scrolled. 
		 *
		 * @see #getSelection
		 * @see #setSelection
		 */
		showSelection: function() {
			return this._showCaret(true);
		},
		update: function(styleChanged, sync) {
			if (!this._clientDiv) { return; }
			if (styleChanged) {
				this._updateStyle();
			}
			if (sync === undefined || sync) {
				this._update();
			} else {
				this._queueUpdate();
			}
		},
		
		/**************************************** Event handlers *********************************/
		_handleRootMouseDown: function (e) {
			if (util.isFirefox && e.which === 1) {
				this._clientDiv.contentEditable = false;
				(this._overlayDiv || this._clientDiv).draggable = true;
				this._ignoreBlur = true;
			}
			
			/* Prevent clicks outside of the client div from taking focus away. */
			var topNode = this._overlayDiv || this._clientDiv;
			/* Use view div on IE 8 otherwise it is not possible to scroll. */
			if (util.isIE < 9) { topNode = this._viewDiv; }
			var temp = e.target ? e.target : e.srcElement;
			while (temp) {
				if (topNode === temp) {
					return;
				}
				temp = temp.parentNode;
			}
			if (e.preventDefault) { e.preventDefault(); }
			if (e.stopPropagation){ e.stopPropagation(); }
			if (!this._isW3CEvents) {
				/*
				* In IE 8 is not possible to prevent the default handler from running
				* during mouse down event using usual API. The workaround is to give
				* focus back to the client div.
				*/ 
				var self = this;
				var window = this._getWindow();
				window.setTimeout(function() {
					self._clientDiv.focus();
				}, 0);
			}
		},
		_handleRootMouseUp: function (e) {
			if (util.isFirefox && e.which === 1) {
				this._clientDiv.contentEditable = true;
				(this._overlayDiv || this._clientDiv).draggable = false;
				
				/*
				* Bug in Firefox.  For some reason, Firefox stops showing the caret
				* in some cases. For example when the user cancels a drag operation 
				* by pressing ESC.  The fix is to detect that the drag operation was
				* cancelled,  toggle the contentEditable state and force the clientDiv
				* to loose and receive focus if it is focused.
				*/
				this._fixCaret();
				this._ignoreBlur = false;
			}
		},
		_handleBlur: function (e) {
			if (this._ignoreBlur) { return; }
			this._hasFocus = false;
			/*
			* Bug in IE 8 and earlier. For some reason when text is deselected
			* the overflow selection at the end of some lines does not get redrawn.
			* The fix is to create a DOM element in the body to force a redraw.
			*/
			if (util.isIE < 9) {
				if (!this._getSelection().isEmpty()) {
					var rootDiv = this._rootDiv;
					var child = util.createElement(rootDiv.ownerDocument, "div"); //$NON-NLS-0$
					rootDiv.appendChild(child);
					rootDiv.removeChild(child);
				}
			}
			if (this._selDiv1) {
				var color = "lightgray"; //$NON-NLS-0$
				this._selDiv1.style.background = color;
				this._selDiv2.style.background = color;
				this._selDiv3.style.background = color;
				/* Clear browser selection if selection is within clientDiv */
				var temp;
				var window = this._getWindow();
				var document = this._selDiv1.ownerDocument;
				if (window.getSelection) {
					var sel = window.getSelection();
					temp = sel.anchorNode;
					while (temp) {
						if (temp === this._clientDiv) {
							if (sel.rangeCount > 0) { sel.removeAllRanges(); }
							break;
						}
						temp = temp.parentNode;
					}
				} else if (document.selection) {
					this._ignoreSelect = false;
					temp = document.selection.createRange().parentElement();
					while (temp) {
						if (temp === this._clientDiv) {
							document.selection.empty();
							break;
						}
						temp = temp.parentNode;
					}
					this._ignoreSelect = true;
				}
			}
			if (!this._ignoreFocus) {
				this.onBlur({type: "Blur"}); //$NON-NLS-0$
			}
		},
		_handleContextMenu: function (e) {
			if (util.isIE && this._lastMouseButton === 3) {
				// We need to update the DOM selection, because on
				// right-click the caret moves to the mouse location.
				// See bug 366312 and 376508.
				this._updateDOMSelection();
			}
			var preventDefault = false;
			if (this.isListening("ContextMenu")) { //$NON-NLS-0$
				var evt = this._createMouseEvent("ContextMenu", e); //$NON-NLS-0$
				evt.screenX = e.screenX;
				evt.screenY = e.screenY;
				this.onContextMenu(evt);
				preventDefault = evt.defaultPrevented;
			}
			if (preventDefault) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleCopy: function (e) {
			if (this._ignoreCopy) { return; }
			if (this._doCopy(e)) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleCut: function (e) {
			if (this._doCut(e)) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleDataModified: function(e) {
			this._startIME();
		},
		_handleDblclick: function (e) {
			var time = e.timeStamp ? e.timeStamp : new Date().getTime();
			this._lastMouseTime = time;
			if (this._clickCount !== 2) {
				this._clickCount = 2;
				this._handleMouse(e);
			}
		},
		_handleDragStart: function (e) {
			if (util.isFirefox) {
				var self = this;
				var window = this._getWindow();
				window.setTimeout(function() {
					self._clientDiv.contentEditable = true;
					self._clientDiv.draggable = false;
					self._ignoreBlur = false;
				}, 0);
			}
			if (this.isListening("DragStart") && this._dragOffset !== -1) { //$NON-NLS-0$
				this._isMouseDown = false;
				this.onDragStart(this._createMouseEvent("DragStart", e)); //$NON-NLS-0$
				this._dragOffset = -1;
			} else {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleDrag: function (e) {
			if (this.isListening("Drag")) { //$NON-NLS-0$
				this.onDrag(this._createMouseEvent("Drag", e)); //$NON-NLS-0$
			}
		},
		_handleDragEnd: function (e) {
			this._dropTarget = false;
			this._dragOffset = -1;
			if (this.isListening("DragEnd")) { //$NON-NLS-0$
				this.onDragEnd(this._createMouseEvent("DragEnd", e)); //$NON-NLS-0$
			}
			if (util.isFirefox) {
				this._fixCaret();
				/*
				* Bug in Firefox.  For some reason, Firefox stops showing the caret when the 
				* selection is dropped onto itself. The fix is to detected the case and 
				* call fixCaret() a second time.
				*/
				if (e.dataTransfer.dropEffect === "none" && !e.dataTransfer.mozUserCancelled) { //$NON-NLS-0$
					this._fixCaret();
				}
			}
		},
		_handleDragEnter: function (e) {
			var prevent = true;
			this._dropTarget = true;
			if (this.isListening("DragEnter")) { //$NON-NLS-0$
				prevent = false;
				this.onDragEnter(this._createMouseEvent("DragEnter", e)); //$NON-NLS-0$
			}
			/*
			* Webkit will not send drop events if this event is not prevented, as spec in HTML5.
			* Firefox and IE do not follow this spec for contentEditable. Note that preventing this 
			* event will result is loss of functionality (insertion mark, etc).
			*/
			if (util.isWebkit || prevent) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleDragOver: function (e) {
			var prevent = true;
			if (this.isListening("DragOver")) { //$NON-NLS-0$
				prevent = false;
				this.onDragOver(this._createMouseEvent("DragOver", e)); //$NON-NLS-0$
			}
			/*
			* Webkit will not send drop events if this event is not prevented, as spec in HTML5.
			* Firefox and IE do not follow this spec for contentEditable. Note that preventing this 
			* event will result is loss of functionality (insertion mark, etc).
			*/
			if (util.isWebkit || prevent) {
				if (prevent) { e.dataTransfer.dropEffect = "none"; } //$NON-NLS-0$
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleDragLeave: function (e) {
			this._dropTarget = false;
			if (this.isListening("DragLeave")) { //$NON-NLS-0$
				this.onDragLeave(this._createMouseEvent("DragLeave", e)); //$NON-NLS-0$
			}
		},
		_handleDrop: function (e) {
			this._dropTarget = false;
			if (this.isListening("Drop")) { //$NON-NLS-0$
				this.onDrop(this._createMouseEvent("Drop", e)); //$NON-NLS-0$
			}
			/*
			* This event must be prevented otherwise the user agent will modify
			* the DOM. Note that preventing the event on some user agents (i.e. IE)
			* indicates that the operation is cancelled. This causes the dropEffect to 
			* be set to none  in the dragend event causing the implementor to not execute
			* the code responsible by the move effect.
			*/
			if (e.preventDefault) { e.preventDefault(); }
			return false;
		},
		_handleFocus: function (e) {
			this._hasFocus = true;
			if (util.isIOS && this._lastTouchOffset !== undefined) {
				this.setCaretOffset(this._lastTouchOffset, true);
				this._lastTouchOffset = undefined;
			} else {
				this._updateDOMSelection();
			}
			if (this._selDiv1) {
				var color = this._highlightRGB;
				this._selDiv1.style.background = color;
				this._selDiv2.style.background = color;
				this._selDiv3.style.background = color;
			}
			if (!this._ignoreFocus) {
				this.onFocus({type: "Focus"}); //$NON-NLS-0$
			}
		},
		_handleKeyDown: function (e) {
			var modifier = false;
			switch (e.keyCode) {
				case 16: /* Shift */
				case 17: /* Control */
				case 18: /* Alt */
				case 91: /* Command */
					modifier = true;
					break;
				default:
					this._setLinksVisible(false);
			}
			if (e.keyCode === 229) {
				if (this._readonly) {
					if (e.preventDefault) { e.preventDefault(); }
					return false;
				}
				var startIME = true;
				
				/*
				* Bug in Safari. Some Control+key combinations send key events
				* with keyCode equals to 229. This is unexpected and causes the
				* view to start an IME composition. The fix is to ignore these
				* events.
				*/
				if (util.isSafari && util.isMac) {
					if (e.ctrlKey) {
						startIME = false;
					}
				}
				if (startIME) {
					this._startIME();
				}
			} else {
				if (!modifier) {
					this._commitIME();
				}
			}
			/*
			* Feature in Firefox. When a key is held down the browser sends 
			* right number of keypress events but only one keydown. This is
			* unexpected and causes the view to only execute an action
			* just one time. The fix is to ignore the keydown event and 
			* execute the actions from the keypress handler.
			* Note: This only happens on the Mac and Linux (Firefox 3.6).
			*
			* Feature in Opera.  Opera sends keypress events even for non-printable
			* keys.  The fix is to handle actions in keypress instead of keydown.
			*/
			if (((util.isMac || util.isLinux) && util.isFirefox < 4) || util.isOpera) {
				this._keyDownEvent = e;
				return true;
			}
			
			if (this._doAction(e)) {
				if (e.preventDefault) {
					e.preventDefault(); 
					e.stopPropagation(); 
				} else {
					e.cancelBubble = true;
					e.returnValue = false;
					e.keyCode = 0;
				}
				return false;
			}
		},
		_handleKeyPress: function (e) {
			/*
			* Feature in Embedded WebKit.  Embedded WekKit on Mac runs in compatibility mode and
			* generates key press events for these Unicode values (Function keys).  This does not
			* happen in Safari or Chrome.  The fix is to ignore these key events.
			*/
			if (util.isMac && util.isWebkit) {
				if ((0xF700 <= e.keyCode && e.keyCode <= 0xF7FF) || e.keyCode === 13 || e.keyCode === 8) {
					if (e.preventDefault) { e.preventDefault(); }
					return false;
				}
			}
			if (((util.isMac || util.isLinux) && util.isFirefox < 4) || util.isOpera) {
				if (this._doAction(this._keyDownEvent)) {
					if (e.preventDefault) { e.preventDefault(); }
					return false;
				}
			}
			var ctrlKey = util.isMac ? e.metaKey : e.ctrlKey;
			if (e.charCode !== undefined) {
				if (ctrlKey) {
					switch (e.charCode) {
						/*
						* In Firefox and Safari if ctrl+v, ctrl+c ctrl+x is canceled
						* the clipboard events are not sent. The fix to allow
						* the browser to handles these key events.
						*/
						case 99://c
						case 118://v
						case 120://x
							return true;
					}
				}
			}
			var ignore = false;
			if (util.isMac) {
				if (e.ctrlKey || e.metaKey) { ignore = true; }
			} else {
				if (util.isFirefox) {
					//Firefox clears the state mask when ALT GR generates input
					if (e.ctrlKey || e.altKey) { ignore = true; }
				} else {
					//IE and Chrome only send ALT GR when input is generated
					if (e.ctrlKey ^ e.altKey) { ignore = true; }
				}
			}
			if (!ignore) {
				var key = util.isOpera ? e.which : (e.charCode !== undefined ? e.charCode : e.keyCode);
				if (key > 31) {
					this._doContent(String.fromCharCode (key));
					if (e.preventDefault) { e.preventDefault(); }
					return false;
				}
			}
		},
		_handleKeyUp: function (e) {
			var ctrlKey = util.isMac ? e.metaKey : e.ctrlKey;
			if (!ctrlKey) {
				this._setLinksVisible(false);
			}
			// don't commit for space (it happens during JP composition)  
			if (e.keyCode === 13) {
				this._commitIME();
			}
		},
		_handleLinkClick: function (e) {
			var ctrlKey = util.isMac ? e.metaKey : e.ctrlKey;
			if (!ctrlKey) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleMouse: function (e) {
			var window = this._getWindow();
			var result = true;
			var target = window;
			if (util.isIE || (util.isFirefox && !this._overlayDiv)) { target = this._clientDiv; }
			if (this._overlayDiv) {
				if (this._hasFocus) {
					this._ignoreFocus = true;
				}
				var self = this;
				window.setTimeout(function () {
					self.focus();
					self._ignoreFocus = false;
				}, 0);
			}
			if (this._clickCount === 1) {
				result = this._setSelectionTo(e.clientX, e.clientY, e.shiftKey, !util.isOpera && this._hasFocus && this.isListening("DragStart")); //$NON-NLS-0$
				if (result) { this._setGrab(target); }
			} else {
				/*
				* Feature in IE8 and older, the sequence of events in the IE8 event model
				* for a doule-click is:
				*
				*	down
				*	up
				*	up
				*	dblclick
				*
				* Given that the mouse down/up events are not balanced, it is not possible to
				* grab on mouse down and ungrab on mouse up.  The fix is to grab on the first
				* mouse down and ungrab on mouse move when the button 1 is not set.
				*/
				if (this._isW3CEvents) { this._setGrab(target); }
				
				this._doubleClickSelection = null;
				this._setSelectionTo(e.clientX, e.clientY, e.shiftKey);
				this._doubleClickSelection = this._getSelection();
			}
			return result;
		},
		_handleMouseDown: function (e) {
			if (this._linksVisible) {
				var target = e.target || e.srcElement;
				if (target.tagName !== "A") { //$NON-NLS-0$
					this._setLinksVisible(false);
				} else {
					return;
				}
			}
			this._commitIME();

			var button = e.which; // 1 - left, 2 - middle, 3 - right
			if (!button) { 
				// if IE 8 or older
				if (e.button === 4) { button = 2; }
				if (e.button === 2) { button = 3; }
				if (e.button === 1) { button = 1; }
			}

			// For middle click we always need getTime(). See _getClipboardText().
			var time = button !== 2 && e.timeStamp ? e.timeStamp : new Date().getTime();
			var timeDiff = time - this._lastMouseTime;
			var deltaX = Math.abs(this._lastMouseX - e.clientX);
			var deltaY = Math.abs(this._lastMouseY - e.clientY);
			var sameButton = this._lastMouseButton === button;
			this._lastMouseX = e.clientX;
			this._lastMouseY = e.clientY;
			this._lastMouseTime = time;
			this._lastMouseButton = button;

			if (button === 1) {
				this._isMouseDown = true;
				if (sameButton && timeDiff <= this._clickTime && deltaX <= this._clickDist && deltaY <= this._clickDist) {
					this._clickCount++;
				} else {
					this._clickCount = 1;
				}
			}
			if (this.isListening("MouseDown")) { //$NON-NLS-0$
				var mouseEvent = this._createMouseEvent("MouseDown", e); //$NON-NLS-0$
				this.onMouseDown(mouseEvent);
				if (mouseEvent.defaultPrevented) {
					e.preventDefault();
					return;
				}
			}
			if (button === 1) {
				if (this._handleMouse(e) && (util.isIE >= 9 || util.isOpera || util.isChrome || util.isSafari || (util.isFirefox && !this._overlayDiv))) {
					if (!this._hasFocus) {
						this.focus();
					}
					e.preventDefault();
				}
			}
			if (util.isFirefox && this._lastMouseButton === 3) {
				// We need to update the DOM selection, because on
				// right-click the caret moves to the mouse location.
				// See bug 366312 and 376508.
				this._updateDOMSelection();
			}
		},
		_handleMouseOver: function (e) {
			if (this._animation) { return; }
			if (this.isListening("MouseOver")) { //$NON-NLS-0$
				this.onMouseOver(this._createMouseEvent("MouseOver", e)); //$NON-NLS-0$
			}
		},
		_handleMouseOut: function (e) {
			if (this._animation) { return; }
			if (this.isListening("MouseOut")) { //$NON-NLS-0$
				this.onMouseOut(this._createMouseEvent("MouseOut", e)); //$NON-NLS-0$
			}
		},
		_handleMouseMove: function (e) {
			if (this._animation) { return; }
			var inClient = this._isClientDiv(e);
			if (this.isListening("MouseMove")) { //$NON-NLS-0$
				if (inClient){
					this.onMouseMove(this._createMouseEvent("MouseMove", e)); //$NON-NLS-0$
				}
			}
			if (this._dropTarget) {
				return;
			}
			/*
			* Bug in IE9. IE sends one mouse event when the user changes the text by
			* pasting or undo.  These operations usually happen with the Ctrl key
			* down which causes the view to enter link mode.  Link mode does not end
			* because there are no further events.  The fix is to only enter link
			* mode when the coordinates of the mouse move event have changed.
			*/
			var changed = this._linksVisible || this._lastMouseMoveX !== e.clientX || this._lastMouseMoveY !== e.clientY;
			this._lastMouseMoveX = e.clientX;
			this._lastMouseMoveY = e.clientY;
			this._setLinksVisible(changed && !this._isMouseDown && (util.isMac ? e.metaKey : e.ctrlKey));

			/*
			* Feature in IE8 and older, the sequence of events in the IE8 event model
			* for a doule-click is:
			*
			*	down
			*	up
			*	up
			*	dblclick
			*
			* Given that the mouse down/up events are not balanced, it is not possible to
			* grab on mouse down and ungrab on mouse up.  The fix is to grab on the first
			* mouse down and ungrab on mouse move when the button 1 is not set.
			*
			* In order to detect double-click and drag gestures, it is necessary to send
			* a mouse down event from mouse move when the button is still down and isMouseDown
			* flag is not set.
			*/
			if (!this._isW3CEvents) {
				if (e.button === 0) {
					this._setGrab(null);
					return true;
				}
				if (!this._isMouseDown && e.button === 1 && (this._clickCount & 1) !== 0 && inClient) {
					this._clickCount = 2;
					return this._handleMouse(e, this._clickCount);
				}
			}
			if (!this._isMouseDown || this._dragOffset !== -1) {
				return;
			}
			
			var x = e.clientX;
			var y = e.clientY;
			var viewPad = this._getViewPadding();
			var viewRect = this._viewDiv.getBoundingClientRect();
			var width = this._getClientWidth (), height = this._getClientHeight();
			var leftEdge = viewRect.left + viewPad.left;
			var topEdge = viewRect.top + viewPad.top;
			var rightEdge = viewRect.left + viewPad.left + width;
			var bottomEdge = viewRect.top + viewPad.top + height;
			var model = this._model;
			var caretLine = model.getLineAtOffset(this._getSelection().getCaret());
			if (y < topEdge && caretLine !== 0) {
				this._doAutoScroll("up", x, y - topEdge); //$NON-NLS-0$
			} else if (y > bottomEdge && caretLine !== model.getLineCount() - 1) {
				this._doAutoScroll("down", x, y - bottomEdge); //$NON-NLS-0$
			} else if (x < leftEdge && !this._wrapMode) {
				this._doAutoScroll("left", x - leftEdge, y); //$NON-NLS-0$
			} else if (x > rightEdge && !this._wrapMode) {
				this._doAutoScroll("right", x - rightEdge, y); //$NON-NLS-0$
			} else {
				this._endAutoScroll();
				this._setSelectionTo(x, y, true);
			}
		},
		_isClientDiv: function(e) {
			var topNode = this._overlayDiv || this._clientDiv;
			var temp = e.target ? e.target : e.srcElement;
			while (temp) {
				if (topNode === temp) {
					return true;
				}
				temp = temp.parentNode;
			}
			return false;
		},
		_createMouseEvent: function(type, e) {
			var pt = this.convert({x: e.clientX, y: e.clientY}, "page", "document"); //$NON-NLS-1$ //$NON-NLS-0$
			return {
				type: type,
				event: e,
				clickCount: this._clickCount,
				x: pt.x,
				y: pt.y,
				preventDefault: function() {
					this.defaultPrevented = true;
				}
			};
		},
		_handleMouseUp: function (e) {
			var left = e.which ? e.button === 0 : e.button === 1;
			if (this.isListening("MouseUp")) { //$NON-NLS-0$
				if (this._isClientDiv(e) || (left && this._isMouseDown)) {
					this.onMouseUp(this._createMouseEvent("MouseUp", e)); //$NON-NLS-0$
				}
			}
			if (this._linksVisible) {
				return;
			}
			if (left && this._isMouseDown) {
				if (this._dragOffset !== -1) {
					var selection = this._getSelection();
					selection.extend(this._dragOffset);
					selection.collapse();
					this._setSelection(selection, true, true);
					this._dragOffset = -1;
				}
				this._isMouseDown = false;
				this._endAutoScroll();
				
				/*
				* Feature in IE8 and older, the sequence of events in the IE8 event model
				* for a doule-click is:
				*
				*	down
				*	up
				*	up
				*	dblclick
				*
				* Given that the mouse down/up events are not balanced, it is not possible to
				* grab on mouse down and ungrab on mouse up.  The fix is to grab on the first
				* mouse down and ungrab on mouse move when the button 1 is not set.
				*/
				if (this._isW3CEvents) { this._setGrab(null); }

				/*
				* Note that there cases when Firefox sets the DOM selection in mouse up.
				* This happens for example after a cancelled drag operation.
				*
				* Note that on Chrome and IE, the caret stops blicking if mouse up is
				* prevented.
				*/
				if (util.isFirefox) {
					e.preventDefault();
				}
			}
		},
		_handleMouseWheel: function (e) {
			var lineHeight = this._getLineHeight();
			var pixelX = 0, pixelY = 0;
			// Note: On the Mac the correct behaviour is to scroll by pixel.
			if (util.isIE || util.isOpera) {
				pixelY = (-e.wheelDelta / 40) * lineHeight;
			} else if (util.isFirefox) {
				var pixel;
				if (util.isMac) {
					pixel = e.detail * 3;
				} else {
					var limit = 256;
					pixel = Math.max(-limit, Math.min(limit, e.detail)) * lineHeight;
				}
				if (e.axis === e.HORIZONTAL_AXIS) {
					pixelX = pixel;
				} else {
					pixelY = pixel;
				}
			} else {
				//Webkit
				if (util.isMac) {
					/*
					* In Safari, the wheel delta is a multiple of 120. In order to
					* convert delta to pixel values, it is necessary to divide delta
					* by 40.
					*
					* In Chrome and Safari 5, the wheel delta depends on the type of the
					* mouse. In general, it is the pixel value for Mac mice and track pads,
					* but it is a multiple of 120 for other mice. There is no presise
					* way to determine if it is pixel value or a multiple of 120.
					* 
					* Note that the current approach does not calculate the correct
					* pixel value for Mac mice when the delta is a multiple of 120.
					*/
					var denominatorX = 40, denominatorY = 40;
					if (e.wheelDeltaX % 120 !== 0) { denominatorX = 1; }
					if (e.wheelDeltaY % 120 !== 0) { denominatorY = 1; }
					pixelX = -e.wheelDeltaX / denominatorX;
					if (-1 < pixelX && pixelX < 0) { pixelX = -1; }
					if (0 < pixelX && pixelX < 1) { pixelX = 1; }
					pixelY = -e.wheelDeltaY / denominatorY;
					if (-1 < pixelY && pixelY < 0) { pixelY = -1; }
					if (0 < pixelY && pixelY < 1) { pixelY = 1; }
				} else {
					pixelX = -e.wheelDeltaX;
					var linesToScroll = 8;
					pixelY = (-e.wheelDeltaY / 120 * linesToScroll) * lineHeight;
				}
			}
			/* 
			* Feature in Safari. If the event target is removed from the DOM 
			* safari stops smooth scrolling. The fix is keep the element target
			* in the DOM and remove it on a later time. 
			*
			* Note: Using a timer is not a solution, because the timeout needs to
			* be at least as long as the gesture (which is too long).
			*/
			if (util.isSafari) {
				var lineDiv = e.target;
				while (lineDiv && lineDiv.lineIndex === undefined) {
					lineDiv = lineDiv.parentNode;
				}
				this._mouseWheelLine = lineDiv;
			}
			var oldScroll = this._getScroll();
			this._scrollView(pixelX, pixelY);
			var newScroll = this._getScroll();
			if (oldScroll.x !== newScroll.x || oldScroll.y !== newScroll.y) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handlePaste: function (e) {
			if (this._ignorePaste) { return; }
			if (this._doPaste(e)) {
				if (util.isIE) {
					/*
					 * Bug in IE,  
					 */
					var self = this;
					this._ignoreFocus = true;
					var window = this._getWindow();
					window.setTimeout(function() {
						self._updateDOMSelection();
						self._ignoreFocus = false;
					}, 0);
				}
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleResize: function (e) {
			var newWidth = this._parent.clientWidth;
			var newHeight = this._parent.clientHeight;
			if (this._parentWidth !== newWidth || this._parentHeight !== newHeight) {
				if (this._parentWidth !== newWidth) {
					this._resetLineHeight();
				}
				this._parentWidth = newWidth;
				this._parentHeight = newHeight;
				/*
				* Feature in IE7. For some reason, sometimes Internet Explorer 7 
				* returns incorrect values for element.getBoundingClientRect() when 
				* inside a resize handler. The fix is to queue the work.
				*/
				if (util.isIE < 9) {
					this._queueUpdate();
				} else {
					this._update();
				}
			}
		},
		_handleRulerEvent: function (e) {
			var target = e.target ? e.target : e.srcElement;
			var lineIndex = target.lineIndex;
			var element = target;
			while (element && !element._ruler) {
				if (lineIndex === undefined && element.lineIndex !== undefined) {
					lineIndex = element.lineIndex;
				}
				element = element.parentNode;
			}
			var ruler = element ? element._ruler : null;
			if (lineIndex === undefined && ruler && ruler.getOverview() === "document") { //$NON-NLS-0$
				var clientHeight = this._getClientHeight ();
				var lineCount = this._model.getLineCount ();
				var viewPad = this._getViewPadding();
				var viewRect = this._viewDiv.getBoundingClientRect();
				var trackHeight = clientHeight + viewPad.top + viewPad.bottom - 2 * this._metrics.scrollWidth;
				lineIndex = Math.floor(((e.clientY - viewRect.top) - this._metrics.scrollWidth) * lineCount / trackHeight);
				if (!(0 <= lineIndex && lineIndex < lineCount)) {
					lineIndex = undefined;
				}
			}
			if (ruler) {
				switch (e.type) {
					case "click": //$NON-NLS-0$
						if (ruler.onClick) { ruler.onClick(lineIndex, e); }
						break;
					case "dblclick": //$NON-NLS-0$
						if (ruler.onDblClick) { ruler.onDblClick(lineIndex, e); }
						break;
					case "mousemove": //$NON-NLS-0$
						if (ruler.onMouseMove) { ruler.onMouseMove(lineIndex, e); }
						break;
					case "mouseover": //$NON-NLS-0$
						if (ruler.onMouseOver) { ruler.onMouseOver(lineIndex, e); }
						break;
					case "mouseout": //$NON-NLS-0$
						if (ruler.onMouseOut) { ruler.onMouseOut(lineIndex, e); }
						break;
				}
			}
		},
		_handleScroll: function () {
			var scroll = this._getScroll(false);
			var oldX = this._hScroll;
			var oldY = this._vScroll;
			if (oldX !== scroll.x || oldY !== scroll.y) {
				this._hScroll = scroll.x;
				this._vScroll = scroll.y;
				this._commitIME();
				this._update(oldY === scroll.y);
				var e = {
					type: "Scroll", //$NON-NLS-0$
					oldValue: {x: oldX, y: oldY},
					newValue: scroll
				};
				this.onScroll(e);
			}
		},
		_handleSelectStart: function (e) {
			if (this._ignoreSelect) {
				if (e && e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_getModelOffset: function(node, offset) {
			if (!node) { return; }
			var lineNode;
			if (node.tagName === "DIV") { //$NON-NLS-0$
				lineNode = node;
			} else {
				lineNode = node.parentNode.parentNode;
			}
			var lineOffset = 0;
			var lineIndex = lineNode.lineIndex;
			if (node.tagName !== "DIV") { //$NON-NLS-0$
				var child = lineNode.firstChild;
				while (child) {
					var textNode = child.firstChild;
					if (textNode === node) {
						if (child.ignoreChars) { lineOffset -= child.ignoreChars; }
						lineOffset += offset;
						break;
					}
					if (child.ignoreChars) { lineOffset -= child.ignoreChars; }
					lineOffset += textNode.data.length;
					child = child.nextSibling;
				}
			}
			return Math.max(0, lineOffset) + this._model.getLineStart(lineIndex);
		},
		_updateSelectionFromDOM: function() {
			var window = this._getWindow();
			var selection = window.getSelection();
			var start = this._getModelOffset(selection.anchorNode, selection.anchorOffset);
			var end = this._getModelOffset(selection.focusNode, selection.focusOffset);
			if (start === undefined || end === undefined) {
			    return;
			}
			this._setSelection(new Selection(start, end), false, false);
		},
		_handleSelectionChange: function (e) {
			if (this._imeOffset !== -1) {
				return;
			}
			/*
			 * Feature in Android. The selection handles are hidden when the DOM changes. Sending
			 * selection events to the application while the user is moving the selection handles
			 * may hide the handles unexpectedly.  The fix is to delay updating the selection and
			 * sending the event to the application.
			 */
			if (util.isAndroid) {
				var window = this._getWindow();
				if (this._selTimer) {
					window.clearTimeout(this._selTimer);
				}
				var that = this;
				this._selTimer = window.setTimeout(function() {
					if (!that._clientDiv) { return; }
					that._selTimer = null; 
					that._updateSelectionFromDOM();
				}, 250);
			} else {
				this._updateSelectionFromDOM();
			}
		},
		_handleTextInput: function (e) {
			this._imeOffset = -1;
			if (util.isAndroid) {
				var selection = this._getWindow().getSelection();
				var temp = selection.anchorNode;
				while (temp) {
					if (temp.lineIndex !== undefined) {
						break;
					}
					temp = temp.parentNode;
				}
				if (temp) {
					var model = this._model;
					var lineIndex = temp.lineIndex;
					var oldText = model.getLine(lineIndex), text = oldText;
					var offset = 0;
					var lineStart = model.getLineStart(lineIndex);
					if (selection.rangeCount > 0) {
						selection.getRangeAt(0).deleteContents();
						var node = temp.ownerDocument.createTextNode(e.data);
						selection.getRangeAt(0).insertNode(node);
						var nodeText = this._getDOMText(temp, node);
						text = nodeText.text;
						offset = nodeText.offset;
						node.parentNode.removeChild(node);
					}
					temp.lineRemoved = true;
					
					var start = 0;
					while (oldText.charCodeAt(start) === text.charCodeAt(start) && start < offset) {
						start++;
					}
		
					var end = oldText.length - 1, delta = text.length - oldText.length;
					while (oldText.charCodeAt(end) === text.charCodeAt(end + delta) && end + delta >= offset + e.data.length) {
						end--;
					}
					end++;
					
					var deltaText = text.substring(start, end + delta);
					start += lineStart;
					end += lineStart;
					
					this._modifyContent({text: deltaText, start: start, end: end, _ignoreDOMSelection: true}, true);
				}
			} else {
				this._doContent(e.data);
			}
			e.preventDefault();
		},
		_handleTouchStart: function (e) {
			this._commitIME();
			var window = this._getWindow();
			if (this._touchScrollTimer) {
				this._vScrollDiv.style.display = "none"; //$NON-NLS-0$
				this._hScrollDiv.style.display = "none"; //$NON-NLS-0$
				window.clearInterval(this._touchScrollTimer);
				this._touchScrollTimer = null;
			}
			var touches = e.touches;
			if (touches.length === 1) {
				var touch = touches[0];
				var x = touch.clientX, y = touch.clientY;
				this._touchStartX = x;
				this._touchStartY = y;
				if (util.isAndroid) {
					/*
					* Bug in Android 4.  The clientX/Y coordinates of the touch events
					* include the page scrolling offsets.
					*/
				    if (y < (touch.pageY - window.pageYOffset) || x < (touch.pageX - window.pageXOffset) ) {
						x = touch.pageX - window.pageXOffset;
						y = touch.pageY - window.pageYOffset;
				    }
				}
				var pt = this.convert({x: x, y: y}, "page", "document"); //$NON-NLS-1$ //$NON-NLS-0$
				this._lastTouchOffset = this.getOffsetAtLocation(pt.x, pt.y);
				this._touchStartTime = e.timeStamp;
				this._touching = true;
			}
		},
		_handleTouchMove: function (e) {
			var touches = e.touches;
			if (touches.length === 1) {
				var touch = touches[0];
				this._touchCurrentX = touch.clientX;
				this._touchCurrentY = touch.clientY;
				var interval = 10;
				if (!this._touchScrollTimer && (e.timeStamp - this._touchStartTime) < (interval*20)) {
					this._vScrollDiv.style.display = "block"; //$NON-NLS-0$
					if (!this._wrapMode) {
						this._hScrollDiv.style.display = "block"; //$NON-NLS-0$
					}
					var self = this;
					var window = this._getWindow();
					this._touchScrollTimer = window.setInterval(function() {
						var deltaX = 0, deltaY = 0;
						if (self._touching) {
							deltaX = self._touchStartX - self._touchCurrentX;
							deltaY = self._touchStartY - self._touchCurrentY;
							self._touchSpeedX = deltaX / interval;
							self._touchSpeedY = deltaY / interval;
							self._touchStartX = self._touchCurrentX;
							self._touchStartY = self._touchCurrentY;
						} else {
							if (Math.abs(self._touchSpeedX) < 0.1 && Math.abs(self._touchSpeedY) < 0.1) {
								self._vScrollDiv.style.display = "none"; //$NON-NLS-0$
								self._hScrollDiv.style.display = "none"; //$NON-NLS-0$
								window.clearInterval(self._touchScrollTimer);
								self._touchScrollTimer = null;
								return;
							} else {
								deltaX = self._touchSpeedX * interval;
								deltaY = self._touchSpeedY * interval;
								self._touchSpeedX *= 0.95;
								self._touchSpeedY *= 0.95;
							}
						}
						self._scrollView(deltaX, deltaY);
					}, interval);
				}
				if (this._touchScrollTimer) {
					e.preventDefault();
				}
			}
		},
		_handleTouchEnd: function (e) {
			var touches = e.touches;
			if (touches.length === 0) {
				this._touching = false;
			}
		},

		/************************************ Actions ******************************************/
		_doAction: function (e) {
			var keyBindings = this._keyBindings;
			for (var i = 0; i < keyBindings.length; i++) {
				var kb = keyBindings[i];
				if (kb.keyBinding.match(e)) {
					if (kb.actionID) {
						var actions = this._actions;
						var action = actions[kb.actionID];
						if (action) {
							if (action.handler) {
								if (!action.handler()) {
									if (action.defaultHandler) {
										return typeof(action.defaultHandler()) === "boolean"; //$NON-NLS-0$
									} else {
										return false;
									}
								} else {
									// Firefox feature. without this else branch execution goes into the else branch above 
									// and defaults are *not* prevented
								}
							} else if (action.defaultHandler) {
								return typeof(action.defaultHandler()) === "boolean"; //$NON-NLS-0$
							}
						}
					}
					return true;
				}
			}
			return false;
		},
		_doBackspace: function (args) {
			var selection = this._getSelection();
			if (selection.isEmpty()) {
				var model = this._model;
				var caret = selection.getCaret();
				var lineIndex = model.getLineAtOffset(caret);
				var lineStart = model.getLineStart(lineIndex);
				if (caret === lineStart) {
					if (lineIndex > 0) {
						selection.extend(model.getLineEnd(lineIndex - 1));
					}
				} else {
					var removeTab = false;
					if (this._expandTab && args.unit === "character" && (caret - lineStart) % this._tabSize === 0) { //$NON-NLS-0$
						var lineText = model.getText(lineStart, caret);
						removeTab = !/[^ ]/.test(lineText); // Only spaces between line start and caret.
					}
					if (removeTab) {
						selection.extend(caret - this._tabSize);
					} else {
						var line = this._getLine(lineIndex);
						selection.extend(line.getNextOffset(caret, args.unit, -1));
						line.destroy();
					}
				}
			}
			this._modifyContent({text: "", start: selection.start, end: selection.end}, true);
			return true;
		},
		_doContent: function (text) {
			var selection = this._getSelection();
			this._modifyContent({text: text, start: selection.start, end: selection.end, _ignoreDOMSelection: true}, true);
		},
		_doCopy: function (e) {
			var selection = this._getSelection();
			if (!selection.isEmpty()) {
				var text = this._getBaseText(selection.start, selection.end);
				return this._setClipboardText(text, e);
			}
			return true;
		},
		_doCursorNext: function (args) {
			if (!args.select) {
				if (this._clearSelection("next")) { return true; } //$NON-NLS-0$
			}
			var model = this._model;
			var selection = this._getSelection();
			var caret = selection.getCaret();
			var lineIndex = model.getLineAtOffset(caret);
			if (caret === model.getLineEnd(lineIndex)) {
				if (lineIndex + 1 < model.getLineCount()) {
					selection.extend(model.getLineStart(lineIndex + 1));
				}
			} else {
				var line = this._getLine(lineIndex);
				selection.extend(line.getNextOffset(caret, args.unit, 1));
				line.destroy();
			}
			if (!args.select) { selection.collapse(); }
			this._setSelection(selection, true);
			return true;
		},
		_doCursorPrevious: function (args) {
			if (!args.select) {
				if (this._clearSelection("previous")) { return true; } //$NON-NLS-0$
			}
			var model = this._model;
			var selection = this._getSelection();
			var caret = selection.getCaret();
			var lineIndex = model.getLineAtOffset(caret);
			if (caret === model.getLineStart(lineIndex)) {
				if (lineIndex > 0) {
					selection.extend(model.getLineEnd(lineIndex - 1));
				}
			} else {
				var line = this._getLine(lineIndex);
				selection.extend(line.getNextOffset(caret, args.unit, -1));
				line.destroy();
			}
			if (!args.select) { selection.collapse(); }
			this._setSelection(selection, true);
			return true;
		},
		_doCut: function (e) {
			var selection = this._getSelection();
			if (!selection.isEmpty()) {
				var text = this._getBaseText(selection.start, selection.end);
				this._doContent("");
				return this._setClipboardText(text, e);
			}
			return true;
		},
		_doDelete: function (args) {
			var selection = this._getSelection();
			if (selection.isEmpty()) {
				var model = this._model;
				var caret = selection.getCaret();
				var lineIndex = model.getLineAtOffset(caret);
				if (caret === model.getLineEnd (lineIndex)) {
					if (lineIndex + 1 < model.getLineCount()) {
						selection.extend(model.getLineStart(lineIndex + 1));
					}
				} else {
					var line = this._getLine(lineIndex);
					selection.extend(line.getNextOffset(caret, args.unit, 1));
					line.destroy();
				}
			}
			this._modifyContent({text: "", start: selection.start, end: selection.end}, true);
			return true;
		},
		_doEnd: function (args) {
			var selection = this._getSelection();
			var model = this._model;
			var callback;
			if (args.ctrl) {
				selection.extend(model.getCharCount());
				callback = function() {};
			} else {
				var offset = selection.getCaret();
				var lineIndex = model.getLineAtOffset(offset);
				if (this._wrapMode) {
					var line = this._getLine(lineIndex);
					var visualIndex = line.getLineIndex(offset);
					if (visualIndex === line.getLineCount() - 1) {
						offset = model.getLineEnd(lineIndex);
					} else {
						offset = line.getLineStart(visualIndex + 1) - 1;
					}
					line.destroy();
				} else {
					offset = model.getLineEnd(lineIndex);
				}
				selection.extend(offset);
			}
			if (!args.select) { selection.collapse(); }
			this._setSelection(selection, true, true, callback);
			return true;
		},
		_doEnter: function (args) {
			var model = this._model;
			var selection = this._getSelection();
			this._doContent(model.getLineDelimiter()); 
			if (args && args.noCursor) {
				selection.end = selection.start;
				this._setSelection(selection, true);
			}
			return true;
		},
		_doHome: function (args) {
			var selection = this._getSelection();
			var model = this._model;
			var callback;
			if (args.ctrl) {
				selection.extend(0);
				callback = function() {};
			} else {
				var offset = selection.getCaret();
				var lineIndex = model.getLineAtOffset(offset);
				if (this._wrapMode) {
					var line = this._getLine(lineIndex);
					var visualIndex = line.getLineIndex(offset);
					offset = line.getLineStart(visualIndex);
					line.destroy();
				} else {
					offset = model.getLineStart(lineIndex);
				}
				selection.extend(offset); 
			}
			if (!args.select) { selection.collapse(); }
			this._setSelection(selection, true, true, callback);
			return true;
		},
		_doLineDown: function (args) {
			var model = this._model;
			var selection = this._getSelection();
			var caret = selection.getCaret();
			var lineIndex = model.getLineAtOffset(caret), visualIndex;
			var line = this._getLine(lineIndex);
			var x = this._columnX, y = 1, lastLine = false;
			if (x === -1 || args.wholeLine || (args.select && util.isIE)) {
				var offset = args.wholeLine ? model.getLineEnd(lineIndex + 1) : caret;
				x = line.getBoundingClientRect(offset).left;
			}
			if ((visualIndex = line.getLineIndex(caret)) < line.getLineCount() - 1) {
				y = line.getClientRects(visualIndex + 1).top + 1;
			} else {
				lastLine = lineIndex === model.getLineCount() - 1;
				lineIndex++;
			}
			if (lastLine) {
				if (args.select) {
					selection.extend(model.getCharCount());
					this._setSelection(selection, true, true);
				}
			} else {
				if (line.lineIndex !== lineIndex) {
					line.destroy();
					line = this._getLine(lineIndex);
				}
				selection.extend(line.getOffset(x, y));
				if (!args.select) { selection.collapse(); }
				this._setSelection(selection, true, true);
			}
			this._columnX = x;
			line.destroy();
			return true;
		},
		_doLineUp: function (args) {
			var model = this._model;
			var selection = this._getSelection();
			var caret = selection.getCaret();
			var lineIndex = model.getLineAtOffset(caret), visualIndex;
			var line = this._getLine(lineIndex);
			var x = this._columnX, firstLine = false, y;
			if (x === -1 || args.wholeLine || (args.select && util.isIE)) {
				var offset = args.wholeLine ? model.getLineStart(lineIndex - 1) : caret;
				x = line.getBoundingClientRect(offset).left;
			}
			if ((visualIndex = line.getLineIndex(caret)) > 0) {
				y = line.getClientRects(visualIndex - 1).top + 1;
			} else {
				firstLine = lineIndex === 0;
				if (!firstLine) {
					lineIndex--;
					y = this._getLineHeight(lineIndex) - 1;
				}
			}
			if (firstLine) {
				if (args.select) {
					selection.extend(0);
					this._setSelection(selection, true, true);
				}
			} else {
				if (line.lineIndex !== lineIndex) {
					line.destroy();
					line = this._getLine(lineIndex);
				}
				selection.extend(line.getOffset(x, y));
				if (!args.select) { selection.collapse(); }
				this._setSelection(selection, true, true);
			}
			this._columnX = x;
			line.destroy();
			return true;
		},
		_doPageDown: function (args) {
			var self = this;
			var model = this._model;
			var selection = this._getSelection();
			var caret = selection.getCaret();
			var caretLine = model.getLineAtOffset(caret);
			var lineCount = model.getLineCount();
			var scroll = this._getScroll();
			var clientHeight = this._getClientHeight(), x, line;
			if (this._lineHeight) {
				x = this._columnX;
				var caretRect = this._getBoundsAtOffset(caret);
				if (x === -1 || (args.select && util.isIE)) {
					x = caretRect.left;
				}
				var lineIndex = this._getLineIndex(caretRect.top + clientHeight);
				line = this._getLine(lineIndex);
				var linePixel = this._getLinePixel(lineIndex);
				var y = caretRect.top + clientHeight - linePixel;
				caret = line.getOffset(x, y);
				var rect = line.getBoundingClientRect(caret);
				line.destroy();
				selection.extend(caret);
				if (!args.select) { selection.collapse(); }
				this._setSelection(selection, true, true, function() {
					self._columnX = x;
				}, rect.top + linePixel - caretRect.top);
				return true;
			}
			if (caretLine < lineCount - 1) {
				var lineHeight = this._getLineHeight();
				var lines = Math.floor(clientHeight / lineHeight);
				var scrollLines = Math.min(lineCount - caretLine - 1, lines);
				scrollLines = Math.max(1, scrollLines);
				x = this._columnX;
				if (x === -1 || (args.select && util.isIE)) {
					line = this._getLine(caretLine);
					x = line.getBoundingClientRect(caret).left;
					line.destroy();
				}
				line = this._getLine(caretLine + scrollLines);
				selection.extend(line.getOffset(x, 0));
				line.destroy();
				if (!args.select) { selection.collapse(); }
				var verticalMaximum = lineCount * lineHeight;
				var scrollOffset = scroll.y + scrollLines * lineHeight;
				if (scrollOffset + clientHeight > verticalMaximum) {
					scrollOffset = verticalMaximum - clientHeight;
				}
				this._setSelection(selection, true, true, function() {
					self._columnX = x;
				}, scrollOffset - scroll.y);
			}
			return true;
		},
		_doPageUp: function (args) {
			var self = this;
			var model = this._model;
			var selection = this._getSelection();
			var caret = selection.getCaret();
			var caretLine = model.getLineAtOffset(caret);
			var scroll = this._getScroll();
			var clientHeight = this._getClientHeight(), x, line;
			if (this._lineHeight) {
				x = this._columnX;
				var caretRect = this._getBoundsAtOffset(caret);
				if (x === -1 || (args.select && util.isIE)) {
					x = caretRect.left;
				}
				var lineIndex = this._getLineIndex(caretRect.bottom - clientHeight);
				line = this._getLine(lineIndex);
				var linePixel = this._getLinePixel(lineIndex);
				var y = (caretRect.bottom - clientHeight) - linePixel;
				caret = line.getOffset(x, y);
				var rect = line.getBoundingClientRect(caret);
				line.destroy();
				selection.extend(caret);
				if (!args.select) { selection.collapse(); }
				this._setSelection(selection, true, true, function() {
					self._columnX = x;
				}, rect.top + linePixel - caretRect.top);
				return true;
			}
			if (caretLine > 0) {
				var lineHeight = this._getLineHeight();
				var lines = Math.floor(clientHeight / lineHeight);
				var scrollLines = Math.max(1, Math.min(caretLine, lines));
				x = this._columnX;
				if (x === -1 || (args.select && util.isIE)) {
					line = this._getLine(caretLine);
					x = line.getBoundingClientRect(caret).left;
					line.destroy();
				}
				line = this._getLine(caretLine - scrollLines);
				selection.extend(line.getOffset(x, this._getLineHeight(caretLine - scrollLines) - 1));
				line.destroy();
				if (!args.select) { selection.collapse(); }
				var scrollOffset = Math.max(0, scroll.y - scrollLines * lineHeight);
				this._setSelection(selection, true, true, function() {
					self._columnX = x;
				}, scrollOffset - scroll.y);
			}
			return true;
		},
		_doPaste: function(e) {
			var self = this;
			var result = this._getClipboardText(e, function(text) {
				if (text) {
					if (util.isLinux && self._lastMouseButton === 2) {
						var timeDiff = new Date().getTime() - self._lastMouseTime;
						if (timeDiff <= self._clickTime) {
							self._setSelectionTo(self._lastMouseX, self._lastMouseY);
						}
					}
					self._doContent(text);
				}
			});
			return result !== null;
		},
		_doScroll: function (args) {
			var type = args.type;
			var model = this._model;
			var lineCount = model.getLineCount();
			var clientHeight = this._getClientHeight();
			var lineHeight = this._getLineHeight();
			var verticalMaximum = lineCount * lineHeight;
			var verticalScrollOffset = this._getScroll().y;
			var pixel;
			switch (type) {
				case "textStart": pixel = 0; break; //$NON-NLS-0$
				case "textEnd": pixel = verticalMaximum - clientHeight; break; //$NON-NLS-0$
				case "pageDown": pixel = verticalScrollOffset + clientHeight; break; //$NON-NLS-0$
				case "pageUp": pixel = verticalScrollOffset - clientHeight; break; //$NON-NLS-0$
				case "lineDown": pixel = verticalScrollOffset + lineHeight; break; //$NON-NLS-0$
				case "lineUp": pixel = verticalScrollOffset - lineHeight; break; //$NON-NLS-0$
				case "centerLine": //$NON-NLS-0$
					var selection = this._getSelection();
					var lineStart = model.getLineAtOffset(selection.start);
					var lineEnd = model.getLineAtOffset(selection.end);
					var selectionHeight = (lineEnd - lineStart + 1) * lineHeight;
					pixel = (lineStart * lineHeight) - (clientHeight / 2) + (selectionHeight / 2);
					break;
			}
			if (pixel !== undefined) {
				pixel = Math.min(Math.max(0, pixel), verticalMaximum - clientHeight);
				this._scrollViewAnimated(0, pixel - verticalScrollOffset, function() {});
			}
			return true;
		},
		_doSelectAll: function (args) {
			var model = this._model;
			var selection = this._getSelection();
			selection.setCaret(0);
			selection.extend(model.getCharCount());
			this._setSelection(selection, false);
			return true;
		},
		_doTab: function (args) {
			if(!this._tabMode || this._readonly) { return; }
			var text = "\t"; //$NON-NLS-0$
			if (this._expandTab) {
				var model = this._model;
				var caret = this._getSelection().getCaret();
				var lineIndex = model.getLineAtOffset(caret);
				var lineStart = model.getLineStart(lineIndex);
				var spaces = this._tabSize - ((caret - lineStart) % this._tabSize);
				text = (new Array(spaces + 1)).join(" "); //$NON-NLS-0$
			}
			this._doContent(text);
			return true;
		},
		_doShiftTab: function (args) {
			if(!this._tabMode || this._readonly) { return; }
			return true;
		},
		_doTabMode: function (args) {
			this._tabMode = !this._tabMode;
			return true;
		},
		_doWrapMode: function (args) {
			this.setOptions({wrapMode: !this.getOptions("wrapMode")}); //$NON-NLS-0$
			return true;
		},
		
		/************************************ Internals ******************************************/
		_autoScroll: function () {
			var selection = this._getSelection();
			var pt = this.convert({x: this._autoScrollX, y: this._autoScrollY}, "page", "document"); //$NON-NLS-1$ //$NON-NLS-0$
			var caret = selection.getCaret();
			var caretLine = this._model.getLineAtOffset(caret), lineIndex, line;
			if (this._autoScrollDir === "up" || this._autoScrollDir === "down") { //$NON-NLS-1$ //$NON-NLS-0$
				var scroll = this._autoScrollY / this._getLineHeight();
				scroll = scroll < 0 ? Math.floor(scroll) : Math.ceil(scroll);
				lineIndex = caretLine;
				lineIndex = Math.max(0, Math.min(this._model.getLineCount() - 1, lineIndex + scroll));
			} else if (this._autoScrollDir === "left" || this._autoScrollDir === "right") { //$NON-NLS-1$ //$NON-NLS-0$
				lineIndex = this._getLineIndex(pt.y);
				line = this._getLine(caretLine); 
				pt.x += line.getBoundingClientRect(caret, false).left;
				line.destroy();
			}
			line = this._getLine(lineIndex); 
			selection.extend(line.getOffset(pt.x, pt.y - this._getLinePixel(lineIndex)));
			line.destroy();
			this._setSelection(selection, true);
		},
		_autoScrollTimer: function () {
			this._autoScroll();
			var self = this;
			var window = this._getWindow();
			this._autoScrollTimerID = window.setTimeout(function () {self._autoScrollTimer();}, this._AUTO_SCROLL_RATE);
		},
		_calculateLineHeightTimer: function(calculate) {
			if (!this._lineHeight) { return; }
			if (this._calculateLHTimer) { return; }
			var lineCount = this._model.getLineCount(), i = 0;
			if (calculate) {
				var c = 0;
				var MAX_TIME = 100;
				var start = new Date().getTime(), firstLine = 0;
				while (i < lineCount) {
					if (!this._lineHeight[i]) {
						c++;
						if (!firstLine) { firstLine = i; }
						this._lineHeight[i] = this._calculateLineHeight(i);
					}
					i++;
					if ((new Date().getTime() - start) > MAX_TIME) {
						break;
					}
				}
				this.redrawRulers(0, lineCount);
				this._queueUpdate();
			}
			var window = this._getWindow();
			if (i !== lineCount) {
				var self = this;
				this._calculateLHTimer = window.setTimeout(function() {
					self._calculateLHTimer = null;
					self._calculateLineHeightTimer(true);
				}, 0);
				return;
			}
			if (this._calculateLHTimer) {
				window.clearTimeout(this._calculateLHTimer);
				this._calculateLHTimer = undefined;
			}
		},
		_calculateLineHeight: function(lineIndex) {
			var line = this._getLine(lineIndex);
			var rect = line.getBoundingClientRect();
			line.destroy();
			return Math.max(1, Math.ceil(rect.bottom - rect.top));
		},
		_calculateMetrics: function() {
			var parent = this._clientDiv;
			var document = parent.ownerDocument;
			var c = " "; //$NON-NLS-0$
			var line = util.createElement(document, "div"); //$NON-NLS-0$
			line.style.lineHeight = "normal"; //$NON-NLS-0$
			var model = this._model;
			var lineText = model.getLine(0);
			var e = {type:"LineStyle", textView: this, 0: 0, lineText: lineText, lineStart: 0}; //$NON-NLS-0$
			this.onLineStyle(e);
			applyStyle(e.style, line);
			line.style.position = "fixed"; //$NON-NLS-0$
			line.style.left = "-1000px"; //$NON-NLS-0$
			var span1 = util.createElement(document, "span"); //$NON-NLS-0$
			span1.appendChild(document.createTextNode(c));
			line.appendChild(span1);
			var span2 = util.createElement(document, "span"); //$NON-NLS-0$
			span2.style.fontStyle = "italic"; //$NON-NLS-0$
			span2.appendChild(document.createTextNode(c));
			line.appendChild(span2);
			var span3 = util.createElement(document, "span"); //$NON-NLS-0$
			span3.style.fontWeight = "bold"; //$NON-NLS-0$
			span3.appendChild(document.createTextNode(c));
			line.appendChild(span3);
			var span4 = util.createElement(document, "span"); //$NON-NLS-0$
			span4.style.fontWeight = "bold"; //$NON-NLS-0$
			span4.style.fontStyle = "italic"; //$NON-NLS-0$
			span4.appendChild(document.createTextNode(c));
			line.appendChild(span4);
			parent.appendChild(line);
			var lineRect = line.getBoundingClientRect();
			var spanRect1 = span1.getBoundingClientRect();
			var spanRect2 = span2.getBoundingClientRect();
			var spanRect3 = span3.getBoundingClientRect();
			var spanRect4 = span4.getBoundingClientRect();
			var h1 = spanRect1.bottom - spanRect1.top;
			var h2 = spanRect2.bottom - spanRect2.top;
			var h3 = spanRect3.bottom - spanRect3.top;
			var h4 = spanRect4.bottom - spanRect4.top;
			var fontStyle = 0;
			var invalid = (lineRect.bottom - lineRect.top) <= 0;
			var lineHeight = Math.max(1, lineRect.bottom - lineRect.top);
			if (h2 > h1) {
				fontStyle = 1;
			}
			if (h3 > h2) {
				fontStyle = 2;
			}
			if (h4 > h3) {
				fontStyle = 3;
			}
			var style;
			if (fontStyle !== 0) {
				style = {style: {}};
				if ((fontStyle & 1) !== 0) {
					style.style.fontStyle = "italic"; //$NON-NLS-0$
				}
				if ((fontStyle & 2) !== 0) {
					style.style.fontWeight = "bold"; //$NON-NLS-0$
				}
			}
			var trim = getLineTrim(line);
			parent.removeChild(line);
			
			// calculate pad and scroll width
			var pad = getPadding(this._viewDiv);
			var div1 = util.createElement(document, "div"); //$NON-NLS-0$
			div1.style.position = "fixed"; //$NON-NLS-0$
			div1.style.left = "-1000px"; //$NON-NLS-0$
			div1.style.paddingLeft = pad.left + "px"; //$NON-NLS-0$
			div1.style.paddingTop = pad.top + "px"; //$NON-NLS-0$
			div1.style.paddingRight = pad.right + "px"; //$NON-NLS-0$
			div1.style.paddingBottom = pad.bottom + "px"; //$NON-NLS-0$
			div1.style.width = "100px"; //$NON-NLS-0$
			div1.style.height = "100px"; //$NON-NLS-0$
			var div2 = util.createElement(document, "div"); //$NON-NLS-0$
			div2.style.width = "100%"; //$NON-NLS-0$
			div2.style.height = "100%"; //$NON-NLS-0$
			div1.appendChild(div2);
			parent.appendChild(div1);
			var rect1 = div1.getBoundingClientRect();
			var rect2 = div2.getBoundingClientRect();
			div1.style.overflow = 'hidden'; //$NON-NLS-0$
			div2.style.height = "200px"; //$NON-NLS-0$
			var w1 = div1.clientWidth;
			div1.style.overflow = 'scroll'; //$NON-NLS-0$
			var w2 = div1.clientWidth;
			parent.removeChild(div1);
			var scrollWidth = w1 - w2;
			pad = {
				left: rect2.left - rect1.left,
				top: rect2.top - rect1.top,
				right: rect1.right - rect2.right,
				bottom: rect1.bottom - rect2.bottom
			};
			return {lineHeight: lineHeight, largestFontStyle: style, lineTrim: trim, viewPadding: pad, scrollWidth: scrollWidth, invalid: invalid};
		},
		_cancelAnimation: function() {
			if (this._animation) {
				this._animation.stop();
				this._animation = null;
			}
		},
		_clearSelection: function (direction) {
			var selection = this._getSelection();
			if (selection.isEmpty()) { return false; }
			if (direction === "next") { //$NON-NLS-0$
				selection.start = selection.end;
			} else {
				selection.end = selection.start;
			}
			this._setSelection(selection, true);
			return true;
		},
		_commitIME: function () {
			if (this._imeOffset === -1) { return; }
			// make the state of the IME match the state the view expects it be in
			// when the view commits the text and IME also need to be committed
			// this can be accomplished by changing the focus around
			this._scrollDiv.focus();
			this._clientDiv.focus();
			
			var model = this._model;
			var lineIndex = model.getLineAtOffset(this._imeOffset);
			var lineStart = model.getLineStart(lineIndex);
			var newText = this._getDOMText(this._getLineNode(lineIndex)).text;
			var oldText = model.getLine(lineIndex);
			var start = this._imeOffset - lineStart;
			var end = start + newText.length - oldText.length;
			if (start !== end) {
				var insertText = newText.substring(start, end);
				this._doContent(insertText);
			}
			this._imeOffset = -1;
		},
		_createActions: function () {
			var KeyBinding = mKeyBinding.KeyBinding;
			//no duplicate keybindings
			var bindings = this._keyBindings = [];

			// Cursor Navigation
			bindings.push({actionID: "lineUp",		keyBinding: new KeyBinding(38), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "lineDown",	keyBinding: new KeyBinding(40), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "charPrevious",	keyBinding: new KeyBinding(37), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "charNext",	keyBinding: new KeyBinding(39), predefined: true}); //$NON-NLS-0$
			if (util.isMac) {
				bindings.push({actionID: "scrollPageUp",		keyBinding: new KeyBinding(33), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "scrollPageDown",	keyBinding: new KeyBinding(34), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "pageUp",		keyBinding: new KeyBinding(33, null, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "pageDown",	keyBinding: new KeyBinding(34, null, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "lineStart",	keyBinding: new KeyBinding(37, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "lineEnd",		keyBinding: new KeyBinding(39, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "wordPrevious",	keyBinding: new KeyBinding(37, null, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "wordNext",	keyBinding: new KeyBinding(39, null, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "scrollTextStart",	keyBinding: new KeyBinding(36), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "scrollTextEnd",		keyBinding: new KeyBinding(35), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "textStart",	keyBinding: new KeyBinding(38, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "textEnd",		keyBinding: new KeyBinding(40, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "scrollPageUp",	keyBinding: new KeyBinding(38, null, null, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "scrollPageDown",		keyBinding: new KeyBinding(40, null, null, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "lineStart",	keyBinding: new KeyBinding(37, null, null, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "lineEnd",		keyBinding: new KeyBinding(39, null, null, null, true), predefined: true}); //$NON-NLS-0$
				//TODO These two actions should be changed to paragraph start and paragraph end  when word wrap is implemented
				bindings.push({actionID: "lineStart",	keyBinding: new KeyBinding(38, null, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "lineEnd",		keyBinding: new KeyBinding(40, null, null, true), predefined: true}); //$NON-NLS-0$
			} else {
				bindings.push({actionID: "pageUp",		keyBinding: new KeyBinding(33), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "pageDown",	keyBinding: new KeyBinding(34), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "lineStart",	keyBinding: new KeyBinding(36), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "lineEnd",		keyBinding: new KeyBinding(35), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "wordPrevious",	keyBinding: new KeyBinding(37, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "wordNext",	keyBinding: new KeyBinding(39, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "textStart",	keyBinding: new KeyBinding(36, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "textEnd",		keyBinding: new KeyBinding(35, true), predefined: true}); //$NON-NLS-0$
			}
			if (util.isFirefox && util.isLinux) {
				bindings.push({actionID: "lineUp",		keyBinding: new KeyBinding(38, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "lineDown",	keyBinding: new KeyBinding(40, true), predefined: true}); //$NON-NLS-0$
			}
			if (util.isWindows) {
				bindings.push({actionID: "scrollLineUp",	keyBinding: new KeyBinding(38, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "scrollLineDown",	keyBinding: new KeyBinding(40, true), predefined: true}); //$NON-NLS-0$
			}

			// Select Cursor Navigation
			bindings.push({actionID: "selectLineUp",		keyBinding: new KeyBinding(38, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectLineDown",		keyBinding: new KeyBinding(40, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectCharPrevious",	keyBinding: new KeyBinding(37, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectCharNext",		keyBinding: new KeyBinding(39, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectPageUp",		keyBinding: new KeyBinding(33, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectPageDown",		keyBinding: new KeyBinding(34, null, true), predefined: true}); //$NON-NLS-0$
			if (util.isMac) {
				bindings.push({actionID: "selectLineStart",	keyBinding: new KeyBinding(37, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectLineEnd",		keyBinding: new KeyBinding(39, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectWordPrevious",	keyBinding: new KeyBinding(37, null, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectWordNext",	keyBinding: new KeyBinding(39, null, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectTextStart",	keyBinding: new KeyBinding(36, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectTextEnd",		keyBinding: new KeyBinding(35, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectTextStart",	keyBinding: new KeyBinding(38, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectTextEnd",		keyBinding: new KeyBinding(40, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectLineStart",	keyBinding: new KeyBinding(37, null, true, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectLineEnd",		keyBinding: new KeyBinding(39, null, true, null, true), predefined: true}); //$NON-NLS-0$
				//TODO These two actions should be changed to select paragraph start and select paragraph end  when word wrap is implemented
				bindings.push({actionID: "selectLineStart",	keyBinding: new KeyBinding(38, null, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectLineEnd",		keyBinding: new KeyBinding(40, null, true, true), predefined: true}); //$NON-NLS-0$
			} else {
				if (util.isLinux) {
					bindings.push({actionID: "selectWholeLineUp",		keyBinding: new KeyBinding(38, true, true), predefined: true}); //$NON-NLS-0$
					bindings.push({actionID: "selectWholeLineDown",		keyBinding: new KeyBinding(40, true, true), predefined: true}); //$NON-NLS-0$
				}
				bindings.push({actionID: "selectLineStart",		keyBinding: new KeyBinding(36, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectLineEnd",		keyBinding: new KeyBinding(35, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectWordPrevious",	keyBinding: new KeyBinding(37, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectWordNext",		keyBinding: new KeyBinding(39, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectTextStart",		keyBinding: new KeyBinding(36, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectTextEnd",		keyBinding: new KeyBinding(35, true, true), predefined: true}); //$NON-NLS-0$
			}
			
			//Undo stack
			bindings.push({actionID: "undo", keyBinding: new mKeyBinding.KeyBinding('z', true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			if (util.isMac) {
				bindings.push({actionID: "redo", keyBinding: new mKeyBinding.KeyBinding('z', true, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			} else {
				bindings.push({actionID: "redo", keyBinding: new mKeyBinding.KeyBinding('y', true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			}

			//Misc
			bindings.push({actionID: "deletePrevious",		keyBinding: new KeyBinding(8), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "deletePrevious",		keyBinding: new KeyBinding(8, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "deleteNext",		keyBinding: new KeyBinding(46), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "deleteWordPrevious",	keyBinding: new KeyBinding(8, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "deleteWordPrevious",	keyBinding: new KeyBinding(8, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "deleteWordNext",		keyBinding: new KeyBinding(46, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "tab",			keyBinding: new KeyBinding(9), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "shiftTab",			keyBinding: new KeyBinding(9, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "enter",			keyBinding: new KeyBinding(13), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "enter",			keyBinding: new KeyBinding(13, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectAll",		keyBinding: new KeyBinding('a', true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "toggleTabMode",	keyBinding: new KeyBinding('m', true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			if (util.isMac) {
				bindings.push({actionID: "deleteNext",		keyBinding: new KeyBinding(46, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "deleteWordPrevious",	keyBinding: new KeyBinding(8, null, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "deleteWordNext",		keyBinding: new KeyBinding(46, null, null, true), predefined: true}); //$NON-NLS-0$
			}
				
			/*
			* Feature in IE/Chrome: prevent ctrl+'u', ctrl+'i', and ctrl+'b' from applying styles to the text.
			*
			* Note that Chrome applies the styles on the Mac with Ctrl instead of Cmd.
			*/
			if (!util.isFirefox) {
				var isMacChrome = util.isMac && util.isChrome;
				bindings.push({actionID: null, keyBinding: new KeyBinding('u', !isMacChrome, false, false, isMacChrome), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: null, keyBinding: new KeyBinding('i', !isMacChrome, false, false, isMacChrome), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: null, keyBinding: new KeyBinding('b', !isMacChrome, false, false, isMacChrome), predefined: true}); //$NON-NLS-0$
			}

			if (util.isFirefox) {
				bindings.push({actionID: "copy", keyBinding: new KeyBinding(45, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "paste", keyBinding: new KeyBinding(45, null, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "cut", keyBinding: new KeyBinding(46, null, true), predefined: true}); //$NON-NLS-0$
			}

			// Add the emacs Control+ ... key bindings.
			if (util.isMac) {
				bindings.push({actionID: "lineStart", keyBinding: new KeyBinding("a", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "lineEnd", keyBinding: new KeyBinding("e", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "lineUp", keyBinding: new KeyBinding("p", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "lineDown", keyBinding: new KeyBinding("n", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "charPrevious", keyBinding: new KeyBinding("b", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "charNext", keyBinding: new KeyBinding("f", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "deletePrevious", keyBinding: new KeyBinding("h", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "deleteNext", keyBinding: new KeyBinding("d", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "deleteLineEnd", keyBinding: new KeyBinding("k", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				if (util.isFirefox) {
					bindings.push({actionID: "scrollPageDown", keyBinding: new KeyBinding("v", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
					bindings.push({actionID: "deleteLineStart", keyBinding: new KeyBinding("u", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
					bindings.push({actionID: "deleteWordPrevious", keyBinding: new KeyBinding("w", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				} else {
					bindings.push({actionID: "pageDown", keyBinding: new KeyBinding("v", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
					bindings.push({actionID: "centerLine", keyBinding: new KeyBinding("l", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
					bindings.push({actionID: "enterNoCursor", keyBinding: new KeyBinding("o", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
					//TODO implement: y (yank), t (transpose)
				}
			}

			//1 to 1, no duplicates
			var self = this;
			this._actions = {
				"lineUp": {defaultHandler: function() {return self._doLineUp({select: false});}}, //$NON-NLS-0$
				"lineDown": {defaultHandler: function() {return self._doLineDown({select: false});}}, //$NON-NLS-0$
				"lineStart": {defaultHandler: function() {return self._doHome({select: false, ctrl:false});}}, //$NON-NLS-0$
				"lineEnd": {defaultHandler: function() {return self._doEnd({select: false, ctrl:false});}}, //$NON-NLS-0$
				"charPrevious": {defaultHandler: function() {return self._doCursorPrevious({select: false, unit:"character"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"charNext": {defaultHandler: function() {return self._doCursorNext({select: false, unit:"character"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"pageUp": {defaultHandler: function() {return self._doPageUp({select: false});}}, //$NON-NLS-0$
				"pageDown": {defaultHandler: function() {return self._doPageDown({select: false});}}, //$NON-NLS-0$
				"scrollPageUp": {defaultHandler: function() {return self._doScroll({type: "pageUp"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"scrollPageDown": {defaultHandler: function() {return self._doScroll({type: "pageDown"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"scrollLineUp": {defaultHandler: function() {return self._doScroll({type: "lineUp"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"scrollLineDown": {defaultHandler: function() {return self._doScroll({type: "lineDown"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"wordPrevious": {defaultHandler: function() {return self._doCursorPrevious({select: false, unit:"word"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"wordNext": {defaultHandler: function() {return self._doCursorNext({select: false, unit:"word"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"textStart": {defaultHandler: function() {return self._doHome({select: false, ctrl:true});}}, //$NON-NLS-0$
				"textEnd": {defaultHandler: function() {return self._doEnd({select: false, ctrl:true});}}, //$NON-NLS-0$
				"scrollTextStart": {defaultHandler: function() {return self._doScroll({type: "textStart"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"scrollTextEnd": {defaultHandler: function() {return self._doScroll({type: "textEnd"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"centerLine": {defaultHandler: function() {return self._doScroll({type: "centerLine"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				
				"selectLineUp": {defaultHandler: function() {return self._doLineUp({select: true});}}, //$NON-NLS-0$
				"selectLineDown": {defaultHandler: function() {return self._doLineDown({select: true});}}, //$NON-NLS-0$
				"selectWholeLineUp": {defaultHandler: function() {return self._doLineUp({select: true, wholeLine: true});}}, //$NON-NLS-0$
				"selectWholeLineDown": {defaultHandler: function() {return self._doLineDown({select: true, wholeLine: true});}}, //$NON-NLS-0$
				"selectLineStart": {defaultHandler: function() {return self._doHome({select: true, ctrl:false});}}, //$NON-NLS-0$
				"selectLineEnd": {defaultHandler: function() {return self._doEnd({select: true, ctrl:false});}}, //$NON-NLS-0$
				"selectCharPrevious": {defaultHandler: function() {return self._doCursorPrevious({select: true, unit:"character"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"selectCharNext": {defaultHandler: function() {return self._doCursorNext({select: true, unit:"character"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"selectPageUp": {defaultHandler: function() {return self._doPageUp({select: true});}}, //$NON-NLS-0$
				"selectPageDown": {defaultHandler: function() {return self._doPageDown({select: true});}}, //$NON-NLS-0$
				"selectWordPrevious": {defaultHandler: function() {return self._doCursorPrevious({select: true, unit:"word"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"selectWordNext": {defaultHandler: function() {return self._doCursorNext({select: true, unit:"word"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"selectTextStart": {defaultHandler: function() {return self._doHome({select: true, ctrl:true});}}, //$NON-NLS-0$
				"selectTextEnd": {defaultHandler: function() {return self._doEnd({select: true, ctrl:true});}}, //$NON-NLS-0$

				"deletePrevious": {defaultHandler: function() {return self._doBackspace({unit:"character"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"deleteNext": {defaultHandler: function() {return self._doDelete({unit:"character"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"deleteWordPrevious": {defaultHandler: function() {return self._doBackspace({unit:"word"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"deleteWordNext": {defaultHandler: function() {return self._doDelete({unit:"word"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"deleteLineStart": {defaultHandler: function() {return self._doBackspace({unit: "line"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"deleteLineEnd": {defaultHandler: function() {return self._doDelete({unit: "line"});}}, //$NON-NLS-1$ //$NON-NLS-0$
				"tab": {defaultHandler: function() {return self._doTab();}}, //$NON-NLS-0$
				"shiftTab": {defaultHandler: function() {return self._doShiftTab();}}, //$NON-NLS-0$
				"enter": {defaultHandler: function() {return self._doEnter();}}, //$NON-NLS-0$
				"enterNoCursor": {defaultHandler: function() {return self._doEnter({noCursor:true});}}, //$NON-NLS-0$
				"selectAll": {defaultHandler: function() {return self._doSelectAll();}}, //$NON-NLS-0$
				"copy": {defaultHandler: function() {return self._doCopy();}}, //$NON-NLS-0$
				"cut": {defaultHandler: function() {return self._doCut();}}, //$NON-NLS-0$
				"paste": {defaultHandler: function() {return self._doPaste();}}, //$NON-NLS-0$
				
				"toggleWrapMode": {defaultHandler: function() {return self._doWrapMode();}}, //$NON-NLS-0$
				"toggleTabMode": {defaultHandler: function() {return self._doTabMode();}} //$NON-NLS-0$
			};
		},
		_createRuler: function(ruler, index) {
			if (!this._clientDiv) { return; }
			var side = ruler.getLocation();
			var rulerParent = side === "left" ? this._leftDiv : this._rightDiv; //$NON-NLS-0$
			rulerParent.style.display = "block"; //$NON-NLS-0$
			var div = util.createElement(rulerParent.ownerDocument, "div"); //$NON-NLS-0$
			div._ruler = ruler;
			div.rulerChanged = true;
			div.style.position = "relative"; //$NON-NLS-0$
			div.style.cssFloat = "left"; //$NON-NLS-0$
			div.style.styleFloat = "left"; //$NON-NLS-0$
			div.style.borderWidth = "0px"; //$NON-NLS-0$
			div.style.margin = "0px"; //$NON-NLS-0$
			div.style.padding = "0px"; //$NON-NLS-0$
			div.style.outline = "none"; //$NON-NLS-0$
			if (index === undefined || index < 0 || index >= rulerParent.children.length) {
				rulerParent.appendChild(div);
			} else {
				var sibling = rulerParent.firstChild;
				while (sibling && --index > 0) {
					sibling = sibling.nextSibling;
				}
				rulerParent.insertBefore(div, sibling);
			}
		},
		_createView: function() {
			if (this._clientDiv) { return; }
			var parent = this._parent;
			while (parent.hasChildNodes()) { parent.removeChild(parent.lastChild); }

			var document = parent.ownerDocument;
			var rootDiv = util.createElement(document, "div"); //$NON-NLS-0$
			this._rootDiv = rootDiv;
			rootDiv.tabIndex = -1;
			rootDiv.style.position = "relative"; //$NON-NLS-0$
			rootDiv.style.overflow = "hidden"; //$NON-NLS-0$
			rootDiv.style.width = "100%"; //$NON-NLS-0$
			rootDiv.style.height = "100%"; //$NON-NLS-0$
			rootDiv.style.overflow = "hidden"; //$NON-NLS-0$
			rootDiv.style.WebkitTextSizeAdjust = "100%"; //$NON-NLS-0$
			rootDiv.setAttribute("role", "application"); //$NON-NLS-1$ //$NON-NLS-0$
			parent.appendChild(rootDiv);
			
			var leftDiv = util.createElement(document, "div"); //$NON-NLS-0$
			leftDiv.className = "textviewLeftRuler"; //$NON-NLS-0$
			this._leftDiv = leftDiv;
			leftDiv.tabIndex = -1;
			leftDiv.style.overflow = "hidden"; //$NON-NLS-0$
			leftDiv.style.MozUserSelect = "none"; //$NON-NLS-0$
			leftDiv.style.WebkitUserSelect = "none"; //$NON-NLS-0$
			leftDiv.style.position = "absolute"; //$NON-NLS-0$
			leftDiv.style.top = "0px"; //$NON-NLS-0$
			leftDiv.style.bottom = "0px"; //$NON-NLS-0$
			leftDiv.style.cursor = "default"; //$NON-NLS-0$
			leftDiv.style.display = "none"; //$NON-NLS-0$
			leftDiv.setAttribute("aria-hidden", "true"); //$NON-NLS-1$ //$NON-NLS-0$
			rootDiv.appendChild(leftDiv);

			var viewDiv = util.createElement(document, "div"); //$NON-NLS-0$
			viewDiv.className = "textviewScroll"; //$NON-NLS-0$
			this._viewDiv = viewDiv;
			viewDiv.tabIndex = -1;
			viewDiv.style.overflow = "auto"; //$NON-NLS-0$
			viewDiv.style.position = "absolute"; //$NON-NLS-0$
			viewDiv.style.top = "0px"; //$NON-NLS-0$
			viewDiv.style.bottom = "0px"; //$NON-NLS-0$
			viewDiv.style.borderWidth = "0px"; //$NON-NLS-0$
			viewDiv.style.margin = "0px"; //$NON-NLS-0$
			viewDiv.style.outline = "none"; //$NON-NLS-0$
			viewDiv.style.background = "transparent"; //$NON-NLS-0$
			if (util.isMac && util.isWebkit) {
				viewDiv.style.pointerEvents = "none"; //$NON-NLS-0$
				viewDiv.style.zIndex = "2"; //$NON-NLS-0$
			}
			rootDiv.appendChild(viewDiv);
			
			var rightDiv = util.createElement(document, "div"); //$NON-NLS-0$
			rightDiv.className = "textviewRightRuler"; //$NON-NLS-0$
			this._rightDiv = rightDiv;
			rightDiv.tabIndex = -1;
			rightDiv.style.display = "none"; //$NON-NLS-0$
			rightDiv.style.overflow = "hidden"; //$NON-NLS-0$
			rightDiv.style.MozUserSelect = "none"; //$NON-NLS-0$
			rightDiv.style.WebkitUserSelect = "none"; //$NON-NLS-0$
			rightDiv.style.position = "absolute"; //$NON-NLS-0$
			rightDiv.style.top = "0px"; //$NON-NLS-0$
			rightDiv.style.bottom = "0px"; //$NON-NLS-0$
			rightDiv.style.cursor = "default"; //$NON-NLS-0$
			rightDiv.style.right = "0px"; //$NON-NLS-0$
			rightDiv.setAttribute("aria-hidden", "true"); //$NON-NLS-1$ //$NON-NLS-0$
			rootDiv.appendChild(rightDiv);
				
			var scrollDiv = util.createElement(document, "div"); //$NON-NLS-0$
			this._scrollDiv = scrollDiv;
			scrollDiv.style.margin = "0px"; //$NON-NLS-0$
			scrollDiv.style.borderWidth = "0px"; //$NON-NLS-0$
			scrollDiv.style.padding = "0px"; //$NON-NLS-0$
			viewDiv.appendChild(scrollDiv);
			
			if (util.isFirefox) {
				var clipboardDiv = util.createElement(document, "div"); //$NON-NLS-0$
				this._clipboardDiv = clipboardDiv;
				clipboardDiv.style.position = "fixed"; //$NON-NLS-0$
				clipboardDiv.style.whiteSpace = "pre"; //$NON-NLS-0$
				clipboardDiv.style.left = "-1000px"; //$NON-NLS-0$
				rootDiv.appendChild(clipboardDiv);
			}

			if (!util.isIE && !util.isIOS) {
				var clipDiv = util.createElement(document, "div"); //$NON-NLS-0$
				this._clipDiv = clipDiv;
				clipDiv.style.position = "absolute"; //$NON-NLS-0$
				clipDiv.style.overflow = "hidden"; //$NON-NLS-0$
				clipDiv.style.margin = "0px"; //$NON-NLS-0$
				clipDiv.style.borderWidth = "0px"; //$NON-NLS-0$
				clipDiv.style.padding = "0px"; //$NON-NLS-0$
				clipDiv.style.background = "transparent"; //$NON-NLS-0$
				rootDiv.appendChild(clipDiv);
				
				var clipScrollDiv = util.createElement(document, "div"); //$NON-NLS-0$
				this._clipScrollDiv = clipScrollDiv;
				clipScrollDiv.style.position = "absolute"; //$NON-NLS-0$
				clipScrollDiv.style.height = "1px"; //$NON-NLS-0$
				clipScrollDiv.style.top = "-1000px"; //$NON-NLS-0$
				clipScrollDiv.style.background = "transparent"; //$NON-NLS-0$
				clipDiv.appendChild(clipScrollDiv);
			}
			
			this._setFullSelection(this._fullSelection, true);

			var clientDiv = util.createElement(document, "div"); //$NON-NLS-0$
			clientDiv.className = "textviewContent"; //$NON-NLS-0$
			this._clientDiv = clientDiv;
			clientDiv.style.position = "absolute"; //$NON-NLS-0$
			clientDiv.style.borderWidth = "0px"; //$NON-NLS-0$
			clientDiv.style.margin = "0px"; //$NON-NLS-0$
			clientDiv.style.padding = "0px"; //$NON-NLS-0$
			clientDiv.style.outline = "none"; //$NON-NLS-0$
			clientDiv.style.zIndex = "1"; //$NON-NLS-0$
			clientDiv.style.WebkitUserSelect = "text"; //$NON-NLS-0$
			clientDiv.setAttribute("spellcheck", "false"); //$NON-NLS-1$ //$NON-NLS-0$
			if (util.isIOS || util.isAndroid) {
				clientDiv.style.WebkitTapHighlightColor = "transparent"; //$NON-NLS-0$
			}
			(this._clipDiv || rootDiv).appendChild(clientDiv);
			
			if (util.isIOS || util.isAndroid) {
				var vScrollDiv = util.createElement(document, "div"); //$NON-NLS-0$
				this._vScrollDiv = vScrollDiv;
				vScrollDiv.style.position = "absolute"; //$NON-NLS-0$
				vScrollDiv.style.borderWidth = "1px"; //$NON-NLS-0$
				vScrollDiv.style.borderColor = "white"; //$NON-NLS-0$
				vScrollDiv.style.borderStyle = "solid"; //$NON-NLS-0$
				vScrollDiv.style.borderRadius = "4px"; //$NON-NLS-0$
				vScrollDiv.style.backgroundColor = "black"; //$NON-NLS-0$
				vScrollDiv.style.opacity = "0.5"; //$NON-NLS-0$
				vScrollDiv.style.margin = "0px"; //$NON-NLS-0$
				vScrollDiv.style.padding = "0px"; //$NON-NLS-0$
				vScrollDiv.style.outline = "none"; //$NON-NLS-0$
				vScrollDiv.style.zIndex = "3"; //$NON-NLS-0$
				vScrollDiv.style.width = "8px"; //$NON-NLS-0$
				vScrollDiv.style.display = "none"; //$NON-NLS-0$
				rootDiv.appendChild(vScrollDiv);
				var hScrollDiv = util.createElement(document, "div"); //$NON-NLS-0$
				this._hScrollDiv = hScrollDiv;
				hScrollDiv.style.position = "absolute"; //$NON-NLS-0$
				hScrollDiv.style.borderWidth = "1px"; //$NON-NLS-0$
				hScrollDiv.style.borderColor = "white"; //$NON-NLS-0$
				hScrollDiv.style.borderStyle = "solid"; //$NON-NLS-0$
				hScrollDiv.style.borderRadius = "4px"; //$NON-NLS-0$
				hScrollDiv.style.backgroundColor = "black"; //$NON-NLS-0$
				hScrollDiv.style.opacity = "0.5"; //$NON-NLS-0$
				hScrollDiv.style.margin = "0px"; //$NON-NLS-0$
				hScrollDiv.style.padding = "0px"; //$NON-NLS-0$
				hScrollDiv.style.outline = "none"; //$NON-NLS-0$
				hScrollDiv.style.zIndex = "3"; //$NON-NLS-0$
				hScrollDiv.style.height = "8px"; //$NON-NLS-0$
				hScrollDiv.style.display = "none"; //$NON-NLS-0$
				rootDiv.appendChild(hScrollDiv);
			}

			if (util.isFirefox && !clientDiv.setCapture) {
				var overlayDiv = util.createElement(document, "div"); //$NON-NLS-0$
				this._overlayDiv = overlayDiv;
				overlayDiv.style.position = clientDiv.style.position;
				overlayDiv.style.borderWidth = clientDiv.style.borderWidth;
				overlayDiv.style.margin = clientDiv.style.margin;
				overlayDiv.style.padding = clientDiv.style.padding;
				overlayDiv.style.cursor = "text"; //$NON-NLS-0$
				overlayDiv.style.zIndex = "2"; //$NON-NLS-0$
				(this._clipDiv || rootDiv).appendChild(overlayDiv);
			}
			clientDiv.contentEditable = "true"; //$NON-NLS-0$
			clientDiv.setAttribute("role", "textbox"); //$NON-NLS-1$ //$NON-NLS-0$
			clientDiv.setAttribute("aria-multiline", "true"); //$NON-NLS-1$ //$NON-NLS-0$
			this._setWrapMode(this._wrapMode, true);
			this._setReadOnly(this._readonly);
			this._setThemeClass(this._themeClass, true);
			this._setTabSize(this._tabSize, true);
			this._hookEvents();
			var rulers = this._rulers;
			for (var i=0; i<rulers.length; i++) {
				this._createRuler(rulers[i]);
			}
			this._update();
		},
		_defaultOptions: function() {
			return {
				parent: {value: undefined, update: null},
				model: {value: undefined, update: this.setModel},
				scrollAnimation: {value: 0, update: null},
				readonly: {value: false, update: this._setReadOnly},
				fullSelection: {value: true, update: this._setFullSelection},
				tabMode: { value: true, update: null },
				tabSize: {value: 8, update: this._setTabSize},
				expandTab: {value: false, update: null},
				wrapMode: {value: false, update: this._setWrapMode},
				theme: {value: mTextTheme.TextTheme.getTheme(), update: this._setTheme},
				themeClass: {value: undefined, update: this._setThemeClass}
			};
		},
		_destroyRuler: function(ruler) {
			var side = ruler.getLocation();
			var rulerParent = side === "left" ? this._leftDiv : this._rightDiv; //$NON-NLS-0$
			if (rulerParent) {
				var div = rulerParent.firstChild;
				while (div) {
					if (div._ruler === ruler) {
						div._ruler = undefined;
						rulerParent.removeChild(div);
						if (rulerParent.children.length === 0) {
							rulerParent.style.display = "none"; //$NON-NLS-0$
						}
						break;
					}
					div = div.nextSibling;
				}
			}
		},
		_destroyView: function() {
			var clientDiv = this._clientDiv;
			if (!clientDiv) { return; }
			this._setGrab(null);
			this._unhookEvents();

			/* Destroy timers */
			var window = this._getWindow();
			if (this._autoScrollTimerID) {
				window.clearTimeout(this._autoScrollTimerID);
				this._autoScrollTimerID = null;
			}
			if (this._updateTimer) {
				window.clearTimeout(this._updateTimer);
				this._updateTimer = null;
			}
			
			var rootDiv = this._rootDiv;
			rootDiv.parentNode.removeChild(rootDiv);

			/* Destroy DOM */
			this._selDiv1 = null;
			this._selDiv2 = null;
			this._selDiv3 = null;
			this._clipboardDiv = null;
			this._rootDiv = null;
			this._scrollDiv = null;
			this._viewDiv = null;
			this._clipDiv = null;
			this._clipScrollDiv = null;
			this._clientDiv = null;
			this._overlayDiv = null;
			this._leftDiv = null;
			this._rightDiv = null;
			this._vScrollDiv = null;
			this._hScrollDiv = null;
		},
		_doAutoScroll: function (direction, x, y) {
			this._autoScrollDir = direction;
			this._autoScrollX = x;
			this._autoScrollY = y;
			if (!this._autoScrollTimerID) {
				this._autoScrollTimer();
			}
		},
		_endAutoScroll: function () {
			if (this._autoScrollTimerID) {
				var window = this._getWindow();
				window.clearTimeout(this._autoScrollTimerID);
			}
			this._autoScrollDir = undefined;
			this._autoScrollTimerID = undefined;
		},
		_fixCaret: function() {
			var clientDiv = this._clientDiv;
			if (clientDiv) {
				var hasFocus = this._hasFocus;
				this._ignoreFocus = true;
				if (hasFocus) { clientDiv.blur(); }
				clientDiv.contentEditable = false;
				clientDiv.contentEditable = true;
				if (hasFocus) { clientDiv.focus(); }
				this._ignoreFocus = false;
			}
		},
		_getBaseText: function(start, end) {
			var model = this._model;
			/* This is the only case the view access the base model, alternatively the view could use a event to application to customize the text */
			if (model.getBaseModel) {
				start = model.mapOffset(start);
				end = model.mapOffset(end);
				model = model.getBaseModel();
			}
			return model.getText(start, end);
		},
		_getBottomIndex: function (fullyVisible) {
			var child = this._bottomChild;
			if (fullyVisible && this._getClientHeight() > this._getLineHeight()) {
				var rect = child.getBoundingClientRect();
				var clientRect = this._clientDiv.getBoundingClientRect();
				if (rect.bottom > clientRect.bottom) {
					child = this._getLinePrevious(child) || child;
				}
			}
			return child.lineIndex;
		},
		_getBoundsAtOffset: function(offset) {
			var model = this._model;
			var line = this._getLine(model.getLineAtOffset(offset));
			var result = line.getBoundingClientRect(offset);
			var linePixel = this._getLinePixel(line.lineIndex);
			result.top += linePixel;
			result.bottom += linePixel;
			line.destroy();
			return result;
		},
		_getClientHeight: function() {
			var viewPad = this._getViewPadding();
			return Math.max(0, this._viewDiv.clientHeight - viewPad.top - viewPad.bottom);
		},
		_getClientWidth: function() {
			var viewPad = this._getViewPadding();
			return Math.max(0, this._viewDiv.clientWidth - viewPad.left - viewPad.right);
		},
		_getClipboardText: function (event, handler) {
			var delimiter = this._model.getLineDelimiter();
			var clipboadText, text;
			var window = this._getWindow();
			if (window.clipboardData) {
				//IE
				clipboadText = [];
				text = window.clipboardData.getData("Text"); //$NON-NLS-0$
				convertDelimiter(text, function(t) {clipboadText.push(t);}, function() {clipboadText.push(delimiter);});
				text = clipboadText.join("");
				if (handler) { handler(text); }
				return text;
			}
			if (util.isFirefox) {
				this._ignoreFocus = true;
				var clipboardDiv = this._clipboardDiv;
				clipboardDiv.innerHTML = "<pre contenteditable=''></pre>"; //$NON-NLS-0$
				clipboardDiv.firstChild.focus();
				var self = this;
				var _getText = function() {
					var noteText = self._getTextFromElement(clipboardDiv);
					clipboardDiv.innerHTML = "";
					clipboadText = [];
					convertDelimiter(noteText, function(t) {clipboadText.push(t);}, function() {clipboadText.push(delimiter);});
					return clipboadText.join("");
				};
				
				/* Try execCommand first. Works on firefox with clipboard permission. */
				var result = false;
				this._ignorePaste = true;

				/* Do not try execCommand if middle-click is used, because if we do, we get the clipboard text, not the primary selection text. */
				if (!util.isLinux || this._lastMouseButton !== 2) {
					try {
						var document = clipboardDiv.ownerDocument;
						result = document.execCommand("paste", false, null); //$NON-NLS-0$
					} catch (ex) {
						/* Firefox can throw even when execCommand() works, see bug 362835. */
						result = clipboardDiv.childNodes.length > 1 || clipboardDiv.firstChild && clipboardDiv.firstChild.childNodes.length > 0;
					}
				}
				this._ignorePaste = false;
				if (!result) {
					/* Try native paste in DOM, works for firefox during the paste event. */
					if (event) {
						window.setTimeout(function() {
							self.focus();
							text = _getText();
							if (text && handler) {
								handler(text);
							}
							self._ignoreFocus = false;
						}, 0);
						return null;
					} else {
						/* no event and no clipboard permission, paste can't be performed */
						this.focus();
						this._ignoreFocus = false;
						return "";
					}
				}
				this.focus();
				this._ignoreFocus = false;
				text = _getText();
				if (text && handler) {
					handler(text);
				}
				return text;
			}
			//webkit
			if (event && event.clipboardData) {
				/*
				* Webkit (Chrome/Safari) allows getData during the paste event
				* Note: setData is not allowed, not even during copy/cut event
				*/
				clipboadText = [];
				text = event.clipboardData.getData("text/plain"); //$NON-NLS-0$
				convertDelimiter(text, function(t) {clipboadText.push(t);}, function() {clipboadText.push(delimiter);});
				text = clipboadText.join("");
				if (text && handler) {
					handler(text);
				}
				return text;
			} else {
				//TODO try paste using extension (Chrome only)
			}
			return "";
		},
		_getDOMText: function(child, offsetNode) {
			var lineChild = child.firstChild;
			var text = "", offset = 0;
			while (lineChild) {
				var textNode;
				if (lineChild.ignoreChars) {
					textNode = lineChild.lastChild;
					var ignored = 0, childText = [], childOffset = -1;
					while (textNode) {
						var data = textNode.data;
						for (var i = data.length - 1; i >= 0; i--) {
							var ch = data.substring(i, i + 1);
							if (ignored < lineChild.ignoreChars && (ch === " " || ch === "\u200C" || ch === "\uFEFF")) { //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
								ignored++;
							} else {
								childText.push(ch === "\u00A0" ? "\t" : ch); //$NON-NLS-1$ //$NON-NLS-0$
							}
						}
						if (offsetNode === textNode) {
							childOffset = childText.length;
						}
						textNode = textNode.previousSibling;
					}
					childText = childText.reverse().join("");
					if (childOffset !== -1) {
						offset = text.length + childText.length - childOffset;
					}
					text += childText;
				} else {
					textNode = lineChild.firstChild;
					while (textNode) {
						if (offsetNode === textNode) {
							offset = text.length;
						}
						text += textNode.data;
						textNode = textNode.nextSibling;
					}
				}
				lineChild = lineChild.nextSibling;
			}
			return {text: text, offset: offset};
		},
		_getTextFromElement: function(element) {
			var document = element.ownerDocument;
			var window = document.defaultView;
			if (!window.getSelection) {
				return element.innerText || element.textContent;
			}

			var newRange = document.createRange();
			newRange.selectNode(element);

			var selection = window.getSelection();
			var oldRanges = [], i;
			for (i = 0; i < selection.rangeCount; i++) {
				oldRanges.push(selection.getRangeAt(i));
			}

			this._ignoreSelect = true;
			selection.removeAllRanges();
			selection.addRange(newRange);

			var text = selection.toString();

			selection.removeAllRanges();
			for (i = 0; i < oldRanges.length; i++) {
				selection.addRange(oldRanges[i]);
			}

			this._ignoreSelect = false;
			return text;
		},
		_getViewPadding: function() {
			return this._metrics.viewPadding;
		},
		_getLine: function(lineIndex) {
			var child = this._getLineNode(lineIndex);
			if (child && !child.lineChanged && !child.lineRemoved) {
				return child._line;
			}
			return new TextLine(this, lineIndex);
		},
		_getLineHeight: function(lineIndex, calculate) {
			if (lineIndex !== undefined && this._lineHeight) {
				var lineHeight = this._lineHeight[lineIndex];
				if (lineHeight) { return lineHeight; }
				if (calculate || calculate === undefined) {
					var height = this._lineHeight[lineIndex] = this._calculateLineHeight(lineIndex);
					return height;
				}
			}
			return this._metrics.lineHeight;
		},
		_getLineNode: function (lineIndex) {
			var clientDiv = this._clientDiv;
			var child = clientDiv.firstChild;
			while (child) {
				if (lineIndex === child.lineIndex) {
					return child;
				}
				child = child.nextSibling;
			}
			return undefined;
		},
		_getLineNext: function (lineNode) {
			var node = lineNode ? lineNode.nextSibling : this._clientDiv.firstChild;
			while (node && node.lineIndex === -1) {
				node = node.nextSibling;
			}
			return node;
		},
		_getLinePrevious: function (lineNode) {
			var node = lineNode ? lineNode.previousSibling : this._clientDiv.lastChild;
			while (node && node.lineIndex === -1) {
				node = node.previousSibling;
			}
			return node;
		},
		_getLinePixel: function(lineIndex) {
			lineIndex = Math.min(Math.max(0, lineIndex), this._model.getLineCount());
			if (this._lineHeight) {
				var topIndex = this._getTopIndex();
				var pixel = -this._topIndexY + this._getScroll().y, i;
				if (lineIndex > topIndex) {
					for (i = topIndex; i < lineIndex; i++) {
						pixel += this._getLineHeight(i);
					}
				} else {
					for (i = topIndex - 1; i >= lineIndex; i--) {
						pixel -= this._getLineHeight(i);
					}
				}
				return pixel;
			}
			var lineHeight = this._getLineHeight();
			return lineHeight * lineIndex;
		},
		_getLineIndex: function(y) {
			var lineHeight, lineIndex = 0;
			var lineCount = this._model.getLineCount();
			if (this._lineHeight) {
				lineIndex = this._getTopIndex();
				var pixel = -this._topIndexY + this._getScroll().y;
				if (y !== pixel) {
					if (y < pixel) {
						while (y < pixel && lineIndex > 0) {
							y += this._getLineHeight(--lineIndex);
						}
					} else {
						lineHeight = this._getLineHeight(lineIndex);
						while (y - lineHeight >= pixel && lineIndex < lineCount - 1) {
							y -= lineHeight;
							lineHeight = this._getLineHeight(++lineIndex);
						}
					}
				}
			} else {
				lineHeight = this._getLineHeight();
				lineIndex = Math.floor(y / lineHeight);
			}
			return Math.max(0, Math.min(lineCount - 1, lineIndex));
		},
		_getScroll: function(cancelAnimation) {
			if (cancelAnimation === undefined || cancelAnimation) {
				this._cancelAnimation();
			}
			var viewDiv = this._viewDiv;
			return {x: viewDiv.scrollLeft, y: viewDiv.scrollTop};
		},
		_getSelection: function () {
			return this._selection.clone();
		},
		_getTopIndex: function (fullyVisible) {
			var child = this._topChild;
			if (fullyVisible && this._getClientHeight() > this._getLineHeight()) {
				var rect = child.getBoundingClientRect();
				var viewPad = this._getViewPadding();
				var viewRect = this._viewDiv.getBoundingClientRect();
				if (rect.top < viewRect.top + viewPad.top) {
					child = this._getLineNext(child) || child;
				}
			}
			return child.lineIndex;
		},
		_hookEvents: function() {
			var self = this;
			this._modelListener = {
				/** @private */
				onChanging: function(modelChangingEvent) {
					self._onModelChanging(modelChangingEvent);
				},
				/** @private */
				onChanged: function(modelChangedEvent) {
					self._onModelChanged(modelChangedEvent);
				}
			};
			this._model.addEventListener("preChanging", this._modelListener.onChanging); //$NON-NLS-0$
			this._model.addEventListener("postChanged", this._modelListener.onChanged); //$NON-NLS-0$
			
			this._themeListener = {
				onChanged: function(themeChangedEvent) {
					self._setThemeClass(self._themeClass);
				}
			};
			this._theme.addEventListener("ThemeChanged", this._themeListener.onChanged); //$NON-NLS-0$
			
			var handlers = this._handlers = [];
			var clientDiv = this._clientDiv, viewDiv = this._viewDiv, rootDiv = this._rootDiv;
			var topNode = this._overlayDiv || clientDiv;
			var document = clientDiv.ownerDocument;
			var window = this._getWindow();
			var grabNode = util.isIE ? document : window;
			handlers.push({target: window, type: "resize", handler: function(e) { return self._handleResize(e ? e : window.event);}}); //$NON-NLS-0$
			handlers.push({target: clientDiv, type: "blur", handler: function(e) { return self._handleBlur(e ? e : window.event);}}); //$NON-NLS-0$
			handlers.push({target: clientDiv, type: "focus", handler: function(e) { return self._handleFocus(e ? e : window.event);}}); //$NON-NLS-0$
			handlers.push({target: viewDiv, type: "focus", handler: function(e) { clientDiv.focus(); }}); //$NON-NLS-0$
			handlers.push({target: viewDiv, type: "scroll", handler: function(e) { return self._handleScroll(e ? e : window.event);}}); //$NON-NLS-0$
			handlers.push({target: clientDiv, type: "textInput", handler: function(e) { return self._handleTextInput(e ? e : window.event); }}); //$NON-NLS-0$
			handlers.push({target: clientDiv, type: "keydown", handler: function(e) { return self._handleKeyDown(e ? e : window.event);}}); //$NON-NLS-0$
			handlers.push({target: clientDiv, type: "keypress", handler: function(e) { return self._handleKeyPress(e ? e : window.event);}}); //$NON-NLS-0$
			handlers.push({target: clientDiv, type: "keyup", handler: function(e) { return self._handleKeyUp(e ? e : window.event);}}); //$NON-NLS-0$
			handlers.push({target: clientDiv, type: "contextmenu", handler: function(e) { return self._handleContextMenu(e ? e : window.event);}}); //$NON-NLS-0$
			handlers.push({target: clientDiv, type: "copy", handler: function(e) { return self._handleCopy(e ? e : window.event);}}); //$NON-NLS-0$
			handlers.push({target: clientDiv, type: "cut", handler: function(e) { return self._handleCut(e ? e : window.event);}}); //$NON-NLS-0$
			handlers.push({target: clientDiv, type: "paste", handler: function(e) { return self._handlePaste(e ? e : window.event);}}); //$NON-NLS-0$
			if (util.isIOS || util.isAndroid) {
				handlers.push({target: document, type: "selectionchange", handler: function(e) { return self._handleSelectionChange(e ? e : window.event); }}); //$NON-NLS-0$
				handlers.push({target: clientDiv, type: "touchstart", handler: function(e) { return self._handleTouchStart(e ? e : window.event); }}); //$NON-NLS-0$
				handlers.push({target: clientDiv, type: "touchmove", handler: function(e) { return self._handleTouchMove(e ? e : window.event); }}); //$NON-NLS-0$
				handlers.push({target: clientDiv, type: "touchend", handler: function(e) { return self._handleTouchEnd(e ? e : window.event); }}); //$NON-NLS-0$
			} else {
				handlers.push({target: clientDiv, type: "selectstart", handler: function(e) { return self._handleSelectStart(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: clientDiv, type: "mousedown", handler: function(e) { return self._handleMouseDown(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: clientDiv, type: "mouseover", handler: function(e) { return self._handleMouseOver(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: clientDiv, type: "mouseout", handler: function(e) { return self._handleMouseOut(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: grabNode, type: "mouseup", handler: function(e) { return self._handleMouseUp(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: grabNode, type: "mousemove", handler: function(e) { return self._handleMouseMove(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: rootDiv, type: "mousedown", handler: function(e) { return self._handleRootMouseDown(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: rootDiv, type: "mouseup", handler: function(e) { return self._handleRootMouseUp(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: topNode, type: "dragstart", handler: function(e) { return self._handleDragStart(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: topNode, type: "drag", handler: function(e) { return self._handleDrag(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: topNode, type: "dragend", handler: function(e) { return self._handleDragEnd(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: topNode, type: "dragenter", handler: function(e) { return self._handleDragEnter(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: topNode, type: "dragover", handler: function(e) { return self._handleDragOver(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: topNode, type: "dragleave", handler: function(e) { return self._handleDragLeave(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: topNode, type: "drop", handler: function(e) { return self._handleDrop(e ? e : window.event);}}); //$NON-NLS-0$
				handlers.push({target: this._clientDiv, type: util.isFirefox ? "DOMMouseScroll" : "mousewheel", handler: function(e) { return self._handleMouseWheel(e ? e : window.event); }}); //$NON-NLS-1$ //$NON-NLS-0$
				if (util.isFirefox && (!util.isWindows || util.isFirefox >= 15)) {
					var MutationObserver = window.MutationObserver || window.MozMutationObserver;
					if (MutationObserver) {
						this._mutationObserver = new MutationObserver(function(mutations) { self._handleDataModified(mutations); });
						this._mutationObserver.observe(clientDiv, {subtree: true, characterData: true});
					} else {
						handlers.push({target: this._clientDiv, type: "DOMCharacterDataModified", handler: function (e) { return self._handleDataModified(e ? e : window.event); }}); //$NON-NLS-0$
					}
				}
				if (this._overlayDiv) {
					handlers.push({target: this._overlayDiv, type: "mousedown", handler: function(e) { return self._handleMouseDown(e ? e : window.event);}}); //$NON-NLS-0$
					handlers.push({target: this._overlayDiv, type: "mouseover", handler: function(e) { return self._handleMouseOver(e ? e : window.event);}}); //$NON-NLS-0$
					handlers.push({target: this._overlayDiv, type: "mouseout", handler: function(e) { return self._handleMouseOut(e ? e : window.event);}}); //$NON-NLS-0$
					handlers.push({target: this._overlayDiv, type: "contextmenu", handler: function(e) { return self._handleContextMenu(e ? e : window.event); }}); //$NON-NLS-0$
				}
				if (!this._isW3CEvents) {
					handlers.push({target: this._clientDiv, type: "dblclick", handler: function(e) { return self._handleDblclick(e ? e : window.event); }}); //$NON-NLS-0$
				}
			}

			var leftDiv = this._leftDiv, rightDiv = this._rightDiv;
			if (util.isIE) {
				handlers.push({target: leftDiv, type: "selectstart", handler: function() {return false;}}); //$NON-NLS-0$
			}
			handlers.push({target: leftDiv, type: util.isFirefox ? "DOMMouseScroll" : "mousewheel", handler: function(e) { return self._handleMouseWheel(e ? e : window.event); }}); //$NON-NLS-1$ //$NON-NLS-0$
			handlers.push({target: leftDiv, type: "click", handler: function(e) { self._handleRulerEvent(e ? e : window.event); }}); //$NON-NLS-0$
			handlers.push({target: leftDiv, type: "dblclick", handler: function(e) { self._handleRulerEvent(e ? e : window.event); }}); //$NON-NLS-0$
			handlers.push({target: leftDiv, type: "mousemove", handler: function(e) { self._handleRulerEvent(e ? e : window.event); }}); //$NON-NLS-0$
			handlers.push({target: leftDiv, type: "mouseover", handler: function(e) { self._handleRulerEvent(e ? e : window.event); }}); //$NON-NLS-0$
			handlers.push({target: leftDiv, type: "mouseout", handler: function(e) { self._handleRulerEvent(e ? e : window.event); }}); //$NON-NLS-0$
			if (util.isIE) {
				handlers.push({target: rightDiv, type: "selectstart", handler: function() {return false;}}); //$NON-NLS-0$
			}
			handlers.push({target: rightDiv, type: util.isFirefox ? "DOMMouseScroll" : "mousewheel", handler: function(e) { return self._handleMouseWheel(e ? e : window.event); }}); //$NON-NLS-1$ //$NON-NLS-0$
			handlers.push({target: rightDiv, type: "click", handler: function(e) { self._handleRulerEvent(e ? e : window.event); }}); //$NON-NLS-0$
			handlers.push({target: rightDiv, type: "dblclick", handler: function(e) { self._handleRulerEvent(e ? e : window.event); }}); //$NON-NLS-0$
			handlers.push({target: rightDiv, type: "mousemove", handler: function(e) { self._handleRulerEvent(e ? e : window.event); }}); //$NON-NLS-0$
			handlers.push({target: rightDiv, type: "mouseover", handler: function(e) { self._handleRulerEvent(e ? e : window.event); }}); //$NON-NLS-0$
			handlers.push({target: rightDiv, type: "mouseout", handler: function(e) { self._handleRulerEvent(e ? e : window.event); }}); //$NON-NLS-0$
			
			for (var i=0; i<handlers.length; i++) {
				var h = handlers[i];
				addHandler(h.target, h.type, h.handler, h.capture);
			}
		},
		_getWindow: function() {
			return getWindow(this._parent.ownerDocument);
		},
		_init: function(options) {
			var parent = options.parent;
			if (typeof(parent) === "string") { //$NON-NLS-0$
				parent = (options.document || document).getElementById(parent);
			}
			if (!parent) { throw "no parent"; } //$NON-NLS-0$
			options.parent = parent;
			options.model = options.model || new mTextModel.TextModel();
			var defaultOptions = this._defaultOptions();
			for (var option in defaultOptions) {
				if (defaultOptions.hasOwnProperty(option)) {
					var value;
					if (options[option] !== undefined) {
						value = options[option];
					} else {
						value = defaultOptions[option].value;
					}
					this["_" + option] = value; //$NON-NLS-0$
				}
			}
			this._rulers = [];
			this._selection = new Selection (0, 0, false);
			this._linksVisible = false;
			this._redrawCount = 0;
			this._maxLineWidth = 0;
			this._maxLineIndex = -1;
			this._ignoreSelect = true;
			this._ignoreFocus = false;
			this._hasFocus = false;
			this._columnX = -1;
			this._dragOffset = -1;
			this._isRangeRects = (!util.isIE || util.isIE >= 9) && typeof parent.ownerDocument.createRange().getBoundingClientRect === "function"; //$NON-NLS-0$
			this._isW3CEvents = parent.addEventListener;

			/* Auto scroll */
			this._autoScrollX = null;
			this._autoScrollY = null;
			this._autoScrollTimerID = null;
			this._AUTO_SCROLL_RATE = 50;
			this._grabControl = null;
			this._moseMoveClosure  = null;
			this._mouseUpClosure = null;
			
			/* Double click */
			this._lastMouseX = 0;
			this._lastMouseY = 0;
			this._lastMouseTime = 0;
			this._clickCount = 0;
			this._clickTime = 250;
			this._clickDist = 5;
			this._isMouseDown = false;
			this._doubleClickSelection = null;
			
			/* Scroll */
			this._hScroll = 0;
			this._vScroll = 0;

			/* IME */
			this._imeOffset = -1;
			
			/* Create elements */
			this._createActions();
			this._createView();
		},
		_modifyContent: function(e, updateCaret) {
			if (this._readonly && !e._code) {
				return;
			}
			e.type = "Verify"; //$NON-NLS-0$
			this.onVerify(e);

			if (e.text === null || e.text === undefined) { return; }
			
			var model = this._model;
			try {
				if (e._ignoreDOMSelection) { this._ignoreDOMSelection = true; }
				model.setText (e.text, e.start, e.end);
			} finally {
				if (e._ignoreDOMSelection) { this._ignoreDOMSelection = false; }
			}
			
			if (updateCaret) {
				var selection = this._getSelection ();
				selection.setCaret(e.start + e.text.length);
				this._setSelection(selection, true);
			}
			this.onModify({type: "Modify"}); //$NON-NLS-0$
		},
		_onModelChanged: function(modelChangedEvent) {
			modelChangedEvent.type = "ModelChanged"; //$NON-NLS-0$
			this.onModelChanged(modelChangedEvent);
			modelChangedEvent.type = "Changed"; //$NON-NLS-0$
			var start = modelChangedEvent.start;
			var addedCharCount = modelChangedEvent.addedCharCount;
			var removedCharCount = modelChangedEvent.removedCharCount;
			var addedLineCount = modelChangedEvent.addedLineCount;
			var removedLineCount = modelChangedEvent.removedLineCount;
			var selection = this._getSelection();
			if (selection.end > start) {
				if (selection.end > start && selection.start < start + removedCharCount) {
					// selection intersects replaced text. set caret behind text change
					selection.setCaret(start + addedCharCount);
				} else {
					// move selection to keep same text selected
					selection.start +=  addedCharCount - removedCharCount;
					selection.end +=  addedCharCount - removedCharCount;
				}
				this._setSelection(selection, false, false);
			}
			
			var model = this._model;
			var startLine = model.getLineAtOffset(start);
			var child = this._getLineNext();
			while (child) {
				var lineIndex = child.lineIndex;
				if (startLine <= lineIndex && lineIndex <= startLine + removedLineCount) {
					if (startLine === lineIndex && !child.modelChangedEvent && !child.lineRemoved) {
						child.modelChangedEvent = modelChangedEvent;
						child.lineChanged = true;
					} else {
						child.lineRemoved = true;
						child.lineChanged = false;
						child.modelChangedEvent = null;
					}
				}
				if (lineIndex > startLine + removedLineCount) {
					child.lineIndex = lineIndex + addedLineCount - removedLineCount;
					child._line.lineIndex = child.lineIndex;
				}
				child = this._getLineNext(child);
			}
			if (!this._wrapMode) {
				if (startLine <= this._maxLineIndex && this._maxLineIndex <= startLine + removedLineCount) {
					this._checkMaxLineIndex = this._maxLineIndex;
					this._maxLineIndex = -1;
					this._maxLineWidth = 0;
				}
			}
			this._update();
		},
		_onModelChanging: function(modelChangingEvent) {
			modelChangingEvent.type = "ModelChanging"; //$NON-NLS-0$
			this.onModelChanging(modelChangingEvent);
			modelChangingEvent.type = "Changing"; //$NON-NLS-0$
		},
		_queueUpdate: function() {
			if (this._updateTimer || this._ignoreQueueUpdate) { return; }
			var self = this;
			var window = this._getWindow();
			this._updateTimer = window.setTimeout(function() { 
				self._updateTimer = null;
				self._update();
			}, 0);
		},
		_resetLineHeight: function(startLine, endLine) {
			if (this._wrapMode) {
				if (startLine !== undefined && endLine !== undefined) {
					for (var i = startLine; i < endLine; i++) {
						this._lineHeight[i] = undefined;
					}
				} else {
					this._lineHeight = new Array(this._model.getLineCount());
				}
				this._calculateLineHeightTimer();
			} else {
				this._lineHeight = null;
			}
		},
		_resetLineWidth: function() {
			var clientDiv = this._clientDiv;
			if (clientDiv) {
				var child = clientDiv.firstChild;
				while (child) {
					child.lineWidth = undefined;
					child = child.nextSibling;
				}
			}
		},
		_reset: function() {
			this._maxLineIndex = -1;
			this._maxLineWidth = 0;
			this._columnX = -1;
			this._topChild = null;
			this._bottomChild = null;
			this._topIndexY = 0;
			this._resetLineHeight();
			this._setSelection(new Selection (0, 0, false), false, false);
			if (this._viewDiv) {
				this._viewDiv.scrollLeft = 0;
				this._viewDiv.scrollTop = 0;
			}
			var clientDiv = this._clientDiv;
			if (clientDiv) {
				var child = clientDiv.firstChild;
				while (child) {
					child.lineRemoved = true;
					child = child.nextSibling;
				}
				/*
				* Bug in Firefox.  For some reason, the caret does not show after the
				* view is refreshed.  The fix is to toggle the contentEditable state and
				* force the clientDiv to loose and receive focus if it is focused.
				*/
				if (util.isFirefox) {
					this._ignoreFocus = false;
					var hasFocus = this._hasFocus;
					if (hasFocus) { clientDiv.blur(); }
					clientDiv.contentEditable = false;
					clientDiv.contentEditable = true;
					if (hasFocus) { clientDiv.focus(); }
					this._ignoreFocus = false;
				}
			}
		},
		_scrollViewAnimated: function (pixelX, pixelY, callback) {
			if (callback && this._scrollAnimation) {
				var self = this;
				this._animation = new Animation({
					window: this._getWindow(),
					duration: this._scrollAnimation,
					curve: [pixelY, 0],
					onAnimate: function(x) {
						var deltaY = pixelY - Math.floor(x);
						self._scrollView (0, deltaY);
						pixelY -= deltaY;
					},
					onEnd: function() {
						self._animation = null;
						self._scrollView (pixelX, pixelY);
						if (callback) {
							callback();
						}
					}
				});
				this._animation.play();
			} else {
				this._scrollView (pixelX, pixelY);
				if (callback) {
					callback();
				}
			}
		}, 
		_scrollView: function (pixelX, pixelY) {
			/*
			* Always set _ensureCaretVisible to false so that the view does not scroll
			* to show the caret when scrollView is not called from showCaret().
			*/
			this._ensureCaretVisible = false;
			
			/*
			* Scrolling is done only by setting the scrollLeft and scrollTop fields in the
			* view div. This causes an update from the scroll event. In some browsers 
			* this event is asynchronous and forcing update page to run synchronously
			* leads to redraw problems. 
			* On Chrome 11, the view redrawing at times when holding PageDown/PageUp key.
			* On Firefox 4 for Linux, the view redraws the first page when holding 
			* PageDown/PageUp key, but it will not redraw again until the key is released.
			*/
			var viewDiv = this._viewDiv;
			if (pixelX) { viewDiv.scrollLeft += pixelX; }
			if (pixelY) { viewDiv.scrollTop += pixelY; }
		},
		_setClipboardText: function (text, event) {
			var clipboardText;
			var document = this._parent.ownerDocument;
			var window = this._getWindow();
			if (window.clipboardData) {
				//IE
				clipboardText = [];
				convertDelimiter(text, function(t) {clipboardText.push(t);}, function() {clipboardText.push(util.platformDelimiter);});
				return window.clipboardData.setData("Text", clipboardText.join("")); //$NON-NLS-0$
			}
			if (event && event.clipboardData) {
				//webkit
				clipboardText = [];
				convertDelimiter(text, function(t) {clipboardText.push(t);}, function() {clipboardText.push(util.platformDelimiter);});
				if (event.clipboardData.setData("text/plain", clipboardText.join(""))) { //$NON-NLS-0$
					return true;
				}
			}
			var child = util.createElement(document, "pre"); //$NON-NLS-0$
			child.style.position = "fixed"; //$NON-NLS-0$
			child.style.left = "-1000px"; //$NON-NLS-0$
			convertDelimiter(text, 
				function(t) {
					child.appendChild(document.createTextNode(t));
				}, 
				function() {
					child.appendChild(util.createElement(document, "br")); //$NON-NLS-0$
				}
			);
			child.appendChild(document.createTextNode(" ")); //$NON-NLS-0$
			this._clientDiv.appendChild(child);
			var range = document.createRange();
			range.setStart(child.firstChild, 0);
			range.setEndBefore(child.lastChild);
			var sel = window.getSelection();
			if (sel.rangeCount > 0) { sel.removeAllRanges(); }
			sel.addRange(range);
			var self = this;
			/** @ignore */
			var cleanup = function() {
				if (child && child.parentNode === self._clientDiv) {
					self._clientDiv.removeChild(child);
				}
				self._updateDOMSelection();
			};
			var result = false;
			/* 
			* Try execCommand first, it works on firefox with clipboard permission,
			* chrome 5, safari 4.
			*/
			this._ignoreCopy = true;
			try {
				result = document.execCommand("copy", false, null); //$NON-NLS-0$
			} catch (e) {}
			this._ignoreCopy = false;
			if (!result) {
				if (event) {
					window.setTimeout(cleanup, 0);
					return false;
				}
			}
			/* no event and no permission, copy can not be done */
			cleanup();
			return true;
		},
		_setDOMSelection: function (startNode, startOffset, endNode, endOffset) {
			var startLineNode, startLineOffset, endLineNode, endLineOffset;
			var offset = 0;
			var lineChild = startNode.firstChild;
			var node, nodeLength, model = this._model;
			var startLineEnd = model.getLine(startNode.lineIndex).length;
			while (lineChild) {
				node = lineChild.firstChild;
				nodeLength = node.length;
				if (lineChild.ignoreChars) {
					nodeLength -= lineChild.ignoreChars;
				}
				if (offset + nodeLength > startOffset || offset + nodeLength >= startLineEnd) {
					startLineNode = node;
					startLineOffset = startOffset - offset;
					if (lineChild.ignoreChars && nodeLength > 0 && startLineOffset === nodeLength) {
						startLineOffset += lineChild.ignoreChars; 
					}
					break;
				}
				offset += nodeLength;
				lineChild = lineChild.nextSibling;
			}
			offset = 0;
			lineChild = endNode.firstChild;
			var endLineEnd = this._model.getLine(endNode.lineIndex).length;
			while (lineChild) {
				node = lineChild.firstChild;
				nodeLength = node.length;
				if (lineChild.ignoreChars) {
					nodeLength -= lineChild.ignoreChars;
				}
				if (nodeLength + offset > endOffset || offset + nodeLength >= endLineEnd) {
					endLineNode = node;
					endLineOffset = endOffset - offset;
					if (lineChild.ignoreChars && nodeLength > 0 && endLineOffset === nodeLength) {
						endLineOffset += lineChild.ignoreChars; 
					}
					break;
				}
				offset += nodeLength;
				lineChild = lineChild.nextSibling;
			}
			
			this._setDOMFullSelection(startNode, startOffset, startLineEnd, endNode, endOffset, endLineEnd);

			if (!this._hasFocus) { return; }
			var range;
			var window = this._getWindow();
			var document = this._parent.ownerDocument;
			if (window.getSelection) {
				//W3C
				var sel = window.getSelection();
				if ((sel.anchorNode === startLineNode && sel.anchorOffset === startLineOffset &&
					sel.focusNode === endLineNode && sel.focusOffset === endLineOffset) ||
					(sel.anchorNode === endLineNode && sel.anchorOffset === endLineOffset &&
					sel.focusNode === startLineNode && sel.focusOffset === startLineOffset)) { return; }
				
				range = document.createRange();
				range.setStart(startLineNode, startLineOffset);
				range.setEnd(endLineNode, endLineOffset);
				this._ignoreSelect = false;
				if (sel.rangeCount > 0) { sel.removeAllRanges(); }
				sel.addRange(range);
				this._ignoreSelect = true;
			} else if (document.selection) {
				//IE < 9
				var body = document.body;

				/*
				* Bug in IE. For some reason when text is deselected the overflow
				* selection at the end of some lines does not get redrawn.  The
				* fix is to create a DOM element in the body to force a redraw.
				*/
				var child = util.createElement(document, "div"); //$NON-NLS-0$
				body.appendChild(child);
				body.removeChild(child);
				
				range = body.createTextRange();
				range.moveToElementText(startLineNode.parentNode);
				range.moveStart("character", startLineOffset); //$NON-NLS-0$
				var endRange = body.createTextRange();
				endRange.moveToElementText(endLineNode.parentNode);
				endRange.moveStart("character", endLineOffset); //$NON-NLS-0$
				range.setEndPoint("EndToStart", endRange); //$NON-NLS-0$
				this._ignoreSelect = false;
				range.select();
				this._ignoreSelect = true;
			}
		},
		_setDOMFullSelection: function(startNode, startOffset, startLineEnd, endNode, endOffset, endLineEnd) {
			if (!this._selDiv1) { return; }
			var selDiv = this._selDiv1;
			selDiv.style.width = "0px"; //$NON-NLS-0$
			selDiv.style.height = "0px"; //$NON-NLS-0$
			selDiv = this._selDiv2;
			selDiv.style.width = "0px"; //$NON-NLS-0$
			selDiv.style.height = "0px"; //$NON-NLS-0$
			selDiv = this._selDiv3;
			selDiv.style.width = "0px"; //$NON-NLS-0$
			selDiv.style.height = "0px"; //$NON-NLS-0$
			if (startNode === endNode && startOffset === endOffset) { return; }
			var model = this._model;
			var viewPad = this._getViewPadding();
			var clientRect = this._clientDiv.getBoundingClientRect();
			var viewRect = this._viewDiv.getBoundingClientRect();
			var left = viewRect.left + viewPad.left;
			var right = clientRect.right;
			var top = viewRect.top + viewPad.top;
			var bottom = clientRect.bottom;
			var hd = 0, vd = 0;
			if (this._clipDiv) {
				var clipRect = this._clipDiv.getBoundingClientRect();
				hd = clipRect.left - this._clipDiv.scrollLeft;
				vd = clipRect.top;
			} else {
				var rootpRect = this._rootDiv.getBoundingClientRect();
				hd = rootpRect.left;
				vd = rootpRect.top;
			}
			this._ignoreDOMSelection = true;
			var startLine = new TextLine(this, startNode.lineIndex, startNode);
			var startRect = startLine.getBoundingClientRect(model.getLineStart(startNode.lineIndex) + startOffset, false);
			var l = startRect.left;
			var endLine = new TextLine(this, endNode.lineIndex, endNode);
			var endRect = endLine.getBoundingClientRect(model.getLineStart(endNode.lineIndex) + endOffset, false);
			var r = endRect.left;
			this._ignoreDOMSelection = false;
			var sel1Div = this._selDiv1;
			var sel1Left = Math.min(right, Math.max(left, l));
			var sel1Top = Math.min(bottom, Math.max(top, startRect.top));
			var sel1Right = right;
			var sel1Bottom = Math.min(bottom, Math.max(top, startRect.bottom));
			sel1Div.style.left = (sel1Left - hd) + "px"; //$NON-NLS-0$
			sel1Div.style.top = (sel1Top - vd) + "px"; //$NON-NLS-0$
			sel1Div.style.width = Math.max(0, sel1Right - sel1Left) + "px"; //$NON-NLS-0$
			sel1Div.style.height = Math.max(0, sel1Bottom - sel1Top) + "px"; //$NON-NLS-0$
			if (startRect.top === endRect.top) {
				sel1Right = Math.min(r, right);
				sel1Div.style.width = Math.max(0, sel1Right - sel1Left) + "px"; //$NON-NLS-0$
			} else {
				var sel3Left = left;
				var sel3Top = Math.min(bottom, Math.max(top, endRect.top));
				var sel3Right = Math.min(right, Math.max(left, r));
				var sel3Bottom = Math.min(bottom, Math.max(top, endRect.bottom));
				var sel3Div = this._selDiv3;
				sel3Div.style.left = (sel3Left - hd) + "px"; //$NON-NLS-0$
				sel3Div.style.top = (sel3Top - vd) + "px"; //$NON-NLS-0$
				sel3Div.style.width = Math.max(0, sel3Right - sel3Left) + "px"; //$NON-NLS-0$
				sel3Div.style.height = Math.max(0, sel3Bottom - sel3Top) + "px"; //$NON-NLS-0$
				if (sel3Top - sel1Bottom > 0) {
					var sel2Div = this._selDiv2;
					sel2Div.style.left = (left - hd)  + "px"; //$NON-NLS-0$
					sel2Div.style.top = (sel1Bottom - vd) + "px"; //$NON-NLS-0$
					sel2Div.style.width = Math.max(0, right - left) + "px"; //$NON-NLS-0$
					sel2Div.style.height = Math.max(0, sel3Top - sel1Bottom) + "px"; //$NON-NLS-0$
				}
			}
		},
		_setGrab: function (target) {
			if (target === this._grabControl) { return; }
			if (target) {
				if (target.setCapture) { target.setCapture(); }
				this._grabControl = target;
			} else {
				if (this._grabControl.releaseCapture) { this._grabControl.releaseCapture(); }
				this._grabControl = null;
			}
		},
		_setLinksVisible: function(visible) {
			if (this._linksVisible === visible) { return; }
			this._linksVisible = visible;
			/*
			* Feature in IE.  The client div looses focus and does not regain it back
			* when the content editable flag is reset. The fix is to remember that it
			* had focus when the flag is cleared and give focus back to the div when
			* the flag is set.
			*/
			if (util.isIE && visible) {
				this._hadFocus = this._hasFocus;
			}
			var clientDiv = this._clientDiv;
			clientDiv.contentEditable = !visible;
			if (this._hadFocus && !visible) {
				clientDiv.focus();
			}
			if (this._overlayDiv) {
				this._overlayDiv.style.zIndex = visible ? "-1" : "1"; //$NON-NLS-1$ //$NON-NLS-0$
			}
			var line = this._getLineNext();
			while (line) {
				if (line.hasLink) {
					var lineChild = line.firstChild;
					while (lineChild) {
						var next = lineChild.nextSibling;
						var style = lineChild.viewStyle;
						if (style && style.tagName === "A") { //$NON-NLS-0$
							line.replaceChild(line._line._createSpan(line, lineChild.firstChild.data, style), lineChild);
						}
						lineChild = next;
					}
				}
				line = this._getLineNext(line);
			}
		},
		_setSelection: function (selection, scroll, update, callback, pageScroll) {
			if (selection) {
				this._columnX = -1;
				if (update === undefined) { update = true; }
				var oldSelection = this._selection; 
				this._selection = selection;

				/* 
				* Always showCaret(), even when the selection is not changing, to ensure the
				* caret is visible. Note that some views do not scroll to show the caret during
				* keyboard navigation when the selection does not chanage. For example, line down
				* when the caret is already at the last line.
				*/
				if (scroll !== false) { /*update = !*/this._showCaret(false, callback, scroll, pageScroll); }
				
				/* 
				* Sometimes the browser changes the selection 
				* as result of method calls or "leaked" events. 
				* The fix is to set the visual selection even
				* when the logical selection is not changed.
				*/
				if (update) { this._updateDOMSelection(); }
				
				if (!oldSelection.equals(selection)) {
					var e = {
						type: "Selection", //$NON-NLS-0$
						oldValue: {start:oldSelection.start, end:oldSelection.end},
						newValue: {start:selection.start, end:selection.end}
					};
					this.onSelection(e);
				}
			}
		},
		_setSelectionTo: function (x, y, extent, drag) {
			var model = this._model, offset;
			var selection = this._getSelection();
			var pt = this.convert({x: x, y: y}, "page", "document"); //$NON-NLS-1$ //$NON-NLS-0$
			var lineIndex = this._getLineIndex(pt.y), line;
			if (this._clickCount === 1) {
				line = this._getLine(lineIndex);
				offset = line.getOffset(pt.x, pt.y - this._getLinePixel(lineIndex));
				line.destroy();
				if (drag && !extent) {
					if (selection.start <= offset && offset < selection.end) {
						this._dragOffset = offset;
						return false;
					}
				}
				selection.extend(offset);
				if (!extent) { selection.collapse(); }
			} else {
				var word = (this._clickCount & 1) === 0;
				var start, end;
				if (word) {
					line = this._getLine(lineIndex);
					offset = line.getOffset(pt.x, pt.y - this._getLinePixel(lineIndex));
					if (this._doubleClickSelection) {
						if (offset >= this._doubleClickSelection.start) {
							start = this._doubleClickSelection.start;
							end = line.getNextOffset(offset, "wordend", +1); //$NON-NLS-0$
						} else {
							start = line.getNextOffset(offset, "word", -1); //$NON-NLS-0$
							end = this._doubleClickSelection.end;
						}
					} else {
						start = line.getNextOffset(offset, "word", -1); //$NON-NLS-0$
						end = line.getNextOffset(start, "wordend", +1); //$NON-NLS-0$
					}
					line.destroy();
				} else {
					if (this._doubleClickSelection) {
						var doubleClickLine = model.getLineAtOffset(this._doubleClickSelection.start);
						if (lineIndex >= doubleClickLine) {
							start = model.getLineStart(doubleClickLine);
							end = model.getLineEnd(lineIndex);
						} else {
							start = model.getLineStart(lineIndex);
							end = model.getLineEnd(doubleClickLine);
						}
					} else {
						start = model.getLineStart(lineIndex);
						end = model.getLineEnd(lineIndex);
					}
				}
				selection.setCaret(start);
				selection.extend(end);
			} 
			this._setSelection(selection, true, true);
			return true;
		},
		_setFullSelection: function(fullSelection, init) {
			this._fullSelection = fullSelection;
			if (util.isWebkit) {
				this._fullSelection = true;
			}
			var parent = this._clipDiv || this._rootDiv;
			if (!parent) {
				return;
			}
			if (!this._fullSelection) {
				if (this._selDiv1) {
					parent.removeChild(this._selDiv1);
					this._selDiv1 = null;
				}
				if (this._selDiv2) {
					parent.removeChild(this._selDiv2);
					this._selDiv2 = null;
				}
				if (this._selDiv3) {
					parent.removeChild(this._selDiv3);
					this._selDiv3 = null;
				}
				return;
			}
			
			if (!this._selDiv1 && (this._fullSelection && !util.isIOS)) {
				var document = parent.ownerDocument;
				this._highlightRGB = util.isWebkit ? "transparent" : "Highlight"; //$NON-NLS-1$ //$NON-NLS-0$
				var selDiv1 = util.createElement(document, "div"); //$NON-NLS-0$
				this._selDiv1 = selDiv1;
				selDiv1.style.position = "absolute"; //$NON-NLS-0$
				selDiv1.style.borderWidth = "0px"; //$NON-NLS-0$
				selDiv1.style.margin = "0px"; //$NON-NLS-0$
				selDiv1.style.padding = "0px"; //$NON-NLS-0$
				selDiv1.style.outline = "none"; //$NON-NLS-0$
				selDiv1.style.background = this._highlightRGB;
				selDiv1.style.width = "0px"; //$NON-NLS-0$
				selDiv1.style.height = "0px"; //$NON-NLS-0$
				selDiv1.style.zIndex = "0"; //$NON-NLS-0$
				parent.appendChild(selDiv1);
				var selDiv2 = util.createElement(document, "div"); //$NON-NLS-0$
				this._selDiv2 = selDiv2;
				selDiv2.style.position = "absolute"; //$NON-NLS-0$
				selDiv2.style.borderWidth = "0px"; //$NON-NLS-0$
				selDiv2.style.margin = "0px"; //$NON-NLS-0$
				selDiv2.style.padding = "0px"; //$NON-NLS-0$
				selDiv2.style.outline = "none"; //$NON-NLS-0$
				selDiv2.style.background = this._highlightRGB;
				selDiv2.style.width = "0px"; //$NON-NLS-0$
				selDiv2.style.height = "0px"; //$NON-NLS-0$
				selDiv2.style.zIndex = "0"; //$NON-NLS-0$
				parent.appendChild(selDiv2);
				var selDiv3 = util.createElement(document, "div"); //$NON-NLS-0$
				this._selDiv3 = selDiv3;
				selDiv3.style.position = "absolute"; //$NON-NLS-0$
				selDiv3.style.borderWidth = "0px"; //$NON-NLS-0$
				selDiv3.style.margin = "0px"; //$NON-NLS-0$
				selDiv3.style.padding = "0px"; //$NON-NLS-0$
				selDiv3.style.outline = "none"; //$NON-NLS-0$
				selDiv3.style.background = this._highlightRGB;
				selDiv3.style.width = "0px"; //$NON-NLS-0$
				selDiv3.style.height = "0px"; //$NON-NLS-0$
				selDiv3.style.zIndex = "0"; //$NON-NLS-0$
				parent.appendChild(selDiv3);
				
				/*
				* Bug in Firefox. The Highlight color is mapped to list selection
				* background instead of the text selection background.  The fix
				* is to map known colors using a table or fallback to light blue.
				*/
				if (util.isFirefox && util.isMac) {
					var window = this._getWindow();
					var style = window.getComputedStyle(selDiv3, null);
					var rgb = style.getPropertyValue("background-color"); //$NON-NLS-0$
					switch (rgb) {
						case "rgb(119, 141, 168)": rgb = "rgb(199, 208, 218)"; break; //$NON-NLS-1$ //$NON-NLS-0$
						case "rgb(127, 127, 127)": rgb = "rgb(198, 198, 198)"; break; //$NON-NLS-1$ //$NON-NLS-0$
						case "rgb(255, 193, 31)": rgb = "rgb(250, 236, 115)"; break; //$NON-NLS-1$ //$NON-NLS-0$
						case "rgb(243, 70, 72)": rgb = "rgb(255, 176, 139)"; break; //$NON-NLS-1$ //$NON-NLS-0$
						case "rgb(255, 138, 34)": rgb = "rgb(255, 209, 129)"; break; //$NON-NLS-1$ //$NON-NLS-0$
						case "rgb(102, 197, 71)": rgb = "rgb(194, 249, 144)"; break; //$NON-NLS-1$ //$NON-NLS-0$
						case "rgb(140, 78, 184)": rgb = "rgb(232, 184, 255)"; break; //$NON-NLS-1$ //$NON-NLS-0$
						default: rgb = "rgb(180, 213, 255)"; break; //$NON-NLS-0$
					}
					this._highlightRGB = rgb;
					selDiv1.style.background = rgb;
					selDiv2.style.background = rgb;
					selDiv3.style.background = rgb;
				}
				if (!init) {
					this._updateDOMSelection();
				}
			}
		},
		_setReadOnly: function (readOnly) {
			this._readonly = readOnly;
			this._clientDiv.setAttribute("aria-readonly", readOnly ? "true" : "false"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		},
		_setTabSize: function (tabSize, init) {
			this._tabSize = tabSize;
			this._customTabSize = undefined;
			var clientDiv = this._clientDiv;
			if (util.isOpera) {
				if (clientDiv) { clientDiv.style.OTabSize = this._tabSize+""; }
			} else if (util.isWebkit >= 537.1) {
				if (clientDiv) { clientDiv.style.tabSize = this._tabSize+""; }
			} else if (util.isFirefox >= 4) {
				if (clientDiv) {  clientDiv.style.MozTabSize = this._tabSize+""; }
			} else if (this._tabSize !== 8) {
				this._customTabSize = this._tabSize;
			}
			if (!init) {
				this.redrawLines();
				this._resetLineWidth();
			}
		},
		_setTheme: function(theme) {
			if (this._theme) {
				this._theme.removeEventListener("ThemeChanged", this._themeListener.onChanged); //$NON-NLS-0$
			}
			this._theme = theme;
			if (this._theme) {
				this._theme.addEventListener("ThemeChanged", this._themeListener.onChanged); //$NON-NLS-0$
			}
			this._setThemeClass(this._themeClass);
		},
		_setThemeClass: function (themeClass, init) {
			this._themeClass = themeClass;
			var viewContainerClass = "textview"; //$NON-NLS-0$
			var globalThemeClass = this._theme.getThemeClass();
			if (globalThemeClass) { viewContainerClass += " " + globalThemeClass; } //$NON-NLS-0$
			if (this._themeClass && globalThemeClass !== this._themeClass) { viewContainerClass += " " + this._themeClass; } //$NON-NLS-0$
			this._rootDiv.className = viewContainerClass;
			this._updateStyle(init);
		},
		_setWrapMode: function (wrapMode, init) {
			this._wrapMode = wrapMode;
			var clientDiv = this._clientDiv, viewDiv = this._viewDiv;
			if (wrapMode) {
				clientDiv.style.whiteSpace = "pre-wrap"; //$NON-NLS-0$
				clientDiv.style.wordWrap = "break-word"; //$NON-NLS-0$
				viewDiv.style.overflowX = "hidden"; //$NON-NLS-0$
				viewDiv.style.overflowY = "scroll"; //$NON-NLS-0$
			} else {
				clientDiv.style.whiteSpace = "pre"; //$NON-NLS-0$
				clientDiv.style.wordWrap = "normal"; //$NON-NLS-0$
				viewDiv.style.overflowX = "auto"; //$NON-NLS-0$
				viewDiv.style.overflowY = "auto"; //$NON-NLS-0$
			}
			if (!init) {
				this.redraw();
				this._resetLineWidth();
			}
			this._resetLineHeight();
		},
		_showCaret: function (allSelection, callback, scrollAlign, pageScroll) {
			if (!this._clientDiv) { return; }
			var model = this._model;
			var selection = this._getSelection();
			var scroll = this._getScroll();
			var caret = selection.getCaret();
			var start = selection.start;
			var end = selection.end;
			var endLine = model.getLineAtOffset(end);
			var endInclusive = Math.max(Math.max(start, model.getLineStart(endLine)), end - 1);
			var clientWidth = this._getClientWidth();
			var clientHeight = this._getClientHeight();
			var minScroll = clientWidth / 4;
			var bounds = this._getBoundsAtOffset(caret === start ? start : endInclusive);
			var left = bounds.left;
			var right = bounds.right;
			var top = bounds.top;
			var bottom = bounds.bottom;
			if (allSelection && !selection.isEmpty()) {
				bounds = this._getBoundsAtOffset(caret === end ? start : endInclusive);
				if (bounds.top === top) {
					if (caret === start) {
						right = left + Math.min(bounds.right - left, clientWidth);
					} else {
						left = right - Math.min(right - bounds.left, clientWidth);
					}
				} else {
					if (caret === start) {
						bottom = top + Math.min(bounds.bottom - top, clientHeight);
					} else {
						top = bottom - Math.min(bottom - bounds.top, clientHeight);
					}
				}
			}
			var pixelX = 0;
			if (left < scroll.x) {
				pixelX = Math.min(left - scroll.x, -minScroll);
			}
			if (right > scroll.x + clientWidth) {
				pixelX = Math.max(right - scroll.x - clientWidth, minScroll);
			}
			var pixelY = 0;
			if (top < scroll.y) {
				pixelY = top - scroll.y;
			} else if (bottom > scroll.y + clientHeight) {
				pixelY = bottom - scroll.y - clientHeight;
			}
			if (pageScroll) {
				if (pageScroll > 0) {
					if (pixelY > 0) {
						pixelY = Math.max(pixelY, pageScroll);
					}
				} else {
					if (pixelY < 0) {
						pixelY = Math.min(pixelY, pageScroll);
					}
				}
			}
			if (pixelX !== 0 || pixelY !== 0) {
				if (pixelY !== 0 && typeof scrollAlign === "number") { //$NON-NLS-0$
					if (scrollAlign < 0) { scrollAlign = 0; }
					if (scrollAlign > 1) { scrollAlign = 1; }
					pixelY += Math.floor(pixelY > 0 ? scrollAlign * clientHeight : -scrollAlign * clientHeight);
				}
				this._scrollViewAnimated(pixelX, pixelY, callback);
				/*
				* When the view scrolls it is possible that one of the scrollbars can show over the caret.
				* Depending on the browser scrolling can be synchronous (Safari), in which case the change 
				* can be detected before showCaret() returns. When scrolling is asynchronous (most browsers), 
				* the detection is done during the next update page.
				*/
				if (clientHeight !== this._getClientHeight() || clientWidth !== this._getClientWidth()) {
					this._showCaret();
				} else {
					this._ensureCaretVisible = true;
				}
				return true;
			}
			return false;
		},
		_startIME: function () {
			if (this._imeOffset !== -1) { return; }
			var selection = this._getSelection();
			if (!selection.isEmpty()) {
				this._modifyContent({text: "", start: selection.start, end: selection.end}, true);
			}
			this._imeOffset = selection.start;
		},
		_unhookEvents: function() {
			this._model.removeEventListener("preChanging", this._modelListener.onChanging); //$NON-NLS-0$
			this._model.removeEventListener("postChanged", this._modelListener.onChanged); //$NON-NLS-0$
			this._theme.removeEventListener("ThemeChanged", this._themeListener.onChanged); //$NON-NLS-0$
			this._modelListener = null;
			for (var i=0; i<this._handlers.length; i++) {
				var h = this._handlers[i];
				removeHandler(h.target, h.type, h.handler);
			}
			this._handlers = null;
			if (this._mutationObserver) {
				this._mutationObserver.disconnect();
				this._mutationObserver = null;
			}
		},
		_updateDOMSelection: function () {
			if (this._ignoreDOMSelection) { return; }
			if (!this._clientDiv) { return; }
			var selection = this._getSelection();
			var model = this._model;
			var startLine = model.getLineAtOffset(selection.start);
			var endLine = model.getLineAtOffset(selection.end);
			var firstNode = this._getLineNext();
			/*
			* Bug in Firefox. For some reason, after a update page sometimes the 
			* firstChild returns null incorrectly. The fix is to ignore show selection.
			*/
			if (!firstNode) { return; }
			var lastNode = this._getLinePrevious();
			
			var topNode, bottomNode, topOffset, bottomOffset;
			if (startLine < firstNode.lineIndex) {
				topNode = firstNode;
				topOffset = 0;
			} else if (startLine > lastNode.lineIndex) {
				topNode = lastNode;
				topOffset = 0;
			} else {
				topNode = this._getLineNode(startLine);
				topOffset = selection.start - model.getLineStart(startLine);
			}

			if (endLine < firstNode.lineIndex) {
				bottomNode = firstNode;
				bottomOffset = 0;
			} else if (endLine > lastNode.lineIndex) {
				bottomNode = lastNode;
				bottomOffset = 0;
			} else {
				bottomNode = this._getLineNode(endLine);
				bottomOffset = selection.end - model.getLineStart(endLine);
			}
			this._setDOMSelection(topNode, topOffset, bottomNode, bottomOffset);
		},
		_update: function(hScrollOnly) {
			if (this._redrawCount > 0) { return; }
			if (this._updateTimer) {
				var window = this._getWindow();
				window.clearTimeout(this._updateTimer);
				this._updateTimer = null;
				hScrollOnly = false;
			}
			var clientDiv = this._clientDiv;
			if (!clientDiv) { return; }
			if (this._metrics.invalid) {
				this._ignoreQueueUpdate = true;
				this._updateStyle();
				this._ignoreQueueUpdate = false;
			}
			var model = this._model;
			var scroll = this._getScroll(false);
			var viewPad = this._getViewPadding();
			var lineCount = model.getLineCount();
			var lineHeight = this._getLineHeight();
			var clientWidth = this._getClientWidth();
			if (this._wrapMode) {
				clientDiv.style.width = clientWidth + "px"; //$NON-NLS-0$
			}
			
			/*
			* topIndex - top line index of the view (maybe be particialy visible)
			* lineStart - top line minus one line (if any)
			* topIndexY - portion of the top line that is NOT visible.
			* top - topIndexY plus height of the line before top line (if any)
			*/
			var topIndex, lineStart, top, topIndexY,
				leftWidth, leftRect,
				clientHeight, scrollWidth, scrollHeight,
				totalHeight = 0, totalLineIndex = 0, tempLineHeight;
			if (this._lineHeight) {
				while (totalLineIndex < lineCount) {
					tempLineHeight = this._getLineHeight(totalLineIndex);
					if (totalHeight + tempLineHeight > scroll.y) {
						break;
					}
					totalHeight += tempLineHeight;
					totalLineIndex++;
				}
				topIndex = totalLineIndex;
				lineStart = Math.max(0, topIndex - 1);
				topIndexY = top = scroll.y - totalHeight;
				if (topIndex > 0) {
					top += this._getLineHeight(topIndex - 1);
				}
			} else {
				var firstLine = Math.max(0, scroll.y) / lineHeight;
				topIndex = Math.floor(firstLine);
				lineStart = Math.max(0, topIndex - 1);
				top = Math.round((firstLine - lineStart) * lineHeight);
				topIndexY = Math.round((firstLine - topIndex) * lineHeight);
				scrollHeight = lineCount * lineHeight;
			}
			this._topIndexY = topIndexY;
			var parent = this._parent;
			var parentWidth = parent.clientWidth;
			var parentHeight = parent.clientHeight;
			clientHeight = this._getClientHeight();
			if (hScrollOnly) {
				leftWidth = 0;
				if (this._leftDiv) {
					leftRect = this._leftDiv.getBoundingClientRect();
					leftWidth = leftRect.right - leftRect.left;
				}
				scrollWidth = clientWidth;
				if (!this._wrapMode) {
					scrollWidth = Math.max(this._maxLineWidth, scrollWidth);
				}
				while (totalLineIndex < lineCount) {
					tempLineHeight = this._getLineHeight(totalLineIndex, false);
					totalHeight += tempLineHeight;
					totalLineIndex++;
				}
				scrollHeight = totalHeight;
			} else {

				var viewDiv = this._viewDiv;
				var linesPerPage = Math.floor((clientHeight + topIndexY) / lineHeight);
				var bottomIndex = Math.min(topIndex + linesPerPage, lineCount - 1);
				var lineEnd = Math.min(bottomIndex + 1, lineCount - 1);
				
				var lineIndex, lineWidth;
				var child = clientDiv.firstChild;
				while (child) {
					lineIndex = child.lineIndex;
					var nextChild = child.nextSibling;
					if (!(lineStart <= lineIndex && lineIndex <= lineEnd) || child.lineRemoved || child.lineIndex === -1) {
						if (this._mouseWheelLine === child) {
							child.style.display = "none"; //$NON-NLS-0$
							child.lineIndex = -1;
						} else {
							clientDiv.removeChild(child);
						}
					}
					child = nextChild;
				}
	
				child = this._getLineNext();
				var document = viewDiv.ownerDocument;
				var frag = document.createDocumentFragment();
				for (lineIndex=lineStart; lineIndex<=lineEnd; lineIndex++) {
					if (!child || child.lineIndex > lineIndex) {
						new TextLine(this, lineIndex).create(frag, null);
					} else {
						if (frag.firstChild) {
							clientDiv.insertBefore(frag, child);
							frag = document.createDocumentFragment();
						}
						if (child && child.lineChanged) {
							child = new TextLine(this, lineIndex).create(frag, child);
							child.lineChanged = false;
						}
						child = this._getLineNext(child);
					}
				}
				if (frag.firstChild) { clientDiv.insertBefore(frag, child); }
	
				/*
				* Feature in WekKit. Webkit limits the width of the lines
				* computed below to the width of the client div.  This causes
				* the lines to be wrapped even though "pre" is set.  The fix
				* is to set the width of the client div to "0x7fffffffpx"
				* before computing the lines width.  Note that this value is
				* reset to the appropriate value further down.
				*/ 
				if (util.isWebkit && !this._wrapMode) {
					clientDiv.style.width = "0x7fffffffpx"; //$NON-NLS-0$
				}
	
				var rect;
				child = this._getLineNext();
				var bottomHeight = clientHeight + top;
				var foundBottomIndex = false;
				while (child) {
					lineWidth = child.lineWidth;
					if (lineWidth === undefined) {
						rect = child._line.getBoundingClientRect();
						lineWidth = child.lineWidth = Math.ceil(rect.right - rect.left);
						if (this._lineHeight) {
							this._lineHeight[child.lineIndex] = Math.ceil(rect.bottom - rect.top);
						}
					}
					if (this._lineHeight && !foundBottomIndex) {
						bottomHeight -= this._lineHeight[child.lineIndex];
						if (bottomHeight < 0) {
							bottomIndex = child.lineIndex;
							foundBottomIndex = true;
						}
					}
					if (!this._wrapMode) {
						if (lineWidth >= this._maxLineWidth) {
							this._maxLineWidth = lineWidth;
							this._maxLineIndex = child.lineIndex;
						}
						if (this._checkMaxLineIndex === child.lineIndex) { this._checkMaxLineIndex = -1; }
					}
					if (child.lineIndex === topIndex) { this._topChild = child; }
					if (child.lineIndex === bottomIndex) { this._bottomChild = child; }
					child = this._getLineNext(child);
				}
				if (this._checkMaxLineIndex !== -1) {
					lineIndex = this._checkMaxLineIndex;
					this._checkMaxLineIndex = -1;
					if (0 <= lineIndex && lineIndex < lineCount) {
						var line = new TextLine(this, lineIndex);
						rect = line.getBoundingClientRect();
						lineWidth = rect.right - rect.left;
						if (lineWidth >= this._maxLineWidth) {
							this._maxLineWidth = lineWidth;
							this._maxLineIndex = lineIndex;
						}
						line.destroy();
					}
				}
				
				while (totalLineIndex < lineCount) {
					tempLineHeight = this._getLineHeight(totalLineIndex, totalLineIndex <= bottomIndex);
					totalHeight += tempLineHeight;
					totalLineIndex++;
				}
				scrollHeight = totalHeight;
	
				// Update rulers
				this._updateRuler(this._leftDiv, topIndex, lineEnd, parentHeight);
				this._updateRuler(this._rightDiv, topIndex, lineEnd, parentHeight);
				
				leftWidth = 0;
				if (this._leftDiv) {
					leftRect = this._leftDiv.getBoundingClientRect();
					leftWidth = leftRect.right - leftRect.left;
				}
				var rightWidth = 0;
				if (this._rightDiv) {
					var rightRect = this._rightDiv.getBoundingClientRect();
					rightWidth = rightRect.right - rightRect.left;
				}
				viewDiv.style.left = leftWidth + "px"; //$NON-NLS-0$
				viewDiv.style.right = rightWidth + "px"; //$NON-NLS-0$

				/* Need to set the height first in order for the width to consider the vertical scrollbar */
				var scrollDiv = this._scrollDiv;
				scrollDiv.style.height = scrollHeight + "px"; //$NON-NLS-0$
				/*
				* TODO if frameHeightWithoutHScrollbar < scrollHeight  < frameHeightWithHScrollbar and the horizontal bar is visible, 
				* then the clientWidth is wrong because the vertical scrollbar is showing. To correct code should hide both scrollbars 
				* at this point.
				*/
				clientWidth = this._getClientWidth();
				var width = clientWidth;
				if (!this._wrapMode) {
					width = Math.max(this._maxLineWidth, width);
				}
				/*
				* Except by IE 8 and earlier, all other browsers are not allocating enough space for the right padding 
				* in the scrollbar. It is possible this a bug since all other paddings are considered.
				*/
				scrollWidth = width;
				if ((!util.isIE || util.isIE >= 9) && this._maxLineWidth > clientWidth) { width += viewPad.right + viewPad.left; }
				scrollDiv.style.width = width + "px"; //$NON-NLS-0$
				if (this._clipScrollDiv) {
					this._clipScrollDiv.style.width = width + "px"; //$NON-NLS-0$
				}
				/* Get the left scroll after setting the width of the scrollDiv as this can change the horizontal scroll offset. */
				scroll = this._getScroll(false);
			}
			if (this._vScrollDiv) {
				var trackHeight = clientHeight - 8;
				var thumbHeight = Math.max(15, Math.ceil(Math.min(1, trackHeight / (scrollHeight + viewPad.top + viewPad.bottom)) * trackHeight));
				this._vScrollDiv.style.left = (leftWidth + clientWidth - 8) + "px"; //$NON-NLS-0$
				this._vScrollDiv.style.top = Math.floor(Math.max(0, (scroll.y * trackHeight / scrollHeight))) + "px"; //$NON-NLS-0$
				this._vScrollDiv.style.height = thumbHeight + "px"; //$NON-NLS-0$
			}
			if (!this._wrapMode && this._hScrollDiv) {
				var trackWidth = clientWidth - 8;
				var thumbWidth = Math.max(15, Math.ceil(Math.min(1, trackWidth / (this._maxLineWidth + viewPad.left + viewPad.right)) * trackWidth));
				this._hScrollDiv.style.left = leftWidth + Math.floor(Math.max(0, Math.floor(scroll.x * trackWidth / this._maxLineWidth))) + "px"; //$NON-NLS-0$
				this._hScrollDiv.style.top = (clientHeight - 9) + "px"; //$NON-NLS-0$
				this._hScrollDiv.style.width = thumbWidth + "px"; //$NON-NLS-0$
			}
			var left = scroll.x;	
			var clipDiv = this._clipDiv;
			var overlayDiv = this._overlayDiv;
			var clipLeft, clipTop;
			if (clipDiv) {
				clipDiv.scrollLeft = left;			
				clipLeft = leftWidth + viewPad.left;
				clipTop = viewPad.top;
				var clipWidth = clientWidth;
				var clipHeight = clientHeight;
				var clientLeft = 0, clientTop = -top;
				if (scroll.x === 0) {
					clipLeft -= viewPad.left;
					clipWidth += viewPad.left;
					clientLeft = viewPad.left;
				} 
				if (scroll.x + clientWidth === scrollWidth) {
					clipWidth += viewPad.right;
				}
				if (scroll.y === 0) {
					clipTop -= viewPad.top;
					clipHeight += viewPad.top;
					clientTop += viewPad.top;
				}
				if (scroll.y + clientHeight === scrollHeight) { 
					clipHeight += viewPad.bottom; 
				}
				clipDiv.style.left = clipLeft + "px"; //$NON-NLS-0$
				clipDiv.style.top = clipTop + "px"; //$NON-NLS-0$
				clipDiv.style.right = (parentWidth - clipWidth - clipLeft) + "px"; //$NON-NLS-0$
				clipDiv.style.bottom = (parentHeight - clipHeight - clipTop) + "px"; //$NON-NLS-0$
				clientDiv.style.left = clientLeft + "px"; //$NON-NLS-0$
				clientDiv.style.top = clientTop + "px"; //$NON-NLS-0$
				clientDiv.style.width = scrollWidth + "px"; //$NON-NLS-0$
				clientDiv.style.height = (clientHeight + top) + "px"; //$NON-NLS-0$
				if (overlayDiv) {
					overlayDiv.style.left = clientDiv.style.left;
					overlayDiv.style.top = clientDiv.style.top;
					overlayDiv.style.width = clientDiv.style.width;
					overlayDiv.style.height = clientDiv.style.height;
				}
			} else {
				clipLeft = left;
				clipTop = top;
				var clipRight = left + clientWidth;
				var clipBottom = top + clientHeight;
				if (clipLeft === 0) { clipLeft -= viewPad.left; }
				if (clipTop === 0) { clipTop -= viewPad.top; }
				if (clipRight === scrollWidth) { clipRight += viewPad.right; }
				if (scroll.y + clientHeight === scrollHeight) { clipBottom += viewPad.bottom; }
				clientDiv.style.clip = "rect(" + clipTop + "px," + clipRight + "px," + clipBottom + "px," + clipLeft + "px)"; //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
				clientDiv.style.left = (-left + leftWidth + viewPad.left) + "px"; //$NON-NLS-0$
				clientDiv.style.width = (util.isWebkit ? scrollWidth : clientWidth + left) + "px"; //$NON-NLS-0$
				if (!hScrollOnly) {
					clientDiv.style.top = (-top + viewPad.top) + "px"; //$NON-NLS-0$
					clientDiv.style.height = (clientHeight + top) + "px"; //$NON-NLS-0$
				}
				if (overlayDiv) {
					overlayDiv.style.clip = clientDiv.style.clip;
					overlayDiv.style.left = clientDiv.style.left;
					overlayDiv.style.width = clientDiv.style.width;
					if (!hScrollOnly) {
						overlayDiv.style.top = clientDiv.style.top;
						overlayDiv.style.height = clientDiv.style.height;
					}
				}
			}
			this._updateDOMSelection();

			/*
			* If the client height changed during the update page it means that scrollbar has either been shown or hidden.
			* When this happens update page has to run again to ensure that the top and bottom lines div are correct.
			* 
			* Note: On IE, updateDOMSelection() has to be called before getting the new client height because it
			* forces the client area to be recomputed.
			*/
			var ensureCaretVisible = this._ensureCaretVisible;
			this._ensureCaretVisible = false;
			if (clientHeight !== this._getClientHeight()) {
				this._update();
				if (ensureCaretVisible) {
					this._showCaret();
				}
			}
		},
		_updateRuler: function (divRuler, topIndex, bottomIndex, parentHeight) {
			if (!divRuler) { return; }
			var document = this._parent.ownerDocument;
			var lineHeight = this._getLineHeight();
			var viewPad = this._getViewPadding();
			var div = divRuler.firstChild;
			while (div) {
				var ruler = div._ruler;
				var offset = lineHeight;
				var overview = ruler.getOverview();
				if (overview === "page") { offset += this._topIndexY; } //$NON-NLS-0$
				div.style.top = -offset + "px"; //$NON-NLS-0$
				div.style.height = (parentHeight + offset) + "px"; //$NON-NLS-0$
				
				if (div.rulerChanged) {
					applyStyle(ruler.getRulerStyle(), div);
				}
				
				var widthDiv;
				var child = div.firstChild;
				if (child) {
					widthDiv = child;
					child = child.nextSibling;
				} else {
					widthDiv = util.createElement(document, "div"); //$NON-NLS-0$
					widthDiv.style.visibility = "hidden"; //$NON-NLS-0$
					div.appendChild(widthDiv);
				}
				var lineIndex, annotation;
				if (div.rulerChanged) {
					if (widthDiv) {
						lineIndex = -1;
						annotation = ruler.getWidestAnnotation();
						if (annotation) {
							applyStyle(annotation.style, widthDiv);
							if (annotation.html) {
								widthDiv.innerHTML = annotation.html;
							}
						}
						widthDiv.lineIndex = lineIndex;
						widthDiv.style.height = (lineHeight + viewPad.top) + "px"; //$NON-NLS-0$
					}
				}

				var lineDiv, frag, annotations;
				if (overview === "page") { //$NON-NLS-0$
					annotations = ruler.getAnnotations(topIndex, bottomIndex + 1);
					while (child) {
						lineIndex = child.lineIndex;
						var nextChild = child.nextSibling;
						if (!(topIndex <= lineIndex && lineIndex <= bottomIndex) || child.lineChanged) {
							div.removeChild(child);
						}
						child = nextChild;
					}
					child = div.firstChild.nextSibling;
					frag = document.createDocumentFragment();
					for (lineIndex=topIndex; lineIndex<=bottomIndex; lineIndex++) {
						if (!child || child.lineIndex > lineIndex) {
							lineDiv = util.createElement(document, "div"); //$NON-NLS-0$
							annotation = annotations[lineIndex];
							if (annotation) {
								applyStyle(annotation.style, lineDiv);
								if (annotation.html) {
									lineDiv.innerHTML = annotation.html;
								}
								lineDiv.annotation = annotation;
							}
							lineDiv.lineIndex = lineIndex;
							lineDiv.style.height = this._getLineHeight(lineIndex) + "px"; //$NON-NLS-0$
							frag.appendChild(lineDiv);
						} else {
							if (frag.firstChild) {
								div.insertBefore(frag, child);
								frag = document.createDocumentFragment();
							}
							if (child) {
								child = child.nextSibling;
							}
						}
					}
					if (frag.firstChild) { div.insertBefore(frag, child); }
				} else {
					var clientHeight = this._getClientHeight ();
					var lineCount = this._model.getLineCount ();
					var contentHeight = lineHeight * lineCount;
					var trackHeight = clientHeight + viewPad.top + viewPad.bottom - 2 * this._metrics.scrollWidth;
					var divHeight;
					if (contentHeight < trackHeight) {
						divHeight = lineHeight;
					} else {
						divHeight = trackHeight / lineCount;
					}
					if (div.rulerChanged) {
						var count = div.childNodes.length;
						while (count > 1) {
							div.removeChild(div.lastChild);
							count--;
						}
						annotations = ruler.getAnnotations(0, lineCount);
						frag = document.createDocumentFragment();
						for (var prop in annotations) {
							lineIndex = prop >>> 0;
							if (lineIndex < 0) { continue; }
							lineDiv = util.createElement(document, "div"); //$NON-NLS-0$
							annotation = annotations[prop];
							applyStyle(annotation.style, lineDiv);
							lineDiv.style.position = "absolute"; //$NON-NLS-0$
							lineDiv.style.top = this._metrics.scrollWidth + lineHeight + Math.floor(lineIndex * divHeight) + "px"; //$NON-NLS-0$
							if (annotation.html) {
								lineDiv.innerHTML = annotation.html;
							}
							lineDiv.annotation = annotation;
							lineDiv.lineIndex = lineIndex;
							frag.appendChild(lineDiv);
						}
						div.appendChild(frag);
					} else if (div._oldTrackHeight !== trackHeight) {
						lineDiv = div.firstChild ? div.firstChild.nextSibling : null;
						while (lineDiv) {
							lineDiv.style.top = this._metrics.scrollWidth + lineHeight + Math.floor(lineDiv.lineIndex * divHeight) + "px"; //$NON-NLS-0$
							lineDiv = lineDiv.nextSibling;
						}
					}
					div._oldTrackHeight = trackHeight;
				}
				div.rulerChanged = false;
				div = div.nextSibling;
			}
		},
		_updateStyleSheet: function() {
			var styleText = "";
			if (util.isWebkit && this._metrics.scrollWidth > 0) {
				styleText += "\n.textview ::-webkit-scrollbar-corner {background: #eeeeee;}"; //$NON-NLS-0$
			}
			if (util.isFirefox && util.isMac && this._highlightRGB && this._highlightRGB !== "Highlight") { //$NON-NLS-0$
				styleText += "\n.textview ::-moz-selection {background: " + this._highlightRGB + ";}"; //$NON-NLS-1$ //$NON-NLS-0$
			}
			if (styleText) {
				var node = document.getElementById("_textviewStyle"); //$NON-NLS-0$
				if (!node) {
					node = util.createElement(document, "style"); //$NON-NLS-0$
					node.id = "_textviewStyle"; //$NON-NLS-0$
					var head = document.getElementsByTagName("head")[0] || document.documentElement; //$NON-NLS-0$
					node.appendChild(document.createTextNode(styleText));
					head.insertBefore(node, head.firstChild);
				} else {
					node.removeChild(node.firstChild);
					node.appendChild(document.createTextNode(styleText));
				}
			}
		},
		_updateStyle: function (init) {
			if (!init && util.isIE) {
				this._rootDiv.style.lineHeight = "normal"; //$NON-NLS-0$
			}
			var metrics = this._metrics = this._calculateMetrics();
			if (util.isIE) {
				this._rootDiv.style.lineHeight = (metrics.lineHeight - (metrics.lineTrim.top + metrics.lineTrim.bottom)) + "px"; //$NON-NLS-0$
			} else {
				this._rootDiv.style.lineHeight = "normal"; //$NON-NLS-0$
			}
			this._updateStyleSheet();
			if (!init) {
				this.redraw();
				this._resetLineWidth();
			}
		}
	};//end prototype
	mEventTarget.EventTarget.addMixin(TextView.prototype);
	
	return {TextView: TextView};
});


/**
 * @license RequireJS i18n 1.0.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint regexp: false, nomen: false, plusplus: false, strict: false */
/*global require: false, navigator: false, define: false */

/**
 * This plugin handles i18n! prefixed modules. It does the following:
 *
 * 1) A regular module can have a dependency on an i18n bundle, but the regular
 * module does not want to specify what locale to load. So it just specifies
 * the top-level bundle, like "i18n!nls/colors".
 *
 * This plugin will load the i18n bundle at nls/colors, see that it is a root/master
 * bundle since it does not have a locale in its name. It will then try to find
 * the best match locale available in that master bundle, then request all the
 * locale pieces for that best match locale. For instance, if the locale is "en-us",
 * then the plugin will ask for the "en-us", "en" and "root" bundles to be loaded
 * (but only if they are specified on the master bundle).
 *
 * Once all the bundles for the locale pieces load, then it mixes in all those
 * locale pieces into each other, then finally sets the context.defined value
 * for the nls/colors bundle to be that mixed in locale.
 *
 * 2) A regular module specifies a specific locale to load. For instance,
 * i18n!nls/fr-fr/colors. In this case, the plugin needs to load the master bundle
 * first, at nls/colors, then figure out what the best match locale is for fr-fr,
 * since maybe only fr or just root is defined for that locale. Once that best
 * fit is found, all of its locale pieces need to have their bundles loaded.
 *
 * Once all the bundles for the locale pieces load, then it mixes in all those
 * locale pieces into each other, then finally sets the context.defined value
 * for the nls/fr-fr/colors bundle to be that mixed in locale.
 */
(function () {
    //regexp for reconstructing the master bundle name from parts of the regexp match
    //nlsRegExp.exec("foo/bar/baz/nls/en-ca/foo") gives:
    //["foo/bar/baz/nls/en-ca/foo", "foo/bar/baz/nls/", "/", "/", "en-ca", "foo"]
    //nlsRegExp.exec("foo/bar/baz/nls/foo") gives:
    //["foo/bar/baz/nls/foo", "foo/bar/baz/nls/", "/", "/", "foo", ""]
    //so, if match[5] is blank, it means this is the top bundle definition.
    var nlsRegExp = /(^.*(^|\/)nls(\/|$))([^\/]*)\/?([^\/]*)/,
        empty = {};

    //Helper function to avoid repeating code. Lots of arguments in the
    //desire to stay functional and support RequireJS contexts without having
    //to know about the RequireJS contexts.
    function addPart(locale, master, needed, toLoad, prefix, suffix) {
        if (master[locale]) {
            needed.push(locale);
            if (master[locale] === true || master[locale] === 1) {
                toLoad.push(prefix + locale + '/' + suffix);
            }
        }
    }

    function addIfExists(req, locale, toLoad, prefix, suffix) {
        var fullName = prefix + locale + '/' + suffix;
        if (require._fileExists(req.toUrl(fullName))) {
            toLoad.push(fullName);
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     * This is not robust in IE for transferring methods that match
     * Object.prototype names, but the uses of mixin here seem unlikely to
     * trigger a problem related to that.
     */
    function mixin(target, source, force) {
        for (var prop in source) {
            if (!(prop in empty) && (!(prop in target) || force)) {
                target[prop] = source[prop];
            }
        }
    }

    define('i18n',{
        version: '1.0.0',
        /**
         * Called when a dependency needs to be loaded.
         */
        load: function (name, req, onLoad, config) {
            config = config || {};

            var masterName,
                match = nlsRegExp.exec(name),
                prefix = match[1],
                locale = match[4],
                suffix = match[5],
                parts = locale.split("-"),
                toLoad = [],
                value = {},
                i, part, current = "";

            //If match[5] is blank, it means this is the top bundle definition,
            //so it does not have to be handled. Locale-specific requests
            //will have a match[4] value but no match[5]
            if (match[5]) {
                //locale-specific bundle
                prefix = match[1];
                masterName = prefix + suffix;
            } else {
                //Top-level bundle.
                masterName = name;
                suffix = match[4];
                locale = config.locale || (config.locale =
                        typeof navigator === "undefined" ? "root" :
                        (navigator.language ||
                         navigator.userLanguage || "root").toLowerCase());
                parts = locale.split("-");
            }

            if (config.isBuild) {
                //Check for existence of all locale possible files and
                //require them if exist.
                toLoad.push(masterName);
                addIfExists(req, "root", toLoad, prefix, suffix);
                for (i = 0; (part = parts[i]); i++) {
                    current += (current ? "-" : "") + part;
                    addIfExists(req, current, toLoad, prefix, suffix);
                }

                req(toLoad, function () {
                    onLoad();
                });
            } else {
                //First, fetch the master bundle, it knows what locales are available.
                req([masterName], function (master) {
                    //Figure out the best fit
                    var needed = [];

                    //Always allow for root, then do the rest of the locale parts.
                    addPart("root", master, needed, toLoad, prefix, suffix);
                    for (i = 0; (part = parts[i]); i++) {
                        current += (current ? "-" : "") + part;
                        addPart(current, master, needed, toLoad, prefix, suffix);
                    }

                    //Load all the parts missing.
                    req(toLoad, function () {
                        var i, partBundle;
                        for (i = needed.length - 1; i > -1 && (part = needed[i]); i--) {
                            partBundle = master[part];
                            if (partBundle === true || partBundle === 1) {
                                partBundle = req(prefix + part + '/' + suffix);
                            }
                            mixin(value, partBundle);
                        }

                        //All done, notify the loader.
                        onLoad(value);
                    });
                });
            }
        }
    });
}());

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*global define */
define('orion/editor/i18n',{
	load: function(name, parentRequire, onLoad, config) {
		if (parentRequire.specified && parentRequire.specified("orion/bootstrap")) { //$NON-NLS-0$
			parentRequire(["orion/i18n!" + name], function(languages) { //$NON-NLS-0$
				onLoad(languages);
			});
		} else {
			onLoad({});
		}
	}
});

/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/

//NLS_CHARSET=UTF-8

/*global define*/

define('orion/editor/nls/root/messages',{
	"multipleAnnotations": "Multiple annotations:", //$NON-NLS-1$ //$NON-NLS-0$
	"line": "Line: ${0}", //$NON-NLS-1$ //$NON-NLS-0$
	"breakpoint": "Breakpoint", //$NON-NLS-1$ //$NON-NLS-0$
	"bookmark": "Bookmark", //$NON-NLS-1$ //$NON-NLS-0$
	"task": "Task", //$NON-NLS-1$ //$NON-NLS-0$
	"error": "Error", //$NON-NLS-1$ //$NON-NLS-0$
	"warning": "Warning", //$NON-NLS-1$ //$NON-NLS-0$
	"matchingSearch": "Matching Search", //$NON-NLS-1$ //$NON-NLS-0$
	"currentSearch": "Current Search", //$NON-NLS-1$ //$NON-NLS-0$
	"currentLine": "Current Line", //$NON-NLS-1$ //$NON-NLS-0$
	"matchingBracket": "Matching Bracket", //$NON-NLS-1$ //$NON-NLS-0$
	"currentBracket": "Current Bracket", //$NON-NLS-1$ //$NON-NLS-0$
			
	"Comment": "Comment",
	"Flat outline": "Flat outline",
	"incrementalFind": "Incremental find: ${0}",
	"incrementalFindNotFound": "Incremental find: ${0} (not found)",
	"find": "Find...",
	"undo": "Undo",
	"redo": "Redo",
	"cancelMode": "Cancel Current Mode",
	"findNext": "Find Next Occurrence",
	"findPrevious": "Find Previous Occurrence",
	"incrementalFindKey": "Incremental Find",
	"indentLines": "Indent Lines",
	"unindentLines": "Unindent Lines",
	"moveLinesUp": "Move Lines Up",
	"moveLinesDown": "Move Lines Down",
	"copyLinesUp": "Copy Lines Up",
	"copyLinesDown": "Copy Lines Down",
	"deleteLines": "Delete Lines",
	"gotoLine": "Goto Line...",
	"gotoLinePrompty": "Goto Line:",
	"nextAnnotation": "Next Annotation",
	"prevAnnotation": "Previous Annotation",
	"expand": "Expand",
	"collapse": "Collapse",
	"expandAll": "Expand All", 
	"collapseAll": "Collapse All",
	"lastEdit": "Last Edit Location",
	"toggleLineComment": "Toggle Line Comment",
	"addBlockComment": "Add Block Comment",
	"removeBlockComment": "Remove Block Comment",
	"linkedModeEntered": "Linked Mode entered",
	"linkedModeExited": "Linked Mode exited",
	"syntaxError": "Syntax Error",
	"contentAssist": "Content Assist",
	"lineColumn": "Line ${0} : Col ${1}"
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/

/*global define*/

define('orion/editor/nls/messages',['orion/editor/i18n!orion/editor/nls/messages', 'orion/editor/nls/root/messages'], function(bundle, root) {
	var result = {
		root: root
	};
	for (var key in bundle) {
		if (bundle.hasOwnProperty(key)) {
			if (typeof result[key] === 'undefined') {
				result[key] = bundle[key];
			}
		}
	}
	return result;
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/

/*global define */

define("orion/editor/annotations", ['i18n!orion/editor/nls/messages', 'orion/editor/eventTarget'], function(messages, mEventTarget) { //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	/**
	 * @class This object represents a decoration attached to a range of text. Annotations are added to a
	 * <code>AnnotationModel</code> which is attached to a <code>TextModel</code>.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.AnnotationModel}<br/>
	 * {@link orion.editor.Ruler}<br/>
	 * </p>		 
	 * @name orion.editor.Annotation
	 * 
	 * @property {String} type The annotation type (for example, orion.annotation.error).
	 * @property {Number} start The start offset of the annotation in the text model.
	 * @property {Number} end The end offset of the annotation in the text model.
	 * @property {String} html The HTML displayed for the annotation.
	 * @property {String} title The text description for the annotation.
	 * @property {orion.editor.Style} style The style information for the annotation used in the annotations ruler and tooltips.
	 * @property {orion.editor.Style} overviewStyle The style information for the annotation used in the overview ruler.
	 * @property {orion.editor.Style} rangeStyle The style information for the annotation used in the text view to decorate a range of text.
	 * @property {orion.editor.Style} lineStyle The style information for the annotation used in the text view to decorate a line of text.
	 */
	/**
	 * Constructs a new folding annotation.
	 * 
	 * @param {Number} start The start offset of the annotation in the text model.
	 * @param {Number} end The end offset of the annotation in the text model.
	 * @param {orion.editor.ProjectionTextModel} projectionModel The projection text model.
	 * 
	 * @class This object represents a folding annotation.
	 * @name orion.editor.FoldingAnnotation
	 */
	function FoldingAnnotation (start, end, projectionModel) {
		this.start = start;
		this.end = end;
		this._projectionModel = projectionModel;
		this.html = this._expandedHTML;
		this.style = this._expandedStyle;
		this.expanded = true;
	}
	
	FoldingAnnotation.prototype = /** @lends orion.editor.FoldingAnnotation.prototype */ {
		_expandedHTML: "<div class='annotationHTML expanded'></div>", //$NON-NLS-0$
		_expandedStyle: {styleClass: "annotation expanded"}, //$NON-NLS-0$
		_collapsedHTML: "<div class='annotationHTML collapsed'></div>", //$NON-NLS-0$
		_collapsedStyle: {styleClass: "annotation collapsed"}, //$NON-NLS-0$
		/**
		 * Collapses the annotation.
		 */
		collapse: function () {
			if (!this.expanded) { return; }
			this.expanded = false;
			this.html = this._collapsedHTML;
			this.style = this._collapsedStyle;
			var projectionModel = this._projectionModel;
			var baseModel = projectionModel.getBaseModel();
			this._projection = {
				start: baseModel.getLineStart(baseModel.getLineAtOffset(this.start) + 1),
				end: baseModel.getLineEnd(baseModel.getLineAtOffset(this.end), true)
			};
			projectionModel.addProjection(this._projection);
		},
		/**
		 * Expands the annotation.
		 */
		expand: function () {
			if (this.expanded) { return; }
			this.expanded = true;
			this.html = this._expandedHTML;
			this.style = this._expandedStyle;
			this._projectionModel.removeProjection(this._projection);
		}
	};
	 
	/**
	 * @class This object represents a regitry of annotation types.
	 * @name orion.editor.AnnotationType
	 */
	function AnnotationType() {
	}
	
	/**
	 * Error annotation type.
	 */
	AnnotationType.ANNOTATION_ERROR = "orion.annotation.error"; //$NON-NLS-0$
	/**
	 * Warning annotation type.
	 */
	AnnotationType.ANNOTATION_WARNING = "orion.annotation.warning"; //$NON-NLS-0$
	/**
	 * Task annotation type.
	 */
	AnnotationType.ANNOTATION_TASK = "orion.annotation.task"; //$NON-NLS-0$
	/**
	 * Breakpoint annotation type.
	 */
	AnnotationType.ANNOTATION_BREAKPOINT = "orion.annotation.breakpoint"; //$NON-NLS-0$
	/**
	 * Bookmark annotation type.
	 */
	AnnotationType.ANNOTATION_BOOKMARK = "orion.annotation.bookmark"; //$NON-NLS-0$
	/**
	 * Folding annotation type.
	 */
	AnnotationType.ANNOTATION_FOLDING = "orion.annotation.folding"; //$NON-NLS-0$
	/**
	 * Curent bracket annotation type.
	 */
	AnnotationType.ANNOTATION_CURRENT_BRACKET = "orion.annotation.currentBracket"; //$NON-NLS-0$
	/**
	 * Matching bracket annotation type.
	 */
	AnnotationType.ANNOTATION_MATCHING_BRACKET = "orion.annotation.matchingBracket"; //$NON-NLS-0$
	/**
	 * Current line annotation type.
	 */
	AnnotationType.ANNOTATION_CURRENT_LINE = "orion.annotation.currentLine"; //$NON-NLS-0$
	/**
	 * Current search annotation type.
	 */
	AnnotationType.ANNOTATION_CURRENT_SEARCH = "orion.annotation.currentSearch"; //$NON-NLS-0$
	/**
	 * Matching search annotation type.
	 */
	AnnotationType.ANNOTATION_MATCHING_SEARCH = "orion.annotation.matchingSearch"; //$NON-NLS-0$
	/**
	 * Read Occurrence annotation type.
	 */
	AnnotationType.ANNOTATION_READ_OCCURRENCE = "orion.annotation.readOccurrence"; //$NON-NLS-0$
	/**
	 * Write Occurrence annotation type.
	 */
	AnnotationType.ANNOTATION_WRITE_OCCURRENCE = "orion.annotation.writeOccurrence"; //$NON-NLS-0$
	
	/** @private */
	var annotationTypes = {};
	
	/**
	 * Register an annotation type.
	 *
	 * @param {String} type The annotation type (for example, orion.annotation.error).
	 * @param {Object|Function} properties The common annotation properties of the registered
	 *		annotation type. All annotations create with this annotation type will expose these
	 *		properties.
	 */
	AnnotationType.registerType = function(type, properties) {
		var constructor = properties;
		if (typeof constructor !== "function") { //$NON-NLS-0$
			constructor = function(start, end, title) {
				this.start = start;
				this.end = end;
				if (title) { this.title = title; }
			};
			constructor.prototype = properties;
		}
		constructor.prototype.type = type;
		annotationTypes[type] = constructor;
		return type;
	};
	
	/**
	 * Creates an annotation of a given type with the specified start end end offsets.
	 *
	 * @param {String} type The annotation type (for example, orion.annotation.error).
	 * @param {Number} start The start offset of the annotation in the text model.
	 * @param {Number} end The end offset of the annotation in the text model.
	 * @param {String} [title] The text description for the annotation if different then the type description.
	 * @return {orion.editor.Annotation} the new annotation
	 */
	AnnotationType.createAnnotation = function(type, start, end, title) {
		return new (this.getType(type))(start, end, title);
	};
	
	/**
	 * Gets the registered annotation type with specified type. The returned
	 * value is a constructor that can be used to create annotations of the
	 * speficied type.  The constructor takes the start and end offsets of
	 * the annotation.
	 *
	 * @param {String} type The annotation type (for example, orion.annotation.error).
	 * @return {Function} The annotation type constructor ( i.e function(start, end, title) ).
	 */
	AnnotationType.getType = function(type) {
		return annotationTypes[type];
	};
	
	/** @private */
	function registerType(type, lineStyling) {
		var index = type.lastIndexOf('.'); //$NON-NLS-0$
		var suffix = type.substring(index + 1);
		var properties = {
			title: messages[suffix],
			style: {styleClass: "annotation " + suffix}, //$NON-NLS-0$
			html: "<div class='annotationHTML " + suffix + "'></div>", //$NON-NLS-1$ //$NON-NLS-0$
			overviewStyle: {styleClass: "annotationOverview " + suffix} //$NON-NLS-0$
		};
		if (lineStyling) {
			properties.lineStyle = {styleClass: "annotationLine " + suffix}; //$NON-NLS-0$
		} else {
			properties.rangeStyle = {styleClass: "annotationRange " + suffix}; //$NON-NLS-0$
		}
		AnnotationType.registerType(type, properties);
	}
	registerType(AnnotationType.ANNOTATION_ERROR);
	registerType(AnnotationType.ANNOTATION_WARNING);
	registerType(AnnotationType.ANNOTATION_TASK);
	registerType(AnnotationType.ANNOTATION_BREAKPOINT);
	registerType(AnnotationType.ANNOTATION_BOOKMARK);
	registerType(AnnotationType.ANNOTATION_CURRENT_BRACKET);
	registerType(AnnotationType.ANNOTATION_MATCHING_BRACKET);
	registerType(AnnotationType.ANNOTATION_CURRENT_SEARCH);
	registerType(AnnotationType.ANNOTATION_MATCHING_SEARCH);
	registerType(AnnotationType.ANNOTATION_READ_OCCURRENCE);
	registerType(AnnotationType.ANNOTATION_WRITE_OCCURRENCE);
	registerType(AnnotationType.ANNOTATION_CURRENT_LINE, true);
	AnnotationType.registerType(AnnotationType.ANNOTATION_FOLDING, FoldingAnnotation);
	
	/** 
	 * Constructs a new AnnotationTypeList object.
	 * 
	 * @class This represents an interface of prioritized annotation types.
	 * @name orion.editor.AnnotationTypeList
	 */
	function AnnotationTypeList () {
	}
	/**
	 * Adds in the annotation type interface into the specified object.
	 *
	 * @param {Object} object The object to add in the annotation type interface.
	 */
	AnnotationTypeList.addMixin = function(object) {
		var proto = AnnotationTypeList.prototype;
		for (var p in proto) {
			if (proto.hasOwnProperty(p)) {
				object[p] = proto[p];
			}
		}
	};	
	AnnotationTypeList.prototype = /** @lends orion.editor.AnnotationTypeList.prototype */ {
		/**
		 * Adds an annotation type to the receiver.
		 * <p>
		 * Only annotations of the specified types will be shown by
		 * the receiver.
		 * </p>
		 *
		 * @param {Object} type the annotation type to be shown
		 * 
		 * @see #removeAnnotationType
		 * @see #isAnnotationTypeVisible
		 */
		addAnnotationType: function(type) {
			if (!this._annotationTypes) { this._annotationTypes = []; }
			this._annotationTypes.push(type);
		},
		/**
		 * Gets the annotation type priority.  The priority is determined by the
		 * order the annotation type is added to the receiver.  Annotation types
		 * added first have higher priority.
		 * <p>
		 * Returns <code>0</code> if the annotation type is not added.
		 * </p>
		 *
		 * @param {Object} type the annotation type
		 * 
		 * @see #addAnnotationType
		 * @see #removeAnnotationType
		 * @see #isAnnotationTypeVisible
		 */
		getAnnotationTypePriority: function(type) {
			if (this._annotationTypes) { 
				for (var i = 0; i < this._annotationTypes.length; i++) {
					if (this._annotationTypes[i] === type) {
						return i + 1;
					}
				}
			}
			return 0;
		},
		/**
		 * Returns an array of annotations in the specified annotation model for the given range of text sorted by type.
		 *
		 * @param {orion.editor.AnnotationModel} annotationModel the annotation model.
		 * @param {Number} start the start offset of the range.
		 * @param {Number} end the end offset of the range.
		 * @return {orion.editor.Annotation[]} an annotation array.
		 */
		getAnnotationsByType: function(annotationModel, start, end) {
			var iter = annotationModel.getAnnotations(start, end);
			var annotation, annotations = [];
			while (iter.hasNext()) {
				annotation = iter.next();
				var priority = this.getAnnotationTypePriority(annotation.type);
				if (priority === 0) { continue; }
				annotations.push(annotation);
			}
			var self = this;
			annotations.sort(function(a, b) {
				return self.getAnnotationTypePriority(a.type) - self.getAnnotationTypePriority(b.type);
			});
			return annotations;
		},
		/**
		 * Returns whether the receiver shows annotations of the specified type.
		 *
		 * @param {Object} type the annotation type 
		 * @returns {Boolean} whether the specified annotation type is shown
		 * 
		 * @see #addAnnotationType
		 * @see #removeAnnotationType
		 */
		isAnnotationTypeVisible: function(type) {
			return this.getAnnotationTypePriority(type) !== 0;
		},
		/**
		 * Removes an annotation type from the receiver.
		 *
		 * @param {Object} type the annotation type to be removed
		 * 
		 * @see #addAnnotationType
		 * @see #isAnnotationTypeVisible
		 */
		removeAnnotationType: function(type) {
			if (!this._annotationTypes) { return; }
			for (var i = 0; i < this._annotationTypes.length; i++) {
				if (this._annotationTypes[i] === type) {
					this._annotationTypes.splice(i, 1);
					break;
				}
			}
		}
	};
	
	/**
	 * Constructs an annotation model.
	 * 
	 * @param {textModel} textModel The text model.
	 * 
	 * @class This object manages annotations for a <code>TextModel</code>.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.Annotation}<br/>
	 * {@link orion.editor.TextModel}<br/> 
	 * </p>	
	 * @name orion.editor.AnnotationModel
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function AnnotationModel(textModel) {
		this._annotations = [];
		var self = this;
		this._listener = {
			onChanged: function(modelChangedEvent) {
				self._onChanged(modelChangedEvent);
			}
		};
		this.setTextModel(textModel);
	}

	AnnotationModel.prototype = /** @lends orion.editor.AnnotationModel.prototype */ {
		/**
		 * Adds an annotation to the annotation model. 
		 * <p>The annotation model listeners are notified of this change.</p>
		 * 
		 * @param {orion.editor.Annotation} annotation the annotation to be added.
		 * 
		 * @see #removeAnnotation
		 */
		addAnnotation: function(annotation) {
			if (!annotation) { return; }
			var annotations = this._annotations;
			var index = this._binarySearch(annotations, annotation.start);
			annotations.splice(index, 0, annotation);
			var e = {
				type: "Changed", //$NON-NLS-0$
				added: [annotation],
				removed: [],
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Returns the text model. 
		 * 
		 * @return {orion.editor.TextModel} The text model.
		 * 
		 * @see #setTextModel
		 */
		getTextModel: function() {
			return this._model;
		},
		/**
		 * @class This object represents an annotation iterator.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.AnnotationModel#getAnnotations}<br/>
		 * </p>		 
		 * @name orion.editor.AnnotationIterator
		 * 
		 * @property {Function} hasNext Determines whether there are more annotations in the iterator.
		 * @property {Function} next Returns the next annotation in the iterator.
		 */		
		/**
		 * Returns an iterator of annotations for the given range of text.
		 *
		 * @param {Number} start the start offset of the range.
		 * @param {Number} end the end offset of the range.
		 * @return {orion.editor.AnnotationIterator} an annotation iterartor.
		 */
		getAnnotations: function(start, end) {
			var annotations = this._annotations, current;
			//TODO binary search does not work for range intersection when there are overlaping ranges, need interval search tree for this
			var i = 0;
			var skip = function() {
				while (i < annotations.length) {
					var a =  annotations[i++];
					if ((start === a.start) || (start > a.start ? start < a.end : a.start < end)) {
						return a;
					}
					if (a.start >= end) {
						break;
					}
				}
				return null;
			};
			current = skip();
			return {
				next: function() {
					var result = current;
					if (result) { current = skip(); }
					return result;					
				},
				hasNext: function() {
					return current !== null;
				}
			};
		},
		/**
		 * Notifies the annotation model that the given annotation has been modified.
		 * <p>The annotation model listeners are notified of this change.</p>
		 * 
		 * @param {orion.editor.Annotation} annotation the modified annotation.
		 * 
		 * @see #addAnnotation
		 */
		modifyAnnotation: function(annotation) {
			if (!annotation) { return; }
			var index = this._getAnnotationIndex(annotation);
			if (index < 0) { return; }
			var e = {
				type: "Changed", //$NON-NLS-0$
				added: [],
				removed: [],
				changed: [annotation]
			};
			this.onChanged(e);
		},
		/**
		 * Notifies all listeners that the annotation model has changed.
		 *
		 * @param {orion.editor.Annotation[]} added The list of annotation being added to the model.
		 * @param {orion.editor.Annotation[]} changed The list of annotation modified in the model.
		 * @param {orion.editor.Annotation[]} removed The list of annotation being removed from the model.
		 * @param {ModelChangedEvent} textModelChangedEvent the text model changed event that trigger this change, can be null if the change was trigger by a method call (for example, {@link #addAnnotation}).
		 */
		onChanged: function(e) {
			return this.dispatchEvent(e);
		},
		/**
		 * Removes all annotations of the given <code>type</code>. All annotations
		 * are removed if the type is not specified. 
		 * <p>The annotation model listeners are notified of this change.  Only one changed event is generated.</p>
		 * 
		 * @param {Object} type the type of annotations to be removed.
		 * 
		 * @see #removeAnnotation
		 */
		removeAnnotations: function(type) {
			var annotations = this._annotations;
			var removed, i; 
			if (type) {
				removed = [];
				for (i = annotations.length - 1; i >= 0; i--) {
					var annotation = annotations[i];
					if (annotation.type === type) {
						annotations.splice(i, 1);
					}
					removed.splice(0, 0, annotation);
				}
			} else {
				removed = annotations;
				annotations = [];
			}
			var e = {
				type: "Changed", //$NON-NLS-0$
				removed: removed,
				added: [],
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Removes an annotation from the annotation model. 
		 * <p>The annotation model listeners are notified of this change.</p>
		 * 
		 * @param {orion.editor.Annotation} annotation the annotation to be removed.
		 * 
		 * @see #addAnnotation
		 */
		removeAnnotation: function(annotation) {
			if (!annotation) { return; }
			var index = this._getAnnotationIndex(annotation);
			if (index < 0) { return; }
			var e = {
				type: "Changed", //$NON-NLS-0$
				removed: this._annotations.splice(index, 1),
				added: [],
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Removes and adds the specifed annotations to the annotation model. 
		 * <p>The annotation model listeners are notified of this change.  Only one changed event is generated.</p>
		 * 
		 * @param {orion.editor.Annotation} remove the annotations to be removed.
		 * @param {orion.editor.Annotation} add the annotations to be added.
		 * 
		 * @see #addAnnotation
		 * @see #removeAnnotation
		 */
		replaceAnnotations: function(remove, add) {
			var annotations = this._annotations, i, index, annotation, removed = [];
			if (remove) {
				for (i = remove.length - 1; i >= 0; i--) {
					annotation = remove[i];
					index = this._getAnnotationIndex(annotation);
					if (index < 0) { continue; }
					annotations.splice(index, 1);
					removed.splice(0, 0, annotation);
				}
			}
			if (!add) { add = []; }
			for (i = 0; i < add.length; i++) {
				annotation = add[i];
				index = this._binarySearch(annotations, annotation.start);
				annotations.splice(index, 0, annotation);
			}
			var e = {
				type: "Changed", //$NON-NLS-0$
				removed: removed,
				added: add,
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Sets the text model of the annotation model.  The annotation
		 * model listens for changes in the text model to update and remove
		 * annotations that are affected by the change.
		 * 
		 * @param {orion.editor.TextModel} textModel the text model.
		 * 
		 * @see #getTextModel
		 */
		setTextModel: function(textModel) {
			if (this._model) {
				this._model.removeEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
			}
			this._model = textModel;
			if (this._model) {
				this._model.addEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
			}
		},
		/** @ignore */
		_binarySearch: function (array, offset) {
			var high = array.length, low = -1, index;
			while (high - low > 1) {
				index = Math.floor((high + low) / 2);
				if (offset <= array[index].start) {
					high = index;
				} else {
					low = index;
				}
			}
			return high;
		},
		/** @ignore */
		_getAnnotationIndex: function(annotation) {
			var annotations = this._annotations;
			var index = this._binarySearch(annotations, annotation.start);
			while (index < annotations.length && annotations[index].start === annotation.start) {
				if (annotations[index] === annotation) {
					return index;
				}
				index++;
			}
			return -1;
		},
		/** @ignore */
		_onChanged: function(modelChangedEvent) {
			var start = modelChangedEvent.start;
			var addedCharCount = modelChangedEvent.addedCharCount;
			var removedCharCount = modelChangedEvent.removedCharCount;
			var annotations = this._annotations, end = start + removedCharCount;
			//TODO binary search does not work for range intersection when there are overlaping ranges, need interval search tree for this
			var startIndex = 0;
			if (!(0 <= startIndex && startIndex < annotations.length)) { return; }
			var e = {
				type: "Changed", //$NON-NLS-0$
				added: [],
				removed: [],
				changed: [],
				textModelChangedEvent: modelChangedEvent
			};
			var changeCount = addedCharCount - removedCharCount, i;
			for (i = startIndex; i < annotations.length; i++) {
				var annotation = annotations[i];
				if (annotation.start >= end) {
					annotation.start += changeCount;
					annotation.end += changeCount;
					e.changed.push(annotation);
				} else if (annotation.end <= start) {
					//nothing
				} else if (annotation.start < start && end < annotation.end) {
					annotation.end += changeCount;
					e.changed.push(annotation);
				} else {
					annotations.splice(i, 1);
					e.removed.push(annotation);
					i--;
				}
			}
			if (e.added.length > 0 || e.removed.length > 0 || e.changed.length > 0) {
				this.onChanged(e);
			}
		}
	};
	mEventTarget.EventTarget.addMixin(AnnotationModel.prototype);

	/**
	 * Constructs a new styler for annotations.
	 * 
	 * @param {orion.editor.TextView} view The styler view.
	 * @param {orion.editor.AnnotationModel} view The styler annotation model.
	 * 
	 * @class This object represents a styler for annotation attached to a text view.
	 * @name orion.editor.AnnotationStyler
	 * @borrows orion.editor.AnnotationTypeList#addAnnotationType as #addAnnotationType
	 * @borrows orion.editor.AnnotationTypeList#getAnnotationTypePriority as #getAnnotationTypePriority
	 * @borrows orion.editor.AnnotationTypeList#getAnnotationsByType as #getAnnotationsByType
	 * @borrows orion.editor.AnnotationTypeList#isAnnotationTypeVisible as #isAnnotationTypeVisible
	 * @borrows orion.editor.AnnotationTypeList#removeAnnotationType as #removeAnnotationType
	 */
	function AnnotationStyler (view, annotationModel) {
		this._view = view;
		this._annotationModel = annotationModel;
		var self = this;
		this._listener = {
			onDestroy: function(e) {
				self._onDestroy(e);
			},
			onLineStyle: function(e) {
				self._onLineStyle(e);
			},
			onChanged: function(e) {
				self._onAnnotationModelChanged(e);
			}
		};
		view.addEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
		view.addEventListener("postLineStyle", this._listener.onLineStyle); //$NON-NLS-0$
		annotationModel.addEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
	}
	AnnotationStyler.prototype = /** @lends orion.editor.AnnotationStyler.prototype */ {
		/**
		 * Destroys the styler. 
		 * <p>
		 * Removes all listeners added by this styler.
		 * </p>
		 */
		destroy: function() {
			var view = this._view;
			if (view) {
				view.removeEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
				view.removeEventListener("LineStyle", this._listener.onLineStyle); //$NON-NLS-0$
				this.view = null;
			}
			var annotationModel = this._annotationModel;
			if (annotationModel) {
				annotationModel.removeEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
				annotationModel = null;
			}
		},
		_mergeStyle: function(result, style) {
			if (style) {
				if (!result) { result = {}; }
				if (result.styleClass && style.styleClass && result.styleClass !== style.styleClass) {
					result.styleClass += " " + style.styleClass; //$NON-NLS-0$
				} else {
					result.styleClass = style.styleClass;
				}
				var prop;
				if (style.style) {
					if (!result.style) { result.style  = {}; }
					for (prop in style.style) {
						if (!result.style[prop]) {
							result.style[prop] = style.style[prop];
						}
					}
				}
				if (style.attributes) {
					if (!result.attributes) { result.attributes  = {}; }
					for (prop in style.attributes) {
						if (!result.attributes[prop]) {
							result.attributes[prop] = style.attributes[prop];
						}
					}
				}
			}
			return result;
		},
		_mergeStyleRanges: function(ranges, styleRange) {
			if (!ranges) {
				ranges = [];
			}
			var mergedStyle, i;
			for (i=0; i<ranges.length && styleRange; i++) {
				var range = ranges[i];
				if (styleRange.end <= range.start) { break; }
				if (styleRange.start >= range.end) { continue; }
				mergedStyle = this._mergeStyle({}, range.style);
				mergedStyle = this._mergeStyle(mergedStyle, styleRange.style);
				var args = [];
				args.push(i, 1);
				if (styleRange.start < range.start) {
					args.push({start: styleRange.start, end: range.start, style: styleRange.style});
				}
				if (styleRange.start > range.start) {
					args.push({start: range.start, end: styleRange.start, style: range.style});
				}
				args.push({start: Math.max(range.start, styleRange.start), end: Math.min(range.end, styleRange.end), style: mergedStyle});
				if (styleRange.end < range.end) {
					args.push({start: styleRange.end, end: range.end, style: range.style});
				}
				if (styleRange.end > range.end) {
					styleRange = {start: range.end, end: styleRange.end, style: styleRange.style};
				} else {
					styleRange = null;
				}
				Array.prototype.splice.apply(ranges, args);
			}
			if (styleRange) {
				mergedStyle = this._mergeStyle({}, styleRange.style);
				ranges.splice(i, 0, {start: styleRange.start, end: styleRange.end, style: mergedStyle});
			}
			return ranges;
		},
		_onAnnotationModelChanged: function(e) {
			if (e.textModelChangedEvent) {
				return;
			}
			var view = this._view;
			if (!view) { return; }
			var self = this;
			var model = view.getModel();
			function redraw(changes) {
				for (var i = 0; i < changes.length; i++) {
					if (!self.isAnnotationTypeVisible(changes[i].type)) { continue; }
					var start = changes[i].start;
					var end = changes[i].end;
					if (model.getBaseModel) {
						start = model.mapOffset(start, true);
						end = model.mapOffset(end, true);
					}
					if (start !== -1 && end !== -1) {
						view.redrawRange(start, end);
					}
				}
			}
			redraw(e.added);
			redraw(e.removed);
			redraw(e.changed);
		},
		_onDestroy: function(e) {
			this.destroy();
		},
		_onLineStyle: function (e) {
			var annotationModel = this._annotationModel;
			var viewModel = e.textView.getModel();
			var baseModel = annotationModel.getTextModel();
			var start = e.lineStart;
			var end = e.lineStart + e.lineText.length;
			if (baseModel !== viewModel) {
				start = viewModel.mapOffset(start);
				end = viewModel.mapOffset(end);
			}
			var annotations = annotationModel.getAnnotations(start, end);
			while (annotations.hasNext()) {
				var annotation = annotations.next();
				if (!this.isAnnotationTypeVisible(annotation.type)) { continue; }
				if (annotation.rangeStyle) {
					var annotationStart = annotation.start;
					var annotationEnd = annotation.end;
					if (baseModel !== viewModel) {
						annotationStart = viewModel.mapOffset(annotationStart, true);
						annotationEnd = viewModel.mapOffset(annotationEnd, true);
					}
					e.ranges = this._mergeStyleRanges(e.ranges, {start: annotationStart, end: annotationEnd, style: annotation.rangeStyle});
				}
				if (annotation.lineStyle) {
					e.style = this._mergeStyle({}, e.style);
					e.style = this._mergeStyle(e.style, annotation.lineStyle);
				}
			}
		}
	};
	AnnotationTypeList.addMixin(AnnotationStyler.prototype);
	
	return {
		FoldingAnnotation: FoldingAnnotation,
		AnnotationType: AnnotationType,
		AnnotationTypeList: AnnotationTypeList,
		AnnotationModel: AnnotationModel,
		AnnotationStyler: AnnotationStyler
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*global define Node */

define("orion/editor/tooltip", [ //$NON-NLS-0$
	'i18n!orion/editor/nls/messages', //$NON-NLS-0$
	'orion/editor/textView', //$NON-NLS-0$
	'orion/editor/textModel', //$NON-NLS-0$
	'orion/editor/projectionTextModel', //$NON-NLS-0$
	'orion/util' //$NON-NLS-0$
], function(messages, mTextView, mTextModel, mProjectionTextModel, util) {

	/** @private */
	function Tooltip (view) {
		this._view = view;
		this._create(view.getOptions("parent").ownerDocument); //$NON-NLS-0$
		view.addEventListener("Destroy", this, this.destroy); //$NON-NLS-0$
	}
	Tooltip.getTooltip = function(view) {
		if (!view._tooltip) {
			 view._tooltip = new Tooltip(view);
		}
		return view._tooltip;
	};
	Tooltip.prototype = /** @lends orion.editor.Tooltip.prototype */ {
		_create: function(document) {
			if (this._tooltipDiv) { return; }
			var tooltipDiv = this._tooltipDiv = util.createElement(document, "div"); //$NON-NLS-0$
			tooltipDiv.className = "textviewTooltip"; //$NON-NLS-0$
			tooltipDiv.setAttribute("aria-live", "assertive"); //$NON-NLS-1$ //$NON-NLS-0$
			tooltipDiv.setAttribute("aria-atomic", "true"); //$NON-NLS-1$ //$NON-NLS-0$
			var tooltipContents = this._tooltipContents = util.createElement(document, "div"); //$NON-NLS-0$
			tooltipDiv.appendChild(tooltipContents);
			document.body.appendChild(tooltipDiv);
			this.hide();
		},
		_getWindow: function() {
			var document = this._tooltipDiv.ownerDocument;
			return document.defaultView || document.parentWindow;
		},
		destroy: function() {
			if (!this._tooltipDiv) { return; }
			this.hide();
			var parent = this._tooltipDiv.parentNode;
			if (parent) { parent.removeChild(this._tooltipDiv); }
			this._tooltipDiv = null;
		},
		hide: function() {
			if (this._contentsView) {
				this._contentsView.destroy();
				this._contentsView = null;
			}
			if (this._tooltipContents) {
				this._tooltipContents.innerHTML = "";
			}
			if (this._tooltipDiv) {
				this._tooltipDiv.style.visibility = "hidden"; //$NON-NLS-0$
			}
			var window = this._getWindow();
			if (this._showTimeout) {
				window.clearTimeout(this._showTimeout);
				this._showTimeout = null;
			}
			if (this._hideTimeout) {
				window.clearTimeout(this._hideTimeout);
				this._hideTimeout = null;
			}
			if (this._fadeTimeout) {
				window.clearInterval(this._fadeTimeout);
				this._fadeTimeout = null;
			}
		},
		isVisible: function() {
			return this._tooltipDiv && this._tooltipDiv.style.visibility === "visible"; //$NON-NLS-0$
		},
		setTarget: function(target, delay) {
			if (this.target === target) { return; }
			this._target = target;
			this.hide();
			if (target) {
				var self = this;
				if(delay === 0) {
					self.show(true);
				}
				else {
				var window = this._getWindow();
					self._showTimeout = window.setTimeout(function() {
						self.show(true);
					}, delay ? delay : 500);
				}
			}
		},
		show: function(autoHide) {
			if (!this._target) { return; }
			var info = this._target.getTooltipInfo();
			if (!info) { return; }
			var tooltipDiv = this._tooltipDiv, tooltipContents = this._tooltipContents;
			tooltipDiv.style.left = tooltipDiv.style.right = tooltipDiv.style.width = tooltipDiv.style.height = 
				tooltipContents.style.width = tooltipContents.style.height = "auto"; //$NON-NLS-0$
			var contents = info.contents;
			if (contents instanceof Array) {
				contents = this._getAnnotationContents(contents);
			}
			if (typeof contents === "string") { //$NON-NLS-0$
				tooltipContents.innerHTML = contents;
			} else if (this._isNode(contents)) {
				tooltipContents.appendChild(contents);
			} else if (contents instanceof mProjectionTextModel.ProjectionTextModel) {
				var view = this._view;
				var options = view.getOptions();
				options.wrapMode = false;
				options.parent = tooltipContents;
				var tooltipTheme = "tooltip"; //$NON-NLS-0$
				var theme = options.themeClass;
				if (theme) {
					theme = theme.replace(tooltipTheme, "");
					if (theme) { theme = " " + theme; } //$NON-NLS-0$
					theme = tooltipTheme + theme;
				} else {
					theme = tooltipTheme;
				}
				options.themeClass = theme;
				var contentsView = this._contentsView = new mTextView.TextView(options);
				//TODO this is need to avoid Firefox from getting focus
				contentsView._clientDiv.contentEditable = false;
				//TODO need to find a better way of sharing the styler for multiple views
				var listener = {
					onLineStyle: function(e) {
						view.onLineStyle(e);
					}
				};
				contentsView.addEventListener("LineStyle", listener.onLineStyle); //$NON-NLS-0$
				contentsView.setModel(contents);
				var size = contentsView.computeSize();
				tooltipContents.style.width = size.width + "px"; //$NON-NLS-0$
				tooltipContents.style.height = size.height + "px"; //$NON-NLS-0$
				contentsView.resize();
			} else {
				return;
			}
			var documentElement = tooltipDiv.ownerDocument.documentElement;
			if (info.anchor === "right") { //$NON-NLS-0$
				var right = documentElement.clientWidth - info.x;
				tooltipDiv.style.right = right + "px"; //$NON-NLS-0$
				tooltipDiv.style.maxWidth = (documentElement.clientWidth - right - 10) + "px"; //$NON-NLS-0$
			} else {
				var left = parseInt(this._getNodeStyle(tooltipDiv, "padding-left", "0"), 10); //$NON-NLS-1$ //$NON-NLS-0$
				left += parseInt(this._getNodeStyle(tooltipDiv, "border-left-width", "0"), 10); //$NON-NLS-1$ //$NON-NLS-0$
				left = info.x - left;
				tooltipDiv.style.left = left + "px"; //$NON-NLS-0$
				tooltipDiv.style.maxWidth = (documentElement.clientWidth - left - 10) + "px"; //$NON-NLS-0$
			}
			var top = parseInt(this._getNodeStyle(tooltipDiv, "padding-top", "0"), 10); //$NON-NLS-1$ //$NON-NLS-0$
			top += parseInt(this._getNodeStyle(tooltipDiv, "border-top-width", "0"), 10); //$NON-NLS-1$ //$NON-NLS-0$
			top = info.y - top;
			tooltipDiv.style.top = top + "px"; //$NON-NLS-0$
			tooltipDiv.style.maxHeight = (documentElement.clientHeight - top - 10) + "px"; //$NON-NLS-0$
			tooltipDiv.style.opacity = "1"; //$NON-NLS-0$
			tooltipDiv.style.visibility = "visible"; //$NON-NLS-0$
			if (autoHide) {
				var self = this;
				var window = this._getWindow();
				self._hideTimeout = window.setTimeout(function() {
					var opacity = parseFloat(self._getNodeStyle(tooltipDiv, "opacity", "1")); //$NON-NLS-1$ //$NON-NLS-0$
					self._fadeTimeout = window.setInterval(function() {
						if (tooltipDiv.style.visibility === "visible" && opacity > 0) { //$NON-NLS-0$
							opacity -= 0.1;
							tooltipDiv.style.opacity = opacity;
							return;
						}
						self.hide();
					}, 50);
				}, 5000);
			}
		},
		_getAnnotationContents: function(annotations) {
			if (annotations.length === 0) {
				return null;
			}
			var model = this._view.getModel(), annotation;
			var baseModel = model.getBaseModel ? model.getBaseModel() : model;
			function getText(start, end) {
				var textStart = baseModel.getLineStart(baseModel.getLineAtOffset(start));
				var textEnd = baseModel.getLineEnd(baseModel.getLineAtOffset(end), true);
				return baseModel.getText(textStart, textEnd);
			}
			function getAnnotationHTML(annotation) {
				var title = annotation.title;
				if (title === "") { return null; }
				var result = "<div>"; //$NON-NLS-0$
				if (annotation.html) {
					result += annotation.html + "&nbsp;"; //$NON-NLS-0$
				}
				if (!title) {
					title = getText(annotation.start, annotation.end);
				}
				title = title.replace(/</g, "&lt;").replace(/>/g, "&gt;"); //$NON-NLS-1$ //$NON-NLS-0$
				result += "<span style='vertical-align:middle;'>" + title + "</span><div>"; //$NON-NLS-1$ //$NON-NLS-0$
				return result;
			}
			if (annotations.length === 1) {
				annotation = annotations[0];
				if (annotation.title !== undefined) {
					return getAnnotationHTML(annotation);
				} else {
					var newModel = new mProjectionTextModel.ProjectionTextModel(baseModel);
					var lineStart = baseModel.getLineStart(baseModel.getLineAtOffset(annotation.start));
					var charCount = baseModel.getCharCount();
					if (annotation.end !== charCount) {
						newModel.addProjection({start: annotation.end, end: charCount});
					}
					if (lineStart > 0) {
						newModel.addProjection({start: 0, end: lineStart});
					}
					return newModel;
				}
			} else {
				var tooltipHTML = "<div><em>" + messages.multipleAnnotations + "</em></div>"; //$NON-NLS-1$ //$NON-NLS-0$
				for (var i = 0; i < annotations.length; i++) {
					annotation = annotations[i];
					var html = getAnnotationHTML(annotation);
					if (html) {
						tooltipHTML += html;
					}
				}
				return tooltipHTML;
			}
		},
		_getNodeStyle: function(node, prop, defaultValue) {
			var value;
			if (node) {
				value = node.style[prop];
				if (!value) {
					if (node.currentStyle) {
						var index = 0, p = prop;
						while ((index = p.indexOf("-", index)) !== -1) { //$NON-NLS-0$
							p = p.substring(0, index) + p.substring(index + 1, index + 2).toUpperCase() + p.substring(index + 2);
						}
						value = node.currentStyle[p];
					} else {
						var css = node.ownerDocument.defaultView.getComputedStyle(node, null);
						value = css ? css.getPropertyValue(prop) : null;
					}
				}
			}
			return value || defaultValue;
		},
		_isNode: function (obj) {
			return typeof Node === "object" ? obj instanceof Node : //$NON-NLS-0$
				obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string"; //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		}
	};
	return {Tooltip: Tooltip};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*global define*/

define("orion/editor/rulers", ['i18n!orion/editor/nls/messages', 'orion/editor/annotations', 'orion/editor/tooltip', 'orion/util'], function(messages, mAnnotations, mTooltip, util) { //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$

	/**
	 * Constructs a new ruler. 
	 * <p>
	 * The default implementation does not implement all the methods in the interface
	 * and is useful only for objects implementing rulers.
	 * <p/>
	 * 
	 * @param {orion.editor.AnnotationModel} annotationModel the annotation model for the ruler.
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {String} [rulerOverview="page"] the overview for the ruler.
	 * @param {orion.editor.Style} [rulerStyle] the style for the ruler. 
	 * 
	 * @class This interface represents a ruler for the text view.
	 * <p>
	 * A Ruler is a graphical element that is placed either on the left or on the right side of 
	 * the view. It can be used to provide the view with per line decoration such as line numbering,
	 * bookmarks, breakpoints, folding disclosures, etc. 
	 * </p><p>
	 * There are two types of rulers: page and document. A page ruler only shows the content for the lines that are
	 * visible, while a document ruler always shows the whole content.
	 * </p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.LineNumberRuler}<br/>
	 * {@link orion.editor.AnnotationRuler}<br/>
	 * {@link orion.editor.OverviewRuler}<br/> 
	 * {@link orion.editor.TextView}<br/>
	 * {@link orion.editor.TextView#addRuler}
	 * </p>		 
	 * @name orion.editor.Ruler
	 * @borrows orion.editor.AnnotationTypeList#addAnnotationType as #addAnnotationType
	 * @borrows orion.editor.AnnotationTypeList#getAnnotationTypePriority as #getAnnotationTypePriority
	 * @borrows orion.editor.AnnotationTypeList#getAnnotationsByType as #getAnnotationsByType
	 * @borrows orion.editor.AnnotationTypeList#isAnnotationTypeVisible as #isAnnotationTypeVisible
	 * @borrows orion.editor.AnnotationTypeList#removeAnnotationType as #removeAnnotationType
	 */
	function Ruler (annotationModel, rulerLocation, rulerOverview, rulerStyle) {
		this._location = rulerLocation || "left"; //$NON-NLS-0$
		this._overview = rulerOverview || "page"; //$NON-NLS-0$
		this._rulerStyle = rulerStyle;
		this._view = null;
		var self = this;
		this._listener = {
			onTextModelChanged: function(e) {
				self._onTextModelChanged(e);
			},
			onAnnotationModelChanged: function(e) {
				self._onAnnotationModelChanged(e);
			}
		};
		this.setAnnotationModel(annotationModel);
	}
	Ruler.prototype = /** @lends orion.editor.Ruler.prototype */ {
		/**
		 * Returns the annotations for a given line range merging multiple
		 * annotations when necessary.
		 * <p>
		 * This method is called by the text view when the ruler is redrawn.
		 * </p>
		 *
		 * @param {Number} startLine the start line index
		 * @param {Number} endLine the end line index
		 * @return {orion.editor.Annotation[]} the annotations for the line range. The array might be sparse.
		 */
		getAnnotations: function(startLine, endLine) {
			var annotationModel = this._annotationModel;
			if (!annotationModel) { return []; }
			var model = this._view.getModel();
			var start = model.getLineStart(startLine);
			var end = model.getLineEnd(endLine - 1);
			var baseModel = model;
			if (model.getBaseModel) {
				baseModel = model.getBaseModel();
				start = model.mapOffset(start);
				end = model.mapOffset(end);
			}
			var result = [];
			var annotations = this.getAnnotationsByType(annotationModel, start, end);
			for (var i = 0; i < annotations.length; i++) {
				var annotation = annotations[i];
				var annotationLineStart = baseModel.getLineAtOffset(annotation.start);
				var annotationLineEnd = baseModel.getLineAtOffset(Math.max(annotation.start, annotation.end - 1));
				for (var lineIndex = annotationLineStart; lineIndex<=annotationLineEnd; lineIndex++) {
					var visualLineIndex = lineIndex;
					if (model !== baseModel) {
						var ls = baseModel.getLineStart(lineIndex);
						ls = model.mapOffset(ls, true);
						if (ls === -1) { continue; }
						visualLineIndex = model.getLineAtOffset(ls);
					}
					if (!(startLine <= visualLineIndex && visualLineIndex < endLine)) { continue; }
					var rulerAnnotation = this._mergeAnnotation(result[visualLineIndex], annotation, lineIndex - annotationLineStart, annotationLineEnd - annotationLineStart + 1);
					if (rulerAnnotation) {
						result[visualLineIndex] = rulerAnnotation;
					}
				}
			}
			if (!this._multiAnnotation && this._multiAnnotationOverlay) {
				for (var k in result) {
					if (result[k]._multiple) {
						result[k].html = result[k].html + this._multiAnnotationOverlay.html;
					}
				}
			}
			return result;
		},
		/**
		 * Returns the annotation model.
		 *
		 * @returns {orion.editor.AnnotationModel} the ruler annotation model.
		 *
		 * @see #setAnnotationModel
		 */
		getAnnotationModel: function() {
			return this._annotationModel;
		},
		/**
		 * Returns the ruler location.
		 *
		 * @returns {String} the ruler location, which is either "left" or "right".
		 *
		 * @see #getOverview
		 */
		getLocation: function() {
			return this._location;
		},
		/**
		 * Returns the ruler overview type.
		 *
		 * @returns {String} the overview type, which is either "page" or "document".
		 *
		 * @see #getLocation
		 */
		getOverview: function() {
			return this._overview;
		},
		/**
		 * Returns the style information for the ruler.
		 *
		 * @returns {orion.editor.Style} the style information.
		 */
		getRulerStyle: function() {
			return this._rulerStyle;
		},
		/**
		 * Returns the text view.
		 *
		 * @returns {orion.editor.TextView} the text view.
		 *
		 * @see #setView
		 */
		getView: function() {
			return this._view;
		},
		/**
		 * Returns the widest annotation which determines the width of the ruler.
		 * <p>
		 * If the ruler does not have a fixed width it should provide the widest
		 * annotation to avoid the ruler from changing size as the view scrolls.
		 * </p>
		 * <p>
		 * This method is called by the text view when the ruler is redrawn.
		 * </p>
		 *
		 * @returns {orion.editor.Annotation} the widest annotation.
		 *
		 * @see #getAnnotations
		 */
		getWidestAnnotation: function() {
			return null;
		},
		/**
		 * Sets the annotation model for the ruler.
		 *
		 * @param {orion.editor.AnnotationModel} annotationModel the annotation model.
		 *
		 * @see #getAnnotationModel
		 */
		setAnnotationModel: function (annotationModel) {
			if (this._annotationModel) {
				this._annotationModel.removEventListener("Changed", this._listener.onAnnotationModelChanged); //$NON-NLS-0$
			}
			this._annotationModel = annotationModel;
			if (this._annotationModel) {
				this._annotationModel.addEventListener("Changed", this._listener.onAnnotationModelChanged); //$NON-NLS-0$
			}
		},
		/**
		 * Sets the annotation that is displayed when a given line contains multiple
		 * annotations.  This annotation is used when there are different types of
		 * annotations in a given line.
		 *
		 * @param {orion.editor.Annotation} annotation the annotation for lines with multiple annotations.
		 * 
		 * @see #setMultiAnnotationOverlay
		 */
		setMultiAnnotation: function(annotation) {
			this._multiAnnotation = annotation;
		},
		/**
		 * Sets the annotation that overlays a line with multiple annotations.  This annotation is displayed on
		 * top of the computed annotation for a given line when there are multiple annotations of the same type
		 * in the line. It is also used when the multiple annotation is not set.
		 *
		 * @param {orion.editor.Annotation} annotation the annotation overlay for lines with multiple annotations.
		 * 
		 * @see #setMultiAnnotation
		 */
		setMultiAnnotationOverlay: function(annotation) {
			this._multiAnnotationOverlay = annotation;
		},
		/**
		 * Sets the view for the ruler.
		 * <p>
		 * This method is called by the text view when the ruler
		 * is added to the view.
		 * </p>
		 *
		 * @param {orion.editor.TextView} view the text view.
		 */
		setView: function (view) {
			if (this._onTextModelChanged && this._view) {
				this._view.removeEventListener("ModelChanged", this._listener.onTextModelChanged); //$NON-NLS-0$
			}
			this._view = view;
			if (this._onTextModelChanged && this._view) {
				this._view.addEventListener("ModelChanged", this._listener.onTextModelChanged); //$NON-NLS-0$
			}
		},
		/**
		 * This event is sent when the user clicks a line annotation.
		 *
		 * @event
		 * @param {Number} lineIndex the line index of the annotation under the pointer.
		 * @param {DOMEvent} e the click event.
		 */
		onClick: function(lineIndex, e) {
			if (lineIndex === undefined) { return; }
			var view = this._view;
			var model = view.getModel();
			var baseModel = model;
			var start = model.getLineStart(lineIndex);
			var end = start;
			var annotationModel = this._annotationModel;
			if (annotationModel) {
				var selection = view.getSelection();
				var offset = Math.max(selection.start, selection.end);
				end = model.getLineEnd(lineIndex, true);
				if (start <= offset && offset < model.getLineEnd(lineIndex)) {
					start = offset + 1;
				}
				if (model.getBaseModel) {
					start = model.mapOffset(start);
					end = model.mapOffset(end);
					baseModel = model.getBaseModel();
				}
				var annotation, iter = annotationModel.getAnnotations(start, end);
				while (!annotation && iter.hasNext()) {
					var a = iter.next();
					if (!this.isAnnotationTypeVisible(a.type)) { continue; }
					annotation = a;
				}
				if (annotation && baseModel.getLineAtOffset(annotation.start) === baseModel.getLineAtOffset(start)) {
					start = annotation.start;
					end = annotation.end;
				} else {
					end = start;
				}
				
				if (model.getBaseModel) {
					start = model.mapOffset(start, true);
					end = model.mapOffset(end, true);
				}
			}
			var tooltip = mTooltip.Tooltip.getTooltip(this._view);
			if (tooltip) {
				tooltip.setTarget(null);
			}
			this._view.setSelection(end, start, 1/3, function(){});
		},
		/**
		 * This event is sent when the user double clicks a line annotation.
		 *
		 * @event
		 * @param {Number} lineIndex the line index of the annotation under the pointer.
		 * @param {DOMEvent} e the double click event.
		 */
		onDblClick: function(lineIndex, e) {
		},
		/**
		 * This event is sent when the user moves the mouse over a line annotation.
		 *
		 * @event
		 * @param {Number} lineIndex the line index of the annotation under the pointer.
		 * @param {DOMEvent} e the mouse move event.
		 */
		onMouseMove: function(lineIndex, e) {
			var tooltip = mTooltip.Tooltip.getTooltip(this._view);
			if (!tooltip) { return; }
			if (tooltip.isVisible() && this._tooltipLineIndex === lineIndex) { return; }
			this._tooltipLineIndex = lineIndex;
			var self = this;
			tooltip.setTarget({
				y: e.clientY,
				getTooltipInfo: function() {
					return self._getTooltipInfo(self._tooltipLineIndex, this.y);
				}
			});
		},
		/**
		 * This event is sent when the mouse pointer enters a line annotation.
		 *
		 * @event
		 * @param {Number} lineIndex the line index of the annotation under the pointer.
		 * @param {DOMEvent} e the mouse over event.
		 */
		onMouseOver: function(lineIndex, e) {
			this.onMouseMove(lineIndex, e);
		},
		/**
		 * This event is sent when the mouse pointer exits a line annotation.
		 *
		 * @event
		 * @param {Number} lineIndex the line index of the annotation under the pointer.
		 * @param {DOMEvent} e the mouse out event.
		 */
		onMouseOut: function(lineIndex, e) {
			var tooltip = mTooltip.Tooltip.getTooltip(this._view);
			if (!tooltip) { return; }
			tooltip.setTarget(null);
		},
		/** @ignore */
		_getTooltipInfo: function(lineIndex, y) {
			if (lineIndex === undefined) { return; }
			var view = this._view;
			var model = view.getModel();
			var annotationModel = this._annotationModel;
			var annotations = [];
			if (annotationModel) {
				var start = model.getLineStart(lineIndex);
				var end = model.getLineEnd(lineIndex);
				if (model.getBaseModel) {
					start = model.mapOffset(start);
					end = model.mapOffset(end);
				}
				annotations = this.getAnnotationsByType(annotationModel, start, end);
			}
			var contents = this._getTooltipContents(lineIndex, annotations);
			if (!contents) { return null; }
			var info = {
				contents: contents,
				anchor: this.getLocation()
			};
			var rect = view.getClientArea();
			if (this.getOverview() === "document") { //$NON-NLS-0$
				rect.y = view.convert({y: y}, "view", "document").y; //$NON-NLS-1$ //$NON-NLS-0$
			} else {
				rect.y = view.getLocationAtOffset(model.getLineStart(lineIndex)).y;
			}
			view.convert(rect, "document", "page"); //$NON-NLS-1$ //$NON-NLS-0$
			info.x = rect.x;
			info.y = rect.y;
			if (info.anchor === "right") { //$NON-NLS-0$
				info.x += rect.width;
			}
			return info;
		},
		/** @ignore */
		_getTooltipContents: function(lineIndex, annotations) {
			return annotations;
		},
		/** @ignore */
		_onAnnotationModelChanged: function(e) {
			var view = this._view;
			if (!view) { return; }
			var model = view.getModel(), self = this;
			var lineCount = model.getLineCount();
			if (e.textModelChangedEvent) {
				var start = e.textModelChangedEvent.start;
				if (model.getBaseModel) { start = model.mapOffset(start, true); }
				var startLine = model.getLineAtOffset(start);
				view.redrawLines(startLine, lineCount, self);
				return;
			}
			function redraw(changes) {
				for (var i = 0; i < changes.length; i++) {
					if (!self.isAnnotationTypeVisible(changes[i].type)) { continue; }
					var start = changes[i].start;
					var end = changes[i].end;
					if (model.getBaseModel) {
						start = model.mapOffset(start, true);
						end = model.mapOffset(end, true);
					}
					if (start !== -1 && end !== -1) {
						view.redrawLines(model.getLineAtOffset(start), model.getLineAtOffset(Math.max(start, end - 1)) + 1, self);
					}
				}
			}
			redraw(e.added);
			redraw(e.removed);
			redraw(e.changed);
		},
		/** @ignore */
		_mergeAnnotation: function(result, annotation, annotationLineIndex, annotationLineCount) {
			if (!result) { result = {}; }
			if (annotationLineIndex === 0) {
				if (result.html && annotation.html) {
					if (annotation.html !== result.html) {
						if (!result._multiple && this._multiAnnotation) {
							result.html = this._multiAnnotation.html;
						}
					} 
					result._multiple = true;
				} else {
					result.html = annotation.html;
				}
			}
			result.style = this._mergeStyle(result.style, annotation.style);
			return result;
		},
		/** @ignore */
		_mergeStyle: function(result, style) {
			if (style) {
				if (!result) { result = {}; }
				if (result.styleClass && style.styleClass && result.styleClass !== style.styleClass) {
					result.styleClass += " " + style.styleClass; //$NON-NLS-0$
				} else {
					result.styleClass = style.styleClass;
				}
				var prop;
				if (style.style) {
					if (!result.style) { result.style  = {}; }
					for (prop in style.style) {
						if (!result.style[prop]) {
							result.style[prop] = style.style[prop];
						}
					}
				}
				if (style.attributes) {
					if (!result.attributes) { result.attributes  = {}; }
					for (prop in style.attributes) {
						if (!result.attributes[prop]) {
							result.attributes[prop] = style.attributes[prop];
						}
					}
				}
			}
			return result;
		}
	};
	mAnnotations.AnnotationTypeList.addMixin(Ruler.prototype);

	/**
	 * Constructs a new line numbering ruler. 
	 *
	 * @param {orion.editor.AnnotationModel} annotationModel the annotation model for the ruler.
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {orion.editor.Style} [rulerStyle=undefined] the style for the ruler.
	 * @param {orion.editor.Style} [oddStyle={style: {backgroundColor: "white"}] the style for lines with odd line index.
	 * @param {orion.editor.Style} [evenStyle={backgroundColor: "white"}] the style for lines with even line index.
	 *
	 * @augments orion.editor.Ruler
	 * @class This objects implements a line numbering ruler.
	 *
	 * <p><b>See:</b><br/>
	 * {@link orion.editor.Ruler}
	 * </p>
	 * @name orion.editor.LineNumberRuler
	 */
	function LineNumberRuler (annotationModel, rulerLocation, rulerStyle, oddStyle, evenStyle) {
		Ruler.call(this, annotationModel, rulerLocation, "page", rulerStyle); //$NON-NLS-0$
		this._oddStyle = oddStyle || {style: {backgroundColor: "white"}}; //$NON-NLS-0$
		this._evenStyle = evenStyle || {style: {backgroundColor: "white"}}; //$NON-NLS-0$
		this._numOfDigits = 0;
	}
	LineNumberRuler.prototype = new Ruler(); 
	/** @ignore */
	LineNumberRuler.prototype.getAnnotations = function(startLine, endLine) {
		var result = Ruler.prototype.getAnnotations.call(this, startLine, endLine);
		var model = this._view.getModel();
		for (var lineIndex = startLine; lineIndex < endLine; lineIndex++) {
			var style = lineIndex & 1 ? this._oddStyle : this._evenStyle;
			var mapLine = lineIndex;
			if (model.getBaseModel) {
				var lineStart = model.getLineStart(mapLine);
				mapLine = model.getBaseModel().getLineAtOffset(model.mapOffset(lineStart));
			}
			if (!result[lineIndex]) { result[lineIndex] = {}; }
			result[lineIndex].html = (mapLine + 1) + "";
			if (!result[lineIndex].style) { result[lineIndex].style = style; }
		}
		return result;
	};
	/** @ignore */
	LineNumberRuler.prototype.getWidestAnnotation = function() {
		var lineCount = this._view.getModel().getLineCount();
		return this.getAnnotations(lineCount - 1, lineCount)[lineCount - 1];
	};
	/** @ignore */
	LineNumberRuler.prototype._onTextModelChanged = function(e) {
		var start = e.start;
		var model = this._view.getModel();
		var lineCount = model.getBaseModel ? model.getBaseModel().getLineCount() : model.getLineCount();
		var numOfDigits = (lineCount+"").length;
		if (this._numOfDigits !== numOfDigits) {
			this._numOfDigits = numOfDigits;
			var startLine = model.getLineAtOffset(start);
			this._view.redrawLines(startLine,  model.getLineCount(), this);
		}
	};
	
	/** 
	 * @class This is class represents an annotation for the AnnotationRuler. 
	 * <p> 
	 * <b>See:</b><br/> 
	 * {@link orion.editor.AnnotationRuler}
	 * </p> 
	 * 
	 * @name orion.editor.Annotation 
	 * 
	 * @property {String} [html=""] The html content for the annotation, typically contains an image.
	 * @property {orion.editor.Style} [style] the style for the annotation.
	 * @property {orion.editor.Style} [overviewStyle] the style for the annotation in the overview ruler.
	 */ 
	/**
	 * Constructs a new annotation ruler. 
	 *
	 * @param {orion.editor.AnnotationModel} annotationModel the annotation model for the ruler.
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {orion.editor.Style} [rulerStyle=undefined] the style for the ruler.
	 * @param {orion.editor.Annotation} [defaultAnnotation] the default annotation.
	 *
	 * @augments orion.editor.Ruler
	 * @class This objects implements an annotation ruler.
	 *
	 * <p><b>See:</b><br/>
	 * {@link orion.editor.Ruler}<br/>
	 * {@link orion.editor.Annotation}
	 * </p>
	 * @name orion.editor.AnnotationRuler
	 */
	function AnnotationRuler (annotationModel, rulerLocation, rulerStyle) {
		Ruler.call(this, annotationModel, rulerLocation, "page", rulerStyle); //$NON-NLS-0$
	}
	AnnotationRuler.prototype = new Ruler();
	
	/**
	 * Constructs a new overview ruler. 
	 * <p>
	 * The overview ruler is used in conjunction with a AnnotationRuler, for each annotation in the 
	 * AnnotationRuler this ruler displays a mark in the overview. Clicking on the mark causes the 
	 * view to scroll to the annotated line.
	 * </p>
	 *
	 * @param {orion.editor.AnnotationModel} annotationModel the annotation model for the ruler.
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {orion.editor.Style} [rulerStyle=undefined] the style for the ruler.
	 *
	 * @augments orion.editor.Ruler
	 * @class This objects implements an overview ruler.
	 *
	 * <p><b>See:</b><br/>
	 * {@link orion.editor.AnnotationRuler} <br/>
	 * {@link orion.editor.Ruler} 
	 * </p>
	 * @name orion.editor.OverviewRuler
	 */
	function OverviewRuler (annotationModel, rulerLocation, rulerStyle) {
		Ruler.call(this, annotationModel, rulerLocation, "document", rulerStyle); //$NON-NLS-0$
	}
	OverviewRuler.prototype = new Ruler();
	
	/** @ignore */
	OverviewRuler.prototype.getRulerStyle = function() {
		var result = {style: {lineHeight: "1px", fontSize: "1px"}}; //$NON-NLS-1$ //$NON-NLS-0$
		result = this._mergeStyle(result, this._rulerStyle);
		return result;
	};
	/** @ignore */
	OverviewRuler.prototype._getTooltipContents = function(lineIndex, annotations) {
		if (annotations.length === 0) {
			var model = this._view.getModel();
			var mapLine = lineIndex;
			if (model.getBaseModel) {
				var lineStart = model.getLineStart(mapLine);
				mapLine = model.getBaseModel().getLineAtOffset(model.mapOffset(lineStart));
			}
			return util.formatMessage(messages.line, mapLine + 1);
		}
		return Ruler.prototype._getTooltipContents.call(this, lineIndex, annotations);
	};
	/** @ignore */
	OverviewRuler.prototype._mergeAnnotation = function(previousAnnotation, annotation, annotationLineIndex, annotationLineCount) {
		if (annotationLineIndex !== 0) { return undefined; }
		var result = previousAnnotation;
		if (!result) {
			//TODO annotationLineCount does not work when there are folded lines
			var height = 3 * annotationLineCount;
			result = {html: "&nbsp;", style: { style: {height: height + "px"}}}; //$NON-NLS-1$ //$NON-NLS-0$
			result.style = this._mergeStyle(result.style, annotation.overviewStyle);
		}
		return result;
	};

	/**
	 * Constructs a new folding ruler. 
	 *
	 * @param {orion.editor.AnnotationModel} annotationModel the annotation model for the ruler.
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {orion.editor.Style} [rulerStyle=undefined] the style for the ruler.
	 *
	 * @augments orion.editor.Ruler
	 * @class This objects implements an overview ruler.
	 *
	 * <p><b>See:</b><br/>
	 * {@link orion.editor.AnnotationRuler} <br/>
	 * {@link orion.editor.Ruler} 
	 * </p>
	 * @name orion.editor.OverviewRuler
	 */
	function FoldingRuler (annotationModel, rulerLocation, rulerStyle) {
		AnnotationRuler.call(this, annotationModel, rulerLocation, rulerStyle);
	}
	FoldingRuler.prototype = new AnnotationRuler();
	
	/** @ignore */
	FoldingRuler.prototype.onClick =  function(lineIndex, e) {
		if (lineIndex === undefined) { return; }
		var annotationModel = this._annotationModel;
		if (!annotationModel) { return; }
		var view = this._view;
		var model = view.getModel();
		var start = model.getLineStart(lineIndex);
		var end = model.getLineEnd(lineIndex, true);
		if (model.getBaseModel) {
			start = model.mapOffset(start);
			end = model.mapOffset(end);
			model = model.getBaseModel();
		}
		var annotation, iter = annotationModel.getAnnotations(start, end);
		while (!annotation && iter.hasNext()) {
			var a = iter.next();
			if (!this.isAnnotationTypeVisible(a.type)) { continue; }
			annotation = a;
		}
		if (annotation && model.getLineAtOffset(annotation.start) === model.getLineAtOffset(start)) {
			var tooltip = mTooltip.Tooltip.getTooltip(this._view);
			if (tooltip) {
				tooltip.setTarget(null);
			}
			if (annotation.expanded) {
				annotation.collapse();
			} else {
				annotation.expand();
			}
			this._annotationModel.modifyAnnotation(annotation);
		}
	};
	/** @ignore */
	FoldingRuler.prototype._getTooltipContents = function(lineIndex, annotations) {
		if (annotations.length === 1) {
			if (annotations[0].expanded) {
				return null;
			}
		}
		return AnnotationRuler.prototype._getTooltipContents.call(this, lineIndex, annotations);
	};
	/** @ignore */
	FoldingRuler.prototype._onAnnotationModelChanged = function(e) {
		if (e.textModelChangedEvent) {
			AnnotationRuler.prototype._onAnnotationModelChanged.call(this, e);
			return;
		}
		var view = this._view;
		if (!view) { return; }
		var model = view.getModel(), self = this, i;
		var lineCount = model.getLineCount(), lineIndex = lineCount;
		function redraw(changes) {
			for (i = 0; i < changes.length; i++) {
				if (!self.isAnnotationTypeVisible(changes[i].type)) { continue; }
				var start = changes[i].start;
				if (model.getBaseModel) {
					start = model.mapOffset(start, true);
				}
				if (start !== -1) {
					lineIndex = Math.min(lineIndex, model.getLineAtOffset(start));
				}
			}
		}
		redraw(e.added);
		redraw(e.removed);
		redraw(e.changed);
		var rulers = view.getRulers();
		for (i = 0; i < rulers.length; i++) {
			view.redrawLines(lineIndex, lineCount, rulers[i]);
		}
	};
	
	return {
		Ruler: Ruler,
		AnnotationRuler: AnnotationRuler,
		LineNumberRuler: LineNumberRuler,
		OverviewRuler: OverviewRuler,
		FoldingRuler: FoldingRuler
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*global define */

define("orion/editor/undoStack", [], function() { //$NON-NLS-0$

	/** 
	 * Constructs a new Change object.
	 * 
	 * @class 
	 * @name orion.editor.Change
	 * @private
	 */
	function Change(offset, text, previousText) {
		this.offset = offset;
		this.text = text;
		this.previousText = previousText;
	}
	Change.prototype = {
		/** @ignore */
		undo: function (view, select) {
			this._doUndoRedo(this.offset, this.previousText, this.text, view, select);
		},
		/** @ignore */
		redo: function (view, select) {
			this._doUndoRedo(this.offset, this.text, this.previousText, view, select);
		},
		_doUndoRedo: function(offset, text, previousText, view, select) {
			var model = view.getModel();
			/* 
			* TODO UndoStack should be changing the text in the base model.
			* This is code needs to change when modifications in the base
			* model are supported properly by the projection model.
			*/
			if (model.mapOffset && view.annotationModel) {
				var mapOffset = model.mapOffset(offset, true);
				if (mapOffset < 0) {
					var annotationModel = view.annotationModel;
					var iter = annotationModel.getAnnotations(offset, offset + 1);
					while (iter.hasNext()) {
						var annotation = iter.next();
						if (annotation.type === "orion.annotation.folding") { //$NON-NLS-0$
							annotation.expand();
							mapOffset = model.mapOffset(offset, true);
							break;
						}
					}
				}
				if (mapOffset < 0) { return; }
				offset = mapOffset;
			}
			view.setText(text, offset, offset + previousText.length);
			if (select) {
				view.setSelection(offset, offset + text.length);
			}
		}
	};

	/** 
	 * Constructs a new CompoundChange object.
	 * 
	 * @class 
	 * @name orion.editor.CompoundChange
	 * @private
	 */
	function CompoundChange () {
		this.changes = [];
	}
	CompoundChange.prototype = {
		/** @ignore */
		add: function (change) {
			this.changes.push(change);
		},
		/** @ignore */
		end: function (view) {
			this.endSelection = view.getSelection();
			this.endCaret = view.getCaretOffset();
		},
		/** @ignore */
		undo: function (view, select) {
			for (var i=this.changes.length - 1; i >= 0; i--) {
				this.changes[i].undo(view, false);
			}
			if (select) {
				var start = this.startSelection.start;
				var end = this.startSelection.end;
				view.setSelection(this.startCaret ? start : end, this.startCaret ? end : start);
			}
		},
		/** @ignore */
		redo: function (view, select) {
			for (var i = 0; i < this.changes.length; i++) {
				this.changes[i].redo(view, false);
			}
			if (select) {
				var start = this.endSelection.start;
				var end = this.endSelection.end;
				view.setSelection(this.endCaret ? start : end, this.endCaret ? end : start);
			}
		},
		/** @ignore */
		start: function (view) {
			this.startSelection = view.getSelection();
			this.startCaret = view.getCaretOffset();
		}
	};

	/**
	 * Constructs a new UndoStack on a text view.
	 *
	 * @param {orion.editor.TextView} view the text view for the undo stack.
	 * @param {Number} [size=100] the size for the undo stack.
	 *
	 * @name orion.editor.UndoStack
	 * @class The UndoStack is used to record the history of a text model associated to an view. Every
	 * change to the model is added to stack, allowing the application to undo and redo these changes.
	 *
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.TextView}<br/>
	 * </p>
	 */
	function UndoStack (view, size) {
		this.view = view;
		this.size = size !== undefined ? size : 100;
		this.reset();
		var model = view.getModel();
		if (model.getBaseModel) {
			model = model.getBaseModel();
		}
		this.model = model;
		var self = this;
		this._listener = {
			onChanging: function(e) {
				self._onChanging(e);
			},
			onDestroy: function(e) {
				self._onDestroy(e);
			}
		};
		model.addEventListener("Changing", this._listener.onChanging); //$NON-NLS-0$
		view.addEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
	}
	UndoStack.prototype = /** @lends orion.editor.UndoStack.prototype */ {
		/**
		 * Adds a change to the stack.
		 * 
		 * @param change the change to add.
		 * @param {Number} change.offset the offset of the change
		 * @param {String} change.text the new text of the change
		 * @param {String} change.previousText the previous text of the change
		 */
		add: function (change) {
			if (this.compoundChange) {
				this.compoundChange.add(change);
			} else {
				var length = this.stack.length;
				this.stack.splice(this.index, length-this.index, change);
				this.index++;
				if (this.stack.length > this.size) {
					this.stack.shift();
					this.index--;
					this.cleanIndex--;
				}
			}
		},
		/** 
		 * Marks the current state of the stack as clean.
		 *
		 * <p>
		 * This function is typically called when the content of view associated with the stack is saved.
		 * </p>
		 *
		 * @see #isClean
		 */
		markClean: function() {
			this.endCompoundChange();
			this._commitUndo();
			this.cleanIndex = this.index;
		},
		/**
		 * Returns true if current state of stack is the same
		 * as the state when markClean() was called.
		 *
		 * <p>
		 * For example, the application calls markClean(), then calls undo() four times and redo() four times.
		 * At this point isClean() returns true.  
		 * </p>
		 * <p>
		 * This function is typically called to determine if the content of the view associated with the stack
		 * has changed since the last time it was saved.
		 * </p>
		 *
		 * @return {Boolean} returns if the state is the same as the state when markClean() was called.
		 *
		 * @see #markClean
		 */
		isClean: function() {
			return this.cleanIndex === this.getSize().undo;
		},
		/**
		 * Returns true if there is at least one change to undo.
		 *
		 * @return {Boolean} returns true if there is at least one change to undo.
		 *
		 * @see #canRedo
		 * @see #undo
		 */
		canUndo: function() {
			return this.getSize().undo > 0;
		},
		/**
		 * Returns true if there is at least one change to redo.
		 *
		 * @return {Boolean} returns true if there is at least one change to redo.
		 *
		 * @see #canUndo
		 * @see #redo
		 */
		canRedo: function() {
			return this.getSize().redo > 0;
		},
		/**
		 * Finishes a compound change.
		 *
		 * @see #startCompoundChange
		 */
		endCompoundChange: function() {
			if (this.compoundChange) {
				this.compoundChange.end(this.view);
			}
			this.compoundChange = undefined;
		},
		/**
		 * Returns the sizes of the stack.
		 *
		 * @return {object} a object where object.undo is the number of changes that can be un-done, 
		 *  and object.redo is the number of changes that can be re-done.
		 *
		 * @see #canUndo
		 * @see #canRedo
		 */
		getSize: function() {
			var index = this.index;
			var length = this.stack.length;
			if (this._undoStart !== undefined) {
				index++;
			}
			return {undo: index, redo: (length - index)};
		},
		/**
		 * Undo the last change in the stack.
		 *
		 * @return {Boolean} returns true if a change was un-done.
		 *
		 * @see #redo
		 * @see #canUndo
		 */
		undo: function() {
			this._commitUndo();
			if (this.index <= 0) {
				return false;
			}
			var change = this.stack[--this.index];
			this._ignoreUndo = true;
			change.undo(this.view, true);
			this._ignoreUndo = false;
			return true;
		},
		/**
		 * Redo the last change in the stack.
		 *
		 * @return {Boolean} returns true if a change was re-done.
		 *
		 * @see #undo
		 * @see #canRedo
		 */
		redo: function() {
			this._commitUndo();
			if (this.index >= this.stack.length) {
				return false;
			}
			var change = this.stack[this.index++];
			this._ignoreUndo = true;
			change.redo(this.view, true);
			this._ignoreUndo = false;
			return true;
		},
		/**
		 * Reset the stack to its original state. All changes in the stack are thrown away.
		 */
		reset: function() {
			this.index = this.cleanIndex = 0;
			this.stack = [];
			this._undoStart = undefined;
			this._undoText = "";
			this._undoType = 0;
			this._ignoreUndo = false;
			this._compoundChange = undefined;
		},
		/**
		 * Starts a compound change. 
		 * <p>
		 * All changes added to stack from the time startCompoundChange() is called
		 * to the time that endCompoundChange() is called are compound on one change that can be un-done or re-done
		 * with one single call to undo() or redo().
		 * </p>
		 *
		 * @see #endCompoundChange
		 */
		startCompoundChange: function() {
			this._commitUndo();
			var change = new CompoundChange();
			this.add(change);
			this.compoundChange = change;
			this.compoundChange.start(this.view);
		},
		_commitUndo: function () {
			if (this._undoStart !== undefined) {
				if (this._undoType === -1) {
					this.add(new Change(this._undoStart, "", this._undoText));
				} else {
					this.add(new Change(this._undoStart, this._undoText, ""));
				}
				this._undoStart = undefined;
				this._undoText = "";
				this._undoType = 0;
			}
		},
		_onDestroy: function(evt) {
			this.model.removeEventListener("Changing", this._listener.onChanging); //$NON-NLS-0$
			this.view.removeEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
		},
		_onChanging: function(e) {
			var newText = e.text;
			var start = e.start;
			var removedCharCount = e.removedCharCount;
			var addedCharCount = e.addedCharCount;
			if (this._ignoreUndo) {
				return;
			}
			if (this._undoStart !== undefined && 
				!((addedCharCount === 1 && removedCharCount === 0 && this._undoType === 1 && start === this._undoStart + this._undoText.length) ||
					(addedCharCount === 0 && removedCharCount === 1 && this._undoType === -1 && (((start + 1) === this._undoStart) || (start === this._undoStart)))))
			{
				this._commitUndo();
			}
			if (!this.compoundChange) {
				if (addedCharCount === 1 && removedCharCount === 0) {
					if (this._undoStart === undefined) {
						this._undoStart = start;
					}
					this._undoText = this._undoText + newText;
					this._undoType = 1;
					return;
				} else if (addedCharCount === 0 && removedCharCount === 1) {
					var deleting = this._undoText.length > 0 && this._undoStart === start;
					this._undoStart = start;
					this._undoType = -1;
					if (deleting) {
						this._undoText = this._undoText + this.model.getText(start, start + removedCharCount);
					} else {
						this._undoText = this.model.getText(start, start + removedCharCount) + this._undoText;
					}
					return;
				}
			}
			this.add(new Change(start, newText, this.model.getText(start, start + removedCharCount)));
		}
	};
	
	return {
		UndoStack: UndoStack
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/
 
/*global define */

define("orion/editor/textDND", [], function() { //$NON-NLS-0$

	function TextDND(view, undoStack) {
		this._view = view;
		this._undoStack = undoStack;
		this._dragSelection = null;
		this._dropOffset = -1;
		this._dropText = null;
		var self = this;
		this._listener = {
			onDragStart: function (evt) {
				self._onDragStart(evt);
			},
			onDragEnd: function (evt) {
				self._onDragEnd(evt);
			},
			onDragEnter: function (evt) {
				self._onDragEnter(evt);
			},
			onDragOver: function (evt) {
				self._onDragOver(evt);
			},
			onDrop: function (evt) {
				self._onDrop(evt);
			},
			onDestroy: function (evt) {
				self._onDestroy(evt);
			}
		};
		view.addEventListener("DragStart", this._listener.onDragStart); //$NON-NLS-0$
		view.addEventListener("DragEnd", this._listener.onDragEnd); //$NON-NLS-0$
		view.addEventListener("DragEnter", this._listener.onDragEnter); //$NON-NLS-0$
		view.addEventListener("DragOver", this._listener.onDragOver); //$NON-NLS-0$
		view.addEventListener("Drop", this._listener.onDrop); //$NON-NLS-0$
		view.addEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
	}
	TextDND.prototype = {
		destroy: function() {
			var view = this._view;
			if (!view) { return; }
			view.removeEventListener("DragStart", this._listener.onDragStart); //$NON-NLS-0$
			view.removeEventListener("DragEnd", this._listener.onDragEnd); //$NON-NLS-0$
			view.removeEventListener("DragEnter", this._listener.onDragEnter); //$NON-NLS-0$
			view.removeEventListener("DragOver", this._listener.onDragOver); //$NON-NLS-0$
			view.removeEventListener("Drop", this._listener.onDrop); //$NON-NLS-0$
			view.removeEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
			this._view = null;
		},
		_onDestroy: function(e) {
			this.destroy();
		},
		_onDragStart: function(e) {
			var view = this._view;
			var selection = view.getSelection();
			var model = view.getModel();
			if (model.getBaseModel) {
				selection.start = model.mapOffset(selection.start);
				selection.end = model.mapOffset(selection.end);
				model = model.getBaseModel();
			}
			var text = model.getText(selection.start, selection.end);
			if (text) {
				this._dragSelection = selection;
				e.event.dataTransfer.effectAllowed = "copyMove"; //$NON-NLS-0$
				e.event.dataTransfer.setData("Text", text); //$NON-NLS-0$
			}
		},
		_onDragEnd: function(e) {
			var view = this._view;
			if (this._dragSelection) {
				if (this._undoStack) { this._undoStack.startCompoundChange(); }
				var move = e.event.dataTransfer.dropEffect === "move"; //$NON-NLS-0$
				if (move) {
					view.setText("", this._dragSelection.start, this._dragSelection.end);
				}
				if (this._dropText) {
					var text = this._dropText;
					var offset = this._dropOffset;
					if (move) {
						if (offset >= this._dragSelection.end) {
							offset -= this._dragSelection.end - this._dragSelection.start;
						} else if (offset >= this._dragSelection.start) {
							offset = this._dragSelection.start;
						}
					}
					view.setText(text, offset, offset);
					view.setSelection(offset, offset + text.length);
					this._dropText = null;
					this._dropOffset = -1;
				}
				if (this._undoStack) { this._undoStack.endCompoundChange(); }
			}
			this._dragSelection = null;
		},
		_onDragEnter: function(e) {
			this._onDragOver(e);
		},
		_onDragOver: function(e) {
			var types = e.event.dataTransfer.types;
			if (types) {
				var allowed = !this._view.getOptions("readonly"); //$NON-NLS-0$
				if (allowed) {
					allowed = types.contains ? types.contains("text/plain") : types.indexOf("text/plain") !== -1; //$NON-NLS-1$ //$NON-NLS-0$
				}
				if (!allowed) {
					e.event.dataTransfer.dropEffect = "none"; //$NON-NLS-0$
				}
			}
		},
		_onDrop: function(e) {
			var view = this._view;
			var text = e.event.dataTransfer.getData("Text"); //$NON-NLS-0$
			if (text) {
				var offset = view.getOffsetAtLocation(e.x, e.y);
				if (this._dragSelection) {
					this._dropOffset = offset;
					this._dropText = text;
				} else {
					view.setText(text, offset, offset);
					view.setSelection(offset, offset + text.length);
				}
			}
		}
	};

	return {TextDND: TextDND};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2009, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
 
 /*global define*/
 /*jslint maxerr:150 browser:true devel:true laxbreak:true regexp:false*/

define("orion/editor/editor", ['i18n!orion/editor/nls/messages', 'orion/keyBinding', 'orion/editor/eventTarget', 'orion/editor/tooltip', 'orion/editor/annotations', 'orion/util'], function(messages, mKeyBinding, mEventTarget, mTooltip, mAnnotations, util) { //$NON-NLS-6$ //$NON-NLS-5$ //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	
	var HIGHLIGHT_ERROR_ANNOTATION = "orion.annotation.highlightError"; //$NON-NLS-0$

	/**
	 * @name orion.editor.Editor
	 * @class An <code>Editor</code> is a user interface for editing text that provides additional features over the basic {@link orion.editor.TextView}.
	 * Some of <code>Editor</code>'s features include:
	 * <ul>
	 * <li>Additional actions and key bindings for editing text</li>
	 * <li>Content assist</li>
	 * <li>Find and Incremental Find</li>
	 * <li>Rulers for displaying line numbers and annotations</li>
	 * <li>Status reporting</li>
	 * </ul>
	 * 
	 * @description Creates a new Editor with the given options.
	 * @param {Object} options Options controlling the features of this Editor.
	 * @param {Object} options.annotationFactory
	 * @param {Object} options.contentAssistFactory
	 * @param {Object} options.domNode
	 * @param {Object} options.keyBindingFactory
	 * @param {Object} options.lineNumberRulerFactory
	 * @param {Object} options.foldingRulerFactory
	 * @param {Object} options.statusReporter
	 * @param {Object} options.textViewFactory
	 * @param {Object} options.undoStackFactory
	 * @param {Object} options.textDNDFactory
	 *
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function Editor(options) {
		this._textViewFactory = options.textViewFactory;
		this._undoStackFactory = options.undoStackFactory;
		this._textDNDFactory = options.textDNDFactory;
		this._annotationFactory = options.annotationFactory;
		this._foldingRulerFactory = options.foldingRulerFactory;
		this._lineNumberRulerFactory = options.lineNumberRulerFactory;
		this._contentAssistFactory = options.contentAssistFactory;
		this._keyBindingFactory = options.keyBindingFactory;
		this._statusReporter = options.statusReporter;
		this._domNode = options.domNode;
		
		this._annotationStyler = null;
		this._annotationModel = null;
		this._annotationRuler = null;
		this._lineNumberRuler = null;
		this._overviewRuler = null;
		this._foldingRuler = null;
		this._dirty = false;
		this._contentAssist = null;
		this._title = null;
		this._keyModes = [];
	}
	Editor.prototype = /** @lends orion.editor.Editor.prototype */ {
		/**
		 * Destroys the editor.
		 */
		destroy: function() {
			this.uninstallTextView();
			this._textViewFactory = this._undoStackFactory = this._textDNDFactory = 
			this._annotationFactory = this._foldingRulerFactory = this._lineNumberRulerFactory = 
			this._contentAssistFactory = this._keyBindingFactory = this._statusReporter =
			this._domNode = null;
		},
		/**
		 * Returns the annotation model of the editor. 
		 *
		 * @returns {orion.editor.AnnotationModel}
		 */
		getAnnotationModel: function() {
			return this._annotationModel;
		},
		/**
		 * Returns the annotation ruler of the editor. 
		 *
		 * @returns {orion.editor.AnnotationRuler}
		 */
		getAnnotationRuler: function() {
			return this._annotationRuler;
		},
		/**
		 * Returns the annotation styler of the editor. 
		 *
		 * @returns {orion.editor.AnnotationStyler}
		 */
		getAnnotationStyler: function() {
			return this._annotationStyler;
		},
		/**
		 * Returns the folding ruler of the editor. 
		 *
		 * @returns {orion.editor.FoldingRuler}
		 */
		getFoldingRuler: function() {
			return this._foldingRuler;
		},
		/**
		 * Returns the line number ruler of the editor. 
		 *
		 * @returns {orion.editor.LineNumberRuler}
		 */
		getLineNumberRuler: function() {
			return this._lineNumberRuler;
		},
		/**
		 * Returns the base text model of this editor.
		 *
		 * @returns {orion.editor.TextModel}
		 */
		getModel: function() {
			var model = this._textView.getModel();
			if (model.getBaseModel) {
				model = model.getBaseModel();
			}
			return model;
		},
		/**
		 * Returns the overview ruler of the editor. 
		 *
		 * @returns {orion.editor.OverviewRuler}
		 */
		getOverviewRuler: function() {
			return this._overviewRuler;
		},
		/**
		 * Returns the underlying <code>TextView</code> used by this editor. 
		 * @returns {orion.editor.TextView} the editor text view.
		 */
		getTextView: function() {
			return this._textView;
		},
		/**
		 * Returns the editor title. 
		 *
		 * @returns {String} the editor title.
		 */
		getTitle: function() {
			return this._title;
		},
		
		/**
		 * Returns the editor's key modes.
		 *
		 * @returns {Array} the editor key modes.
		 */
		getKeyModes: function() {
			return this._keyModes;
		},
		
		/**
		 * Returns <code>true</code> if the editor is dirty; <code>false</code> otherwise.
		 * @returns {Boolean} 
		 */
		isDirty: function() {
			return this._dirty;
		},
		/**
		 * Sets whether the annotation ruler is visible.
		 *
		 * @param {Boolean} visible <code>true</code> to show ruler, <code>false</code> otherwise
		 */
		setAnnotationRulerVisible: function(visible) {
			if (this._annotationRulerVisible === visible) { return; }
			this._annotationRulerVisible = visible;
			if (!this._annotationRuler) { return; }
			var textView = this._textView;
			if (visible) {
				textView.addRuler(this._annotationRuler, 0);
			} else {
				textView.removeRuler(this._annotationRuler);
			}
		},
		/**
		 * Sets whether the folding ruler is visible.
		 *
		 * @param {Boolean} visible <code>true</code> to show ruler, <code>false</code> otherwise
		 */
		setFoldingRulerVisible: function(visible) {
			if (this._foldingRulerVisible === visible) { return; }
			this._foldingRulerVisible = visible;
			if (!this._foldingRuler) { return; }
			var textView = this._textView;
			if (!textView.getModel().getBaseModel) { return; }
			if (visible) {
				textView.addRuler(this._foldingRuler, 100);
			} else {
				textView.removeRuler(this._foldingRuler);
			}
		},
		/**
		 * Sets whether the editor is dirty.
		 *
		 * @param {Boolean} dirty
		 */
		setDirty: function(dirty) {
			if (this._dirty === dirty) { return; }
			this._dirty = dirty;
			this.onDirtyChanged({type: "DirtyChanged"}); //$NON-NLS-0$
		},
		/**
		 * Sets whether the line numbering ruler is visible.
		 *
		 * @param {Boolean} visible <code>true</code> to show ruler, <code>false</code> otherwise
		 */
		setLineNumberRulerVisible: function(visible) {
			if (this._lineNumberRulerVisible === visible) { return; }
			this._lineNumberRulerVisible = visible;
			if (!this._lineNumberRuler) { return; }
			var textView = this._textView;
			if (visible) {
				textView.addRuler(this._lineNumberRuler, 1);
			} else {
				textView.removeRuler(this._lineNumberRuler);
			}
		},
		/**
		 * Sets whether the overview ruler is visible.
		 *
		 * @param {Boolean} visible <code>true</code> to show ruler, <code>false</code> otherwise
		 */
		setOverviewRulerVisible: function(visible) {
			if (this._overviewRulerVisible === visible) { return; }
			this._overviewRulerVisible = visible;
			if (!this._overviewRuler) { return; }
			var textView = this._textView;
			if (visible) {
				textView.addRuler(this._overviewRuler);
			} else {
				textView.removeRuler(this._overviewRuler);
			}
		},
		
		mapOffset: function(offset, parent) {
			var textView = this._textView;
			var model = textView.getModel();
			if (model.getBaseModel) {
				offset = model.mapOffset(offset, parent);
			}
			return offset;
		},
		
		getCaretOffset: function() {
			return this.mapOffset(this._textView.getCaretOffset());
		},
		
		getSelection: function() {
			var textView = this._textView;
			var selection = textView.getSelection();
			var model = textView.getModel();
			if (model.getBaseModel) {
				selection.start = model.mapOffset(selection.start);
				selection.end = model.mapOffset(selection.end);
			}
			return selection;
		},
		
		getText: function(start, end) {
			var textView = this._textView;
			var model = textView.getModel();
			if (model.getBaseModel) {
				model = model.getBaseModel();
			}
			return model.getText(start, end);
		},
		
		_expandOffset: function(offset) {
			var model = this._textView.getModel();
			var annotationModel = this._annotationModel;
			if (!annotationModel || !model.getBaseModel) { return; }
			var annotations = annotationModel.getAnnotations(offset, offset + 1);
			while (annotations.hasNext()) {
				var annotation = annotations.next();
				if (annotation.type === mAnnotations.AnnotationType.ANNOTATION_FOLDING) {
					if (annotation.expand) {
						annotation.expand();
						annotationModel.modifyAnnotation(annotation);
					}
				}
			}
		},

		setCaretOffset: function(caretOffset, show, callback) {
			var textView = this._textView;
			var model = textView.getModel();
			if (model.getBaseModel) {
				this._expandOffset(caretOffset);
				caretOffset = model.mapOffset(caretOffset, true);
			}
			textView.setCaretOffset(caretOffset, show, callback);
		},
	
		setText: function(text, start, end) {
			var textView = this._textView;
			var model = textView.getModel();
			if (model.getBaseModel) {
				if (start !== undefined) {
					this._expandOffset(start);
					start = model.mapOffset(start, true);
				}
				if (end !== undefined) {
					this._expandOffset(end);
					end = model.mapOffset(end, true);
				}
			}
			textView.setText(text, start, end);
		},
		
		/**
		 * @deprecated use #setFoldingRulerVisible
		 */
		setFoldingEnabled: function(enabled) {
			this.setFoldingRulerVisible(enabled);
		},
		
		setSelection: function(start, end, show, callback) {
			var textView = this._textView;
			var model = textView.getModel();
			if (model.getBaseModel) {
				this._expandOffset(start);
				this._expandOffset(end);
				start = model.mapOffset(start, true);
				end = model.mapOffset(end, true);
			}
			textView.setSelection(start, end, show, callback);
		},
				
		/**
		 * @param {Number} start
		 * @param {Number} [end]
		 * @param {function} [callback] if callback is specified, scrolling to show the selection is animated and callback is called when the animation is done.
		 * @param {Boolean} [focus=true] whether the text view should be focused when the selection is done.
		 * @private
		 * @deprecated use #setSelection instead
		 */
		moveSelection: function(start, end, callback, focus) {
			end = end || start;
			var textView = this._textView;
			this.setSelection(start, end, 1 / 3, function() {
				if (focus === undefined || focus) {
					textView.focus();
				}
				if (callback) {
					callback();
				}
			});
		},
		
		/** @private */
		checkDirty : function() {
			this.setDirty(!this._undoStack.isClean());
		},
		
		/**
		 * @private
		 */
		reportStatus: function(message, type, isAccessible) {
			if (this._statusReporter) {
				this._statusReporter(message, type, isAccessible);
			}
		},
		
		/** @private */
		_getTooltipInfo: function(x, y) {
			var textView = this._textView;			
			var annotationModel = this.getAnnotationModel();
			if (!annotationModel) { return null; }
			var annotationStyler = this._annotationStyler;
			if (!annotationStyler) { return null; }
			var offset = textView.getOffsetAtLocation(x, y);
			if (offset === -1) { return null; }
			offset = this.mapOffset(offset);
			var annotations = annotationStyler.getAnnotationsByType(annotationModel, offset, offset + 1);
			var rangeAnnotations = [];
			for (var i = 0; i < annotations.length; i++) {
				if (annotations[i].rangeStyle) {
					rangeAnnotations.push(annotations[i]);
				}
			}
			if (rangeAnnotations.length === 0) { return null; }
			var pt = textView.convert({x: x, y: y}, "document", "page"); //$NON-NLS-1$ //$NON-NLS-0$
			var info = {
				contents: rangeAnnotations,
				anchor: "left", //$NON-NLS-0$
				x: pt.x + 10,
				y: pt.y + 20
			};
			return info;
		},
		
		/** @private */
		_highlightCurrentLine: function(newSelection, oldSelection) {
			var annotationModel = this._annotationModel;
			if (!annotationModel) { return; }
			var textView = this._textView;	
			var model = textView.getModel();
			var oldLineIndex = oldSelection ? model.getLineAtOffset(oldSelection.start) : -1;
			var lineIndex = model.getLineAtOffset(newSelection.start);
			var newEmpty = newSelection.start === newSelection.end;
			var oldEmpty = !oldSelection || oldSelection.start === oldSelection.end;
			var start = model.getLineStart(lineIndex);
			var end = model.getLineEnd(lineIndex);
			if (model.getBaseModel) {
				start = model.mapOffset(start);
				end = model.mapOffset(end);
			}
			var annotation = this._currentLineAnnotation; 
			if (oldLineIndex === lineIndex && oldEmpty && newEmpty && annotation && annotation.start === start && annotation.end === end) {
				return;
			}
			var remove = annotation ? [annotation] : null;
			var add;
			if (newEmpty) {
				var type = mAnnotations.AnnotationType.ANNOTATION_CURRENT_LINE;
				annotation = mAnnotations.AnnotationType.createAnnotation(type, start, end);
				add = [annotation];
			}
			this._currentLineAnnotation = annotation;
			annotationModel.replaceAnnotations(remove, add);
		},
		
		/**
		 * Creates the underlying TextView and installs the editor's features.
		 */
		installTextView : function() {
			// Create textView and install optional features
			this._textView = this._textViewFactory();
			if (this._undoStackFactory) {
				this._undoStack = this._undoStackFactory.createUndoStack(this);
			}
			if (this._textDNDFactory) {
				this._textDND = this._textDNDFactory.createTextDND(this, this._undoStack);
			}
			if (this._contentAssistFactory) {
				var contentAssistMode = this._contentAssistFactory.createContentAssistMode(this);
				this._keyModes.push(contentAssistMode);
				this._contentAssist = contentAssistMode.getContentAssist();
			}
			
			var editor = this, textView = this._textView;
			
			var self = this;
			this._listener = {
				onModelChanged: function(e) {
					self.checkDirty();
				},
				onMouseOver: function(e) {
					self._listener.onMouseMove(e);
				},
				onMouseMove: function(e) {
					var tooltip = mTooltip.Tooltip.getTooltip(textView);
					if (!tooltip) { return; }
					if (self._listener.lastMouseX === e.event.clientX && self._listener.lastMouseY === e.event.clientY) {
						return;
					}
					self._listener.lastMouseX = e.event.clientX;
					self._listener.lastMouseY = e.event.clientY;
					tooltip.setTarget({
						x: e.x,
						y: e.y,
						getTooltipInfo: function() {
							return self._getTooltipInfo(this.x, this.y);
						}
					});
				},
				onMouseOut: function(e) {
					var tooltip = mTooltip.Tooltip.getTooltip(textView);
					if (!tooltip) { return; }
					if (self._listener.lastMouseX === e.event.clientX && self._listener.lastMouseY === e.event.clientY) {
						return;
					}
					self._listener.lastMouseX = e.event.clientX;
					self._listener.lastMouseY = e.event.clientY;
					tooltip.setTarget(null);
				},
				onScroll: function(e) {
					var tooltip = mTooltip.Tooltip.getTooltip(textView);
					if (!tooltip) { return; }
					tooltip.setTarget(null);
				},
				onSelection: function(e) {
					self._updateCursorStatus();
					self._highlightCurrentLine(e.newValue, e.oldValue);
				}
			};
			textView.addEventListener("ModelChanged", this._listener.onModelChanged); //$NON-NLS-0$
			textView.addEventListener("Selection", this._listener.onSelection); //$NON-NLS-0$
			textView.addEventListener("MouseOver", this._listener.onMouseOver); //$NON-NLS-0$
			textView.addEventListener("MouseOut", this._listener.onMouseOut); //$NON-NLS-0$
			textView.addEventListener("MouseMove", this._listener.onMouseMove); //$NON-NLS-0$
			textView.addEventListener("Scroll", this._listener.onScroll); //$NON-NLS-0$
						
			// Set up keybindings
			if (this._keyBindingFactory) {
				this._keyBindingFactory(this, this._keyModes, this._undoStack, this._contentAssist);
			}
			
			// Set keybindings for keys that apply to different modes
			textView.setKeyBinding(new mKeyBinding.KeyBinding(27), "cancelMode"); //$NON-NLS-0$
			textView.setAction("cancelMode", function() { //$NON-NLS-0$
				// loop through all modes in case multiple modes are active.  Keep track of whether we processed the key.
				var keyUsed = false;
				for (var i=0; i<this._keyModes.length; i++) {
					if (this._keyModes[i].isActive()) {
						keyUsed = this._keyModes[i].cancel() || keyUsed;
					}
				}
				return keyUsed;
			}.bind(this), {name: messages.cancelMode});

			textView.setAction("lineUp", function() { //$NON-NLS-0$
				for (var i=0; i<this._keyModes.length; i++) {
					if (this._keyModes[i].isActive()) {
						return this._keyModes[i].lineUp();
					}
				}
				return false;
			}.bind(this));
			textView.setAction("lineDown", function() { //$NON-NLS-0$
				for (var i=0; i<this._keyModes.length; i++) {
					if (this._keyModes[i].isActive()) {
						return this._keyModes[i].lineDown();
					}
				}
				return false;
			}.bind(this));

			textView.setAction("enter", function() { //$NON-NLS-0$
				for (var i=0; i<this._keyModes.length; i++) {
					if (this._keyModes[i].isActive()) {
						return this._keyModes[i].enter();
					}
				}
				return false;
			}.bind(this));

			var addRemoveBookmark = function(lineIndex, e) {
				if (lineIndex === undefined) { return; }
				if (lineIndex === -1) { return; }
				var view = this.getView();
				var viewModel = view.getModel();
				var annotationModel = this.getAnnotationModel();
				var lineStart = editor.mapOffset(viewModel.getLineStart(lineIndex));
				var lineEnd = editor.mapOffset(viewModel.getLineEnd(lineIndex));
				var annotations = annotationModel.getAnnotations(lineStart, lineEnd);
				var bookmark = null;
				while (annotations.hasNext()) {
					var annotation = annotations.next();
					if (annotation.type === mAnnotations.AnnotationType.ANNOTATION_BOOKMARK) {
						bookmark = annotation;
						break;
					}
				}
				if (bookmark) {
					annotationModel.removeAnnotation(bookmark);
				} else {
					bookmark = mAnnotations.AnnotationType.createAnnotation(mAnnotations.AnnotationType.ANNOTATION_BOOKMARK, lineStart, lineEnd);
					bookmark.title = undefined;
					annotationModel.addAnnotation(bookmark);
				}
			};

			// Create rulers, annotation model and styler
			if (this._annotationFactory) {
				var textModel = textView.getModel();
				if (textModel.getBaseModel) { textModel = textModel.getBaseModel(); }
				this._annotationModel = this._annotationFactory.createAnnotationModel(textModel);
				if (this._annotationModel) {
					var styler = this._annotationStyler = this._annotationFactory.createAnnotationStyler(textView, this._annotationModel);
					if (styler) {
						styler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_CURRENT_SEARCH);
						styler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_MATCHING_SEARCH);
						styler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_ERROR);
						styler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_WARNING);
						styler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_MATCHING_BRACKET);
						styler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_CURRENT_BRACKET);
						styler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_CURRENT_LINE);
						styler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_READ_OCCURRENCE);
						styler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_WRITE_OCCURRENCE);
						styler.addAnnotationType(HIGHLIGHT_ERROR_ANNOTATION);
					}
				}
				
				/*
				* TODO - UndoStack relies on this line to ensure that collapsed regions are expanded 
				* when the undo operation happens to those regions. This line needs to be remove when the
				* UndoStack is fixed.
				*/
				textView.annotationModel = this._annotationModel;
					
				var rulers = this._annotationFactory.createAnnotationRulers(this._annotationModel);
				var ruler = this._annotationRuler = rulers.annotationRuler;
				if (ruler) {
					ruler.onDblClick = addRemoveBookmark;
					ruler.setMultiAnnotationOverlay({html: "<div class='annotationHTML overlay'></div>"}); //$NON-NLS-0$
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_ERROR);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_WARNING);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_TASK);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_BOOKMARK);
				}
				this.setAnnotationRulerVisible(true);
					
				ruler = this._overviewRuler = rulers.overviewRuler;
				if (ruler) {
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_CURRENT_SEARCH);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_MATCHING_SEARCH);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_ERROR);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_WARNING);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_TASK);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_BOOKMARK);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_MATCHING_BRACKET);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_CURRENT_BRACKET);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_CURRENT_LINE);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_READ_OCCURRENCE);
					ruler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_WRITE_OCCURRENCE);
				}
				this.setOverviewRulerVisible(true);
			}
			
			if (this._lineNumberRulerFactory) {
				this._lineNumberRuler = this._lineNumberRulerFactory.createLineNumberRuler(this._annotationModel);
				this._lineNumberRuler.onDblClick = addRemoveBookmark;
				this.setLineNumberRulerVisible(true);
			}
			
			if (this._foldingRulerFactory) {
				this._foldingRuler = this._foldingRulerFactory.createFoldingRuler(this._annotationModel);
				this._foldingRuler.addAnnotationType(mAnnotations.AnnotationType.ANNOTATION_FOLDING);
				this.setFoldingRulerVisible(false);
			}
			
			var textViewInstalledEvent = {
				type: "TextViewInstalled", //$NON-NLS-0$
				textView: textView
			};
			this.dispatchEvent(textViewInstalledEvent);
		},
		
		/**
		 * Destroys the underlying TextView.
		 */
		uninstallTextView: function() {
			var textView = this._textView;
			if (!textView) { return; }
			
			textView.destroy();
			
			this._textView = this._undoStack = this._textDND = this._contentAssist = 
				this._listener = this._annotationModel = this._annotationStyler =
				this._annotationRuler = this._overviewRuler = this._lineNumberRuler =
				this._foldingRuler = this._currentLineAnnotation = this._title = null;
			this._dirty = false;
			this._keyModes = [];
			
			var textViewUninstalledEvent = {
				type: "TextViewUninstalled", //$NON-NLS-0$
				textView: textView
			};
			this.dispatchEvent(textViewUninstalledEvent);
		},
		
		_updateCursorStatus: function() {
			var model = this.getModel();
			var caretOffset = this.getCaretOffset();
			var lineIndex = model.getLineAtOffset(caretOffset);
			var lineStart = model.getLineStart(lineIndex);
			var offsetInLine = caretOffset - lineStart;
			// If we are in a mode and it owns status reporting, we bail out from reporting the cursor position.
			for (var i=0; i<this._keyModes.length; i++) {
				var mode = this._keyModes[i];
				if (mode.isActive() && mode.isStatusActive && mode.isStatusActive()) {
					return;
				}
			}
			this.reportStatus(util.formatMessage(messages.lineColumn, lineIndex + 1, offsetInLine + 1));
		},
		
		showProblems: function(problems) {
			var annotationModel = this._annotationModel;
			if (!annotationModel) {
				return;
			}
			var remove = [], add = [];
			var model = annotationModel.getTextModel();
			var annotations = annotationModel.getAnnotations(0, model.getCharCount()), annotation;
			while (annotations.hasNext()) {
				annotation = annotations.next();
				if (annotation.type === mAnnotations.AnnotationType.ANNOTATION_ERROR || annotation.type === mAnnotations.AnnotationType.ANNOTATION_WARNING) {
					remove.push(annotation);
				}
			}
			if (problems) { 
				for (var i = 0; i < problems.length; i++) {
					var problem = problems[i];
					if (problem) {
						// escaping voodoo... we need to construct HTML that contains valid JavaScript.
						var escapedDescription = problem.description.replace(/'/g, "&#39;").replace(/"/g, '&#34;'); //$NON-NLS-1$ //$NON-NLS-0$
						var lineIndex = problem.line - 1;
						var lineStart = model.getLineStart(lineIndex);
						var severity = problem.severity;
						var type = severity === "error" ? mAnnotations.AnnotationType.ANNOTATION_ERROR : mAnnotations.AnnotationType.ANNOTATION_WARNING; //$NON-NLS-0$
						var start = lineStart + problem.start - 1;
						var end = lineStart + problem.end;
						annotation = mAnnotations.AnnotationType.createAnnotation(type, start, end, escapedDescription);
						add.push(annotation);
					}
				}
			}
			annotationModel.replaceAnnotations(remove, add);
		},
		
		showOccurrences: function(occurrences) {
			var annotationModel = this._annotationModel;
			if (!annotationModel) {
				return;
			}
			var remove = [], add = [];
			var model = annotationModel.getTextModel();
			var annotations = annotationModel.getAnnotations(0, model.getCharCount()), annotation;
			while (annotations.hasNext()) {
				annotation = annotations.next();
				if (annotation.type === mAnnotations.AnnotationType.ANNOTATION_READ_OCCURRENCE || annotation.type === mAnnotations.AnnotationType.ANNOTATION_WRITE_OCCURRENCE) {
					remove.push(annotation);
				}
			}
			if (occurrences) { 
				for (var i = 0; i < occurrences.length; i++) {
					var occurrence = occurrences[i];
					if (occurrence) {
						var lineIndex = occurrence.line - 1;
						var lineStart = model.getLineStart(lineIndex);
						var start = lineStart + occurrence.start - 1;
						var end = lineStart + occurrence.end;
						var type = occurrence.readAccess === true ? mAnnotations.AnnotationType.ANNOTATION_READ_OCCURRENCE : mAnnotations.AnnotationType.ANNOTATION_WRITE_OCCURRENCE;
						var description = occurrence.description;
						annotation = mAnnotations.AnnotationType.createAnnotation(type, start, end, description);
						add.push(annotation);
					}
				}
			}
			annotationModel.replaceAnnotations(remove, add);
		},
		
		/**
		 * Reveals and selects a portion of text.
		 * @param {Number} start
		 * @param {Number} end
		 * @param {Number} line
		 * @param {Number} offset
		 * @param {Number} length
		 */
		showSelection: function(start, end, line, offset, length) {
			// We use typeof because we need to distinguish the number 0 from an undefined or null parameter
			if (typeof(start) === "number") { //$NON-NLS-0$
				if (typeof(end) !== "number") { //$NON-NLS-0$
					end = start;
				}
				this.moveSelection(start, end);
			} else if (typeof(line) === "number") { //$NON-NLS-0$
				var model = this.getModel();
				var pos = model.getLineStart(line-1);
				if (typeof(offset) === "number") { //$NON-NLS-0$
					pos = pos + offset;
				}
				if (typeof(length) !== "number") { //$NON-NLS-0$
					length = 0;
				}
				this.moveSelection(pos, pos+length);
			}
		},
		
		/**
		 * Sets the editor's contents.
		 *
		 * @param {String} title
		 * @param {String} message
		 * @param {String} contents
		 * @param {Boolean} contentsSaved
		 */
		setInput: function(title, message, contents, contentsSaved) {
			this._title = title;
			if (this._textView) {
				if (contentsSaved) {
					// don't reset undo stack on save, just mark it clean so that we don't lose the undo past the save
					this._undoStack.markClean();
					this.checkDirty();
				} else {
					if (message) {
						this._textView.setText(message);
					} else {
						if (contents !== null && contents !== undefined) {
							this._textView.setText(contents);
							this._textView.getModel().setLineDelimiter("auto"); //$NON-NLS-0$
							this._highlightCurrentLine(this._textView.getSelection());
						}
					}
					this._undoStack.reset();
					this.checkDirty();
					this._textView.focus();
				}
			}
			this.onInputChanged({
				type: "InputChanged", //$NON-NLS-0$
				title: title,
				message: message,
				contents: contents,
				contentsSaved: contentsSaved
			});
		},
		
		/**
		 * Called when the editor's contents have changed.
		 * @param {Event} inputChangedEvent
		 */
		onInputChanged: function (inputChangedEvent) {
			return this.dispatchEvent(inputChangedEvent);
		},
		/**
		 * Reveals a line in the editor, and optionally selects a portion of the line.
		 * @param {Number} line - document base line index
		 * @param {Number|String} column
		 * @param {Number} [end]
		 */
		onGotoLine: function(line, column, end) {
			if (this._textView) {
				var model = this.getModel();
				var lineStart = model.getLineStart(line);
				var start = 0;
				if (end === undefined) {
					end = 0;
				}
				if (typeof column === "string") { //$NON-NLS-0$
					var index = model.getLine(line).indexOf(column);
					if (index !== -1) {
						start = index;
						end = start + column.length;
					}
				} else {
					start = column;
					var lineLength = model.getLineEnd(line) - lineStart;
					start = Math.min(start, lineLength);
					end = Math.min(end, lineLength);
				}
				this.moveSelection(lineStart + start, lineStart + end);
			}
		},
		
		/**
		 * Called when the dirty state of the editor changes.
		 * @param {Event} dirtyChangedEvent
		 */
		onDirtyChanged: function(dirtyChangedEvent) {
			return this.dispatchEvent(dirtyChangedEvent);
		}
	};
	mEventTarget.EventTarget.addMixin(Editor.prototype);

	/**
	 * @private
	 * @param context Value to be used as the returned function's <code>this</code> value.
	 * @param [arg1, arg2, ...] Fixed argument values that will prepend any arguments passed to the returned function when it is invoked.
	 * @returns {Function} A function that always executes this function in the given <code>context</code>.
	 */
	function bind(context) {
		var fn = this,
		    fixed = Array.prototype.slice.call(arguments, 1);
		if (fixed.length) {
			return function() {
				return arguments.length
					? fn.apply(context, fixed.concat(Array.prototype.slice.call(arguments)))
					: fn.apply(context, fixed);
			};
		}
		return function() {
			return arguments.length ? fn.apply(context, arguments) : fn.call(context);
		};
	}

	if (!Function.prototype.bind) {
		Function.prototype.bind = bind;
	}

	return {
		Editor: Editor
	};
});

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
/*jslint browser:true regexp:false*/
/**
 * @name orion.editor.regex
 * @class Utilities for dealing with regular expressions.
 * @description Utilities for dealing with regular expressions.
 */
define("orion/editor/regex", [], function() {
	/**
	 * @methodOf orion.editor.regex
	 * @static
	 * @description Escapes regex special characters in the input string.
	 * @param {String} str The string to escape.
	 * @returns {String} A copy of <code>str</code> with regex special characters escaped.
	 */
	function escape(str) {
		return str.replace(/([\\$\^*\/+?\.\(\)|{}\[\]])/g, "\\$&");
	}

	/**
	 * @methodOf orion.editor.regex
	 * @static
	 * @description Parses a pattern and flags out of a regex literal string.
	 * @param {String} str The string to parse. Should look something like <code>"/ab+c/"</code> or <code>"/ab+c/i"</code>.
	 * @returns {Object} If <code>str</code> looks like a regex literal, returns an object with properties
	 * <code><dl>
	 * <dt>pattern</dt><dd>{String}</dd>
	 * <dt>flags</dt><dd>{String}</dd>
	 * </dl></code> otherwise returns <code>null</code>.
	 */
	function parse(str) {
		var regexp = /^\s*\/(.+)\/([gim]{0,3})\s*$/.exec(str);
		if (regexp) {
			return {
				pattern : regexp[1],
				flags : regexp[2]
			};
		}
		return null;
	}

	return {
		escape: escape,
		parse: parse
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global define prompt */

define("orion/editor/editorFeatures", [ //$NON-NLS-0$
	'i18n!orion/editor/nls/messages', //$NON-NLS-0$
	'orion/editor/undoStack', //$NON-NLS-0$
	'orion/keyBinding', //$NON-NLS-0$
	'orion/editor/rulers', //$NON-NLS-0$
	'orion/editor/annotations', //$NON-NLS-0$
	'orion/editor/tooltip', //$NON-NLS-0$
	'orion/editor/textDND', //$NON-NLS-0$
	'orion/editor/regex', //$NON-NLS-0$
	'orion/util' //$NON-NLS-0$
], function(messages, mUndoStack, mKeyBinding, mRulers, mAnnotations, mTooltip, mTextDND, mRegex, util) {

	function UndoFactory() {
	}
	UndoFactory.prototype = {
		createUndoStack: function(editor) {
			var textView = editor.getTextView();
			var undoStack =  new mUndoStack.UndoStack(textView, 200);
			textView.setAction("undo", function() { //$NON-NLS-0$
				undoStack.undo();
				return true;
			}, {name: messages.undo});
			
			textView.setAction("redo", function() { //$NON-NLS-0$
				undoStack.redo();
				return true;
			}, {name: messages.redo});
			return undoStack;
		}
	};

	function LineNumberRulerFactory() {
	}
	LineNumberRulerFactory.prototype = {
		createLineNumberRuler: function(annotationModel) {
			return new mRulers.LineNumberRuler(annotationModel, "left", {styleClass: "ruler lines"}, {styleClass: "rulerLines odd"}, {styleClass: "rulerLines even"}); //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		}
	};
	
	function FoldingRulerFactory() {
	}
	FoldingRulerFactory.prototype = {
		createFoldingRuler: function(annotationModel) {
			return new mRulers.FoldingRuler(annotationModel, "left", {styleClass: "ruler folding"}); //$NON-NLS-1$ //$NON-NLS-0$
		}
	};
	
	function AnnotationFactory() {
	}
	AnnotationFactory.prototype = {
		createAnnotationModel: function(model) {
			return new mAnnotations.AnnotationModel(model);
		},
		createAnnotationStyler: function(annotationModel, view) {
			return new mAnnotations.AnnotationStyler(annotationModel, view);
		},
		createAnnotationRulers: function(annotationModel) {
			var annotationRuler = new mRulers.AnnotationRuler(annotationModel, "left", {styleClass: "ruler annotations"}); //$NON-NLS-1$ //$NON-NLS-0$
			var overviewRuler = new mRulers.OverviewRuler(annotationModel, "right", {styleClass: "ruler overview"}); //$NON-NLS-1$ //$NON-NLS-0$
			return {annotationRuler: annotationRuler, overviewRuler: overviewRuler};
		}
	};
	
	function TextDNDFactory() {
	}
	TextDNDFactory.prototype = {
		createTextDND: function(editor, undoStack) {
			return new mTextDND.TextDND(editor.getTextView(), undoStack);
		}
	};
	
	function IncrementalFind(editor) {
		this.editor = editor;
		this._active = false;
		this._success = true;
		this._ignoreSelection = false;
		this._prefix = "";
		var self = this;
		this._listener = {
			onVerify: function(e){
				var editor = self.editor;
				var model = editor.getModel();
				var start = editor.mapOffset(e.start), end = editor.mapOffset(e.end);
				var txt = model.getText(start, end);
				var prefix = self._prefix;
				// TODO: mRegex is pulled in just for this one call so we can get case-insensitive search
				// is it really necessary
				var match = prefix.match(new RegExp("^" + mRegex.escape(txt), "i")); //$NON-NLS-1$ //$NON-NLS-0$
				if (match && match.length > 0) {
					prefix = self._prefix += e.text;
					self._success = true;
					self._status();
					self.find(true);
					e.text = null;
				}
			},
			onSelection: function() {
				if (!self._ignoreSelection) {
					self.setActive(false);
				}
			}
		};
	}
	IncrementalFind.prototype = {
		backspace: function() {
			if (!this.isActive()) {
				return false;
			}
			var prefix = this._prefix;
			prefix = this._prefix = prefix.substring(0, prefix.length-1);
			if (prefix.length === 0) {
				this._success = true;
				this._ignoreSelection = true;
				this.editor.setCaretOffset(this.editor.getSelection().start);
				this._ignoreSelection = false;
				this._status();
				return true;
			}
			return this.find(false);
		},
		find: function(forward) {
			if (!this.isActive()) {
				return false;
			}
			var prefix = this._prefix;
			if (prefix.length === 0) {
				return false;
			}
			var editor = this.editor;
			var model = editor.getModel();
			var start;
			if (forward) {
				if (this._success) {
					start = editor.getSelection().start + 1;
				} else {
					start = 0;
				}
			} else {
				if (this._success) {
					start = editor.getCaretOffset() - prefix.length - 1;
				} else {
					start = model.getCharCount() - 1;
				}
			}
			var result = editor.getModel().find({
				string: prefix,
				start: start,
				reverse: !forward,
				caseInsensitive: prefix.toLowerCase() === prefix}).next();
			if (result) {
				this._success = true;
				this._ignoreSelection = true;
				editor.moveSelection(result.start, result.end);
				this._ignoreSelection = false;
			} else {
				this._success = false;
			}
			this._status();
			return true;
		},
		isActive: function() {
			return this._active;
		},
		setActive: function(active) {
			this._active = active;
			this._prefix = "";
			this._success = true;
			var editor = this.editor;
			var textView = editor.getTextView();
			this.editor.setCaretOffset(this.editor.getCaretOffset());
			if (this._active) {
				textView.addEventListener("Verify", this._listener.onVerify); //$NON-NLS-0$
				textView.addEventListener("Selection", this._listener.onSelection); //$NON-NLS-0$
			} else {
				textView.removeEventListener("Verify", this._listener.onVerify); //$NON-NLS-0$
				textView.removeEventListener("Selection", this._listener.onSelection); //$NON-NLS-0$
			}
			this._status();
		},
		_status: function() {
			if (!this.isActive()) {
				this.editor.reportStatus("");
				return;
			}
			var formattedMessage = util.formatMessage(this._success ? messages.incrementalFind : messages.incrementalFindNotFound, this._prefix);
			this.editor.reportStatus(formattedMessage, this._success ? "" : "error"); //$NON-NLS-0$
		}
	};

	/**
	 * TextCommands connects common text editing keybindings onto an editor.
	 */
	function TextActions(editor, undoStack, searcher) {
		this.editor = editor;
		this.undoStack = undoStack;
		this._incrementalFind = new IncrementalFind(editor);
		this._searcher =  searcher;
		this._lastEditLocation = null;
		this.init();
	}
	TextActions.prototype = {
		init: function() {
			var self = this;
			var textView = this.editor.getTextView();
			
			this._lastEditListener = {
				onModelChanged: function(e) {
					if (self.editor.isDirty()) {
						self._lastEditLocation = e.start + e.addedCharCount;
					}
				}
			};
			textView.addEventListener("ModelChanged", this._lastEditListener.onModelChanged); //$NON-NLS-0$
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding("k", true), "findNext"); //$NON-NLS-1$ //$NON-NLS-0$
			textView.setAction("findNext", function() { //$NON-NLS-0$
				if (this._searcher){
					var selection = textView.getSelection();
					if(selection.start < selection.end) {
						this._searcher.findNext(true, textView.getText(selection.start, selection.end));
					} else {
						this._searcher.findNext(true);
					}
					return true;
				}
				return false;
			}.bind(this), {name: messages.findNext});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding("k", true, true), "findPrevious"); //$NON-NLS-1$ //$NON-NLS-0$
			textView.setAction("findPrevious", function() { //$NON-NLS-0$
				if (this._searcher){
					var selection = textView.getSelection();
					if(selection.start < selection.end) {
						this._searcher.findNext(false, textView.getText(selection.start, selection.end));
					} else {
						this._searcher.findNext(false);
					}
					return true;
				}
				return false;
			}.bind(this), {name: messages.findPrevious});
	
			textView.setKeyBinding(new mKeyBinding.KeyBinding("j", true), "incrementalFind"); //$NON-NLS-1$ //$NON-NLS-0$
			textView.setAction("incrementalFind", function() { //$NON-NLS-0$
				if (this._searcher && this._searcher.visible()) {
					return true;
				}
				if (!this._incrementalFind.isActive()) {
					this._incrementalFind.setActive(true);
				} else {
					this._incrementalFind.find(true);
				}
				return true;
			}.bind(this), {name: messages.incrementalFindKey});
			textView.setAction("deletePrevious", function() { //$NON-NLS-0$
				return this._incrementalFind.backspace();
			}.bind(this));
			
			textView.setAction("tab", function() { //$NON-NLS-0$
				if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
				if(!textView.getOptions("tabMode")) { return; } //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var selection = editor.getSelection();
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				if (firstLine !== lastLine) {
					var lines = [];
					lines.push("");
					for (var i = firstLine; i <= lastLine; i++) {
						lines.push(model.getLine(i, true));
					}
					var lineStart = model.getLineStart(firstLine);
					var lineEnd = model.getLineEnd(lastLine, true);
					var options = textView.getOptions("tabSize", "expandTab"); //$NON-NLS-1$ //$NON-NLS-0$
					var text = options.expandTab ? new Array(options.tabSize + 1).join(" ") : "\t"; //$NON-NLS-1$ //$NON-NLS-0$
					editor.setText(lines.join(text), lineStart, lineEnd);
					editor.setSelection(lineStart === selection.start ? selection.start : selection.start + text.length, selection.end + ((lastLine - firstLine + 1) * text.length));
					return true;
				}
				
				var keyModes = editor.getKeyModes();
				for (var j = 0; j < keyModes.length; j++) {
					if (keyModes[j].isActive()) {
						return keyModes[j].tab();
					}
				}
				
				return false;
			}.bind(this));
	
			textView.setAction("shiftTab", function() { //$NON-NLS-0$
				if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
				if(!textView.getOptions("tabMode")) { return; } //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var selection = editor.getSelection();
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var tabSize = textView.getOptions("tabSize"); //$NON-NLS-0$
				var spaceTab = new Array(tabSize + 1).join(" "); //$NON-NLS-0$
				var lines = [], removeCount = 0, firstRemoveCount = 0;
				for (var i = firstLine; i <= lastLine; i++) {
					var line = model.getLine(i, true);
					if (model.getLineStart(i) !== model.getLineEnd(i)) {
						if (line.indexOf("\t") === 0) { //$NON-NLS-0$
							line = line.substring(1);
							removeCount++;
						} else if (line.indexOf(spaceTab) === 0) {
							line = line.substring(tabSize);
							removeCount += tabSize;
						} else {
							return true;
						}
					}
					if (i === firstLine) {
						firstRemoveCount = removeCount;
					}
					lines.push(line);
				}
				var lineStart = model.getLineStart(firstLine);
				var lineEnd = model.getLineEnd(lastLine, true);
				var lastLineStart = model.getLineStart(lastLine);
				editor.setText(lines.join(""), lineStart, lineEnd);
				var start = lineStart === selection.start ? selection.start : selection.start - firstRemoveCount;
				var end = Math.max(start, selection.end - removeCount + (selection.end === lastLineStart+1 && selection.start !== selection.end ? 1 : 0));
				editor.setSelection(start, end);
				return true;
			}.bind(this), {name: messages.unindentLines});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding(38, false, false, true), "moveLinesUp"); //$NON-NLS-0$
			textView.setAction("moveLinesUp", function() { //$NON-NLS-0$
				if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var selection = editor.getSelection();
				var firstLine = model.getLineAtOffset(selection.start);
				if (firstLine === 0) {
					return true;
				}
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var lineCount = model.getLineCount();
				var insertOffset = model.getLineStart(firstLine - 1);
				var lineStart = model.getLineStart(firstLine);
				var lineEnd = model.getLineEnd(lastLine, true);
				var text = model.getText(lineStart, lineEnd);
				var delimiterLength = 0;
				if (lastLine === lineCount-1) {
					// Move delimiter preceding selection to end of text
					var delimiterStart = model.getLineEnd(firstLine - 1);
					var delimiterEnd = model.getLineEnd(firstLine - 1, true);
					text += model.getText(delimiterStart, delimiterEnd);
					lineStart = delimiterStart;
					delimiterLength = delimiterEnd - delimiterStart;
				}
				this.startUndo();
				editor.setText("", lineStart, lineEnd);
				editor.setText(text, insertOffset, insertOffset);
				editor.setSelection(insertOffset, insertOffset + text.length - delimiterLength);
				this.endUndo();
				return true;
			}.bind(this), {name: messages.moveLinesUp});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding(40, false, false, true), "moveLinesDown"); //$NON-NLS-0$
			textView.setAction("moveLinesDown", function() { //$NON-NLS-0$
				if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var selection = editor.getSelection();
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var lineCount = model.getLineCount();
				if (lastLine === lineCount-1) {
					return true;
				}
				var lineStart = model.getLineStart(firstLine);
				var lineEnd = model.getLineEnd(lastLine, true);
				var insertOffset = model.getLineEnd(lastLine+1, true) - (lineEnd - lineStart);
				var text, delimiterLength = 0;
				if (lastLine !== lineCount-2) {
					text = model.getText(lineStart, lineEnd);
				} else {
					// Move delimiter following selection to front of the text
					var lineEndNoDelimiter = model.getLineEnd(lastLine);
					text = model.getText(lineEndNoDelimiter, lineEnd) + model.getText(lineStart, lineEndNoDelimiter);
					delimiterLength += lineEnd - lineEndNoDelimiter;
				}
				this.startUndo();
				editor.setText("", lineStart, lineEnd);
				editor.setText(text, insertOffset, insertOffset);
				editor.setSelection(insertOffset + delimiterLength, insertOffset + delimiterLength + text.length);
				this.endUndo();
				return true;
			}.bind(this), {name: messages.moveLinesDown});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding(38, true, false, true), "copyLinesUp"); //$NON-NLS-0$
			textView.setAction("copyLinesUp", function() { //$NON-NLS-0$
				if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var selection = editor.getSelection();
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var lineStart = model.getLineStart(firstLine);
				var lineEnd = model.getLineEnd(lastLine, true);
				var lineCount = model.getLineCount();
				var delimiter = "";
				var text = model.getText(lineStart, lineEnd);
				if (lastLine === lineCount-1) {
					text += (delimiter = model.getLineDelimiter());
				}
				var insertOffset = lineStart;
				editor.setText(text, insertOffset, insertOffset);
				editor.setSelection(insertOffset, insertOffset + text.length - delimiter.length);
				return true;
			}.bind(this), {name: messages.copyLinesUp});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding(40, true, false, true), "copyLinesDown"); //$NON-NLS-0$
			textView.setAction("copyLinesDown", function() { //$NON-NLS-0$
				if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var selection = editor.getSelection();
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var lineStart = model.getLineStart(firstLine);
				var lineEnd = model.getLineEnd(lastLine, true);
				var lineCount = model.getLineCount();
				var delimiter = "";
				var text = model.getText(lineStart, lineEnd);
				if (lastLine === lineCount-1) {
					text = (delimiter = model.getLineDelimiter()) + text;
				}
				var insertOffset = lineEnd;
				editor.setText(text, insertOffset, insertOffset);
				editor.setSelection(insertOffset + delimiter.length, insertOffset + text.length);
				return true;
			}.bind(this), {name: messages.copyLinesDown});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding('d', true, false, false), "deleteLines"); //$NON-NLS-1$ //$NON-NLS-0$
			textView.setAction("deleteLines", function() { //$NON-NLS-0$
				if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
				var editor = this.editor;
				var selection = editor.getSelection();
				var model = editor.getModel();
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var lineStart = model.getLineStart(firstLine);
				var lineEnd = model.getLineEnd(lastLine, true);
				editor.setText("", lineStart, lineEnd);
				return true;
			}.bind(this), {name: messages.deleteLines});
			
			// Go To Line action
			textView.setKeyBinding(new mKeyBinding.KeyBinding("l", true), "gotoLine"); //$NON-NLS-1$ //$NON-NLS-0$
			textView.setAction("gotoLine", function() { //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var line = model.getLineAtOffset(editor.getCaretOffset());
				line = prompt(messages.gotoLinePrompty, line + 1);
				if (line) {
					line = parseInt(line, 10);
					editor.onGotoLine(line - 1, 0);
				}
				return true;
			}.bind(this), {name: messages.gotoLine});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding(190, true), "nextAnnotation"); //$NON-NLS-0$
			textView.setAction("nextAnnotation", function() { //$NON-NLS-0$
				return this.nextAnnotation(true);
			}.bind(this), {name: messages.nextAnnotation});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding(188, true), "previousAnnotation"); //$NON-NLS-0$
			textView.setAction("previousAnnotation", function() { //$NON-NLS-0$
				return this.nextAnnotation(false);
			}.bind(this), {name: messages.prevAnnotation});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding("e", true, false, true, false), "expand"); //$NON-NLS-1$ //$NON-NLS-0$
			textView.setAction("expand", function() { //$NON-NLS-0$
				return this.expandAnnotation(true);
			}.bind(this), {name: messages.expand});
	
			textView.setKeyBinding(new mKeyBinding.KeyBinding("c", true, false, true, false), "collapse"); //$NON-NLS-1$ //$NON-NLS-0$
			textView.setAction("collapse", function() { //$NON-NLS-0$
				return this.expandAnnotation(false);
			}.bind(this), {name: messages.collapse});
	
			textView.setKeyBinding(new mKeyBinding.KeyBinding("e", true, true, true, false), "expandAll"); //$NON-NLS-1$ //$NON-NLS-0$
			textView.setAction("expandAll", function() { //$NON-NLS-0$
				return this.expandAnnotations(true);
			}.bind(this), {name: messages.expandAll});
	
			textView.setKeyBinding(new mKeyBinding.KeyBinding("c", true, true, true, false), "collapseAll"); //$NON-NLS-1$ //$NON-NLS-0$
			textView.setAction("collapseAll", function() { //$NON-NLS-0$
				return this.expandAnnotations(false);
			}.bind(this), {name: messages.collapseAll});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding("q", !util.isMac, false, false, util.isMac), "lastEdit"); //$NON-NLS-1$ //$NON-NLS-0$
			textView.setAction("lastEdit", function() { //$NON-NLS-0$
				if (typeof this._lastEditLocation === "number")  { //$NON-NLS-0$
					this.editor.showSelection(this._lastEditLocation);
				}
				return true;
			}.bind(this), {name: messages.lastEdit});
		},
		
		nextAnnotation: function (forward) {
			var editor = this.editor;
			var annotationModel = editor.getAnnotationModel();
			if(!annotationModel) { return true; }
			var model = editor.getModel();
			var currentOffset = editor.getCaretOffset();
			var annotations = annotationModel.getAnnotations(forward ? currentOffset : 0, forward ? model.getCharCount() : currentOffset);
			var foundAnnotation = null;
			while (annotations.hasNext()) {
				var annotation = annotations.next();
				if (forward) {
					if (annotation.start <= currentOffset) { continue; }
				} else {
					if (annotation.start >= currentOffset) { continue; }
				}
				switch (annotation.type) {
					case mAnnotations.AnnotationType.ANNOTATION_ERROR:
					case mAnnotations.AnnotationType.ANNOTATION_WARNING:
					case mAnnotations.AnnotationType.ANNOTATION_TASK:
					case mAnnotations.AnnotationType.ANNOTATION_BOOKMARK:
						break;
					default:
						continue;
				}
				foundAnnotation = annotation;
				if (forward) {
					break;
				}
			}
			if (foundAnnotation) {
				var view = editor.getTextView();
				var nextLine = model.getLineAtOffset(foundAnnotation.start);
				var tooltip = mTooltip.Tooltip.getTooltip(view);
				if (!tooltip) {
					editor.moveSelection(foundAnnotation.start);
					return true;
				}
				editor.moveSelection(foundAnnotation.start, foundAnnotation.start, function() {
					tooltip.setTarget({
						getTooltipInfo: function() {
							var tooltipCoords = view.convert({
								x: view.getLocationAtOffset(foundAnnotation.start).x, 
								y: view.getLocationAtOffset(model.getLineStart(nextLine)).y
							}, "document", "page"); //$NON-NLS-1$ //$NON-NLS-0$
							return {
								contents: [foundAnnotation],
								x: tooltipCoords.x,
								y: tooltipCoords.y + Math.floor(view.getLineHeight(nextLine) * 1.33)
							};
						}
					}, 0);
				});
			}
			return true;
		},
		
		expandAnnotation: function(expand) {
			var editor = this.editor;
			var annotationModel = editor.getAnnotationModel();
			if(!annotationModel) { return true; }
			var model = editor.getModel();
			var currentOffset = editor.getCaretOffset();
			var lineIndex = model.getLineAtOffset(currentOffset);
			var start = model.getLineStart(lineIndex);
			var end = model.getLineEnd(lineIndex, true);
			if (model.getBaseModel) {
				start = model.mapOffset(start);
				end = model.mapOffset(end);
				model = model.getBaseModel();
			}
			var annotation, iter = annotationModel.getAnnotations(start, end);
			while (!annotation && iter.hasNext()) {
				var a = iter.next();
				if (a.type !== mAnnotations.AnnotationType.ANNOTATION_FOLDING) { continue; }
				annotation = a;
			}
			if (annotation) {
				if (expand !== annotation.expanded) {
					if (expand) {
						annotation.expand();
					} else {
						editor.setCaretOffset(annotation.start);
						annotation.collapse();
					}
					annotationModel.modifyAnnotation(annotation);
				}
			}
			return true;
		},

		expandAnnotations: function(expand) {
			var editor = this.editor;
			var textView = editor.getTextView();
			var annotationModel = editor.getAnnotationModel();
			if(!annotationModel) { return true; }
			var model = editor.getModel();
			var annotation, iter = annotationModel.getAnnotations(0, model.getCharCount());
			textView.setRedraw(false);
			while (iter.hasNext()) {
				annotation = iter.next();
				if (annotation.type !== mAnnotations.AnnotationType.ANNOTATION_FOLDING) { continue; }
				if (expand !== annotation.expanded) {
					if (expand) {
						annotation.expand();
					} else {
						annotation.collapse();
					}
					annotationModel.modifyAnnotation(annotation);
				}
			}
			textView.setRedraw(true);
			return true;
		},
		
		startUndo: function() {
			if (this.undoStack) {
				this.undoStack.startCompoundChange();
			}
		}, 
		
		endUndo: function() {
			if (this.undoStack) {
				this.undoStack.endCompoundChange();
			}
		}, 
	
		cancel: function() {
			this._incrementalFind.setActive(false);
		},
		
		isActive: function() {
			return this._incrementalFind.isActive();
		},
		
		isStatusActive: function() {
			return this._incrementalFind.isActive();
		},
		
		lineUp: function() {
			return this._incrementalFind.find(false);
		},
		lineDown: function() {	
			return this._incrementalFind.find(true);
		},
		enter: function() {
			return false;
		}
	};
	
	/**
	 * @param {orion.editor.Editor} editor
	 * @param {orion.editor.UndoStack} undoStack
	 * @param {orion.editor.ContentAssist} [contentAssist]
	 * @param {orion.editor.LinkedMode} [linkedMode]
	 */
	function SourceCodeActions(editor, undoStack, contentAssist, linkedMode) {
		this.editor = editor;
		this.undoStack = undoStack;
		this.contentAssist = contentAssist;
		this.linkedMode = linkedMode;
		if (this.contentAssist) {
			this.contentAssist.addEventListener("ProposalApplied", this.contentAssistProposalApplied.bind(this)); //$NON-NLS-0$
		}
		this.init();
	}
	SourceCodeActions.prototype = {
		startUndo: function() {
			if (this.undoStack) {
				this.undoStack.startCompoundChange();
			}
		}, 
		
		endUndo: function() {
			if (this.undoStack) {
				this.undoStack.endCompoundChange();
			}
		}, 
		init: function() {
			var textView = this.editor.getTextView();
		
			textView.setAction("lineStart", function() { //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var caretOffset = editor.getCaretOffset();
				var lineIndex = model.getLineAtOffset(caretOffset);
				var lineOffset = model.getLineStart(lineIndex);
				var lineText = model.getLine(lineIndex);
				var offset;
				for (offset=0; offset<lineText.length; offset++) {
					var c = lineText.charCodeAt(offset);
					if (!(c === 32 || c === 9)) {
						break;
					}
				}
				offset += lineOffset;
				if (caretOffset !== offset) {
					editor.setSelection(offset, offset);
					return true;
				}
				return false;
			}.bind(this));
		
			// Block comment operations
			textView.setKeyBinding(new mKeyBinding.KeyBinding(191, true), "toggleLineComment"); //$NON-NLS-0$
			textView.setAction("toggleLineComment", function() { //$NON-NLS-0$
				if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var selection = editor.getSelection();
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var uncomment = true, lines = [], lineText, index;
				for (var i = firstLine; i <= lastLine; i++) {
					lineText = model.getLine(i, true);
					lines.push(lineText);
					if (!uncomment || (index = lineText.indexOf("//")) === -1) { //$NON-NLS-0$
						uncomment = false;
					} else {
						if (index !== 0) {
							var j;
							for (j=0; j<index; j++) {
								var c = lineText.charCodeAt(j);
								if (!(c === 32 || c === 9)) {
									break;
								}
							}
							uncomment = j === index;
						}
					}
				}
				var text, selStart, selEnd;
				var lineStart = model.getLineStart(firstLine);
				var lineEnd = model.getLineEnd(lastLine, true);
				if (uncomment) {
					for (var k = 0; k < lines.length; k++) {
						lineText = lines[k];
						index = lineText.indexOf("//"); //$NON-NLS-0$
						lines[k] = lineText.substring(0, index) + lineText.substring(index + 2);
					}
					text = lines.join("");
					var lastLineStart = model.getLineStart(lastLine);
					selStart = lineStart === selection.start ? selection.start : selection.start - 2;
					selEnd = selection.end - (2 * (lastLine - firstLine + 1)) + (selection.end === lastLineStart+1 ? 2 : 0);
				} else {
					lines.splice(0, 0, "");
					text = lines.join("//"); //$NON-NLS-0$
					selStart = lineStart === selection.start ? selection.start : selection.start + 2;
					selEnd = selection.end + (2 * (lastLine - firstLine + 1));
				}
				editor.setText(text, lineStart, lineEnd);
				editor.setSelection(selStart, selEnd);
				return true;
			}.bind(this), {name: messages.toggleLineComment});
			
			function findEnclosingComment(model, start, end) {
				var open = "/*", close = "*/"; //$NON-NLS-1$ //$NON-NLS-0$
				var firstLine = model.getLineAtOffset(start);
				var lastLine = model.getLineAtOffset(end);
				var i, line, extent, openPos, closePos;
				var commentStart, commentEnd;
				for (i=firstLine; i >= 0; i--) {
					line = model.getLine(i);
					extent = (i === firstLine) ? start - model.getLineStart(firstLine) : line.length;
					openPos = line.lastIndexOf(open, extent);
					closePos = line.lastIndexOf(close, extent);
					if (closePos > openPos) {
						break; // not inside a comment
					} else if (openPos !== -1) {
						commentStart = model.getLineStart(i) + openPos;
						break;
					}
				}
				for (i=lastLine; i < model.getLineCount(); i++) {
					line = model.getLine(i);
					extent = (i === lastLine) ? end - model.getLineStart(lastLine) : 0;
					openPos = line.indexOf(open, extent);
					closePos = line.indexOf(close, extent);
					if (openPos !== -1 && openPos < closePos) {
						break;
					} else if (closePos !== -1) {
						commentEnd = model.getLineStart(i) + closePos;
						break;
					}
				}
				return {commentStart: commentStart, commentEnd: commentEnd};
			}
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding(191, true, !util.isMac, false, util.isMac), "addBlockComment"); //$NON-NLS-0$
			textView.setAction("addBlockComment", function() { //$NON-NLS-0$
				if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var selection = editor.getSelection();
				var open = "/*", close = "*/", commentTags = new RegExp("/\\*" + "|" + "\\*/", "g"); //$NON-NLS-5$ //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
				
				var result = findEnclosingComment(model, selection.start, selection.end);
				if (result.commentStart !== undefined && result.commentEnd !== undefined) {
					return true; // Already in a comment
				}
				
				var text = model.getText(selection.start, selection.end);
				if (text.length === 0) { return true; }
				
				var oldLength = text.length;
				text = text.replace(commentTags, "");
				var newLength = text.length;
				
				editor.setText(open + text + close, selection.start, selection.end);
				editor.setSelection(selection.start + open.length, selection.end + open.length + (newLength-oldLength));
				return true;
			}.bind(this), {name: messages.addBlockComment});
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding(220, true, !util.isMac, false, util.isMac), "removeBlockComment"); //$NON-NLS-0$
			textView.setAction("removeBlockComment", function() { //$NON-NLS-0$
				if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
				var editor = this.editor;
				var model = editor.getModel();
				var selection = editor.getSelection();
				var open = "/*", close = "*/"; //$NON-NLS-1$ //$NON-NLS-0$
				
				// Try to shrink selection to a comment block
				var selectedText = model.getText(selection.start, selection.end);
				var newStart, newEnd;
				var i;
				for(i=0; i < selectedText.length; i++) {
					if (selectedText.substring(i, i + open.length) === open) {
						newStart = selection.start + i;
						break;
					}
				}
				for (; i < selectedText.length; i++) {
					if (selectedText.substring(i, i + close.length) === close) {
						newEnd = selection.start + i;
						break;
					}
				}
				
				if (newStart !== undefined && newEnd !== undefined) {
					editor.setText(model.getText(newStart + open.length, newEnd), newStart, newEnd + close.length);
					editor.setSelection(newStart, newEnd);
				} else {
					// Otherwise find enclosing comment block
					var result = findEnclosingComment(model, selection.start, selection.end);
					if (result.commentStart === undefined || result.commentEnd === undefined) {
						return true;
					}
					
					var text = model.getText(result.commentStart + open.length, result.commentEnd);
					editor.setText(text, result.commentStart, result.commentEnd + close.length);
					editor.setSelection(selection.start - open.length, selection.end - close.length);
				}
				return true;
			}.bind(this), {name: messages.removeBlockComment});
		},
		/**
		 * Called when a content assist proposal has been applied. Inserts the proposal into the
		 * document. Activates Linked Mode if applicable for the selected proposal.
		 * @param {orion.editor.ContentAssist#ProposalAppliedEvent} event
		 */
		contentAssistProposalApplied: function(event) {
			/**
			 * The event.proposal is an object with this shape:
			 * {   proposal: "[proposal string]", // Actual text of the proposal
			 *     description: "diplay string", // Optional
			 *     positions: [{
			 *         offset: 10, // Offset of start position of parameter i
			 *         length: 3  // Length of parameter string for parameter i
			 *     }], // One object for each parameter; can be null
			 *     escapePosition: 19, // Optional; offset that caret will be placed at after exiting Linked Mode.
			 *     style: 'emphasis', // Optional: either emphasis, noemphasis, hr to provide custom styling for the proposal
			 *     unselectable: false // Optional: if set to true, then this proposal cannnot be selected through the keyboard
			 * }
			 * Offsets are relative to the text buffer.
			 */
			var proposal = event.data.proposal;
			
			//if the proposal specifies linked positions, build the model and enter linked mode
			if (proposal.positions && this.linkedMode) {
				var positionGroups = [];
				for (var i = 0; i < proposal.positions.length; ++i) {
					positionGroups[i] = {
						positions: [{
							offset: proposal.positions[i].offset,
							length: proposal.positions[i].length
						}]
					};
				}

				var linkedModeModel = {
					groups: positionGroups,
					escapePosition: proposal.escapePosition
				};
				this.linkedMode.enterLinkedMode(linkedModeModel);
			} else if (proposal.escapePosition) {
				//we don't want linked mode, but there is an escape position, so just set cursor position
				var textView = this.editor.getTextView();
				textView.setCaretOffset(proposal.escapePosition);
			}
			return true;
		},
		cancel: function() {
			return false;
		},
		isActive: function() {
			return true;
		},
		isStatusActive: function() {
			// SourceCodeActions never reports status
			return false;
		},
		lineUp: function() {
			return false;
		},
		lineDown: function() {
			return false;
		},
		enter: function() {
			// Auto indent
			var textView = this.editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var editor = this.editor;
			var selection = editor.getSelection();
			if (selection.start === selection.end) {
				var model = editor.getModel();
				var lineIndex = model.getLineAtOffset(selection.start);
				var lineText = model.getLine(lineIndex, true);
				var lineStart = model.getLineStart(lineIndex);
				var index = 0, end = selection.start - lineStart, c;
				while (index < end && ((c = lineText.charCodeAt(index)) === 32 || c === 9)) { index++; }
				if (index > 0) {
					//TODO still wrong when typing inside folding
					var prefix = lineText.substring(0, index);
					index = end;
					while (index < lineText.length && ((c = lineText.charCodeAt(index++)) === 32 || c === 9)) { selection.end++; }
					editor.setText(model.getLineDelimiter() + prefix, selection.start, selection.end);
					return true;
				}
			}
			return false;
		},
		tab: function() {
			return false;
		}
	};
	
	function LinkedMode(editor) {
		this.editor = editor;
		
		/**
		 * The variables used by the Linked Mode. The elements of linkedModePositions have following structure:
		 * {
		 *     offset: 10, // The offset of the position counted from the beginning of the text buffer
		 *     length: 3 // The length of the position (selection)
		 * }
		 *
		 * The linkedModeEscapePosition contains an offset (counted from the beginning of the text buffer) of a
		 * position where the caret will be placed after exiting from the Linked Mode.
		 */
		this.linkedModeActive = false;
		this.linkedModePositions = [];
		this.linkedModeCurrentPositionIndex = 0;
		this.linkedModeEscapePosition = 0;
		
		/**
		 * Listener called when Linked Mode is active. Updates position's offsets and length
		 * on user change. Also escapes the Linked Mode if the text buffer was modified outside of the Linked Mode positions.
		 */
		this.linkedModeListener = {
			onVerify: function(event) {
				var changeInsideGroup = false;
				var offsetDifference = 0;
				for (var i = 0; i < this.linkedModePositions.length; ++i) {
					var position = this.linkedModePositions[i];
					if (changeInsideGroup) {
						// The change has already been noticed, update the offsets of all positions next to the changed one
						position.offset += offsetDifference;
					} else if (event.start >= position.offset && event.end <= position.offset + position.length) {
						// The change was done in the current position, update its length
						var oldLength = position.length;
						position.length = (event.start - position.offset) + event.text.length + (position.offset + position.length - event.end);
						offsetDifference = position.length - oldLength;
						changeInsideGroup = true;
					}
				}

				if (changeInsideGroup) {
					// Update escape position too
					this.linkedModeEscapePosition += offsetDifference;
				} else {
					// The change has been done outside of the positions, exit the Linked Mode
					this.cancel();
				}
			}.bind(this)
		};
	}
	LinkedMode.prototype = {
		/**
		 * Starts Linked Mode, selects the first position and registers the listeners.
		 * @parma {Object} linkedModeModel An object describing the model to be used by linked mode.
		 * Contains one or more position groups. If one positions in a group is edited, the other positions in the
		 * group are edited the same way. The structure is as follows:<pre>
		 * {
		 *     groups: [{
		 *         positions: [{
		 *             offset: 10, // Relative to the text buffer
		 *             length: 3
		 *         }]
		 *     }],
		 *     escapePosition: 19, // Relative to the text buffer
		 * }</pre>
		 */
		enterLinkedMode: function(linkedModeModel) {
			if (this.linkedModeActive) {
				return;
			}
			this.linkedModeActive = true;

			// NOTE: only the first position from each group is supported for now
			this.linkedModePositions = [];
			for (var i = 0; i < linkedModeModel.groups.length; ++i) {
				var group = linkedModeModel.groups[i];
				this.linkedModePositions[i] = {
					offset: group.positions[0].offset,
					length: group.positions[0].length
				};
			}

			this.linkedModeEscapePosition = linkedModeModel.escapePosition;
			this.linkedModeCurrentPositionIndex = 0;
			this.selectTextForLinkedModePosition(this.linkedModePositions[this.linkedModeCurrentPositionIndex]);

			var textView = this.editor.getTextView();
			textView.addEventListener("Verify", this.linkedModeListener.onVerify); //$NON-NLS-0$

			textView.setKeyBinding(new mKeyBinding.KeyBinding(9), "nextLinkedModePosition"); //$NON-NLS-0$
			textView.setAction("nextLinkedModePosition", function() { //$NON-NLS-0$
				// Switch to the next group on TAB key
				this.linkedModeCurrentPositionIndex = ++this.linkedModeCurrentPositionIndex % this.linkedModePositions.length;
				this.selectTextForLinkedModePosition(this.linkedModePositions[this.linkedModeCurrentPositionIndex]);
				return true;
			}.bind(this));
			
			textView.setKeyBinding(new mKeyBinding.KeyBinding(9, false, true), "previousLinkedModePosition"); //$NON-NLS-0$
			textView.setAction("previousLinkedModePosition", function() { //$NON-NLS-0$
				this.linkedModeCurrentPositionIndex = this.linkedModeCurrentPositionIndex > 0 ? this.linkedModeCurrentPositionIndex-1 : this.linkedModePositions.length-1;
				this.selectTextForLinkedModePosition(this.linkedModePositions[this.linkedModeCurrentPositionIndex]);
				return true;
			}.bind(this));

			this.editor.reportStatus(messages.linkedModeEntered, null, true);
		},
		isActive: function() {
			return this.linkedModeActive;
		},
		isStatusActive: function() {
			return this.linkedModeActive;
		},
		enter: function() {
			this.cancel();
			return true;
		},
		/** 
		 * Exits Linked Mode. Optionally places the caret at linkedModeEscapePosition. 
		 * @param {boolean} ignoreEscapePosition optional if true, do not place the caret at the 
		 * escape position.
		 */
		cancel: function(ignoreEscapePosition) {
			if (!this.linkedModeActive) {
				return;
			}
			this.linkedModeActive = false;
			var textView = this.editor.getTextView();
			textView.removeEventListener("Verify", this.linkedModeListener.onVerify); //$NON-NLS-0$
			textView.setKeyBinding(new mKeyBinding.KeyBinding(9), "tab"); //$NON-NLS-0$
			textView.setKeyBinding(new mKeyBinding.KeyBinding(9, false, true), "shiftTab"); //$NON-NLS-0$
			
			if (!ignoreEscapePosition) {
				textView.setCaretOffset(this.linkedModeEscapePosition, false);
			}

			this.editor.reportStatus(messages.linkedModeExited, null, true);
		},
		lineUp: function() {
			this.cancel(true);
			return false;
		},
		lineDown: function() {
			this.cancel(true);
			return false;
		},		/**
		 * Updates the selection in the textView for given Linked Mode position.
		 */
		selectTextForLinkedModePosition: function(position) {
			var textView = this.editor.getTextView();
			textView.setSelection(position.offset, position.offset + position.length);
		}
	};

	return {
		UndoFactory: UndoFactory,
		LineNumberRulerFactory: LineNumberRulerFactory,
		FoldingRulerFactory: FoldingRulerFactory,
		AnnotationFactory: AnnotationFactory,
		TextDNDFactory: TextDNDFactory,
		TextActions: TextActions,
		SourceCodeActions: SourceCodeActions,
		LinkedMode: LinkedMode
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global exports module define setTimeout*/

(function(root, factory) { // UMD
	if (typeof define === "function" && define.amd) { //$NON-NLS-0$
		define('orion/Deferred',[],factory);
	} else if (typeof exports === "object") { //$NON-NLS-0$
		module.exports = factory();
	} else {
		root.orion = root.orion || {};
		root.orion.Deferred = factory();
	}
}(this, function() {
	var syncQueue = [],
		asyncQueue = [],
		running = false;

	function run() {
		var fn;
		while ((fn = syncQueue.shift() || asyncQueue.shift())) { //empty the sync queue first!!
			fn();
		}
		running = false;
	}

	function enqueue(fn, async) {
		var queue = async ? asyncQueue : syncQueue;
		queue.push(fn);
		if (!running) {
			running = true;
			if (async) {
				setTimeout(run, 0);
			} else {
				run();
			}
		}
	}

	function noReturn(fn) {
		return function() {
			fn.apply(null, arguments);
		};
	}

	function noop() {}

	function createCancelError() {
		var cancelError = new Error("Cancel"); //$NON-NLS-0$
		cancelError.name = "Cancel"; //$NON-NLS-0$
		return cancelError;
	}

	/**
	 * @name orion.Promise
	 * @class Interface representing an eventual value.
	 * @description Promise is an interface that represents an eventual value returned from the single completion of an operation.
	 *
	 * <p>For a concrete class that provides Promise-based APIs, see {@link orion.Deferred}.</p>
	 * @see orion.Deferred#promise
	 * @see orion.Deferred
	 */
	/**
	 * @name then
	 * @methodOf orion.Promise.prototype
	 * @description Adds handlers to be called on fulfillment or progress of this promise.
	 * @param {Function} [onResolve] Called when this promise is resolved.
	 * @param {Function} [onReject] Called when this promise is rejected.
	 * @param {Function} [onProgress] May be called to report progress events on this promise.
	 * @returns {orion.Promise} A new promise that is fulfilled when the given onResolve or onReject callback is finished.
	 * The callback's return value gives the fulfillment value of the returned promise.
	 */

	/**
	 * @name orion.Deferred
	 * @borrows orion.Promise#then as #then
	 * @class Provides abstraction over asynchronous operations.
	 * @description Deferred provides abstraction over asynchronous operations.
	 *
	 * <p>Because Deferred implements the {@link orion.Promise} interface, a Deferred may be used anywhere a Promise is called for.
	 * However, in most such cases it is recommended to use the Deferred's {@link #promise} field instead, which exposes a read-only
	 * interface to callers.</p>
	 */
	function Deferred() {
		var result, state, listeners = [],
			_this = this;

		function notify() {
			var listener;
			while ((listener = listeners.shift())) {
				var deferred = listener.deferred;
				var methodName = state === "resolved" ? "resolve" : "reject"; //$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$
				if (typeof listener[methodName] === "function") { //$NON-NLS-0$
					try {
						var listenerResult = listener[methodName](result);
						if (listenerResult && typeof listenerResult.then === "function") { //$NON-NLS-0$
							deferred.cancel = listenerResult.cancel || noop;
							listenerResult.then(noReturn(deferred.resolve), noReturn(deferred.reject), deferred.progress);
						} else {
							deferred.resolve(listenerResult);
						}
					} catch (e) {
						deferred.reject(e);
					}
				} else {
					deferred[methodName](result);
				}
			}
		}

		/**
		 * Rejects this Deferred.
		 * @name reject
		 * @methodOf orion.Deferred.prototype
		 * @param {Object} error
		 * @param {Boolean} [strict]
		 * @returns {orion.Promise}
		 */
		this.reject = function(error, strict) {
			if (!state) {
				state = "rejected"; //$NON-NLS-0$
				result = error;
				if (listeners.length) {
					enqueue(notify);
				}
			}
			return _this.promise;
		};

		/**
		 * Resolves this Deferred.
		 * @name resolve
		 * @methodOf orion.Deferred.prototype
		 * @param {Object} value
		 * @param {Boolean} [strict]
		 * @returns {orion.Promise}
		 */
		this.resolve = function(value, strict) {
			if (!state) {
				state = "resolved"; //$NON-NLS-0$
				result = value;
				if (listeners.length) {
					enqueue(notify);
				}
			}
			return _this.promise;
		};

		/**
		 * Notifies listeners of progress on this Deferred.
		 * @name progress
		 * @methodOf orion.Deferred.prototype
		 * @param {Object} update The progress update.
		 * @param {Boolean} [strict]
		 * @returns {orion.Promise}
		 */
		this.progress = function(update, strict) {
			if (!state) {
				listeners.forEach(function(listener) {
					if (listener.progress) {
						listener.progress(update);
					}
				});
			}
			return _this.promise;
		};

		/**
		 * Cancels this Deferred.
		 * @name cancel
		 * @methodOf orion.Deferred.prototype
		 * @param {Object} reason The reason for canceling this Deferred.
		 * @param {Boolean} [strict]
		 */
		this.cancel = function() {
			if (!state) {
				_this.reject(createCancelError());
			}
		};

		// Note: "then" ALWAYS returns before having onResolve or onReject called as per http://promises-aplus.github.com/promises-spec/
		this.then = function(onResolve, onReject, onProgress) {
			var listener = {
				resolve: onResolve,
				reject: onReject,
				progress: onProgress,
				deferred: new Deferred()
			};
			var deferred = listener.deferred;
			var thisCancel = this.cancel.bind(this);
			var propagateCancel = function() {
				enqueue(function() {
					var cancel = deferred.cancel === propagateCancel ? thisCancel : deferred.cancel;
					cancel();
				}, true);
			};
			deferred.cancel = propagateCancel;
			var promise = deferred.promise;
			promise.cancel = function() {
				deferred.cancel(); // require indirection since deferred.cancel will be assigned if a promise is returned by onResolve/onReject
			};

			listeners.push(listener);
			if (state) {
				enqueue(notify, true); //runAsync
			}
			return promise;
		}.bind(this);

		/**
		 * The promise exposed by this Deferred.
		 * @name promise
		 * @fieldOf orion.Deferred.prototype
		 * @type orion.Promise
		 */
		this.promise = {
			then: this.then,
			cancel: this.cancel
		};
	}

	/**
	 * Takes multiple promises and returns a new promise that represents the outcome of all the promises.
	 * <p>When <code>all</code> is called with a single parameter, the returned promise has <dfn>eager</dfn> semantics,
	 * meaning if one of the input promises is rejected, the returned promise also rejects, without waiting for the 
	 * rest of the promises to fulfill.</p>
	 *
	 * To obtain <dfn>lazy</dfn> semantics (meaning the returned promise waits for all input promises to fulfill), pass the
	 * optional parameter <code>optOnError</code>.
	 * @name all
	 * @methodOf orion.Deferred
	 * @static
	 * @param {orion.Promise[]} promises The promises.
	 * @param {Function} [optOnError] Handles a rejected input promise. When invoked, <code>optOnError</code> is passed the reason 
	 * the input promise was rejected. The return value of this <code>optOnError</code> call serves as the value of the rejected promise.
	 * @returns {orion.Promise} A new promise. The returned promise is generally fulfilled to an <code>Array</code> whose elements
	 * give the fulfillment values of the input promises. However if an input promise is rejected and eager semantics is used, the 
	 * returned promise will instead be fulfilled to a single error value.</p>
	 */
	Deferred.all = function(promises, optOnError) {
		var count = promises.length,
			result = [],
			rejected = false,
			deferred = new Deferred();

		deferred.then(null, function() {
			rejected = true;
			promises.forEach(function(promise) {
				if (promise.cancel) {
					promise.cancel();
				}
			});
		});

		function onResolve(i, value) {
			if (!rejected) {
				result[i] = value;
				if (--count === 0) {
					deferred.resolve(result);
				}
			}
		}

		function onReject(i, error) {
			if (!rejected) {
				if (optOnError) {
					try {
						onResolve(i, optOnError(error));
						return;
					} catch (e) {
						error = e;
					}
				}
				deferred.reject(error);
			}
		}

		if (count === 0) {
			deferred.resolve(result);
		} else {
			promises.forEach(function(promise, i) {
				promise.then(onResolve.bind(null, i), onReject.bind(null, i));
			});
		}
		return deferred.promise;
	};

	/**
	 * Applies callbacks to a promise or to a regular object.
	 * @name when
	 * @methodOf orion.Deferred
	 * @static
	 * @param {Object|orion.Promise} value Either a {@link orion.Promise}, or a normal value.
	 * @param {Function} onResolve Called when the <code>value</code> promise is resolved. If <code>value</code> is not a promise,
	 * this function is called immediately.
	 * @param {Function} onReject Called when the <code>value</code> promise is rejected. If <code>value</code> is not a promise, 
	 * this function is never called.
	 * @param {Function} onProgress Called when the <code>value</code> promise provides a progress update. If <code>value</code> is
	 * not a promise, this function is never called.
	 * @returns {orion.Promise} A new promise.
	 */
	Deferred.when = function(value, onResolve, onReject, onProgress) {
		var promise, deferred;
		if (value && typeof value.then === "function") { //$NON-NLS-0$
			promise = value;
		} else {
			deferred = new Deferred();
			deferred.resolve(value);
			promise = deferred.promise;
		}
		return promise.then(onResolve, onReject, onProgress);
	};

	return Deferred;
}));

/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global define */
/*jslint maxerr:150 browser:true devel:true */

define("orion/editor/contentAssist", ['i18n!orion/editor/nls/messages', 'orion/keyBinding', 'orion/editor/eventTarget', 'orion/Deferred', 'orion/util'], function(messages, mKeyBinding, mEventTarget, Deferred, util) {
	/**
	 * @name orion.editor.ContentAssistProvider
	 * @class Interface defining a provider of content assist proposals.
	 */
	/**
	 * @methodOf orion.editor.ContentAssistProvider.prototype
	 * @name computeProposals
	 * @param {String} buffer The buffer being edited.
	 * @param {Number} offset The position in the buffer at which content assist is being requested.
	 * @param {orion.editor.ContentAssistProvider.Context} context
	 * @returns {Object[]} This provider's proposals for the given buffer and offset.
	 */
	/**
	 * @name orion.editor.ContentAssistProvider.Context
	 * @class
	 * @property {String} line The text of the line on which content assist is being requested.
	 * @property {String} prefix Any non-whitespace, non-symbol characters preceding the offset.
	 * @property {orion.editor.Selection} selection The current selection.
	 */

	/**
	 * @name orion.editor.ContentAssist
	 * @class Provides content assist for a TextView.
	 * @description Creates a <code>ContentAssist</code> for a TextView. A ContentAssist consults a set of 
	 * {@link orion.editor.ContentAssistProvider}s to obtain proposals for text that may be inserted into a
	 * TextView at a given offset.<p>
	 * A ContentAssist is generally activated by its TextView action, at which point it computes the set of 
	 * proposals available. It will re-compute the proposals in response to subsequent changes on the TextView 
	 * (for example, user typing) for as long as the ContentAssist is active. A proposal may be applied by calling 
	 * {@link #apply}, after which the ContentAssist becomes deactivated. An active ContentAssist may be deactivated
	 * by calling {@link #deactivate}.<p>
	 * A ContentAssist dispatches events when it becomes activated or deactivated, and when proposals have been computed.
	 * @param {orion.editor.TextView} textView The TextView to provide content assist for.
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	/**
	 * Dispatched when a ContentAssist is about to be activated.
	 * @name orion.editor.ContentAssist#ActivatingEvent
	 * @event
	 */
	/**
	 * Dispatched when a ContentAssist is about to be deactivated.
	 * @name orion.editor.ContentAssist#DeactivatingEvent
	 * @event
	 */
	/**
	 * Dispatched when a ContentAssist has applied a proposal. <p>This event's <code>data</code> field gives information
	 * about the proposal that was applied.
	 * @name orion.editor.ContentAssist#ProposalAppliedEvent
	 * @event
	 */
	/**
	 * Dispatched whenever a ContentAssist has obtained proposals from its providers. <p>This event's
	 * <code>data</code> field gives information about the proposals.
	 * @name orion.editor.ContentAssist#ProposalsComputedEvent
	 * @event
	 */
	// INACTIVE --Ctrl+Space--> ACTIVE --ModelChanging--> FILTERING
	var State = {
		INACTIVE: 1,
		ACTIVE: 2,
		FILTERING: 3
	};
	
	var STYLES = {
		selected : " selected",
		hr : "proposal-hr",
		emphasis : "proposal-emphasis",
		noemphasis : "proposal-noemphasis",
		dfault : "proposal-default"
	};
	
	function ContentAssist(textView) {
		this.textView = textView;
		this.state = State.INACTIVE;
		this.providers = [];
		var self = this;
		this.contentAssistListener = {
			onModelChanging: function(event) {
				if (self.isDeactivatingChange(event)) {
					self.setState(State.INACTIVE);
				} else {
					if (self.state === State.ACTIVE) {
						self.setState(State.FILTERING);
					}
				}
			},
			onScroll: function(event) {
				self.setState(State.INACTIVE);
			},
			onSelection: function(event) {
				var state = self.state;
				if (state === State.ACTIVE || state === State.FILTERING) {
					self.computeProposals();
					self.setState(State.FILTERING);
				}
			}
		};
		textView.setKeyBinding(util.isMac ? new mKeyBinding.KeyBinding(' ', false, false, false, true) : new mKeyBinding.KeyBinding(' ', true), "contentAssist");
		textView.setAction("contentAssist", function() {
			self.activate();
			return true;
		}, {name: messages.contentAssist});
	}
	ContentAssist.prototype = /** @lends orion.editor.ContentAssist.prototype */ {
		/**
		 * Applies the given proposal to the TextView.
		 * @param {Object} [proposal]
		 * @returns {Boolean} <code>true</code> if the proposal was applied; <code>false</code> if no proposal was provided.
		 */
		apply: function(proposal) {
			if (!proposal) {
				return false;
			}
	
			// now handle prefixes
			// if there is a non-empty selection, then replace it,
			// if overwrite is truthy, then also replace the prefix
			var sel = this.textView.getSelection();
			var start = Math.min(sel.start, sel.end);
			var end = Math.max(sel.start, sel.end);
			if (proposal.overwrite) {
				start = this.getPrefixStart(start);
			}

			var data = {
				proposal: proposal,
				start: start,
				end: end
			};
			this.setState(State.INACTIVE);
			var proposalText = proposal.proposal || proposal;
			this.textView.setText(proposalText, start, end);
			this.dispatchEvent({type: "ProposalApplied", data: data});
			return true;
		},
		activate: function() {
			if (this.state === State.INACTIVE) {
				this.setState(State.ACTIVE);
			}
		},
		deactivate: function() {
			this.setState(State.INACTIVE);
		},
		/** @returns {orion.editor.TextView} */
		getTextView: function() {
			return this.textView;
		},
		/** @returns {Boolean} */
		isActive: function() {
			return this.state === State.ACTIVE || this.state === State.FILTERING;
		},
		/** @returns {Boolean} <code>true</code> if the event describes a change that should deactivate content assist. */
		isDeactivatingChange: function(/**orion.editor.ModelChangingEvent*/ event) {
			var deletion = event.removedCharCount > 0 && event.addedCharCount === 0,
			    view = this.textView,
			    overWhitespace = (event.start+1 <= view.getModel().getCharCount()) && /^\s*$/.test(view.getText(event.start, event.start+1));
			return event.removedLineCount > 0 || event.addedLineCount > 0 || (deletion && overWhitespace);
		},
		/** @private */
		setState: function(state) {
			var eventType;
			if (state === State.ACTIVE) {
				eventType = "Activating";
			} else if (state === State.INACTIVE) {
				eventType = "Deactivating";
			}
			if (eventType) {
				this.dispatchEvent({type: eventType});
			}
			this.state = state;
			this.onStateChange(state);
		},
		/** @private */
		onStateChange: function(state) {
			if (state === State.INACTIVE) {
				if (this.listenerAdded) {
					this.textView.removeEventListener("ModelChanging", this.contentAssistListener.onModelChanging);
					this.textView.removeEventListener("Scroll", this.contentAssistListener.onScroll);
					this.textView.removeEventListener("Selection", this.contentAssistListener.onSelection);
					this.listenerAdded = false;
				}
			} else if (state === State.ACTIVE) {
				if (!this.listenerAdded) {
					this.textView.addEventListener("ModelChanging", this.contentAssistListener.onModelChanging);
					this.textView.addEventListener("Scroll", this.contentAssistListener.onScroll);
					this.textView.addEventListener("Selection", this.contentAssistListener.onSelection);
					this.listenerAdded = true;
				}
				this.computeProposals();
			}
		},
		/**
		 * Computes the proposals at the TextView's current caret offset.
		 */
		computeProposals: function() {
			var self = this;
			var offset = this.textView.getCaretOffset();
			this._computeProposals(offset).then(function(proposals) {
				self.dispatchEvent({type: "ProposalsComputed", data: {proposals: proposals}});
			});
		},
		/** @private */
		getPrefixStart: function(end) {
			var index = end;
			while (index > 0 && /[A-Za-z0-9_]/.test(this.textView.getText(index - 1, index))) {
				index--;
			}
			return index;
		},
		handleError: function(error) {
			if (typeof console !== "undefined") {
				console.log("Error retrieving content assist proposals");
				console.log(error);
			}
		},
		/**
		 * @private
		 * Retrieves the proposals at the given offset.
		 * @param {Number} offset The caret offset.
		 * @returns {Deferred} A promise that will provide the proposals.
		 */
		_computeProposals: function(offset) {
			var providers = this.providers;
			var textView = this.textView, textModel = textView.getModel();
			var buffer = textView.getText();
			var context = {
				line: textModel.getLine(textModel.getLineAtOffset(offset)),
				prefix: textView.getText(this.getPrefixStart(offset), offset),
				selection: textView.getSelection()
			};
			var self = this;
			var promises = providers.map(function(provider) {
				//prefer computeProposals but support getProposals for backwards compatibility
				var func = provider.computeProposals || provider.getProposals;
				var proposals;
				try {
					if (typeof func === "function") { //$NON-NLS-0$
						proposals = self.progress ? self.progress.progress(func.apply(provider, [buffer, offset, context]), "Generating content assist proposal"): func.apply(provider, [buffer, offset, context]);
					}
				} catch (e) {
					self.handleError(e);
				}
				return Deferred.when(proposals);
			});
			return Deferred.all(promises, this.handleError).then(function(proposalArrays) {
				return proposalArrays.reduce(function(prev, curr) {
					return (curr instanceof Array) ? prev.concat(curr) : prev;
				}, []);
			});
		},
		/**
		 * Sets the content assist providers that this ContentAssist will consult to obtain proposals.
		 * @param {orion.editor.ContentAssistProvider[]} providers The providers.
		 */
		setProviders: function(providers) {
			this.providers = providers.slice(0);
		},
		
		/**
		 * Sets the progress handler that will display progress information, if any are generated by content assist providers.
		 */
		setProgress: function(progress){
			this.progress = progress;
		}
	};
	mEventTarget.EventTarget.addMixin(ContentAssist.prototype);

	/**
	 * @name orion.editor.ContentAssistMode
	 * @class Editor mode for interacting with content assist proposals.
	 * @description Creates a ContentAssistMode. A ContentAssistMode is a key mode for {@link orion.editor.Editor}
	 * that provides interaction with content assist proposals retrieved from an {@link orion.editor.ContentAssist}. 
	 * Interaction is performed via the {@link #lineUp}, {@link #lineDown}, and {@link #enter} actions. An 
	 * {@link orion.editor.ContentAssistWidget} may optionally be provided to display which proposal is currently selected.
	 * @param {orion.editor.ContentAssist} contentAssist
	 * @param {orion.editor.ContentAssistWidget} [ContentAssistWidget]
	 */
	function ContentAssistMode(contentAssist, ContentAssistWidget) {
		this.contentAssist = contentAssist;
		this.widget = ContentAssistWidget;
		this.proposals = [];
		var self = this;
		this.contentAssist.addEventListener("ProposalsComputed", function(event) {
			self.proposals = event.data.proposals;
			self.selectedIndex = self.proposals.length ? 0 : -1;
		});
	}
	ContentAssistMode.prototype = /** @lends orion.editor.ContentAssistMode.prototype */ {
		cancel: function() {
			this.getContentAssist().deactivate();
		},
		/** @private */
		getContentAssist: function() {
			return this.contentAssist;
		},
		isActive: function() {
			return this.getContentAssist().isActive();
		},
		lineUp: function() {
			var newSelected = (this.selectedIndex === 0) ? this.proposals.length - 1 : this.selectedIndex - 1;
			while (this.proposals[newSelected].unselectable && newSelected > 0) {
				newSelected--;
			}
			this.selectedIndex = newSelected;
			if (this.widget) {
				this.widget.setSelectedIndex(this.selectedIndex);
			}
			return true;
		},
		lineDown: function() {
			var newSelected = (this.selectedIndex === this.proposals.length - 1) ? 0 : this.selectedIndex + 1;
			while (this.proposals[newSelected].unselectable && newSelected < this.proposals.length-1) {
				newSelected++;
			}
			this.selectedIndex = newSelected;
			if (this.widget) {
				this.widget.setSelectedIndex(this.selectedIndex);
			}
			return true;
		},
		enter: function() {
			var proposal = this.proposals[this.selectedIndex] || null;
			return this.contentAssist.apply(proposal);
		},
		tab: function() {
			if (this.widget) {
				this.widget.createAccessible(this);
				this.widget.parentNode.focus();
				return true;
			} else {
				return false;
			}
		}
	};

	/**
	 * @name orion.editor.ContentAssistWidget
	 * @class Displays proposals from a {@link orion.editor.ContentAssist}.
	 * @description Creates a ContentAssistWidget that will display proposals from the given {@link orion.editor.ContentAssist}
	 * in the given <code>parentNode</code>. Clicking a proposal will cause the ContentAssist to apply that proposal.
	 * @param {orion.editor.ContentAssist} contentAssist
	 * @param {String|DomNode} [parentNode] The ID or DOM node to use as the parent for displaying proposals. If not provided,
	 * a new DIV will be created inside &lt;body&gt; and assigned the CSS class <code>contentassist</code>.
	 */
	function ContentAssistWidget(contentAssist, parentNode) {
		this.contentAssist = contentAssist;
		this.textView = this.contentAssist.getTextView();
		this.textViewListenerAdded = false;
		this.isShowing = false;
		var document = this.textView.getOptions("parent").ownerDocument;
		this.parentNode = typeof parentNode === "string" ? document.getElementById(parentNode) : parentNode;
		if (!this.parentNode) {
			this.parentNode = util.createElement(document, "div");
			this.parentNode.className = "contentassist";
			var body = document.getElementsByTagName("body")[0];
			if (body) {
				body.appendChild(this.parentNode);
			} else {
				throw new Error("parentNode is required");
			}
		}
		var self = this;
		this.textViewListener = {
			onMouseDown: function(event) {
				if (event.event.target.parentElement !== self.parentNode) {
					self.contentAssist.deactivate();
				}
				// ignore the event if this is a click inside of the parentNode
				// the click is handled by the onClick() function
			}
		};
		this.contentAssist.addEventListener("ProposalsComputed", function(event) {
			self.setProposals(event.data.proposals);
			self.show();
			if (!self.textViewListenerAdded) {
				self.textView.addEventListener("MouseDown", self.textViewListener.onMouseDown);
				self.textViewListenerAdded = true;
			}
		});
		this.contentAssist.addEventListener("Deactivating", function(event) {
			self.setProposals([]);
			self.hide();
			if (self.textViewListenerAdded) {
				self.textView.removeEventListener("MouseDown", self.textViewListener.onMouseDown);
				self.textViewListenerAdded = false;
			}
			self.textViewListenerAdded = false;
		});
		this.scrollListener = function(e) {
			if (self.isShowing) {
				self.position();
			}
		};
		if (document.addEventListener) {
			document.addEventListener("scroll", this.scrollListener);
		}
	}
	ContentAssistWidget.prototype = /** @lends orion.editor.ContentAssistWidget.prototype */ {
		/** @private */
		onClick: function(e) {
			this.contentAssist.apply(this.getProposal(e.target));
			this.textView.focus();
		},
		/** @private */
		createDiv: function(proposal, isSelected, parent, itemIndex) {
			var document = parent.ownerDocument;
			var div = util.createElement(document, "div");
			div.id = "contentoption" + itemIndex;
			div.setAttribute("role", "option");
			var node;
			if (proposal.style === "hr") {
				node = util.createElement(document, "hr");
			} else {
				div.className = this.calculateClasses(proposal.style, isSelected);
				node = document.createTextNode(this.getDisplayString(proposal));
				if (isSelected) {
					this.parentNode.setAttribute("aria-activedescendant", div.id);
				}
			}
			div.appendChild(node, div);
			parent.appendChild(div);
		},
		/** @private */
		createAccessible: function(mode) {
			if(!this._isAccessible) {
				this.parentNode.addEventListener("keydown", function(evt) {
					evt.preventDefault();
					if(evt.keyCode === 27) {return mode.cancel(); }
					else if(evt.keyCode === 38) { return mode.lineUp(); }
					else if(evt.keyCode === 40) { return mode.lineDown(); }
					else if(evt.keyCode === 13) { return mode.enter(); }
					return false;
				});
			}
			this._isAccessible = true;
		},
		/** @private */
		calculateClasses : function(style, isSelected) {
			var cssClass = STYLES[style];
			if (!cssClass) {
				cssClass = STYLES.dfault;
			}
			return isSelected ? cssClass + STYLES.selected : cssClass;
		},
		/** @private */
		getDisplayString: function(proposal) {
			//for simple string content assist, the display string is just the proposal
			if (typeof proposal === "string") {
				return proposal;
			}
			//return the description if applicable
			if (proposal.description && typeof proposal.description === "string") {
				return proposal.description;
			}
			//by default return the straight proposal text
			return proposal.proposal;
		},
		/**
		 * @private
		 * @returns {Object} The proposal represented by the given node.
		 */
		getProposal: function(/**DOMNode*/ node) {
			var nodeIndex = 0;
			for (var child = this.parentNode.firstChild; child !== null; child = child.nextSibling) {
				if (child === node) {
					return this.proposals[nodeIndex] || null;
				}
				nodeIndex++;
			}
			return null;
		},
		/** Sets the index of the currently selected proposal. */
		setSelectedIndex: function(/**Number*/ index) {
			this.selectedIndex = index;
			this.selectNode(this.parentNode.childNodes[this.selectedIndex]);
		},
		/** @private */
		selectNode: function(/**DOMNode*/ node) {
			var nodes = this.parentNode.childNodes;
			for (var i=0; i < nodes.length; i++) {
				var child = nodes[i];
				var selIndex = child.className.indexOf(STYLES.selected);
				if (selIndex >= 0) {
					child.className = child.className.substring(0, selIndex) + 
							child.className.substring(selIndex + STYLES.selected.length);
				}
				if (child === node) {
					child.className = child.className + STYLES.selected;
					this.parentNode.setAttribute("aria-activedescendant", child.id);
					child.focus();
					if (child.offsetTop < this.parentNode.scrollTop) {
						child.scrollIntoView(true);
					} else if ((child.offsetTop + child.offsetHeight) > (this.parentNode.scrollTop + this.parentNode.clientHeight)) {
						child.scrollIntoView(false);
					}
				}
			}
		},
		setProposals: function(/**Object[]*/ proposals) {
			this.proposals = proposals;
		},
		show: function() {
			if (this.proposals.length === 0) {
				this.hide();
				return;
			}
			this.parentNode.innerHTML = "";
			for (var i = 0; i < this.proposals.length; i++) {
				this.createDiv(this.proposals[i], i===0, this.parentNode, i);
			}
			this.position();
			this.parentNode.onclick = this.onClick.bind(this);
			this.isShowing = true;
		},
		hide: function() {
			if(this.parentNode.ownerDocument.activeElement === this.parentNode) {
				this.textView.focus();
			}
			this.parentNode.style.display = "none";
			this.parentNode.onclick = null;
			this.isShowing = false;
		},
		position: function() {
			var caretLocation = this.textView.getLocationAtOffset(this.textView.getCaretOffset());
			caretLocation.y += this.textView.getLineHeight();
			this.textView.convert(caretLocation, "document", "page");
			this.parentNode.style.position = "fixed";
			this.parentNode.style.left = caretLocation.x + "px";
			this.parentNode.style.top = caretLocation.y + "px";
			this.parentNode.style.display = "block";
			this.parentNode.scrollTop = 0;

			// Make sure that the panel is never outside the viewport
			var document = this.parentNode.ownerDocument;
			var viewportWidth = document.documentElement.clientWidth,
			    viewportHeight =  document.documentElement.clientHeight;
			if (caretLocation.y + this.parentNode.offsetHeight > viewportHeight) {
				this.parentNode.style.top = (caretLocation.y - this.parentNode.offsetHeight - this.textView.getLineHeight()) + "px";
			}
			if (caretLocation.x + this.parentNode.offsetWidth > viewportWidth) {
				this.parentNode.style.left = (viewportWidth - this.parentNode.offsetWidth) + "px";
			}
		}
	};
	return {
		ContentAssist: ContentAssist,
		ContentAssistMode: ContentAssistMode,
		ContentAssistWidget: ContentAssistWidget
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global define */

define("orion/editor/cssContentAssist", [], function() {
	var keywords = ["alignment-adjust", "alignment-baseline", "animation", "animation-delay", "animation-direction", "animation-duration",
			"animation-iteration-count", "animation-name", "animation-play-state", "animation-timing-function", "appearance",
			"azimuth", "backface-visibility", "background", "background-attachment", "background-clip", "background-color",
			"background-image", "background-origin", "background-position", "background-repeat", "background-size", "baseline-shift",
			"binding", "bleed", "bookmark-label", "bookmark-level", "bookmark-state", "bookmark-target", "border", "border-bottom",
			"border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width",
			"border-collapse", "border-color", "border-image", "border-image-outset", "border-image-repeat", "border-image-slice",
			"border-image-source", "border-image-width", "border-left", "border-left-color", "border-left-style", "border-left-width",
			"border-radius", "border-right", "border-right-color", "border-right-style", "border-right-width", "border-spacing", "border-style",
			"border-top", "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width",
			"border-width", "bottom", "box-align", "box-decoration-break", "box-direction", "box-flex", "box-flex-group", "box-lines",
			"box-ordinal-group", "box-orient", "box-pack", "box-shadow", "box-sizing", "break-after", "break-before", "break-inside",
			"caption-side", "clear", "clip", "color", "color-profile", "column-count", "column-fill", "column-gap", "column-rule",
			"column-rule-color", "column-rule-style", "column-rule-width", "column-span", "column-width", "columns", "content", "counter-increment",
			"counter-reset", "crop", "cue", "cue-after", "cue-before", "cursor", "direction", "display", "dominant-baseline",
			"drop-initial-after-adjust", "drop-initial-after-align", "drop-initial-before-adjust", "drop-initial-before-align", "drop-initial-size",
			"drop-initial-value", "elevation", "empty-cells", "fit", "fit-position", "flex-align", "flex-flow", "flex-inline-pack", "flex-order",
			"flex-pack", "float", "float-offset", "font", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style",
			"font-variant", "font-weight", "grid-columns", "grid-rows", "hanging-punctuation", "height", "hyphenate-after",
			"hyphenate-before", "hyphenate-character", "hyphenate-lines", "hyphenate-resource", "hyphens", "icon", "image-orientation",
			"image-rendering", "image-resolution", "inline-box-align", "left", "letter-spacing", "line-height", "line-stacking",
			"line-stacking-ruby", "line-stacking-shift", "line-stacking-strategy", "list-style", "list-style-image", "list-style-position",
			"list-style-type", "margin", "margin-bottom", "margin-left", "margin-right", "margin-top", "mark", "mark-after", "mark-before",
			"marker-offset", "marks", "marquee-direction", "marquee-loop", "marquee-play-count", "marquee-speed", "marquee-style", "max-height",
			"max-width", "min-height", "min-width", "move-to", "nav-down", "nav-index", "nav-left", "nav-right", "nav-up", "opacity", "orphans",
			"outline", "outline-color", "outline-offset", "outline-style", "outline-width", "overflow", "overflow-style", "overflow-x",
			"overflow-y", "padding", "padding-bottom", "padding-left", "padding-right", "padding-top", "page", "page-break-after", "page-break-before",
			"page-break-inside", "page-policy", "pause", "pause-after", "pause-before", "perspective", "perspective-origin", "phonemes", "pitch",
			"pitch-range", "play-during", "position", "presentation-level", "punctuation-trim", "quotes", "rendering-intent", "resize",
			"rest", "rest-after", "rest-before", "richness", "right", "rotation", "rotation-point", "ruby-align", "ruby-overhang", "ruby-position",
			"ruby-span", "size", "speak", "speak-header", "speak-numeral", "speak-punctuation", "speech-rate", "stress", "string-set", "table-layout",
			"target", "target-name", "target-new", "target-position", "text-align", "text-align-last", "text-decoration", "text-emphasis",
			"text-height", "text-indent", "text-justify", "text-outline", "text-shadow", "text-transform", "text-wrap", "top", "transform",
			"transform-origin", "transform-style", "transition", "transition-delay", "transition-duration", "transition-property",
			"transition-timing-function", "unicode-bidi", "vertical-align", "visibility", "voice-balance", "voice-duration", "voice-family",
			"voice-pitch", "voice-pitch-range", "voice-rate", "voice-stress", "voice-volume", "volume", "white-space", "white-space-collapse",
			"widows", "width", "word-break", "word-spacing", "word-wrap", "z-index"];

	function getCSSPrefix(buffer, offset) {
		var index = offset;
		while (index && /[A-Za-z\-]/.test(buffer.charAt(index - 1))) {
			index--;
		}
		return index ? buffer.substring(index, offset) : "";
	}

	/**
	 * @name orion.contentAssist.CssContentAssistProvider
	 * @class Provides content assist for CSS keywords.
	 */
	function CssContentAssistProvider() {
	}
	CssContentAssistProvider.prototype = /** @lends orion.editor.CssContentAssistProvider.prototype */ {
		/**
		 * @param {String} buffer The entire buffer being edited.
		 * @param {Number} offset The offset at which proposals will be inserted.
		 * @param {Object} context Extra information about the editor state.
		 */
		computeProposals: function(buffer, offset, context) {
			var cssPrefix = getCSSPrefix(buffer, offset);
			var proposals = [];
			for (var i=0; i < keywords.length; i++) {
					var keyword = keywords[i];
					if (keyword.indexOf(cssPrefix) === 0) {
						proposals.push({
							proposal: keyword.substring(cssPrefix.length),
							description: keyword
						});
					}
			}
			return proposals;
		}
	};

	return {
		CssContentAssistProvider: CssContentAssistProvider
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global define */

define("orion/editor/htmlContentAssist", [], function() {

/**
 * @name orion.contentAssist.HTMLContentAssistProvider
 * @class Provides content assist for HTML.
 */
function HTMLContentAssistProvider() {
}
HTMLContentAssistProvider.prototype = /** @lends orion.contentAssist.HTMLContentAssistProvider.prototype */ {

	/**
	 * Returns a string of all the whitespace at the start of the current line.
	 * @param {String} buffer The document
	 * @param {Object} selection The current selection
	 * @param {Integer} selection.offset The current selection offset
	 */
	leadingWhitespace: function(buffer, offset) {
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
	},
	computeProposals: function(buffer, offset, context) {
		function removePrefix(string) {
			return string.substring(context.prefix.length);
		}

		var proposals = [];
		//template - simple html document
		if (buffer.length === 0) {
			var text = "<!DOCTYPE html>\n" +
				"<html lang=\"en\">\n" +
				"\t<head>\n" +
				"\t\t<meta charset=utf-8>\n" +
				"\t\t<title>My Document</title>\n" +
				"\t</head>\n" +
				"\t<body>\n" +
				"\t\t<h1>A basic HTML document</h1>\n" +
				"\t\t<p>\n" +
				"\t\t\t\n" + //cursor goes here
				"\t\t</p>\n" +
				"\t</body>\n" +
				"</html>";
			proposals.push({proposal: text, description: "Simple HTML document", escapePosition: offset+152});
			return proposals;
		}

		var prefix = context.prefix;
		//only offer HTML element proposals if the character preceeding the prefix is the start of an HTML element
		var precedingChar = buffer.charAt(offset-prefix.length-1);
		if (precedingChar !== '<') {
			return proposals;
		}
		
		//elements that are typically placed on a single line (e.g., <b>, <h1>, etc)
		var element, proposalText, description, exitOffset;
		var singleLineElements = ["abbr","b","button","canvas","cite","command","dd","del","dfn","dt","em","embed",
			"font","h1","h2","h3","h4","h5","h6","i","ins","kbd","label","li","mark","meter","object","option","output",
			"progress","q","rp","rt","samp","small","strong","sub","sup","td","time","title","tt","u","var"];
		for (var i = 0; i < singleLineElements.length; i++) {
			element = singleLineElements[i];
			if (element.indexOf(prefix) === 0) {
				proposalText = element + "></" + element + ">";
				//exit position is the end of the opening element tag, so we need to substract the prefix already typed
				exitOffset = offset+element.length-prefix.length+1;
				proposals.push({proposal: removePrefix(proposalText), description: "<" + proposalText, escapePosition: exitOffset});
			}
		}
		
		//elements that typically start a block spanning multiple lines (e.g., <p>, <div>, etc)
		var multiLineElements = ["address","article","aside","audio","bdo","blockquote","body","caption","code",
			"colgroup","datalist","details","div","fieldset","figure","footer","form","head","header",
			"hgroup","iframe","legend","map","menu","nav","noframes","noscript","optgroup","p","pre",
			"ruby","script","section","select","span","style","tbody","textarea","tfoot","th","thead",
			"tr","video"];
		var whitespace = this.leadingWhitespace(buffer, offset);
		for (i = 0; i < multiLineElements.length; i++) {
			element = multiLineElements[i];
			if (element.indexOf(prefix) === 0) {
				proposalText = element + ">\n" + whitespace + "\t\n" + whitespace + "</" + element + ">";
				//exit position is the end of the opening element tag, so we need to substract the prefix already typed
				exitOffset = offset+element.length-prefix.length + whitespace.length + 3;
				proposals.push({proposal: removePrefix(proposalText), description: "<" + proposalText, escapePosition: exitOffset});
			}
		}

		//elements with no closing element (e.g., <hr>, <br>, etc)
		var emptyElements = ["area","base","br","col","hr","input","link","meta","param","keygen","source"];
		for (i = 0; i < emptyElements.length; i++) {
			element = emptyElements[i];
			if (element.indexOf(prefix) === 0) {
				proposalText = element + "/>";
				//exit position is the end of the element, so we need to substract the prefix already typed
				exitOffset = offset+element.length-prefix.length+2;
				proposals.push({proposal: removePrefix(proposalText), description: "<" + proposalText, escapePosition: exitOffset});
			}
		}

		//deluxe handling for very common elements
		//image
		if ("img".indexOf(prefix) === 0) {
			proposalText = "img src=\"\" alt=\"Image\"/>";
			proposals.push({proposal: removePrefix(proposalText), description: "<" + proposalText, escapePosition: offset+9-prefix.length});
		}
		//anchor
		if (prefix === 'a') {
			proposals.push({proposal: removePrefix("a href=\"\"></a>"), description: "<a></a> - HTML anchor element", escapePosition: offset+7});
		}
		
		//lists should also insert first element
		if ("ul".indexOf(prefix) === 0) {
			proposalText = "ul>\n" + whitespace + "\t<li></li>\n" + whitespace + "</ul>";
			description = "<ul> - unordered list";
			//exit position inside first list item
			exitOffset = offset-prefix.length + whitespace.length + 9;
			proposals.push({proposal: removePrefix(proposalText), description: description, escapePosition: exitOffset});
		}
		if ("ol".indexOf(prefix) === 0) {
			proposalText = "ol>\n" + whitespace + "\t<li></li>\n" + whitespace + "</ol>";
			description = "<ol> - ordered list";
			//exit position inside first list item
			exitOffset = offset-prefix.length + whitespace.length + 9;
			proposals.push({proposal: removePrefix(proposalText), description: description, escapePosition: exitOffset});
		}
		if ("dl".indexOf(prefix) === 0) {
			proposalText = "dl>\n" + whitespace + "\t<dt></dt>\n" + whitespace + "\t<dd></dd>\n" + whitespace + "</dl>";
			description = "<dl> - definition list";
			//exit position inside first definition term
			exitOffset = offset-prefix.length + whitespace.length + 9;
			proposals.push({proposal: removePrefix(proposalText), description: description, escapePosition: exitOffset});
		}
		if ("table".indexOf(prefix) === 0) {
			proposalText = "table>\n" + whitespace + "\t<tr>\n" + whitespace + "\t\t<td></td>\n" + 
				whitespace + "\t</tr>\n" + whitespace + "</table>";
			description = "<table> - basic HTML table";
			//exit position inside first table data
			exitOffset = offset-prefix.length + (whitespace.length*2) + 19;
			proposals.push({proposal: removePrefix(proposalText), description: description, escapePosition: exitOffset});
		}

		return proposals;
	}
};

return {
	HTMLContentAssistProvider: HTMLContentAssistProvider
};

});

/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * Copyright (c) 2012 VMware, Inc.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *     Andrew Eisenberg - rename to jsTemplateContentAssist.js
 *******************************************************************************/
/*global define */

define("orion/editor/jsTemplateContentAssist", [], function() {

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
	
	function findPreviousChar(buffer, offset) {
		var c = "";
		while (offset >= 0) {
			c = buffer[offset];
			if (c === '\n' || c === '\r') {
				//we hit the start of the line so we are done
				break;
			} else if (/\s/.test(c)) {
				offset--;
			} else {
				// a non-whitespace character, we are done
				break;
			}
		}
		return c;
	}
	
	var uninterestingChars = { 
		':': ':',
		'!': '!',
		'@': '@',
		'#': '#',
		'$': '$',
		'^': '^',
		'&': '&',
		'*': '*',
		'.': '.',
		'?': '?',
		'<': '<',
		'>': '>'
	};
	
	/** 
	 * Determines if the invocation location is a valid place to use
	 * templates.  We are not being too precise here.  As an approximation,
	 * just look at the previous character.
	 *
	 * @return {Boolean} true iff the current invocation location is 
	 * a valid place for template proposals to appear.
	 * This means that the invocation location is at the start of anew statement.
	 */
	function isValid(prefix, buffer, offset) {
		var previousChar = findPreviousChar(buffer, offset-prefix.length-1);
		return !uninterestingChars[previousChar];
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
	 * @name orion.editor.JSTemplateContentAssistProvider
	 * @class Provides content assist for JavaScript keywords.
	 */

	function JSTemplateContentAssistProvider() {}

	JSTemplateContentAssistProvider.prototype = /** @lends orion.editor.JSTemplateContentAssistProvider.prototype */
	{
		computeProposals: function(buffer, offset, context) {
			var prefix = context.prefix;
			var proposals = [];
			if (!isValid(prefix, buffer, offset)) {
				return proposals;
			}

			//we are not completing on an object member, so suggest templates and keywords
			proposals = proposals.concat(getTemplateProposals(prefix, buffer, offset));
			proposals = proposals.concat(getKeyWordProposals(prefix, buffer, offset));
			return proposals;
		}
	};

	return {
		JSTemplateContentAssistProvider: JSTemplateContentAssistProvider
	};
});

/******************************************************************************* 
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation 
 ******************************************************************************/
/*jslint browser:true regexp:true*/
/*global console define*/
define("orion/editor/AsyncStyler", ['i18n!orion/editor/nls/messages', 'orion/editor/annotations'], function(messages, mAnnotations) {
	var SERVICE_NAME = "orion.edit.highlighter";
	var HIGHLIGHT_ERROR_ANNOTATION = "orion.annotation.highlightError";
	var badServiceError = SERVICE_NAME + " service must be an event emitter";
	mAnnotations.AnnotationType.registerType(HIGHLIGHT_ERROR_ANNOTATION, {
		title: messages.syntaxError,
		html: "<div class='annotationHTML error'></div>",
		rangeStyle: {styleClass: "annotationRange error"}
	});

	function isRelevant(serviceReference) {
		return serviceReference.getProperty("objectClass").indexOf(SERVICE_NAME) !== -1 &&
				serviceReference.getProperty("type") === "highlighter";
	}

	/**
	 * @name orion.editor.AsyncStyler
	 * @class Provides asynchronous styling for a TextView using registered "highlighter" services.
	 * @description Creates an <code>AsyncStyler</code>. An AsyncStyler allows style information to be sent to a 
	 * <code>TextView</code> asynchronously through the service segistry. Style is generated by <em>style providers</em>, which are services
	 * having the <code>'orion.edit.highlighter'</code> service name and a <code>type</code> === <code>'highlighter'</code> service property.
	 *
	 * <p>A style provider monitors changes to the TextView (typically using an <code>orion.edit.model</code> service) and 
	 * dispatches a service event of type <code>'orion.edit.highlighter.styleReady'</code> when it has style information to send.
	 * The event carries a payload of style information for one or more lines in the TextView. The AsyncStyler then applies
	 * the style information fron the event to the TextView using the {@link orion.editor.TextView#event:onLineStyle} API.
	 * </p>
	 *
	 * <p>Applying style information may cause the TextView to be redrawn, which is potentially expensive. To minimize the 
	 * number of redraws, a provider should provide style for many lines in a single StyleReadyEvent.
	 * </p>
	 *
	 * @param {orion.editor.TextView} textView The TextView to style.
	 * @param {orion.serviceregistry.ServiceRegistry} serviceRegistry The ServiceRegistry to monitor for highlighter services.
	 * @param {orion.editor.AnnotationModel} [annotationModel] The Annotation Model to use for creating error and warning annotations.
	 * @see orion.editor.StyleReadyEvent
	 */
	function AsyncStyler(textView, serviceRegistry, annotationModel) {
		this.initialize(textView, serviceRegistry, annotationModel);
		this.lineStyles = [];
	}
	AsyncStyler.prototype = /** @lends orion.editor.AsyncStyler.prototype*/ {
		/** @private */
		initialize: function(textView, serviceRegistry, annotationModel) {
			this.textView = textView;
			this.serviceRegistry = serviceRegistry;
			this.annotationModel = annotationModel; 
			this.services = [];

			var self = this;
			this.listener = {
				onModelChanging: function(e) {
					self.onModelChanging(e);
				},
				onModelChanged: function(e) {
					self.onModelChanged(e);
				},
				onDestroy: function(e) {
					self.onDestroy(e);
				},
				onLineStyle: function(e) {
					self.onLineStyle(e);
				},
				onStyleReady: function(e) {
					self.onStyleReady(e);
				},
				onServiceAdded: function(serviceEvent) {
					self.onServiceAdded(serviceEvent.serviceReference, self.serviceRegistry.getService(serviceEvent.serviceReference));
				},
				onServiceRemoved: function(serviceEvent) {
					self.onServiceRemoved(serviceEvent.serviceReference, self.serviceRegistry.getService(serviceEvent.serviceReference));
				}
			};
			textView.addEventListener("ModelChanging", this.listener.onModelChanging);
			textView.addEventListener("ModelChanged", this.listener.onModelChanged);
			textView.addEventListener("Destroy", this.listener.onDestroy);
			textView.addEventListener("LineStyle", this.listener.onLineStyle);
			serviceRegistry.addEventListener("registered", this.listener.onServiceAdded);
			serviceRegistry.addEventListener("unregistering", this.listener.onServiceRemoved);

			var serviceRefs = serviceRegistry.getServiceReferences(SERVICE_NAME);
			for (var i = 0; i < serviceRefs.length; i++) {
				var serviceRef = serviceRefs[i];
				if (isRelevant(serviceRef)) {
					this.addServiceListener(serviceRegistry.getService(serviceRef));
				}
			}
		},
		/** @private */
		onDestroy: function(e) {
			this.destroy();
		},
		/** Deactivates this styler and removes any listeners it registered. */
		destroy: function() {
			if (this.textView) {
				this.textView.removeEventListener("ModelChanging", this.listener.onModelChanging);
				this.textView.removeEventListener("ModelChanged", this.listener.onModelChanged);
				this.textView.removeEventListener("Destroy", this.listener.onDestroy);
				this.textView.removeEventListener("LineStyle", this.listener.onLineStyle);
				this.textView = null;
			}
			if (this.services) {
				for (var i = 0; i < this.services.length; i++) {
					this.removeServiceListener(this.services[i]);
				}
				this.services = null;
			}
			if (this.serviceRegistry) {
				this.serviceRegistry.removeEventListener("registered", this.listener.onServiceAdded);
				this.serviceRegistry.removeEventListener("unregistering", this.listener.onServiceRemoved);
				this.serviceRegistry = null;
			}
			this.listener = null;
			this.lineStyles = null;
		},
		/** @private */
		onModelChanging: function(e) {
			this.startLine = this.textView.getModel().getLineAtOffset(e.start);
		},
		/** @private */
		onModelChanged: function(e) {
			var startLine = this.startLine;
			if (e.addedLineCount || e.removedLineCount) {
				Array.prototype.splice.apply(this.lineStyles, [startLine, e.removedLineCount].concat(this._getEmptyStyle(e.addedLineCount)));
			}
		},
		/** @private */
		onStyleReady: function(e) {
			var style = e.lineStyles || e.style;
			var min = Number.MAX_VALUE, max = -1;
			var model = this.textView.getModel();
			for (var lineIndex in style) {
				if (style.hasOwnProperty(lineIndex)) {
					this.lineStyles[lineIndex] = style[lineIndex];
					min = Math.min(min, lineIndex);
					max = Math.max(max, lineIndex);
				}
			}
//			console.debug("Got style for lines " + (min+1) + " to " + (max+1));
			min = Math.max(min, 0);
			max = Math.min(max, model.getLineCount());
			
			var annotationModel = this.annotationModel;
			if (annotationModel) {
				var annos = annotationModel.getAnnotations(model.getLineStart(min), model.getLineEnd(max));
				var toRemove = [];
				while (annos.hasNext()) {
					var anno = annos.next();
					if (anno.type === HIGHLIGHT_ERROR_ANNOTATION) {
						toRemove.push(anno);
					}
				}
				var toAdd = [];
				for (var i = min; i <= max; i++) {
					lineIndex = i;
					var lineStyle = this.lineStyles[lineIndex], errors = lineStyle && lineStyle.errors;
					var lineStart = model.getLineStart(lineIndex);
					if (errors) {
						for (var j=0; j < errors.length; j++) {
							var err = errors[j];
							toAdd.push(mAnnotations.AnnotationType.createAnnotation(HIGHLIGHT_ERROR_ANNOTATION, err.start + lineStart, err.end + lineStart));
						}
					}
				}
				annotationModel.replaceAnnotations(toRemove, toAdd);
			}
			this.textView.redrawLines(min, max + 1);
		},
		/** @private */
		onLineStyle: function(e) {
			function _toDocumentOffset(ranges, lineStart) {
				var len = ranges.length, result = [];
				for (var i=0; i < len; i++) {
					var r = ranges[i];
					result.push({
						start: r.start + lineStart,
						end: r.end + lineStart,
						style: r.style
					});
				}
				return result;
			}
			var style = this.lineStyles[e.lineIndex];
			if (style) {
				// The 'ranges', 'errors' are of type {@link orion.editor.LineStyleEvent#ranges}, except the 
				// start and end indices are line-relative offsets, not document-relative.
				if (style.ranges) { e.ranges = _toDocumentOffset(style.ranges, e.lineStart); }
				else if (style.style) { e.style = style.style; }
			}
		},
		/** @private */
		_getEmptyStyle: function(n) {
			var result = [];
			for (var i=0; i < n; i++) {
				result.push(null);
			}
			return result;
		},
		/**
		 * Sets the content type ID for which style information will be provided. The ID will be passed to all style provider 
		 * services monitored by this AsyncStyler by calling the provider's own <code>setContentType(contentTypeId)</code> method.
		 *
		 * <p>In this way, a single provider service can be registered for several content types, and select different logic for 
		 * each type.</p>
		 * @param {String} contentTypeId The Content Type ID describing the kind of file currently being edited in the TextView.
		 * @see orion.core.ContentType
		 */
		setContentType: function(contentTypeId) {
			this.contentType = contentTypeId;
			if (this.services) {
				for (var i = 0; i < this.services.length; i++) {
					var service = this.services[i];
					if (service.setContentType) {
						var progress = this.serviceRegistry.getService("orion.page.progress");
						if(progress){
							progress.progress(service.setContentType(this.contentType), "Styling content type: " + this.contentType.id ? this.contentType.id: this.contentType);
						} else {
							service.setContentType(this.contentType);
						}
					}
				}
			}
		},
		/** @private */
		onServiceAdded: function(serviceRef, service) {
			if (isRelevant(serviceRef)) {
				this.addServiceListener(service);
			}
		},
		/** @private */
		onServiceRemoved: function(serviceRef, service) {
			if (this.services.indexOf(service) !== -1) {
				this.removeServiceListener(service);
			}
		},
		/** @private */
		addServiceListener: function(service) {
			if (typeof service.addEventListener === "function") {
				service.addEventListener("orion.edit.highlighter.styleReady", this.listener.onStyleReady);
				this.services.push(service);
				if (service.setContentType && this.contentType) {
					var progress = this.serviceRegistry.getService("orion.page.progress");
					if(progress){
						progress.progress(service.setContentType(this.contentType), "Styling content type: " + this.contentType.id ? this.contentType.id: this.contentType);
					} else {
						service.setContentType(this.contentType);
					}
				}
			} else {
				if (typeof console !== "undefined") {
					console.log(new Error(badServiceError));
				}
			}
		},
		/** @private */
		removeServiceListener: function(service) {
			if (typeof service.removeEventListener === "function") {
				service.removeEventListener("orion.edit.highlighter.styleReady", this.listener.onStyleReady);
				var serviceIndex = this.services.indexOf(service);
				if (serviceIndex !== -1) {
					this.services.splice(serviceIndex, 1);
				}
			} else {
				if (typeof console !== "undefined") {
					console.log(new Error(badServiceError));
				}
			}
		}
	};

	/**
	 * @name orion.editor.StyleReadyEvent
	 * @class Represents the styling for a range of lines, as provided by a service.
	 * @description Represents the styling for a range of lines, as provided by a service.
	 * @property {Object} lineStyles A map of style information. Each key of the map is a line index, and the value 
	 * is a {@link orion.editor.StyleReadyEvent#LineStyle} giving the style information for the line.
	 */
	/**
	 * @name orion.editor.StyleReadyEvent#LineStyle
	 * @class Represents style information for a line.
	 * @description Represents style information for a line.
	 * <p>Note that the offsets given in the {@link #ranges} and {@link #errors} properties are relative to the start of the
	 * line that this LineStyle is associated with, not the start of the document.</p>
	 * @property {orion.editor.StyleRange[]} ranges Optional; Gives the styles for this line.
	 * @property {orion.editor.StyleRange[]} errors Optional; Gives the error styles for this line. Error styles will be 
	 * presented as annotations in the UI.
	 */

	return AsyncStyler;
});

/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global define */
/*jslint browser:true forin:true*/
define("orion/editor/mirror", ["i18n!orion/editor/nls/messages", "orion/editor/eventTarget", "orion/editor/annotations"], function(messages, mEventTarget, mAnnotations) {
	// TODO this affects indentation, which we don't support. Should be a parameter.
	var tabSize = 4;
	
	/**
	 * @private
	 * @name orion.mirror.Stream
	 * @class Encapsulates a line of code and the current position in the line.
	 * @description An implementation of CodeMirror's "StringStream" API.
	 * @see <a href="http://codemirror.net/doc/manual.html#StringStream">http://codemirror.net/doc/manual.html#StringStream</a>
	 */
	function Stream(/**String*/ str) {
		// Don't rename these or CodeMirror's "perl" mode will break.
		this.string = str;
		this.pos = 0;
		this.tokenStart = 0;
	}
	Stream.prototype = /** @lends orion.mirror.Stream.prototype */ {
		/** @returns {Boolean} */
		eol: function() { return this.pos >= this.string.length; },
		/** @returns {Boolean} */
		sol: function() { return this.pos === 0; },
		/** @returns {Char} */
		peek: function() { return this.string[this.pos]; },
		next: function() { return this.string[this.pos++]; },
		/** @returns {Char|undefined} */
		eat: function(/**String|RegExp|Function*/ match) {
			var c = this.string[this.pos];
			var isMatch = (typeof c === "string") && (c === match || (match.test && match.test(c)) || (typeof match === "function" && match(c)));
			return isMatch ? this.string[this.pos++] : undefined;
		},
		/** @returns {Boolean} */
		eatWhile: function(/**String|RegExp|Function*/ match) {
			var ate = false;
			while (this.eat(match) !== undefined) {
				ate = true;
			}
			return ate;
		},
		/** @returns {Boolean} */
		eatSpace: function() { return this.eatWhile(/\s/); },
		skipToEnd: function() { this.pos = this.string.length; },
		skipTo: function(/**Char*/ ch) {
			var idx = this.string.indexOf(ch, this.pos);
			if (idx !== -1) {
				this.pos = idx;
				return true;
			}
			return false;
		},
		match: function(/**String|RegExp*/ pattern, /**Boolean*/ consume, /**Boolean*/ caseFold) {
			consume = (consume === true || typeof consume === "undefined");
			if (typeof pattern === "string") {
				var str = caseFold ? this.string.toLowerCase() : this.string;
				pattern = caseFold ? pattern.toLowerCase() : pattern;
				var index = str.indexOf(pattern, this.pos);
				if (index !== -1 && consume) {
					this.pos = index + pattern.length;
				}
				return index !== -1;
			} else {
				var match = this.string.substring(this.pos).match(pattern);
				if (match && consume && typeof match[0] === "string") {
					this.pos += match.index + match[0].length;
				}
				return match;
			}
		},
		backUp: function(/**Number*/ n) { this.pos -= n; },
		/** @returns {Number} */
		column: function() {
			var col = 0, i = 0;
			while (i < this.tokenStart) {
				col += (this.string[i++] === "\t") ? tabSize : 1;
			}
			return col;
		},
		/** @returns {Number} */
		indentation: function() {
			var index = this.string.search(/\S/);
			var col = 0, i = 0;
			while(i < index) {
				col += (this.string[i++] === "\t") ? tabSize : 1;
			}
			return col;
		},
		/** @returns {String} */
		current: function() { return this.string.substring(this.tokenStart, this.pos); },
		advance: function() { this.tokenStart = this.pos; }
	};

	/**
	 * @name orion.mirror.Mirror
	 * @class A shim for CodeMirror's <code>CodeMirror</code> API.
	 * @description A Mirror is a partial implementation of the API provided by the <a href="http://codemirror.net/doc/manual.html#api">
	 * <code>CodeMirror</code> object</a>. Mirror provides functionality related to mode and MIME management.
	 * 
	 * <p>If clients intend to reuse modes provided by CodeMirror without modification, they must expose a Mirror as 
	 * a property named <code>"CodeMirror"</code> of the global object so that modes may access it to register themselves,
	 * and to load other modes. For example:
	 * </p>
	 * <p><code>
	 * &lt;script&gt;<br>
	 * window.CodeMirror = new Mirror();<br>
	 * // Now you can load the CodeMirror mode scripts.<br>
	 * &lt/script&gt;
	 * </code></p>
	 * @see <a href="http://codemirror.net/manual.html">http://codemirror.net/manual.html</a>
	 */
	function Mirror(options) {
		this._modes = {};
		// This internal variable must be named "mimeModes" otherwise CodeMirror's "less" mode will fail.
		this.mimeModes = {};
		this.options = {};
	
		// Expose Stream as a property named "StringStream". This is required to support CodeMirror's Perl mode,
		// which monkey-patches CodeMirror.StringStream.prototype and will fail if that object doesn't exist.
		this.StringStream = Stream;
	}
	function keys(obj) {
		var k = [];
		for (var p in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, p)) {
				k.push(p);
			}
		}
		return k;
	}
	Mirror.prototype = /** @lends orion.mirror.Mirror.prototype */ {
		options: {},
		/** @see <a href="http://codemirror.net/doc/manual.html#getOption">http://codemirror.net/doc/manual.html#getOption</a> */
		setOption: function(/**String*/ option, /**Object*/ value) { this.options[option] = value; },
		/**
		 * @see <a href="http://codemirror.net/doc/manual.html#getOption">http://codemirror.net/doc/manual.html#getOption</a>
		 * @returns {Object}
		 */
		getOption: function(option) { return this.options[option]; },
		/** 
		 * @see <a href="http://codemirror.net/doc/manual.html#modeapi">http://codemirror.net/doc/manual.html#modeapi</a>
		 * @returns {Object} A copy of <code>state</code>.
		 */
		copyState: function(/**Object*/ mode, /**Object*/ state) {
			if (typeof mode.copyState === "function") { return mode.copyState(state); }
			var newState = {};
			for (var prop in state) {
				var value = state[prop];
				newState[prop] = (value instanceof Array) ? value.slice() : value;
			}
			return newState;
		},
		/** @see <a href="http://codemirror.net/doc/manual.html#modeapi">http://codemirror.net/doc/manual.html#modeapi</a> */
		defineMode: function(/**String*/ name, /**Function(options, config)*/ modeFactory) {
			this._modes[name] = modeFactory;
		},
		/**
		 * @param {String} mime
		 * @param {String|Object} modeSpec
		 * @see <a href="http://codemirror.net/manual.html#option_mode">http://codemirror.net/manual.html#option_mode</a>
		 */
		defineMIME: function(mime, modeSpec) {
			this.mimeModes[mime] = modeSpec;
		},
		/**
		 * @param {String|Object} modeSpec 
		 * @see <a href="http://codemirror.net/manual.html#option_mode">http://codemirror.net/manual.html#option_mode</a>
		 * @returns {Object}
		 */
		getMode: function(options, modeSpec) {
			var config = {}, modeFactory;
			if (typeof modeSpec === "string" && this.mimeModes[modeSpec]) {
				modeSpec = this.mimeModes[modeSpec];
			}
			if (typeof modeSpec === "object") {
				config = modeSpec;
				modeFactory = this._modes[modeSpec.name];
			}
			modeFactory = modeFactory || this._modes[modeSpec];
			if (typeof modeFactory !== "function") {
				throw "Mode not found " + modeSpec;
			}
			return modeFactory(options, config);
		},
		/**
		 * @see <a href="http://codemirror.net/doc/manual.html#option_mode">http://codemirror.net/doc/manual.html#option_mode</a>
		 * @returns {String[]} The mode names.
		 */
		listModes: function() {
			return keys(this._modes);
		},
		/**
		 * @see <a href="http://codemirror.net/doc/manual.html#option_mode">http://codemirror.net/doc/manual.html#option_mode</a>
		 * @returns {String[]} The MIMEs.
		 */
		listMIMEs: function() {
			return keys(this.mimeModes);
		},
		_getModeName: function(mime) {
			var mname = this.mimeModes[mime];
			if (typeof mname === "object") { mname = mname.name; }
			return mname;
		}
	};

	/**
	 * @name orion.mirror.ModeApplier#HighlightEvent
	 * @event
	 * @description Dispatched when the ModeApplier has updated the highlight info for a region of the file.
	 * @param {Number} start The starting line index of the highlighted region.
	 * @param {Number} end The ending line index of the highlighted region.
	 */
	/**
	 * @name orion.mirror.MirrorLineStyle
	 * @class Represents the style provided by a CodeMirror mode for a line.
	 * @description 
	 */
	/**
	 * @name orion.mirror.ModeApplier
	 * @class Driver for CodeMirror modes.
	 * @description A <code>ModeApplier</code> listens to text changes on a {@link orion.editor.TextModel} and drives
	 * a CodeMirror mode to calculate highlighting in response to the change. Clients can use the highlighting information
	 * to style a {@link orion.editor.TextView}.
	 * 
	 * <p>After a change is made to the {@link orion.editor.TextModel}, ModeApplier immediately updates the highlighting 
	 * information for a small portion of the file around where the change occurred. Successive portions of the file are
	 * updated by short jobs that run periodically to avoid slowing down the rest of the application.</p>
	 * 
	 * <p>A {@link #event:HighlightEvent} event is dispatched every time the ModeApplier updates highlighting information for
	 * a portion of the file. The event contains information about which lines were highlighted. The style for any highlighted
	 * line can be obtained by calling {@link #getLineStyle}.</p>
	 * 
	 * @param {orion.editor.TextModel} model The text model to listen to.
	 * @param {orion.mirror.Mirror} mirror The {@link orion.mirror.Mirror} to use for loading modes.
	 * @param {Object} [options]
	 * <!-- @param {Boolean} [options.whitespacesVisible] If <code>true</code>, causes ModeApplier 
	 * to generate style regions for any whitespace characters that are not claimed as tokens by the mode. -->
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function ModeApplier(model, codeMirror, options) {
		options = options || {};
		this.model = model;
		this.codeMirror = codeMirror;
		this.isWhitespaceVisible = (typeof options.whitespacesVisible === "undefined" ? false : options.whitespacesVisible);
		
		this.mode = null;
		this.isModeLoaded = false;
		this.lines = []; // Array of {style: Array, eolState: state}
		this.dirtyLines = [];
		this.startLine = Number.MAX_VALUE;
		this.endLine = -1;
		this.timer = null;

		this.initialize(model);
	}
	
	var TAB = "token_tab",
	    SPACE = "token_space",

	    /* Max number of lines to immediately re-highlight after an edit. Remaining lines are handled by follow-up jobs. */
	    MAX_REHIGHLIGHT = 500,

	    /* Time in ms to wait between highlight jobs. */
	    JOB_INTERVAL = 50,

	    /* Maximum duration in ms of the re-highlight job.*/
	    JOB_DURATION = 30,

	    /*
	     * During a highlight job, when mode doesn't define a "compareStates" method and we find more than this many
	     * consecutive unchanged lines, the job aborts. (Assumes rest of file is already correctly highlighted.)
	     */
	    ABORT_THRESHOLD = 3,

	    /* Maximum number of lines to backtrack when searching for previous state to resume parsing from. */
	    MAX_BACKTRACK = 40;
	
	ModeApplier.prototype = /** @lends orion.mirror.ModeApplier.prototype */ {
		/** @private */
		initialize: function(model) {
			var self = this;
			this.listener = {
				onModelChanging: function(e) {
					self._onModelChanging(e);
				},
				onModelChanged: function(e) { // Internal detail of TextModel?
					self._onModelChanged(e);
				},
				onDestroy: function(e) {
					self._onDestroy(e);
				}
			};
			this.model.addEventListener("Changing", this.listener.onModelChanging);
			this.model.addEventListener("Changed", this.listener.onModelChanged);
			this.model.addEventListener("Destroy", this.listener.onDestroy);
		},
		/** Deactivates this ModeApplier and removes its listeners. */
		destroy: function() {
			if (this.model) {
				this.model.removeEventListener("Changing", this.listener.onModelChanging);
				this.model.removeEventListener("Changed", this.listener.onModelChanged);
				this.model.removeEventListener("Destroy", this.listener.onDestroy);
			}
			this.model = null;
			this.codeMirror = null;
			this.mode = null;
			this.lines = null;
			this.dirtyLines = null;
			clearTimeout(this.timer);
			this.timer = null;
		},
		_onModelChanging: function(e) {
			this.startLine = this.model.getLineAtOffset(e.start);
		},
		_onModelChanged: function(e) {
			this._dbgEvent(e);
			var startLine = this.startLine;
			if (e.removedLineCount || e.addedLineCount) {
				// Patch up the line styles array; new lines get empty styles
				Array.prototype.splice.apply(this.lines, [startLine + 1, e.removedLineCount].concat(this._newLines(e.addedLineCount)));
			}
			if (!this.mode) {
				return;
			}
			// We need to continue at least until editEndLine, and possibly beyond up to MAX_REHIGHLIGHT
			var editEndLine = Math.max(e.addedLineCount, e.removedLineCount);
			var endLine = startLine + Math.min(editEndLine, MAX_REHIGHLIGHT);
			this.highlight(startLine, endLine);
			
			// Launch a job to fix up the rest of the buffer
			this.highlightLater(endLine + 1);
		},
		_onDestroy: function(e) {
			this.destroy();
		},
		/** @private */
		setViewportIndex: function(viewportIndex) {
			// TODO this is for the viewport-priority case
			this.viewportIndex = viewportIndex;
		},
		_dbgEvent: function(e) {
//			var str = keys(e).map(function(p) {
//				return p + ": " + e[p];
//			});
//			console.debug( str.join(", ") );
		},
		_dbgStyle: function() {
//			var r = [];
//			for (var i=0; i < this.lines.length; i++) {
//				var style = this.lines[i].style || [];
//				var l = "" + i + ": " ;
//				for (var j=0; j < style.length; j++) {
//					var region = style[j];
//					l += region[0] + "," + region[1] + "\"" + region[2] + "\" ";
//				}
//				r.push(l);
//			}
//			console.debug(r.join("\n"));
		},
		_newLines: function(n, startIndex) {
			if (typeof startIndex === "undefined") { startIndex = 0; }
			var newLines = [];
			for (var i=0; i < n; i++) {
				newLines.push({
					style: null,
					eolState: null
				});
			}
			return newLines;
		},
		/**
		 * Sets the CodeMirror mode to be used for highlighting. The mode must be registered with the {@link orion.mirror.Mirror}
		 * that this <code>ModeApplier</code> was created with. (The methods {@link orion.mirror.Mirror#defineMode} and
		 * {@link orion.mirror.Mirror#defineMIME} can be used to register a mode with a Mirror.)
		 * @param {String} modeSpec Mode name or MIME type.
		 * @param {Boolean} [highlightImmediately=false]
		 */
		setMode: function(modeSpec, highlightImmediately) {
			if (!modeSpec) { return; }
			this.mode = this.codeMirror.getMode(this.codeMirror.options, modeSpec);
			this.lines = this._newLines(this.model.getLineCount());
			if (highlightImmediately) {
				this.highlight();
			}
		},
		/**
		 * Highlights the given range of lines.
		 * @param {Number} [startLine]
		 * @param {Number} [endLine]
		 * @param {Boolean} [partial=false] If <code>true</code>, this function is assumed to be running as part of a larger
		 * operation, and will not dispatch a {@link #event:HighlightEvent}.
		 */
		highlight: function(startLine, endLine, partial) {
			if (!this.mode) {
				return;
			}
			var lineCount = this.model.getLineCount();
			startLine = typeof startLine === "undefined" ? 0 : startLine;
			endLine = typeof endLine === "undefined" ? lineCount - 1 : Math.min(endLine, lineCount - 1);
			var mode = this.mode;
			var state = this.getState(startLine);
			for (var i = startLine; i <= endLine; i++) {
				var line = this.lines[i];
				this.highlightLine(i, line, state);
				line.eolState = this.codeMirror.copyState(mode, state);
			}
//			console.debug("Highlighted " + startLine + " to " + endLine);
			this._expandRange(startLine, endLine);
			if (!partial) {
				this.onHighlightDone();
			}
		},
		/**
		 * Schedules a job that will begin highlighting from <code>startLine</code>. The job runs for a short amount of time,
		 * after which it dispatches a {@link #event:HighlightEvent} indicating its progress, and yields. Follow-up jobs are
		 * scheduled automatically if there's more highlighting to be done.
		 */
		highlightLater: function(/**Number*/ startLine) {
			this.dirtyLines.push(startLine);
			var self = this;
			this.timer = setTimeout(function() {
				self._highlightJob();
			}, JOB_INTERVAL);
		},
		/**
		 * Highlights starting from some dirty line index. Potentially continues up to model.getLineCount(). If this function runs
		 * for longer than JOB_DURATION, it schedules a follow-up job to continue the work, and returns. A HighlightEvent is 
		 * dispatched just before this function finishes.
		 */
		_highlightJob: function() {
			var stopTime = +new Date() + JOB_DURATION, compareStates = this.mode.compareStates, lineCount = this.model.getLineCount();
			while (this.dirtyLines.length) {
				// TODO support viewport priority
				var viewportIndex = this.viewportIndex, viewportLine = this.lines[viewportIndex], lineIndex;
				if (viewportLine && !viewportLine.eolState) {
					lineIndex = viewportIndex;
				} else {
					lineIndex = this.dirtyLines.pop();
				}
				if (lineIndex >= lineCount) {
					break;
				}
				this._expandRange(lineIndex, lineIndex);
				var resumeIndex = this._getResumeLineIndex(lineIndex), startIndex = resumeIndex + 1;
				var state = (resumeIndex >= 0) && this.lines[resumeIndex].eolState;
				state = state ? this.codeMirror.copyState(this.mode, state) : this.mode.startState();
				
				var numUnchanged = 0;
				for (var i=startIndex; i < lineCount; i++) {
					var l = this.lines[i];
					var oldState = l.eolState;
					var isChanged = this.highlightLine(i, l, state);
					l.eolState = this.codeMirror.copyState(this.mode, state);
					if (isChanged) {
						this._expandRange(startIndex, i+1);
					}
					var isCompareStop = compareStates && oldState && compareStates(oldState, l.eolState);
					var isHeuristicStop = !compareStates && !isChanged && (numUnchanged++ > ABORT_THRESHOLD);
					if (isCompareStop || isHeuristicStop) {
						break; // Abort completely. Don't highlight any more lines
					} else if (!oldState || isChanged) {
						numUnchanged = 0;
					}
					var workRemains = i < lineCount || this.dirtyLines.length;
					var timeElapsed = +new Date() > stopTime && workRemains;
					if (timeElapsed) {
						// Stop, continue later
						//this._expandRange(startIndex, i + 1);
						this.highlightLater(i + 1);
						this.onHighlightDone();
						return; // TODO clean up terminating condition
					}
				}
			}
			this.onHighlightDone();
		},
		/** Called when some highlighting has been performed. Dispatches a {@link #event:HighlightEvent}. */
		onHighlightDone: function() {
			if (this.startLine !== Number.MAX_VALUE && this.endLine !== -1) {
				this.dispatchEvent({
					type: "Highlight",
					start: this.startLine,
					end: this.endLine
				});
			}
			this.startLine = Number.MAX_VALUE;
			this.endLine = -1;
		},
		_getResumeLineIndex: function(lineIndex) {
			var lines = this.lines;
			for (var i = lineIndex - 1; i >= 0; i--) {
				if (lines[i].eolState || lineIndex - i > MAX_BACKTRACK) {
					return i;
				}
			}
			return -1;
		},
		/**
		 * Returns the state we can use for parsing from the start of the <i><code>lineIndex</code></i>th line.
		 * @returns {Object} The state. This object is safe to mutate.
		 */
		getState: function(/**Number*/ lineIndex) {
			var mode = this.mode, lines = this.lines;
			var i, line;
			for (i = lineIndex-1; i >= 0; i--) {
				line = lines[i];
				if (line.eolState || lineIndex - i > MAX_BACKTRACK) {
					// CodeMirror optimizes by using least-indented line; we just use this line
					break;
				}
			}
			var state = (i >= 0) && lines[i].eolState;
			if (state) {
				state = this.codeMirror.copyState(mode, state);
				// Highlight from i up to lineIndex-1
				i = Math.max(0, i);
				for (var j = i; j < lineIndex-1; j++) {
					line = lines[j];
					this.highlightLine(j, line, state);
					line.eolState = this.codeMirror.copyState(mode, state);
				}
				return state; // is a copy of lines[lineIndex - 1].eolState
			} else {
				return mode.startState();
			}
		},
		/**
		 * Highlights a single line.
		 * @param {Number} lineIndex
		 * @param {Object} line
		 * @param {Object} state The state to use for parsing from the start of the line.
		 */
		highlightLine: function(lineIndex, line, state) {
			if (!this.mode) {
				return;
			}
			var model = this.model;
			if (model.getLineStart(lineIndex) === model.getLineEnd(lineIndex) && this.mode.blankLine) {
				this.mode.blankLine(state);
			}
			var style = line.style || [];
			var text = model.getLine(lineIndex);
			var stream = new Stream(text);
			var isChanged = !line.style;
			var newStyle = [], ws;
			for (var i=0; !stream.eol(); i++) {
				var tok = this.mode.token(stream, state) || null;
				var tokStr = stream.current();
				ws = this._whitespaceStyle(tok, tokStr, stream.tokenStart);
				if (ws) {
					// TODO Replace this (null) token with whitespace tokens. Do something smart
					// to figure out isChanged, I guess
				}
				var newS = [stream.tokenStart, stream.pos, tok]; // shape is [start, end, token]
				var oldS = style[i];
				newStyle.push(newS);
				isChanged = isChanged || !oldS || oldS[0] !== newS[0] || oldS[1] !== newS[1] || oldS[2] !== newS[2];
				stream.advance();
			}
			isChanged = isChanged || (newStyle.length !== style.length);
			if (isChanged) { line.style = newStyle.length ? newStyle : null; }
			return isChanged;
		},
		/**
		 * If given an un-token'd chunk of whitespace, returns whitespace style tokens for it.
		 * @returns {Array} The whitespace styles for the token, or null.
		 */
		_whitespaceStyle: function(token, str, pos) {
			if (!token && this.isWhitespaceVisible && /\s+/.test(str)) {
				var whitespaceStyles = [], start, type;
				for (var i=0; i < str.length; i++) {
					var chr = str[i];
					if (chr !== type) {
						if (type) {
							whitespaceStyles.push([pos + start, pos + i, (type === "\t" ? TAB : SPACE)]);
						}
						start = i;
						type = chr;
					}
				}
				whitespaceStyles.push([pos + start, pos + i, (type === "\t" ? TAB : SPACE)]);
				return whitespaceStyles;
			}
			return null;
		},
		_expandRange: function(startLine, endLine) {
			this.startLine = Math.min(this.startLine, startLine);
			this.endLine = Math.max(this.endLine, endLine);
		},
		/**
		 * Converts a <code>MirrorLineStyle</code> to a {@link orion.editor.StyleRange[]}.
		 * @param {orion.mirror.MirrorLineStyle} style The line style to convert.
		 * @param {Number} [lineIndex] The line index of the line having the given style. If omitted, the returned 
		 * {@link orion.editor.StyleRange[]} objects will have offsets relative to the line, not the document.
		 * 
		 * @returns {orion.editor.StyleRange[][]} An array of 2 elements. The first element is an {@link orion.editor.StyleRange[]}
		 * giving the styles for the line. 
		 * <p>The second element is an {@link orion.editor.StyleRange[]} containing only those elements of
		 * the first array that represent syntax errors. (By CodeMirror convention, anything assigned the <code>"cm-error"</code> tag
		 * is assumed to be an error).</p>
		 */
		toStyleRangesAndErrors: function(lineStyle, lineIndex) {
			function token2Class(token) {
				if (!token) { return null; }
				if (token === TAB || token === SPACE) { return token; }
				return "cm-" + token;
			}
			var style = lineStyle.style;
			if (!style) { return null; }
			var ranges = [], errors = [];
			var offset = (typeof lineIndex === "undefined") ? 0 : this.model.getLineStart(lineIndex);
			for (var i=0; i < style.length; i++) {
				var elem = style[i]; // shape is [start, end, token]
				var className = token2Class(elem[2]);
				if (!className) { continue; }
				var obj = {
					start: offset + elem[0],
					end: offset + elem[1],
					style: {styleClass: className} };
				ranges.push(obj);
				if (className === "cm-error") {
					errors.push(obj);
				}
			}
			return [ranges, errors];
		},
		/** @returns {orion.mirror.MirrorLineStyle} */
		getLineStyle: function(/**Number*/ lineIndex) {
			return this.lines[lineIndex];
		},
		/** @returns {orion.mirror.MirrorLineStyle[]} */
		getLineStyles: function() {
			return this.lines;
		}
	};
	mEventTarget.EventTarget.addMixin(ModeApplier.prototype);

	/**
	 * @name orion.mirror.CodeMirrorStyler
	 * @class A styler that uses CodeMirror modes to provide styles for a {@link orion.editor.TextView}.
	 * @description A <code>CodeMirrorStyler</code> applies one or more CodeMirror modes to provide styles for a {@link orion.editor.TextView}.
	 * It uses modes that are registered with the {@link orion.mirror.Mirror} object passed to the CodeMirrorStyler constructor.
	 * 
	 * <p>The process for using CodeMirrorStyler is as follows:</p>
	 * <ol>
	 * <li>Create a {@link orion.mirror.Mirror}.</li>
	 * <li>Load the modes you want to use and register them with the <code>Mirror</code> using {@link orion.mirror.Mirror#defineMode}.
	 * <p>Note that the <a href="https://github.com/marijnh/CodeMirror2/tree/master/mode">modes included with CodeMirror</a> expect
	 * a global variable named "CodeMirror" to be available. If you intend to use these modes without modification, you must first 
	 * expose your Mirror as a global variable. See the {@link orion.mirror.Mirror} documentation for details.</p>
	 * </li>
	 * <li>Call {@link #setMode} to tell the styler what mode to use for highlighting the view.
	 * <p>Note that the mode may refer to other modes to process nested language text. In such cases, you should ensure that all
	 * dependent modes have been registered with the Mirror before calling {@link #setMode}.</p>
	 * </li>
	 * 
	 * @param {orion.editor.TextView} textView The TextView to provide style for.
	 * @param {orion.mirror.Mirror} codeMirror The Mirror object to load modes from.
	 * @param {orion.editor.AnnotationModel} [annotationModel]
	 */
	function CodeMirrorStyler(textView, codeMirror, annotationModel) {
		this.init(textView, codeMirror, annotationModel);
	}

	var LINESTYLE_OVERSHOOT = 20;
	var HIGHLIGHT_ERROR_ANNOTATION = "orion.annotation.highlightError";
	mAnnotations.AnnotationType.registerType(HIGHLIGHT_ERROR_ANNOTATION, {
		title: messages.syntaxError,
		html: "<div class='annotationHTML error'></div>",
		rangeStyle: {styleClass: "annotationRange error"}
	});

	CodeMirrorStyler.prototype = /** @lends orion.mirror.CodeMirrorStyler.prototype */ {
		/** @private */
		init: function(textView, codeMirror, annotationModel) {
			this.textView = textView;
			this.annotationModel = annotationModel;
			this.modeApplier = new ModeApplier(textView.getModel(), codeMirror);
			var self = this;
			this.listener = {
				onLineStyle: function(e) {
					self.onLineStyle(e);
				},
				onDestroy: function(e) {
					self.onDestroy(e);
				},
				onHighlight: function(e) {
					self.onHighlight(e);
				}
			};
			textView.addEventListener("LineStyle", this.listener.onLineStyle);
			textView.addEventListener("Destroy", this.listener.onDestroy);
			this.modeApplier.addEventListener("Highlight", this.listener.onHighlight);
		},
		/** Deactivates this styler and removes its listeners. */
		destroy: function() {
			if (this.modeApplier) {
				this.modeApplier.removeEventListener("Highlight", this.listener.onHighlight);
				this.modeApplier.destroy();
			}
			if (this.annotationModel) {
				// remove annotation listeners
			}
			if (this.textView) {
				this.textView.removeEventListener("LineStyle", this.listener.onLineStyle);
				this.textView.removeEventListener("Destroy", this.listener.onDestroy);
			}
			this.textView = null;
			this.annotationModel = null;
			this.modeApplier = null;
			this.listener = null;
		},
		/** 
		 * Sets the CodeMirror mode that this styler will use for styling the view.
		 * @param {String} modeSpec Name of the mode to use (eg. <code>"css"</code>), or a MIME type defined by the mode
		 * (eg. <code>"text/css"</code>).
		 */
		setMode: function(modeSpec) {
			this.modeApplier.setMode(modeSpec);
		},
		/** @private */
		onLineStyle: function(e) {
			var lineIndex = e.lineIndex, modeApplier = this.modeApplier, style = modeApplier.getLineStyle(lineIndex);
			if (!(style && style.eolState)) {
				// Start highlighting from lineIndex, do a few more lines
				var lineCount = this.textView.getModel().getLineCount();
				modeApplier.highlight(lineIndex, Math.min(lineIndex + LINESTYLE_OVERSHOOT, lineCount - 1), true /*don't dispatch*/);
				style = modeApplier.getLineStyle(lineIndex);
			}
			var model = this.textView.getModel();
			if (style) {
				// Now we have a style for the line. It may not be correct in the case where lineIndex is at the end of a large
				// buffer. But in that case, the highlight job kicked off by ModelChanged will eventually reach it and fix it up.
				var rangesAndErrors = modeApplier.toStyleRangesAndErrors(style, lineIndex);
				if (rangesAndErrors) {
					e.ranges = rangesAndErrors[0];
					var annotationModel = this.annotationModel;
					if (annotationModel) {
						var toRemove = [], toAdd = [];
						var errors = rangesAndErrors[1];
						if (errors) {
							for (var i=0; i < errors.length; i++) {
								var error = errors[i];
								if (error.style.styleClass === "cm-error") {
									toAdd.push(mAnnotations.AnnotationType.createAnnotation(HIGHLIGHT_ERROR_ANNOTATION, error.start, error.end));
								}
							}
						}
						var annos = annotationModel.getAnnotations(model.getLineStart(lineIndex), model.getLineEnd(lineIndex));
						while (annos.hasNext()) {
							var anno = annos.next();
							if (anno.type === HIGHLIGHT_ERROR_ANNOTATION) {
								toRemove.push(anno);
							}
						}
						annotationModel.replaceAnnotations(toRemove, toAdd);
					}
				}
			}
		},
		/** @private */
		onHighlight: function(e) {
			// If the highlighted lines are in view, redraw them
			var start = e.start, end = e.end;
			this.textView.redrawLines(start, end);
		},
		/** @private */
		onDestroy: function(e) {
			this.destroy();
		}
	};

	return {
		Mirror: Mirror,
		ModeApplier: ModeApplier,
		CodeMirrorStyler: CodeMirrorStyler
	};
});

/******************************************************************************* 
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation 
 ******************************************************************************/

/*jslint regexp:false laxbreak:true*/
/*global define */

define("orion/editor/textMateStyler", ['orion/editor/regex' ], function(mRegex) {

var RegexUtil = {
	// Rules to detect some unsupported Oniguruma features
	unsupported: [
		{regex: /\(\?[ims\-]:/, func: function(match) { return "option on/off for subexp"; }},
		{regex: /\(\?<([=!])/, func: function(match) { return (match[1] === "=") ? "lookbehind" : "negative lookbehind"; }},
		{regex: /\(\?>/, func: function(match) { return "atomic group"; }}
	],
	
	/**
	 * @param {String} str String giving a regular expression pattern from a TextMate grammar.
	 * @param {String} [flags] [ismg]+
	 * @returns {RegExp}
	 */
	toRegExp: function(str) {
		function fail(feature, match) {
			throw new Error("Unsupported regex feature \"" + feature + "\": \"" + match[0] + "\" at index: "
					+ match.index + " in " + match.input);
		}
		// Turns an extended regex pattern into a normal one
		function normalize(/**String*/ str) {
			var result = "";
			var insideCharacterClass = false;
			var len = str.length;
			for (var i=0; i < len; ) {
				var chr = str.charAt(i);
				if (!insideCharacterClass && chr === "#") {
					// skip to eol
					while (i < len && chr !== "\r" && chr !== "\n") {
						chr = str.charAt(++i);
					}
				} else if (!insideCharacterClass && /\s/.test(chr)) {
					// skip whitespace
					while (i < len && /\s/.test(chr)) { 
						chr = str.charAt(++i);
					}
				} else if (chr === "\\") {
					result += chr;
					if (!/\s/.test(str.charAt(i+1))) {
						result += str.charAt(i+1);
						i += 1;
					}
					i += 1;
				} else if (chr === "[") {
					insideCharacterClass = true;
					result += chr;
					i += 1;
				} else if (chr === "]") {
					insideCharacterClass = false;
					result += chr;
					i += 1;
				} else {
					result += chr;
					i += 1;
				}
			}
			return result;
		}
		
		var flags = "";
		var i;
		
		// Handle global "x" flag (whitespace/comments)
		str = RegexUtil.processGlobalFlag("x", str, function(subexp) {
				return normalize(subexp);
			});
		
		// Handle global "i" flag (case-insensitive)
		str = RegexUtil.processGlobalFlag("i", str, function(subexp) {
				flags += "i";
				return subexp;
			});
		
		// Check for remaining unsupported syntax
		for (i=0; i < this.unsupported.length; i++) {
			var match;
			if ((match = this.unsupported[i].regex.exec(str))) {
				fail(this.unsupported[i].func(match), match);
			}
		}
		
		return new RegExp(str, flags);
	},
	
	/**
	 * Checks if flag applies to entire pattern. If so, obtains replacement string by calling processor
	 * on the unwrapped pattern. Handles 2 possible syntaxes: (?f)pat and (?f:pat)
	 */
	processGlobalFlag: function(/**String*/ flag, /**String*/ str, /**Function*/ processor) {
		function getMatchingCloseParen(/*String*/pat, /*Number*/start) {
			var depth = 0,
			    len = pat.length,
			    flagStop = -1;
			for (var i=start; i < len && flagStop === -1; i++) {
				switch (pat.charAt(i)) {
					case "\\":
						i++; // escape: skip next char
						break;
					case "(":
						depth++;
						break;
					case ")":
						depth--;
						if (depth === 0) {
							flagStop = i;
						}
						break;
				}
			}
			return flagStop;
		}
		var flag1 = "(?" + flag + ")",
		    flag2 = "(?" + flag + ":";
		if (str.substring(0, flag1.length) === flag1) {
			return processor(str.substring(flag1.length));
		} else if (str.substring(0, flag2.length) === flag2) {
			var flagStop = getMatchingCloseParen(str, 0);
			if (flagStop < str.length-1) {
				throw new Error("Only a " + flag2 + ") group that encloses the entire regex is supported in: " + str);
			}
			return processor(str.substring(flag2.length, flagStop));
		}
		return str;
	},
	
	hasBackReference: function(/**RegExp*/ regex) {
		return (/\\\d+/).test(regex.source);
	},
	
	/** @returns {RegExp} A regex made by substituting any backreferences in <code>regex</code> for the value of the property
	 * in <code>sub</code> with the same name as the backreferenced group number. */
	getSubstitutedRegex: function(/**RegExp*/ regex, /**Object*/ sub, /**Boolean*/ escape) {
		escape = (typeof escape === "undefined") ? true : false;
		var exploded = regex.source.split(/(\\\d+)/g);
		var array = [];
		for (var i=0; i < exploded.length; i++) {
			var term = exploded[i];
			var backrefMatch = /\\(\d+)/.exec(term);
			if (backrefMatch) {
				var text = sub[backrefMatch[1]] || "";
				array.push(escape ? mRegex.escape(text) : text);
			} else {
				array.push(term);
			}
		}
		return new RegExp(array.join(""));
	},
	
	/**
	 * Builds a version of <code>regex</code> with every non-capturing term converted into a capturing group. This is a workaround
	 * for JavaScript's lack of API to get the index at which a matched group begins in the input string.<p>
	 * Using the "groupified" regex, we can sum the lengths of matches from <i>consuming groups</i> 1..n-1 to obtain the 
	 * starting index of group n. (A consuming group is a capturing group that is not inside a lookahead assertion).</p>
	 * Example: groupify(/(a+)x+(b+)/) === /(a+)(x+)(b+)/<br />
	 * Example: groupify(/(?:x+(a+))b+/) === /(?:(x+)(a+))(b+)/
	 * @param {RegExp} regex The regex to groupify.
	 * @param {Object} [backRefOld2NewMap] Optional. If provided, the backreference numbers in regex will be updated using the 
	 * properties of this object rather than the new group numbers of regex itself.
	 * <ul><li>[0] {RegExp} The groupified version of the input regex.</li>
	 * <li>[1] {Object} A map containing old-group to new-group info. Each property is a capturing group number of <code>regex</code>
	 * and its value is the corresponding capturing group number of [0].</li>
	 * <li>[2] {Object} A map indicating which capturing groups of [0] are also consuming groups. If a group number is found
	 * as a property in this object, then it's a consuming group.</li></ul>
	 */
	groupify: function(regex, backRefOld2NewMap) {
		var NON_CAPTURING = 1,
		    CAPTURING = 2,
		    LOOKAHEAD = 3,
		    NEW_CAPTURING = 4;
		var src = regex.source,
		    len = src.length;
		var groups = [],
		    lookaheadDepth = 0,
		    newGroups = [],
		    oldGroupNumber = 1,
		    newGroupNumber = 1;
		var result = [],
		    old2New = {},
		    consuming = {};
		for (var i=0; i < len; i++) {
			var curGroup = groups[groups.length-1];
			var chr = src.charAt(i);
			switch (chr) {
				case "(":
					// If we're in new capturing group, close it since ( signals end-of-term
					if (curGroup === NEW_CAPTURING) {
						groups.pop();
						result.push(")");
						newGroups[newGroups.length-1].end = i;
					}
					var peek2 = (i + 2 < len) ? (src.charAt(i+1) + "" + src.charAt(i+2)) : null;
					if (peek2 === "?:" || peek2 === "?=" || peek2 === "?!") {
						// Found non-capturing group or lookahead assertion. Note that we preserve non-capturing groups
						// as such, but any term inside them will become a new capturing group (unless it happens to
						// also be inside a lookahead).
						var groupType;
						if (peek2 === "?:") {
							groupType = NON_CAPTURING;
						} else {
							groupType = LOOKAHEAD;
							lookaheadDepth++;
						}
						groups.push(groupType);
						newGroups.push({ start: i, end: -1, type: groupType /*non capturing*/ });
						result.push(chr);
						result.push(peek2);
						i += peek2.length;
					} else {
						groups.push(CAPTURING);
						newGroups.push({ start: i, end: -1, type: CAPTURING, oldNum: oldGroupNumber, num: newGroupNumber });
						result.push(chr);
						if (lookaheadDepth === 0) {
							consuming[newGroupNumber] = null;
						}
						old2New[oldGroupNumber] = newGroupNumber;
						oldGroupNumber++;
						newGroupNumber++;
					}
					break;
				case ")":
					var group = groups.pop();
					if (group === LOOKAHEAD) { lookaheadDepth--; }
					newGroups[newGroups.length-1].end = i;
					result.push(chr);
					break;
				case "*":
				case "+":
				case "?":
				case "}":
					// Unary operator. If it's being applied to a capturing group, we need to add a new capturing group
					// enclosing the pair
					var op = chr;
					var prev = src.charAt(i-1),
					    prevIndex = i-1;
					if (chr === "}") {
						for (var j=i-1; src.charAt(j) !== "{" && j >= 0; j--) {}
						prev = src.charAt(j-1);
						prevIndex = j-1;
						op = src.substring(j, i+1);
					}
					var lastGroup = newGroups[newGroups.length-1];
					if (prev === ")" && (lastGroup.type === CAPTURING || lastGroup.type === NEW_CAPTURING)) {
						// Shove in the new group's (, increment num/start in from [lastGroup.start .. end]
						result.splice(lastGroup.start, 0, "(");
						result.push(op);
						result.push(")");
						var newGroup = { start: lastGroup.start, end: result.length-1, type: NEW_CAPTURING, num: lastGroup.num };
						for (var k=0; k < newGroups.length; k++) {
							group = newGroups[k];
							if (group.type === CAPTURING || group.type === NEW_CAPTURING) {
								if (group.start >= lastGroup.start && group.end <= prevIndex) {
									group.start += 1;
									group.end += 1;
									group.num = group.num + 1;
									if (group.type === CAPTURING) {
										old2New[group.oldNum] = group.num;
									}
								}
							}
						}
						newGroups.push(newGroup);
						newGroupNumber++;
						break;
					} else {
						// Fallthrough to default
					}
				default:
					if (chr !== "|" && curGroup !== CAPTURING && curGroup !== NEW_CAPTURING) {
						// Not in a capturing group, so make a new one to hold this term.
						// Perf improvement: don't create the new group if we're inside a lookahead, since we don't 
						// care about them (nothing inside a lookahead actually consumes input so we don't need it)
						if (lookaheadDepth === 0) {
							groups.push(NEW_CAPTURING);
							newGroups.push({ start: i, end: -1, type: NEW_CAPTURING, num: newGroupNumber });
							result.push("(");
							consuming[newGroupNumber] = null;
							newGroupNumber++;
						}
					}
					result.push(chr);
					if (chr === "\\") {
						var peek = src.charAt(i+1);
						// Eat next so following iteration doesn't think it's a real special character
						result.push(peek);
						i += 1;
					}
					break;
			}
		}
		while (groups.length) {	
			// Close any remaining new capturing groups
			groups.pop();
			result.push(")");
		}
		var newRegex = new RegExp(result.join(""));
		
		// Update backreferences so they refer to the new group numbers. Use backRefOld2NewMap if provided
		var subst = {};
		backRefOld2NewMap = backRefOld2NewMap || old2New;
		for (var prop in backRefOld2NewMap) {
			if (backRefOld2NewMap.hasOwnProperty(prop)) {
				subst[prop] = "\\" + backRefOld2NewMap[prop];
			}
		}
		newRegex = this.getSubstitutedRegex(newRegex, subst, false);
		
		return [newRegex, old2New, consuming];
	},
	
	/** @returns {Boolean} True if the captures object assigns scope to a matching group other than "0". */
	complexCaptures: function(capturesObj) {
		if (!capturesObj) { return false; }
		for (var prop in capturesObj) {
			if (capturesObj.hasOwnProperty(prop)) {
				if (prop !== "0") {
					return true;
				}
			}
		}
		return false;
	}
};

	/**
	 * @private
	 * @param obj {Object} A JSON-ish object.
	 * @returns {Object} Deep copy of <code>obj</code>. Does not work on properties that are functions or RegExp instances.
	 */
	function clone(obj) {
		var c;
		if (obj instanceof Array) {
			c = new Array(obj.length);
			for (var i=0; i < obj.length; i++) {
				c[i] = clone(obj[i]);
			}
		} else {
			c = {};
			for (var prop in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, prop)) {
					var value = obj[prop];
					if (typeof value === "object" && value !== null) {
						c[prop] = clone(value);
					} else {
						c[prop] = value;
					}
				}
			}
		}
		return c;
	}

	/**
	 * @name orion.editor.TextMateStyler
	 * @class A styler that knows how to apply a subset of the TextMate grammar format to style a line.
	 *
	 * <h4>Styling from a grammar:</h4>
	 * <p>Each scope name given in the grammar is converted to an array of CSS class names. For example 
	 * a region of text with scope <code>keyword.control.php</code> will be assigned the CSS classes<br />
	 * <code>keyword, keyword-control, keyword-control-php</code></p>
	 *
	 * <p>A CSS file can give rules matching any of these class names to provide generic or more specific styling.
	 * For example,</p>
	 * <p><code>.keyword { font-color: blue; }</code></p>
	 * <p>colors all keywords blue, while</p>
	 * <p><code>.keyword-control-php { font-weight: bold; }</code></p>
	 * <p>bolds only PHP control keywords.</p>
	 *
	 * <p>This is useful when using grammars that adhere to TextMate's
	 * <a href="http://manual.macromates.com/en/language_grammars.html#naming_conventions">scope name conventions</a>,
	 * as a single CSS rule can provide consistent styling to similar constructs across different languages.</p>
	 * 
	 * <h4>Top-level grammar constructs:</h4>
	 * <ul><li><code>patterns, repository</code> (with limitations, see "Other Features") are supported.</li>
	 * <li><code>scopeName, firstLineMatch, foldingStartMarker, foldingStopMarker</code> are <b>not</b> supported.</li>
	 * <li><code>fileTypes</code> is <b>not</b> supported. When using the Orion service registry, the "orion.edit.highlighter"
	 * service serves a similar purpose.</li>
	 * </ul>
	 *
	 * <h4>Regular expression constructs:</h4>
	 * <ul>
	 * <li><code>match</code> patterns are supported.</li>
	 * <li><code>begin .. end</code> patterns are supported.</li>
	 * <li>The "extended" regex forms <code>(?x)</code> and <code>(?x:...)</code> are supported, but <b>only</b> when they 
	 * apply to the entire regex pattern.</li>
	 * <li>Matching is done using native JavaScript <code>RegExp</code>s. As a result, many features of the Oniguruma regex
	 * engine used by TextMate are <b>not</b> supported.
	 * Unsupported features include:
	 *   <ul><li>Named captures</li>
	 *   <li>Setting flags inside subgroups (eg. <code>(?i:a)b</code>)</li>
	 *   <li>Lookbehind and negative lookbehind</li>
	 *   <li>Subexpression call</li>
	 *   <li>etc.</li>
	 *   </ul>
	 * </li>
	 * </ul>
	 * 
	 * <h4>Scope-assignment constructs:</h4>
	 * <ul>
	 * <li><code>captures, beginCaptures, endCaptures</code> are supported.</li>
	 * <li><code>name</code> and <code>contentName</code> are supported.</li>
	 * </ul>
	 * 
	 * <h4>Other features:</h4>
	 * <ul>
	 * <li><code>applyEndPatternLast</code> is supported.</li>
	 * <li><code>include</code> is supported, but only when it references a rule in the current grammar's <code>repository</code>.
	 * Including <code>$self</code>, <code>$base</code>, or <code>rule.from.another.grammar</code> is <b>not</b> supported.</li>
	 * </ul>
	 * 
	 * @description Creates a new TextMateStyler.
	 * @extends orion.editor.AbstractStyler
	 * @param {orion.editor.TextView} textView The <code>TextView</code> to provide styling for.
	 * @param {Object} grammar The TextMate grammar to use for styling the <code>TextView</code>, as a JavaScript object. You can
	 * produce this object by running a PList-to-JavaScript conversion tool on a TextMate <code>.tmLanguage</code> file.
	 * @param {Object[]} [externalGrammars] Additional grammar objects that will be used to resolve named rule references.
	 */
	function TextMateStyler(textView, grammar, externalGrammars) {
		this.initialize(textView);
		// Copy grammar object(s) since we will mutate them
		this.grammar = clone(grammar);
		this.externalGrammars = externalGrammars ? clone(externalGrammars) : [];
		
		this._styles = {}; /* key: {String} scopeName, value: {String[]} cssClassNames */
		this._tree = null;
		this._allGrammars = {}; /* key: {String} scopeName of grammar, value: {Object} grammar */
		this.preprocess(this.grammar);
	}
	TextMateStyler.prototype = /** @lends orion.editor.TextMateStyler.prototype */ {
		initialize: function(textView) {
			this.textView = textView;
			this.textView.stylerOptions = this;
			var self = this;
			
			this._listener = {
				onModelChanged: function(e) {
					self.onModelChanged(e);
				},
				onDestroy: function(e) {
					self.onDestroy(e);
				},
				onLineStyle: function(e) {
					self.onLineStyle(e);
				},
				onStorage: function(e){
					self.onStorage(e);
				}
			};
			textView.addEventListener("ModelChanged", this._listener.onModelChanged);
			textView.addEventListener("Destroy", this._listener.onDestroy);
			textView.addEventListener("LineStyle", this._listener.onLineStyle);
			textView.redrawLines();
		},
		onDestroy: function(/**eclipse.DestroyEvent*/ e) {
			this.destroy();
		},
		destroy: function() {
			if (this.textView) {
				this.textView.removeEventListener("ModelChanged", this._listener.onModelChanged);
				this.textView.removeEventListener("Destroy", this._listener.onDestroy);
				this.textView.removeEventListener("LineStyle", this._listener.onLineStyle);
				this.textView = null;
			}
			this.grammar = null;
			this._styles = null;
			this._tree = null;
			this._listener = null;
		},
		/** @private */
		preprocess: function(grammar) {
			var stack = [grammar];
			for (; stack.length !== 0; ) {
				var rule = stack.pop();
				if (rule._resolvedRule && rule._typedRule) {
					continue;
				}
//					console.debug("Process " + (rule.include || rule.name));
				
				// Look up include'd rule, create typed *Rule instance
				rule._resolvedRule = this._resolve(rule);
				rule._typedRule = this._createTypedRule(rule);
				
				// Convert the scope names to styles and cache them for later
				this.addStyles(rule.name);
				this.addStyles(rule.contentName);
				this.addStylesForCaptures(rule.captures);
				this.addStylesForCaptures(rule.beginCaptures);
				this.addStylesForCaptures(rule.endCaptures);
				
				if (rule._resolvedRule !== rule) {
					// Add include target
					stack.push(rule._resolvedRule);
				}
				if (rule.patterns) {
					// Add subrules
					for (var i=0; i < rule.patterns.length; i++) {
						stack.push(rule.patterns[i]);
					}
				}
			}
		},
		
		/**
		 * @private
		 * Adds eclipse.Style objects for scope to our _styles cache.
		 * @param {String} scope A scope name, like "constant.character.php".
		 */
		addStyles: function(scope) {
			if (scope && !this._styles[scope]) {
				this._styles[scope] = [];
				var scopeArray = scope.split(".");
				for (var i = 0; i < scopeArray.length; i++) {
					this._styles[scope].push(scopeArray.slice(0, i + 1).join("-"));
				}
			}
		},
		/** @private */
		addStylesForCaptures: function(/**Object*/ captures) {
			for (var prop in captures) {
				if (captures.hasOwnProperty(prop)) {
					var scope = captures[prop].name;
					this.addStyles(scope);
				}
			}
		},
		/**
		 * A rule that contains subrules ("patterns" in TextMate parlance) but has no "begin" or "end".
		 * Also handles top level of grammar.
		 * @private
		 */
		ContainerRule: (function() {
			function ContainerRule(/**Object*/ rule) {
				this.rule = rule;
				this.subrules = rule.patterns;
			}
			ContainerRule.prototype.valueOf = function() { return "aa"; };
			return ContainerRule;
		}()),
		/**
		 * A rule that is delimited by "begin" and "end" matches, which may be separated by any number of
		 * lines. This type of rule may contain subrules, which apply only inside the begin .. end region.
		 * @private
		 */
		BeginEndRule: (function() {
			function BeginEndRule(/**Object*/ rule) {
				this.rule = rule;
				// TODO: the TextMate blog claims that "end" is optional.
				this.beginRegex = RegexUtil.toRegExp(rule.begin);
				this.endRegex = RegexUtil.toRegExp(rule.end);
				this.subrules = rule.patterns || [];
				
				this.endRegexHasBackRef = RegexUtil.hasBackReference(this.endRegex);
				
				// Deal with non-0 captures
				var complexCaptures = RegexUtil.complexCaptures(rule.captures);
				var complexBeginEnd = RegexUtil.complexCaptures(rule.beginCaptures) || RegexUtil.complexCaptures(rule.endCaptures);
				this.isComplex = complexCaptures || complexBeginEnd;
				if (this.isComplex) {
					var bg = RegexUtil.groupify(this.beginRegex);
					this.beginRegex = bg[0];
					this.beginOld2New = bg[1];
					this.beginConsuming = bg[2];
					
					var eg = RegexUtil.groupify(this.endRegex, this.beginOld2New /*Update end's backrefs to begin's new group #s*/);
					this.endRegex = eg[0];
					this.endOld2New = eg[1];
					this.endConsuming = eg[2];
				}
			}
			BeginEndRule.prototype.valueOf = function() { return this.beginRegex; };
			return BeginEndRule;
		}()),
		/**
		 * A rule with a "match" pattern.
		 * @private
		 */
		MatchRule: (function() {
			function MatchRule(/**Object*/ rule) {
				this.rule = rule;
				this.matchRegex = RegexUtil.toRegExp(rule.match);
				this.isComplex = RegexUtil.complexCaptures(rule.captures);
				if (this.isComplex) {
					var mg = RegexUtil.groupify(this.matchRegex);
					this.matchRegex = mg[0];
					this.matchOld2New = mg[1];
					this.matchConsuming = mg[2];
				}
			}
			MatchRule.prototype.valueOf = function() { return this.matchRegex; };
			return MatchRule;
		}()),
		/**
		 * @param {Object} rule A rule from the grammar.
		 * @returns {MatchRule|BeginEndRule|ContainerRule}
		 * @private
		 */
		_createTypedRule: function(rule) {
			if (rule.match) {
				return new this.MatchRule(rule);
			} else if (rule.begin) {
				return new this.BeginEndRule(rule);
			} else {
				return new this.ContainerRule(rule);
			}
		},
		/**
		 * Resolves a rule from the grammar (which may be an include) into the real rule that it points to.
		 * @private
		 */
		_resolve: function(rule) {
			var resolved = rule;
			if (rule.include) {
				if (rule.begin || rule.end || rule.match) {
					throw new Error("Unexpected regex pattern in \"include\" rule " + rule.include);
				}
				var name = rule.include;
				if (name.charAt(0) === "#") {
					resolved = this.grammar.repository && this.grammar.repository[name.substring(1)];
					if (!resolved) { throw new Error("Couldn't find included rule " + name + " in grammar repository"); }
				} else if (name === "$self") {
					resolved = this.grammar;
				} else if (name === "$base") {
					// $base is only relevant when including rules from foreign grammars
					throw new Error("Include \"$base\" is not supported"); 
				} else {
					resolved = this._allGrammars[name];
					if (!resolved) {
						for (var i=0; i < this.externalGrammars.length; i++) {
							var grammar = this.externalGrammars[i];
							if (grammar.scopeName === name) {
								this.preprocess(grammar);
								this._allGrammars[name] = grammar;
								resolved = grammar;
								break;
							}
						}
					}
				}
			}
			return resolved;
		},

		/** @private */
		ContainerNode: (function() {
			function ContainerNode(parent, rule) {
				this.parent = parent;
				this.rule = rule;
				this.children = [];
				
				this.start = null;
				this.end = null;
			}
			ContainerNode.prototype.addChild = function(child) {
				this.children.push(child);
			};
			ContainerNode.prototype.valueOf = function() {
				var r = this.rule;
				return "ContainerNode { " + (r.include || "") + " " + (r.name || "") + (r.comment || "") + "}";
			};
			return ContainerNode;
		}()),
		/** @private */
		BeginEndNode: (function() {
			function BeginEndNode(parent, rule, beginMatch) {
				this.parent = parent;
				this.rule = rule;
				this.children = [];
				
				this.setStart(beginMatch);
				this.end = null; // will be set eventually during parsing (may be EOF)
				this.endMatch = null; // may remain null if we never match our "end" pattern
				
				// Build a new regex if the "end" regex has backrefs since they refer to matched groups of beginMatch
				if (rule.endRegexHasBackRef) {
					this.endRegexSubstituted = RegexUtil.getSubstitutedRegex(rule.endRegex, beginMatch);
				} else {
					this.endRegexSubstituted = null;
				}
			}
			BeginEndNode.prototype.addChild = function(child) {
				this.children.push(child);
			};
			/** @return {Number} This node's index in its parent's "children" list */
			BeginEndNode.prototype.getIndexInParent = function(node) {
				return this.parent ? this.parent.children.indexOf(this) : -1;
			};
			/** @param {RegExp.match} beginMatch */
			BeginEndNode.prototype.setStart = function(beginMatch) {
				this.start = beginMatch.index;
				this.beginMatch = beginMatch;
			};
			/** @param {RegExp.match|Number} endMatchOrLastChar */
			BeginEndNode.prototype.setEnd = function(endMatchOrLastChar) {
				if (endMatchOrLastChar && typeof(endMatchOrLastChar) === "object") {
					var endMatch = endMatchOrLastChar;
					this.endMatch = endMatch;
					this.end = endMatch.index + endMatch[0].length;
				} else {
					var lastChar = endMatchOrLastChar;
					this.endMatch = null;
					this.end = lastChar;
				}
			};
			BeginEndNode.prototype.shiftStart = function(amount) {
				this.start += amount;
				this.beginMatch.index += amount;
			};
			BeginEndNode.prototype.shiftEnd = function(amount) {
				this.end += amount;
				if (this.endMatch) { this.endMatch.index += amount; }
			};
			BeginEndNode.prototype.valueOf = function() {
				return "{" + this.rule.beginRegex + " range=" + this.start + ".." + this.end + "}";
			};
			return BeginEndNode;
		}()),
		/** Pushes rules onto stack such that rules[startFrom] is on top
		 * @private
		 */
		push: function(/**Array*/ stack, /**Array*/ rules) {
			if (!rules) { return; }
			for (var i = rules.length; i > 0; ) {
				stack.push(rules[--i]);
			}
		},
		/** Executes <code>regex</code> on <code>text</code>, and returns the match object with its index 
		 * offset by the given amount.
		 * @returns {RegExp.match}
		 * @private
		 */
		exec: function(/**RegExp*/ regex, /**String*/ text, /**Number*/ offset) {
			var match = regex.exec(text);
			if (match) { match.index += offset; }
			regex.lastIndex = 0; // Just in case
			return match;
		},
		/** @returns {Number} The position immediately following the match.
		 * @private
		 */
		afterMatch: function(/**RegExp.match*/ match) {
			return match.index + match[0].length;
		},
		/**
		 * @returns {RegExp.match} If node is a BeginEndNode and its rule's "end" pattern matches the text.
		 * @private
		 */
		getEndMatch: function(/**Node*/ node, /**String*/ text, /**Number*/ offset) {
			if (node instanceof this.BeginEndNode) {
				var rule = node.rule;
				var endRegex = node.endRegexSubstituted || rule.endRegex;
				if (!endRegex) { return null; }
				return this.exec(endRegex, text, offset);
			}
			return null;
		},
		/** Called once when file is first loaded to build the parse tree. Tree is updated incrementally thereafter 
		 * as buffer is modified.
		 * @private
		 */
		initialParse: function() {
			var last = this.textView.getModel().getCharCount();
			// First time; make parse tree for whole buffer
			var root = new this.ContainerNode(null, this.grammar._typedRule);
			this._tree = root;
			this.parse(this._tree, false, 0);
		},
		onModelChanged: function(/**eclipse.ModelChangedEvent*/ e) {
			var addedCharCount = e.addedCharCount,
			    addedLineCount = e.addedLineCount,
			    removedCharCount = e.removedCharCount,
			    removedLineCount = e.removedLineCount,
			    start = e.start;
			if (!this._tree) {
				this.initialParse();
			} else {
				var model = this.textView.getModel();
				var charCount = model.getCharCount();
				
				// For rs, we must rewind to the line preceding the line 'start' is on. We can't rely on start's
				// line since it may've been changed in a way that would cause a new beginMatch at its lineStart.
				var rs = model.getLineEnd(model.getLineAtOffset(start) - 1); // may be < 0
				var fd = this.getFirstDamaged(rs, rs);
				rs = rs === -1 ? 0 : rs;
				var stoppedAt;
				if (fd) {
					// [rs, re] is the region we need to verify. If we find the structure of the tree
					// has changed in that area, then we may need to reparse the rest of the file.
					stoppedAt = this.parse(fd, true, rs, start, addedCharCount, removedCharCount);
				} else {
					// FIXME: fd == null ?
					stoppedAt = charCount;
				}
				this.textView.redrawRange(rs, stoppedAt);
			}
		},
		/** @returns {BeginEndNode|ContainerNode} The result of taking the first (smallest "start" value) 
		 * node overlapping [start,end] and drilling down to get its deepest damaged descendant (if any).
		 * @private
		 */
		getFirstDamaged: function(start, end) {
			// If start === 0 we actually have to start from the root because there is no position
			// we can rely on. (First index is damaged)
			if (start < 0) {
				return this._tree;
			}
			
			var nodes = [this._tree];
			var result = null;
			while (nodes.length) {
				var n = nodes.pop();
				if (!n.parent /*n is root*/ || this.isDamaged(n, start, end)) {
					// n is damaged by the edit, so go into its children
					// Note: If a node is damaged, then some of its descendents MAY be damaged
					// If a node is undamaged, then ALL of its descendents are undamaged
					if (n instanceof this.BeginEndNode) {
						result = n;
					}
					// Examine children[0] last
					for (var i=0; i < n.children.length; i++) {
						nodes.push(n.children[i]);
					}
				}
			}
			return result || this._tree;
		},
		/** @returns true If <code>n</code> overlaps the interval [start,end].
		 * @private
		 */
		isDamaged: function(/**BeginEndNode*/ n, start, end) {
			// Note strict > since [2,5] doesn't overlap [5,7]
			return (n.start <= end && n.end > start);
		},
		/**
		 * Builds tree from some of the buffer content
		 *
		 * TODO cleanup params
		 * @param {BeginEndNode|ContainerNode} origNode The deepest node that overlaps [rs,rs], or the root.
		 * @param {Boolean} repairing 
		 * @param {Number} rs See _onModelChanged()
		 * @param {Number} [editStart] Only used for repairing === true
		 * @param {Number} [addedCharCount] Only used for repairing === true
		 * @param {Number} [removedCharCount] Only used for repairing === true
		 * @returns {Number} The end position that redrawRange should be called for.
		 * @private
		 */
		parse: function(origNode, repairing, rs, editStart, addedCharCount, removedCharCount) {
			var model = this.textView.getModel();
			var lastLineStart = model.getLineStart(model.getLineCount() - 1);
			var eof = model.getCharCount();
			var initialExpected = this.getInitialExpected(origNode, rs);
			
			// re is best-case stopping point; if we detect change to tree, we must continue past it
			var re = -1;
			if (repairing) {
				origNode.repaired = true;
				origNode.endNeedsUpdate = true;
				var lastChild = origNode.children[origNode.children.length-1];
				var delta = addedCharCount - removedCharCount;
				var lastChildLineEnd = lastChild ? model.getLineEnd(model.getLineAtOffset(lastChild.end + delta)) : -1;
				var editLineEnd = model.getLineEnd(model.getLineAtOffset(editStart + removedCharCount));
				re = Math.max(lastChildLineEnd, editLineEnd);
			}
			re = (re === -1) ? eof : re;
			
			var expected = initialExpected;
			var node = origNode;
			var matchedChildOrEnd = false;
			var pos = rs;
			var redrawEnd = -1;
			while (node && (!repairing || (pos < re))) {
				var matchInfo = this.getNextMatch(model, node, pos);
				if (!matchInfo) {
					// Go to next line, if any
					pos = (pos >= lastLineStart) ? eof : model.getLineStart(model.getLineAtOffset(pos) + 1);
				}
				var match = matchInfo && matchInfo.match,
				    rule = matchInfo && matchInfo.rule,
				    isSub = matchInfo && matchInfo.isSub,
				    isEnd = matchInfo && matchInfo.isEnd;
				if (isSub) {
					pos = this.afterMatch(match);
					if (rule instanceof this.BeginEndRule) {
						matchedChildOrEnd = true;
						// Matched a child. Did we expect that?
						if (repairing && rule === expected.rule && node === expected.parent) {
							// Yes: matched expected child
							var foundChild = expected;
							foundChild.setStart(match);
							// Note: the 'end' position for this node will either be matched, or fixed up by us post-loop
							foundChild.repaired = true;
							foundChild.endNeedsUpdate = true;
							node = foundChild; // descend
							expected = this.getNextExpected(expected, "begin");
						} else {
							if (repairing) {
								// No: matched unexpected child.
								this.prune(node, expected);
								repairing = false;
							}
							
							// Add the new child (will replace 'expected' in node's children list)
							var subNode = new this.BeginEndNode(node, rule, match);
							node.addChild(subNode);
							node = subNode; // descend
						}
					} else {
						// Matched a MatchRule; no changes to tree required
					}
				} else if (isEnd || pos === eof) {
					if (node instanceof this.BeginEndNode) {
						if (match) {
							matchedChildOrEnd = true;
							redrawEnd = Math.max(redrawEnd, node.end); // if end moved up, must still redraw to its old value
							node.setEnd(match);
							pos = this.afterMatch(match);
							// Matched node's end. Did we expect that?
							if (repairing && node === expected && node.parent === expected.parent) {
								// Yes: found the expected end of node
								node.repaired = true;
								delete node.endNeedsUpdate;
								expected = this.getNextExpected(expected, "end");
							} else {
								if (repairing) {
									// No: found an unexpected end
									this.prune(node, expected);
									repairing = false;
								}
							}
						} else {
							// Force-ending a BeginEndNode that runs until eof
							node.setEnd(eof);
							delete node.endNeedsUpdate;
						}
					}
					node = node.parent; // ascend
				}
				
				if (repairing && pos >= re && !matchedChildOrEnd) {
					// Reached re without matching any begin/end => initialExpected itself was removed => repair fail
					this.prune(origNode, initialExpected);
					repairing = false;
				}
			} // end loop
			// TODO: do this for every node we end?
			this.removeUnrepairedChildren(origNode, repairing, rs);
			
			//console.debug("parsed " + (pos - rs) + " of " + model.getCharCount + "buf");
			this.cleanup(repairing, origNode, rs, re, eof, addedCharCount, removedCharCount);
			if (repairing) {
				return Math.max(redrawEnd, pos);
			} else {
				return pos; // where we stopped reparsing
			}
		},
		/** Helper for parse() in the repair case. To be called when ending a node, as any children that
		 * lie in [rs,node.end] and were not repaired must've been deleted.
		 * @private
		 */
		removeUnrepairedChildren: function(node, repairing, start) {
			if (repairing) {
				var children = node.children;
				var removeFrom = -1;
				for (var i=0; i < children.length; i++) {
					var child = children[i];
					if (!child.repaired && this.isDamaged(child, start, Number.MAX_VALUE /*end doesn't matter*/)) {
						removeFrom = i;
						break;
					}
				}
				if (removeFrom !== -1) {
					node.children.length = removeFrom;
				}
			}
		},
		/** Helper for parse() in the repair case
		 * @private
		 */
		cleanup: function(repairing, origNode, rs, re, eof, addedCharCount, removedCharCount) {
			var i, node, maybeRepairedNodes;
			if (repairing) {
				// The repair succeeded, so update stale begin/end indices by simple translation.
				var delta = addedCharCount - removedCharCount;
				// A repaired node's end can't exceed re, but it may exceed re-delta+1.
				// TODO: find a way to guarantee disjoint intervals for repaired vs unrepaired, then stop using flag
				var maybeUnrepairedNodes = this.getIntersecting(re-delta+1, eof);
				maybeRepairedNodes = this.getIntersecting(rs, re);
				// Handle unrepaired nodes. They are those intersecting [re-delta+1, eof] that don't have the flag
				for (i=0; i < maybeUnrepairedNodes.length; i++) {
					node = maybeUnrepairedNodes[i];
					if (!node.repaired && node instanceof this.BeginEndNode) {
						node.shiftEnd(delta);
						node.shiftStart(delta);
					}
				}
				// Translate 'end' index of repaired node whose 'end' was not matched in loop (>= re)
				for (i=0; i < maybeRepairedNodes.length; i++) {
					node = maybeRepairedNodes[i];
					if (node.repaired && node.endNeedsUpdate) {
						node.shiftEnd(delta);
					}
					delete node.endNeedsUpdate;
					delete node.repaired;
				}
			} else {
				// Clean up after ourself
				maybeRepairedNodes = this.getIntersecting(rs, re);
				for (i=0; i < maybeRepairedNodes.length; i++) {
					delete maybeRepairedNodes[i].repaired;
				}
			}
		},
		/**
		 * @param model {orion.editor.TextModel}
		 * @param {Node} node
		 * @param {Number} pos
		 * @param {Boolean} [matchRulesOnly] Optional, if true only "match" subrules will be considered.
		 * @returns {Object} A match info object with properties:
		 * {Boolean} isEnd
		 * {Boolean} isSub
		 * {RegExp.match} match
		 * {(Match|BeginEnd)Rule} rule
		 * @private
		 */
		getNextMatch: function(model, node, pos, matchRulesOnly) {
			var lineIndex = model.getLineAtOffset(pos);
			var lineEnd = model.getLineEnd(lineIndex);
			var line = model.getText(pos, lineEnd);

			var stack = [],
			    expandedContainers = [],
			    subMatches = [],
			    subrules = [];
			this.push(stack, node.rule.subrules);
			while (stack.length) {
				var next = stack.length ? stack.pop() : null;
				var subrule = next && next._resolvedRule._typedRule;
				if (subrule instanceof this.ContainerRule && expandedContainers.indexOf(subrule) === -1) {
					// Expand ContainerRule by pushing its subrules on
					expandedContainers.push(subrule);
					this.push(stack, subrule.subrules);
					continue;
				}
				if (subrule && matchRulesOnly && !(subrule.matchRegex)) {
					continue;
				}
				var subMatch = subrule && this.exec(subrule.matchRegex || subrule.beginRegex, line, pos);
				if (subMatch) {
					subMatches.push(subMatch);
					subrules.push(subrule);
				}
			}

			var bestSub = Number.MAX_VALUE,
			    bestSubIndex = -1;
			for (var i=0; i < subMatches.length; i++) {
				var match = subMatches[i];
				if (match.index < bestSub) {
					bestSub = match.index;
					bestSubIndex = i;
				}
			}
			
			if (!matchRulesOnly) {
				// See if the "end" pattern of the active begin/end node matches.
				// TODO: The active begin/end node may not be the same as the node that holds the subrules
				var activeBENode = node;
				var endMatch = this.getEndMatch(node, line, pos);
				if (endMatch) {
					var doEndLast = activeBENode.rule.applyEndPatternLast;
					var endWins = bestSubIndex === -1 || (endMatch.index < bestSub) || (!doEndLast && endMatch.index === bestSub);
					if (endWins) {
						return {isEnd: true, rule: activeBENode.rule, match: endMatch};
					}
				}
			}
			return bestSubIndex === -1 ? null : {isSub: true, rule: subrules[bestSubIndex], match: subMatches[bestSubIndex]};
		},
		/**
		 * Gets the node corresponding to the first match we expect to see in the repair.
		 * @param {BeginEndNode|ContainerNode} node The node returned via getFirstDamaged(rs,rs) -- may be the root.
		 * @param {Number} rs See _onModelChanged()
		 * Note that because rs is a line end (or 0, a line start), it will intersect a beginMatch or 
		 * endMatch either at their 0th character, or not at all. (begin/endMatches can't cross lines).
		 * This is the only time we rely on the start/end values from the pre-change tree. After this 
		 * we only look at node ordering, never use the old indices.
		 * @returns {Node}
		 * @private
		 */
		getInitialExpected: function(node, rs) {
			// TODO: Kind of weird.. maybe ContainerNodes should have start & end set, like BeginEndNodes
			var i, child;
			if (node === this._tree) {
				// get whichever of our children comes after rs
				for (i=0; i < node.children.length; i++) {
					child = node.children[i]; // BeginEndNode
					if (child.start >= rs) {
						return child;
					}
				}
			} else if (node instanceof this.BeginEndNode) {
				if (node.endMatch) {
					// Which comes next after rs: our nodeEnd or one of our children?
					var nodeEnd = node.endMatch.index;
					for (i=0; i < node.children.length; i++) {
						child = node.children[i]; // BeginEndNode
						if (child.start >= rs) {
							break;
						}
					}
					if (child && child.start < nodeEnd) {
						return child; // Expect child as the next match
					}
				} else {
					// No endMatch => node goes until eof => it end should be the next match
				}
			}
			return node; // We expect node to end, so it should be the next match
		},
		/**
		 * Helper for repair() to tell us what kind of event we expect next.
		 * @param {Node} expected Last value returned by this method.
		 * @param {String} event "begin" if the last value of expected was matched as "begin",
		 *  or "end" if it was matched as an end.
		 * @returns {Node} The next expected node to match, or null.
		 * @private
		 */
		getNextExpected: function(/**Node*/ expected, event) {
			var node = expected;
			if (event === "begin") {
				var child = node.children[0];
				if (child) {
					return child;
				} else {
					return node;
				}
			} else if (event === "end") {
				var parent = node.parent;
				if (parent) {
					var nextSibling = parent.children[parent.children.indexOf(node) + 1];
					if (nextSibling) {
						return nextSibling;
					} else {
						return parent;
					}
				}
			}
			return null;
		},
		/** Helper for parse() when repairing. Prunes out the unmatched nodes from the tree so we can continue parsing.
		 * @private
		 */
		prune: function(/**BeginEndNode|ContainerNode*/ node, /**Node*/ expected) {
			var expectedAChild = expected.parent === node;
			if (expectedAChild) {
				// Expected child wasn't matched; prune it and all siblings after it
				node.children.length = expected.getIndexInParent();
			} else if (node instanceof this.BeginEndNode) {
				// Expected node to end but it didn't; set its end unknown and we'll match it eventually
				node.endMatch = null;
				node.end = null;
			}
			// Reparsing from node, so prune the successors outside of node's subtree
			if (node.parent) {
				node.parent.children.length = node.getIndexInParent() + 1;
			}
		},
		onLineStyle: function(/**eclipse.LineStyleEvent*/ e) {
			function byStart(r1, r2) {
				return r1.start - r2.start;
			}
			
			if (!this._tree) {
				// In some cases it seems onLineStyle is called before onModelChanged, so we need to parse here
				this.initialParse();
			}
			var lineStart = e.lineStart,
			    model = this.textView.getModel(),
			    lineEnd = model.getLineEnd(e.lineIndex);
			
			var rs = model.getLineEnd(model.getLineAtOffset(lineStart) - 1); // may be < 0
			var node = this.getFirstDamaged(rs, rs);
			
			var scopes = this.getLineScope(model, node, lineStart, lineEnd);
			e.ranges = this.toStyleRanges(scopes);
			// Editor requires StyleRanges must be in ascending order by 'start', or else some will be ignored
			e.ranges.sort(byStart);
		},
		/** Runs parse algorithm on [start, end] in the context of node, assigning scope as we find matches.
		 * @private
		 */
		getLineScope: function(model, node, start, end) {
			var pos = start;
			var expected = this.getInitialExpected(node, start);
			var scopes = [],
			    gaps = [];
			while (node && (pos < end)) {
				var matchInfo = this.getNextMatch(model, node, pos);
				if (!matchInfo) { 
					break; // line is over
				}
				var match = matchInfo && matchInfo.match,
				    rule = matchInfo && matchInfo.rule,
				    isSub = matchInfo && matchInfo.isSub,
				    isEnd = matchInfo && matchInfo.isEnd;
				if (match.index !== pos) {
					// gap [pos..match.index]
					gaps.push({ start: pos, end: match.index, node: node});
				}
				if (isSub) {
					pos = this.afterMatch(match);
					if (rule instanceof this.BeginEndRule) {
						// Matched a "begin", assign its scope and descend into it
						this.addBeginScope(scopes, match, rule);
						node = expected; // descend
						expected = this.getNextExpected(expected, "begin");
					} else {
						// Matched a child MatchRule;
						this.addMatchScope(scopes, match, rule);
					}
				} else if (isEnd) {
					pos = this.afterMatch(match);
					// Matched and "end", assign its end scope and go up
					this.addEndScope(scopes, match, rule);
					expected = this.getNextExpected(expected, "end");
					node = node.parent; // ascend
				}
			}
			if (pos < end) {
				gaps.push({ start: pos, end: end, node: node });
			}
			var inherited = this.getInheritedLineScope(gaps, start, end);
			return scopes.concat(inherited);
		},
		/** @private */
		getInheritedLineScope: function(gaps, start, end) {
			var scopes = [];
			for (var i=0; i < gaps.length; i++) {
				var gap = gaps[i];
				var node = gap.node;
				while (node) {
					// if node defines a contentName or name, apply it
					var rule = node.rule.rule;
					var name = rule.name,
					    contentName = rule.contentName;
					// TODO: if both are given, we don't resolve the conflict. contentName always wins
					var scope = contentName || name;
					if (scope) {
						this.addScopeRange(scopes, gap.start, gap.end, scope);
						break;
					}
					node = node.parent;
				}
			}
			return scopes;
		},
		/** @private */
		addBeginScope: function(scopes, match, typedRule) {
			var rule = typedRule.rule;
			this.addCapturesScope(scopes, match, (rule.beginCaptures || rule.captures), typedRule.isComplex, typedRule.beginOld2New, typedRule.beginConsuming);
		},
		/** @private */
		addEndScope: function(scopes, match, typedRule) {
			var rule = typedRule.rule;
			this.addCapturesScope(scopes, match, (rule.endCaptures || rule.captures), typedRule.isComplex, typedRule.endOld2New, typedRule.endConsuming);
		},
		/** @private */
		addMatchScope: function(scopes, match, typedRule) {
			var rule = typedRule.rule,
			    name = rule.name,
			    captures = rule.captures;
			if (captures) {	
				// captures takes priority over name
				this.addCapturesScope(scopes, match, captures, typedRule.isComplex, typedRule.matchOld2New, typedRule.matchConsuming);
			} else {
				this.addScope(scopes, match, name);
			}
		},
		/** @private */
		addScope: function(scopes, match, name) {
			if (!name) { return; }
			scopes.push({start: match.index, end: this.afterMatch(match), scope: name });
		},
		/** @private */
		addScopeRange: function(scopes, start, end, name) {
			if (!name) { return; }
			scopes.push({start: start, end: end, scope: name });
		},
		/** @private */
		addCapturesScope: function(/**Array*/scopes, /*RegExp.match*/ match, /**Object*/captures, /**Boolean*/isComplex, /**Object*/old2New, /**Object*/consuming) {
			if (!captures) { return; }
			if (!isComplex) {
				this.addScope(scopes, match, captures[0] && captures[0].name);
			} else {
				// apply scopes captures[1..n] to matching groups [1]..[n] of match
				
				// Sum up the lengths of preceding consuming groups to get the start offset for each matched group.
				var newGroupStarts = {1: 0};
				var sum = 0;
				for (var num = 1; match[num] !== undefined; num++) {
					if (consuming[num] !== undefined) {
						sum += match[num].length;
					}
					if (match[num+1] !== undefined) {
						newGroupStarts[num + 1] = sum;
					}
				}
				// Map the group numbers referred to in captures object to the new group numbers, and get the actual matched range.
				var start = match.index;
				for (var oldGroupNum = 1; captures[oldGroupNum]; oldGroupNum++) {
					var scope = captures[oldGroupNum].name;
					var newGroupNum = old2New[oldGroupNum];
					var groupStart = start + newGroupStarts[newGroupNum];
					// Not every capturing group defined in regex need match every time the regex is run.
					// eg. (a)|b matches "b" but group 1 is undefined
					if (typeof match[newGroupNum] !== "undefined") {
						var groupEnd = groupStart + match[newGroupNum].length;
						this.addScopeRange(scopes, groupStart, groupEnd, scope);
					}
				}
			}
		},
		/** @returns {Node[]} In depth-first order
		 * @private
		 */
		getIntersecting: function(start, end) {
			var result = [];
			var nodes = this._tree ? [this._tree] : [];
			while (nodes.length) {
				var n = nodes.pop();
				var visitChildren = false;
				if (n instanceof this.ContainerNode) {
					visitChildren = true;
				} else if (this.isDamaged(n, start, end)) {
					visitChildren = true;
					result.push(n);
				}
				if (visitChildren) {
					var len = n.children.length;
//					for (var i=len-1; i >= 0; i--) {
//						nodes.push(n.children[i]);
//					}
					for (var i=0; i < len; i++) {
						nodes.push(n.children[i]);
					}
				}
			}
			return result.reverse();
		},
		/**
		 * Applies the grammar to obtain the {@link eclipse.StyleRange[]} for the given line.
		 * @returns {eclipse.StyleRange[]}
		 * @private
		 */
		toStyleRanges: function(/**ScopeRange[]*/ scopeRanges) {
			var styleRanges = [];
			for (var i=0; i < scopeRanges.length; i++) {
				var scopeRange = scopeRanges[i];
				var classNames = this._styles[scopeRange.scope];
				if (!classNames) { throw new Error("styles not found for " + scopeRange.scope); }
				var classNamesString = classNames.join(" ");
				styleRanges.push({start: scopeRange.start, end: scopeRange.end, style: {styleClass: classNamesString}});
//				console.debug("{start " + styleRanges[i].start + ", end " + styleRanges[i].end + ", style: " + styleRanges[i].style.styleClass + "}");
			}
			return styleRanges;
		}
	};
	
	return {
		RegexUtil: RegexUtil,
		TextMateStyler: TextMateStyler
	};
});

/******************************************************************************* 
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation 
 ******************************************************************************/

/*jslint */
/*global define */

define("orion/editor/htmlGrammar", [], function() {

	/**
	 * Provides a grammar that can do some very rough syntax highlighting for HTML.
	 * @class orion.syntax.HtmlGrammar
	 */
	function HtmlGrammar() {
		/**
		 * Object containing the grammar rules.
		 * @public
		 * @type Object
		 */
		return {
			"scopeName": "source.html",
			"uuid": "3B5C76FB-EBB5-D930-F40C-047D082CE99B",
			"patterns": [
				{
					"begin": "<!(doctype|DOCTYPE)",
					"end": ">",
					"contentName": "entity.name.tag.doctype.html",
					"beginCaptures": {
						"0": { "name": "entity.name.tag.doctype.html" }
					},
					"endCaptures": {
						"0": { "name": "entity.name.tag.doctype.html" }
					}
				},
				{
					"begin": "<!--",
					"end": "-->",
					"beginCaptures": {
						"0": { "name": "punctuation.definition.comment.html" }
					},
					"endCaptures": {
						"0": { "name": "punctuation.definition.comment.html" }
					},
					"patterns": [
						{
							"match": "--",
							"name": "invalid.illegal.badcomment.html"
						}
					],
					"contentName": "comment.block.html"
				},
				{ // startDelimiter + tagName
					"match": "<[A-Za-z0-9_\\-:]+(?= ?)",
					"name": "entity.name.tag.html"
				},
				{ "include": "#attrName" },
				{ "include": "#qString" },
				{ "include": "#qqString" },
				{ "include": "#entity" },
				// TODO attrName, qString, qqString should be applied first while inside a tag
				{ // startDelimiter + slash + tagName + endDelimiter
					"match": "</[A-Za-z0-9_\\-:]+>",
					"name": "entity.name.tag.html"
				},
				{ // end delimiter of open tag
					"match": ">", 
					"name": "entity.name.tag.html"
				} ],
			"repository": {
				"attrName": { // attribute name
					"match": "[A-Za-z\\-:]+(?=\\s*=\\s*['\"])",
					"name": "entity.other.attribute.name.html"
				},
				"qqString": { // double quoted string
					"match": "(\")[^\"]+(\")",
					"name": "string.quoted.double.html"
				},
				"qString": { // single quoted string
					"match": "(')[^']+(\')",
					"name": "string.quoted.single.html"
				},
				"entity": {
					"match": "&[A-Za-z0-9]+;",
					"name": "constant.character.entity.html"
				}
			}
		};
	}

	return {HtmlGrammar: HtmlGrammar};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 *               Alex Lakatos - fix for bug#369781
 ******************************************************************************/

/*global define */

define("examples/editor/textStyler", ['orion/editor/annotations'], function(mAnnotations) {

	var JS_KEYWORDS =
		["break",
		 "case", "class", "catch", "continue", "const", 
		 "debugger", "default", "delete", "do",
		 "else", "enum", "export", "extends",  
		 "false", "finally", "for", "function",
		 "if", "implements", "import", "in", "instanceof", "interface", 
		 "let",
		 "new", "null",
		 "package", "private", "protected", "public",
		 "return", 
		 "static", "super", "switch",
		 "this", "throw", "true", "try", "typeof",
		 "undefined",
		 "var", "void",
		 "while", "with",
		 "yield"];

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
		["alignment-adjust", "alignment-baseline", "animation", "animation-delay", "animation-direction", "animation-duration",
		 "animation-iteration-count", "animation-name", "animation-play-state", "animation-timing-function", "appearance",
		 "azimuth", "backface-visibility", "background", "background-attachment", "background-clip", "background-color",
		 "background-image", "background-origin", "background-position", "background-repeat", "background-size", "baseline-shift",
		 "binding", "bleed", "bookmark-label", "bookmark-level", "bookmark-state", "bookmark-target", "border", "border-bottom",
		 "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width",
		 "border-collapse", "border-color", "border-image", "border-image-outset", "border-image-repeat", "border-image-slice",
		 "border-image-source", "border-image-width", "border-left", "border-left-color", "border-left-style", "border-left-width",
		 "border-radius", "border-right", "border-right-color", "border-right-style", "border-right-width", "border-spacing", "border-style",
		 "border-top", "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width",
		 "border-width", "bottom", "box-align", "box-decoration-break", "box-direction", "box-flex", "box-flex-group", "box-lines",
		 "box-ordinal-group", "box-orient", "box-pack", "box-shadow", "box-sizing", "break-after", "break-before", "break-inside",
		 "caption-side", "clear", "clip", "color", "color-profile", "column-count", "column-fill", "column-gap", "column-rule",
		 "column-rule-color", "column-rule-style", "column-rule-width", "column-span", "column-width", "columns", "content", "counter-increment",
		 "counter-reset", "crop", "cue", "cue-after", "cue-before", "cursor", "direction", "display", "dominant-baseline",
		 "drop-initial-after-adjust", "drop-initial-after-align", "drop-initial-before-adjust", "drop-initial-before-align", "drop-initial-size",
		 "drop-initial-value", "elevation", "empty-cells", "fit", "fit-position", "flex-align", "flex-flow", "flex-inline-pack", "flex-order",
		 "flex-pack", "float", "float-offset", "font", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style",
		 "font-variant", "font-weight", "grid-columns", "grid-rows", "hanging-punctuation", "height", "hyphenate-after",
		 "hyphenate-before", "hyphenate-character", "hyphenate-lines", "hyphenate-resource", "hyphens", "icon", "image-orientation",
		 "image-rendering", "image-resolution", "inline-box-align", "left", "letter-spacing", "line-height", "line-stacking",
		 "line-stacking-ruby", "line-stacking-shift", "line-stacking-strategy", "list-style", "list-style-image", "list-style-position",
		 "list-style-type", "margin", "margin-bottom", "margin-left", "margin-right", "margin-top", "mark", "mark-after", "mark-before",
		 "marker-offset", "marks", "marquee-direction", "marquee-loop", "marquee-play-count", "marquee-speed", "marquee-style", "max-height",
		 "max-width", "min-height", "min-width", "move-to", "nav-down", "nav-index", "nav-left", "nav-right", "nav-up", "opacity", "orphans",
		 "outline", "outline-color", "outline-offset", "outline-style", "outline-width", "overflow", "overflow-style", "overflow-x",
		 "overflow-y", "padding", "padding-bottom", "padding-left", "padding-right", "padding-top", "page", "page-break-after", "page-break-before",
		 "page-break-inside", "page-policy", "pause", "pause-after", "pause-before", "perspective", "perspective-origin", "phonemes", "pitch",
		 "pitch-range", "play-during", "position", "presentation-level", "punctuation-trim", "quotes", "rendering-intent", "resize",
		 "rest", "rest-after", "rest-before", "richness", "right", "rotation", "rotation-point", "ruby-align", "ruby-overhang", "ruby-position",
		 "ruby-span", "size", "speak", "speak-header", "speak-numeral", "speak-punctuation", "speech-rate", "stress", "string-set", "table-layout",
		 "target", "target-name", "target-new", "target-position", "text-align", "text-align-last", "text-decoration", "text-emphasis",
		 "text-height", "text-indent", "text-justify", "text-outline", "text-shadow", "text-transform", "text-wrap", "top", "transform",
		 "transform-origin", "transform-style", "transition", "transition-delay", "transition-duration", "transition-property",
		 "transition-timing-function", "unicode-bidi", "vertical-align", "visibility", "voice-balance", "voice-duration", "voice-family",
		 "voice-pitch", "voice-pitch-range", "voice-rate", "voice-stress", "voice-volume", "volume", "white-space", "white-space-collapse",
		 "widows", "width", "word-break", "word-spacing", "word-wrap", "z-index"
		];

	// Scanner constants
	var UNKOWN = 1;
	var KEYWORD = 2;
	var NUMBER = 3;
	var STRING = 4;
	var MULTILINE_STRING = 5;
	var SINGLELINE_COMMENT = 6;
	var MULTILINE_COMMENT = 7;
	var DOC_COMMENT = 8;
	var WHITE = 9;
	var WHITE_TAB = 10;
	var WHITE_SPACE = 11;
	var HTML_MARKUP = 12;
	var DOC_TAG = 13;
	var TASK_TAG = 14;
	
	var BRACKETS = "{}()[]<>";

	// Styles 
	var singleCommentStyle = {styleClass: "comment"};
	var multiCommentStyle = {styleClass: "token_multiline_comment"};
	var docCommentStyle = {styleClass: "token_doc_comment"};
	var htmlMarkupStyle = {styleClass: "token_doc_html_markup"};
	var tasktagStyle = {styleClass: "token_task_tag"};
	var doctagStyle = {styleClass: "token_doc_tag"};
	var stringStyle = {styleClass: "token_string"};
	var numberStyle = {styleClass: "token_number"};
	var keywordStyle = {styleClass: "token_keyword"};
	var spaceStyle = {styleClass: "token_space"};
	var tabStyle = {styleClass: "token_tab"};
	var caretLineStyle = {styleClass: "line_caret"};
	
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
		_default: function(c) {
			switch (c) {
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
				case 123: // {
				case 125: // }
				case 40: // (
				case 41: // )
				case 91: // [
				case 93: // ]
				case 60: // <
				case 62: // >
					// BRACKETS
					return c;
				default:
					var isCSS = this.isCSS;
					var off = this.offset - 1;
					if (!isCSS && 48 <= c && c <= 57) {
						var floating = false, exponential = false, hex = false, firstC = c;
						do {
							c = this._read();
							if (c === 46 /* dot */ && !floating) {
								floating = true;
							} else if (c === 101 /* e */ && !exponential) {
								floating = exponential = true;
								c = this._read();
								if (c !== 45 /* MINUS */) {
									this._unread(c);
								}
							} else if (c === 120 /* x */ && firstC === 48 && (this.offset - off === 2)) {
								floating = exponential = hex = true;
							} else if (!(48 <= c && c <= 57 || (hex && ((65 <= c && c <= 70) || (97 <= c && c <= 102))))) { //NUMBER DIGIT or HEX
								break;
							}
						} while(true);
						this._unread(c);
						return NUMBER;
					}
					if ((97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || (45 /* DASH */ === c && isCSS)) { //LETTER OR UNDERSCORE OR NUMBER
						do {
							c = this._read();
						} while((97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || (48 <= c && c <= 57) || (45 /* DASH */ === c && isCSS));  //LETTER OR UNDERSCORE OR NUMBER
						this._unread(c);
						var keywords = this.keywords;
						if (keywords.length > 0) {
							var word = this.text.substring(off, this.offset);
							//TODO slow
							for (var i=0; i<keywords.length; i++) {
								if (this.keywords[i] === word) { return KEYWORD; }
							}
						}
					}
					return UNKOWN;
			}
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
				var c = this._read(), result;
				switch (c) {
					case -1: return null;
					case 47:	// SLASH -> comment
						c = this._read();
						if (!this.isCSS) {
							if (c === 47) { // SLASH -> single line
								while (true) {
									c = this._read();
									if ((c === -1) || (c === 10) || (c === 13)) {
										this._unread(c);
										return SINGLELINE_COMMENT;
									}
								}
							}
						}
						if (c === 42) { // STAR -> multi line 
							c = this._read();
							var token = MULTILINE_COMMENT;
							if (c === 42) {
								token = DOC_COMMENT;
							}
							while (true) {
								while (c === 42) {
									c = this._read();
									if (c === 47) {
										return token;
									}
								}
								if (c === -1) {
									this._unread(c);
									return token;
								}
								c = this._read();
							}
						}
						this._unread(c);
						return UNKOWN;
					case 39:	// SINGLE QUOTE -> char const
						result = STRING;
						while(true) {
							c = this._read();
							switch (c) {
								case 39:
									return result;
								case 13:
								case 10:
								case -1:
									this._unread(c);
									return result;
								case 92: // BACKSLASH
									c = this._read();
									switch (c) {
										case 10: result = MULTILINE_STRING; break;
										case 13:
											result = MULTILINE_STRING;
											c = this._read();
											if (c !== 10) {
												this._unread(c);
											}
											break;
									}
									break;
							}
						}
						break;
					case 34:	// DOUBLE QUOTE -> string
						result = STRING;
						while(true) {
							c = this._read();
							switch (c) {
								case 34: // DOUBLE QUOTE
									return result;
								case 13:
								case 10:
								case -1:
									this._unread(c);
									return result;
								case 92: // BACKSLASH
									c = this._read();
									switch (c) {
										case 10: result = MULTILINE_STRING; break;
										case 13:
											result = MULTILINE_STRING;
											c = this._read();
											if (c !== 10) {
												this._unread(c);
											}
											break;
									}
									break;
							}
						}
						break;
					default:
						return this._default(c);
				}
			}
		},
		setText: function(text) {
			this.text = text;
			this.offset = 0;
			this.startOffset = 0;
		}
	};
	
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
	
	function CommentScanner (whitespacesVisible) {
		Scanner.call(this, null, whitespacesVisible);
	}
	CommentScanner.prototype = new Scanner(null);
	CommentScanner.prototype.setType = function(type) {
		this._type = type;
	};
	CommentScanner.prototype.nextToken = function() {
		this.startOffset = this.offset;
		while (true) {
			var c = this._read();
			switch (c) {
				case -1: return null;
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
				case 60: // <
					if (this._type === DOC_COMMENT) {
						do {
							c = this._read();
						} while(!(c === 62 || c === -1)); // >
						if (c === 62) {
							return HTML_MARKUP;
						}
					}
					return UNKOWN;
				case 64: // @
					if (this._type === DOC_COMMENT) {
						do {
							c = this._read();
						} while((97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || (48 <= c && c <= 57));  //LETTER OR UNDERSCORE OR NUMBER
						this._unread(c);
						return DOC_TAG;
					}
					return UNKOWN;
				case 84: // T
					if ((c = this._read()) === 79) { // O
						if ((c = this._read()) === 68) { // D
							if ((c = this._read()) === 79) { // O
								c = this._read();
								if (!((97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || (48 <= c && c <= 57))) {
									this._unread(c);
									return TASK_TAG;
								}
								this._unread(c);
							} else {
								this._unread(c);
							}
						} else {
							this._unread(c);
						}
					} else {
						this._unread(c);
					}
					//FALL THROUGH
				default:
					do {
						c = this._read();
					} while(!(c === 32 || c === 9 || c === -1 || c === 60 || c === 64 || c === 84));
					this._unread(c);
					return UNKOWN;
			}
		}
	};
	
	function FirstScanner () {
		Scanner.call(this, null, false);
	}
	FirstScanner.prototype = new Scanner(null);
	FirstScanner.prototype._default = function(c) {
		while(true) {
			c = this._read();
			switch (c) {
				case 47: // SLASH
				case 34: // DOUBLE QUOTE
				case 39: // SINGLE QUOTE
				case -1:
					this._unread(c);
					return UNKOWN;
			}
		}
	};
	
	function TextStyler (view, lang, annotationModel) {
		this.commentStart = "/*";
		this.commentEnd = "*/";
		var keywords = [];
		switch (lang) {
			case "java": keywords = JAVA_KEYWORDS; break;
			case "js": keywords = JS_KEYWORDS; break;
			case "css": keywords = CSS_KEYWORDS; break;
		}
		this.whitespacesVisible = false;
		this.detectHyperlinks = true;
		this.highlightCaretLine = false;
		this.foldingEnabled = true;
		this.detectTasks = true;
		this._scanner = new Scanner(keywords, this.whitespacesVisible);
		this._firstScanner = new FirstScanner();
		this._commentScanner = new CommentScanner(this.whitespacesVisible);
		this._whitespaceScanner = new WhitespaceScanner();
		//TODO these scanners are not the best/correct way to parse CSS
		if (lang === "css") {
			this._scanner.isCSS = true;
			this._firstScanner.isCSS = true;
		}
		this.view = view;
		this.annotationModel = annotationModel;
		this._bracketAnnotations = undefined; 
		
		var self = this;
		this._listener = {
			onChanged: function(e) {
				self._onModelChanged(e);
			},
			onDestroy: function(e) {
				self._onDestroy(e);
			},
			onLineStyle: function(e) {
				self._onLineStyle(e);
			},
			onMouseDown: function(e) {
				self._onMouseDown(e);
			},
			onSelection: function(e) {
				self._onSelection(e);
			}
		};
		var model = view.getModel();
		if (model.getBaseModel) {
			model = model.getBaseModel();
		}
		model.addEventListener("Changed", this._listener.onChanged);
		view.addEventListener("MouseDown", this._listener.onMouseDown);
		view.addEventListener("Selection", this._listener.onSelection);
		view.addEventListener("Destroy", this._listener.onDestroy);
		view.addEventListener("LineStyle", this._listener.onLineStyle);
		this._computeComments ();
		this._computeFolding();
		view.redrawLines();
	}
	
	TextStyler.prototype = {
		destroy: function() {
			var view = this.view;
			if (view) {
				var model = view.getModel();
				if (model.getBaseModel) {
					model = model.getBaseModel();
				}
				model.removeEventListener("Changed", this._listener.onChanged);
				view.removeEventListener("MouseDown", this._listener.onMouseDown);
				view.removeEventListener("Selection", this._listener.onSelection);
				view.removeEventListener("Destroy", this._listener.onDestroy);
				view.removeEventListener("LineStyle", this._listener.onLineStyle);
				this.view = null;
			}
		},
		setHighlightCaretLine: function(highlight) {
			this.highlightCaretLine = highlight;
		},
		setWhitespacesVisible: function(visible) {
			this.whitespacesVisible = visible;
			this._scanner.whitespacesVisible = visible;
			this._commentScanner.whitespacesVisible = visible;
		},
		setDetectHyperlinks: function(enabled) {
			this.detectHyperlinks = enabled;
		},
		setFoldingEnabled: function(enabled) {
			this.foldingEnabled = enabled;
		},
		setDetectTasks: function(enabled) {
			this.detectTasks = enabled;
		},
		_binarySearch: function (array, offset, inclusive, low, high) {
			var index;
			if (low === undefined) { low = -1; }
			if (high === undefined) { high = array.length; }
			while (high - low > 1) {
				index = Math.floor((high + low) / 2);
				if (offset <= array[index].start) {
					high = index;
				} else if (inclusive && offset < array[index].end) {
					high = index;
					break;
				} else {
					low = index;
				}
			}
			return high;
		},
		_computeComments: function() {
			var model = this.view.getModel();
			if (model.getBaseModel) { model = model.getBaseModel(); }
			this.comments = this._findComments(model.getText());
		},
		_computeFolding: function() {
			if (!this.foldingEnabled) { return; }
			var view = this.view;
			var viewModel = view.getModel();
			if (!viewModel.getBaseModel) { return; }
			var annotationModel = this.annotationModel;
			if (!annotationModel) { return; }
			annotationModel.removeAnnotations(mAnnotations.AnnotationType.ANNOTATION_FOLDING);
			var add = [];
			var baseModel = viewModel.getBaseModel();
			var comments = this.comments;
			for (var i=0; i<comments.length; i++) {
				var comment = comments[i];
				var annotation = this._createFoldingAnnotation(viewModel, baseModel, comment.start, comment.end);
				if (annotation) { 
					add.push(annotation);
				}
			}
			annotationModel.replaceAnnotations(null, add);
		},
		_createFoldingAnnotation: function(viewModel, baseModel, start, end) {
			var startLine = baseModel.getLineAtOffset(start);
			var endLine = baseModel.getLineAtOffset(end);
			if (startLine === endLine) {
				return null;
			}
			return new (mAnnotations.AnnotationType.getType(mAnnotations.AnnotationType.ANNOTATION_FOLDING))(start, end, viewModel);
		},
		_computeTasks: function(type, commentStart, commentEnd) {
			if (!this.detectTasks) { return; }
			var annotationModel = this.annotationModel;
			if (!annotationModel) { return; }
			var view = this.view;
			var viewModel = view.getModel(), baseModel = viewModel;
			if (viewModel.getBaseModel) { baseModel = viewModel.getBaseModel(); }
			var annotations = annotationModel.getAnnotations(commentStart, commentEnd);
			var remove = [];
			var annotationType = mAnnotations.AnnotationType.ANNOTATION_TASK;
			while (annotations.hasNext()) {
				var annotation = annotations.next();
				if (annotation.type === annotationType) {
					remove.push(annotation);
				}
			}
			var add = [];
			var scanner = this._commentScanner;
			scanner.setText(baseModel.getText(commentStart, commentEnd));
			var token;
			while ((token = scanner.nextToken())) {
				var tokenStart = scanner.getStartOffset() + commentStart;
				if (token === TASK_TAG) {
					var end = baseModel.getLineEnd(baseModel.getLineAtOffset(tokenStart));
					if (type !== SINGLELINE_COMMENT) {
						end = Math.min(end, commentEnd - this.commentEnd.length);
					}
					add.push(mAnnotations.AnnotationType.createAnnotation(annotationType, tokenStart, end, baseModel.getText(tokenStart, end)));
				}
			}
			annotationModel.replaceAnnotations(remove, add);
		},
		_getLineStyle: function(lineIndex) {
			if (this.highlightCaretLine) {
				var view = this.view;
				var model = view.getModel();
				var selection = view.getSelection();
				if (selection.start === selection.end && model.getLineAtOffset(selection.start) === lineIndex) {
					return caretLineStyle;
				}
			}
			return null;
		},
		_getStyles: function(model, text, start) {
			if (model.getBaseModel) {
				start = model.mapOffset(start);
			}
			var end = start + text.length;
			
			var styles = [];
			
			// for any sub range that is not a comment, parse code generating tokens (keywords, numbers, brackets, line comments, etc)
			var offset = start, comments = this.comments;
			var startIndex = this._binarySearch(comments, start, true);
			for (var i = startIndex; i < comments.length; i++) {
				if (comments[i].start >= end) { break; }
				var commentStart = comments[i].start;
				var commentEnd = comments[i].end;
				if (offset < commentStart) {
					this._parse(text.substring(offset - start, commentStart - start), offset, styles);
				}
				var type = comments[i].type, style;
				switch (type) {
					case DOC_COMMENT: style = docCommentStyle; break;
					case MULTILINE_COMMENT: style = multiCommentStyle; break;
					case MULTILINE_STRING: style = stringStyle; break;
				}
				var s = Math.max(offset, commentStart);
				var e = Math.min(end, commentEnd);
				if ((type === DOC_COMMENT || type === MULTILINE_COMMENT) && (this.whitespacesVisible || this.detectHyperlinks)) {
					this._parseComment(text.substring(s - start, e - start), s, styles, style, type);
				} else if (type === MULTILINE_STRING && this.whitespacesVisible) {
					this._parseString(text.substring(s - start, e - start), s, styles, stringStyle);
				} else {
					styles.push({start: s, end: e, style: style});
				}
				offset = commentEnd;
			}
			if (offset < end) {
				this._parse(text.substring(offset - start, end - start), offset, styles);
			}
			if (model.getBaseModel) {
				for (var j = 0; j < styles.length; j++) {
					var length = styles[j].end - styles[j].start;
					styles[j].start = model.mapOffset(styles[j].start, true);
					styles[j].end = styles[j].start + length;
				}
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
				switch (token) {
					case KEYWORD: style = keywordStyle; break;
					case NUMBER: style = numberStyle; break;
					case MULTILINE_STRING:
					case STRING:
						if (this.whitespacesVisible) {
							this._parseString(scanner.getData(), tokenStart, styles, stringStyle);
							continue;
						} else {
							style = stringStyle;
						}
						break;
					case DOC_COMMENT: 
						this._parseComment(scanner.getData(), tokenStart, styles, docCommentStyle, token);
						continue;
					case SINGLELINE_COMMENT:
						this._parseComment(scanner.getData(), tokenStart, styles, singleCommentStyle, token);
						continue;
					case MULTILINE_COMMENT: 
						this._parseComment(scanner.getData(), tokenStart, styles, multiCommentStyle, token);
						continue;
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
				styles.push({start: tokenStart, end: scanner.getOffset() + offset, style: style});
			}
		},
		_parseComment: function(text, offset, styles, s, type) {
			var scanner = this._commentScanner;
			scanner.setText(text);
			scanner.setType(type);
			var token;
			while ((token = scanner.nextToken())) {
				var tokenStart = scanner.getStartOffset() + offset;
				var style = s;
				switch (token) {
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
					case HTML_MARKUP:
						style = htmlMarkupStyle;
						break;
					case DOC_TAG:
						style = doctagStyle;
						break;
					case TASK_TAG:
						style = tasktagStyle;
						break;
					default:
						if (this.detectHyperlinks) {
							style = this._detectHyperlinks(scanner.getData(), tokenStart, styles, style);
						}
				}
				if (style) {
					styles.push({start: tokenStart, end: scanner.getOffset() + offset, style: style});
				}
			}
		},
		_parseString: function(text, offset, styles, s) {
			var scanner = this._whitespaceScanner;
			scanner.setText(text);
			var token;
			while ((token = scanner.nextToken())) {
				var tokenStart = scanner.getStartOffset() + offset;
				var style = s;
				switch (token) {
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
				if (style) {
					styles.push({start: tokenStart, end: scanner.getOffset() + offset, style: style});
				}
			}
		},
		_detectHyperlinks: function(text, offset, styles, s) {
			var href = null, index, linkStyle;
			if ((index = text.indexOf("://")) > 0) {
				href = text;
				var start = index;
				while (start > 0) {
					var c = href.charCodeAt(start - 1);
					if (!((97 <= c && c <= 122) || (65 <= c && c <= 90) || 0x2d === c || (48 <= c && c <= 57))) { //LETTER OR DASH OR NUMBER
						break;
					}
					start--;
				}
				if (start > 0) {
					var brackets = "\"\"''(){}[]<>";
					index = brackets.indexOf(href.substring(start - 1, start));
					if (index !== -1 && (index & 1) === 0 && (index = href.lastIndexOf(brackets.substring(index + 1, index + 2))) !== -1) {
						var end = index;
						linkStyle = this._clone(s);
						linkStyle.tagName = "A";
						linkStyle.attributes = {href: href.substring(start, end)};
						styles.push({start: offset, end: offset + start, style: s});
						styles.push({start: offset + start, end: offset + end, style: linkStyle});
						styles.push({start: offset + end, end: offset + text.length, style: s});
						return null;
					}
				}
			} else if (text.toLowerCase().indexOf("bug#") === 0) {
				href = "https://bugs.eclipse.org/bugs/show_bug.cgi?id=" + parseInt(text.substring(4), 10);
			}
			if (href) {
				linkStyle = this._clone(s);
				linkStyle.tagName = "A";
				linkStyle.attributes = {href: href};
				return linkStyle;
			}
			return s;
		},
		_clone: function(obj) {
			if (!obj) { return obj; }
			var newObj = {};
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					var value = obj[p];
					newObj[p] = value;
				}
			}
			return newObj;
		},
		_findComments: function(text, offset) {
			offset = offset || 0;
			var scanner = this._firstScanner, token;
			scanner.setText(text);
			var result = [];
			while ((token = scanner.nextToken())) {
				if (token === MULTILINE_COMMENT || token === DOC_COMMENT || token === MULTILINE_STRING) {
					result.push({
						start: scanner.getStartOffset() + offset,
						end: scanner.getOffset() + offset,
						type: token
					});
				}
				if (token === SINGLELINE_COMMENT || token === MULTILINE_COMMENT || token === DOC_COMMENT) {
					//TODO can we avoid this work if edition does not overlap comment?
					this._computeTasks(token, scanner.getStartOffset() + offset, scanner.getOffset() + offset);
				}
			}
			return result;
		}, 
		_findMatchingBracket: function(model, offset) {
			var brackets = BRACKETS;
			var bracket = model.getText(offset, offset + 1);
			var bracketIndex = brackets.indexOf(bracket, 0);
			if (bracketIndex === -1) { return -1; }
			var closingBracket;
			if (bracketIndex & 1) {
				closingBracket = brackets.substring(bracketIndex - 1, bracketIndex);
			} else {
				closingBracket = brackets.substring(bracketIndex + 1, bracketIndex + 2);
			}
			var lineIndex = model.getLineAtOffset(offset);
			var lineText = model.getLine(lineIndex);
			var lineStart = model.getLineStart(lineIndex);
			var lineEnd = model.getLineEnd(lineIndex);
			brackets = this._findBrackets(bracket, closingBracket, lineText, lineStart, lineStart, lineEnd);
			for (var i=0; i<brackets.length; i++) {
				var sign = brackets[i] >= 0 ? 1 : -1;
				if (brackets[i] * sign - 1 === offset) {
					var level = 1;
					if (bracketIndex & 1) {
						i--;
						for (; i>=0; i--) {
							sign = brackets[i] >= 0 ? 1 : -1;
							level += sign;
							if (level === 0) {
								return brackets[i] * sign - 1;
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
									return brackets[j] * sign - 1;
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
								return brackets[i] * sign - 1;
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
									return brackets[k] * sign - 1;
								}
							}
							lineIndex++;
						}
					}
					break;
				}
			}
			return -1;
		},
		_findBrackets: function(bracket, closingBracket, text, textOffset, start, end) {
			var result = [];
			var bracketToken = bracket.charCodeAt(0);
			var closingBracketToken = closingBracket.charCodeAt(0);
			// for any sub range that is not a comment, parse code generating tokens (keywords, numbers, brackets, line comments, etc)
			var offset = start, scanner = this._scanner, token, comments = this.comments;
			var startIndex = this._binarySearch(comments, start, true);
			for (var i = startIndex; i < comments.length; i++) {
				if (comments[i].start >= end) { break; }
				var commentStart = comments[i].start;
				var commentEnd = comments[i].end;
				if (offset < commentStart) {
					scanner.setText(text.substring(offset - start, commentStart - start));
					while ((token = scanner.nextToken())) {
						if (token === bracketToken) {
							result.push(scanner.getStartOffset() + offset - start + textOffset + 1);
						} else if (token === closingBracketToken) {
							result.push(-(scanner.getStartOffset() + offset - start + textOffset + 1));
						}
					}
				}
				offset = commentEnd;
			}
			if (offset < end) {
				scanner.setText(text.substring(offset - start, end - start));
				while ((token = scanner.nextToken())) {
					if (token === bracketToken) {
						result.push(scanner.getStartOffset() + offset - start + textOffset + 1);
					} else if (token === closingBracketToken) {
						result.push(-(scanner.getStartOffset() + offset - start + textOffset + 1));
					}
				}
			}
			return result;
		},
		_onDestroy: function(e) {
			this.destroy();
		},
		_onLineStyle: function (e) {
			if (e.textView === this.view) {
				e.style = this._getLineStyle(e.lineIndex);
			}
			e.ranges = this._getStyles(e.textView.getModel(), e.lineText, e.lineStart);
		},
		_onSelection: function(e) {
			var oldSelection = e.oldValue;
			var newSelection = e.newValue;
			var view = this.view;
			var model = view.getModel();
			var lineIndex;
			if (this.highlightCaretLine) {
				var oldLineIndex = model.getLineAtOffset(oldSelection.start);
				lineIndex = model.getLineAtOffset(newSelection.start);
				var newEmpty = newSelection.start === newSelection.end;
				var oldEmpty = oldSelection.start === oldSelection.end;
				if (!(oldLineIndex === lineIndex && oldEmpty && newEmpty)) {
					if (oldEmpty) {
						view.redrawLines(oldLineIndex, oldLineIndex + 1);
					}
					if ((oldLineIndex !== lineIndex || !oldEmpty) && newEmpty) {
						view.redrawLines(lineIndex, lineIndex + 1);
					}
				}
			}
			if (!this.annotationModel) { return; }
			var remove = this._bracketAnnotations, add, caret;
			if (newSelection.start === newSelection.end && (caret = view.getCaretOffset()) > 0) {
				var mapCaret = caret - 1;
				if (model.getBaseModel) {
					mapCaret = model.mapOffset(mapCaret);
					model = model.getBaseModel();
				}
				var bracket = this._findMatchingBracket(model, mapCaret);
				if (bracket !== -1) {
					add = [
						mAnnotations.AnnotationType.createAnnotation(mAnnotations.AnnotationType.ANNOTATION_MATCHING_BRACKET, bracket, bracket + 1),
						mAnnotations.AnnotationType.createAnnotation(mAnnotations.AnnotationType.ANNOTATION_CURRENT_BRACKET, mapCaret, mapCaret + 1)
					];
				}
			}
			this._bracketAnnotations = add;
			this.annotationModel.replaceAnnotations(remove, add);
		},
		_onMouseDown: function(e) {
			if (e.clickCount !== 2) { return; }
			var view = this.view;
			var model = view.getModel();
			var offset = view.getOffsetAtLocation(e.x, e.y);
			if (offset > 0) {
				var mapOffset = offset - 1;
				var baseModel = model;
				if (model.getBaseModel) {
					mapOffset = model.mapOffset(mapOffset);
					baseModel = model.getBaseModel();
				}
				var bracket = this._findMatchingBracket(baseModel, mapOffset);
				if (bracket !== -1) {
					e.preventDefault();
					var mapBracket = bracket;
					if (model.getBaseModel) {
						mapBracket = model.mapOffset(mapBracket, true);
					}
					if (offset > mapBracket) {
						offset--;
						mapBracket++;
					}	
					view.setSelection(mapBracket, offset);
				}
			}
		},
		_onModelChanged: function(e) {
			var start = e.start;
			var removedCharCount = e.removedCharCount;
			var addedCharCount = e.addedCharCount;
			var changeCount = addedCharCount - removedCharCount;
			var view = this.view;
			var viewModel = view.getModel();
			var baseModel = viewModel.getBaseModel ? viewModel.getBaseModel() : viewModel;
			var end = start + removedCharCount;
			var charCount = baseModel.getCharCount();
			var commentCount = this.comments.length;
			var lineStart = baseModel.getLineStart(baseModel.getLineAtOffset(start));
			var commentStart = this._binarySearch(this.comments, lineStart, true);
			var commentEnd = this._binarySearch(this.comments, end, false, commentStart - 1, commentCount);
			
			var ts;
			if (commentStart < commentCount && this.comments[commentStart].start <= lineStart && lineStart < this.comments[commentStart].end) {
				ts = this.comments[commentStart].start;
				if (ts > start) { ts += changeCount; }
			} else {
				if (commentStart === commentCount && commentCount > 0 && charCount - changeCount === this.comments[commentCount - 1].end) {
					ts = this.comments[commentCount - 1].start;
				} else {
					ts = lineStart;
				}
			}
			var te;
			if (commentEnd < commentCount) {
				te = this.comments[commentEnd].end;
				if (te > start) { te += changeCount; }
				commentEnd += 1;
			} else {
				commentEnd = commentCount;
				te = charCount;//TODO could it be smaller?
			}
			var text = baseModel.getText(ts, te), comment;
			var newComments = this._findComments(text, ts), i;
			for (i = commentStart; i < this.comments.length; i++) {
				comment = this.comments[i];
				if (comment.start > start) { comment.start += changeCount; }
				if (comment.start > start) { comment.end += changeCount; }
			}
			var redraw = (commentEnd - commentStart) !== newComments.length;
			if (!redraw) {
				for (i=0; i<newComments.length; i++) {
					comment = this.comments[commentStart + i];
					var newComment = newComments[i];
					if (comment.start !== newComment.start || comment.end !== newComment.end || comment.type !== newComment.type) {
						redraw = true;
						break;
					} 
				}
			}
			var args = [commentStart, commentEnd - commentStart].concat(newComments);
			Array.prototype.splice.apply(this.comments, args);
			if (redraw) {
				var redrawStart = ts;
				var redrawEnd = te;
				if (viewModel !== baseModel) {
					redrawStart = viewModel.mapOffset(redrawStart, true);
					redrawEnd = viewModel.mapOffset(redrawEnd, true);
				}
				view.redrawRange(redrawStart, redrawEnd);
			}

			if (this.foldingEnabled && baseModel !== viewModel && this.annotationModel) {
				var annotationModel = this.annotationModel;
				var iter = annotationModel.getAnnotations(ts, te);
				var remove = [], all = [];
				var annotation;
				while (iter.hasNext()) {
					annotation = iter.next();
					if (annotation.type === mAnnotations.AnnotationType.ANNOTATION_FOLDING) {
						all.push(annotation);
						for (i = 0; i < newComments.length; i++) {
							if (annotation.start === newComments[i].start && annotation.end === newComments[i].end) {
								break;
							}
						}
						if (i === newComments.length) {
							remove.push(annotation);
							annotation.expand();
						} else {
							var annotationStart = annotation.start;
							var annotationEnd = annotation.end;
							if (annotationStart > start) {
								annotationStart -= changeCount;
							}
							if (annotationEnd > start) {
								annotationEnd -= changeCount;
							}
							if (annotationStart <= start && start < annotationEnd && annotationStart <= end && end < annotationEnd) {
								var startLine = baseModel.getLineAtOffset(annotation.start);
								var endLine = baseModel.getLineAtOffset(annotation.end);
								if (startLine !== endLine) {
									if (!annotation.expanded) {
										annotation.expand();
										annotationModel.modifyAnnotation(annotation);
									}
								} else {
									annotationModel.removeAnnotation(annotation);
								}
							}
						}
					}
				}
				var add = [];
				for (i = 0; i < newComments.length; i++) {
					comment = newComments[i];
					for (var j = 0; j < all.length; j++) {
						if (all[j].start === comment.start && all[j].end === comment.end) {
							break;
						}
					}
					if (j === all.length) {
						annotation = this._createFoldingAnnotation(viewModel, baseModel, comment.start, comment.end);
						if (annotation) {
							add.push(annotation);
						}
					}
				}
				annotationModel.replaceAnnotations(remove, add);
			}
		}
	};
	
	return {TextStyler: TextStyler};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
 
/*globals define Node */

define('orion/editor/edit', [ //$NON-NLS-0$
	
	"orion/editor/textView", //$NON-NLS-0$
	"orion/editor/textModel", //$NON-NLS-0$
	"orion/editor/textTheme", //$NON-NLS-0$
	"orion/editor/projectionTextModel", //$NON-NLS-0$
	"orion/editor/eventTarget", //$NON-NLS-0$
	"orion/keyBinding", //$NON-NLS-0$
	"orion/editor/rulers", //$NON-NLS-0$
	"orion/editor/annotations", //$NON-NLS-0$
	"orion/editor/tooltip", //$NON-NLS-0$
	"orion/editor/undoStack", //$NON-NLS-0$
	"orion/editor/textDND", //$NON-NLS-0$
	
	"orion/editor/editor", //$NON-NLS-0$
	"orion/editor/editorFeatures", //$NON-NLS-0$
	
	"orion/editor/contentAssist", //$NON-NLS-0$
	"orion/editor/cssContentAssist", //$NON-NLS-0$
	"orion/editor/htmlContentAssist", //$NON-NLS-0$
	"orion/editor/jsTemplateContentAssist", //$NON-NLS-0$
	
	"orion/editor/AsyncStyler", //$NON-NLS-0$
	"orion/editor/mirror", //$NON-NLS-0$
	"orion/editor/textMateStyler", //$NON-NLS-0$
	"orion/editor/htmlGrammar", //$NON-NLS-0$
	"examples/editor/textStyler" //$NON-NLS-0$
], function(mTextView, mTextModel, mTextTheme, mProjModel, mEventTarget, mKeyBinding, mRulers, mAnnotations, mTooltip, mUndoStack, mTextDND, mEditor, mEditorFeatures, mContentAssist, mCSSContentAssist, mHtmlContentAssist, mJSContentAssist, mAsyncStyler, mMirror, mTextMateStyler, mHtmlGrammar, mTextStyler) {

	/**	@private */
	function getDisplay(window, document, element) {
		var display;
		var temp = element;
		while (temp && temp !== document && display !== "none") { //$NON-NLS-0$
			if (window.getComputedStyle) {
				var style = window.getComputedStyle(temp, null);
				display = style.getPropertyValue("display"); //$NON-NLS-0$
			} else {
				display = temp.currentStyle.display;
			}
			temp = temp.parentNode;
		}
		return display;
	}

	/**	@private */
	function getTextFromElement(element) {
		var firstChild = element.firstChild;
		if (firstChild && firstChild.tagName === "TEXTAREA") { //$NON-NLS-0$
			return firstChild.value;
		}
		var document = element.ownerDocument;
		var window = document.defaultView || document.parentWindow;
		if (!window.getSelection ||
			(element.childNodes.length === 1 && firstChild.nodeType === Node.TEXT_NODE) ||
			getDisplay(window, document, element) === "none") //$NON-NLS-0$
		{
			return element.innerText || element.textContent;
		}
		var newRange = document.createRange();
		newRange.selectNode(element);
		var selection = window.getSelection();
		var oldRanges = [], i;
		for (i = 0; i < selection.rangeCount; i++) {
			oldRanges.push(selection.getRangeAt(i));
		}
		selection.removeAllRanges();
		selection.addRange(newRange);
		var text = selection.toString();
		selection.removeAllRanges();
		for (i = 0; i < oldRanges.length; i++) {
			selection.addRange(oldRanges[i]);
		}
		return text;
	}

	/**	@private */	
	function optionName(name) {
		var prefix = "data-editor-"; //$NON-NLS-0$
		if (name.substring(0, prefix.length) === prefix) {
			var key = name.substring(prefix.length);
			key = key.replace(/-([a-z])/ig, function(all, character) {
				return character.toUpperCase();
			});
			return key;
		}
		return undefined;
	}
	
	/**	@private */
	function merge(obj1, obj2) {
		for (var p in obj2) {
			if (obj2.hasOwnProperty(p)) {
				obj1[p] = obj2[p];
			}
		}
	}
	
	/**	@private */
	function mergeOptions(parent, defaultOptions) {
		var options = {};
		merge(options, defaultOptions);
		for (var attr, j = 0, attrs = parent.attributes, l = attrs.length; j < l; j++) {
			attr = attrs.item(j);
			var key = optionName(attr.nodeName);
			if (key) {
				var value = attr.nodeValue;
				if (value === "true" || value === "false") { //$NON-NLS-1$ //$NON-NLS-0$
					value = value === "true"; //$NON-NLS-0$
				}
				options[key] = value;
			}
		}
		return options;
	}
	
	/**	@private */
	function getHeight(node) {
		var document = node.ownerDocument;
		var window = document.defaultView || document.parentWindow;
		var height;
		if (window.getComputedStyle) {
			var style = window.getComputedStyle(node, null);
			height = style.getPropertyValue("height"); //$NON-NLS-0$
		} else if (node.currentStyle) {
			height = node.currentStyle.height;
		}
		return parseInt(height, 10) || 0;
	}
	
	/**
	 * @class This object describes the options for <code>edit</code>.
	 * @name orion.editor.EditOptions
	 *
	 * @property {String|DOMElement} parent the parent element for the view, it can be either a DOM element or an ID for a DOM element.
	 * @property {Boolean} [readonly=false] whether or not the view is read-only.
	 * @property {Boolean} [fullSelection=true] whether or not the view is in full selection mode.
	 * @property {Boolean} [tabMode=true] whether or not the tab keypress is consumed by the view or is used for focus traversal.
	 * @property {Boolean} [expandTab=false] whether or not the tab key inserts white spaces.
	 * @property {String} [themeClass] the CSS class for the view theming.
	 * @property {Number} [tabSize=4] The number of spaces in a tab.
	 * @property {Boolean} [wrapMode=false] whether or not the view wraps lines.
	 * @property {Function} [statusReporter] a status reporter.
	 * @property {String} [title=""] the editor title.
	 * @property {String} [contents=""] the editor contents.
	 * @property {String} [lang] the styler language. Plain text by default.
	 * @property {Boolean} [showLinesRuler=true] whether or not the lines ruler is shown.
	 * @property {Boolean} [showAnnotationRuler=true] whether or not the annotation ruler is shown.
	 * @property {Boolean} [showOverviewRuler=true] whether or not the overview ruler is shown.
	 * @property {Boolean} [showFoldingRuler=true] whether or not the folding ruler is shown.
	 */
	/**
	 * Creates an editor instance configured with the given options.
	 * 
	 * @param {orion.editor.EditOptions} options the editor options.
	 */
	function edit(options) {
		var parent = options.parent;
		if (!parent) { parent = "editor"; } //$NON-NLS-0$
		if (typeof(parent) === "string") { //$NON-NLS-0$
			parent = (options.document || document).getElementById(parent);
		}
		if (!parent) {
			if (options.className) {
				var parents = (options.document || document).getElementsByClassName(options.className);
				if (parents) {
					options.className = undefined;
					var editors = [];
					for (var i = 0; i < parents.length; i++) {
						options.parent = parents[i];
						editors.push(edit(options));
					}
					return editors;
				}
			}
		}
		if (!parent) { throw "no parent"; } //$NON-NLS-0$
		options = mergeOptions(parent, options);
	
		if (typeof options.theme === "string") { //$NON-NLS-0$
			var theme = mTextTheme.TextTheme.getTheme(options.theme);
			var index = options.theme.lastIndexOf("/"); //$NON-NLS-0$
			var themeClass = options.theme; 
			if (index !== -1) {
				themeClass = themeClass.substring(index + 1);
			}
			var extension = ".css"; //$NON-NLS-0$
			if (themeClass.substring(themeClass.length - extension.length) === extension) {
				themeClass = themeClass.substring(0, themeClass.length - extension.length);
			}
			theme.setThemeClass(themeClass, {href: options.theme});
			options.theme = theme;
		}
		var textViewFactory = function() {
			return new mTextView.TextView({
				parent: parent,
				model: new mProjModel.ProjectionTextModel(new mTextModel.TextModel("")),
				tabSize: options.tabSize ? options.tabSize : 4,
				readonly: options.readonly,
				fullSelection: options.fullSelection,
				tabMode: options.tabMode,
				expandTab: options.expandTab,
				themeClass: options.themeClass,
				theme: options.theme,
				wrapMode: options.wrapMode
			});
		};

		var contentAssist, contentAssistFactory;
		if (!options.readonly) {
			contentAssistFactory = {
				createContentAssistMode: function(editor) {
					contentAssist = new mContentAssist.ContentAssist(editor.getTextView());
					var contentAssistWidget = new mContentAssist.ContentAssistWidget(contentAssist);
					return new mContentAssist.ContentAssistMode(contentAssist, contentAssistWidget);
				}
			};
		}
	
		// Canned highlighters for js, java, and css. Grammar-based highlighter for html
		var syntaxHighlighter = {
			styler: null, 
			
			highlight: function(lang, editor) {
				if (this.styler) {
					this.styler.destroy();
					this.styler = null;
				}
				if (lang) {
					var textView = editor.getTextView();
					var annotationModel = editor.getAnnotationModel();
					switch(lang) {
						case "js": //$NON-NLS-0$
						case "java": //$NON-NLS-0$
						case "css": //$NON-NLS-0$
							this.styler = new mTextStyler.TextStyler(textView, lang, annotationModel);
							editor.setFoldingRulerVisible(options.showFoldingRuler === undefined || options.showFoldingRuler);
							break;
						case "html": //$NON-NLS-0$
							this.styler = new mTextMateStyler.TextMateStyler(textView, new mHtmlGrammar.HtmlGrammar());
							break;
					}
				}
			}
		};
		
		var keyBindingFactory = function(editor, keyModeStack, undoStack, contentAssist) {
			
			// Create keybindings for generic editing
			var genericBindings = new mEditorFeatures.TextActions(editor, undoStack);
			keyModeStack.push(genericBindings);
			
			// create keybindings for source editing
			var codeBindings = new mEditorFeatures.SourceCodeActions(editor, undoStack, contentAssist);
			keyModeStack.push(codeBindings);
		};
			
		var editor = new mEditor.Editor({
			textViewFactory: textViewFactory,
			undoStackFactory: new mEditorFeatures.UndoFactory(),
			annotationFactory: new mEditorFeatures.AnnotationFactory(),
			lineNumberRulerFactory: new mEditorFeatures.LineNumberRulerFactory(),
			foldingRulerFactory: new mEditorFeatures.FoldingRulerFactory(),
			textDNDFactory: new mEditorFeatures.TextDNDFactory(),
			contentAssistFactory: contentAssistFactory,
			keyBindingFactory: keyBindingFactory, 
			statusReporter: options.statusReporter,
			domNode: parent
		});
		
		var contents = options.contents;
		if (contents === undefined) {
			contents = getTextFromElement(parent); 
		}
		if (!contents) { contents=""; }
		
		editor.installTextView();
		editor.setLineNumberRulerVisible(options.showLinesRuler === undefined || options.showLinesRuler);
		editor.setAnnotationRulerVisible(options.showAnnotationRuler === undefined || options.showFoldingRuler);
		editor.setOverviewRulerVisible(options.showOverviewRuler === undefined || options.showOverviewRuler);
		editor.setFoldingRulerVisible(options.showFoldingRuler === undefined || options.showFoldingRuler);
		editor.setInput(options.title, null, contents);
		syntaxHighlighter.highlight(options.lang, editor);
		if (contentAssist) {
			var cssContentAssistProvider = new mCSSContentAssist.CssContentAssistProvider();
			var jsTemplateContentAssistProvider = new mJSContentAssist.JSTemplateContentAssistProvider();
			contentAssist.addEventListener("Activating", function() { //$NON-NLS-0$
				if (/css$/.test(options.lang)) {
					contentAssist.setProviders([cssContentAssistProvider]);
				} else if (/js$/.test(options.lang)) {
					contentAssist.setProviders([jsTemplateContentAssistProvider]);
				}
			});
		}
		/* The minimum height of the editor is 50px */
		if (getHeight(parent) <= 50) {
			var height = editor.getTextView().computeSize().height;
			parent.style.height = height + "px"; //$NON-NLS-0$
		}
		return editor;
	}

	var editorNS = this.orion ? this.orion.editor : undefined;
	if (editorNS) {
		for (var i = 0; i < arguments.length; i++) {
			merge(editorNS, arguments[i]);	
		}
	}
	
	return edit;
});

 define(['orion/editor/edit'], function(edit) {return edit;});
