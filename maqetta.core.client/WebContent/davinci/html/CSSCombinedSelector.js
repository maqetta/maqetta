/**
 * @class davinci.html.CSSCombinedSelector
 * @constructor
 * @extends davinci.html.CSSElement
 */
define([
	"dojo/_base/declare",
	"davinci/html/CSSElement"
], function(declare, CSSElement) {

return declare("davinci.html.CSSCombinedSelector", CSSElement, {

	constructor: function() {
		this.selectors = [];
		this.combiners = [];
		this.elementType = "CSSCombinedSelector";
	},

	matchesSelector: function(selector) {
		if (selector.elementType == this.elementType) {
			if (selector.selectors.length == this.selectors.length) {
				for ( var i = 0; i < this.selectors.length; i++ ) {
					if (this.combiners[i] != selector.combiners[i]) {
						return false;
					}
					if (!this.selectors[i].matchesSelector(selector.selectors[i])) {
						return false;
					}
				}
				return true;
			}
		}
	},

	getText: function(context) {
		var s = "";
		for ( var i = 0; i < this.selectors.length - 1; i++ ) {
			s = s + this.selectors[i].getText(context);
			if (this.combiners[i] != " ") {
				s += ' ' + this.combiners[i] + ' ';
			} else {
				s += this.combiners[i];
			}
		}
		s = s + this.selectors[this.selectors.length - 1].getText(context);
		return s;
	},

	matches: function(domNode) {
		var selectorInx = this.selectors.length - 1;
		var totalSpecific = 0;
		for ( var i = 0; i < domNode.length; i++ ) {
			var specific;

			if ((specific = this.selectors[selectorInx].matches(domNode, i)) >= 0) {
				totalSpecific += specific;
				selectorInx-- ;
				if (selectorInx < 0) {
					return totalSpecific;
				}
			}
			if (i == 0 && specific < 0)
				return -1;
		}
	},

	visit: function(visitor) {
		if (!visitor.visit(this)) {
			for ( var i = 0; i < this.children.length; i++ ) {
				this.children[i].visit(visitor);
			}
			for ( var i = 0; i < this.selectors.length; i++ ) {
				this.selectors[i].visit(visitor);
			}
		}
		if (visitor.endVisit) {
			visitor.endVisit(this); 
		}
	},

	getCSSRule: function() {
		return this.parent;
	}

});
});

