define([
	"dojo/dom-geometry"
], function(domGeom) {
	
return /** @scope davinci.ve.utils.GeomUtils */ {

	/*
	 * Page geometry utilities
	 */

	/**
	 * Returns an object of form {l:, t:, w:, h: }
	 * with coordinates of the margin box for the given node
	 * in page absolute coordinates
	 * @param {object} node  A dom node
	 * @returns {object}  margin box coordinates for given node
	 */
	getMarginBoxPageCoords: function(node){
		var BorderBoxPageCoords = domGeom.position(node, true);
		var MarginExtents = domGeom.getMarginExtents(node);
		var MarginBoxPageCoords = {
				l:BorderBoxPageCoords.x - MarginExtents.l,
				t:BorderBoxPageCoords.y - MarginExtents.t,
				w:BorderBoxPageCoords.w + MarginExtents.l + MarginExtents.r,
				h:BorderBoxPageCoords.h + MarginExtents.t + MarginExtents.b
		};
		return MarginBoxPageCoords;
	}
};
});
