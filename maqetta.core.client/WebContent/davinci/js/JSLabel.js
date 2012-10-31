/**
 * @class davinci.js.JSLabel
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement",
], function(declare, JSExpression) {

return declare("davinci.js.JSLabel", JSElement, {

	constructor: function() {
		this.elementType = "JSLabel";
		this.nosemicolon = true;
		this.s = name;
	},

	getText: function(context) {
		return this.s + " : ";
	}

});
});

