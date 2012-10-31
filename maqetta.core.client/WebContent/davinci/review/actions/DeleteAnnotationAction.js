define([
	"dojo/_base/declare",
	"davinci/review/actions/_DrawingCommon",
	"davinci/review/Review"
], function(declare, _DrawingCommon, Review) {

var DeleteAnnotationAction = declare("davinci.review.actions.DeleteAnnotationAction", [_DrawingCommon], {

	run: function(context) {
		this.inherited(arguments);
		var commentPalette = dijit.byId("davinci.ui.comment");
		if (!commentPalette._commentForm.isShowing) { 
			return; 
		}
		var e = davinci.Workbench.getOpenEditor(); 
		var ctx = (e && e.getContext) ? e.getContext() : null;
		var surface = ctx ? ctx.surface : null;
		var selectTool = surface ? surface.selectTool : null;
		if (selectTool && selectTool.shape) {
			surface.removeShape(selectTool.shape);
		}
	},

	isEnabled: function(context) {
		var e = davinci.Workbench.getOpenEditor(); 
		var ctx = (e && e.getContext) ? e.getContext() : null;
		var surface = ctx ? ctx.surface : null;
		var selectTool = surface ? surface.selectTool : null;
		return selectTool && selectTool.shape;
	}

});

return DeleteAnnotationAction;

});
