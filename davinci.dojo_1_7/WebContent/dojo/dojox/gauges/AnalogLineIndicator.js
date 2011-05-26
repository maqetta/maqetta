define(["dojo/_base/kernel","dojo/_base/declare","./AnalogIndicatorBase"],function(dojo,ddeclare,AnalogIndicatorBase) {
 
return dojo.declare("dojox.gauges.AnalogLineIndicator",[AnalogIndicatorBase],{
	_getShapes: function(/*dojox.gfx.Group*/ group){
		// summary:
		//		Private function for generating the shapes for this indicator. An indicator that behaves the 
		//		same might override this one and simply replace the shapes (such as ArrowIndicator).
		var direction = this.direction;
		var length = this.length;
		if (direction == 'inside')
		   length = - length;
		
		 return [group.createLine({x1: 0, y1: -this.offset,
													x2: 0, y2: -length-this.offset})
					.setStroke({color: this.color, width: this.width})];
	}
	
});
})