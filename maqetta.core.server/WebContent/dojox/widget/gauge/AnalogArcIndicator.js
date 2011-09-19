dojo.provide('dojox.widget.gauge.AnalogArcIndicator');
dojo.require('dojox.widget.AnalogGauge');

dojo.experimental("dojox.widget.gauge.AnalogArcIndicator");

dojo.declare("dojox.widget.gauge.AnalogArcIndicator",[dojox.widget.gauge.AnalogLineIndicator],{
	_createArc: function(val){
		// Creating the Arc Path string manually.  This is instead of creating new dojox.gfx.Path object
		// each time since we really just need the Path string (to use with setShape) and we don't want to
		// have to redo the connects, etc.
		if(this.shapes[0]){
			var a = this._gauge._getRadians(this._gauge._getAngle(val));
			var cosa = Math.cos(a);
			var sina = Math.sin(a);
			var sa = this._gauge._getRadians(this._gauge.startAngle);
			var cossa = Math.cos(sa);
			var sinsa = Math.sin(sa);
			var off = this.offset + this.width;
			var p = ['M'];
			p.push(this._gauge.cx+this.offset*sinsa);
			p.push(this._gauge.cy-this.offset*cossa);
			p.push('A', this.offset, this.offset, 0, ((a-sa)>Math.PI)?1:0, 1);
			p.push(this._gauge.cx+this.offset*sina);
			p.push(this._gauge.cy-this.offset*cosa);
			p.push('L');
			p.push(this._gauge.cx+off*sina);
			p.push(this._gauge.cy-off*cosa);
			p.push('A', off, off, 0, ((a-sa)>Math.PI)?1:0, 0);
			p.push(this._gauge.cx+off*sinsa);
			p.push(this._gauge.cy-off*cossa);
			this.shapes[0].setShape(p.join(' '));
			this.currentValue = val;
		}
	},
	draw: function(/*Boolean?*/ dontAnimate){
		// summary:
		//		Override of dojox.widget._Indicator.draw
		var v = this.value;
		if(v < this._gauge.min){v = this._gauge.min;}
		if(v > this._gauge.max){v = this._gauge.max;}
		if(this.shapes){
			if(dontAnimate){
				this._createArc(v);
			}else{
				var anim = new dojo.Animation({curve: [this.currentValue, v], duration: this.duration, easing: this.easing});
				dojo.connect(anim, "onAnimate", dojo.hitch(this, this._createArc));
				anim.play();
			}
		}else{
			var stroke = {color: this.color, width: 1};
			if(this.color.type){
				stroke.color = this.color.colors[0].color;
			}
			this.shapes = [this._gauge.surface.createPath()
							.setStroke(stroke).setFill(this.color)];
			this._createArc(v);
			if(this.hover){
				this.shapes[0].getEventSource().setAttribute('hover',this.hover);
			}
			if(this.onDragMove && !this.noChange){
				this._gauge.connect(this.shapes[0].getEventSource(), 'onmousedown', this._gauge.handleMouseDown);
				this.shapes[0].getEventSource().style.cursor = 'pointer';
			}
		}
	}
});
