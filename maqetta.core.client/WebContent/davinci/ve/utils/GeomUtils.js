define([
	"dojo/_base/window",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/has", 
	"dojo/_base/sniff"
], function(win, domGeom, domStyle, has, sniff) {

var tableElems = ['TABLE', 'TBODY', 'TR', 'TD', 'TH'];

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
			var MarginExtents = this.getMarginExtents(node);
			MarginBoxPageCoords = {
					l:BorderBoxPageCoords.l - MarginExtents.l,
					t:BorderBoxPageCoords.t - MarginExtents.t,
					w:BorderBoxPageCoords.w + MarginExtents.l + MarginExtents.r,
					h:BorderBoxPageCoords.h + MarginExtents.t + MarginExtents.b
			};
		}.bind(this));
		return MarginBoxPageCoords;
	},

	/**
	 * Same as getMarginBoxPageCoords, except it will use the cached version
	 * in node._maqMarginBoxPageCoords if present.
	 * If no cached version, then set the cached version to current marginbox values.
	 * @param {object} node  A dom node
	 * @returns {object}  margin box coordinates for given node
	 */
	getMarginBoxPageCoordsCached: function(node){
		if(!node._maqMarginBoxPageCoords){
			node._maqMarginBoxPageCoords = this.getMarginBoxPageCoords(node);
		}
		return node._maqMarginBoxPageCoords;
	},
	
	/* Rewrite of Dojo's dom-geometry.position() to not use getBoundingClientRect()
	 * which messes up Maqetta in presence of CSS3 transforms. Maqetta's calculations
	 * are all based on CSS box model (margins, borders, padding, left/top)
	 * not the actual screen locations resulting after applying transforms.
	 */
	getBorderBoxPageCoords: function(/*DomNode*/node){
		var o;
		win.withDoc(node.ownerDocument, function(){
			if(tableElems.indexOf(node.tagName)){
				var bcr = node.getBoundingClientRect();
				var scrollLeft = this.getScrollLeft(node);
				var scrollTop = this.getScrollTop(node);
				o = {l: bcr.left + scrollLeft, t: bcr.top + scrollTop, w: bcr.width, h: bcr.height};
			}else{
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
			}
		}.bind(this));
		return o;
	},

	/**
	 * Same as getBorderBoxPageCoords, except it will use the cached version
	 * in node._maqBorderBoxPageCoords if present.
	 * If no cached version, then set the cached version to current borderbox values.
	 * @param {object} node  A dom node
	 * @returns {object}  border box coordinates for given node
	 */
	getBorderBoxPageCoordsCached: function(node){
		if(!node._maqBorderBoxPageCoords){
			node._maqBorderBoxPageCoords = this.getBorderBoxPageCoords(node);
		}
		return node._maqBorderBoxPageCoords;
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
	},
	
	/**
	 * Maqetta-specific version of getMarginExtents because dojo's version
	 * always equates marginRight = marginLeft due to old Safari quirk.
	 * (Same signature as dom-geometry.js's getMarginExtents
	 */
	getMarginExtents: function getMarginExtents(/*DomNode*/node, computedStyle){
		var s = computedStyle || domStyle.getComputedStyle(node);
		var l, t, r, b;
		function px(value){
			return parseFloat(value) || 0;
		}
		if(s){
			l = px(s.marginLeft);
			t = px(s.marginTop);
			r = px(s.marginRight);
			b = px(s.marginBottom);
		}else{
			l = t = r = b = 0;
		}
		return {l: l, t: t, r: r, b: b, w: l + r, h: t + b};
	},
	
	/**
	 * Clear any cached geometry values for the given DOM node
	 * @param node  A DOM node
	 */
	clearGeomCache: function(node){
		delete node._maqBorderBoxPageCoords;
		delete node._maqMarginBoxPageCoords;		
	}


};
});
