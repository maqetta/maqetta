/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/AnalogArcIndicator",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","dojo/_base/connect","dojo/_base/fx","./AnalogIndicatorBase"],function(_1,_2,_3,_4,_5,_6){
_1.experimental("dojox.gauges.AnalogArcIndicator");
return _1.declare("dojox.gauges.AnalogArcIndicator",[_6],{_createArc:function(_7){
if(this.shape){
var _8=this._gauge._mod360(this._gauge.startAngle);
var a=this._gauge._getRadians(this._gauge._getAngle(_7));
var sa=this._gauge._getRadians(_8);
if(this._gauge.orientation=="cclockwise"){
var _9=a;
a=sa;
sa=_9;
}
var _a;
var _b=0;
if(sa<=a){
_a=a-sa;
}else{
_a=2*Math.PI+a-sa;
}
if(_a>Math.PI){
_b=1;
}
var _c=Math.cos(a);
var _d=Math.sin(a);
var _e=Math.cos(sa);
var _f=Math.sin(sa);
var off=this.offset+this.width;
var p=["M"];
p.push(this._gauge.cx+this.offset*_f);
p.push(this._gauge.cy-this.offset*_e);
p.push("A",this.offset,this.offset,0,_b,1);
p.push(this._gauge.cx+this.offset*_d);
p.push(this._gauge.cy-this.offset*_c);
p.push("L");
p.push(this._gauge.cx+off*_d);
p.push(this._gauge.cy-off*_c);
p.push("A",off,off,0,_b,0);
p.push(this._gauge.cx+off*_f);
p.push(this._gauge.cy-off*_e);
p.push("z");
this.shape.setShape(p.join(" "));
this.currentValue=_7;
}
},draw:function(_10,_11){
var v=this.value;
if(v<this._gauge.min){
v=this._gauge.min;
}
if(v>this._gauge.max){
v=this._gauge.max;
}
if(this.shape){
if(_11){
this._createArc(v);
}else{
var _12=new _1.Animation({curve:[this.currentValue,v],duration:this.duration,easing:this.easing});
_1.connect(_12,"onAnimate",_1.hitch(this,this._createArc));
_12.play();
}
}else{
var _13=this.color?this.color:"black";
var _14=this.strokeColor?this.strokeColor:_13;
var _15={color:_14,width:1};
if(this.color.type&&!this.strokeColor){
_15.color=this.color.colors[0].color;
}
this.shape=_10.createPath().setStroke(_15).setFill(_13);
this._createArc(v);
this.shape.connect("onmouseover",this,this.handleMouseOver);
this.shape.connect("onmouseout",this,this.handleMouseOut);
this.shape.connect("onmousedown",this,this.handleMouseDown);
this.shape.connect("touchstart",this,this.handleTouchStart);
}
}});
});
