define([
	"dojo/_base/declare",
	"davinci/ui/widgets/ToggleTree",
	"davinci/review/widgets/_TreeNode"
], function(declare, ToggleTree, _TreeNode) {
	
return declare("davinci.review.widgets.Tree", ToggleTree, {

	_createTreeNode: function(/*Object*/ args) {
		return new _TreeNode(args);
	}

});
});