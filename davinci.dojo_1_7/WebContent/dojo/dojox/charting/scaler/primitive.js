/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/scaler/primitive",["dojo/_base/kernel","../../main"],function(_1,_2){
var _3=_1.getObject("charting.scaler.primitive",true,_2);
return _1.mixin(_3,{buildScaler:function(_4,_5,_6,_7){
if(_4==_5){
_4-=0.5;
_5+=0.5;
}
return {bounds:{lower:_4,upper:_5,from:_4,to:_5,scale:_6/(_5-_4),span:_6},scaler:_3};
},buildTicks:function(_8,_9){
return {major:[],minor:[],micro:[]};
},getTransformerFromModel:function(_a){
var _b=_a.bounds.from,_c=_a.bounds.scale;
return function(x){
return (x-_b)*_c;
};
},getTransformerFromPlot:function(_d){
var _e=_d.bounds.from,_f=_d.bounds.scale;
return function(x){
return x/_f+_e;
};
}});
});
