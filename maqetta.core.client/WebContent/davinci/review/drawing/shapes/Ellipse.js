define([
	"dojo/_base/declare",
	"./_ShapeCommon"
], function(declare, _ShapeCommon) {
	
return declare("davinci.review.drawing.shapes.Ellipse", _ShapeCommon, {

	render: function() {
		if (!this.shapeNode) {
			this._createEllipse();
			this._evtConns.push(
				dojo.connect(this.shapeNode, "mouseover", this, "onMouseOver"),
				dojo.connect(this.shapeNode, "mouseout", this, "onMouseOut"),
				dojo.connect(this.shapeNode, "mousedown", this, "onMouseDown")
			);
		}
		this._transformEllipse();
		this.inherited(arguments);
	},

	destroy: function() {
		this._innerEllipse = null;
		this.inherited(arguments);
	},

	_createEllipse: function() {
		this.shapeNode = dojo.create("div");
		var width = this.width = Math.abs(this.x1 - this.x2),
		height = this.height = Math.abs(this.y1 - this.y2),
		radius = this.radius = (width / 2 + 1) + "px " + (height / 2 + 1) + "px",
		radiusInner = (width / 2 - 1) + "px " + (height / 2 - 1) + "px";

		dojo.style(this.shapeNode, {
			"position": "absolute",
			"padding": "0px",
			"margin": "0px",
			"border": "2px solid " + this.color,
			"width": width + "px",
			"height": height + "px",
			"borderTopLeftRadius": radius,
			"borderTopRightRadius": radius,
			"borderBottomLeftRadius": radius,
			"borderBottomRightRadius": radius,
			"MozBorderRadiusTopleft": radius,
			"MozBorderRadiusTopright": radius,
			"MozBorderRadiusBottomleft": radius,
			"MozBorderRadiusBottomright": radius,
			"WebkitBorderTopLeftRadius": radius,
			"WebkitBorderTopRightRadius": radius,
			"WebkitBorderBottomLeftRadius": radius,
			"WebkitBorderBottomRightRadius": radius
		});
		this._innerEllipse = dojo.create("div", null, this.shapeNode);
		dojo.style(this._innerEllipse, {
			"padding": "0px",
			"margin": "0px",
			"border": "none",
			"width": "100%",
			"height": "100%",
			"backgroundColor": this.color,
			"opacity": "0.05",
			"borderTopLeftRadius": radiusInner,
			"borderTopRightRadius": radiusInner,
			"borderBottomLeftRadius": radiusInner,
			"borderBottomRightRadius": radiusInner,
			"MozBorderRadiusTopleft": radiusInner,
			"MozBorderRadiusTopright": radiusInner,
			"MozBorderRadiusBottomleft": radiusInner,
			"MozBorderRadiusBottomright": radiusInner,
			"WebkitBorderTopLeftRadius": radiusInner,
			"WebkitBorderTopRightRadius": radiusInner,
			"WebkitBorderBottomLeftRadius": radiusInner,
			"WebkitBorderBottomRightRadius": radiusInner
		});
	},

	_transformEllipse: function() {
		var width = this.width = Math.abs(this.x1 - this.x2),
		height = this.height = Math.abs(this.y1 - this.y2),
		radius = this.radius = (width / 2 + 1) + "px " + (height / 2 + 1) + "px",
		radiusInner = (width / 2 - 1) + "px " + (height / 2 - 1) + "px";
		dojo.style(this.shapeNode, {
			"left": this.x1 + "px",
			"top": this.y1 + "px",
			"width": width + "px",
			"height": height + "px",

			"borderTopLeftRadius": radius,
			"borderTopRightRadius": radius,
			"borderBottomLeftRadius": radius,
			"borderBottomRightRadius": radius,
			"MozBorderRadiusTopleft": radius,
			"MozBorderRadiusTopright": radius,
			"MozBorderRadiusBottomleft": radius,
			"MozBorderRadiusBottomright": radius,
			"WebkitBorderTopLeftRadius": radius,
			"WebkitBorderTopRightRadius": radius,
			"WebkitBorderBottomLeftRadius": radius,
			"WebkitBorderBottomRightRadius": radius
		});
		dojo.style(this._innerEllipse, {
			"left": this.x1 + "px",
			"top": this.y1 + "px",
			"borderTopLeftRadius": radiusInner,
			"borderTopRightRadius": radiusInner,
			"borderBottomLeftRadius": radiusInner,
			"borderBottomRightRadius": radiusInner,
			"MozBorderRadiusTopleft": radiusInner,
			"MozBorderRadiusTopright": radiusInner,
			"MozBorderRadiusBottomleft": radiusInner,
			"MozBorderRadiusBottomright": radiusInner,
			"WebkitBorderTopLeftRadius": radiusInner,
			"WebkitBorderTopRightRadius": radiusInner,
			"WebkitBorderBottomLeftRadius": radiusInner,
			"WebkitBorderBottomRightRadius": radiusInner
		});
	}

});
});