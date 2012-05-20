define([
	"dojo/_base/window",
	"dojo/dom-geometry",
	"dojo/has", 
	"dojo/_base/sniff"
], function(win, domGeom, has, sniff) {
	
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
		win.withDoc(node.ownerDocument, function(){
			var BorderBoxPageCoords = this.getBorderBoxPageCoords(node);
			var MarginExtents = domGeom.getMarginExtents(node);
			MarginBoxPageCoords = {
					l:BorderBoxPageCoords.l - MarginExtents.l,
					t:BorderBoxPageCoords.t - MarginExtents.t,
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
	getBorderBoxPageCoords: function(/*DomNode*/node){
		var o;
		win.withDoc(node.ownerDocument, function(){
			var l = node.offsetLeft;
			var t = node.offsetTop;
			var pn = node.parentNode;
			var opn = node.offsetParent;
			while(pn && pn.tagName != 'BODY'){
				if(typeof pn.scrollLeft == 'number' && typeof pn.scrollTop == 'number' ){
					l -= pn.scrollLeft;
					t -= pn.scrollTop;
				}
				if(pn == opn){
					var BorderExtents = domGeom.getBorderExtents(opn);
					l += opn.offsetLeft + BorderExtents.l;
					t += opn.offsetTop + BorderExtents.t;
					opn = opn.offsetParent;
				}
				pn = pn.parentNode;
			}
			o = {l: l, t: t, w: node.offsetWidth, h: node.offsetHeight};
		}.bind(this));
		return o;
	},
	
	/**
	 * Get what IE and WebKit implement as body.scrollLeft, but with special
	 * code for Mozilla, which has wrong value. Instead, use window.pageXOffset
	 */
	getScrollLeft: function(/*DomNode*/node){
		var doc = node && node.ownerDocument;
		if(has('mozilla')){
			var win = doc && doc.defaultView;
			return win ? win.pageXOffset : 0;
		}else{
			var body = doc && doc.body;
			return body ? body.scrollLeft : 0;
		}
	},
	
	/**
	 * Get what IE and WebKit implement as body.scrollTop, but with special
	 * code for Mozilla, which has wrong value. Instead, use window.pageYOffset
	 */
	getScrollTop: function(/*DomNode*/node){
		var doc = node && node.ownerDocument;
		if(has('mozilla')){
			var win = doc && doc.defaultView;
			return win ? win.pageYOffset : 0;
		}else{
			var body = doc && doc.body;
			return body ? body.scrollTop : 0;
		}
	}

};
});
