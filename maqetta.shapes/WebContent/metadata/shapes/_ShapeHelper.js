define([
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ve/commands/StyleCommand"
], function(CompoundCommand, ModifyCommand, StyleCommand) {

var _ShapeHelper = function() {};
_ShapeHelper.prototype = {
	
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
		
		this._widget = obj.widget;
		var dijitWidget = obj.widget.dijitWidget;
		
		var div = obj.customDiv;
		var l,t;

		// The focus selection DIV is sometimes pulled in from left/top
		// so that it won't get clipped off the screen. Need to unadjust the adjustments.
		div.innerHTML = '';

		var draggables = this.getDraggables();
		var points = draggables.points;
		if(points){
			this._dragNobs = [];
			for (var i=0; i<points.length; i++){
				l = points[i].x - centeringShift;
				t = points[i].y - centeringShift;
				this._dragNobs[i] =  handle = dojo.create('span',{
					className:'editFocusNob',
					style:{ position:'absolute', display:'block', left:l+'px', top:t+'px' }	
				},div);
				handle._shapeDraggable = {point:i};
				handle.addEventListener('mousedown',dojo.hitch(this,this.onMouseDown),false);
			}
		}else{
			this._dragNobs = null;
		}
		return false;
	},

	onMouseDown: function(e){
		e.stopPropagation();
		var domNode = this._widget.domNode;
		this._origSpanPos = dojo.position(domNode, true);
		var handle = e.currentTarget;
		this._dragging = handle;
		this._dragx = e.pageX;
		this._dragy = e.pageY;
		this._left = handle.style.left;
		this._top = handle.style.top;
		this._origLeft = domNode.style.left;
		this._origTop = domNode.style.top;
		this._origWidth = domNode.style.width;
		this._origHeight = domNode.style.height;
		var doc = domNode.ownerDocument;
		var body = doc.body;
		doc.addEventListener('mousemove',dojo.hitch(this,this.onMouseMoveOut),false);
		doc.addEventListener('mouseout',dojo.hitch(this,this.onMouseMoveOut),false);
		doc.addEventListener('mouseup',dojo.hitch(this,this.onMouseUp),false);
		if(this.onMouseDown_Widget){
			this.onMouseDown_Widget({handle:handle, e:e});
		}
	},
	
	onMouseMoveOut: function(e){
		if(this._dragging){
			e.stopPropagation();
			var x = e.pageX,
				y = e.pageY;
			var dx = x - this._dragx;
			var dy = y - this._dragy;
			if(dx!=0||dy!=0){
				this._dragx = x;
				this._dragy = y;
				var handle = this._dragging;
				var oldLeft = parseFloat(handle.style.left);
				var oldTop = parseFloat(handle.style.top);
				handle.style.left = (oldLeft + dx) + 'px';
				handle.style.top = (oldTop + dy) + 'px';
				if(this.onMouseMoveOut_Widget){
					this.onMouseMoveOut_Widget({handle:handle, dx:dx, dy:dy, pageX:x, pageY:y, e:e});
				}
			}
		}
	},
	
	onMouseUp: function(e){
		e.stopPropagation();
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
		var widget = this._widget;
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
    	widget.setStyleValues(values);

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
			this.onMouseUp_Widget(command);
		}
		
		//FIXME: This has side effect of flushing command stack. Ugly coding. See #1057
		dojo.publish("/davinci/ui/widgetPropertiesChanges",
				[{source: context.editor.editor_id, command: command}]);

	},
	
	hideAllDraggablesExcept: function(index){
		if(this._dragNobs){
			for(var i=0; i<this._dragNobs.length; i++){
				var dragNob = this._dragNobs[i];
				dragNob.style.display = (i == index) ? 'block' : 'none';
			}
		}
	}

};

return _ShapeHelper;

});