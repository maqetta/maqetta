define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"davinci/review/drawing/Surface",
	"davinci/review/drawing/tools/CreateTool",
	"davinci/review/drawing/tools/SelectTool",
	"davinci/review/drawing/tools/ExchangeTool",
	"davinci/review/drawing/tools/HighlightTool"
], function(declare, Action, Surface, CreateTool, SelectTool, ExchangeTool, HighlightTool){

return declare("davinci.review.actions._DrawingCommon", Action, {
	
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
});