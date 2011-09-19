dojo.provide('dojox.widget.gauge.AnalogNeedleIndicator');
dojo.require('dojox.widget.AnalogGauge');

dojo.experimental("dojox.widget.gauge.AnalogNeedleIndicator");

dojo.declare("dojox.widget.gauge.AnalogNeedleIndicator",[dojox.widget.gauge.AnalogLineIndicator],{
	_getShapes: function(){
		// summary:
		//		Override of dojox.widget.AnalogLineIndicator._getShapes
		if(!this._gauge){
			return null;
		}
		var x = Math.floor(this.width/2);
		var head = this.width * 5;
		var odd = (this.width & 1);
		var shapes = [];
		var stroke = {color: this.color, width: 1};
		if(this.color.type){
			stroke.color = this.color.colors[0].color;
		}
		var xy = (Math.sqrt(2) * (x));
		shapes[0] = this._gauge.surface.createPath()
					.setStroke(stroke).setFill(this.color)
					.moveTo(xy, -xy).arcTo((2*x), (2*x), 0, 0, 0, -xy, -xy)
					.lineTo(0, -this.length).closePath();
		shapes[1] = this._gauge.surface.createCircle({cx: 0, cy: 0, r: this.width})
					.setStroke({color: this.color})
					.setFill(this.color);
		return shapes;
	}
});
