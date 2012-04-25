define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/commands/ModifyCommand" /*,
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/MoveCommand",
	"davinci/ve/commands/ResizeCommand" */
], function(
	declare,
	CreateTool /*,
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
//debugger;
	},
	
	onMouseDown: function(event){
console.log('LineCreateTool.js onMouseDown');
		this._md_x = event.pageX;
		this._md_y = event.pageY;
		this.inherited(arguments);
	},
	
	onMouseMove: function(event){
console.log('LineCreateTool.js onMouseMove');
		this.inherited(arguments);
	},
	
	onMouseUp: function(event){
console.log('LineCreateTool.js onMouseUp.');
		// If this is first mouseUp and there was an associated mouseDown
		// then line will consist of single segment from mousedown location to mouseup location
		if(this._mouseUpCounter === 0 && typeof this._md_x == 'number'){
console.log('a');
			if(this._sameSpot(this._md_x, this._md_y, event.pageX, event.pageY)){
				this._points.push({x:event.pageX, y:event.pageY});
			}else{
				this._points.push({x:this._md_x, y:this._md_y});
				this._points.push({x:event.pageX, y:event.pageY});
				this._exitCreateTool = true;
			}
			this._pointsChanged = true;
			
		// If mouseUp is within <n> pixels of previous mouseUp, then exist CreateTool.
		}else if(this._mouseUpSameSpot(event.pageX, event.pageY)){
console.log('b');
			this._exitCreateTool = true;
		
		// Otherwise, add mouseUp position to list of points
		}else{
console.log('c');
			this._points.push({x:event.pageX, y:event.pageY});
			this._pointsChanged = true;
		}
		this.inherited(arguments);
		
		// Put after this.inherited because this.inherited calls createNewWidget() indirectly
		this._mouseUpCounter++;
	},

	/**
	 * In nearly all cases, mouseUp completes the create operation.
	 * But for certain widgets such as Shapes.line, we allow multi-segment
	 * lines to be created via multiple [mousedown/]mouseup gestures,
	 * in which case the widget-specific CreateTool subclass will override this function.
	 */
	exitCreateToolOnMouseUp: function(){
console.log('exitCreateToolOnMouseUp this._exitCreateTool='+this._exitCreateTool);
console.trace();
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
	
	_sameSpot: function(x1, y1, x2, y2){
		var tolerance = 7;
		return (Math.abs(x2 - x1) <= tolerance && Math.abs(y2 - y1) <= tolerance);
	},
	
	_mouseUpSameSpot: function(x, y){
		if(this._points.length === 0){
console.log('_mouseUpSameSpot  false - this._points.length == 0');
			return false;
		}else{
			var lastPoint = this._points[this._points.length-1];
console.log('_mouseUpSameSpot. x='+x+',y='+y+',lastPoint.x='+lastPoint.x+',lastPoint.y='+lastPoint.y);
			if(this._sameSpot(x, y, lastPoint.x, lastPoint.y)){
console.log('true - < tolerance');
				return true;
			}else{
console.log('false - >= tolerance');
				return false;
			}
		}
	},
	
	addToCommandStack: function(command, params){
console.log('addToCommandStack entered');
for(var j=0; j<this._points.length; j++){
	console.log('this._points['+j+']= x:'+this._points[j].x+', y:'+this._points[j].y);
}
		var widget = params.widget;
		if(this._pointsChanged && widget){
			var i;
			var min_x = this._points[0].x;
			var min_y = this._points[0].y;
			for(i=1; i<this._points.length; i++){
				var pt = this._points[i];
				min_x = pt.x < min_x ? pt.x : min_x;
				min_y = pt.x < min_y ? pt.y : min_y;
			}
			var points;
			// Line widget requires at least 2 points
			if(this._points.length === 1){
				points = '0,0,0,0';
			}else{
				points = '';
				for(i=0; i<this._points.length; i++){
					var pt = this._points[i];
					if(i > 0){
						points += ',';
					}
					//points += (pt.x - min_x) + ',' + (pt.y - min_y);
					points += pt.x  + ',' + pt.y;
				}
			}
console.log('points='+points);
			var properties = { points:points };
			command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
		}
	}

});

});