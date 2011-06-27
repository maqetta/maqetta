/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/themes/gradientGenerator",["dojo/_base/kernel","dojo/_base/array","dojo/_base/Color","../Theme","dojox/color/_base","./common"],function(_1,_2,_3,_4,_5,_6){
var gg=_1.getObject("gradientGenerator",true,_6);
gg.generateFills=function(_7,_8,_9,_a){
return _1.map(_7,function(c){
return _4.generateHslGradient(c,_8,_9,_a);
});
};
gg.updateFills=function(_b,_c,_d,_e){
_1.forEach(_b,function(t){
if(t.fill&&!t.fill.type){
t.fill=_4.generateHslGradient(t.fill,_c,_d,_e);
}
});
};
gg.generateMiniTheme=function(_f,_10,_11,_12,_13){
return _1.map(_f,function(c){
c=new _5.Color(c);
return {fill:_4.generateHslGradient(c,_10,_11,_12),stroke:{color:_4.generateHslColor(c,_13)}};
});
};
gg.generateGradientByIntensity=function(_14,_15){
_14=new _1.Color(_14);
return _1.map(_15,function(_16){
var s=_16.i/255;
return {offset:_16.o,color:new _1.Color([_14.r*s,_14.g*s,_14.b*s,_14.a])};
});
};
return gg;
});
