/**
 * @class davinci.model.Comment
 * @extends davinci.model.Model
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/model/Model"
], function(declare, Model) {

return declare("davinci.model.Comment", Model, {

	constructor: function() {
		this.elementType = "Comment";
		this.nosemicolon = true;
	},

	addComment: function(type, start, stop, text) {
		if (this.comments == null) {
			this.comments = [];
		}
		this.comments[this.comments.length] = {
				commentType:type,
				start:start,
				stop:stop,
				s:text
		};
	},

	appendComment: function(text) {
		var comment = this.comments[this.comments.length-1];
		comment.s += text;
		comment.stop += text.length;
	},

	getText: function (context) {
		var s="";
		for(var i = 0; i<this.comments.length; i++) {
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
