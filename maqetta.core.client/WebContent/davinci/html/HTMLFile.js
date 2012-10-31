/**
 * @class davinci.html.HTMLFile
 * @constructor
 * @extends davinci.html.HTMLItem
 */
define([
	"dojo/_base/declare",
	"davinci/html/HTMLItem",
	"davinci/html/HTMLParser",
	"davinci/html/CSSSelector",
	"davinci/html/HTMLElement",
	"davinci/html/CSSImport",
	"davinci/html/CSSFile",
	"davinci/model/Model",
	"davinci/model/Path"
], function(declare, HTMLItem, HTMLParser, CSSSelector, HTMLElement, CSSImport, CSSFile, Model, Path) {

return declare("davinci.html.HTMLFile", HTMLItem, {

	constructor: function(fileName) {
		this.fileName = fileName;
		this.url = fileName;
		this.elementType = "HTMLFile";
		this._loadedCSS = {};
		this._styleElem = null;
	},

	save: function (isWorkingCopy) {
		var deferred;
		var file = system.resource.findResource(this.fileName);
		if (file) {
			var text = this.getText();
			deferred = file.setContents(text,isWorkingCopy);
		}
		return deferred;
	},

	getText: function(context) {
		context = context || {};
		context.indent = 0;
		var s = "";
		for (var i=0; i<this.children.length; i++)
		{
			var child = this.children[i];
			s = s + child.getText(context);
			if (child.elementType == "HTMLComment")
				s=s+this._addWS(child._fmLine, child._fmIndent);
		}
		return s;
	},

	getDocumentElement: function(context) {
		for (var i=0;i<this.children.length; i++)
			if (this.children[i].tag == "html")
				return this.children[i];

	},

	findElement: function(id) {
		var documentElement = this.getDocumentElement();
		if (documentElement) {
			return documentElement.findElement(id);
		}
	},

	getMatchingRules: function(domElement, returnMatchLevels) {

		var visitor = {
				visit: function(node) {
					if (node.elementType == "CSSFile") {
						
						var m = [];
						var newRules = node.getMatchingRules(domElement, [], m);

						for ( var i = 0; i < newRules.length; i++) {
							for ( var j = 0; j < this.matchLevels.length; j++) {
								if (m[i] > this.matchLevels[j]) {
									this.matchLevels.splice(j, 0, m[i]);
									this.rules.splice(j, 0, newRules[i]);
									break;
								}
							}
						}

						if (this.rules.length == 0) {
							this.rules = newRules;
							this.matchLevels = m;
						}

						return true;
					}
					return false;
				},
				matchLevels: [],
				rules: []
		};
		this.visit(visitor);
		if (returnMatchLevels) {
			return {
				'rules': visitor.rules,
				'matchLevels': visitor.matchLevels
			};
		} else {
			return visitor.rules;
		}
	},

	getRule: function(selector) {
		if (!selector)
			return [];
		var selectors = CSSSelector.parseSelectors(selector);
		var visitor = {
				visit: function(node) {
					if (node.elementType == "CSSFile") {
						var newRules = node.getRule(selectors);
						this.rules = this.rules.concat(newRules || []);
						return true;
					}
					return false;
				},
				rules: []
		};
		this.visit(visitor);
		return visitor.rules;
	},

	setText: function (text, noImport) {
		// clear the singletons in the Factory
		this.visit({visit:function(node) {
			if (node.elementType == "CSSImport") {
				node.close();
			}
		}});
		// clear cached values
		this.children = [];
		this._styleElem = null;

		var result = HTMLParser.parse(text || "", this);
		var formattedHTML = "";
		if (!noImport && result.errors.length == 0) {
			// the input html may have extraneous whitespace which is thrown away by our formatting
			// reparse the html on the source as formatted by us, so positions are correct
			formattedHTML = this.getText();
			this.children = [];
			result = HTMLParser.parse(formattedHTML, this);
		}

		// this.reportPositions();
		this.endOffset = result.endOffset;
		this.errors = result.errors;
		var htmlmodel = this;
		if (!noImport) {
			this.visit({
				visit: function(node) {
					if (node.elementType == "CSSImport") {
						if (!node.cssFile) {
							node.load(true);
							dojo.connect(node.cssFile, 'onChange', null, dojo.hitch(htmlmodel,
							'onChange'));
						}
					}

				}
			});
		}
		this.onChange();
	},  

	hasStyleSheet: function (url) {
		var imports = this.find({elementType:'CSSImport'});
		for(var i=0; i<imports.length; i++){
			if(imports[i].url == url) {return true;}
		}
		return false;
	},

	addStyleSheet: function(url, content, dontLoad, beforeChild, loader) {
		var path = new Path(this.url || this.fileName);
		path = path.getParentPath().append(url);
		var absUrl = path.toString();
		
		// create CSS File model
		
		/* 
		 * this is redundant, sort of.  the file is loaded once, then cached.. then the import loads the file again.  
		 * theres got to be a better way of doing this...  all the loading should happen in the CSSImport class.
		 * 
		 */
		if (!dontLoad) {
			// have to use the require or we get a circular dependency 
			this._loadedCSS[absUrl] = require("davinci/model/Factory").getModel({
				url : absUrl,
				includeImports : true,
				loader : loader
			});
		}
		if (content) {
			this._loadedCSS[absUrl].setText(content);
		}

		this.onChange();

		// add CSS link to HTML
		//  XXX This isn't yet supported.  Instead, add an "@import" inside of a "<style>" element in
		//  the head.
		//  var link = new HTMLElement('link');
		//  link.addAttribute('rel', 'stylesheet');
		//  link.addAttribute('type', 'text/css');
		//  link.addAttribute('href', url);
		//  this.getDocumentElement().getChildElement('head').addChild(link);
		if (!this._styleElem) {
			var head = this.find({'elementType':"HTMLElement",'tag':'head'}, true);
			var style = head.getChildElement('style');
			if (!style) {
				style = new HTMLElement('style');
				head.addChild(style);
			}
			this._styleElem = style;
		}
		var css = new CSSImport();
		css.parent = this;
		css.url = url;
		if(beforeChild){
			this._styleElem.insertBefore(css, beforeChild);
		}else{
			this._styleElem.addChild(css);
		}
		if(!dontLoad){ 
			css.load(true);
		}

	},

	close: function() {
		this.visit({visit:function(node) {
			if (node.elementType == "CSSImport") {
				node.close();
			}
		}});
		require("davinci/model/Factory").closeModel(this);
	},

	getLabel: function() {
		return "<>" ;
	},


	getID: function() {
		return this.fileName;
	},

	updatePositions: function(startOffset, delta) {
		new Model(this).updatePositions(this, startOffset, delta);
		this.visit({
			visit: function(element) {
				if (element.endOffset < startOffset) { return true; }
				if (element.elementType == "HTMLElement" && element.startTagOffset>startOffset) {
					element.startTagOffset += delta;
				}
			}
		});
	},

	/*
	 * The PageEditor uses the HTML model as its base model. However, 
	 * the visual editor aspect of the PageEditor injects temporary 
	 * runtime content into the model which skews offsets. When in 
	 * split view we need to correct the model element positions by 
	 * removing temporary content length from rendered content length.
	 */
	mapPositions: function(element) {
		var s = this.getText();
		var et = element.getText();
		var start = s.indexOf(et);
		var end   = start + et.lastIndexOf(">") + 1;
		return {startOffset:start, endOffset:end};
	},

	reportPositions: function() {
		this.visit({
			visit: function(element) {
				if (element.elementType == "HTMLElement") {
					console.log("<"+element.tag+"> "+element.startOffset+" -> "+element.startTagOffset+" -> "+element.endOffset);
				} else if (element.elementType == "HTMLAttribute") {
					console.log("   "+element.name+"= "+element.value+":: -> "+element.startOffset+" -> "+element.endOffset);
				}
			}
		});
	},

	/**
	 * Mimics `document.evaluate`, which takes an XPath string and returns the
	 * specified element(s).  This is a simplified version, implementing a
	 * simple case and only returning a single element.
	 * 
	 * @param  {string} xpath
	 * @return {HTMLElement}
	 */
	evaluate: function(xpath) {
		if (xpath.charAt(0) !== '/') {
			console.error('invalid XPath string');
			return;
		}

		var elem = this;
		xpath.substr(1).split('/').forEach(function(path) {
			var m = path.match(this._RE_XPATH),
				tag = m[1],
				idx = m[2],
				elems;
			elems = elem.children.filter(function(child) {
				return child.tag === tag;
			});
			if (!idx && elems.length > 1) {
				console.error('invalid XPath string; no index specified for multiple elements');
				return;
			}
			elem = idx ? elems[idx - 1] : elems[0];
		}, this);

		return elem;
	},

	_RE_XPATH: /(\w+)(?:\[(\d+)\])?/

});
});

