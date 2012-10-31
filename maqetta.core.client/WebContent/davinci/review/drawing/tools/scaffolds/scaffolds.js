define([
	"dojo/_base/declare",
	"./ArrowScaffold",
	"./RectangleScaffold",
	"./EllipseScaffold",
	"./TextScaffold"
], function(declare, ArrowScaffold, RectangleScaffold, EllipseScaffold, TextScaffold) {

	var scaffolds = {};
	
	scaffolds.ArrowScaffold = ArrowScaffold;
	scaffolds.RectangleScaffold = RectangleScaffold;
	scaffolds.EllipseScaffold = EllipseScaffold;
	scaffolds.TextScaffold = TextScaffold;
	
	return dojo.setObject("davinci.review.drawing.tools.scaffolds", scaffolds);
});