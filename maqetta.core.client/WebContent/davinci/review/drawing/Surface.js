define([
	    "dojo/_base/declare"
], function(declare) {
	
return declare("davinci.review.drawing.Surface", null, {

	constructor: function(canvas, /*Document?*/ doc, context) {
		doc = doc || dojo.doc;
		this.canvas = canvas;
		this.context = context;
		this.domNode = canvas === doc.body ? doc : canvas;
		this._tools = [];
		this.shapes = [];
	},

	activate: function() {
		// Set the surface to be ready for drawing
		if(this.highlightTool){
			this.highlightTool.deactivate();
		}
		this.isActivated = true;
	},

	deactivate: function() {
		// Close the surface and disable drawing
		if(this.highlightTool){
			this.highlightTool.activate();
		}
		this.isActivated = false;
	},

	setValueByAttribute: function(/*String*/ attrName, /*Object*/ value, /*String*/targetAttrName, /*Object*/ targetValue) {
		dojo.forEach(this.shapes, function(shape) {
			if (shape[attrName] && shape[attrName] == value) {
				shape[targetAttrName] = targetValue;
			}
		});
	},

	getShapesByAttribute: function(/*String?*/ attrName, /*Array*/ values) {
		var shapes = [];
		dojo.forEach(this.shapes, function(shape) {
			if (!attrName || !values || shape[attrName] && dojo.some(values, function(value) { return shape[attrName] == value; })) {
				shapes.push(shape);
			}
		});
		return shapes;
	},

	style: function(style) {
		var tagName = this.canvas.tagName;
		if (tagName && tagName.toLowerCase() == "body") {
			dojo.style(this.canvas, style);
		} else {
			dojo.style(this.domNode, style);
		}
	},

	appendShape: function(shape) {
		this.shapes.push(shape);
	},

	removeShape: function(shape) {
		if (this.selectTool) {
			this.selectTool.deselectShape();
		}
		for (var i = 0; i < this.shapes.length; i++) {
			if (this.shapes[i] === shape) {
				shape.destroy();
				if (i == this.shapes.length - 1) {
					this.shapes.pop();
				} else {
					this.shapes[i] = this.shapes.pop();
				}
			}
		}
	},

	clear: function() {
		if (this.selectTool) {
			this.selectTool.deselectShape();
		}
		dojo.forEach(this.shapes, function(shape) {
			shape.destroy();
		});
		this.shapes = [];
	},

	// summary:
	//		tags: protected
	appendChild: function(child) {
		return this.canvas.appendChild(child);
	},

	// summary:
	//		tags: protected
	removeChild: function(child) {
		return this.canvas.removeChild(child);
	},

	destroy: function() {
		if (this.selectTool) {
			this.selectTool.deactivate();
			this.selectTool.destroy();
		}
		if (this.createTool) {
			this.createTool.deactivate();
			this.createTool.destroy();
		}
		if (this.exchangeTool) {
			this.exchangeTool.destroy();
		}
		if (this.highlightTool) {
			this.highlightTool.deactivate();
			this.highlightTool.destroy();
		}
		dojo.forEach(this.shapes, function(shape) {
			shape.destroy();
		});
	}

});
});
