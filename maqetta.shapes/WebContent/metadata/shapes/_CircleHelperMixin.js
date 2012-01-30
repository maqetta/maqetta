define([
	"davinci/ve/commands/ModifyCommand"
], function(ModifyCommand) {

var _CircleHelperMixin = function() {};
_CircleHelperMixin.prototype = {

	dragPointsStrings:['left_top','center_top','right_top','right_middle',
	    	           'right_bottom','center_bottom','left_bottom','left_middle'],
	    	
	create: function(widget, srcElement){
		//FIXME: Maybe we don't need this function
	},
	
	//FIXME: Looks like this can be shared between rects and ellipses
	
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
		var rx = (typeof dijitWidget._rx != "undefined") ? dijitWidget._rx : dijitWidget._r;
		var ry = (typeof dijitWidget._ry != "undefined") ? dijitWidget._ry : dijitWidget._r;
		var width = rx+rx;
		var height = ry+ry;
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
		this.un_cx = this.orig_cx = dijitWidget._cx;
		this.un_cy = this.orig_cy = dijitWidget._cy;
		this.un_rx = this.orig_rx = dijitWidget._rx;
		this.un_ry = this.orig_ry = dijitWidget._ry;
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
			this.un_cx = this.un_cx + dx/2;
			this.un_rx = this.un_rx - dx;
		}else if(s.indexOf('right')>=0){
			this.un_rx = this.un_rx + dx;
		}
		if(s.indexOf('top')>=0){
			this.un_cy = this.un_cy + dy/2;
			this.un_ry = this.un_ry - dy;
		}else if(s.indexOf('bottom')>=0){
			this.un_ry = this.un_ry + dy;
		}
		
		// Shift modifier causes constrained drawing (i.e., forces a square)
		if(event.shiftKey){
			if((s=='center_top' && this.un_cy < this.orig_cy) || 
					(s=='center_bottom' && this.un_ry > this.orig_ry) || 
					(s=='left_middle' && this.un_cx < this.orig_cx) ||
					(s=='right_middle' && this.un_rx > this.orig_rx)){
				// If dragging a control point on middle of an side and dragging outward, use larger of width/height
				if(this.un_rx > this.un_ry){
					dijitWidget._rx = dijitWidget._ry = this.un_rx;
				}else{
					dijitWidget._rx = dijitWidget._ry = this.un_ry;
				}
			}else{
				// Otherwise, use smaller of width/height
				if(this.un_rx < this.un_ry){
					dijitWidget._rx = dijitWidget._ry = this.un_rx;
				}else{
					dijitWidget._rx = dijitWidget._ry = this.un_ry;
				}
			}
			dijitWidget._cx = this.orig_cx;
			dijitWidget._cy = this.orig_cy;
			
		// If shift key not held down, then resize using unconstrained values
		}else{
			dijitWidget._cx = this.un_cx;
			dijitWidget._cy = this.un_cy;
			dijitWidget._rx = this.un_rx;
			dijitWidget._ry = this.un_ry;
		}
		
		var newBbox = dijitWidget._g.getBBox();
		dijitWidget.createGraphics();
		dijitWidget.resize();
		dijitWidget._svgroot.style.marginLeft = (newBbox.x - dijitWidget._bboxStartup.x) + 'px';
		dijitWidget._svgroot.style.marginTop = (newBbox.y - dijitWidget._bboxStartup.y) + 'px';
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
		dijitWidget._cx = dijitWidget._rx / 2;
		dijitWidget._cy = dijitWidget._ry / 2;
		
		var valuesObject = {cx:dijitWidget._cx, cy:dijitWidget._cy};
		if(dijitWidget.rx != "undefined"){
			valuesObject.rx = dijitWidget._rx;
			valuesObject.ry = dijitWidget._ry;
		}else{

			valuesObject.r = dijitWidget._rx;
		}
		command.add(new ModifyCommand(widget, valuesObject, null));
        var context = this._widget ? this._widget.getContext() : undefined;
        context.dragMoveCleanup();
	}
};

return _CircleHelperMixin;

});