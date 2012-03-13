define([
	"dojo/_base/declare",
	"davinci/ui/widgets/_ToggleTreeNode",
], function(declare, _ToggleTreeNode) {

return declare(_ToggleTreeNode, {

	postCreate: function() {
		this.inherited(arguments);

		var divDom = dojo.create("img", { 
			src: "app/dojo/resources/blank.gif",
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