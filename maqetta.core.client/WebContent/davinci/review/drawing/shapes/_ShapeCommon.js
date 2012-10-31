define([
	"dojo/_base/declare"
], function(declare){
	
return declare("davinci.review.drawing.shapes._ShapeCommon", null, {

	constructor: function(surface, x1, y1, x2, y2, attributeMap) {
		this.surface = surface;
		this.x1 = x1 || 0;
		this.y1 = y1 || 0;
		this.x2 = x2 || 0;
		this.y2 = y2 || 0;
		this._evtConns = [];

		// this.a2c, this.color are not parts of attributeMap
		if (attributeMap.a2c && typeof attributeMap.a2c == "function") {
			this.color = attributeMap.a2c(attributeMap.colorAlias);
			delete attributeMap.a2c;
		}

		this.attributeMap = attributeMap;
		dojo.mixin(this, attributeMap);

		if (!this.color) { 
			this.color = "black";
		}
	},

	setVisible: function(visible) {
		if (visible == "visible") {
			this.style({"visibility": "visible", "opacity": "1.0"});
		} else if (visible == "partial") {
			this.style({"visibility": "visible", "opacity": "0.1"});
		} else if (visible == "hidden") {
			this.style({"visibility": "hidden", "opacity": "1.0"});
		}
	},

	style: function(style) {
		var context = this.surface && this.surface.context;
		if(!context || !context._domIsReady){
			return;
		}
/* 20120503 - Delete this setTimeout code below if we don't notice any redraw problems
		//FIXME: Quick hack before Preview 4. For some reason, sometimes this.shapeNode doesn't yet
		// have a defaultView at this point. If it doesn't, try again within a setTimeout().
*/
		if (this.shapeNode && this.shapeNode.ownerDocument && this.shapeNode.ownerDocument.defaultView) {
			dojo.style(this.shapeNode, style);
		} else {
			console.error('this.shapeNode.ownerDocument.defaultView has no value');
/* 20120503 - Delete this setTimeout code below if we don't notice any redraw problems
			var that = this;
			setTimeout(function() {
				if (that.shapeNode && that.shapeNode.ownerDocument && that.shapeNode.ownerDocument.defaultView) {
					dojo.style(that.shapeNode, style);
				} else {
					console.error('this.shapeNode.ownerDocument.defaultView has no value after setTimeout');
				}
			},10);
*/
		}

	},

	render: function() {
		this.surface.appendChild(this.shapeNode);
		this.style({"zIndex": "1000255"});
	},

	destroy: function() {
		dojo.forEach(this._evtConns, dojo.disconnect);
		dojo.destroy(this.shapeNode);
		this.shapeNode = null;
		this.surface = null;
	},

	onMouseOver: function(/*Event*/ evt) {
		if (!this.surface.isDrawing) {
			evt.stopPropagation();
		}
		dojo.publish("/davinci/review/drawing/shapemouseover", [this, evt, this.surface]);
	},

	onMouseOut: function(/*Event*/ evt) {
		if (!this.surface.isDrawing) {
			evt.stopPropagation();
		}
		dojo.publish("/davinci/review/drawing/shapemouseout", [this, evt, this.surface]);
	},

	onMouseDown: function(/*Event*/ evt) {
		if (!this.surface.isDrawing) {
			evt.stopPropagation();
		}
		dojo.publish("/davinci/review/drawing/shapemousedown", [this, evt, this.surface]);
	}

});
});