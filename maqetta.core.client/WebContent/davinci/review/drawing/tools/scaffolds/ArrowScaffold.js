define([
	"dojo/_base/declare",
	"./_ScaffoldCommon"
], function(declare, _ScaffoldCommon) {
	
return declare("davinci.review.drawing.tools.scaffolds.ArrowScaffold", _ScaffoldCommon, {

	constructor: function(surface) {
		this.tailHandler = this._createHandler("sw");
		this.headHandler = this._createHandler("ne");
		this._evtConns = [
		    dojo.connect(this.tailHandler, "mousedown", this, "onHandlerMouseDown"),
		    dojo.connect(this.headHandler, "mousedown", this, "onHandlerMouseDown")
		];
	},

	createShape: function(x, y, attributeMap) {
		this.shape = new davinci.review.drawing.shapes.Arrow(this.surface, x, y, x + 1, y + 1, attributeMap);
		this.inherited(arguments);
		return this.shape;
	},

	transformShape: function(x, y) {
		if (this.shape) {
			this.shape.x2 = x;
			this.shape.y2 = y;
		}
		this.inherited(arguments);
	},

	wrapShape: function(shape, /*Boolean*/ isRewrap) {
		this.inherited(arguments);
		dojo.style(this.tailHandler, { "left": shape.x1 - 3 + "px", "top": shape.y1 - 3 + "px" });
		dojo.style(this.headHandler, { "left": shape.x2 - 3 + "px", "top": shape.y2 - 3 + "px" });
		if (!isRewrap) {
			this.surface.appendChild(this.tailHandler);
			this.surface.appendChild(this.headHandler);
		}
	},

	destroy: function() {
		dojo.destroy(this.tailHandler);
		dojo.destroy(this.headHandler);
		this.tailHandler = this.headHandler = null;
		this.inherited(arguments);
	},

	onHandlerMouseMove: function(evt) {
		if (this.activeHandler.position == "sw") {
			this.shape.x1 = evt.pageX;
			this.shape.y1 = evt.pageY;
		} else {
			this.shape.x2 = evt.pageX;
			this.shape.y2 = evt.pageY;
		}
		this.inherited(arguments);
	}

});
});
