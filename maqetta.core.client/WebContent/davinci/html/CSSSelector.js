/**
 * @class davinci.html.CSSSelector
 * @constructor
 * @extends davinci.html.CSSElement
 */

define([
	"require",
	"dojo/_base/declare",
	"davinci/html/CSSElement"
], function(require, declare, CSSElement) {

var CSSSelector = declare("davinci.html.CSSSelector", CSSElement, {

	constructor: function() {
		this.elementType = "CSSSelector";
	},

	matchesSelector: function(selector) {
		if (selector.elementType == this.elementType && this.id == selector.id
				&& this.cls == selector.cls && this.element == selector.element
				&& this.pseudoRule == selector.pseudoRule)
			return true;
	},

	getText: function(context) {
		var s = "";
		if (this.element) {
			s = s + this.element;
		}
		if (this.id) {
			s = s + "#" + this.id;
		}
		if (this.cls) {
			s = s + "." + this.cls;
		}
		if (this.pseudoRule) {
			s = s + ":" + this.pseudoRule;
		}
		if (this.pseudoElement) {
			s = s + "::" + this.pseudoElement;
		}
		if (this.attribute) {
			s = s + "[" + this.attribute.name;
			if (this.attribute.type) {
				s = s + this.attribute.type + '"' + this.attribute.value + '"';
			}
			s = s + ']';
		}
		return s;
	},

	matches: function(domNode, index) {
		// FIXME: Will produce incorrect results if more than 9 class matches
		// Should use a very higher "base", not just base 10
		var inx = index || 0;
		var node = domNode[inx];
		var specific = 0;
		var anymatches = false;
		if (this.id) {
			if (this.id != node.id) {
				return -1;
			}
			specific += 100;
			anymatches = true;
		}
		if (this.element) {
			if (this.element == '*') {
				anymatches = true;
			} else {
				if (this.element != node.tagName) {
					if (this.element.toUpperCase() != node.tagName) {
						return -1;
					}
				}
				specific += 1;
				anymatches = true;
			}
		}
		if (this.cls && node.classes) {
			var classes = node.classes;
			if (this.cls.indexOf('.') >= 0) {
				var matchClasses = this.cls.split('.');
				for ( var j = 0; j < matchClasses.length; j++ ) {
					var found = false;
					for ( var i = 0; i < classes.length; i++ ) {
						if (found = (classes[i] == matchClasses[j])) {
							break;
						}
					}
					if (!found) {
						return -1;
					}
				}
				specific += (matchClasses.length * 10);
				anymatches = true;
			} else {
				var found = false;
				for ( var i = 0; i < classes.length; i++ )
					if (found = ((classes[i] == this.cls) && (!this.pseudoRule))) // FIXME need to do something better with pseudoRule issue #1760
						break;
				if (!found)
					return -1;
				specific += 10;
				anymatches = true;
			}
		}
		if (!anymatches) {
			return -1;
		} else {
			return specific;
		}
	},

	getCSSRule: function() {
		if (this.parent.elementType == 'CSSRule') {
			return this.parent;
		}
		return this.parent.parent;
	}

});

CSSSelector.parseSelectors = function(selector) {
	if (typeof selector == "string") {
		selector = selector + "{}";
		var cssFileClass = require("davinci/html/CSSFile");
		var cssFile = new cssFileClass();
		cssFile.setText(selector);
		return cssFile.children[0].selectors;
	} else {
		return selector; // already parsed
	}
};

return CSSSelector;

});

