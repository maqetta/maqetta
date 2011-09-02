dojo.provide("davinci.review.drawing.shapes._ShapeCommon");

dojo.declare("davinci.review.drawing.shapes._ShapeCommon", null, {
	constructor: function(surface, x1, y1, x2, y2, attributeMap){
		this.surface = surface;
		this.x1 = x1 || 0;
		this.y1 = y1 || 0;
		this.x2 = x2 || 0;
		this.y2 = y2 || 0;
		this._evtConns = [];
		
		// this.a2c, this.color are not parts of attributeMap
		if(attributeMap.a2c && typeof attributeMap.a2c == "function"){
			this.color = attributeMap.a2c(attributeMap.colorAlias);
			delete attributeMap.a2c;
		}
		
		this.attributeMap = attributeMap;
		dojo.mixin(this, attributeMap);
		
		if(!this.color){ this.color = "black"; }
	},
	
	setVisible: function(visible){
		if(visible == "visible"){
			this.style({"visibility": "visible", "opacity": "1.0"});
		}else if(visible == "partial"){
			this.style({"visibility": "visible", "opacity": "0.1"});
		}else if(visible == "hidden"){
			this.style({"visibility": "hidden", "opacity": "1.0"});
		}
//		this.isVisible = visible;
	},
	
	style: function(style){
		dojo.style(this.shapeNode, style);
	},
	
	render: function(){
		this.surface.appendChild(this.shapeNode);
		this.style({"zIndex": "255"});
	},
	
	destroy: function(){
		dojo.forEach(this._evtConns, dojo.disconnect);
		dojo.destroy(this.shapeNode);
		this.shapeNode = null;
		this.surface = null;
	},
	
	onMouseOver: function(/*Event*/ evt){
		if(!this.surface.isDrawing){
			evt.stopPropagation();
		}
		dojo.publish("/davinci/review/drawing/shapemouseover", [this, evt, this.surface]);
	},
	
	onMouseOut: function(/*Event*/ evt){
		if(!this.surface.isDrawing){
			evt.stopPropagation();
		}
		dojo.publish("/davinci/review/drawing/shapemouseout", [this, evt, this.surface]);
	},
	
	onMouseDown: function(/*Event*/ evt){
		if(!this.surface.isDrawing){
			evt.stopPropagation();
		}
		dojo.publish("/davinci/review/drawing/shapemousedown", [this, evt, this.surface]);
	}
});