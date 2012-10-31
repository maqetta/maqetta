/**
 * @class davinci.html.CSSRule
 * @constructor
 * @extends davinci.html.CSSElement
 */
define([
	"dojo/_base/declare",
	"davinci/html/CSSElement",
	"davinci/html/CSSParser",
	"davinci/html/CSSProperty"
], function(declare, CSSElement, CSSParser, CSSProperty) {

return declare("davinci.html.CSSRule", CSSElement, {

	constructor: function() {
		this.elementType = "CSSRule";
		this.selectors = [];
		this.properties = [];
	},

	getText: function(context) {
		var s = "";
		context = context || [];
		if (this.comment && !context.noComments) {
			s += /*"\n  " +*/ this.comment.getText(context); //#2166
		}
		s += this.getSelectorText(context);
		s = s + " {";
		for ( var i = 0; i < this.properties.length; i++ ) {
			s = s + "\n    " + this.properties[i].getText(context);
		}
		s = s + "\n}\n";
		if (this.postComment && !context.noComments) {
			s += /*"\n  " +*/ this.postComment.getText(context); //#2166
		}
		return s;
	},

	setText: function(text) {
		var options = {
				xmode : 'style',
				css : true
		};
		var result = require("davinci/html/CSSParser").parse(text, this);

		// first child is actually the parsed element, so replace this with child
		dojo.mixin(this, this.children[0]);
		var parentOffset = (this.parent) ? this.parent.endOffset : 0;
		this.startOffset = parentOffset + 1;
		this.setDirty(true);
	},

	addProperty: function(name, value) {
		var property = new CSSProperty(name, value, this);
		this.properties.push(property);
		this.setDirty(true);
		this.onChange();
	},

	insertProperty: function(name, value, atIndex) {
		/* insert a property at given index */
		var property;
		property = this.getProperty(name);
		if (property) {
			this.removeProperty(name);
		}

		property = new CSSProperty(name, value, this);
		this.properties.splice(atIndex, 0, property);
		this.setDirty(true);
		this.onChange();
	},

	getSelectorText: function(context) {
		var s = "";
		for ( var i = 0; i < this.selectors.length; i++ ) {
			if (i > 0)
				s = s + ", ";
			s = s + this.selectors[i].getText(context);
		}
		return s;
	},

	matches: function(domNode) {
		domNode = this._convertNode(domNode);
		var specific;
		for ( var i = 0; i < this.selectors.length; i++ ) {
			if ((specific = this.selectors[i].matches(domNode)) >= 0) {
				return specific;
			}
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

	hasSelector: function(selectorText) {
		for ( var i = 0; i < this.selectors.length; i++ ) {
			if (this.selectors[i].getLabel() == selectorText) {
				return true;
			}
		}
		return false;
	},

	matchesSelectors: function(selectors) {
		for ( var j = 0; j < selectors.length; j++ ) {
			for ( var i = 0; i < this.selectors.length; i++ ) {
				if (this.selectors[i].matchesSelector(selectors[j])) {
					return true;
				}
			}
		}
		return false;
	},

	getCSSRule: function() {
		return this;
	},

	getLabel: function() {
		return this.getSelectorText({});
	},

	getProperty: function(propertyName) {
		for ( var i = 0; i < this.properties.length; i++ ) {
			if (propertyName == this.properties[i].name) {
				return this.properties[i];
			}
		}
	},

	hasProperty: function(propertyName) {
		for ( var i = 0; i < this.properties.length; i++ ) {
			if (propertyName == this.properties[i].name) {
				return true;
			}
		}
	},

	/**
	 * If propertyName is not provided, returns all CSS properties declared in this rule.
	 * If propertyName is provide, return all CSS property declarations for that property only.
	 * @param {string} propertyName  CSS propername name (e.g., 'font-size')
	 * @returns {Array[Object]} where Object has single property, such as [{display:'none'},{'font-size':'12px'}]
	 */
	getProperties: function(propertyName) {
		var values = [];
		for ( var i = 0; i < this.properties.length; i++ ) {
			if (!propertyName || propertyName == this.properties[i].name) {
				values.push( this.properties[i]);
			}
		}
		return values;
	},

	setProperty: function(name, value) {
		var property = this.getProperty(name);
		if (!value) {
			this.removeProperty(name);
		} else if (property) {
			property.value = value;
		} else {
			property = new CSSProperty();
			property.name = name;
			property.value = value;
			this.properties.push(property);
			property.parent = this;
		}
		this.setDirty(true);
		this.onChange();

	},

	removeProperty: function(propertyName) {
		for ( var i = 0; i < this.properties.length; i++ ) {
			if (propertyName == this.properties[i].name) {
				this.properties.splice(i, 1);
			}
		}
		this.setDirty(true);
		this.onChange();
	},

	removeAllProperties: function() {
		this.properties = [];
		this.setDirty(true);
		this.onChange();
	},

	removeStyleValues: function(propertyNames) {
		var newProperties = [];
		for ( var i = 0; i < this.properties.length; i++ ) {
			var found;
			for ( var j = 0; j < propertyNames.length && !found; j++ ) {
				found = propertyNames[j] == this.properties[i].name;
			}
			if (!found) {
				newProperties = this.properties[i];
			}
		}
		this.properties = newProperties;
		this.setDirty(true);
		this.onChange();
	}

});
});
