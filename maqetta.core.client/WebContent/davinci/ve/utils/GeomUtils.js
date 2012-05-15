define([
	"dojo/_base/window",
	"dojo/dom-geometry"
], function(win, domGeom) {
	
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
		var MarginBoxPageCoords;
		var userWin = node.ownerDocument.defaultView;
		win.withDoc(node.ownerDocument, function(){
			var BorderBoxPageCoords = this.position(node);
			var MarginExtents = domGeom.getMarginExtents(node);
			MarginBoxPageCoords = {
					l:BorderBoxPageCoords.x - MarginExtents.l,
					t:BorderBoxPageCoords.y - MarginExtents.t,
					w:BorderBoxPageCoords.w + MarginExtents.l + MarginExtents.r,
					h:BorderBoxPageCoords.h + MarginExtents.t + MarginExtents.b
			};
		}.bind(this));
		return MarginBoxPageCoords;
	},
	
	/* Rewrite of Dojo's dom-geometry.position() to not use getBoundingClientRect()
	 * which messes up Maqetta in presence of CSS3 transforms. Maqetta's calculations
	 * are all based on CSS box model (margins, borders, padding, left/top)
	 * not the actual screen locations resulting after applying transforms.
	 */
	position: function(/*DomNode*/node){
		return {x: node.offsetLeft, y: node.offsetTop, w: node.offsetWidth, h: node.offsetHeight};
	}

};
});
