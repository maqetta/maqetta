define([
	"davinci/Workbench",
    "davinci/workbench/Preferences",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ve/utils/GeomUtils"
], function(Workbench, Preferences, ModifyCommand, GeomUtils) {

var _PathHelperMixin = function() {};
_PathHelperMixin.prototype = {

	/**
	 * Invoked by Snap.js from core application to get a snapping rect for this widget
	 * and/or a set of snapping points.
	 * @param {davinci.ve._Widget} widget
	 * @param {object} widgetSnapInfo. Default snapping info if helper doesn't override.
	 *      widgetSnapInfo.snapRect: {l:, c:, r:, t:, m:, b:} // all numbers in page coordinate system
	 * @return {object} Returns either the original widgetSnapInfo or an alternate object that can contain
	 * 		a snapRect sub-object and/or a snapPoints sub-object (array of objects)
	 *      {
	 *         snapRect: {l:, c:, r:, t:, m:, b:} // all numbers in page coordinate system
	 *         snapPoints: [{x:, y:}] // all numbers in page coordinate system
	 *      }
	 */
	getSnapInfo: function(widget, widgetSnapInfo){
		var newSnapInfo = dojo.clone(widgetSnapInfo);
		var dijitWidget = widget.dijitWidget;
		var points = dojo.clone(dijitWidget._points);
		var pos = dojo.position(dijitWidget._svgroot, true);
		for (var i=0; i<points.length; i++){
			var p = points[i];
			p.x = p.x + pos.x;
			p.y = p.y + pos.y;
		}
		newSnapInfo.snapPoints = points;
		return newSnapInfo;
	},
	
	/*
	 * Returns list of draggable end points for this shape in "px" units
	 * relative to top/left corner of enclosing SPAN
	 * @param params {object}  params.widget: current widget
	 * @return {object} whose properties represent widget-specific types of draggable points
	 *   For example, widgets that represent a series of points will include a 'points'
	 *   property which is an array of object of the form {x:<number>,y:<number>}
	 */
	getDraggables: function(params){
		if(!params || !params.widget){
			return;
		}
		var widget = params.widget;
		var dijitWidget = widget.dijitWidget;
		var points = dojo.clone(dijitWidget._points);
		if(!dijitWidget._bbox){
			dijitWidget.resize();
		}
		var thisbbox = dijitWidget._bbox;
		var minx = thisbbox.x;
		var miny = thisbbox.y;
		var xoffset = dijitWidget._xoffset;
		var yoffset = dijitWidget._yoffset;
		for(var i=0; i<points.length; i++){
			var p = points[i];
			p.x = (p.x - minx) + xoffset;
			p.y = (p.y - miny) + yoffset;
		}
		return {points:points};
	},


	/*
	 * Widget-specific logic for onmousedown during drag operations.
	 * @param {object} params  Params, including params.e (holds mousedown event)
	 */
	onMouseDown_Widget: function(params){
		if(!params || !params.handle || !params.handle._shapeDraggable || !params.widget){
			return;
		}
		var widget = params.widget;
		var dijitWidget = widget.dijitWidget;
		var index = params.handle._shapeDraggable.point;
		var p = dijitWidget._points[index];
		// this.orig_* holds original x,y
		// this.un_* holds dynamically updated "unconstrained" values for x,y
		// (unconstrained means shift key is not held down)
		this.orig_p = dojo.clone(p);
		this.un_p = dojo.clone(p);
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
			event = params.e,
			widget = params.widget;
		var dijitWidget = widget.dijitWidget;
		if(index < 0 || index >= dijitWidget._points.length || dijitWidget._points.length < 2){
			return;
		}
		
        var context = widget ? widget.getContext() : undefined;
        if(context){
            var parentIframeBounds = GeomUtils.getBorderBoxPageCoords(context.getParentIframe());
            pageX -= parentIframeBounds.l;
            pageY -= parentIframeBounds.t;
        }
		
		// Update unconstrained values (i.e., values if shift key not held)
		this.un_p.x = this.un_p.x + dx;
		this.un_p.y = this.un_p.y + dy;
		
		var p = dijitWidget._points[index];

		// Shift modifier causes constrained drawing (i.e., horiz or vert versus previous point)
		if(event.shiftKey){
			// If point#0, constrain relative to point#1
			var refPoint;
			if (! index) {
				refPoint = dijitWidget._points[1];
			// Otherwise, constrain versus previous point
			} else {
				refPoint = dijitWidget._points[index-1];
			}
			var absDeltaX = Math.abs(this.un_p.x - refPoint.x);
			var absDeltaY = Math.abs(this.un_p.y - refPoint.y);
			if(absDeltaX > absDeltaY){
				p.x = this.un_p.x;
				p.y = refPoint.y;
			}else{
				p.x = refPoint.x;
				p.y = this.un_p.y;
			}
			//p.x = this.un_p.x;
			//p.y = this.un_p.y;

		// If shift key not held down, then move point without constraint processing
		}else{
			p.x = this.un_p.x;
			p.y = this.un_p.y;
		}

		dijitWidget.createGraphics();
		dijitWidget.resize();
		var newBbox = dijitWidget._g.getBBox();
		dijitWidget.adjustBBox_Widget(newBbox);
		dijitWidget._svgroot.style.marginLeft = (newBbox.x - dijitWidget._bboxStartup.x) + 'px';
		dijitWidget._svgroot.style.marginTop = (newBbox.y - dijitWidget._bboxStartup.y) + 'px';
        var position_prop;
        if(widget){
            var position_prop = dojo.style(widget.domNode,"position");
        }
        var absolute = (position_prop=="absolute");
		var editorPrefs = Preferences.getPreferences('davinci.ve.editorPrefs', 
				Workbench.getProject());
		var doSnapLinesX = editorPrefs.snap && absolute;
		var doSnapLinesY = doSnapLinesX;
        if((doSnapLinesX || doSnapLinesY) && event && widget && context){
            var data = {type:widget.type};
            var position = { x:pageX, y:pageY};
            var snapBox = {l:pageX,t:pageY,w:0,h:0};
            // Call the dispatcher routine that updates snap lines and
            // list of possible parents at current (x,y) location
            context.dragMoveUpdate({
                    widgets:[widget],
                    data:data,
                    eventTarget:event.target,
                    position:position,
                    absolute:absolute,
                    currentParent:null,
                    rect:snapBox, 
                    doSnapLinesX:doSnapLinesX, 
                    doSnapLinesY:doSnapLinesY, 
                    doFindParentsXY:false,
            		doCursor:!absolute});
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
	onMouseUp_Widget: function(command, params){
		if(!params || !params.widget){
			return;
		}
		var widget = params.widget;
		var dijitWidget = widget.dijitWidget;
		var points = dijitWidget._points;
		
		// Normalize coordinates so that minX, minY is at (0,0)
		var minX = points[0].x;
		var minY = points[0].y;
		for (var i=1; i<points.length; i++){
			var x = points[i].x;
			var y = points[i].y;
			if(x < minX){
				minX = x;
			}
			if(y < minY){
				minY = y;
			}
		}
		var arr = [];
		for (var i=0; i<points.length; i++){
			arr.push(points[i].x - minX);
			arr.push(points[i].y - minY);
		}
		var s_points = arr.join();
		var valuesObject = {points:s_points};
		command.add(new ModifyCommand(widget, valuesObject, null));
        var context = widget ? widget.getContext() : undefined;
        context.dragMoveCleanup();
	}

};

return _PathHelperMixin;

});