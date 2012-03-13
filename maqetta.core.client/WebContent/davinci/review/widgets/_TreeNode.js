define([
	"dojo/_base/declare",
	"dijit/Tree",
], function(declare, Tree) {

//WARNING: extends private dijit API
return declare(dijit._TreeNode, {
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
		dojo.style(this.containerNode, {display:"block"});
	}

});
});