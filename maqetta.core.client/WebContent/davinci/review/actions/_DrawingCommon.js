define([
	"dojo/_base/declare",
	"davinci/actions/Action"
], function(declare, Action) {
	
return declare("davinci.review.actions._DrawingCommon", [Action], {

	run: function(context) {
		var e = davinci.Workbench.getOpenEditor(), 
			ctx;

		if (e && e.getContext) {
			ctx = e.getContext();
		}
		if (ctx && ctx.frame) {
			// Review editor
			ctx.frame.contentWindow.focus();
		} else if (ctx && ctx._frameNode) {
			// Page designer
			ctx._frameNode.contentWindow.focus();
		}
	}

});
});