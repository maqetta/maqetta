dojo.provide('dojox.widget.gauge.BarIndicator');
dojo.require('dojox.widget.BarGauge');

dojo.experimental("dojox.widget.gauge.BarIndicator");

dojo.declare("dojox.widget.gauge.BarIndicator",[dojox.widget.gauge.BarLineIndicator],{
	_getShapes: function(){
		// summary:
		//		Override of dojox.widget.BarLineIndicator._getShapes
		if(!this._gauge){
			return null;
		}
		var v = this.value;
		if(v < this._gauge.min){v = this._gauge.min;}
		if(v > this._gauge.max){v = this._gauge.max;}
		var pos = this._gauge._getPosition(v);
		if(pos == this.dataX){pos = this.dataX+1;}
		var y = this._gauge.dataY + Math.floor((this._gauge.dataHeight - this.width)/2) + this.offset;

		var shapes = [];
		shapes[0] = this._gauge.surface.createRect({x:this._gauge.dataX, y:y, width:pos - this._gauge.dataX, height:this.width});
		shapes[0].setStroke({color: this.color});
		shapes[0].setFill(this.color);
		shapes[1] = this._gauge.surface.createLine({ x1:this._gauge.dataX, y1:y, x2:pos, y2:y });
		shapes[1].setStroke({color: this.highlight});
		if(this.highlight2){
			y--;
			shapes[2] = this._gauge.surface.createLine({ x1:this._gauge.dataX, y1:y, x2:pos, y2:y });
			shapes[2].setStroke({color: this.highlight2});
		}

		return shapes;
	},
	_createShapes: function(val){
		// summary:
		//		Creates a shallow copy of the current shapes while adjusting for the new value
		for(var i in this.shapes){
			i = this.shapes[i];
			var newShape = {};
			for(var j in i){
				newShape[j] = i[j];
			}
			if(i.shape.type == "line"){
				newShape.shape.x2 = val+newShape.shape.x1;
			}else if(i.shape.type == "rect"){
				newShape.width = val;
			}
			i.setShape(newShape);
		}
	},
	_move: function(/*Boolean?*/ dontAnimate){
		// summary:
		//		Override of dojox.widget.BarLineIndicator._move to resize the bar (rather than moving it)
		var changed = false;
		var c;
		var v = this.value ;
		if(v < this.min){v = this.min;}
		if(v > this.max){v = this.max;}
		c = this._gauge._getPosition(this.currentValue);
		this.currentValue = v;
		v = this._gauge._getPosition(v)-this._gauge.dataX;
		if(dontAnimate){
			this._createShapes(v);
		}else{
			if(c!=v){
				var anim = new dojo.Animation({curve: [c, v], duration: this.duration, easing: this.easing});
				dojo.connect(anim, "onAnimate", dojo.hitch(this, this._createShapes)); 
				anim.play();
			}
		}
	}
});
