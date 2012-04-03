define([
	"dojo/_base/declare",
	"davinci/review/actions/_DrawingCommon",
	"davinci/review/Review"
], function(declare, _DrawingCommon, Review) {

var ArrowAction = declare("davinci.review.actions.ArrowAction", [_DrawingCommon], {

	run: function(context) {
		this.inherited(arguments);
		var commentPalette = dijit.byId("davinci.ui.comment");
		if (!commentPalette._commentForm.isShowing) { 
			return; 
		}
		var surface = this.doc.annotationSurface, 
		createTool = surface.createTool;

		createTool.deactivate();
		createTool.setShape("Arrow", {
			colorAlias: surface.currentReviewer,
			a2c: dojo.hitch(Review, Review.getColor),
			commentId: surface.commentId,
			state: "",
			scene: ""
		});
		createTool.activate();
	}

});

return ArrowAction;

});
