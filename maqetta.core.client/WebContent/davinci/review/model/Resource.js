define([
	"dojo/_base/declare",
	"davinci/review/model/resource/root"
], function(declare, root) {

var _root = null;

return {

	getRoot : function() {
		if (!_root) {
			_root = root;
		}
		return _root;
	},

	dateSortFilter : {
		filterList : function(list) {
			return list.sort(function (file1,file2) {
				return file1.timeStamp > file2.timeStamp ? -1 : file1.timeStamp < file2.timeStamp ? 1 : 0;
			});
		}
	}

};
});

 