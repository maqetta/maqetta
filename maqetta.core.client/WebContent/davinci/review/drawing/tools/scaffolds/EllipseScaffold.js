define([
	"dojo/_base/declare",
	"./_ScaffoldCommon",
	"davinci/review/drawing/shapes/Ellipse"
], function(declare, _ScaffoldCommon, Ellipse) {
	
return declare("davinci.review.drawing.tools.scaffolds.EllipseScaffold", _ScaffoldCommon, {

	constructor: function(surface) {
		this.nwh = this._createHandler("nw");
		this.neh = this._createHandler("ne");
		this.seh = this._createHandler("se");
		this.swh = this._createHandler("sw");
		this._evtConns = [
		    dojo.connect(this.nwh, "mousedown", this, "onHandlerMouseDown"),
		    dojo.connect(this.neh, "mousedown", this, "onHandlerMouseDown"),
		    dojo.connect(this.seh, "mousedown", this, "onHandlerMouseDown"),
		    dojo.connect(this.swh, "mousedown", this, "onHandlerMouseDown")
		];
	},

	createShape: function(x, y, attributeMap) {
		this.shape = new Ellipse(this.surface, x, y, x + 1, y + 1, attributeMap);
		this.anchorPoint = {x: x, y: y};
		this.inherited(arguments);
		return this.shape;
	},

	transformShape: function(x, y) {
		this._transform(x, y);
		this.inherited(arguments);
	},

	wrapShape: function(shape, /*Boolean*/ isRewrap) {
		this.inherited(arguments);
		dojo.style(this.nwh, {"left": shape.x1 + "px", "top": shape.y1 + "px"});
		dojo.style(this.neh, {"left": shape.x2 + "px", "top": shape.y1 + "px"});
		dojo.style(this.seh, {"left": shape.x2 + "px", "top": shape.y2 + "px"});
		dojo.style(this.swh, {"left": shape.x1 + "px", "top": shape.y2 + "px"});
		if (!isRewrap) {
			this.surface.appendChild(this.nwh);
			this.surface.appendChild(this.neh);
			this.surface.appendChild(this.seh);
			this.surface.appendChild(this.swh);
		}
	},

	destroy: function() {
		dojo.destroy(this.nwh);
		dojo.destroy(this.neh);
		dojo.destroy(this.seh);
		dojo.destroy(this.swh);
		this.inherited(arguments);
	},

	onHandlerMouseMove: function(evt) {
		this._transform(evt.pageX, evt.pageY);
		this.inherited(arguments);
	},

	_transform: function(x, y) {
		var anchorPoint = this.anchorPoint, shape = this.shape;
		if (anchorPoint.x < x && anchorPoint.y < y) {
			this.anchorPoint = {x: shape.x1, y: shape.y1};
			shape.x2 = x; shape.y2 = y;
		} else if(anchorPoint.x > x && anchorPoint.y < y) {
			this.anchorPoint = {x: shape.x2, y: shape.y1};
			shape.x1 = x; shape.y2 = y;
		} else if(anchorPoint.x > x && anchorPoint.y > y) {
			this.anchorPoint = {x: shape.x2, y: shape.y2};
			shape.x1 = x; shape.y1 = y;
		} else if(anchorPoint.x < x && anchorPoint.y > y) {
			this.anchorPoint = {x: shape.x1, y: shape.y2};
			shape.x2 = x; shape.y1 = y;
		}
	}

});
});
