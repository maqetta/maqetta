/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/AnalogNeedleIndicator",["dojo/_base/kernel","dojo/_base/declare","./AnalogIndicatorBase"],function(_1,_2,_3){
_1.experimental("dojox.gauges.AnalogNeedleIndicator");
return _1.declare("dojox.gauges.AnalogNeedleIndicator",[_3],{_getShapes:function(_4){
if(!this._gauge){
return null;
}
var x=Math.floor(this.width/2);
var _5=[];
var _6=this.color?this.color:"black";
var _7=this.strokeColor?this.strokeColor:_6;
var _8=this.strokeWidth?this.strokeWidth:1;
var _9={color:_7,width:_8};
if(_6.type&&!this.strokeColor){
_9.color=_6.colors[0].color;
}
var xy=(Math.sqrt(2)*(x));
_5[0]=_4.createPath().setStroke(_9).setFill(_6).moveTo(xy,-xy).arcTo((2*x),(2*x),0,0,0,-xy,-xy).lineTo(0,-this.length).closePath();
_5[1]=_4.createCircle({cx:0,cy:0,r:this.width}).setStroke(_9).setFill(_6);
return _5;
}});
});
