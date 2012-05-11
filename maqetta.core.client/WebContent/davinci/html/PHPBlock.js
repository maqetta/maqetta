/**
 * @class davinci.html.HTMLComment
 * @constructor
 * @extends davinci.html.HTMLItem
 */
define([
	"dojo/_base/declare",
	"davinci/html/HTMLItem"
], function(declare, HTMLItem) {

return declare("davinci.html.PHPBlock", HTMLItem, {

	constructor: function(value) {
		this.elementType = "PHPBlock";
		this.value = value || "";
	},

	getText: function(context) {
		return context.excludeIgnoredContent ? "" : this.value;
	}

});
});
