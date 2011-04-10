dojo.provide("dojox.widget.BarGauge");

dojo.require("dojox.gfx");
dojo.require("dojox.widget.gauge._Gauge");

dojo.experimental("dojox.widget.BarGauge");

dojo.declare("dojox.widget.gauge.BarLineIndicator",[dojox.widget.gauge._Indicator],{
	width: 1,
	_getShapes: function(){
		// summary:
		//		Private function for generating the shapes for this indicator. An indicator that behaves the 
		//		same might override this one and simply replace the shapes (such as BarIndicator).
		if(!this._gauge){
			return null;
		}
		var v = this.value;
		if(v < this._gauge.min){v = this._gauge.min;}
		if(v > this._gauge.max){v = this._gauge.max;}
		var pos = this._gauge._getPosition(v);
		var shapes = [];
		if(this.width > 1){
			shapes[0] = this._gauge.surface.createRect({
				x:pos, 
				y:this._gauge.dataY + this.offset,
				width:this.width, 
				height:this.length
			});
			shapes[0].setStroke({color: this.color});
			shapes[0].setFill(this.color);
		}else{
			shapes[0] = this._gauge.surface.createLine({
				x1:pos, 
				y1:this._gauge.dataY + this.offset,
				x2:pos, 
				y2:this._gauge.dataY + this.offset + this.length
			});
			shapes[0].setStroke({color: this.color});
		}
		return shapes;
	},
	draw: function(/*Boolean?*/ dontAnimate){
		// summary: 
		//		Override of dojox.widget.gauge._Indicator.draw
		// dontAnimate: Boolean
		//		Indicates if the drawing should not be animated (vs. the default of doing an animation)
		var i;
		if(this.shapes){
			this._move(dontAnimate);
		}else{
			if(this.shapes){
				for(i=0; i<this.shapes.length; i++){
					this._gauge.surface.remove(this.shapes[i]);
				}
				this.shapes = null;
			}
			if(this.text){
				this._gauge.surface.rawNode.removeChild(this.text);
				this.text = null;
			}
	
			this.color = this.color || '#000000';
			this.length = this.length || this._gauge.dataHeight;
			this.width = this.width || 3;
			this.offset = this.offset || 0;
			this.highlight = this.highlight || '#4D4D4D';
			this.highlight2 = this.highlight2 || '#A3A3A3';
	
			this.shapes = this._getShapes(this._gauge, this);
			if(this.label){
				var v = this.value;
				if(v < this._gauge.min){v = this._gauge.min;}
				if(v > this._gauge.max){v = this._gauge.max;}
				var pos = this._gauge._getPosition(v);
				this.text = this._gauge.drawText(''+this.label, pos, this._gauge.dataY + this.offset - 5, 'middle','top', this.color, this.font);
			}
	
			for(i=0; i<this.shapes.length; i++){
				if(this.hover){
					this.shapes[i].getEventSource().setAttribute('hover',this.hover);
				}
				if(this.onDragMove && !this.noChange){
					this._gauge.connect(this.shapes[i].getEventSource(), 'onmousedown', this._gauge.handleMouseDown);
					this.shapes[i].getEventSource().style.cursor = 'pointer';
				}
			}
			this.currentValue = this.value;
		}
	},
	_move: function(/*Boolean?*/ dontAnimate){
		// summary: 
		//		Moves this indicator (since it's already been drawn once)
		// dontAnimate: Boolean
		//		Indicates if the drawing should not be animated (vs. the default of doing an animation)
		var v = this.value ;
		if(v < this.min){v = this.min;}
		if(v > this.max){v = this.max;}
		var c = this._gauge._getPosition(this.currentValue);
		this.currentValue = v;
		v = this._gauge._getPosition(v)-this._gauge.dataX;
		if(dontAnimate){
			this.shapes[0].applyTransform(dojox.gfx.matrix.translate(v-(this.shapes[0].matrix?this.shapes[0].matrix.dx:0),0));
		}else{
			var anim = new dojo.Animation({curve: [c, v], duration: this.duration, easing: this.easing});
			dojo.connect(anim, "onAnimate", dojo.hitch(this, function(jump){
				this.shapes[0].applyTransform(dojox.gfx.matrix.translate(jump-(this.shapes[0].matrix?this.shapes[0].matrix.dx:0),0));
			}));
			anim.play();
		}
	}
});
dojo.declare("dojox.widget.BarGauge",dojox.widget.gauge._Gauge,{
	// summary:
	//		a bar graph built using the dojox.gfx package.
	//
	// description:
	//		using dojo.gfx (and thus either SVG or VML based on what is supported), this widget
	//		builds a bar graph component, used to display numerical data in a familiar format.
	//
	// usage:
	//		<script type="text/javascript">
	//			dojo.require("dojox.widget.BarGauge");
	//			dojo.require("dijit.util.parser");
	//		</script>
	//		...
	//		<div 	dojoType="dojox.widget.BarGauge"
	//				id="testBarGauge"
	//				barGaugeHeight="55"
	//				dataY="25"
	//				dataHeight="25"
	//				dataWidth="225">
	//		</div>

	// dataX: Number
	// x position of data area (default 5)
	dataX: 5,

	// dataY: Number
	// y position of data area (default 5)
	dataY: 5,

	// dataWidth: Number
	// width of data area (default is bar graph width - 10)
	dataWidth: 0,

	// dataHeight: Number
	// height of data area (default is bar graph width - 10)
	dataHeight: 0,

	// _defaultIndicator: override of dojox.widget._Gauge._defaultIndicator
	_defaultIndicator: dojox.widget.gauge.BarLineIndicator,

	startup: function(){
		// handle settings from HTML by making sure all the options are
		// converted correctly to numbers 
		//
		// also connects mouse handling events

		if(this.getChildren){
			dojo.forEach(this.getChildren(), function(child){ child.startup(); });
		}

		if(!this.dataWidth){this.dataWidth = this.gaugeWidth - 10;}
		if(!this.dataHeight){this.dataHeight = this.gaugeHeight - 10;}

		this.inherited(arguments);
	},

	_getPosition: function(/*Number*/value){
		// summary:
		//		This is a helper function used to determine the position that represents
		//		a given value on the bar graph
		// value:	Number
		//			A value to be converted to a position for this bar graph.

		return this.dataX + Math.floor((value - this.min)/(this.max - this.min)*this.dataWidth);
	},

	_getValueForPosition: function(/*Number*/pos){
		// summary:
		//		This is a helper function used to determine the value represented by
		//		a position on the bar graph
		// pos:		Number
		//			A position to be converted to a value.
		return (pos - this.dataX)*(this.max - this.min)/this.dataWidth + this.min;
	},

	draw: function(){
		// summary:
		//		This function is used to draw (or redraw) the bar graph
		// description:
		//		Draws the bar graph by drawing the surface, the ranges, and the indicators.

		if(!this.surface){this.createSurface();}

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
		//		A range is either a dojox.widget.gauge.Range or an object
		//		with similar parameters (low, high, hover, etc.).
		if(range.shape){
			this.surface.remove(range.shape);
			range.shape = null;
		}

		var x1 = this._getPosition(range.low);
		var x2 = this._getPosition(range.high);
		var path = this.surface.createRect({x:x1, 
											y:this.dataY, 
											width:x2-x1, 
											height:this.dataHeight});
		if(dojo.isArray(range.color) || dojo.isString(range.color)){
			path.setStroke({color: range.color});
			path.setFill(range.color);
		}else if(range.color.type){
			// Color is a gradient
			var y = this.dataY + this.dataHeight/2;
			range.color.x1 = x1;
			range.color.x2 = x2;
			range.color.y1 = y;
			range.color.y2 = y;
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
		var value = this._getValueForPosition(x);
		if(this._rangeData){
			for(var i=0; (i<this._rangeData.length) && !range; i++){
				if((Number(this._rangeData[i].low) <= value) && (Number(this._rangeData[i].high) >= value)){
					range = this._rangeData[i];
				}
			}
		}
		return range;
	},

	_dragIndicator: function(/*Object*/ widget, /*Object*/ event){
		// summary:
		//		Handles the dragging of an indicator, including moving/re-drawing
		// get new value based on mouse position
		var pos = dojo.coords(widget.gaugeContent);
		var x = event.clientX - pos.x;
		var value = widget._getValueForPosition(x);
		if(value < widget.min){value = widget.min;}
		if(value > widget.max){value = widget.max;}
		// update the indicator
		widget._drag.value = value;
		// callback
		widget._drag.onDragMove(widget._drag);
		// redraw/move indicator(s)
		widget._drag.draw(true);
		dojo.stopEvent(event);
	}
});
