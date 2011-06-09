define(["dojo/_base/kernel", "dojo/_base/array", "dojo/_base/declare", "dojo/query", "dojo/_base/html", "dojo/_base/connect", "dojo/_base/Color",
	"./Legend", "dijit/form/CheckBox", "../action2d/Highlight", "dojox/lang/functional", "dojox/gfx/fx"], 
	function(dojo, array, declare, query, html, connect, color, Legend, CheckBox, Highlight, df, fx){

	var FocusManager = dojo.declare(null, {
		//	summary:
		//		It will take legend as a tab stop, and using
		//		cursor keys to navigate labels within the legend.
		constructor: function(legend){
			this.legend = legend;
			this.index = 0;
			this.horizontalLength = this._getHrizontalLength();
			dojo.forEach(legend.legends, function(item, i){
				if(i > 0){
					dojo.query("input", item).attr("tabindex", -1);
				}
			});
			this.firstLabel = dojo.query("input", legend.legends[0])[0];
			dojo.connect(this.firstLabel, "focus", this, function(){this.legend.active = true;});
			dojo.connect(this.legend.domNode, "keydown", this, "_onKeyEvent");
		},
		_getHrizontalLength: function(){
			var horizontal = this.legend.horizontal;
			if(typeof horizontal == "number"){
				return Math.min(horizontal, this.legend.legends.length);
			}else if(!horizontal){
				return 1;
			}else{
				return this.legend.legends.length;
			}
		},
		_onKeyEvent: function(e){
			//	if not focused
			if(!this.legend.active){
				return;
			}
			//	lose focus
			if(e.keyCode == dojo.keys.TAB){
				this.legend.active = false;
				return;
			}
			//	handle with arrow keys
			var max = this.legend.legends.length;
			switch(e.keyCode){
				case dojo.keys.LEFT_ARROW:
					this.index--;
					if(this.index < 0){
						this.index += max;
					}
					break;
				case dojo.keys.RIGHT_ARROW:
					this.index++;
					if(this.index >= max){
						this.index -= max;
					}
					break;
				case dojo.keys.UP_ARROW:
					if(this.index - this.horizontalLength >= 0){
						this.index -= this.horizontalLength;
					}
					break;
				case dojo.keys.DOWN_ARROW:
					if(this.index + this.horizontalLength < max){
						this.index += this.horizontalLength;
					}
					break;
				default:
					return;
			}
			this._moveToFocus();
			dojo.stopEvent(e);
		},
		_moveToFocus: function(){
			dojo.query("input", this.legend.legends[this.index])[0].focus();
		}
	});
			
	dojo.declare("dojox.charting.widget.SelectableLegend", dojox.charting.widget.Legend, {
		//	summary:
		//		An enhanced chart legend supporting interactive events on data series
		
		//	theme component
		outline:			false,	//	outline of vanished data series
		transitionFill:		null,	//	fill of deselected data series
		transitionStroke:	null,	//	stroke of deselected data series
		
		postCreate: function(){
			this.legends = [];
			this.legendAnim = {};
			this.inherited(arguments);
		},
		refresh: function(){
			this.legends = [];
			this.inherited(arguments);
			this._applyEvents();
			new FocusManager(this);
		},
		_addLabel: function(dyn, label){
			this.inherited(arguments);
			//	create checkbox
			var legendNodes = dojo.query("td", this.legendBody);
			var currentLegendNode = legendNodes[legendNodes.length - 1];
			this.legends.push(currentLegendNode);
			var checkbox = new CheckBox({checked: true});
			dojo.place(checkbox.domNode, currentLegendNode, "first");
			// connect checkbox and existed label
			var label = dojo.query("label", currentLegendNode)[0];
			dojo.attr(label, "for", checkbox.id);
		},
		_applyEvents: function(){
			// summary:
			//		Apply click-event on checkbox and hover-event on legend icon,
			//		highlight data series or toggle it.
			// if the chart has not yet been refreshed it will crash here (targetData.group == null)
			if(this.chart.dirty){
				return;
			}
			dojo.forEach(this.legends, function(legend, i){
				var targetData, shapes = [], plotName, seriesName;
				if(this._isPie()){
					targetData = this.chart.stack[0];
					shapes.push(targetData.group.children[i]);
					plotName = targetData.name;
					seriesName = this.chart.series[0].name;
				}else{
					targetData = this.chart.series[i];
					shapes = targetData.group.children;
					plotName = targetData.plot;
					seriesName = targetData.name;
				}
				var originalDyn = {
					fills : df.map(shapes, "x.getFill()"),
					strokes: df.map(shapes, "x.getStroke()")
				};
				//	toggle action
				var legendCheckBox = dojo.query(".dijitCheckBox", legend)[0];
				dojo.connect(legendCheckBox, "onclick", this, function(e){
					this._toggle(shapes, i, legend.vanished, originalDyn, seriesName, plotName);
					legend.vanished = !legend.vanished;
					e.stopPropagation();
				});
				
				//	highlight action
				var legendIcon = dojo.query(".dojoxLegendIcon", legend)[0],
					iconShape = this._getFilledShape(this._surfaces[i].children);
				dojo.forEach(["onmouseenter", "onmouseleave"], function(event){
					dojo.connect(legendIcon, event, this, function(e){
						this._highlight(e, iconShape, shapes, i, legend.vanished, originalDyn, seriesName, plotName);
					});
				}, this);
			},this);
		},
		_toggle: function(shapes, index, isOff, dyn, seriesName, plotName){
			dojo.forEach(shapes, function(shape, i){
				var startFill = dyn.fills[i],
					endFill = this._getTransitionFill(plotName),
					startStroke = dyn.strokes[i],
					endStroke = this.transitionStroke;
				if(startFill){
					if(endFill && (typeof startFill == "string" || startFill instanceof dojo.Color)){
						fx.animateFill({
							shape: shape,
							color: {
								start: isOff ? endFill : startFill,
								end: isOff ? startFill : endFill
							}
						}).play();
					}else{
						shape.setFill(isOff ? startFill : endFill);
					}
				}
				if(startStroke && !this.outline){
					shape.setStroke(isOff ? startStroke : endStroke);
				}
			}, this);
		},
		_highlight: function(e, iconShape, shapes, index, isOff, dyn, seriesName, plotName){
			if(!isOff){
				var anim = this._getAnim(plotName),
					isPie = this._isPie(),
					type = formatEventType(e.type);
				//	highlight the label icon,
				var label = {
					shape: iconShape,
					index: isPie ? "legend" + index : "legend",
					run: {name: seriesName},
					type: type
				};
				anim.process(label);
				//	highlight the data items
				dojo.forEach(shapes, function(shape, i){
					shape.setFill(dyn.fills[i]);
					var o = {
						shape: shape,
						index: isPie ? index : i,
						run: {name: seriesName},
						type: type
					};
					anim.duration = 100;
					anim.process(o);
				});
			}
		},
		_getAnim: function(plotName){
			if(!this.legendAnim[plotName]){
				this.legendAnim[plotName] = new Highlight(this.chart, plotName);
			}
			return this.legendAnim[plotName];
		},
		_getTransitionFill: function(plotName){
			// Since series of stacked charts all start from the base line,
			// fill the "front" series with plotarea color to make it disappear .
			if(this.chart.stack[this.chart.plots[plotName]].declaredClass.indexOf("dojox.charting.plot2d.Stacked") != -1){
				return this.chart.theme.plotarea.fill;
			}
			return null;
		},
		_getFilledShape: function(shapes){
			//	summary:
			//		Get filled shape in legend icon which would be highlighted when hovered
			var i = 0;
			while(shapes[i]){
				if(shapes[i].getFill())return shapes[i];
				i++;
			}
		},
		_isPie: function(){
			return this.chart.stack[0].declaredClass == "dojox.charting.plot2d.Pie";
		}
	});
	
	function formatEventType(type){
		if(type == "mouseenter")return "onmouseover";
		if(type == "mouseleave")return "onmouseout";
		return "on" + type;
	}

	return dojox.charting.widget.SelectableLegend;
});
