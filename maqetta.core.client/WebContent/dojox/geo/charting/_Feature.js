dojo.provide("dojox.geo.charting._Feature");
dojo.require("dojox.gfx.fx");

dojo.declare("dojox.geo.charting._Feature", null, {
	_isZoomIn: false,
	_isFocused: false,
	markerText:null,

	constructor: function(parent, name, shapeData){
		this.id = name;
		this.shape = parent.mapObj.createGroup();
		this.parent = parent;
		this.mapObj = parent.mapObj;
		this._bbox = shapeData.bbox;
		this._center = shapeData.center;
		//TODO: fill color would be defined by charting data and legend
		//this._defaultFill = ["#FFCE52", "#CE6342", "#63A584"][Math.floor(Math.random() * 3)];
		this._defaultFill = parent.defaultColor;
		this._highlightFill = parent.highlightColor;
		this._defaultStroke = {
			width: this._normalizeStrokeWeight(.5),
			color: "white"
		};
		this._scale = Math.min(this.parent.containerSize.w / this._bbox.w, this.parent.containerSize.h / this._bbox.h);
		
		var shapes = (dojo.isArray(shapeData.shape[0])) ? shapeData.shape : [shapeData.shape];
		dojo.forEach(shapes, function(points){
			this.shape.createPolyline(points).setStroke(this._defaultStroke).setFill(this._defaultFill);
		}, this);
	},
	setValue:function(value){
		this.value = value;
		if(this.parent.series.length != 0){
			for(var i = 0;i < this.parent.series.length;i++){
				var range = this.parent.series[i];
				if((value>=range.min)&&(value<range.max)){
					this._setFillWith(range.color);
					this._defaultFill = range.color;
				}
			}
		}
	},
	_setFillWith: function(color){
		var borders = (dojo.isArray(this.shape.children)) ? this.shape.children : [this.shape.children];
		dojo.forEach(borders, function(item){
			item.setFill(color);
		});
	},
	_setStrokeWith: function(stroke){
		var borders = (dojo.isArray(this.shape.children)) ? this.shape.children : [this.shape.children];
		dojo.forEach(borders, function(item){
			item.setStroke({
				color: stroke.color,
				width: stroke.width,
				join: "round"
			});
		});
	},
	_normalizeStrokeWeight: function(weight){
		var matrix = this.shape._getRealMatrix();
		return (dojox.gfx.renderer != "vml")?weight/(this.shape._getRealMatrix()||{xx:1}).xx:weight;
	},
	_onmouseoverHandler: function(evt){
		this.parent.onFeatureOver(this);
		this._setFillWith(this._highlightFill);
		this.mapObj.marker.show(this.id);
	},
	_onmouseoutHandler: function(){
		this._setFillWith(this._defaultFill);
		this.mapObj.marker.hide();
		dojo.style("mapZoomCursor", "display", "none");
	},
	_onmousemoveHandler: function(evt){
		if(this._isFocused){
			var evt = dojo.fixEvent(evt || window.event);
			dojo.style("mapZoomCursor", "left", evt.pageX + 12 + "px");
			dojo.style("mapZoomCursor", "top", evt.pageY + "px");
			dojo.byId("mapZoomCursor").className = (this._isZoomIn)?"mapZoomOut":"mapZoomIn";
			dojo.style("mapZoomCursor", "display", "block");
		}
	},
	_onclickHandler: function(){
		if(!this._isFocused){
			for (var name in this.mapObj.features){
				if (this.mapObj.features[name] != this){
					this.mapObj.features[name]._setStrokeWith(this._defaultStroke);
					this.mapObj.features[name]._setFillWith(this.mapObj.features[name]._defaultFill);
					this.mapObj.features[name]._isFocused = false;
					this.mapObj.features[name]._isZoomIn = false;
				}
			}
			this._focus();
		}
		else if (this._isZoomIn){
			this._zoomOut();
		}
		else {
			this._zoomIn();
		}
	},
	_focus: function(){
		this.shape._moveToFront();
		this._setStrokeWith({color:"black",width:this._normalizeStrokeWeight(2)});
		this.parent.onFeatureClick(this);
		this._isFocused = true;
	},
	_zoomIn: function(){
		var anim = dojox.gfx.fx.animateTransform({
			duration: 1000,
			shape: this.mapObj,
			transform: [{
				name: "translate",
				start: [-this.mapObj.currentBBox.x, -this.mapObj.currentBBox.y],
				end: [-this._bbox.x, -this._bbox.y]
			},{
				name: "scaleAt",
				start: [this.mapObj.currentScale, this.mapObj.currentBBox.x, this.mapObj.currentBBox.y],
				end: [this._scale, this._bbox.x, this._bbox.y]
			}]
		});
		dojo.connect(anim,"onEnd",this,function(){
			this._setStrokeWith({color:"black",width:this._normalizeStrokeWeight(2)});
			this.parent.onZoomEnd(this);
		});
		anim.play();
		this.mapObj.currentScale = this._scale;
		this.mapObj.currentBBox = {
			x: this._bbox.x,
			y: this._bbox.y
		};
		this._isZoomIn = true;
		dojo.byId("mapZoomCursor").className = "";
	},
	_zoomOut: function(){
		var anim = dojox.gfx.fx.animateTransform({
			duration: 1000,
			shape: this.mapObj,
			transform: [{
				name: "translate",
				start: [-this._bbox.x, -this._bbox.y],
				end: [-this.mapObj.boundBox[0], -this.mapObj.boundBox[1]]
			}, {
				name: "scaleAt",
				start: [this._scale, this._bbox.x, this._bbox.y],
				end: [this.mapObj.scale, this.mapObj.boundBox[0], this.mapObj.boundBox[1]]
			}]
		});
		dojo.connect(anim,"onEnd",this,function(){
			this._setStrokeWith({color:"black",width:this._normalizeStrokeWeight(2)});
		});
		anim.play();
		this.mapObj.currentScale = this.mapObj.scale;
		this.mapObj.currentBBox = {
			x: this.mapObj.boundBox[0],
			y: this.mapObj.boundBox[1]
		};
		this._isZoomIn = false;
		dojo.byId("mapZoomCursor").className = "";
	},
	
	init: function(){
		this.shape.rawNode.id = this.id;
		this.tooltip = null;
		this.shape.connect("onmouseover", this, this._onmouseoverHandler);
		this.shape.connect("onmouseout", this, this._onmouseoutHandler);
		this.shape.connect("onmousemove", this, this._onmousemoveHandler);
		this.shape.connect("onclick", this, this._onclickHandler);
	}
});
