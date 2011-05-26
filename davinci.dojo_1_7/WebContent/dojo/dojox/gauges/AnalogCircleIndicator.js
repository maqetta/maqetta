define(["dojo/_base/kernel","dojo/_base/declare","./AnalogIndicatorBase"],function(dojo,ddeclare,AnalogIndicatorBase) { 
dojo.experimental("dojox.gauges.AnalogCircleIndicator");

return dojo.declare("dojox.gauges.AnalogCircleIndicator", [AnalogIndicatorBase], {
	// summary:
	//		an indicator for the AnalogGauge that draws a circle.
	//
	
	_getShapes: function(group){
		// summary: 
		//		Override of dojox.gauges.AnalogLineIndicator._getShapes
		var color = this.color ? this.color : 'black';
		var strokeColor = this.strokeColor ? this.strokeColor : color;
		var stroke = {
			color: strokeColor,
			width: 1
		};
		if (this.color.type && !this.strokeColor){
			stroke.color = this.color.colors[0].color;
		}
		
		return [group.createCircle({
			cx: 0,
			cy: -this.offset,
			r: this.length
		}).setFill(color).setStroke(stroke)];
	}
});
});
