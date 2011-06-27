/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/AnalogCircleIndicator",["dojo/_base/kernel","dojo/_base/declare","./AnalogIndicatorBase"],function(_1,_2,_3){
_1.experimental("dojox.gauges.AnalogCircleIndicator");
return _1.declare("dojox.gauges.AnalogCircleIndicator",[_3],{_getShapes:function(_4){
var _5=this.color?this.color:"black";
var _6=this.strokeColor?this.strokeColor:_5;
var _7={color:_6,width:1};
if(this.color.type&&!this.strokeColor){
_7.color=this.color.colors[0].color;
}
return [_4.createCircle({cx:0,cy:-this.offset,r:this.length}).setFill(_5).setStroke(_7)];
}});
});
