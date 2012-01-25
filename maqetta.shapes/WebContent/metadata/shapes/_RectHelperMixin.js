dojo.provide("davinci.libraries.shapes.shapes._RectHelperMixin");
dojo.require("davinci.ve.commands.ModifyCommand");
dojo.require("davinci.ve.Snap");

dojo.declare("davinci.libraries.shapes.shapes._RectHelperMixin", null, {
	
	dragPointsStrings:['left_top','center_top','right_top','right_middle',
	           'right_bottom','center_bottom','left_bottom','left_middle'],
	
	/*
	 * Returns list of draggable end points for this shape in "px" units
	 * relative to top/left corner of enclosing SPAN
	 * @return {object} whose properties represent widget-specific types of draggable points
	 *   For example, widgets that represent a series of points will include a 'points'
	 *   property which is an array of object of the form {x:<number>,y:<number>}
	 */
	getDraggables: function(){
		var dijitWidget = this._widget.dijitWidget;
		var xoffset = dijitWidget._xoffset;
		var yoffset = dijitWidget._yoffset;
		var width = dijitWidget._width;
		var height = dijitWidget._height;
		var left = xoffset;
		var center = left + width/2;
		var right = left + width;
		var top = yoffset;
		var middle = top + height/2;
		var bottom = top + height;
		var points=[
		    {x:left, y:top},
		    {x:center, y:top},
		    {x:right, y:top},
		    {x:right, y:middle},
		    {x:right, y:bottom},
		    {x:center, y:bottom},
		    {x:left, y:bottom},
		    {x:left, y:middle}
		];
		return {points:points};
	},

	/*
	 * Widget-specific logic for onmousedown during drag operations.
	 * @param {object} params  Params, including params.e (holds mousedown event)
	 */
	onMouseDown_Widget: function(params){
		var dijitWidget = this._widget.dijitWidget;
		// this.orig_* holds original x,y,width,height
		// this.un_* holds dynamically updated "unconstrained" values for x,y,width,height
		// (unconstrained means shift key is not held down)
		this.un_x = this.orig_x = dijitWidget._x;
		this.un_y = this.orig_y = dijitWidget._y;
		this.un_width = this.orig_width = dijitWidget._width;
		this.un_height = this.orig_height = dijitWidget._height;
	},

	/*
	 * Move end point <index> by (dx,dy)
	 */
	dragEndPointDelta: function(params){
		var index = params.index,
			dx = params.dx,
			dy = params.dy,
			pageX = params.pageX,
			pageY = params.pageY,
			event = params.e;
		var dijitWidget = this._widget.dijitWidget;
		if(index<0 || index>=8){
			console.error('_RectShapeHelperMixin dragEndPointDelta(): index='+index);
			return;
		}
		var s = this.dragPointsStrings[index];
		
		// Update the rectangle parameters for what the result should be
		// if not doing constrained resize (constrained resize via shift key)
		if(s.indexOf('left')>=0){
			this.un_x = this.un_x + dx;
			this.un_width = this.un_width - dx;
		}else if(s.indexOf('right')>=0){
			this.un_width = this.un_width + dx;
		}
		if(s.indexOf('top')>=0){
			this.un_y = this.un_y + dy;
			this.un_height = this.un_height - dy;
		}else if(s.indexOf('bottom')>=0){
			this.un_height = this.un_height + dy;
		}
		
		// Shift modifier causes constrained drawing (i.e., forces a square)
		if(event.shiftKey){
			if((s=='center_top' && this.un_y < this.orig_y) || 
					(s=='center_bottom' && this.un_height > this.orig_height) || 
					(s=='left_middle' && this.un_x < this.orig_x) ||
					(s=='right_middle' && this.un_width > this.orig_width)){
				// If dragging a control point on middle of an side and dragging outward, use larger of width/height
				if(this.un_width > this.un_height){
					dijitWidget._width = dijitWidget._height = this.un_width;
				}else{
					dijitWidget._width = dijitWidget._height = this.un_height;
				}
			}else{
				// Otherwise, use smaller of width/height
				if(this.un_width < this.un_height){
					dijitWidget._width = dijitWidget._height = this.un_width;
				}else{
					dijitWidget._width = dijitWidget._height = this.un_height;
				}
			}
			if(s.indexOf('left')>=0){
				dijitWidget._x = this.orig_x + this.orig_width - dijitWidget._width;
			}else if(s.indexOf('center')>=0){
				dijitWidget._x = this.orig_x + this.orig_width/2 - dijitWidget._width/2;
			}else if(s.indexOf('right')>=0){
				dijitWidget._x = this.orig_x;
			}
			if(s.indexOf('top')>=0){
				dijitWidget._y = this.orig_y + this.orig_height - dijitWidget._height;
			}else if(s.indexOf('middle')>=0){
				dijitWidget._y = this.orig_y + this.orig_height/2 - dijitWidget._height/2;
			}else if(s.indexOf('bottom')>=0){
				dijitWidget._y = this.orig_y;
			}
			
		// If shift key not held down, then resize using unconstrained values
		}else{
			dijitWidget._x = this.un_x;
			dijitWidget._y = this.un_y;
			dijitWidget._width = this.un_width;
			dijitWidget._height = this.un_height;
		}
		
		dijitWidget.createGraphics();
		dijitWidget.resize();
		var newBbox = dijitWidget._g.getBBox();
		dijitWidget._svgroot.style.marginLeft = (newBbox.x - dijitWidget._bboxStartup.x) + 'px';
		dijitWidget._svgroot.style.marginTop = (newBbox.y - dijitWidget._bboxStartup.y) + 'px';
		//davinci.ve.Snap.updateSnapLines(this._widget.getContext(), {l:pageX,t:pageY,w:0,h:0});
        var context = this._widget ? this._widget.getContext() : undefined;
        var position_prop;
        if(this._widget){
            var position_prop = dojo.style(this._widget.domNode,"position");
        }
        var absolute = (position_prop=="absolute");
        var doSnapLines = absolute;
        if(doSnapLines && event && this._widget && context){
            var data = {type:this._widget.type};
            var position = { x:event.pageX, y:event.pageY};
            var snapBox = {l:pageX,t:pageY,w:0,h:0};
            // Call the dispatcher routine that updates snap lines and
            // list of possible parents at current (x,y) location
            context.dragMoveUpdate({
                    data:data,
                    eventTarget:event.target,
                    position:position,
                    absolute:absolute,
                    currentParent:null,
                    rect:snapBox, 
                    doSnapLines:doSnapLines, 
                    doFindParentsXY:false});
        }else if(context){
            // If not showing snap lines or parents, then make sure they aren't showing
            context.dragMoveCleanup();
        }
	},

	/*
	 * Widget-specific logic for onmousemove and onmouseout during drag operations.
	 * @param {Element} handle  DOM node that is being dragged around
	 *   The dragging logic adds a _shapeDraggable property onto the DOM node
	 *   that indicates which DOM node is being dragged
	 * @param {number} dx  Amount the drag point has moved in x
	 * @param {number} dy  Amount the drag point has moved in y
	 */
	onMouseMoveOut_Widget: function(params){
		// Info about which point was dragged is stored within a hidden
		// _shapeDraggable property on the overlay SPAN that the user is dragging around
		// For path-oriented shapes, _shapeDraggable.point holds index of point being dragged
		var handle = params.handle;
		var pointIndex = handle._shapeDraggable.point;
		var newparams = dojo.mixin({index:pointIndex},params);
		this.dragEndPointDelta(newparams);		
	},

	/*
	 * Widget-specific logic for onmouseup during drag operations.
	 * @param {object} command  For undo stack, compound command into which 
	 *         any widget-specific command should be added
	 */
	onMouseUp_Widget: function(command){
		var widget = this._widget;
		var dijitWidget = widget.dijitWidget;
		
		// Normalize coordinates so that minX, minY is at (0,0)
		dijitWidget._x = 0;
		dijitWidget._y = 0;
		
		var valuesObject = {width:dijitWidget._width, height:dijitWidget._height};
		command.add(davinci.ve.commands.ModifyCommand(widget, valuesObject, null));
        var context = this._widget ? this._widget.getContext() : undefined;
        context.dragMoveCleanup();
	}

});
