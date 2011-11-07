dojo.provide("davinci.ui.editor.Styler");

dojo.require("dojox.highlight.languages.javascript");
dojo.require("dojox.highlight.languages.css");
dojo.require("dojox.highlight.languages.html");

(function(){
	var dh = dojox.highlight,
		C_NUMBER_RE = '\\b(0x[A-Za-z0-9]+|\\d+(\\.\\d+)?)';

	// eclipse.Editor uses 'js' so set up an alias
	dojox.highlight.languages.js = dojox.highlight.languages.javascript;
	// constants

	dh.constants = {
		IDENT_RE: '[a-zA-Z][a-zA-Z0-9_]*',
		UNDERSCORE_IDENT_RE: '[a-zA-Z_][a-zA-Z0-9_]*',
		NUMBER_RE: '\\b\\d+(\\.\\d+)?',
		C_NUMBER_RE: C_NUMBER_RE,
		// Common modes
		APOS_STRING_MODE: {
			className: 'string',
			begin: '\'', end: '\'',
			illegal: '\\n',
			contains: ['escape'],
			relevance: 0
		},
		QUOTE_STRING_MODE: {
			className: 'string',
			begin: '"', 
			end: '"',
			illegal: '\\n',
			contains: ['escape'],
			relevance: 0
		},
		BACKSLASH_ESCAPE: {
			className: 'escape',
			begin: '\\\\.', end: '^',
			relevance: 0
		},
		C_LINE_COMMENT_MODE: {
			className: 'comment',
			begin: '//', end: '$',
			relevance: 0
		},
		C_BLOCK_COMMENT_MODE: {
			className: 'comment',
			begin: '/\\*', end: '\\*/'
		},
		HASH_COMMENT_MODE: {
			className: 'comment',
			begin: '#', end: '$'
		},
		C_NUMBER_MODE: {
			className: 'number',
			begin: C_NUMBER_RE, end: '^',
			relevance: 0
		}
	};

	var defaultStyles={
			comment:{color: "green"},
			javadoc : {color: "#00008F", fontStyle: "italic"},
			string : {color: "blue"},
			escape : {color: "blue"},
			keyword : {color: "darkred", fontWeight: "bold"},
			number : {color: "blue"},
			literal : {color: "blue"},
			doctype : {color: "green"},
			value : {color: "blue"},
			"class" : {color: "red"},
			unknown : {color: "black"}
	};

	function blockText(block){
		var result = [];
		dojo.forEach(block.childNodes, function(node){
			if(node.nodeType == 3){
				result.push(node.nodeValue);
			}else if(String(node.nodeName).toLowerCase() == 'br'){
				result.push("\n");
			}else{
				throw 'Complex markup';
			}
		});
		return result.join("");
	}

	function buildKeywordGroups(mode){
		if(!mode.keywordGroups){
			for(var key in mode.keywords){
				var kw = mode.keywords[key];
    			if(kw instanceof Object){  // dojo.isObject?
					mode.keywordGroups = mode.keywords;
				}else{ 
					mode.keywordGroups = {keyword: mode.keywords};
				}
				break;
			}
		}
	}
	
	function buildKeywords(lang){
		if(lang.defaultMode && lang.modes){
			buildKeywordGroups(lang.defaultMode);
			dojo.forEach(lang.modes, buildKeywordGroups);
		}
	}
	
	
	function shouldAddStyle(mode)
	{
		if (!mode.contains)
			return true;
		if (mode.contains.length>1)
			return false;
		if (mode.className=="string")
			return true;
			
		
	}
	// main object

	
	davinci.ui.editor.Styler = function(langName){
		// initialize the state
		this.langName = langName;
		this.lang = dh.languages[langName];
		this.modes = [this.lang.defaultMode];
		
		// build resources lazily
		if(!this.lang.defaultMode.illegalRe){
			this.buildRes();
			buildKeywords(this.lang);
		}
		this._isDirty=true;
	};

	dojo.extend(davinci.ui.editor.Styler, {
		getStyles: function(text, start, end) {
			
			if (this._isDirty)
			{
				this.relevance = 0;
				this.keywordCount = 0;
				this._ranges=[];
				this._styles=[];
				var textBlock=this.model.getText(0);
				// run the algorithm
				try{
					this.highlight(textBlock);
				}catch(e){
					if(e == 'Illegal'){
						this.relevance = 0;
						this.keywordCount = 0;
					}else{
						throw e;
					}
				}
				this._styleRanges=[];
				var rangeInx=0;
				for (var i=0;i<this._styles.length;i++)
				{
					this._styleRanges.push({start:this._ranges[rangeInx++], end:this._ranges[rangeInx++],style:this._styles[i]});
				}
				this._isDirty=false;
				this._ranges=this._styles=null;
			}
			return this._styleRanges;

		
		},
		setView: function(view) {
			this.view = view;
			var oldModel = this.model;
			var model = view ? view.getModel() : null;
			if (model === oldModel) return;
			this.commentOffset = 0; // last text offset up to which commentOffsets is computed
			this.commentOffsets = [];
			this.model = model;
            view.addEventListener("ModelChanged", this, this._onModelChanged);
            view.addEventListener("LineStyle", this, this._onStyle);
            view.addEventListener("Destroy", this, this.destroy);
//          view.addEventListener("Selection", this, this._onSelection); //TODO
		},

		destroy: function(){
			if(!this.view){ return; }
            this.view.removeEventListener("ModelChanged", this, this._onModelChanged);
            this.view.removeEventListener("LineStyle", this, this._onStyle);
            this.view.removeEventListener("Destroy", this, this.destroy);
//          this.view.removeEventListener("Selection", this, this._onSelection); //TODO
            delete this.view;
		},

		_onModelChanged: function(start, removedCharCount, addedCharCount, removedLineCount, addedLineCount) {
			this._isDirty=true;
		},
		_onStyle: function(e) {
			var text = e.lineText;
			var start = e.lineStart;
			if (!text || start<0)
				return;
			var end = start + text.length;
			var lineStyles=this.getStyles(text, start, end);
			e.ranges = lineStyles;
		},
		buildRes: function(){
			dojo.forEach(this.lang.modes, function(mode){
				if(mode.begin){
					mode.beginRe = this.langRe('^' + mode.begin);
				}
				if(mode.end){
					mode.endRe = this.langRe('^' + mode.end);
				}
				if(mode.illegal){
					mode.illegalRe = this.langRe('^(?:' + mode.illegal + ')');
				}
			}, this);
			this.lang.defaultMode.illegalRe = this.langRe('^(?:' + this.lang.defaultMode.illegal + ')');
		},
		
		subMode: function(lexeme){
			var classes = this.modes[this.modes.length - 1].contains;
			if(classes){
				var modes = this.lang.modes;
				for(var i = 0; i < classes.length; ++i){
					var className = classes[i];
					for(var j = 0; j < modes.length; ++j){
						var mode = modes[j];
						if(mode.className == className && mode.beginRe.test(lexeme)){ return mode; }
					}
				}
			}
			return null;
		},

		endOfMode: function(lexeme){
			for(var i = this.modes.length - 1; i >= 0; --i){
				var mode = this.modes[i];
				if(mode.end && mode.endRe.test(lexeme)){ return this.modes.length - i; }
				if(!mode.endsWithParent){ break; }
			}
			return 0;
		},

		isIllegal: function(lexeme){
			var illegalRe = this.modes[this.modes.length - 1].illegalRe;
			return illegalRe && illegalRe.test(lexeme);
		},


		langRe: function(value, global){
			var mode =  'm' + (this.lang.case_insensitive ? 'i' : '') + (global ? 'g' : '');
			return new RegExp(value, mode);
		},
	
		buildTerminators: function(){
			var mode = this.modes[this.modes.length - 1],
				terminators = {};
			if(mode.contains){
				dojo.forEach(this.lang.modes, function(lmode){
					if(dojo.indexOf(mode.contains, lmode.className) >= 0){
						terminators[lmode.begin] = 1;
					}
				});
			}
			for(var i = this.modes.length - 1; i >= 0; --i){
				var m = this.modes[i];
				if(m.end){ terminators[m.end] = 1; }
				if(!m.endsWithParent){ break; }
			}
			if(mode.illegal){ terminators[mode.illegal] = 1; }
			var t = [];
			for(i in terminators){ t.push(i); }
			mode.terminatorsRe = this.langRe("(" + t.join("|") + ")");
		},

		eatModeChunk: function(value, index){
			var mode = this.modes[this.modes.length - 1];
			
			// create terminators lazily
			if(!mode.terminatorsRe){
				this.buildTerminators();
			}
	
			value = value.substr(index);
//console.log("chunck="+value.substr(0,20));			
			var match = mode.terminatorsRe.exec(value);
			if(!match){
				return {
					buffer: value,
					lexeme: "",
					end:    true
				};
			}
			return {
				buffer: match.index ? value.substr(0, match.index) : "",
				lexeme: match[0],
				end:    false
			};
		},
	
		keywordMatch: function(mode, match){
			var matchStr = match[0];
			if(this.lang.case_insensitive){ matchStr = matchStr.toLowerCase(); }
			for(var className in mode.keywordGroups){
				if(matchStr in mode.keywordGroups[className]){ return className; }
			}
			return "";
		},
		
		buildLexemes: function(mode){
			var lexemes = {};
			dojo.forEach(mode.lexems, function(lexeme){
				lexemes[lexeme] = 1;
			});
			var t = [];
			for(var i in lexemes){ t.push(i); }
			mode.lexemsRe = this.langRe("(" + t.join("|") + ")", true);
		},

		addStyle : function (className)
		{
			if (defaultStyles[className])
				className=defaultStyles[className];
//			else 
//				debugger;
			var style= dojo.isString(className)? {styleClass:className} : {style:className};
			this._styles.push(style);

		},
		
		processKeywords: function(buffer,offset){
			var mode = this.modes[this.modes.length - 1];
			if(!mode.keywords || !mode.lexems){
				return ;//esc(buffer);
			}
			
			// create lexemes lazily
			if(!mode.lexemsRe){
				this.buildLexemes(mode);
			}
			
			mode.lexemsRe.lastIndex = 0;
			var result = [], lastIndex = 0,
				match = mode.lexemsRe.exec(buffer);
			while(match){
//				result.push(esc(buffer.substr(lastIndex, match.index - lastIndex)));
				var keywordM = this.keywordMatch(mode, match);
				if(keywordM){
					++this.keywordCount;
					this._ranges.push(offset+match.index);
					this._ranges.push(offset+match.index+match[0].length);
					this.addStyle(keywordM);
//					result.push('<span class="'+ keywordM +'">' + esc(match[0]) + '</span>');
				}else{
	//				result.push(esc(match[0]));
				}
				lastIndex = mode.lexemsRe.lastIndex;
				match = mode.lexemsRe.exec(buffer);
			}
		},
	
		processModeInfo: function(buffer, lexeme, end,offset) {
			offset+=buffer.length;
			var mode = this.modes[this.modes.length - 1];
			if(end){
				this.processKeywords(mode.buffer + buffer,offset);
				return;
			}
			if(this.isIllegal(lexeme))
			 { 
//				debugger;
			 throw 'Illegal'; 
			 }
			var newMode = this.subMode(lexeme);
			if(newMode){
//console.log("newMode="+newMode.className);				
				mode.buffer += buffer;
//				this.result.push(this.processKeywords(mode.buffer));
				this.processKeywords(mode.buffer,mode.bufferOffset);
				if (newMode.excludeBegin) {
					if (shouldAddStyle(newMode))
					{
						//					this.result.push(lexeme + '<span class="' + newMode.className + '">');
						this._ranges.push(offset + lexeme.length);
						this.addStyle(newMode.className);
					}
					newMode.buffer = '';
					newMode.bufferOffset=offset;
				} else {
					if (shouldAddStyle(newMode))
					{
						//					this.result.push('<span class="' + newMode.className + '">');
						this._ranges.push(offset);
						this.addStyle(newMode.className);
					}
					newMode.buffer = lexeme;
					newMode.bufferOffset=offset;
				}
				this.modes.push(newMode);
				this.relevance += typeof newMode.relevance == "number" ? newMode.relevance : 1;
				return;
			}
			var endLevel = this.endOfMode(lexeme);
			if(endLevel){
				mode.buffer += buffer;
				if (shouldAddStyle(mode)) {
					var keywordOffset=mode.bufferOffset;
					if (mode.excludeEnd) {
						this.processKeywords(mode.buffer,keywordOffset);
						keywordOffset+=mode.buffer.length;
						this._ranges.push(keywordOffset);
//						this.result.push(this.processKeywords(mode.buffer)
//								+ '</span>' + lexeme);
					} else {
						this.processKeywords(mode.buffer+lexeme,keywordOffset);
						keywordOffset+=mode.buffer.length+lexeme.length;
						this._ranges.push(keywordOffset);
//						this.result.push(this.processKeywords(mode.buffer
//								+ lexeme) + '</span>');
					}
				}
				else
					this.processKeywords(mode.buffer,mode.bufferOffset);

				while(endLevel > 1){
//					this.result.push('</span>');
					--endLevel;
					this.modes.pop();
				}
				this.modes.pop();
				this.modes[this.modes.length - 1].buffer = '';
				this.modes[this.modes.length - 1].bufferOffset=offset;;
				return;
			}
		},
	
		highlight: function(value){
			var index = 0;
			this.lang.defaultMode.buffer = '';
			do{
				var modeInfo = this.eatModeChunk(value, index);
				this.processModeInfo(modeInfo.buffer, modeInfo.lexeme, modeInfo.end,index);
				index += modeInfo.buffer.length + modeInfo.lexeme.length;
			}while(!modeInfo.end);
			if(this.modes.length > 1){
				throw 'Illegal';
			}
		}
	});
	
	// more utilities
	
	function replaceText(node, className, text){
		if(String(node.tagName).toLowerCase() == "code" && String(node.parentNode.tagName).toLowerCase() == "pre"){
			// See these 4 lines? This is IE's notion of "node.innerHTML = text". Love this browser :-/
			var container = document.createElement('div'),
				environment = node.parentNode.parentNode;
			container.innerHTML = '<pre><code class="' + className + '">' + text + '</code></pre>';
			environment.replaceChild(container.firstChild, node.parentNode);
		}else{
			node.className = className;
			node.innerHTML = text;
		}
	}
	function highlightStringLanguage(lang, str){
		var highlight = new Highlighter(lang, str);
		return {result:highlight.result, langName:lang, partialResult:highlight.partialResult};		
	}

	function highlightLanguage(block, lang){
		var result = highlightStringLanguage(lang, blockText(block));
		replaceText(block, block.className, result.result);
	}

	function highlightStringAuto(str){
		var result = "", langName = "", bestRelevance = 2,
			textBlock = str;
		for(var key in dh.languages){
			if(!dh.languages[key].defaultMode){ continue; }	// skip internal members
			var highlight = new Highlighter(key, textBlock),
				relevance = highlight.keywordCount + highlight.relevance, relevanceMax = 0;
			if(!result || relevance > relevanceMax){
				relevanceMax = relevance;
				result = highlight.result;
				langName = highlight.langName;
			}
		}
		return {result:result, langName:langName};
	}
	
	function highlightAuto(block){
		var result = highlightStringAuto(blockText(block));
		if(result.result){
			replaceText(block, result.langName, result.result);
		}
	}
	
	// the public API

	dojox.highlight.processString = function(/* String */ str, /* String? */lang){
		// summary: highlight a string of text
		// returns: Object containing:
		//         result - string of html with spans to apply formatting
		//         partialResult - if the formating failed: string of html
		//                 up to the point of the failure, otherwise: undefined
		//         langName - the language used to do the formatting
		return lang ? highlightStringLanguage(lang, str) : highlightStringAuto(str);
	};



})();
