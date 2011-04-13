dojo.provide("dojox.charting.action2d.Tooltip");

dojo.require("dojox.charting.action2d.Base");
dojo.require("dojox.gfx.matrix");
dojo.require("dijit.Tooltip");

dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.scan");
dojo.require("dojox.lang.functional.fold");

/*=====
dojo.declare("dojox.charting.action2d.__TooltipCtorArgs", dojox.charting.action2d.__BaseCtorArgs, {
	//	summary:
	//		Additional arguments for tooltip actions.

	//	text: Function?
	//		The function that produces the text to be shown within a tooltip.  By default this will be 
	//		set by the plot in question, by returning the value of the element.
	text: null
});
=====*/
(function(){
	var DEFAULT_TEXT = function(o){
		var t = o.run && o.run.data && o.run.data[o.index];
		if(t && typeof t != "number" && (t.tooltip || t.text)){
			return t.tooltip || t.text;
		}
		if(o.element == "candlestick"){
			return '<table cellpadding="1" cellspacing="0" border="0" style="font-size:0.9em;">'
				+ '<tr><td>Open:</td><td align="right"><strong>' + o.data.open + '</strong></td></tr>'
				+ '<tr><td>High:</td><td align="right"><strong>' + o.data.high + '</strong></td></tr>'
				+ '<tr><td>Low:</td><td align="right"><strong>' + o.data.low + '</strong></td></tr>'
				+ '<tr><td>Close:</td><td align="right"><strong>' + o.data.close + '</strong></td></tr>'
				+ (o.data.mid !== undefined ? '<tr><td>Mid:</td><td align="right"><strong>' + o.data.mid + '</strong></td></tr>' : '')
				+ '</table>';
		}
		return o.element == "bar" ? o.x : o.y;
	};

	var df = dojox.lang.functional, m = dojox.gfx.matrix, pi4 = Math.PI / 4, pi2 = Math.PI / 2;
	
	dojo.declare("dojox.charting.action2d.Tooltip", dojox.charting.action2d.Base, {
		//	summary:
		//		Create an action on a plot where a tooltip is shown when hovering over an element.

		// the data description block for the widget parser
		defaultParams: {
			text: DEFAULT_TEXT	// the function to produce a tooltip from the object
		},
		optionalParams: {},	// no optional parameters

		constructor: function(chart, plot, kwArgs){
			//	summary:
			//		Create the tooltip action and connect it to the plot.
			//	chart: dojox.charting.Chart2D
			//		The chart this action belongs to.
			//	plot: String?
			//		The plot this action is attached to.  If not passed, "default" is assumed.
			//	kwArgs: dojox.charting.action2d.__TooltipCtorArgs?
			//		Optional keyword arguments object for setting parameters.
			this.text = kwArgs && kwArgs.text ? kwArgs.text : DEFAULT_TEXT;
			
			this.connect();
		},
		
		process: function(o){
			//	summary:
			//		Process the action on the given object.
			//	o: dojox.gfx.Shape
			//		The object on which to process the highlighting action.
			if(o.type === "onplotreset" || o.type === "onmouseout"){
				hideChartingTooltip(this.aroundRect);
				this.aroundRect = null;
				return;
			}
			
			if(!o.shape || o.type !== "onmouseover"){ return; }
			
			// calculate relative coordinates and the position
			var aroundRect = {type: "rect"}, position = ["after", "before"];
			switch(o.element){
				case "marker":
					aroundRect.x = o.cx;
					aroundRect.y = o.cy;
					aroundRect.width = aroundRect.height = 1;
					break;
				case "circle":
					aroundRect.x = o.cx - o.cr;
					aroundRect.y = o.cy - o.cr;
					aroundRect.width = aroundRect.height = 2 * o.cr;
					break;
				case "column":
					position = ["above", "below"];
					// intentional fall down
				case "bar":
					aroundRect = dojo.clone(o.shape.getShape());
					break;
				case "candlestick":
					aroundRect.x = o.x;
					aroundRect.y = o.y;
					aroundRect.width = o.width;
					aroundRect.height = o.height;
					break;
				default:
				//case "slice":
					if(!this.angles){
						// calculate the running total of slice angles
						if(typeof o.run.data[0] == "number"){
							this.angles = df.map(df.scanl(o.run.data, "+", 0),
								"* 2 * Math.PI / this", df.foldl(o.run.data, "+", 0));
						}else{
							this.angles = df.map(df.scanl(o.run.data, "a + b.y", 0),
								"* 2 * Math.PI / this", df.foldl(o.run.data, "a + b.y", 0));
						}
					}
					var startAngle = m._degToRad(o.plot.opt.startAngle),
						angle = (this.angles[o.index] + this.angles[o.index + 1]) / 2 + startAngle;
					aroundRect.x = o.cx + o.cr * Math.cos(angle);
					aroundRect.y = o.cy + o.cr * Math.sin(angle);
					aroundRect.width = aroundRect.height = 1;
					// calculate the position
					if(angle < pi4){
						// do nothing: the position is right
					}else if(angle < pi2 + pi4){
						position = ["below", "above"];
					}else if(angle < Math.PI + pi4){
						position = ["before", "after"];
					}else if(angle < 2 * Math.PI - pi4){
						position = ["above", "below"];
					}
					/*
					else{
						// do nothing: the position is right
					}
					*/
					break;
			}
			
			// adjust relative coordinates to absolute, and remove fractions
			var lt = dojo.coords(this.chart.node, true);
			aroundRect.x += lt.x;
			aroundRect.y += lt.y;
			aroundRect.x = Math.round(aroundRect.x);
			aroundRect.y = Math.round(aroundRect.y);
			aroundRect.width = Math.ceil(aroundRect.width);
			aroundRect.height = Math.ceil(aroundRect.height);
			this.aroundRect = aroundRect;
			
			showChartingTooltip(this.text(o), this.aroundRect, position, "center");
		}
	});
	
	//TODO: make the charting tooltip a generic one so it can be used with
	// dojox.gfx shapes without charting.
	
	var MasterTooltip = dojo.declare(dijit._MasterTooltip, {
		
		show: function(/*String*/ innerHTML, /*DomNode*/ aroundNode, /*String[]?*/ position, /*String*/alignment){
			// summary:
			//		Display tooltip w/specified contents to right of specified node
			//		(To left if there's no space on the right, or if LTR==right)
			// alignment: String
			//		"center":   tooltip center alignment
			//      "default":  tooltip default alignment (left, right, top, bottom)

			if(this.aroundNode && this.aroundNode === aroundNode){
				return;
			}

			if(this.fadeOut.status() == "playing"){
				// previous tooltip is being hidden; wait until the hide completes then show new one
				this._onDeck=arguments;
				return;
			}
			this.containerNode.innerHTML=innerHTML;

			// Firefox bug. when innerHTML changes to be shorter than previous
			// one, the node size will not be updated until it moves.
			this.domNode.style.top = (this.domNode.offsetTop + 1) + "px";
			
			if(!this.connectorNode) this.connectorNode = dojo.query(".dijitTooltipConnector", this.domNode)[0];
			var connectorPos = dojo.coords(this.connectorNode);
			this.arrowWidth = connectorPos.w, this.arrowHeight = connectorPos.h;
			this.place = (alignment && alignment == "center") ? this.placeChartingTooltip : dijit.placeOnScreenAroundElement,
			this.place(
				this.domNode,
				aroundNode,
				dijit.getPopupAroundAlignment(
					(position && position.length) ? position : dijit.Tooltip.defaultPosition,
					this.isLeftToRight()
				),
				dojo.hitch(this, "orient")
			);

			// show it
			dojo.style(this.domNode, "opacity", 0);
			this.fadeIn.play();
			this.isShowingNow = true;
			this.aroundNode = aroundNode;
		},
		
		placeChartingTooltip: function(node, aroundRect, aroundCorners, layoutNode){
			return this._placeOnScreenAroundRect(node, 
				aroundRect.x, aroundRect.y, aroundRect.width, aroundRect.height,	// rectangle
				aroundCorners, layoutNode);
		},
		
		_placeOnScreenAroundRect: function(node, x, y, width, height, aroundCorners, layoutNode){
			var choices = [];
		    for (var nodeCorner in aroundCorners) {
		        choices.push({
		            aroundCorner: nodeCorner,
		            corner: aroundCorners[nodeCorner],
		            pos: {
		                x: x + (nodeCorner.charAt(1) == 'L' ? 0 : width),
		                y: y + (nodeCorner.charAt(0) == 'T' ? 0 : height),
		                w: width,
		                h: height
		            }
		        });
		    }
		    return this._place(node, choices, layoutNode);
		},
		
		_place: function(/* DomNode */node, /* Array */ choices, /* Function */ layoutNode){
		    var view = dijit.getViewport();
		    
		    if (!node.parentNode ||
		    String(node.parentNode.tagName).toLowerCase() != "body") {
		        dojo.body().appendChild(node);
		    }
		    
		    var best = null;
		    
		    var arrowLeft = null, arrowTop = null;
		    dojo.some(choices, function(choice){
		        var corner = choice.corner;
		        var aroundCorner = choice.aroundCorner;
		        var pos = choice.pos;
		        
		        if (layoutNode) {
		            layoutNode(node, choice.aroundCorner, corner);
		        }
		        
		        // get node's size
		        var style = node.style;
		        var oldDisplay = style.display;
		        var oldVis = style.visibility;
		        style.visibility = "hidden";
		        style.display = "";
		        var mb = dojo.marginBox(node);
		        style.display = oldDisplay;
		        style.visibility = oldVis;
		        
		        var startX, startY, endX, endY, width, height, overflow;
		        
		        arrowLeft = null, arrowTop = null;
		        if (aroundCorner.charAt(0) == corner.charAt(0)) { //left, right
		            startX = (corner.charAt(1) == 'L' ? pos.x : Math.max(view.l, pos.x - mb.w)), 
					startY = (corner.charAt(0) == 'T' ? (pos.y + pos.h / 2 - mb.h / 2) : (pos.y - pos.h / 2 - mb.h / 2)), 
					endX = (corner.charAt(1) == 'L' ? Math.min(view.l + view.w, startX + mb.w) : pos.x), 
					endY = startY + mb.h, 
					width = endX - startX, 
					height = endY - startY, 
					overflow = (mb.w - width) + (mb.h - height);
		            arrowTop = (mb.h - this.arrowHeight) / 2;
		        }
		        else { //top, bottom
		            startX = (corner.charAt(1) == 'L' ? (pos.x + pos.w / 2 - mb.w / 2) : (pos.x - pos.w / 2 - mb.w / 2)), 
					startY = (corner.charAt(0) == 'T' ? pos.y : Math.max(view.t, pos.y - mb.h)), 
					endX = startX + mb.w, 
					endY = (corner.charAt(0) == 'T' ? Math.min(view.t + view.h, startY + mb.h) : pos.y), 
					width = endX - startX, 
					height = endY - startY, 
					overflow = (mb.w - width) + (mb.h - height);
		            arrowLeft = (mb.w - this.arrowWidth) / 2;
		        }
		        
		        if (best == null || overflow < best.overflow) {
		            best = {
		                corner: corner,
		                aroundCorner: choice.aroundCorner,
		                x: startX,
		                y: startY,
		                w: width,
		                h: height,
		                overflow: overflow
		            };
		        }
		        return !overflow;
		    }, this);
		    
		    node.style.left = best.x + "px";
		    node.style.top = best.y + "px";
		    
			this.connectorNode.style.top = "";
	        this.connectorNode.style.left = "";
	        if (arrowTop){
				this.connectorNode.style.top = arrowTop + "px";
			}
	        if (arrowLeft){
				this.connectorNode.style.left = arrowLeft + "px";
			}
	        
		    if (best.overflow && layoutNode) {
		        layoutNode(node, best.aroundCorner, best.corner);
		    }
		    return best;
		}
	});
	
	var masterTT = null;
	
	function showChartingTooltip(innerHTML, aroundNode, position, alignment){
		if(!masterTT){ masterTT = new MasterTooltip(); }
		return masterTT.show(innerHTML, aroundNode, position, alignment);
	}
	
	function hideChartingTooltip(aroundNode){
		if(!masterTT){ masterTT = new MasterTooltip(); }
		return masterTT.hide(aroundNode);
	}
})();
