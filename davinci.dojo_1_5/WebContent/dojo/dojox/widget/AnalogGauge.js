dojo.provide("dojox.widget.AnalogGauge");

dojo.require("dojox.gfx");
dojo.require("dojox.widget.gauge._Gauge");

dojo.experimental("dojox.widget.AnalogGauge");

dojo.declare("dojox.widget.gauge.AnalogLineIndicator",[dojox.widget.gauge._Indicator],{
	_getShapes: function(){
		// summary:
		//		Private function for generating the shapes for this indicator. An indicator that behaves the 
		//		same might override this one and simply replace the shapes (such as ArrowIndicator).
		var shapes = [];
		shapes[0] = this._gauge.surface.createLine({x1: 0, y1: -this.offset, 
													x2: 0, y2: -this.length-this.offset})
					.setStroke({color: this.color, width: this.width});
		return shapes;
	},
	draw: function(/*Boolean?*/ dontAnimate){
		// summary: 
		//		Override of dojox.widget.gauge._Indicator.draw
		// dontAnimate: Boolean
		//		Indicates if the drawing should not be animated (vs. the default of doing an animation)
		if(this.shapes){
			this._move(dontAnimate);
		}else{
			if(this.text){
				this._gauge.surface.rawNode.removeChild(this.text);
				this.text = null;
			}

			var v = this.value;
			if(v < this._gauge.min){v = this._gauge.min;}
			if(v > this._gauge.max){v = this._gauge.max;}
			var a = this._gauge._getAngle(v);

			this.color = this.color || '#000000';
			this.length = this.length || this._gauge.radius;
			this.width = this.width || 1;
			this.offset = this.offset || 0;
			this.highlight = this.highlight || '#D0D0D0';

			this.shapes = this._getShapes(this._gauge, this);

			if(this.shapes){
				for(var s = 0; s < this.shapes.length; s++){
					this.shapes[s].setTransform([{dx:this._gauge.cx,dy:this._gauge.cy}, dojox.gfx.matrix.rotateg(a)]);
					if(this.hover){
						this.shapes[s].getEventSource().setAttribute('hover',this.hover);
					}
					if(this.onDragMove && !this.noChange){
						//TODO
						this._gauge.connect(this.shapes[s].getEventSource(), 'onmousedown', this._gauge.handleMouseDown);
						this.shapes[s].getEventSource().style.cursor = 'pointer';
					}
				}
			}
	
			if(this.label){
				var len=this.length+this.offset;
				var x=this._gauge.cx+(len+5)*Math.sin(this._gauge._getRadians(a));
				var y=this._gauge.cy-(len+5)*Math.cos(this._gauge._getRadians(a));
				var align = 'start';
				if(a <= -10){align = 'end';}
				if(a > -10 && a < 10){align='middle';}
				var vAlign = 'bottom';
				if((a < -90) || (a > 90)){vAlign = 'top';}
				this.text = this._gauge.drawText(''+this.label, x, y, align, vAlign, this.color, this.font);
			}
			this.currentValue = this.value;
		}
	},
	_move: function(/*Boolean?*/ dontAnimate){
		// summary: 
		//		Moves this indicator (since it's already been drawn once)
		// dontAnimate: Boolean
		//		Indicates if the drawing should not be animated (vs. the default of doing an animation)
		var v = this.value;
		if(v < this._gauge.min){v = this._gauge.min;}
		if(v > this._gauge.max){v = this._gauge.max;}
		var c = this.currentValue;
		if(dontAnimate){
			var angle = this._gauge._getAngle(v);
			for(var i in this.shapes){
				this.shapes[i].setTransform([{dx:this._gauge.cx,dy:this._gauge.cy}, dojox.gfx.matrix.rotateg(angle)]);
				if(this.hover){
					this.shapes[i].getEventSource().setAttribute('hover',this.hover);
				}
			}
		}else{
			if(c!=v){
				var anim = new dojo.Animation({curve: [c, v], duration: this.duration, easing: this.easing});
				dojo.connect(anim, "onAnimate", dojo.hitch(this, function(step){
					for(var i in this.shapes){
						this.shapes[i].setTransform([{dx:this._gauge.cx,dy:this._gauge.cy}, dojox.gfx.matrix.rotateg(this._gauge._getAngle(step))]);
						if(this.hover){
							this.shapes[i].getEventSource().setAttribute('hover',this.hover);
						}
					}
					this.currentValue = step;
				}));
				anim.play();
			}
		}
	}
});
dojo.declare("dojox.widget.AnalogGauge",dojox.widget.gauge._Gauge,{
	// summary:
	//		a gauge built using the dojox.gfx package.
	//
	// description:
	//		using dojo.gfx (and thus either SVG or VML based on what is supported), this widget
	//		builds a gauge component, used to display numerical data in a familiar format 
	//
	// usage:
	//		<script type="text/javascript">
	//			dojo.require("dojox.widget.AnalogGauge");
	//			dojo.require("dijit.util.parser");
	//		</script>
	//		...
	//		<div	dojoType="dojox.widget.AnalogGauge"
	//				id="testGauge"
	//				width="300"
	//				height="200"
	//				cx=150
	//				cy=175
	//				radius=125
	//				image="gaugeOverlay.png"
	//				imageOverlay="false"
	//				imageWidth="280"
	//				imageHeight="155"
	//				imageX="12"
	//				imageY="38">
	//		</div>

	// startAngle: Number
	// angle (in degrees) for start of gauge (default is -90)
	startAngle: -90,

	// endAngle: Number
	// angle (in degrees) for end of gauge (default is 90)
	endAngle: 90,

	// cx: Number
	// center of gauge x coordinate (default is gauge width / 2)
	cx: 0,

	// cy: Number
	// center of gauge x coordinate (default is gauge height / 2)
	cy: 0,

	// radius: Number
	// radius of gauge (default is smaller of cx-25 or cy-25)
	radius: 0,

	// _defaultIndicator: override of dojox.widget._Gauge._defaultIndicator
	_defaultIndicator: dojox.widget.gauge.AnalogLineIndicator,

	startup: function(){
		// handle settings from HTML by making sure all the options are
		// converted correctly to numbers and that we calculate defaults
		// for cx, cy and radius
		// also connects mouse handling events

		if(this.getChildren){
			dojo.forEach(this.getChildren(), function(child){ child.startup(); });
		}

		this.startAngle = Number(this.startAngle);
		this.endAngle = Number(this.endAngle);

		this.cx = Number(this.cx);
		if(!this.cx){this.cx = this.width/2;}
		this.cy = Number(this.cy);
		if(!this.cy){this.cy = this.height/2;}
		this.radius = Number(this.radius);
		if(!this.radius){this.radius = Math.min(this.cx,this.cy) - 25;}
		this._oppositeMiddle = (this.startAngle+this.endAngle)/2+180;

		this.inherited(arguments);
	},

	_getAngle: function(/*Number*/value){
		// summary:
		//		This is a helper function used to determine the angle that represents
		//		a given value on the gauge
		// value:	Number
		//			A value to be converted to an angle for this gauage.
		return (value - this.min)/(this.max - this.min)*(this.endAngle - this.startAngle) + this.startAngle;
	},

	_getValueForAngle: function(/*Number*/angle){
		// summary:
		//		This is a helper function used to determie the value represented by a
		//		given angle on the gauge
		// angle:	Number
		//			A angle to be converted to a value for this gauge.
		if(angle > this._oppositeMiddle){ angle -= 360; }
		return (angle - this.startAngle)*(this.max - this.min)/(this.endAngle - this.startAngle) + this.min;
	},

	_getRadians: function(/*Number*/angle){
		// summary:
		//		This is a helper function than converts degrees to radians
		// angle:	Number
		//			An angle, in degrees, to be converted to radians.
		return angle*Math.PI/180;
	},

	_getDegrees: function(/*Number*/radians){
		// summary:
		//		This is a helper function that converts radians to degrees
		// radians:	Number
		//			An angle, in radians, to be converted to degrees.
		return radians*180/Math.PI;
	},

	draw: function(){
		// summary:
		//		This function is used to draw (or redraw) the gauge.
		// description:
		//		Draws the gauge by drawing the surface, the ranges, and the indicators.
		var i;
		if(this._rangeData){
			for(i=0; i<this._rangeData.length; i++){
				this.drawRange(this._rangeData[i]);
			}
			if(this._img && this.image.overlay){
				this._img.moveToFront();
			}
		}
		if(this._indicatorData){
			for(i=0; i<this._indicatorData.length; i++){
				this._indicatorData[i].draw();
			}
		}
	},

	drawRange: function(/*Object*/range){
		// summary:
		//		This function is used to draw (or redraw) a range
		// description:
		//		Draws a range (colored area on the background of the gauge) 
		//		based on the given arguments.
		// range:
		//		A range is a dojox.widget.gauge.Range or an object
		//		with similar parameters (low, high, hover, etc.).
		var path;
		if(range.shape){
			this.surface.remove(range.shape);
			range.shape = null;
		}
		var a1;
		var a2;
		if((range.low == this.min) && (range.high == this.max) && ((this.endAngle - this.startAngle) == 360)){
			path = this.surface.createCircle({cx: this.cx, cy: this.cy, r: this.radius});
		}else{
			a1 = this._getRadians(this._getAngle(range.low));
			a2 = this._getRadians(this._getAngle(range.high));
			var x1=this.cx+this.radius*Math.sin(a1);
			var y1=this.cy-this.radius*Math.cos(a1);
			var x2=this.cx+this.radius*Math.sin(a2);
			var y2=this.cy-this.radius*Math.cos(a2);
			var big=0;
			if((a2-a1)>Math.PI){big=1;}

			path = this.surface.createPath();
			if(range.size){
				path.moveTo(this.cx+(this.radius-range.size)*Math.sin(a1),
							this.cy-(this.radius-range.size)*Math.cos(a1));
			}else{
				path.moveTo(this.cx,this.cy);
			}
			path.lineTo(x1,y1);
			path.arcTo(this.radius,this.radius,0,big,1,x2,y2);
			if(range.size){
				path.lineTo(this.cx+(this.radius-range.size)*Math.sin(a2),
							this.cy-(this.radius-range.size)*Math.cos(a2));
				path.arcTo((this.radius-range.size),(this.radius-range.size),0,big,0,
							this.cx+(this.radius-range.size)*Math.sin(a1),
							this.cy-(this.radius-range.size)*Math.cos(a1));
			}
			path.closePath();
		}

		if(dojo.isArray(range.color) || dojo.isString(range.color)){
			path.setStroke({color: range.color});
			path.setFill(range.color);
		}else if(range.color.type){
			// Color is a gradient
			a1 = this._getRadians(this._getAngle(range.low));
			a2 = this._getRadians(this._getAngle(range.high));
			range.color.x1 = this.cx+(this.radius*Math.sin(a1))/2;
			range.color.x2 = this.cx+(this.radius*Math.sin(a2))/2;
			range.color.y1 = this.cy-(this.radius*Math.cos(a1))/2;
			range.color.y2 = this.cy-(this.radius*Math.cos(a2))/2;
			path.setFill(range.color);
			path.setStroke({color: range.color.colors[0].color});
		}else{
			// We've defined a style rather than an explicit color
			path.setStroke({color: "green"});	// Arbitrary color, just have to indicate
			path.setFill("green");				// that we want it filled
			path.getEventSource().setAttribute("class", range.color.style);
		}
		if(range.hover){
			path.getEventSource().setAttribute('hover',range.hover);
		}
		range.shape = path;
	},

	getRangeUnderMouse: function(/*Object*/event){
		// summary:
		//		Determines which range the mouse is currently over
		// event:	Object
		//			The event object as received by the mouse handling functions below.
		var range = null;
		var pos = dojo.coords(this.gaugeContent);
		var x = event.clientX - pos.x;
		var y = event.clientY - pos.y;
		var r = Math.sqrt((y - this.cy)*(y - this.cy) + (x - this.cx)*(x - this.cx));
		if(r < this.radius){
			var angle = this._getDegrees(Math.atan2(y - this.cy, x - this.cx) + Math.PI/2);
			//if(angle > this.endAngle){angle = angle - 360;}
			var value = this._getValueForAngle(angle);
			if(this._rangeData){
				for(var i=0; (i<this._rangeData.length) && !range; i++){
					if((Number(this._rangeData[i].low) <= value) && (Number(this._rangeData[i].high) >= value)){
						range = this._rangeData[i];
					}
				}
			}
		}
		return range;
	},

	_dragIndicator: function(/*Object*/ widget, /*Object*/ event){
		// summary:
		//		Handles the dragging of an indicator, including moving/re-drawing
		// get angle for mouse position
		var pos = dojo.coords(widget.gaugeContent);
		var x = event.clientX - pos.x;
		var y = event.clientY - pos.y;
		var angle = widget._getDegrees(Math.atan2(y - widget.cy, x - widget.cx) + Math.PI/2);
		//if(angle > widget.endAngle){angle = angle - 360;}
		// get value and restrict to our min/max
		var value = widget._getValueForAngle(angle);
		if(value < widget.min){value = widget.min;}
		if(value > widget.max){value = widget.max;}
		// update the indicator
		widget._drag.value = value;
		widget._drag.currentValue = value;
		// callback
		widget._drag.onDragMove(widget._drag);
		// rotate indicator
		widget._drag.draw(true);
		dojo.stopEvent(event);
	}
});
