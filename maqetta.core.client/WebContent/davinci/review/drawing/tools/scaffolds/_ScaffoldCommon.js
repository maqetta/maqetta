define([
	    "dojo/_base/declare"
], function(declare) {
	
return declare("davinci.review.drawing.tools.scaffolds._ScaffoldCommon", null, {

	constructor: function(surface) {
		this.surface = surface;
	},

	createShape: function(x, y, attributeMap) {
		this.shape.render();
	},

	transformShape: function(x, y) {
		if (this.shape) {
			this.shape.render();
		}
	},

	wrapShape: function(shape, /*Boolean*/ isRewrap, /*Point*/ clickPoint) {
		this.shape = shape;
		if (!isRewrap) {
			this._clickPoint = clickPoint;
			this._onShapeMouseDown();
		}
	},

	moveShape: function(dx, dy) {
		var shape = this.shape;
		shape.x1 += dx; shape.y1 += dy;
		shape.x2 += dx; shape.y2 += dy;
		shape.render();
		this.wrapShape(shape, true);
	},

	removeShape: function() {
		this.surface.removeShape(this.shape);
		this.destroy();
	},

	onHandlerMouseMove: function(evt) {
		this.shape.render();
		this.wrapShape(this.shape, true);
	},

	destroy: function() {
		dojo.forEach(this._evtConns, dojo.disconnect);
		dojo.forEach(this._evtSubs, dojo.unsubscribe);
		this.activeHandler = this.shape = this.surface = null;
	},

	onHandlerMouseDown: function(evt) {
		var shape = this.shape;
		this.activeHandler = evt.target;
		switch(this.activeHandler.position){
		case "nw":
			this.anchorPoint = {x: shape.x2, y: shape.y2};
			break;
		case "ne":
			this.anchorPoint = {x: shape.x1, y: shape.y2};
			break;
		case "se":
			this.anchorPoint = {x: shape.x1, y: shape.y1};
			break;
		case "sw":
			this.anchorPoint = {x: shape.x2, y: shape.y1};
			break;
		}
		dojo.stopEvent(evt);
		this._mouseMoveHandler = dojo.connect(this.surface.domNode, "mousemove", this, "onHandlerMouseMove");
		this._mouseUpHandler = dojo.connect(this.surface.domNode, "mouseup", this, "_onHandlerMouseUp");
	},

	_onHandlerMouseUp: function(evt) {
		dojo.disconnect(this._mouseMoveHandler);
		dojo.disconnect(this._mouseUpHandler);
	},

	_onShapeMouseDown: function() {
		this._mouseMoveHandler = dojo.connect(this.surface.domNode, "mousemove", this, "_onShapeMouseMove");
		this._mouseUpHandler = dojo.connect(this.surface.domNode, "mouseup", this, "_onShapeMouseUp");
		this._evtConns.push(dojo.connect(this.surface.domNode, "keydown", this, "_onShapeKeyDown"));
	},

	_onShapeMouseMove: function(evt) {
		var dx = evt.pageX - this._clickPoint.x,
		dy = evt.pageY - this._clickPoint.y;
		this._clickPoint.x = evt.pageX;
		this._clickPoint.y = evt.pageY;
		this.moveShape(dx, dy);
	},

	_onShapeMouseUp: function(evt) {
		dojo.disconnect(this._mouseMoveHandler);
		dojo.disconnect(this._mouseUpHandler);
	},

	_onShapeKeyDown: function(evt) {
		// If the shape is in edit mode, not need to bother the key actions
		if(this.shape.editable){ 
			return;
		}
		dojo.stopEvent(evt);
		switch (evt.keyCode) {
		case dojo.keys.ESCAPE:
			this.destroy();
			break;
		case dojo.keys.DELETE:
		case dojo.keys.BACKSPACE:
			this.removeShape();
			break;
		case dojo.keys.LEFT_ARROW:
			this.moveShape(-2, 0);
			break;
		case dojo.keys.UP_ARROW:
			this.moveShape(0, -2);
			break;
		case dojo.keys.RIGHT_ARROW:
			this.moveShape(2, 0);
			break;
		case dojo.keys.DOWN_ARROW:
			this.moveShape(0, 2);
			break;
		}
	},

	_createHandler: function(/*String*/ position) {
		// summary:
		//		position: "w", "sw", "s", "se", "e", "ne", "n", "nw"
		var handler = dojo.create("div");
		this.handlerRadius = 3;
		dojo.style(handler, {
			"position": "absolute",
			"padding": "0px",
			"margin": "0px",
			"border": "1px solid black",
			"backgroundColor": "white",
			"width": (this.handlerRadius - 1) * 2 + "px",
			"height": (this.handlerRadius - 1) * 2 + "px",
			"MozBorderRadius": this.handlerRadius + "px",
			"WebkitBorderRadius": this.handlerRadius + "px",
			"borderRadius": this.handlerRadius + "px",
			"cursor": position + "-resize",
			"zIndex": 1000256
		});
		handler.position = position;
		return handler;
	}

});
});
