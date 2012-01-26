define([
	"dojo/_base/declare",
], function(declare) {

dojo.require("davinci.model.Resource");

return declare("davinci.review.model.resource.Empty", davinci.model.Resource.Resource, {

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
