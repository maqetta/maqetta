define([
	"dojo/_base/declare",
	"davinci/model/Resource/File"
], function(declare, File) {

return declare("davinci.review.model.resource.File", File, {

	constructor: function(name, parent) {
		this.elementType="ReviewFile";
		this.name=name;
		this.parent=parent;
		this.extension="rev";
	},

	getLabel: function() {
		var path = new davinci.model.Path(this.name);
		var segments = path.getSegments();
		return label = segments[segments.length-1]+".rev";

	},
	getText: function() {
		return "";
	},

	removeWorkingCopy: function() {
		return;
	}

});
});
