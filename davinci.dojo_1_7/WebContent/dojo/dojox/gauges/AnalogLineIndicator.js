/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/AnalogLineIndicator",["dojo/_base/kernel","dojo/_base/declare","./AnalogIndicatorBase"],function(_1,_2,_3){
return _1.declare("dojox.gauges.AnalogLineIndicator",[_3],{_getShapes:function(_4){
var _5=this.direction;
var _6=this.length;
if(_5=="inside"){
_6=-_6;
}
return [_4.createLine({x1:0,y1:-this.offset,x2:0,y2:-_6-this.offset}).setStroke({color:this.color,width:this.width})];
}});
});
