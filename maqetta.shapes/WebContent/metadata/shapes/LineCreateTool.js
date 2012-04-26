define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ve/commands/MoveCommand",
	"davinci/ve/commands/ResizeCommand" /*,
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/MoveCommand",
	"davinci/ve/commands/ResizeCommand" */
], function(
	declare,
	CreateTool,
	ModifyCommand,
	MoveCommand,
	ResizeCommand /*,
	Widget,
	CompoundCommand,
	AddCommand,
	MoveCommand,
	ResizeCommand*/
) {

return declare(CreateTool, {
	
	constructor: function(data){
		this._md_x = null;
		this._md_y = null;
		this._mouseUpCounter = 0;
		this._exitCreateTool = false;
		this._points = [];
		this._pointsChanged = false;
	},

	/**
	 * In nearly all cases, mouseUp completes the create operation.
	 * But for certain widgets such as Shapes.line, we allow multi-segment
	 * lines to be created via multiple [mousedown/]mouseup gestures,
	 * in which case the widget-specific CreateTool subclass will override this function.
	 */
	exitCreateToolOnMouseUp: function(){
		return this._exitCreateTool;
	},

	/**
	 * Returns true if CreateTool.js should create a new widget as part of
	 * the current create operation, false if just add onto existing widget.
	 * For this tool (line tool), only create a new widget with first mouseUp.
	 */
	createNewWidget: function(){
		return (this._mouseUpCounter === 0);
	},
	
	onMouseDown: function(event){
		this._md_x = event.pageX;
		this._md_y = event.pageY;
		this.inherited(arguments);
	},
	
	onMouseMove: function(event){
		this.inherited(arguments);
		
		// If we've already dropped the first point, or we are dragging out first segment,
		// draw a line to current mouse location
		if(this._mouseUpCounter > 0 || typeof this._md_x == 'number'){
			if(!this._dragLine){
				var body = this._context.getContainerNode();
				this._dragLine = dojo.create('div',
						{style:'position:absolute;height:1px;border:none;border-top:1px dashed black;'},
						body);
				this._setCSS3Property(this._dragLine, 'transformOrigin','left top');
			}
			var style = this._dragLine.style;
			var o;
			if(this._mouseUpCounter === 0){
				style.left = this._md_x + 'px';
				style.top = this._md_y + 'px';
				o = this._getDistanceAndAngle(this._md_x, this._md_y, event.pageX, event.pageY);
			}else{
				var pt = this._points[this._points.length-1];
				var start_x = pt.x;
				var start_y = pt.y;
				if(this._widget && this._widget.domNode && this._widget.dijitWidget &&  this._widget.dijitWidget._points){
					var node = this._widget.domNode;
					var position = dojo.position(node, true);
					var oldPoints = this._widget.dijitWidget._points;
					var lastPoint = oldPoints[oldPoints.length-1];
					start_x = position.x + lastPoint.x;
					start_y = position.y + lastPoint.y;
				}
				style.left = start_x + 'px';
				style.top = start_y + 'px';
				o = this._getDistanceAndAngle(start_x, start_y, event.pageX, event.pageY);
			}
			style.width = o.distance + 'px';
			this._setCSS3Property(this._dragLine, 'transform','rotate('+o.degrees+'deg)');
		}
	},
	
	onMouseUp: function(event){
console.log('LineCreateTool.js onMouseUp.');
		// If this is first mouseUp and there was an associated mouseDown
		// then line will consist of single segment from mousedown location to mouseup location
		if(this._mouseUpCounter === 0 && typeof this._md_x == 'number'){
			if(this._sameSpot(this._md_x, this._md_y, event.pageX, event.pageY)){
				this._points.push({x:event.pageX, y:event.pageY});
			}else{
				this._points.push({x:this._md_x, y:this._md_y});
				this._points.push({x:event.pageX, y:event.pageY});
				this._exitCreateTool = true;
			}
			this._pointsChanged = true;
		
		// If this is first mouseUp and there was not an associated mouseDown,
		// then user dragged/dropped from widget palette onto canvas,
		// in which case use the default shape defined by widget metadata
		}else if(this._mouseUpCounter === 0){
			this._exitCreateTool = true;
			
		// If mouseUp is within <n> pixels of previous mouseUp, then exit CreateTool.
		}else if(this._mouseUpSameSpot(event.pageX, event.pageY)){
			this._exitCreateTool = true;
		
		// Otherwise, add mouseUp position to list of points
		}else{
			this._points.push({x:event.pageX, y:event.pageY});
			this._pointsChanged = true;
		}
		this.inherited(arguments);
		
		// Put after this.inherited because this.inherited calls createNewWidget() indirectly
		this._mouseUpCounter++;
		
		this._md_x = this._md_y = null;
		if(this._dragLine){
			this._dragLine.parentNode.removeChild(this._dragLine);
			this._dragLine = false;
		}
	},
	
	addToCommandStack: function(command, params){
		var widget = params.widget;
		if(this._pointsChanged && widget){
			var oldPoints = this._getPointsInPageUnits(widget);
			var newBounds = this._getBounds(this._points);
			var position = dojo.style(widget.domNode, 'position');
			var absolute = (position == 'absolute');
			if(oldPoints){
				// Do a bunch of math comparing old points list to new points list
				var oldBounds = this._getBounds(oldPoints);
				// if width or height is different or topbound is different, resizecommand
				// if left or top is different, movecommand
				// normalize newpoints to zero
				if(newBounds.w != oldBounds.w || newBounds.h != oldBounds.h){
					command.add(new ResizeCommand(widget, newBounds.w, newBounds.h, undefined /*apply to Normal state*/));
				}
				if(absolute && (newBounds.x != oldBounds.x || newBounds.y != oldBounds.y)){
					var oldLeft = parseInt(dojo.style(widget.domNode, 'left'));
					var oldTop = parseInt(dojo.style(widget.domNode, 'top'));
					var newLeft = oldLeft + (newBounds.x - oldBounds.x);
					var newTop = oldTop + (newBounds.y - oldBounds.y);
					command.add(new MoveCommand(widget, newLeft, newTop));	/*apply to Normal state*/
				}
			}
			var points;
			// Normalize coordinates such that (0,0) is aligned with SPAN's top/left
			if(this._points.length === 1){
				// Line widget requires at least 2 points
				points = '0,0,0,0';
			}else{
				points = '';
				for(var i=0; i<this._points.length; i++){
					var pt = this._points[i];
					if(i > 0){
						points += ',';
					}
					points += (pt.x - newBounds.x) + ',' + (pt.y - newBounds.y);
				}
			}
			var properties = { points:points };
			command.add(new ModifyCommand(widget, properties));
		}
	},
	
	_sameSpot: function(x1, y1, x2, y2){
		var tolerance = 10;
		return (Math.abs(x2 - x1) <= tolerance && Math.abs(y2 - y1) <= tolerance);
	},
	
	_mouseUpSameSpot: function(x, y){
		if(this._points.length === 0){
			return false;
		}else{
			var lastPoint = this._points[this._points.length-1];
			if(this._sameSpot(x, y, lastPoint.x, lastPoint.y)){
				return true;
			}else{
				return false;
			}
		}
	},
	
	_getBounds: function(points){
		if(!points && !points.length){
			return;
		}
		var min_x = points[0].x;
		var min_y = points[0].y;
		var max_x = min_x;
		var max_y = min_y;
		for(var i=1; i<points.length; i++){
			var pt = points[i];
			if(pt.x < min_x){
				min_x = pt.x;
			}
			if(pt.y < min_y){
				min_y = pt.y;
			}
			if(pt.x > max_x){
				max_x = pt.x;
			}
			if(pt.y > max_y){
				max_y = pt.y;
			}
		}
		return {x:min_x, y:min_y, w:max_x - min_x, h:max_y - min_y};
	},
	
	_setCSS3Property: function(node, domProperty, value){
		var style = node.style;
		var domPropertyUC = domProperty.charAt(0).toUpperCase() + domProperty.slice(1);
		style['webkit'+domPropertyUC] = value;
		style['moz'+domPropertyUC] = value;
		style['ms'+domPropertyUC] = value;
		style['o'+domPropertyUC] = value;
		style[domProperty] = value;
	},
	
	_getDistanceAndAngle: function(x1, y1, x2, y2){
		var o = {};
		var dx = x2 - x1;
		var dy = y2 - y1;
		o.distance = Math.sqrt(dx*dx + dy*dy);
		var radians =  Math.atan2(dy, dx);
		o.degrees = radians * 180 / Math.PI;
		return o;
	},
	
	_getPointsInPageUnits: function(widget){
		if(!widget || !widget.domNode || !widget.domNode.offsetParent || !widget.dijitWidget || !widget.dijitWidget._points){
			return;
		}
		var node = widget.domNode;
		var offsetLeft = node.offsetLeft;
		var offsetTop = node.offsetTop;
		var pn = node.offsetParent;
		while(pn && pn.tagName != 'BODY'){
			offsetLeft += pn.offsetLeft;
			offsetTop += pn.offsetTop;
			pn = pn.offsetParent;
		}
		var points = widget.dijitWidget._points;
		var pointsPageUnits = [];
		for(var i=0; i<points.length; i++){
			var pt = points[i];
			pointsPageUnits.push({x:pt.x + offsetLeft, y:pt.y + offsetTop});
		}
		return pointsPageUnits;
	}

});

});