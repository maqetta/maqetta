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
	"davinci/model/Model"
], function(declare, HTMLItem, HTMLParser, CSSSelector, HTMLElement, CSSImport, CSSFile, Model) {

return declare("davinci.html.HTMLFile", HTMLItem, {

	constructor: function(fileName) {
		this.fileName = fileName;
		this.elementType = "HTMLFile";
		this._loadedCSS = {};
		this._styleElem = null;
	},

	save: function (isWorkingCopy) {
		
		var filePromise = system.resource.findResource(this.fileName);
		if (filePromise) {
			var text = this.getText();
			return filePromise.then(function(resource){
				resource.setContents(text,isWorkingCopy);
			});
		}
		return null;
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

	addStyleSheet: function(url, content, dontLoad, beforeChild) {
		// create CSS File model

		if (!dontLoad) {
			this._loadedCSS[url] = new CSSFile({
				url : url,
				includeImports : true
			});
		}
		if (content) {
			this._loadedCSS[url].setText(content);
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
	}

});
});

