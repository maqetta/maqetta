define([
	"dojo/_base/declare",
	"./_ShapeCommon"
], function(declare, _ShapeCommon) {
	
return declare("davinci.review.drawing.shapes.Rectangle", _ShapeCommon, {

	render: function(){ 
		if (!this.shapeNode) {
			this._createRectangle();
			this._evtConns.push(
				dojo.connect(this.shapeNode, "mouseover", this, "onMouseOver"),
				dojo.connect(this.shapeNode, "mouseout", this, "onMouseOut"),
				dojo.connect(this.shapeNode, "mousedown", this, "onMouseDown")
			);
		}
		this._transformRectangle();
		this.inherited(arguments);
	},

	_createRectangle: function() {
		this.shapeNode = dojo.create("div");
		this.width = Math.abs(this.x1 - this.x2);
		this.height = Math.abs(this.y1 - this.y2);
		dojo.style(this.shapeNode, {
			"position": "absolute",
			"padding": "0px",
			"margin": "0px",
			"border": "2px solid " + this.color,
			"width": this.width + "px",
			"height": this.height + "px",
			"MozBorderRadius": "10px",
			"WebkitBorderRadius": "10px",
			"borderRadius": "10px"
		});
		dojo.style(dojo.create("div", null, this.shapeNode), {
			"padding": "0px",
			"margin": "0px",
			"border": "none",
			"width": "100%",
			"height": "100%",
			"backgroundColor": this.color,
			"opacity": "0.05",
			"MozBorderRadius": "6px",
			"WebkitBorderRadius": "6px",
			"borderRadius": "6px"
		});
	},

	_transformRectangle: function() {
		this.width = Math.abs(this.x1 - this.x2);
		this.height = Math.abs(this.y1 - this.y2);
		dojo.style(this.shapeNode, {
			"left": this.x1 + "px",
			"top": this.y1 + "px",
			"width": this.width + "px",
			"height": this.height + "px"
		});
	}

});
});
