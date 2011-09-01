dojo.provide("davinci.review.drawing.tools.HighlightTool");

dojo.require("davinci.review.drawing.tools._ToolCommon");

dojo.declare("davinci.review.drawing.tools.HighlightTool", davinci.review.drawing.tools._ToolCommon, {
	constructor: function(surface){
		surface.highlightTool = this;
	},
	
	activate: function(){
		if(this.activated) return;
		
		var shapes = this.surface.shapes;
		dojo.forEach(shapes, function(shape){
			shape.style({"opacity": "0.8", "cursor": ""});
		});
		
		this._evtSubs = [
			dojo.subscribe("/davinci/review/drawing/shapemouseover", this, "_onShapeMouseOver"),
			dojo.subscribe("/davinci/review/drawing/shapemouseout", this, "_onShapeMouseOut"),
			dojo.subscribe("/davinci/review/drawing/shapemousedown", this, "_onShapeMouseDown")
		];
		this.activated = true;
	},
	
	_onShapeMouseOver: function(shape, evt, surface){
		if(this.surface !== surface || this.surface.isDrawing){ return; }
		var shapes = this.surface.shapes;
		if(!this.shape){
			shape.style({"opacity": "0.5", "cursor": "pointer"});
		}
	},
	
	_onShapeMouseOut: function(shape, evt, surface){
		if(this.surface !== surface || this.surface.isDrawing){ return; }
		var shapes = this.surface.shapes;
		if(!this.shape){
			shape.style({"opacity": "1.0", "cursor": ""});
		}
	},
	
	_onShapeMouseDown: function(shape, evt, surface){
		if(this.surface !== surface || this.surface.isDrawing){ return; }
		if(this.shape === shape){
			shape.style({"opacity": "0.5"});
			this.shape = null;
		}else{
			shape.style({"opacity": "1.0"});
			this.shape = shape;
		}
		this.onShapeMouseDown(shape);
	},
	
	onShapeMouseDown: function(shape){
		// Placeholder
	},
	
	deactivate: function(){
		if(!this.activated) return;
		var shapes = this.surface.shapes;
		if(this.shape){
			dojo.forEach(shapes, function(shape){
				shape.style({"opacity": "1.0", "cursor": ""});
			});
		}
		dojo.forEach(this._evtSubs, dojo.unsubscribe);
		this.shape = null;
		this.activated = false;
	}
});
