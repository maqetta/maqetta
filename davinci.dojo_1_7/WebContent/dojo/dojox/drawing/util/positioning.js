/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/util/positioning",["dojo","./common"],function(_1){
var _2=4;
var _3=20;
dojox.drawing.util.positioning={};
dojox.drawing.util.positioning.label=function(_4,_5){
var x=0.5*(_4.x+_5.x);
var y=0.5*(_4.y+_5.y);
var _6=dojox.drawing.util.common.slope(_4,_5);
var _7=_2/Math.sqrt(1+_6*_6);
if(_5.y>_4.y&&_5.x>_4.x||_5.y<_4.y&&_5.x<_4.x){
_7=-_7;
y-=_3;
}
x+=-_7*_6;
y+=_7;
var _8=_5.x<_4.x?"end":"start";
return {x:x,y:y,foo:"bar",align:_8};
};
dojox.drawing.util.positioning.angle=function(_9,_a){
var x=0.7*_9.x+0.3*_a.x;
var y=0.7*_9.y+0.3*_a.y;
var _b=dojox.drawing.util.common.slope(_9,_a);
var _c=_2/Math.sqrt(1+_b*_b);
if(_a.x<_9.x){
_c=-_c;
}
x+=-_c*_b;
y+=_c;
var _d=_a.y>_9.y?"end":"start";
y+=_a.x>_9.x?0.5*_3:-0.5*_3;
return {x:x,y:y,align:_d};
};
return dojox.drawing.util.positioning;
});
