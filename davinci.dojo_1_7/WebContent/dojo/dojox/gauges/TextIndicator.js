/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/TextIndicator",["dojo/_base/kernel","dojo/_base/declare","./_Indicator"],function(_1,_2,_3){
_1.experimental("dojox.gauges.TextIndicator");
return _1.declare("dojox.gauges.TextIndicator",[_3],{x:0,y:0,align:"middle",fixedPrecision:true,precision:0,draw:function(_4,_5){
var v=this.value;
if(v<this._gauge.min){
v=this._gauge.min;
}
if(v>this._gauge.max){
v=this._gauge.max;
}
var _6;
if(_1.number){
_6=this.fixedPrecision?_1.number.format(v,{places:this.precision}):_1.number.format(v);
}else{
_6=this.fixedPrecision?v.toFixed(this.precision):v.toString();
}
var x=this.x?this.x:0;
var y=this.y?this.y:0;
var _7=this.color|"black";
var _8=this.align?this.align:"middle";
if(!this.shape){
this.shape=_4.createText({x:x,y:y,text:_6,align:_8});
}else{
this.shape.setShape({x:x,y:y,text:_6,align:_8});
}
this.shape.setFill(this.color);
if(this.font){
this.shape.setFont(this.font);
}
}});
});
