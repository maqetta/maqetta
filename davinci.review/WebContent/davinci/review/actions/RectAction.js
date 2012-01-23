define([
	"dojo/_base/declare",
	"davinci/review/actions/_DrawingCommon"
], function(declare, _DrawingCommon){

return declare("davinci.review.actions.RectAction", _DrawingCommon, {

	run: function(context){
		this.inherited(arguments);
		var commentPalette = dijit.byId("davinci.review.comment");
		if(!commentPalette._commentForm.isShowing) return;
		var surface = this.doc.annotationSurface, createTool = surface.createTool;
		createTool.deactivate();
		createTool.setShape("Rectangle", {
			colorAlias: surface.currentReviewer,
			a2c: dojo.hitch(davinci.review.Runtime, davinci.review.Runtime.getColor),
			commentId: surface.commentId,
			state: ""
		});
		createTool.activate();
	}
});
});
