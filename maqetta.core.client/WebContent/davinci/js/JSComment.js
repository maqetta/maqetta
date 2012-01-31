/**
 * @class davinci.js.Comment
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSComment", JSElement, {

	constructor: function() {
		this.elementType = "JSComment";
		this.nosemicolon = true;
	},

	addComment: function(type, startLne, startOffst, stopLne, stopOffst, text) {
		if (this.comments == null) {
			this.comments = [];
		}
		this.comments[this.comments.length] = {
				commentType : type,
				startLine : startLne,
				startOffset : startOffst,
				stopLine : stopLne,
				stopOffset : stopOffst,
				s : text
		};
	},

	getText: function(context) {
		var s = "";
		for ( var i = 0; i < this.comments.length; i++ ) {
			if (this.comments[i].commentType == "line") {
				s += "//" + this.comments[i].s + "\n";
			} else if (this.comments[i].commentType == "block") {
				s += "/*" + this.comments[i].s + "*/\n";
			}
		}
		return s;
	}

});
});