define([
	"dojo/_base/declare",
	"./TableMatrix"
], function(declare, TableMatrix) {

return declare(null, {
	getMarginBoxPageCoords: function(widget) {
		if (widget.type == "html.col") {
			var node = widget.domNode;
			var matrix = new TableMatrix(node);		
			var colIndex = matrix.getAdjustedColIndex(node);
			var span = matrix.getSpan(node);
			return matrix.getMarginBoxPageCoordsForColumns(colIndex, span);
		} else {
			console.error("ColHelper called with invalid widget type = " + widget.type);
			return null;
		}
	}
});

});