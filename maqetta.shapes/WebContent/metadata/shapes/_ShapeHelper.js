define([
    "davinci/Runtime",
    "davinci/Workbench",
	"dojo/_base/connect",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/utils/GeomUtils",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/StyleCommand",
	"davinci/ve/widget"
], function(Runtime, Workbench, connect, CreateTool, GeomUtils, CompoundCommand, StyleCommand, widgetUtils) {

var _ShapeHelper = function() {};
_ShapeHelper.prototype = {
		
	_connects: [],			// mousedown event is put on this array
	_connectsDrag: [],		// dragging events like mousemove, mouseup events are put on this array
	_dragDivOffset:100, 	// #pixels extra space on left/right/top/bottom for transparent drag div

	/**
	 * Invoked when adding a new widget to the page; when changing properties on a widget (and
	 * the widget is recreated); or for each widget when loading a page into the visual editor.
	 */
	create: function(widget, srcElement) {
		if(!widget._stateChangeListener){
			widget._stateChangeListener = connect.subscribe('/maqetta/appstates/state/changed',function(){
				var context = widget.getContext();
				var editor = context.editor;
				if(editor && editor == Runtime.currentEditor){
					widget.dijitWidget.resize();
				}
			});
		}
	},

	/*
	 * Called by Focus.js right after Maqetta shows selection chrome around a widget.
	 * @param {object} obj  Data passed into this routine is found on this object
	 *    obj.widget: A davinci.ve._Widget which has just been selected
	 *    obj.customDiv: DIV into which widget can inject its own selection chrome
	 * @return {boolean}  Return false if no problems.
	 * FIXME: Better if helper had a class inheritance setup
	 */
	onShowSelection: function(obj){
		if(!obj || !obj.widget || !obj.widget.dijitWidget || !obj.customDiv){
			return true;
		}
		// Need to pull back by 3 because total size is 6 (4px inside, plus 2*1px for border)
		// FIXME: Note that this assumes onscreen selection boxes are a hardcoded size
		// Somehow need to compute this dynamically at run-time
		var centeringShift = 6;
		
		var widget = obj.widget;
		var dijitWidget = obj.widget.dijitWidget;
		
		var div = obj.customDiv;
		var l,t;

		// The focus selection DIV is sometimes pulled in from left/top
		// so that it won't get clipped off the screen. Need to unadjust the adjustments.
		div.innerHTML = '';

		var draggables = this.getDraggables({widget:widget});
		var points = draggables.points;
		// onShowSelection can get called multiple times for the same selection action.
		// Remove previous nobs and connections if still present
		this._removeNobs(widget);
		if(points){
			widget._dragNobs = [];
			var handle;
			for (var i=0; i<points.length; i++){
				l = points[i].x - centeringShift;
				t = points[i].y - centeringShift;
				widget._dragNobs[i] = handle = dojo.create('span',{
					className:'editFocusNob',
					style:{ position:'absolute', display:'block', left:l+'px', top:t+'px' }	
				},div);
				handle._shapeDraggable = {point:i};
				handle._widget = widget;
				this._connects.push(connect.connect(handle, 'mousedown', dojo.hitch(this,this.onMouseDown, widget)));
			}
		}else{
			delete widget._dragNobs;
		}
		return false;
	},

	/**
	 * Called by Focus.js right after Maqetta hides selection chrome on a widget.
	 * @param {object} obj  Data passed into this routine is found on this object
	 *    obj.widget: A davinci.ve._Widget which has just been selected
	 *    obj.customDiv: DIV into which widget can inject its own selection chrome
	 * @return {boolean}  Return false if no problems.
	 * FIXME: Better if helper had a class inheritance setup
	 */
	onHideSelection: function(obj){
		if(obj && obj.widget){
			this._removeNobs(obj.widget);
		}
		this._removeDragConnects();
	},

	onMouseDown: function(widget, e){
		this._connectsDrag.push(connect.connect(document, 'mousemove', dojo.hitch(this,this.onMouseMoveOut,widget)));
		this._connectsDrag.push(connect.connect(document, 'mouseout', dojo.hitch(this,this.onMouseMoveOut,widget)));
		this._connectsDrag.push(connect.connect(document, 'mouseup', dojo.hitch(this,this.onMouseUp,widget)));

		// Don't process this event if current tool is CreateTool because
		// that means that mouse operations are adding points.
		var currentEditor = Runtime.currentEditor;
		var context = (currentEditor.getContext && currentEditor.getContext());
		if(context){
			var tool = (context.getActiveTool && context.getActiveTool());
			if(!tool){
				return;
			}
			if(tool.isInstanceOf(CreateTool)){
				var fakeEvent = this._makeFakeEvent(e);
				tool.onMouseDown(fakeEvent);
				return;
			}
		}
		
		e.stopPropagation();
		var domNode = widget.domNode;
		this._origSpanPos = dojo.position(domNode, true);
		var handle = e.target;
		this._dragging = handle;
		this._dragx = e.pageX;
		this._dragy = e.pageY;
		this._left = handle.style.left;
		this._top = handle.style.top;
		this._origLeft = domNode.style.left;
		this._origTop = domNode.style.top;
		this._origWidth = domNode.style.width;
		this._origHeight = domNode.style.height;
		
		// width/height adjustment factors, using inside knowledge of CSS classes
		var offset = 100;
		var l = e.pageX - this._dragDivOffset;
		var t = e.pageY - this._dragDivOffset;
		var w = this._dragDivOffset + this._dragDivOffset;
		var h = w;
		if(davinci.Workbench._shapesDragDiv){
			davinci.Workbench._shapesDragDiv.parentNode.removeChild(davinci.Workbench._shapesDragDiv);
		}
		davinci.Workbench._shapesDragDiv = dojo.create('div', {className:'shapesDragDiv', 
				style:'left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;'},
				document.body);
		if(this.onMouseDown_Widget){
			this.onMouseDown_Widget({handle:handle, e:e, widget:widget});
		}

	},
	
	onMouseMoveOut: function(widget, e){
		if(this._dragging){
			e.stopPropagation();
			var x = e.pageX,
				y = e.pageY;
			var dx = x - this._dragx;
			var dy = y - this._dragy;
			if(dx!=0||dy!=0){
				davinci.Workbench._shapesDragDiv.style.left = (e.pageX - this._dragDivOffset) + 'px';
				davinci.Workbench._shapesDragDiv.style.top = (e.pageY - this._dragDivOffset) + 'px';
				this._dragx = x;
				this._dragy = y;
				var handle = this._dragging;
				var oldLeft = parseFloat(handle.style.left);
				var oldTop = parseFloat(handle.style.top);
				handle.style.left = (oldLeft + dx) + 'px';
				handle.style.top = (oldTop + dy) + 'px';
				if(this.onMouseMoveOut_Widget){
					this.onMouseMoveOut_Widget({handle:handle, dx:dx, dy:dy, pageX:x, pageY:y, e:e, widget:widget});
				}
			}
		}
	},
	
	onMouseUp: function(widget, e){
		// Don't process this event if current tool is CreateTool because
		// that means that mouse operations are adding points.
		var currentEditor = Runtime.currentEditor;
		var context = (currentEditor.getContext && currentEditor.getContext());
		if(context){
			var tool = (context.getActiveTool && context.getActiveTool());
			if(!tool){
				return;
			}
			if(tool.isInstanceOf(CreateTool)){
				this._removeDragConnects();
				var fakeEvent = this._makeFakeEvent(e);
				tool.onMouseUp(fakeEvent);
				return;
			}
		}
		e.stopPropagation();
		
		if(davinci.Workbench._shapesDragDiv){
			davinci.Workbench._shapesDragDiv.parentNode.removeChild(davinci.Workbench._shapesDragDiv);
			delete davinci.Workbench._shapesDragDiv;
		}
		this._removeDragConnects();
		
		if(!this._dragging){
			return;
		}
		this._dragging = null;

		function getComputedNumVal(domNode, propName){
			var computedValue = dojo.style(domNode, propName);
			var numValue = parseFloat(computedValue);
			if(isNaN(numValue)){
				numValue = 0;
			}
			return numValue;
		}
		var dijitWidget = widget.dijitWidget;
		var context = widget._edit_context;
		var domNode = widget.domNode;
		var svgNode = widget.dijitWidget._svgroot;
		var position = dojo.style(domNode, 'position');
		
		var spanLeft = getComputedNumVal(domNode, 'left');
		var spanTop = getComputedNumVal(domNode, 'top');
		var spanWidth = getComputedNumVal(domNode, 'width');
		var spanHeight = getComputedNumVal(domNode, 'height');
		var svgMarginLeft = getComputedNumVal(svgNode, 'marginLeft');
		var svgMarginTop = getComputedNumVal(svgNode, 'marginTop');
		var left = (spanLeft + svgMarginLeft) + 'px';
		var top = (spanTop + svgMarginTop) + 'px';
		var width = (spanWidth + svgMarginLeft) + 'px';
		var height = (spanHeight + svgMarginTop) + 'px';
		var command = new CompoundCommand();
		
		// Restore SPAN positioning properties to values before dragging started
		// Otherwise, undo logic gets confused
    	var values = widget.getStyleValues();
    	values.left = this._origLeft;
    	values.top = this._origTop;
    	values.width = this._origWidth;
    	values.height = this._origHeight;

		// If absolute positioning, update left and top properties to factor
		// in marginLeft and marginTop updates that happened during dragging
    	var props;
		if(position == 'absolute' || position == 'fixed'){
			props = [{left:left}, {top:top}, {width:width}, {height:height}];
		}else{
			props = [{width:width}, {height:height}];
		}
		command.add(new StyleCommand(widget, props));

		if(this.onMouseUp_Widget){
			this.onMouseUp_Widget(command, {widget:widget});
		}
		
		var w_id = widget.id;
		context.getCommandStack().execute(command);
		var newWidget = widgetUtils.byId(w_id, context.getDocument());
		context.select(newWidget);

	},

	/*
	 * Returns list of draggable end points for this shape in "px" units
	 * relative to top/left corner of enclosing SPAN.
	 * Can be overridden for particular widgets.
	 * 
	 * @param params {object}  params.widget: current widget
	 * @return {object} whose properties represent widget-specific types of draggable points
	 *   For example, widgets that represent a series of points will include a 'points'
	 *   property which is an array of object of the form {x:<number>,y:<number>}
	 */
	getDraggables: function(params) {
		// default impl is to return no points
		return {points:[]};
	},
	
	/**
	 * Remove any _dragNobs and _connects
	 */
	_removeNobs: function(widget){
		if(widget._dragNobs){
			for(var i=0; i<widget._dragNobs.length; i++){
				var dragNob = widget._dragNobs[i];
				if(dragNob.parentNode){
					dragNob.parentNode.removeChild(dragNob);
				}
			}
			delete widget._dragNobs;
		}
		for(var i=0; i<this._connects.length; i++){
			connect.disconnect(this._connects[i]);
		}
		this._connects = [];
	},
	
	/**
	 * Remove any _connectsDrag
	 */
	_removeDragConnects: function(){
		for(var i=0; i<this._connectsDrag.length; i++){
			connect.disconnect(this._connectsDrag[i]);
		}
		this._connectsDrag = [];
	},
	
	/**
	 * Clone a real event into a fake event, changing
	 * event.target into a target within user iframe
	 * and adjusting pageX/pageY to reflect user iframe coordinates
	 */
	_makeFakeEvent: function(e){
		var currentEditor = Runtime.currentEditor;
		var context = currentEditor.getContext && currentEditor.getContext();
		var fakeEvent = {};
		for(var prop in e){
			fakeEvent[prop] = e[prop];
		}
		fakeEvent.target = context.rootNode;
		var parentIframeBounds = GeomUtils.getBorderBoxPageCoords(context.getParentIframe());
		fakeEvent.pageX -= parentIframeBounds.l;
		fakeEvent.pageY -= parentIframeBounds.t;
		return fakeEvent;
	},

	/**
	 * Override the default action, which attempts to destroy the child widgets of 'widget'.
	 * Invoked when a widget is removed from page editor.
	 * 
	 * @param  {davinci/ve/_Widget} widget
	 */
	destroy: function(widget) {
		if(widget._stateChangeListener){
			connect.unsubscribe(widget._stateChangeListener);
			delete widget._stateChangeListener;
		}
		widget.dijitWidget.destroyRecursive();
	}


};

return _ShapeHelper;

});