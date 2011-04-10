dojo.provide("davinci.review.actions._DrawingCommon");

dojo.require("davinci.actions.Action");
dojo.require("davinci.review.drawing.Surface");
dojo.require("davinci.review.drawing.tools.CreateTool");
dojo.require("davinci.review.drawing.tools.SelectTool");
dojo.require("davinci.review.drawing.tools.ExchangeTool");
dojo.require("davinci.review.drawing.tools.HighlightTool");

dojo.declare("davinci.review.actions._DrawingCommon", davinci.actions.Action, {
	run: function(context){
		var e = davinci.Workbench.getOpenEditor(), ctx;
		if(e && e.getContext){
			ctx = e.getContext();
			var doc = this.doc = ctx.getDocument();
			if(!doc.annotationSurface){
				dojo.publish("/davinci/review/drawing/getsurface", [doc]);
			}
		}
		if(ctx.frame){
			// Review editor
			ctx.frame.contentWindow.focus();
		}else if(ctx._frameNode){
			// Page designer
			ctx._frameNode.contentWindow.focus();
		}
	}
});