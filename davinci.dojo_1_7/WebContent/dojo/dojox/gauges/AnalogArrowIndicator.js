/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/AnalogArrowIndicator",["dojo/_base/kernel","dojo/_base/declare","./AnalogIndicatorBase"],function(_1,_2,_3){
_1.experimental("dojox.gauges.AnalogArrowIndicator");
return _1.declare("dojox.gauges.AnalogArrowIndicator",[_3],{_getShapes:function(_4){
if(!this._gauge){
return null;
}
var _5=this.color?this.color:"black";
var _6=this.strokeColor?this.strokeColor:_5;
var _7={color:_6,width:1};
if(this.color.type&&!this.strokeColor){
_7.color=this.color.colors[0].color;
}
var x=Math.floor(this.width/2);
var _8=this.width*5;
var _9=(this.width&1);
var _a=[];
var _b=[{x:-x,y:0},{x:-x,y:-this.length+_8},{x:-2*x,y:-this.length+_8},{x:0,y:-this.length},{x:2*x+_9,y:-this.length+_8},{x:x+_9,y:-this.length+_8},{x:x+_9,y:0},{x:-x,y:0}];
_a[0]=_4.createPolyline(_b).setStroke(_7).setFill(_5);
_a[1]=_4.createLine({x1:-x,y1:0,x2:-x,y2:-this.length+_8}).setStroke({color:this.highlight});
_a[2]=_4.createLine({x1:-x-3,y1:-this.length+_8,x2:0,y2:-this.length}).setStroke({color:this.highlight});
_a[3]=_4.createCircle({cx:0,cy:0,r:this.width}).setStroke(_7).setFill(_5);
return _a;
}});
});
