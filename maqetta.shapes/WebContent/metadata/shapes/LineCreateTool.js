define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"davinci/ve/metadata",
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
	connect,
	Metadata,
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
		this._md_x = this._md_y = null;
		this._mouseUpCounter = 0;
		this._exitCreateTool = false;
		this._points = [];
		this._pointsChanged = false;
		this._gesture = 'click';
		connect.subscribe("/davinci/ve/activeToolChanged", function(context, newtool){
			this._removeDragLine();
		}.bind(this));
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
			var o, start_x, start_y, retObj;
			if(this._mouseUpCounter === 0){
				start_x = this._md_x;
				start_y = this._md_y;
			}else{
				var pt = this._points[this._points.length-1];
				start_x = pt.x;
				start_y = pt.y;
				if(this._widget && this._widget.domNode && this._widget.dijitWidget &&  this._widget.dijitWidget._points){
					var node = this._widget.domNode;
					var position = dojo.position(node, true);
					var oldPoints = this._widget.dijitWidget._points;
					var lastPoint = oldPoints[oldPoints.length-1];
					start_x = position.x + lastPoint.x;
					start_y = position.y + lastPoint.y;
				}
			}
			retObj = this._shiftKeyProcessing(event, start_x, start_y, event.pageX, event.pageY);
			var end_x = retObj.x;
			var end_y = retObj.y;
			o = this._getDistanceAndAngle(start_x, start_y, end_x, end_y);
			style.left = start_x + 'px';
			style.top = start_y + 'px';
			style.width = o.distance + 'px';
			this._setCSS3Property(this._dragLine, 'transform','rotate('+o.degrees+'deg)');
		}
	},
	
	onMouseUp: function(event){
		var multiSegment = Metadata.queryDescriptorByName(this._data.name, this._data.type, 'multiSegment');

		var retObj, start_x, start_y, end_x, end_y;
		
		// If multiSegment is true, then user clicks multiple times for multiple points.
		// To stop, either click on last point a second time or press ESC
		if(multiSegment){
			// If this is first mouseUp and there was an associated mouseDown
			// then line will consist of single segment from mousedown location to mouseup location
			if(this._mouseUpCounter === 0 && typeof this._md_x == 'number'){
				if(this._sameSpot(this._md_x, this._md_y, event.pageX, event.pageY)){
					// If mousedown and mouseup at same point, add one point
					this._points.push({x:event.pageX, y:event.pageY});
				}else{
					start_x = this._md_x;
					start_y = this._md_y;
					this._points.push({x:start_x, y:start_y});
					retObj = this._shiftKeyProcessing(event, start_x, start_y, event.pageX, event.pageY);
					end_x = retObj.x;
					end_y = retObj.y;
					this._points.push({x:end_x, y:end_y});
					this._gesture = 'drag';
				}
				this._pointsChanged = true;
			
			// If this is first mouseUp and there was not an associated mouseDown,
			// then user dragged/dropped from widget palette onto canvas,
			// in which case use the default shape defined by widget metadata
			}else if(this._mouseUpCounter === 0){
				this._exitCreateTool = true;
				
			// If mouseUp is within <n> pixels of previous mouseUp, then exit CreateTool.
			}else if(this._mouseUpSameSpot(event.pageX, event.pageY)){
				this._pointsChanged = false;
				this._exitCreateTool = true;
			
			// Otherwise, add mouseUp position to list of points
			}else{
				var lastPoint = this._points[this._points.length-1];
				start_x = lastPoint.x;
				start_y = lastPoint.y;
				retObj = this._shiftKeyProcessing(event, start_x, start_y, event.pageX, event.pageY);
				end_x = retObj.x;
				end_y = retObj.y;
				this._points.push({x:end_x, y:end_y});
				this._pointsChanged = true;
			}
		// If single-segment
		}else{
			
			// If there was an associated mouseDown and mouseUp is at a different location,
			// then line will consist of single segment from mousedown location to mouseup location
			if(typeof this._md_x == 'number' && !this._sameSpot(this._md_x, this._md_y, event.pageX, event.pageY)){
				start_x = this._md_x;
				start_y = this._md_y;
				this._points.push({x:start_x, y:start_y});
				retObj = this._shiftKeyProcessing(event, start_x, start_y, event.pageX, event.pageY);
				end_x = retObj.x;
				end_y = retObj.y;
				this._points.push({x:end_x, y:end_y});
				this._gesture = 'drag';
				this._pointsChanged = true;
			}
			// Otherwise, user dragged from widget palette and dropped, or
			// mouseDown and mouseUp were at approximately same location,
			// so use default shape at mouseUp location.
			this._exitCreateTool = true;
		}
		
		this.inherited(arguments);
		
		this._md_x = this._md_y = null;
		this._removeDragLine();
	},
	
	mouseUpProcessingCompleted: function(){
		// Need a special function in createtool helper to say that mouseup/createwidget actions
		// have been completed because there are a couple of nested deferred/async blocks of
		// code in CreateTool. Can't just put it at end of LineCreateTool.js:onMouseUp()
		// because before helpers are loaded function createNewWidget() above might be called too soon
		this._mouseUpCounter++;
	},
	
	addToCommandStack: function(command, params){
		var widget = params.widget;
		if(this._pointsChanged && widget){
			var oldPoints = this._getPointsInPageUnits(widget);
			var newBounds = this._getBounds(this._points);
			var position = dojo.style(widget.domNode, 'position');
			var absolute = (position == 'absolute');
			
			// Flow layout might have shifted earlier points, so use
			// oldPoints for all points except the last one(s) added by current gesture
			var newPoints = (this._gesture == 'drag') ? 2 : 1;
			
			if(oldPoints){
				// Do a bunch of math comparing old points list to new points list
				var oldBounds = this._getBounds(oldPoints);
				
				// Update this._points and newBounds to make sure that this_points
				// has the actual location of the already-existing points, which
				// might have shifted due to flow layout
				for(var i=0; i<this._points.length - newPoints; i++){
					this._points[i] = oldPoints[i];
				}
				newBounds = this._getBounds(this._points);
				
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
			var s;
			// Normalize coordinates such that (0,0) is aligned with SPAN's top/left
			if(this._points.length === 1){
				// Line widget requires at least 2 points
				s = '0,0,0,0';
			}else{
				s = '';
				for(var i=0; i<this._points.length; i++){
					var pt = this._points[i];
					if(i > 0){
						s += ',';
					}
					s += (pt.x - newBounds.x) + ',' + (pt.y - newBounds.y);
				}
			}
			var properties = { points:s };
			command.add(new ModifyCommand(widget, properties));
		}
	},
	
	/**
	 * returns {x:, y:} with either the original end_x or end_y
	 * or, if shift key is down, adjusted coordinates to constrain to horiz or vert
	 */
	_shiftKeyProcessing: function(event, start_x, start_y, end_x, end_y){
		var retObj = { x:end_x, y:end_y };
		var minDistance = 10;
		if(event.shiftKey){
			var diff_x = Math.abs(end_x - start_x);
			var diff_y = Math.abs(end_y - start_y);
			if(diff_x >= minDistance || diff_y >= minDistance){
				if(diff_x >= diff_y){
					retObj.y = start_y;
				}else{
					retObj.x = start_x;
				}
			}
		}
		return retObj;
	},
	
	onKeyDown: function(event){
		if(event.keyCode == 27){	//Esc
			this._pointsChanged = false;
			this._exitCreateTool = true;
			this._removeDragLine();
		}
		this.inherited(arguments);
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
		style['Moz'+domPropertyUC] = value;
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
		if(!widget || !widget.dijitWidget || !widget.dijitWidget._points){
			return;
		}
		var offsets = this._getOffsets(widget);
		if(!offsets){
			return;
		}
		var offsetLeft = offsets.offsetLeft;
		var offsetTop = offsets.offsetTop;
		var points = widget.dijitWidget._points;
		var pointsPageUnits = [];
		for(var i=0; i<points.length; i++){
			var pt = points[i];
			pointsPageUnits.push({x:pt.x + offsetLeft, y:pt.y + offsetTop});
		}
		return pointsPageUnits;
	},
	
	_getOffsets: function(widget){
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
		return {offsetLeft:offsetLeft, offsetTop:offsetTop};
	},
	
	_removeDragLine: function(){
		if(this._dragLine){
			this._dragLine.parentNode.removeChild(this._dragLine);
			this._dragLine = false;
		}
	}

});

});