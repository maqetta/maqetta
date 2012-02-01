define([
	"dojo/_base/declare",
	"davinci/model/resource/Resource"
], function(declare, Resource) {

return declare("davinci.review.model.resource.Empty", Resource, {

	constructor: function(args) {
		this.elementType="Folder";
		this.name="root";
		this.parent=null;
	},

	getChildren: function() {
		return this.children;
	}

});
});
