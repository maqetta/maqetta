define(["dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","dojo/_base/html","dojo/_base/event","dojo/_base/connect", "dijit", "dijit/_Widget", "dojox/gfx", "dojo/fx/easing", "./Range"], 
function(dojo,ddeclare,dlang,dhtml,devent,dconnect,dijit,_Widget,gfx,easing,range) { 

dojo.experimental("dojox.gauges._Gauge");

return dojo.declare("dojox.gauges._Gauge",[_Widget],{
	// summary:
	//		a gauge built using the dojox.gfx package.
	//
	// description:
	//		using dojo.gfx (and thus either SVG or VML based on what is supported), this widget
	//		builds a gauge component, used to display numerical data in a familiar format
	//
	// usage:
	//		this widget is not to be used alone. it is meant to be subclassed, such as
	//		dojox.gauges.BarGauge or dojox.gauges.AnalogGauge

	// width: Number
	// the width of the gauge (default is 300)
	width: 0,

	// height: Number
	// the height of the gauge (default is 200)
	height: 0,

	// background: Object
	// the color of the background.  This must be an object of one of two forms:
	// {'color': 'color-name'}
	// OR
	// (for a gradient:)
	// {'type': 'linear', 'x1': 0, 'x2': 0, 'y1': 0, 'y2': 200, 'colors': [{offset: 0, color:'#C0C0C0'}, {offset: 1, color: '#E0E0E0'}] }
	background: null,

	// image: String
	// background image for gauge (default is no image)
	image: null,

	// useRangeStyles: Number
	// indicates whether to use given css classes (dojoxGaugeRangeXX)
	// to determine the color (and other style attributes?) of the ranges
	// this value should be the number of dojoxGaugeRange classes that are
	// defined, starting at dojoxGaugeRange1 (0 indicates falling to default
	// hardcoded colors)
	useRangeStyles: 0,

	// useTooltip: Boolean
	// indicates whether tooltips should be displayed for ranges, indicators, etc.
	useTooltip: true,
	
	// majorTicks: Object
	// An object representing the tick marks that should be added to the gauge. Major tick marks have a text label
	// indicating the value.  The object can have the following attributes (required are marked with a *):
	//		offset: the distance from the 'center' of the gauge.  Used differently for Analog vs. Bar
	//		width: The width of the mark
	//		length: The length of the mark
	//		interval: The interval the ticks should be added on
	//		color: The color of the mark and text
	//		font: an object with any/all of the following parameters:
	//			{family: "Helvetica", style: "italic", variant: 'small-caps', weight: 'bold', size: "18pt"}
	majorTicks: null,
	
	// minorTicks: Object
	// An object of the same format as majorTicks, indicating where the minor (label-less) marks should be placed
	// The font parameter is ignored if provided since minor tick marks have no text label.
	minorTicks: null,

	// _defaultIndicator: Objection
	// Should be overridden by any extending classes and used to indicate what the 'default' indicator is.
	// This object is used as the indicator when creating tick marks or when an anonymous object is passed into 
	// addIndicator.
	_defaultIndicator: null,

	// defaultColors: Array
	// Set of default colors to color ranges with.
	defaultColors: [[0x00,0x54,0xAA,1],
					[0x44,0x77,0xBB,1],
					[0x66,0x99,0xCC,1],
					[0x99,0xBB,0xEE,1],
					[0x99,0xCC,0xFF,1],
					[0xCC,0xEE,0xFF,1],
					[0xDD,0xEE,0xFF,1]],
	
	// min: Number
	// The minimum value of the gauge.  Normally not set explicitly, as it will be determined by
	// the ranges that are added.
	min: null,
	
	// max: Number
	// The maximum value of the gauge.  Normally not set explicitly, as it will be determined by
	// the ranges that are added.
	max: null,
	
	// surface: Object
	// The GFX surface that the shapes are drawn on.  Can be accessed/used by indicators to draw themselves
	surface: null,

	// hideValues: Boolean
	// indicates whether the text boxes showing the value of the indicator (as text
	// content) should be hidden or shown.  Default is not hidden, aka shown.
	hideValues: false,

	// internal data
	gaugeContent: undefined,
	_backgroundDefault: {color: '#E0E0E0'},
	_rangeData: null,
	_indicatorData: null,
	_drag: null,
	_img: null,
	_overOverlay: false,
	_lastHover: '',

	isContainer: true,

	startup: function(){
		// handle settings from HTML by making sure all the options are
		// converted correctly to numbers and that we calculate defaults
		// for cx, cy and radius
		if(this.image === null){
			this.image={};
		}
		
		this.connect(this.gaugeContent, 'onmousedown', this.handleMouseDown);
		this.connect(this.gaugeContent, 'onmousemove', this.handleMouseMove);
		this.connect(this.gaugeContent, 'onmouseover', this.handleMouseOver);
		this.connect(this.gaugeContent, 'onmouseout', this.handleMouseOut);
		this.connect(this.gaugeContent, 'touchstart', this.handleTouchStart);
		this.connect(this.gaugeContent, 'touchend', this.handleTouchEnd);
		this.connect(this.gaugeContent, 'touchmove', this.handleTouchMove);	

		if(!dojo.isArray(this.ranges)){ this.ranges = []; }
		if(!dojo.isArray(this.indicators)){ this.indicators = []; }
		var ranges = [], indicators = [];
		var i;
		if(this.hasChildren()){
			var children = this.getChildren();
			for(i=0; i<children.length; i++){
				if(/.*Indicator/.test(children[i].declaredClass)){
					indicators.push(children[i]);
					//this.addIndicator(children[i]);
					continue;
				}

				switch(children[i].declaredClass){
					case range.prototype.declaredClass:
						ranges.push(children[i]);
						break;
				}
			}
			this.ranges = this.ranges.concat(ranges);
			this.indicators = this.indicators.concat(indicators);
		}
		if(!this.background){ this.background = this._backgroundDefault; }
		this.background = this.background.color || this.background;
		if(!this.surface){ this.createSurface(); }

		this.addRanges(this.ranges);
		if(this.minorTicks && this.minorTicks.interval){
			this.setMinorTicks(this.minorTicks);
		}
		if(this.majorTicks && this.majorTicks.interval){
			this.setMajorTicks(this.majorTicks);
		}
		for(i=0; i<this.indicators.length; i++){
			this.addIndicator(this.indicators[i]);
		}
		this.inherited(arguments);
	},
	
	hasChildren: function(){
		// summary:
		//		Returns true if widget has children, i.e. if this.containerNode contains something.
		return this.getChildren().length > 0;	// Boolean
	},
	
	buildRendering: function(){
		// summary: 
		//		Overrides _Widget.buildRendering
		var n = this.domNode = this.srcNodeRef ? this.srcNodeRef : dojo.create("div");
		this.gaugeContent = dojo.create("div", {
			className: "dojoxGaugeContent"
		});
		this.containerNode = dojo.create("div");
		this.mouseNode = dojo.create("div");
		while(n.hasChildNodes()){
			this.containerNode.appendChild(n.firstChild);
		}
		dojo.place(this.gaugeContent, n);
		dojo.place(this.containerNode, n);
		dojo.place(this.mouseNode, n);
	},

	_setTicks: function(/*Object*/ oldTicks, /*Object*/ newTicks, /*Boolean*/ major){
		// summary: 
		//		internal method used to clear existing tick marks, then add new ones
		var i;
		if (oldTicks && dojo.isArray(oldTicks._ticks)){
			for (i = 0; i < oldTicks._ticks.length; i++){
				this._removeScaleTick(oldTicks._ticks[i]);
			}
		}
		var t = {
			length: newTicks.length,
			offset: newTicks.offset,
			noChange: true
		};
		if (newTicks.color){
			t.color = newTicks.color;
		}
		if (newTicks.font){
			t.font = newTicks.font;
		}
		if (newTicks.labelPlacement){
			t.direction = newTicks.labelPlacement;
		}
		newTicks._ticks = [];
		for (i=this.min;i<=this.max;i+=newTicks.interval){
			if (i==this.max&&this._isScaleCircular()) continue; // do not draw last tick on fully circular gauges
			t.value=i;
			if (major){
				if (dojo.number){ // use internationalization if loaded
					t.label = (newTicks.fixedPrecision && newTicks.precision) ? dojo.number.format(i, {
						places: newTicks.precision
					}) : dojo.number.format(i);
				}else{
					t.label = (newTicks.fixedPrecision && newTicks.precision) ? i.toFixed(newTicks.precision) : i.toString();
				}
			}
			newTicks._ticks.push(this._addScaleTick(t, major));
		}
		return newTicks;
	},
	
	_isScaleCircular: function(){
		// summary: 
		//		internal method to check if the scale is fully circular
		return false;
	},
	
	setMinorTicks: function(/*Object*/ ticks){
		// summary:
		//		Creates and draws the minor tick marks based on the passed object (expecting the same format
		//		as the minorTicks object documented above)
		this.minorTicks = this._setTicks(this.minorTicks, ticks, false);
	},

	setMajorTicks: function(/*Object*/ ticks){
		// summary:
		//		Creates and draws the major tick marks based on the passed object (expecting the same format
		//		as the majorTicks object documented above)
		this.majorTicks = this._setTicks(this.majorTicks, ticks, true);
	},

	postCreate: function(){
		if(this.hideValues){
			dojo.style(this.containerNode, "display", "none");
		}
		dojo.style(this.mouseNode, 'width', '0');
		dojo.style(this.mouseNode, 'height', '0');
		dojo.style(this.mouseNode, 'position', 'absolute');
		dojo.style(this.mouseNode, 'z-index', '100');
		if(dijit.Tooltip && this.useTooltip){
			dijit.showTooltip('test',this.mouseNode, !this.isLeftToRight());
			dijit.hideTooltip(this.mouseNode);
		}
	},

	createSurface: function(){
		// summary:
		//		internal method used by the gauge to create the graphics surface area
		this.gaugeContent.style.width = this.width + 'px';
		this.gaugeContent.style.height = this.height + 'px';
		this.surface = gfx.createSurface(this.gaugeContent, this.width, this.height);
		
		// create several groups where various gauge elements will be created.
		this._backgroundGroup = this.surface.createGroup();
		this._rangeGroup = this.surface.createGroup();
		this._minorTicksGroup = this.surface.createGroup();
		this._majorTicksGroup = this.surface.createGroup();
		this._overlayGroup = this.surface.createGroup();
		this._indicatorsGroup = this.surface.createGroup();
		this._foregroundGroup = this.surface.createGroup();
		
		this._background = this._backgroundGroup.createRect({x: 0, y: 0, width: this.width, height: this.height });
		this._background.setFill(this.background);

		if(this.image.url){
			var imageGroup = this._backgroundGroup;
			if (this.image.overlay)
			   imageGroup = this._overlayGroup;
			   
			this._img = imageGroup.createImage({width: this.image.width || this.width, height: this.image.height || this.height, src: this.image.url});
			if(this.image.x || this.image.y){
				this._img.setTransform({dx: this.image.x || 0, dy: this.image.y || 0});
			}
		}
	},

	draw: function(){
		// summary:
		//		This function is used to draw (or redraw) the gauge.
		// description:
		//		Draws the gauge by drawing the surface, the ranges, and the indicators.
		var i;
		if (!this.surface)return;
		
		this.drawBackground(this._backgroundGroup);
		
		if(this._rangeData){
			for(i=0; i<this._rangeData.length; i++){
				this.drawRange(this._rangeGroup, this._rangeData[i]);
			}
		}
		
		if(this._minorTicksData){
			for(i=0; i<this._minorTicksData.length; i++){
				this._minorTicksData[i].draw(this._minorTicksGroup);
			}
		}
		if(this._majorTicksData){
			for(i=0; i<this._majorTicksData.length; i++){
				this._majorTicksData[i].draw(this._majorTicksGroup);
			}
		}
		
		if(this._indicatorData){
			for(i=0; i<this._indicatorData.length; i++){
				this._indicatorData[i].draw(this._indicatorsGroup);
			}
		}
	    this.drawForeground(this._foregroundGroup);
	},


	drawBackground :function(group){
		// summary:
		//		This function is used to draw (or redraw) the background of the gauge.
		// description:
		//		The method may be used by subclasses to draw (or redraw) the background of the gauge.
		
	},
	
	drawForeground :function(group){
		// summary:
		//		This function is used to draw (or redraw) the foreground of the gauge.
		// description:
		//		The method may be used by subclasses to draw (or redraw) the foreground of the gauge.
		
	},

	setBackground: function(background){
		// summary:
		//		This method is used to set the background of the gauge after it is created.
		// description:
		//		Sets the background using the given object.  Must be the same 'type' of object
		//		as the original background argument.
		// background:
		//		An object in one of the two forms:
		//			{'color': 'color-name'}
		//				OR
		//			(for a gradient:)
		//			{'type': 'linear', 'colors': [{offset: 0, color:'#C0C0C0'}, {offset: 1, color: '#E0E0E0'}] }
		//		If background is null or undefined, this will set the fill to this._backgroundDefault
		if(!background){ background = this._backgroundDefault; }
		this.background = background.color || background;
		this._background.setFill(this.background);
	},

	addRange: function(/*Object*/range){
		// summary:
		//		This method is used to add a range to the gauge.
		// description:
		//		Creates a range (colored area on the background of the gauge)
		//		based on the given arguments.
		// range:
		//		A range is either a dojox.gauges.Range object, or a object
		//		with similar parameters (low, high, hover, etc.).
		this.addRanges([range]);
	},

	addRanges: function(/*Array*/ranges){
		// summary:
		//		This method is used to add ranges to the gauge.
		// description:
		//		Creates a range (colored area on the background of the gauge)
		//		based on the given arguments.
		// range:
		//		A range is either a dojox.gauges.Range object, or a object
		//		with similar parameters (low, high, hover, etc.).
		if(!this._rangeData){
			this._rangeData = [];
		}
		var range;
		for(var i=0; i<ranges.length; i++){
			range = ranges[i];
			if((this.min === null) || (range.low < this.min)){this.min = range.low;}
			if((this.max === null) || (range.high > this.max)){this.max = range.high;}

			if(!range.color){
				var colorIndex = this._rangeData.length % this.defaultColors.length;
				if(gfx.svg && this.useRangeStyles > 0){
					colorIndex = (this._rangeData.length % this.useRangeStyles)+1;
					range.color = {style: "dojoxGaugeRange"+colorIndex};
				}else{
					colorIndex = this._rangeData.length % this.defaultColors.length;
					range.color = this.defaultColors[colorIndex];
				}
			}
			this._rangeData[this._rangeData.length] = range;
		}
		this.draw();
	},

	_addScaleTick: function(/*Object*/indicator, /*Boolean*/ major){
		// summary:
		//		Adds a scale ticks, that is an indicator.
		// description:
		//		This method adds  a tick mark to the gauge
		// indicator:
		//		A dojox.gauges._Indicator or an object with similar parameters
		//		(value, color, offset, etc.).
	
		if(!indicator.declaredClass){// !== 'dojox.gauges.Indicator'){
			// We were passed a plain object, need to make an indicator out of it.
			indicator = new this._defaultIndicator(indicator);
		}
	
		indicator._gauge = this;
		if (major){
			if (!this._majorTicksData){
				this._majorTicksData = [];
			}
			this._majorTicksData[this._majorTicksData.length] = indicator;
			indicator.draw(this._majorTicksGroup);
		} else {
				if (!this._minorTicksData){
				this._minorTicksData = [];
			}
			this._minorTicksData[this._minorTicksData.length] = indicator;
			indicator.draw(this._minorTicksGroup);
		}
		return indicator;
	},
	
	_removeScaleTick: function(/*Object*/indicator){
		// summary:
		//		Removes the given scale tick from the gauge by calling it's remove function 
		//		and removing it from the local cache.
		var i;
		if (this._majorTicksData) for (i = 0; i < this._majorTicksData.length; i++){
			if (this._majorTicksData[i] === indicator){
				this._majorTicksData.splice(i, 1);
				indicator.remove();
				return;
			}
		}
		if (this._minorTicksData) for (i = 0; i < this._minorTicksData.length; i++){
			if (this._minorTicksData[i] === indicator){
				this._minorTicksData.splice(i, 1);
				indicator.remove();
				return;
			}
		}
	},
	
	addIndicator: function(/*Object*/indicator){
		// summary:
		//		This method is used to add an indicator to the gauge.
		// description:
		//		This method adds an indicator, such as a t needle,
		//		to the gauge.
		// indicator:
		//		A dojox.gauges._Indicator or an object with similar parameters
		//		(value, color, offset, etc.).

		if(!indicator.declaredClass){// !== 'dojox.gauges.Indicator'){
			// We were passed a plain object, need to make an indicator out of it.
			indicator = new this._defaultIndicator(indicator);
		}
		indicator._gauge = this;
		if(!indicator.hideValue){
			this.containerNode.appendChild(indicator.domNode);
		}
		if(!this._indicatorData){this._indicatorData = [];}
		this._indicatorData[this._indicatorData.length] = indicator;
		indicator.draw(this._indicatorsGroup);
		return indicator;
	},

	removeIndicator: function(/*Object*/indicator){
		// summary:
		//		Removes the given indicator from the gauge by calling it's remove function 
		//		and removing it from the local cache.
		for(var i=0; i<this._indicatorData.length; i++){
			if(this._indicatorData[i] === indicator){
				this._indicatorData.splice(i, 1);
				indicator.remove();
				break;
			}
		}
	},

	moveIndicatorToFront: function(/*Object*/indicator){
		// summary:
		//		This function is used to move an indicator the the front (top)
		//		of the gauge
		// indicator:
		//		A dojox.gauges._Indicator or an object with similar parameters
		//		(value, color, offset, etc.).
		if(indicator.shape)
		   indicator.shape.moveToFront();
		
	},

	drawText: function(/*dojox.gfx.Group*/ group, /*String*/txt, /*Number*/x, /*Number*/y, /*String?*/align, /*String?*/color, /*Object?*/font){
		// summary:
		//		This function is used draw text onto the gauge.  The text object
		//		is also returned by the function so that may be removed later
		//		by calling removeText
		// group:   dojox.gfx.Group
		//          The GFX Group where the text will be added.
		// txt:		String
		//			The text to be drawn
		// x:		Number
		//			The x coordinate at which to place the text
		// y:		Number
		//			The y coordinate at which to place the text
		// align?:	String
		//			Indicates how to align the text
		//			Valid value is 'right', otherwise text is left-aligned
		// color?:	String
		//			Indicates the color of the text
		// font?:	Object
		//			A font object, generally of the following format:
		//			{family: "Helvetica", style: "italic", variant: 'small-caps', weight: 'bold', size: "18pt"}

		var t = group.createText({x: x, y: y, text: txt, align: align});
		t.setFill(color ? color : 'black');
		if (font) t.setFont(font);
		return t;
	},

	removeText:function(/*String*/t){
		// summary:
		//		Removes a text element from the gauge.
		// t:	String
		//		The text to remove.
		if (t.parent)
	    	t.parent.remove(t);
	},

	updateTooltip: function(/*String*/txt, /*Event*/ e){
		// summary:
		//		Updates the tooltip for the gauge to display the given text.
		// txt:		String
		//			The text to put in the tooltip.
		
		if (!dijit.Tooltip) return;
		
		if(this._lastHover != txt){
			if(txt !== ''){ 
				dijit.hideTooltip(this.mouseNode);
				dijit.showTooltip(txt,this.mouseNode, !this.isLeftToRight());
			}else{
				dijit.hideTooltip(this.mouseNode);
			}
			this._lastHover = txt;
		}
	},

	handleMouseOver: function(/*Object*/event){
		// summary:
		//		This is an internal handler used by the gauge to support 
		//		hover text
		// event:	Object
		//			The event object
		
		if (this.image && this.image.overlay){
			if (event.target == this._img.getEventSource()){
				var hover;
				this._overOverlay = true;
				var r = this.getRangeUnderMouse(event);
				if (r && r.hover){
					hover = r.hover;
				}
				
				if (dijit.Tooltip && this.useTooltip && !this._drag){
					if (hover){
						this.updateTooltip(hover, event);
					} else {
						this.updateTooltip('', event);
					}
				}
			}
		}
	},

	handleMouseOut: function(/*Object*/event){
		// summary:
		//		This is an internal handler used by the gauge to support
		//		hover text
		// event:	Object
		//			The event object

		this._overOverlay = false;
		
		if(dijit.Tooltip && this.useTooltip && this.mouseNode){
			dijit.hideTooltip(this.mouseNode);
		}
	},

	handleMouseMove: function(/*Object*/event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		the mouse to show the tooltips
		// event:	Object
		//			The event object
		
		
		if (dijit.Tooltip){
			if (event){
				dojo.style(this.mouseNode, 'left', event.pageX + 1 + 'px');
				dojo.style(this.mouseNode, 'top', event.pageY + 1 + 'px');
			}
			if (this.useTooltip && this._overOverlay){
				var r = this.getRangeUnderMouse(event);
				if (r && r.hover){
					this.updateTooltip(r.hover, event);
				}else{
					this.updateTooltip('', event);
				}
			}
		}
	},
	
	handleMouseDown: function(event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		the mouse to move indicators
		// event:	Object
		//			The event object
		var indicator = this._getInteractiveIndicator();
		if (indicator){
			this._handleMouseDownIndicator(indicator, event);
		}
	},	
	
	_handleDragInteractionMouseMove: function(/*Object*/event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		the mouse to drag an indicator to modify it's value
		// event:	Object
		//			The event object
		
		if(this._drag){
			this._dragIndicator(this, event);
			dojo.stopEvent(event);
		}
	},
	
	_handleDragInteractionMouseUp: function(/*Object*/event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		the mouse to drag an indicator to modify it's value
		// event:	Object
		//			The event object
		this._drag = null;
		
		for (var i = 0 ; i < this._mouseListeners.length; i++){
			dojo.disconnect(this._mouseListeners[i]);
		}
		this._mouseListeners = [];
		dojo.stopEvent(event);
	},
	
	_handleMouseDownIndicator : function (indicator, event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		the mouse to drag an indicator to modify it's value
		// indicator : _Indicator 
		//           The indicator object
		// event:	Object
		//			The event object
		
		if (!indicator.noChange){
			if (!this._mouseListeners) this._mouseListeners = [];
			this._drag = indicator;
			this._mouseListeners.push(dojo.connect(document, "onmouseup", this, this._handleDragInteractionMouseUp));
			this._mouseListeners.push(dojo.connect(document, "onmousemove", this, this._handleDragInteractionMouseMove));
			this._mouseListeners.push(dojo.connect(document, "ondragstart", this, dojo.stopEvent));
			this._mouseListeners.push(dojo.connect(document, "onselectstart", this, dojo.stopEvent));
			this._dragIndicator(this, event);
			dojo.stopEvent(event);
		}
	},
	
	_handleMouseOverIndicator : function (indicator, event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		the mouse to drag an indicator to modify it's value
		// indicator : _Indicator 
		//           The indicator object
		// event:	Object
		//			The event object
		
		if (dijit.Tooltip && this.useTooltip && !this._drag){
			if (indicator.hover){
				dojo.style(this.mouseNode, 'left', event.pageX + 1 + 'px');
				dojo.style(this.mouseNode, 'top', event.pageY + 1 + 'px');
				dijit.showTooltip(indicator.hover, this.mouseNode, !this.isLeftToRight());
			} else {
				this.updateTooltip('', event);
			}
		}
		
		if (indicator.onDragMove && !indicator.noChange){
			this.gaugeContent.style.cursor = 'pointer';
		}
	},
	
	_handleMouseOutIndicator : function (indicator, event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		the mouse to drag an indicator to modify it's value
		// indicator : _Indicator 
		//           The indicator object
		// event:	Object
		//			The event object
		if(dijit.Tooltip && this.useTooltip && this.mouseNode){
			dijit.hideTooltip(this.mouseNode);
		}
		this.gaugeContent.style.cursor = 'pointer';
		
	},
	
	_handleMouseOutRange : function ( range, event){
		if (dijit.Tooltip && this.useTooltip && this.mouseNode){
			dijit.hideTooltip(this.mouseNode);
		}
	},
	
	_handleMouseOverRange : function (range, event){
		if (dijit.Tooltip && this.useTooltip && !this._drag){
			if (range.hover){
				dojo.style(this.mouseNode, 'left', event.pageX + 1 + 'px');
				dojo.style(this.mouseNode, 'top', event.pageY + 1 + 'px');
				dijit.showTooltip(range.hover, this.mouseNode, !this.isLeftToRight());
			} else {
				this.updateTooltip('', event);
			}
		}
	},
	
	handleTouchStartIndicator: function(indicator, event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		touch events to drag an indicator to modify it's value
		// indicator : _Indicator 
		//           The indicator object
		// event:	Object
		//			The event object
		if (!indicator.noChange){
			this._drag = indicator;
			dojo.stopEvent(event);
		}
	},
		
	handleTouchStart: function(event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		touch events to drag an indicator to modify it's value
		// event:	Object
		//			The touch event object
		this._drag = this._getInteractiveIndicator();
		this.handleTouchMove(event); //drag indicator to touch position
	},	
	
	handleTouchEnd: function(event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		touch events to drag an indicator to modify it's value
		// event:	Object
		//			The touch event object	
		if (this._drag){
			this._drag = null;
			dojo.stopEvent(event);
		}
	},	
    
	handleTouchMove: function(event){
		// summary:
		//		This is an internal handler used by the gauge to support using
		//		touch events to drag an indicator to modify it's value
		// event:	Object
		//			The touch event object
		
		if (this._drag && this._drag.noChange == false){
			var touches = event.touches;
			var firstTouch = touches[0];
			this._dragIndicatorAt(this, firstTouch.pageX, firstTouch.pageY);
			dojo.stopEvent(event);
		}
	},
    
	_getInteractiveIndicator: function(){
		for (var i = 0; i < this._indicatorData.length; i++){
			var indicator = this._indicatorData[i];
			if (indicator.interactionMode == "gauge" && !indicator.noChange){
				return indicator;
			}
		}
	}
});
});

