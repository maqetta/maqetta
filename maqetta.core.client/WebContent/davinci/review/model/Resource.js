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
	}};
});

 