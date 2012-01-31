/**
 * @class davinci.html.HTMLComment
 * @constructor
 * @extends davinci.html.HTMLItem
 */
define([
	"dojo/_base/declare",
	"davinci/html/HTMLItem"
], function(declare, HTMLItem) {

return declare("davinci.html.HTMLComment", HTMLItem, {

	constructor: function(value) {
		this.elementType = "HTMLComment";
		this.value = value || "";
	},

	getText: function(context) {
		var dash = this.isProcessingInstruction ? "":"--";
		return '<!'+dash+this.value+dash+'>';
	}

});
});
