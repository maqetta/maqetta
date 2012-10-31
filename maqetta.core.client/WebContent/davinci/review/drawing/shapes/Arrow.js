define([
	"dojo/_base/declare",
	"./_ShapeCommon"
], function(declare, _ShapeCommon) {
	
return declare("davinci.review.drawing.shapes.Arrow", _ShapeCommon, {

	render: function() {
		if (!this.shapeNode) {
			this._createArrowBody();
			this._createArrowHead();
			this._evtConns.push(
				dojo.connect(this.shapeNode, "mouseover", this, "onMouseOver"),
				dojo.connect(this.shapeNode, "mouseout", this, "onMouseOut"),
				dojo.connect(this.shapeNode, "mousedown", this, "onMouseDown")
			);
		}
		this._transformArrowBody();
		this._transformArrowhead();
		this.inherited(arguments);
	},

	destroy: function() {
		this._triangle.right = this._triangle.left = null;
		this.inherited(arguments);
	},

	_createArrowBody: function() {
		this.shapeNode = dojo.create("div");
		dojo.style(this.shapeNode, {
			"position": "absolute",
			"padding": "0px",
			"margin": "0px",
			"border": "1px solid " + this.color,
			"height": "0px",
			"MozTransformOrigin": "0 0",
			"WebkitTransformOrigin": "0 0"
		});
	},

	_createArrowHead: function() {
		this._triangle = {};
		this._triangle.left = dojo.create("div", null, this.shapeNode);
		dojo.style(this._triangle.left, {
			"position": "absolute",
			"top": "-1px",
			"padding": "0px",
			"margin": "0px",
			"border": "1px solid " + this.color,
			"height": "0px",
			"width": "15px",
			"MozTransformOrigin": "100% 100%",
			"WebkitTransformOrigin": "100% 100%",
			"MozTransform": "rotate(15deg)",
			"WebkitTransform": "rotate(15deg)"
		});
		this._triangle.right = dojo.create("div", null, this.shapeNode);
		dojo.style(this._triangle.right, {
			"position": "absolute",
			"top": "-1px",
			"padding": "0px",
			"margin": "0px",
			"border": "1px solid " + this.color,
			"height": "0px",
			"width": "15px",
			"MozTransformOrigin": "100% 100%",
			"WebkitTransformOrigin": "100% 100%",
			"MozTransform": "rotate(-15deg)",
			"WebkitTransform": "rotate(-15deg)"
		});
	},

	_transformArrowBody: function() {
		this.angle = 90 - (180 / Math.PI) * Math.atan((this.x1 - this.x2)/(this.y1 - this.y2));
		if (isNaN(this.angle)) { 
			this.angle = 0;
		}
		if (this.y2 <= this.y1) {
			this.angle = this.angle + 180;
		}
		this.length = Math.sqrt(Math.pow(this.x1 - this.x2, 2) + Math.pow(this.y1 - this.y2, 2));
		dojo.style(this.shapeNode, {
			"left": this.x1 + "px",
			"top": this.y1 + "px",
			"width": this.length + "px",
			"MozTransformOrigin": "0 0",
			"WebkitTransformOrigin": "0 0",
			"MozTransform": "rotate(" + this.angle + "deg)",
			"WebkitTransform": "rotate(" + this.angle + "deg)"
		});
	},

	_transformArrowhead: function() {
		dojo.style(this._triangle.left, {
			"left": this.length - 17 + "px"
		});
		dojo.style(this._triangle.right, {
			"left": this.length - 17 + "px"
		});
	}

});
});
