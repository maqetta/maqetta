define([
	"dojo/_base/declare",
	"./TableMatrix"
], function(declare, TableMatrix) {

return declare(null, {
	getMarginBoxPageCoords: function(widget) {
		if (widget.type == "html.colgroup") {
			var node = widget.domNode;
			var matrix = new TableMatrix(node);		
			var span = matrix.getSpan(node);
			if (span == 1) {
				//Let's inspect the child <col> elements
				span = 0;
				dojo.forEach(matrix.cols, function(col) {
					span = span + matrix.getSpan(col);
				}.bind(this));
			}
			return matrix.getMarginBoxPageCoordsForColumns(0, span);
		} else {
			console.error("ColGroupHelper called with invalid widget type = " + widget.type);
			return null;
		}
	}
});

});