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
define("orion/editor/mirror", ["i18n!orion/editor/nls/messages", "orion/textview/eventTarget", "orion/textview/annotations"], function(messages, mEventTarget, mAnnotations) {
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
		/** @returns Number */
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
		/** @returns String */
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
	 * @description A <code>ModeApplier</code> listens to text changes on a {@link orion.textview.TextModel} and drives
	 * a CodeMirror mode to calculate highlighting in response to the change. Clients can use the highlighting information
	 * to style a {@link orion.textview.TextView}.
	 * 
	 * <p>After a change is made to the {@link orion.textview.TextModel}, ModeApplier immediately updates the highlighting 
	 * information for a small portion of the file around where the change occurred. Successive portions of the file are
	 * updated by short jobs that run periodically to avoid slowing down the rest of the application.</p>
	 * 
	 * <p>A {@link #event:HighlightEvent} event is dispatched every time the ModeApplier updates highlighting information for
	 * a portion of the file. The event contains information about which lines were highlighted. The style for any highlighted
	 * line can be obtained by calling {@link #getLineStyle}.</p>
	 * 
	 * @param {orion.textview.TextModel} model The text model to listen to.
	 * @param {orion.mirror.Mirror} mirror The {@link orion.mirror.Mirror} to use for loading modes.
	 * @param {Object} [options]
	 * <!-- @param {Boolean} [options.whitespacesVisible] If <code>true</code>, causes ModeApplier 
	 * to generate style regions for any whitespace characters that are not claimed as tokens by the mode. -->
	 * @borrows orion.textview.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.textview.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.textview.EventTarget#dispatchEvent as #dispatchEvent
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
		 * Converts a <code>MirrorLineStyle</code> to a {@link orion.textview.StyleRange[]}.
		 * @param {orion.mirror.MirrorLineStyle} style The line style to convert.
		 * @param {Number} [lineIndex] The line index of the line having the given style. If omitted, the returned 
		 * {@link orion.textview.StyleRange[]} objects will have offsets relative to the line, not the document.
		 * 
		 * @returns {orion.textview.StyleRange[][]} An array of 2 elements. The first element is an {@link orion.textview.StyleRange[]}
		 * giving the styles for the line. 
		 * <p>The second element is an {@link orion.textview.StyleRange[]} containing only those elements of
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
	 * @class A styler that uses CodeMirror modes to provide styles for a {@link orion.textview.TextView}.
	 * @description A <code>CodeMirrorStyler</code> applies one or more CodeMirror modes to provide styles for a {@link orion.textview.TextView}.
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
	 * @param {orion.textview.TextView} textView The TextView to provide style for.
	 * @param {orion.mirror.Mirror} codeMirror The Mirror object to load modes from.
	 * @param {orion.textview.AnnotationModel} [annotationModel]
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