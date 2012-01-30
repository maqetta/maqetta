/**
 * @class davinci.html.CSSProperty
 * @constructor
 * @extends davinci.html.CSSElement
 * 
 * possible fields url : a url value numberValue : the numeric part of a value
 * units : the units of a numeric value
 * 
 */
define([
	"dojo/_base/declare",
	"davinci/html/CSSElement"
], function(declare, CSSElement) {

return declare("davinci.html.CSSProperty", CSSElement, {

	constructor: function(name, value, parent) {
		this.elementType = "CSSProperty";
		this.name = name || "";
		this.value = value || "";
		this.parent = parent;
		this.expanded = [];
		this.lengthValues = [];
	},

	getValue: function() {
		return this.value;
	},
	
	getText: function(context) {
		var s = "";
		if (this.comment && !context.noComments) {
			s += "\n  " + this.comment.getText(context);
		}
		s += this.name + " : " + this.value;
		if (this.isNotImportant) {
			s += ' !important';
		}
		s += ";";
		if (this.postComment && !context.noComments) {
			s += this.postComment.getText(context);
		}
		return s;
	},

	getCSSRule: function() {
		return this.parent;
	},
	
	addProperty: function(name, value) {
		var property = new CSSProperty(name, value, this);
		this.properties.push(property);
	},

	getURL: function() {
		if (this.url) {
			var path = new davinci.model.Path(this.getCSSFile().url);
			path = path.getParentPath().append(this.url);
			return path.toString();
		}
	}

});
});

