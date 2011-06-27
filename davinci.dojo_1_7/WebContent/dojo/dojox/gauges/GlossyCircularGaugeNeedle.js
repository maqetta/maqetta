/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/GlossyCircularGaugeNeedle",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/Color","./AnalogIndicatorBase"],function(_1,_2,_3,_4){
return _1.declare("dojox.gauges.GlossyCircularGaugeNeedle",[_4],{interactionMode:"gauge",color:"#c4c4c4",_getShapes:function(_5){
var _6=_1.blendColors(new _1.Color(this.color),new _1.Color("black"),0.3);
if(!this._gauge){
return null;
}
var _7=[];
_7[0]=_5.createGroup();
var _8=Math.min((this._gauge.width/this._gauge._designWidth),(this._gauge.height/this._gauge._designHeight));
_7[0].createGroup().setTransform({xx:_8,xy:0,yx:0,yy:_8,dx:0,dy:0});
_7[0].children[0].createPath({path:"M357.1429 452.005 L333.0357 465.9233 L333.0357 438.0868 L357.1429 452.005 Z"}).setTransform({xx:0,xy:1,yx:-6.21481,yy:0,dx:-452.00505,dy:2069.75519}).setFill(this.color).setStroke({color:_6,width:1,style:"Solid",cap:"butt",join:20});
return _7;
}});
});
