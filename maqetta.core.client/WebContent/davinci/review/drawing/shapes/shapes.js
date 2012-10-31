define([
"./Arrow",
"./Rectangle",
"./Ellipse",
"./Text"
],
function(Arrow, Rectangle, Ellipse, Text) {

	var shapes = {};
	
	shapes.Arrow     = Arrow;
	shapes.Rectangle = Rectangle;
	shapes.Ellipse   = Ellipse;
	shapes.Text      = Text;

	return dojo.setObject("davinci.review.drawing.shapes", shapes);
});