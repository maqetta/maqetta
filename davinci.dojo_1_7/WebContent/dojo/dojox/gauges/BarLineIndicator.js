/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/BarLineIndicator",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/fx","dojo/_base/connect","dojo/_base/lang","dojox/gfx","./_Indicator"],function(_1,_2,_3,_4,_5,_6,_7){
_1.experimental("dojox.gauges.BarIndicator");
return _1.declare("dojox.gauges.BarLineIndicator",[_7],{width:1,_getShapes:function(_8){
if(!this._gauge){
return null;
}
var v=this.value;
if(v<this._gauge.min){
v=this._gauge.min;
}
if(v>this._gauge.max){
v=this._gauge.max;
}
var _9=this._gauge._getPosition(v);
var _a=[];
if(this.width>1){
_a[0]=_8.createRect({x:0,y:this._gauge.dataY+this.offset,width:this.width,height:this.length});
_a[0].setStroke({color:this.color});
_a[0].setFill(this.color);
_a[0].setTransform(_6.matrix.translate(_9,0));
}else{
_a[0]=_8.createLine({x1:0,y1:this._gauge.dataY+this.offset,x2:0,y2:this._gauge.dataY+this.offset+this.length});
_a[0].setStroke({color:this.color});
_a[0].setTransform(_6.matrix.translate(_9,0));
}
return _a;
},draw:function(_b,_c){
var i;
if(this.shape){
this._move(_c);
}else{
if(this.shape){
this.shape.parent.remove(this.shape);
this.shape=null;
}
if(this.text){
this.text.parent.remove(this.text);
this.text=null;
}
this.color=this.color||"#000000";
this.length=this.length||this._gauge.dataHeight;
this.width=this.width||3;
this.offset=this.offset||0;
this.highlight=this.highlight||"#4D4D4D";
this.highlight2=this.highlight2||"#A3A3A3";
var _d=this._getShapes(_b,this._gauge,this);
if(_d.length>1){
this.shape=_b.createGroup();
for(var s=0;s<_d.length;s++){
this.shape.add(_d[s]);
}
}else{
this.shape=_d[0];
}
if(this.label){
var v=this.value;
if(v<this._gauge.min){
v=this._gauge.min;
}
if(v>this._gauge.max){
v=this._gauge.max;
}
var _e=this._gauge._getPosition(v);
if(this.direction=="inside"){
var _f=this.font?this.font:_6.defaultFont;
var fz=_f.size;
var th=_6.normalizedLength(fz);
this.text=this._gauge.drawText(_b,""+this.label,_e,this._gauge.dataY+this.offset+this.length+5+th,"middle",this.color,this.font);
}else{
this.text=this._gauge.drawText(_b,""+this.label,_e,this._gauge.dataY+this.offset-5,"middle",this.color,this.font);
}
}
this.shape.connect("onmouseover",this,this.handleMouseOver);
this.shape.connect("onmouseout",this,this.handleMouseOut);
this.shape.connect("onmousedown",this,this.handleMouseDown);
this.shape.connect("touchstart",this,this.handleTouchStart);
this.currentValue=this.value;
}
},_move:function(_10){
var v=this.value;
if(v<this._gauge.min){
v=this._gauge.min;
}
if(v>this._gauge.max){
v=this._gauge.max;
}
var c=this._gauge._getPosition(this.currentValue);
this.currentValue=v;
v=this._gauge._getPosition(v);
if(_10||(c==v)){
this.shape.setTransform(_6.matrix.translate(v,0));
}else{
var _11=new _1.Animation({curve:[c,v],duration:this.duration,easing:this.easing});
_1.connect(_11,"onAnimate",_1.hitch(this,function(_12){
if(this.shape){
this.shape.setTransform(_6.matrix.translate(_12,0));
}
}));
_11.play();
}
}});
});
