/**
 * @class davinci.js.JSUnparsedRegion
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement",
], function(declare, JSExpression) {

return declare("davinci.js.JSUnparsedRegion", JSElement, {

	constructor: function() {
		this.elementType = "JSUnparsedRegion";
		this.s = content;
	},

	getText: function(context) {
		return this.s;
	}

});
});
