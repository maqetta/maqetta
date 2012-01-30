/**
 * @class davinci.html.CSSFile
 * @constructor
 * @extends davinci.html.CSSElement
 */
define([
	"dojo/_base/declare",
	"davinci/html/CSSElement",
	"davinci/html/CSSRule",
	"davinci/html/CSSParser",
	"davinci/html/CSSSelector"
], function(declare, CSSElement, CSSRule, CSSParser, CSSSelector) {

return declare("davinci.html.CSSFile", CSSElement, {

	constructor: function(args) {
		this.elementType = "CSSFile";
		dojo.mixin(this, args);
		if (!this.options) { 
			this.options = {
					xmode : 'style',
					css : true,
					expandShorthand : false
			};
		}
		var txt = null;

		if (this.url && this.loader) {
			txt = this.loader(this.url);
		} else if (this.url) {
			var file = this.getResource();
			if (file)
				txt = file.getText();
		}
		if (txt) {
			this.setText(txt);
		}
	}, 

	save: function(isWorkingCopy) {
		var deferred;
		var file = this.getResource();
		if (file) {
			var text = this.getText();
			deferred = file.setContents(text, isWorkingCopy);
		}
		return deferred;
	},

	close: function() {
		this.visit({
			visit : function(node) {
				if (node.elementType == "CSSImport") {
					node.close();
				}
			}
		});
		davinci.model.Factory.getInstance().closeModel(this);
	},

	getResource: function (isWorkingCopy) {

		return system.resource.findResource(this.url);
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
		var result = CSSParser.parse(text, this);
		this.errors = result.errors;

		if (this.errors.length > 0 && this.errors[this.errors.length - 1].isException)  {
			this.children = oldChildren;
		}
		if (this.includeImports) {
			for ( var i = 0; i < this.children.length; i++ ) {
				if (this.children[i].elementType == 'CSSImport') {
					this.children[i].load();
				}
			}
		}
		this.onChange();
	}, 

	getText: function(context) {
		context = context || {};
		context.indent = 0;
		var s = "";
		for ( var i = 0; i < this.children.length; i++ ) {
			s = s + this.children[i].getText(context);
		}
		return s;
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
					for ( var j = 0; j < matchLevels.length; j++ ) {
						if (level >= matchLevels[j]) {
							rules.splice(j, 0, child);
							matchLevels.splice(j, 0, level);
							break;
						}
					}
					if (rules.length == 0) {
						rules.push(child);
						matchLevels.push(level);
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
		var matchingRules = new Array();
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

		if (dojo.isString(propertyNames))
			return getMatchingProperty(propertyNames);
		var result = [];
		for ( var i = 0; i < propertyNames.length; i++ ) {
			result.push(getMatchingProperty(propertyNames[i]));
		}
		return result;

	}

});
});
	
