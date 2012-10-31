define([
	"dojo/_base/declare",
	"./_ToolCommon",
	"./scaffolds/scaffolds",
	"../shapes/shapes"
], function(declare, _ToolCommon, scaffolds, shapes) {
	
return declare("davinci.review.drawing.tools.SelectTool", _ToolCommon, {

	constructor: function(surface, filterAttributes) {
		surface.selectTool = this;
	},

	hasPermission: function(shape) {
		var surface = this.surface, secAttrs = this.filterAttributes;
		return dojo.every(secAttrs, function(attr) {
			return shape[attr] && surface[attr] && shape[attr] == surface[attr];
		});
	},

	selectShape: function(shape, /*Boolean*/ isReselect, /*Point*/ clickPoint) {
		this.deselectShape(); // Deselect the previous one first
		this.shape = shape;
		if (!isReselect) {
			if (shape.isInstanceOf(shapes.Arrow)) {
				this.scaffold = new scaffolds.ArrowScaffold(this.surface);
			} else if(shape.isInstanceOf(shapes.Rectangle)) {
				this.scaffold = new scaffolds.RectangleScaffold(this.surface);
			} else if(shape.isInstanceOf(shapes.Ellipse)) {
				this.scaffold = new scaffolds.EllipseScaffold(this.surface);
			} else if(shape.isInstanceOf(shapes.Text)) {
				this.scaffold = new scaffolds.TextScaffold(this.surface);
			} else {
				new Error("Invalid shape type!");
			}
		}
		this.scaffold.wrapShape(shape, isReselect, clickPoint);
		dojo.publish("/davinci/review/drawing/selectshape", [shape, this.surface]);
	},

	deselectShape: function() {
		if (this.scaffold) { 
			this.scaffold.destroy();
		}
		var shape = this.shape;
		this.scaffold = this.shape = null;
		dojo.publish("/davinci/review/drawing/deselectshape", [shape, this.surface]);
	},

	removeShape: function() {
		if (this.scaffold) {
			this.scaffold.removeShape();
		}
		this.deselectShape(); //we want to fire a selection changed event
	},

	activate: function() {
		this._evtSubs = [
			dojo.subscribe("/davinci/review/drawing/shapemouseover", this, "_onShapeMouseOver"),
			dojo.subscribe("/davinci/review/drawing/shapemouseout", this, "_onShapeMouseOut"),
			dojo.subscribe("/davinci/review/drawing/shapemousedown", this, "_onShapeMouseDown")
		];
		this._evtConns = [
			dojo.connect(this.surface.domNode, "mousedown", this, "deselectShape")
		];
	},

	_onShapeMouseOver: function(shape, evt, surface) {
		if (this.surface === surface && !this.surface.isDrawing && !shape.editable && this.hasPermission(shape)) {
			shape.style({"cursor": "move"});
		}
	},

	_onShapeMouseOut: function(shape, evt, surface) {
		if (this.surface === surface && !this.surface.isDrawing && !shape.editable && this.hasPermission(shape)) {
			shape.style({"cursor": ""});
		}
	},

	_onShapeMouseDown: function(shape, evt, surface) {
		// If the shape is in edit mode, not need to bother the select action
		if (this.surface === surface && !this.surface.isDrawing && !shape.editable && this.hasPermission(shape)) {
			dojo.stopEvent(evt);
			this.selectShape(shape, false, {x: evt.pageX, y: evt.pageY});
		}
	},

	deactivate: function() {
		this.deselectShape();
		this.inherited(arguments);
	}

});
});
