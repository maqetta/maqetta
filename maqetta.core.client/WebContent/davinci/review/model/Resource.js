define([
	"dojo/_base/lang",
	"davinci/review/model/resource/root"
], function(declare, root) {

var Resource = lang.mixin(davinci.review.model.Resource, {

	root: null,

	getRoot : function() {
		if (!this.root) {
			this.root = new root();
		}
		return this.root;
	},

	dateSortFilter : {
		filterList : function(list) {
			return list.sort(function (file1,file2) {
				return file1.timeStamp > file2.timeStamp ? -1 : file1.timeStamp < file2.timeStamp ? 1 : 0;
			});
		}
	}

});

return Resource;

});

 