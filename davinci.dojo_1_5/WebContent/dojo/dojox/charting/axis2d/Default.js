dojo.provide("dojox.charting.axis2d.Default");

dojo.require("dojox.charting.axis2d.Invisible");

dojo.require("dojox.charting.scaler.linear");
dojo.require("dojox.charting.axis2d.common");

dojo.require("dojo.colors");
dojo.require("dojo.string");
dojo.require("dojox.gfx");
dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.utils");

/*=====
	dojox.charting.axis2d.__AxisCtorArgs = function(
		vertical, fixUpper, fixLower, natural, leftBottom,
		includeZero, fixed, majorLabels, minorTicks, minorLabels, microTicks, htmlLabels,
		min, max, from, to, majorTickStep, minorTickStep, microTickStep,
		labels, labelFunc, maxLabelSize,
		stroke, majorTick, minorTick, microTick, tick,
		font, fontColor
	){
	//	summary:
	//		Optional arguments used in the definition of an axis.
	//
	//	vertical: Boolean?
	//		A flag that says whether an axis is vertical (i.e. y axis) or horizontal. Default is false (horizontal).
	//	fixUpper: String?
	//		Align the greatest value on the axis with the specified tick level. Options are "major", "minor", "micro", or "none".  Defaults to "none".
	//	fixLower: String?
	//		Align the smallest value on the axis with the specified tick level. Options are "major", "minor", "micro", or "none".  Defaults to "none".
	//	natural: Boolean?
	//		Ensure tick marks are made on "natural" numbers. Defaults to false.
	//	leftBottom: Boolean?
	//		The position of a vertical axis; if true, will be placed against the left-bottom corner of the chart.  Defaults to true.
	//	includeZero: Boolean?
	//		Include 0 on the axis rendering.  Default is false.
	//	fixed: Boolean?
	//		Force all axis labels to be fixed numbers.  Default is true.
	//	majorLabels: Boolean?
	//		Flag to draw all labels at major ticks. Default is true.
	//	minorTicks: Boolean?
	//		Flag to draw minor ticks on an axis.  Default is true.
	//	minorLabels: Boolean?
	//		Flag to draw labels on minor ticks. Default is true.
	//	microTicks: Boolean?
	//		Flag to draw micro ticks on an axis. Default is false.
	//	htmlLabels: Boolean?
	//		Flag to use HTML (as opposed to the native vector graphics engine) to draw labels. Default is true.
	//	min: Number?
	//		The smallest value on an axis. Default is 0.
	//	max: Number?
	//		The largest value on an axis. Default is 1.
	//	from: Number?
	//		Force the chart to render data visible from this value. Default is 0.
	//	to: Number?
	//		Force the chart to render data visible to this value. Default is 1.
	//	majorTickStep: Number?
	//		The amount to skip before a major tick is drawn.  Default is 4.
	//	minorTickStep: Number?
	//		The amount to skip before a minor tick is drawn. Default is 2.
	//	microTickStep: Number?
	//		The amount to skip before a micro tick is drawn. Default is 1.
	//	labels: Object[]?
	//		An array of labels for major ticks, with corresponding numeric values, ordered by value.
	//	labelFunc: Function?
	//		An optional function used to compute label values.
	//	maxLabelSize: Number?
	//		The maximum size, in pixels, for a label.  To be used with the optional label function.
	//	stroke: dojox.gfx.Stroke?
	//		An optional stroke to be used for drawing an axis.
	//	majorTick: Object?
	//		An object containing a dojox.gfx.Stroke, and a length (number) for a major tick.
	//	minorTick: Object?
	//		An object containing a dojox.gfx.Stroke, and a length (number) for a minor tick.
	//	microTick: Object?
	//		An object containing a dojox.gfx.Stroke, and a length (number) for a micro tick.
	//	tick: Object?
	//		An object containing a dojox.gfx.Stroke, and a length (number) for a tick.
	//	font: String?
	//		An optional font definition (as used in the CSS font property) for labels.
	//	fontColor: String|dojo.Color?
	//		An optional color to be used in drawing labels.

	this.vertical = vertical;
	this.fixUpper = fixUpper;
	this.fixLower = fixLower;
	this.natural = natural;
	this.leftBottom = leftBottom;
	this.includeZero = includeZero;
	this.fixed = fixed;
	this.majorLabels = majorLabels;
	this.minorTicks = minorTicks;
	this.minorLabels = minorLabels;
	this.microTicks = microTicks;
	this.htmlLabels = htmlLabels;
	this.min = min;
	this.max = max;
	this.from = from;
	this.to = to;
	this.majorTickStep = majorTickStep;
	this.minorTickStep = minorTickStep;
	this.microTickStep = microTickStep;
	this.labels = labels;
	this.labelFunc = labelFunc;
	this.maxLabelSize = maxLabelSize;
	this.stroke = stroke;
	this.majorTick = majorTick;
	this.minorTick = minorTick;
	this.microTick = microTick;
	this.tick = tick;
	this.font = font;
	this.fontColor = fontColor;
}
=====*/
(function(){
	var dc = dojox.charting,
		du = dojox.lang.utils,
		g = dojox.gfx,
		lin = dc.scaler.linear,
		labelGap = 4,			// in pixels
		centerAnchorLimit = 45;	// in degrees

	dojo.declare("dojox.charting.axis2d.Default", dojox.charting.axis2d.Invisible, {
		//	summary:
		//		The default axis object used in dojox.charting.  See dojox.charting.Chart2D.addAxis for details.
		//
		//	defaultParams: Object
		//		The default parameters used to define any axis.
		//	optionalParams: Object
		//		Any optional parameters needed to define an axis.

		/*
		//	TODO: the documentation tools need these to be pre-defined in order to pick them up
		//	correctly, but the code here is partially predicated on whether or not the properties
		//	actually exist.  For now, we will leave these undocumented but in the code for later. -- TRT

		//	opt: Object
		//		The actual options used to define this axis, created at initialization.
		//	scalar: Object
		//		The calculated helper object to tell charts how to draw an axis and any data.
		//	ticks: Object
		//		The calculated tick object that helps a chart draw the scaling on an axis.
		//	dirty: Boolean
		//		The state of the axis (whether it needs to be redrawn or not)
		//	scale: Number
		//		The current scale of the axis.
		//	offset: Number
		//		The current offset of the axis.

		opt: null,
		scalar: null,
		ticks: null,
		dirty: true,
		scale: 1,
		offset: 0,
		*/
		defaultParams: {
			vertical:    false,		// true for vertical axis
			fixUpper:    "none",	// align the upper on ticks: "major", "minor", "micro", "none"
			fixLower:    "none",	// align the lower on ticks: "major", "minor", "micro", "none"
			natural:     false,		// all tick marks should be made on natural numbers
			leftBottom:  true,		// position of the axis, used with "vertical"
			includeZero: false,		// 0 should be included
			fixed:       true,		// all labels are fixed numbers
			majorLabels: true,		// draw major labels
			minorTicks:  true,		// draw minor ticks
			minorLabels: true,		// draw minor labels
			microTicks:  false,		// draw micro ticks
			rotation:    0,			// label rotation angle in degrees
			htmlLabels:  true		// use HTML to draw labels
		},
		optionalParams: {
			min:			0,	// minimal value on this axis
			max:			1,	// maximal value on this axis
			from:			0,	// visible from this value
			to:				1,	// visible to this value
			majorTickStep:	4,	// major tick step
			minorTickStep:	2,	// minor tick step
			microTickStep:	1,	// micro tick step
			labels:			[],	// array of labels for major ticks
								// with corresponding numeric values
								// ordered by values
			labelFunc:		null, // function to compute label values
			maxLabelSize:	0,	// size in px. For use with labelFunc

			// TODO: add support for minRange!
			// minRange:		1,	// smallest distance from min allowed on the axis

			// theme components
			stroke:			{},	// stroke for an axis
			majorTick:		{},	// stroke + length for a tick
			minorTick:		{},	// stroke + length for a tick
			microTick:		{},	// stroke + length for a tick
			tick:           {},	// stroke + length for a tick
			font:			"",	// font for labels
			fontColor:		""	// color for labels as a string
		},

		constructor: function(chart, kwArgs){
			//	summary:
			//		The constructor for an axis.
			//	chart: dojox.charting.Chart2D
			//		The chart the axis belongs to.
			//	kwArgs: dojox.charting.axis2d.__AxisCtorArgs?
			//		Any optional keyword arguments to be used to define this axis.
			this.opt = dojo.delegate(this.defaultParams, kwArgs);
			// du.updateWithObject(this.opt, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
		},
		getOffsets: function(){
			//	summary:
			//		Get the physical offset values for this axis (used in drawing data series).
			//	returns: Object
			//		The calculated offsets in the form of { l, r, t, b } (left, right, top, bottom).
			var s = this.scaler, offsets = { l: 0, r: 0, t: 0, b: 0 };
			if(!s){
				return offsets;
			}
			var o = this.opt, labelWidth = 0, a, b, c, d,
				gl = dc.scaler.common.getNumericLabel,
				offset = 0, ma = s.major, mi = s.minor,
				ta = this.chart.theme.axis,
				// TODO: we use one font --- of major tick, we need to use major and minor fonts
				taFont = o.font || (ta.majorTick && ta.majorTick.font) || (ta.tick && ta.tick.font),
				taMajorTick = this.chart.theme.getTick("major", o),
				taMinorTick = this.chart.theme.getTick("minor", o),
				size = taFont ? g.normalizedLength(g.splitFontString(taFont).size) : 0,
				rotation = o.rotation % 360, leftBottom = o.leftBottom,
				cosr = Math.abs(Math.cos(rotation * Math.PI / 180)),
				sinr = Math.abs(Math.sin(rotation * Math.PI / 180));
			if(rotation < 0){
				rotation += 360;
			}

			if(size){
				// we need width of all labels
				if(o.maxLabelSize){
					labelWidth = o.maxLabelSize;
				}else if(this.labels){
					labelWidth = this._groupLabelWidth(this.labels, taFont);
				}else{
					labelWidth = this._groupLabelWidth([
						gl(ma.start, ma.prec, o),
						gl(ma.start + ma.count * ma.tick, ma.prec, o),
						gl(mi.start, mi.prec, o),
						gl(mi.start + mi.count * mi.tick, mi.prec, o)
					], taFont);
				}
				if(this.vertical){
					var side = leftBottom ? "l" : "r";
					switch(rotation){
						case 0:
						case 180:
							offsets[side] = labelWidth;
							offsets.t = offsets.b = size / 2;
							break;
						case 90:
						case 270:
							offsets[side] = size;
							offsets.t = offsets.b = labelWidth / 2;
							break;
						default:
							if(rotation <= centerAnchorLimit || (180 < rotation && rotation <= (180 + centerAnchorLimit))){
								offsets[side] = size * sinr / 2 + labelWidth * cosr;
								offsets[leftBottom ? "t" : "b"] = size * cosr / 2 + labelWidth * sinr;
								offsets[leftBottom ? "b" : "t"] = size * cosr / 2;
							}else if(rotation > (360 - centerAnchorLimit) || (180 > rotation && rotation > (180 - centerAnchorLimit))){
								offsets[side] = size * sinr / 2 + labelWidth * cosr;
								offsets[leftBottom ? "b" : "t"] = size * cosr / 2 + labelWidth * sinr;
								offsets[leftBottom ? "t" : "b"] = size * cosr / 2;
							}else if(rotation < 90 || (180 < rotation && rotation < 270)){
								offsets[side] = size * sinr + labelWidth * cosr;
								offsets[leftBottom ? "t" : "b"] = size * cosr + labelWidth * sinr;
							}else{
								offsets[side] = size * sinr + labelWidth * cosr;
								offsets[leftBottom ? "b" : "t"] = size * cosr + labelWidth * sinr;
							}
							break;
					}
					offsets[side] += labelGap + Math.max(taMajorTick.length, taMinorTick.length);
				}else{
					var side = leftBottom ? "b" : "t";
					switch(rotation){
						case 0:
						case 180:
							offsets[side] = size;
							offsets.l = offsets.r = labelWidth / 2;
							break;
						case 90:
						case 270:
							offsets[side] = labelWidth;
							offsets.l = offsets.r = size / 2;
							break;
						default:
							if((90 - centerAnchorLimit) <= rotation && rotation <= 90 || (270 - centerAnchorLimit) <= rotation && rotation <= 270){
								offsets[side] = size * sinr / 2 + labelWidth * cosr;
								offsets[leftBottom ? "r" : "l"] = size * cosr / 2 + labelWidth * sinr;
								offsets[leftBottom ? "l" : "r"] = size * cosr / 2;
							}else if(90 <= rotation && rotation <= (90 + centerAnchorLimit) || 270 <= rotation && rotation <= (270 + centerAnchorLimit)){
								offsets[side] = size * sinr / 2 + labelWidth * cosr;
								offsets[leftBottom ? "l" : "r"] = size * cosr / 2 + labelWidth * sinr;
								offsets[leftBottom ? "r" : "l"] = size * cosr / 2;
							}else if(rotation < centerAnchorLimit || (180 < rotation && rotation < (180 - centerAnchorLimit))){
								offsets[side] = size * sinr + labelWidth * cosr;
								offsets[leftBottom ? "r" : "l"] = size * cosr + labelWidth * sinr;
							}else{
								offsets[side] = size * sinr + labelWidth * cosr;
								offsets[leftBottom ? "l" : "r"] = size * cosr + labelWidth * sinr;
							}
							break;
					}
					offsets[side] += labelGap + Math.max(taMajorTick.length, taMinorTick.length);
				}
			}
			if(labelWidth){
				this._cachedLabelWidth = labelWidth;
			}
			return offsets;	//	Object
		},
		render: function(dim, offsets){
			//	summary:
			//		Render/draw the axis.
			//	dim: Object
			//		An object of the form { width, height}.
			//	offsets: Object
			//		An object of the form { l, r, t, b }.
			//	returns: dojox.charting.axis2d.Default
			//		The reference to the axis for functional chaining.
			if(!this.dirty){
				return this;	//	dojox.charting.axis2d.Default
			}
			// prepare variable
			var o = this.opt, ta = this.chart.theme.axis, leftBottom = o.leftBottom, rotation = o.rotation % 360,
				start, stop, axisVector, tickVector, anchorOffset, labelOffset, labelAlign,

				// TODO: we use one font --- of major tick, we need to use major and minor fonts
				taFont = o.font || (ta.majorTick && ta.majorTick.font) || (ta.tick && ta.tick.font),
				// TODO: we use one font color --- we need to use different colors
				taFontColor = o.fontColor || (ta.majorTick && ta.majorTick.fontColor) || (ta.tick && ta.tick.fontColor) || "black",
				taMajorTick = this.chart.theme.getTick("major", o),
				taMinorTick = this.chart.theme.getTick("minor", o),
				taMicroTick = this.chart.theme.getTick("micro", o),

				tickSize = Math.max(taMajorTick.length, taMinorTick.length, taMicroTick.length),
				taStroke = "stroke" in o ? o.stroke : ta.stroke,
				size = taFont ? g.normalizedLength(g.splitFontString(taFont).size) : 0;
			if(rotation < 0){
				rotation += 360;
			}
			if(this.vertical){
				start = {y: dim.height - offsets.b};
				stop  = {y: offsets.t};
				axisVector = {x: 0, y: -1};
				labelOffset = {x: 0, y: 0};
				tickVector = {x: 1, y: 0};
				anchorOffset = {x: labelGap, y: 0};
				switch(rotation){
					case 0:
						labelAlign = "end";
						labelOffset.y = size * 0.4;
						break;
					case 90:
						labelAlign = "middle";
						labelOffset.x = -size;
						break;
					case 180:
						labelAlign = "start";
						labelOffset.y = -size * 0.4;
						break;
					case 270:
						labelAlign = "middle";
						break;
					default:
						if(rotation < centerAnchorLimit){
							labelAlign = "end";
							labelOffset.y = size * 0.4;
						}else if(rotation < 90){
							labelAlign = "end";
							labelOffset.y = size * 0.4;
						}else if(rotation < (180 - centerAnchorLimit)){
							labelAlign = "start";
						}else if(rotation < (180 + centerAnchorLimit)){
							labelAlign = "start";
							labelOffset.y = -size * 0.4;
						}else if(rotation < 270){
							labelAlign = "start";
							labelOffset.x = leftBottom ? 0 : size * 0.4;
						}else if(rotation < (360 - centerAnchorLimit)){
							labelAlign = "end";
							labelOffset.x = leftBottom ? 0 : size * 0.4;
						}else{
							labelAlign = "end";
							labelOffset.y = size * 0.4;
						}
				}
				if(leftBottom){
					start.x = stop.x = offsets.l;
					tickVector.x = -1;
					anchorOffset.x = -anchorOffset.x;
				}else{
					start.x = stop.x = dim.width - offsets.r;
					switch(labelAlign){
						case "start":
							labelAlign = "end";
							break;
						case "end":
							labelAlign = "start";
							break;
						case "middle":
							labelOffset.x += size;
							break;
					}
				}
			}else{
				start = {x: offsets.l};
				stop  = {x: dim.width - offsets.r};
				axisVector = {x: 1, y: 0};
				labelOffset = {x: 0, y: 0};
				tickVector = {x: 0, y: 1};
				anchorOffset = {x: 0, y: labelGap};
				switch(rotation){
					case 0:
						labelAlign = "middle";
						labelOffset.y = size;
						break;
					case 90:
						labelAlign = "start";
						labelOffset.x = -size * 0.4;
						break;
					case 180:
						labelAlign = "middle";
						break;
					case 270:
						labelAlign = "end";
						labelOffset.x = size * 0.4;
						break;
					default:
						if(rotation < (90 - centerAnchorLimit)){
							labelAlign = "start";
							labelOffset.y = leftBottom ? size : 0;
						}else if(rotation < (90 + centerAnchorLimit)){
							labelAlign = "start";
							labelOffset.x = -size * 0.4;
						}else if(rotation < 180){
							labelAlign = "start";
							labelOffset.y = leftBottom ? 0 : -size;
						}else if(rotation < (270 - centerAnchorLimit)){
							labelAlign = "end";
							labelOffset.y = leftBottom ? 0 : -size;
						}else if(rotation < (270 + centerAnchorLimit)){
							labelAlign = "end";
							labelOffset.y = leftBottom ? size * 0.4 : 0;
						}else{
							labelAlign = "end";
							labelOffset.y = leftBottom ? size : 0;
						}
				}
				if(leftBottom){
					start.y = stop.y = dim.height - offsets.b;
				}else{
					start.y = stop.y = offsets.t;
					tickVector.y = -1;
					anchorOffset.y = -anchorOffset.y;
					switch(labelAlign){
						case "start":
							labelAlign = "end";
							break;
						case "end":
							labelAlign = "start";
							break;
						case "middle":
							labelOffset.y -= size;
							break;
					}
				}
			}

			// render shapes

			this.cleanGroup();

			try{
				var s = this.group,
					c = this.scaler,
					t = this.ticks,
					canLabel,
					f = lin.getTransformerFromModel(this.scaler),
					forceHtmlLabels = (dojox.gfx.renderer == "canvas"),
					labelType = forceHtmlLabels || !rotation && this.opt.htmlLabels && !dojo.isIE && !dojo.isOpera ? "html" : "gfx",
					dx = tickVector.x * taMajorTick.length,
					dy = tickVector.y * taMajorTick.length;

				s.createLine({
					x1: start.x,
					y1: start.y,
					x2: stop.x,
					y2: stop.y
				}).setStroke(taStroke);

				dojo.forEach(t.major, function(tick){
					var offset = f(tick.value), elem,
						x = start.x + axisVector.x * offset,
						y = start.y + axisVector.y * offset;
						s.createLine({
							x1: x, y1: y,
							x2: x + dx,
							y2: y + dy
						}).setStroke(taMajorTick);
						if(tick.label){
							elem = dc.axis2d.common.createText[labelType](
								this.chart,
								s,
								x + dx + anchorOffset.x + (rotation ? 0 : labelOffset.x),
								y + dy + anchorOffset.y + (rotation ? 0 : labelOffset.y),
								labelAlign,
								tick.label,
								taFont,
								taFontColor
								//this._cachedLabelWidth
							);
							if(labelType == "html"){
								this.htmlElements.push(elem);
							}else if(rotation){
								elem.setTransform([
									{dx: labelOffset.x, dy: labelOffset.y},
									g.matrix.rotategAt(
										rotation,
										x + dx + anchorOffset.x,
										y + dy + anchorOffset.y
									)
								]);
							}
						}
				}, this);

				dx = tickVector.x * taMinorTick.length;
				dy = tickVector.y * taMinorTick.length;
				canLabel = c.minMinorStep <= c.minor.tick * c.bounds.scale;
				dojo.forEach(t.minor, function(tick){
					var offset = f(tick.value), elem,
						x = start.x + axisVector.x * offset,
						y = start.y + axisVector.y * offset;
						s.createLine({
							x1: x, y1: y,
							x2: x + dx,
							y2: y + dy
						}).setStroke(taMinorTick);
						if(canLabel && tick.label){
							elem = dc.axis2d.common.createText[labelType](
								this.chart,
								s,
								x + dx + anchorOffset.x + (rotation ? 0 : labelOffset.x),
								y + dy + anchorOffset.y + (rotation ? 0 : labelOffset.y),
								labelAlign,
								tick.label,
								taFont,
								taFontColor
								//this._cachedLabelWidth
							);
							if(labelType == "html"){
								this.htmlElements.push(elem);
							}else if(rotation){
								elem.setTransform([
									{dx: labelOffset.x, dy: labelOffset.y},
									g.matrix.rotategAt(
										rotation,
										x + dx + anchorOffset.x,
										y + dy + anchorOffset.y
									)
								]);
							}
						}
				}, this);

				dx = tickVector.x * taMicroTick.length;
				dy = tickVector.y * taMicroTick.length;
				dojo.forEach(t.micro, function(tick){
					var offset = f(tick.value), elem,
						x = start.x + axisVector.x * offset,
						y = start.y + axisVector.y * offset;
						s.createLine({
							x1: x, y1: y,
							x2: x + dx,
							y2: y + dy
						}).setStroke(taMicroTick);
				}, this);
			}catch(e){
				// squelch
			}

			this.dirty = false;
			return this;	//	dojox.charting.axis2d.Default
		}
	});
})();
