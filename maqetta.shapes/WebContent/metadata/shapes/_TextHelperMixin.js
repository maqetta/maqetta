define(function() {

var _TextHelperMixin = function() {};
_TextHelperMixin.prototype = {
			
	//FIXME: Looks like this can be shared between rects and ellipses
	
	/*
	 * Returns list of draggable end points for this shape in "px" units
	 * relative to top/left corner of enclosing SPAN
	 * @return {object} whose properties represent widget-specific types of draggable points
	 *   For example, widgets that represent a series of points will include a 'points'
	 *   property which is an array of object of the form {x:<number>,y:<number>}
	 */
	getDraggables: function(){
		// No drag points for text widget
		return {points:[]};
	}

};

return _TextHelperMixin;

});