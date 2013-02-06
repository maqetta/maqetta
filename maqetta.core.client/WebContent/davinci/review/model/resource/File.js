define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/model/resource/File",
	"davinci/model/Path",
	"dojo/Deferred"
], function(declare, Runtime, File, Path, Deferred) {

return declare("davinci.review.model.resource.File", File, {

	constructor: function(name, parent) {
		this.elementType = "ReviewFile";
		this.name = name;
		this.parent = parent;
		this.extension = "rev";
	},

	getLabel: function() {
		var path = new Path(this.name);
		var segments = path.getSegments();
		var editorExtension = Runtime.getExtension("davinci.editor", function (extension){
			return extension.id === "davinci.review.CommentReviewEditor";
		});
		var extension = "."+editorExtension.extensions;
		return label = segments[segments.length-1] + extension;
	},

	getContentSync: function() {
		return "";
	},

	getContent: function() {
		return new Deferred().resolve("");
	},

	removeWorkingCopy: function() {
		return;
	}

});
});
