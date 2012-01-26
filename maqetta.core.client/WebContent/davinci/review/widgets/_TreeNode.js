define([
	"dojo/_base/declare",
	"davinci/ui/widgets/_ToggleTreeNode",
], function(declare, _ToggleTreeNode) {

return declare("davinci.review.widgets._TreeNode", _ToggleTreeNode, {

	postCreate: function() {
		this.inherited(arguments);

		var location = davinci.Workbench.location().match(/http:\/\/.*:\d+\//);
		console.debug("review Tree @ "+location);
		var divDom = dojo.create("img", { 
			src: location + "maqetta/app/dojo/resources/blank.gif",
			"class":"deleteImg"
		});
		dojo.connect(divDom,"onclick", this, dojo.hitch(this, function() {
			dojo.publish("/davinci/review/deleteReviewFile", [this.item]);
		}));
		dojo.place(divDom, this.rowNode, "first");
		dojo.style(this.rowNode, {width:"99%"});
	}

});
});