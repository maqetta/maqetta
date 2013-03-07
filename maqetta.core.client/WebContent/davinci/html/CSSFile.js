define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"davinci/html/CSSElement",
	"davinci/html/CSSRule",
	"davinci/html/CSSSelector",
	"system/resource"
], function(
	declare,
	lang,
	CSSElement,
	CSSRule,
	CSSSelector,
	systemResource
) {

/**
 * @class davinci.html.CSSFile
 * @constructor
 * @extends davinci.html.CSSElement
 */
return declare("davinci.html.CSSFile", CSSElement, {

	constructor: function(args) {
		this.elementType = "CSSFile";
		lang.mixin(this, args);
		if (!this.options) { 
			this.options = {
				xmode: 'style',
				css: true,
				expandShorthand: false
			};
		}
		var txt = null;

		if (this.url && this.loader) {
			txt = this.loader(this.url);
		} else if (this.url) {
			systemResource.findResourceAsync(this.url).then(function(file) {
				file.getContent().then(function(txt) {
					this.setText(txt);					
				}.bind(this));
				this.setDirty(file.isDirty());
			}.bind(this));
		}
		if (txt) {
			this.setText(txt);
		}
	}, 

	save: function(isWorkingCopy) {
		return systemResource.findResourceAsync(this.url).then(function (file) {
			return file.setContents(this.getText(), isWorkingCopy);
		}.bind(this));
	},

	close: function() {
		this.visit({
			visit: function(node) {
				if (node.elementType == "CSSImport") {
					node.close();
				}
			}
		});
		// the return of the CSSFile model needs to happen in the CSSImport instead of the CSSFile
		// if we return it in the CSSFile close we end up returning it twice due of the visit logic
		require(["dojo/_base/connect"], function(connect) {
			connect.publish("davinci/model/closeModel", [this]);
		});
	},

	addRule: function (ruleText) {
		var rule = new CSSRule();
		rule.setText(ruleText);
		this.addChild(rule);
		this.setDirty(true);
		return rule;
	},

	setText: function(text) {
		var oldChildren = this.children;
		this.children = [];
		var result = require("davinci/html/CSSParser").parse(text, this);
		if (result.errors.length > 0){
			console.log("ERROR: " + this.url);
		}
		this.errors = result.errors;

		if (this.errors.length > 0 && this.errors[this.errors.length - 1].isException)  {
			this.children = oldChildren;
		}
		if (this.includeImports) {
			this.children.forEach(function(child) {
				if (child.elementType == 'CSSImport') {
					child.load();
				}				
			});
		}
		this.onChange();
	}, 

	getText: function(context) {
		context = context || {};
		context.indent = 0;

		return this.children.map(function(child) {
			return child.getText(context);
		}).join("");
	},

	getCSSFile: function() {
		return this;
	},

	getID: function() {
		return this.fileName;
	},

	getMatchingRules: function(domElement, rules, matchLevels) {
		domElement = this._convertNode(domElement);
		rules = rules || [];
		matchLevels = matchLevels || [];
		for ( var i = 0; i < this.children.length; i++ ) {
			var child = this.children[i];
			if (child.elementType == 'CSSRule') {
				var level = child.matches(domElement);
				if (level) {
					var added = false;
					for ( var j = 0; j < matchLevels.length; j++ ) {
						/*
						 * Run the rules and add the rule based on it's match level 0 - NNN
						 * 
						 */
						if (level >= matchLevels[j]) {
							rules.splice(j, 0, child);
							matchLevels.splice(j, 0, level);
							added = true;
							break;
						}
					}
					/*
					 * The rule is a match but either we have no rules in the array
					 * or all the rules already in the array have a higer match level than this one
					 * So add at the front
					 */
					if (!added) {
						rules.splice(0, 0, child);
						matchLevels.splice(0, 0, level);
					}
				}
			} else if (child.elementType == 'CSSImport' && child.cssFile) {
				child.cssFile.getMatchingRules(domElement, rules, matchLevels);
			}
		}
		return rules;
	},

	getRule: function(selector) {
		var matchingRule;
		if (!selector) {
			return [];
		}
		var selectors = CSSSelector.parseSelectors(selector);
		for ( var i = 0; i < this.children.length; i++ ) {
			var child = this.children[i];
			if (child.elementType == 'CSSRule') {
				if (child.matchesSelectors(selectors)) {
					matchingRule = child;
					break;
				}
			} else if (child.elementType == 'CSSImport' && child.cssFile) {
				matchingRule = child.cssFile.getRule(selectors) || matchingRule;

			}
		}
		return matchingRule;
	},

	getRules: function(selector) {
		var selectors = CSSSelector.parseSelectors(selector);
		var matchingRules = [];
		for ( var i = 0; i < this.children.length; i++ ) {
			var child = this.children[i];
			if (child.elementType == 'CSSRule') {
				if (child.matchesSelectors(selectors)) {
					matchingRules.push(child);
				}
			} else if (child.elementType == 'CSSImport' && child.cssFile) {
				matchingRules = matchingRules.concat(child.cssFile
						.getRules(selectors));

			}
		}
		return matchingRules;
	},

	getStyleValue: function(propertyNames, domElement) {
		var rules = [];
		var matchLevels = [];
		domElement = this._convertNode(domElement);

		this.getMatchingRules(domElement, rules, matchLevels);

		function getMatchingProperty(propertyName) {
			var level = 0;
			var property, prop;
			for ( var i = 0; i < rules.length; i++ ) {
				if ((prop = rules[i].getProperty(propertyName))) {
					if (matchLevels[i] > level) {
						property = prop;
						level = matchLevels[i];
					}
				}
			}
			return property;
		}

		if (typeof propertyNames == "string") {
			propertyNames = [propertyNames];
		}

		return propertyNames.map(function(name) {
			return getMatchingProperty(name);
		});
	}

});
});
	
