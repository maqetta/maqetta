define([
	"dojo/_base/declare",
	"davinci/review/actions/_DrawingCommon",
	"davinci/review/Review"
], function(declare, _DrawingCommon, Review) {

var EllipseAction = declare("davinci.review.actions.EllipseAction", [_DrawingCommon], {

	run: function(context) {
		this.inherited(arguments);
		var commentPalette = dijit.byId("davinci.ui.comment");
		if(!commentPalette._commentForm.isShowing) {
			return;
		}
		var surface = this.doc.annotationSurface, 
		createTool = surface.createTool;

		createTool.deactivate();
		createTool.setShape("Ellipse", {
			colorAlias: surface.currentReviewer,
			a2c: dojo.hitch(Review, Review.getColor),
			commentId: surface.commentId,
			state: "",
			scene: ""
		});
		createTool.activate();
	}

});

return EllipseAction;

});
