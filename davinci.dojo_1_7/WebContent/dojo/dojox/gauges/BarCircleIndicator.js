/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/BarCircleIndicator",["dojo/_base/kernel","dojo/_base/declare","dojox/gfx","./BarLineIndicator"],function(_1,_2,_3,_4){
_1.experimental("dojox.gauges.BarCircleIndicator");
return _1.declare("dojox.gauges.BarCircleIndicator",[_4],{_getShapes:function(_5){
var _6=this.color?this.color:"black";
var _7=this.strokeColor?this.strokeColor:_6;
var _8={color:_7,width:1};
if(this.color.type&&!this.strokeColor){
_8.color=this.color.colors[0].color;
}
var y=this._gauge.dataY+this.offset+this.length/2;
var v=this.value;
if(v<this._gauge.min){
v=this._gauge.min;
}
if(v>this._gauge.max){
v=this._gauge.max;
}
var _9=this._gauge._getPosition(v);
var _a=[_5.createCircle({cx:0,cy:y,r:this.length/2}).setFill(_6).setStroke(_8)];
_a[0].setTransform(_3.matrix.translate(_9,0));
return _a;
}});
});
