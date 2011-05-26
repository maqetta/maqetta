define(["dojo/_base/kernel","dojo/_base/declare","./_Indicator"],function(dojo,ddeclare,_Indicator) { 

dojo.experimental("dojox.gauges.TextIndicator");

return dojo.declare("dojox.gauges.TextIndicator", [_Indicator], {
	// summary:
	//		A gauge indicator the simply draws its value as text.
	
	
	// x: Number
	// The x coordinate of the indicator
	x: 0,
	
	// y: Number
	// The y coordinate of the indicator
	y: 0,
	
	// align: String
	// The horizontal alignment of the text, the value can be 'middle' (the default), 'left' or 'right'
	align: 'middle',
	
	// fixedPrecision: Boolean
	// Indicates that the number is displayed in fixed precision or not (precision is defined by the 'precision' property (default is true).
	fixedPrecision: true,
	
	// precision: Number
	// The number of tailing digits to display the value of the indicator when the 'fixedPrecision' property is set to true (default is 0).
	precision: 0,
	
	draw: function(group, /*Boolean?*/ dontAnimate){
		// summary: 
		//		Override of dojox.gauges._Indicator.draw
		var v = this.value;
		
		if (v < this._gauge.min) {
			v = this._gauge.min;
		}
		if (v > this._gauge.max) {
			v = this._gauge.max;
		}
		var txt;
		
		if (dojo.number) {
			txt = this.fixedPrecision ? dojo.number.format(v, {
				places: this.precision
			}) : dojo.number.format(v);
		} else {
			txt = this.fixedPrecision ? v.toFixed(this.precision) : v.toString();
		}
		
		var x = this.x ? this.x : 0;
		var y = this.y ? this.y : 0;
		var color = this.color | 'black';
		var align = this.align ? this.align : "middle";
		if (!this.shape) 
			this.shape = group.createText({
				x: x,
				y: y,
				text: txt,
				align: align
			});
		else this.shape.setShape({
			x: x,
			y: y,
			text: txt,
			align: align
		});
		this.shape.setFill(this.color);
		if (this.font) this.shape.setFont(this.font);
		
	}
	
});
});
