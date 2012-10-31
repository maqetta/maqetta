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
		var e = davinci.Workbench.getOpenEditor(); 
		var ctx = (e && e.getContext) ? e.getContext() : null;
		var surface = ctx ? ctx.surface : null;
		var createTool = surface ? surface.createTool : null;
		if(createTool){
			createTool.deactivate();
			createTool.setShape("Arrow", {
				colorAlias: surface.currentReviewerEmail,
				a2c: dojo.hitch(Review, Review.getColor),
				commentId: surface.commentId,
				state: "",
				stateList: "",
				scene: "",
				sceneList: ""
			});
			createTool.activate();
		}
	}

});

return ArrowAction;

});
