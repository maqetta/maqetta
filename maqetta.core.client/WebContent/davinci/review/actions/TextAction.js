define([
	"dojo/_base/declare",
	"davinci/review/actions/_DrawingCommon",
	"davinci/Runtime"
], function(declare, _DrawingCommon, Runtime) {

var TextAction = declare("davinci.review.actions.TextAction", [_DrawingCommon], {

	run: function(context) {
		this.inherited(arguments);
		var commentPalette = dijit.byId("davinci.ui.comment");
		if (!commentPalette._commentForm.isShowing) {
			return;
		}
		var surface = this.doc.annotationSurface, 
		createTool = surface.createTool;

		createTool.deactivate();
		createTool.setShape("Text", {
			colorAlias: surface.currentReviewer,
			a2c: dojo.hitch(Runtime, Runtime.getColor),
			commentId: surface.commentId,
			state: "",
			scene: ""
		});
		createTool.activate();
	}

});

return TextAction;

});
