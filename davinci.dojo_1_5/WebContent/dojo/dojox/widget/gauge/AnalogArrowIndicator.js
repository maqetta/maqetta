dojo.provide('dojox.widget.gauge.AnalogArrowIndicator');
dojo.require('dojox.widget.AnalogGauge');

dojo.experimental("dojox.widget.gauge.AnalogArrowIndicator");

dojo.declare("dojox.widget.gauge.AnalogArrowIndicator",[dojox.widget.gauge.AnalogLineIndicator],{
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
		var points = [{x:-x,	 y:0},
					  {x:-x,	 y:-this.length+head},
					  {x:-2*x,	 y:-this.length+head},
					  {x:0,		 y:-this.length},
					  {x:2*x+odd,y:-this.length+head},
					  {x:x+odd,	 y:-this.length+head},
					  {x:x+odd,	 y:0},
					  {x:-x,	 y:0}];
		shapes[0] = this._gauge.surface.createPolyline(points)
					.setStroke({color: this.color})
					.setFill(this.color);
		shapes[1] = this._gauge.surface.createLine({ x1:-x, y1: 0, x2: -x, y2:-this.length+head })
					.setStroke({color: this.highlight});
		shapes[2] = this._gauge.surface.createLine({ x1:-x-3, y1: -this.length+head, x2: 0, y2:-this.length })
					.setStroke({color: this.highlight});
		shapes[3] = this._gauge.surface.createCircle({cx: 0, cy: 0, r: this.width})
					.setStroke({color: this.color})
					.setFill(this.color);
		return shapes;
	}
});
