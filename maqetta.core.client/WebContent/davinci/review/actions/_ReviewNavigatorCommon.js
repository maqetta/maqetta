define([
	"dojo/_base/declare",
	"davinci/actions/Action"
], function(declare, Action) {

var _ReviewNavigatorCommon = declare("davinci.review.actions._ReviewNavigatorCommon", [Action], {

	_getSelection: function(context) {
		var selection = null;
		if (context.getSelection) {
			selection = context.getSelection();
		} else {
			var reviewNavigatorPalette = dijit.byId("davinci.review.reviewNavigator");
			selection = reviewNavigatorPalette.getSelection();
		}
		return selection;
	},
	
	shouldShow: function(context) {
		return true;
	}
});

return _ReviewNavigatorCommon;

});
