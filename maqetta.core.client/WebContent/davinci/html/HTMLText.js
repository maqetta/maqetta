/**
 * @class davinci.html.HTMLText
 * @constructor
 * @extends davinci.html.HTMLItem
 */
define([
	"dojo/_base/declare",
	"davinci/html/HTMLItem"
], function(declare, HTMLItem) {

return declare("davinci.html.HTMLText", HTMLItem, {

	constructor: function(value) {
		this.elementType = "HTMLText";
		this.value=value ||"";
	},

	getText: function(context) {
		return this.value;
	},

	setText: function(value) {
		if (this.wasParsed || (this.parent && this.parent.wasParsed)) {
			var delta = value.length - this.value.length;
			if (delta > 0) {
				this.getHTMLFile().updatePositions(this.startOffset+1, delta);
			}
		}
		this.value = value;
	},

	getLabel: function() {
		if (this.value.length<15) {
			return this.value;
		}
		return this.value.substring(0, 15) + "...";
	}

});
});
