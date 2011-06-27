/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/scaler/linear",["dojo/_base/kernel","../../main","dojo/_base/lang","./common"],function(_1,_2,_3,_4){
var _5=_1.getObject("charting.scaler.linear",true,_2);
var _6=3,_7=_4.findString,_8=_4.getNumericLabel;
var _9=function(_a,_b,_c,_d,_e,_f,_10){
_c=_1.delegate(_c);
if(!_d){
if(_c.fixUpper=="major"){
_c.fixUpper="minor";
}
if(_c.fixLower=="major"){
_c.fixLower="minor";
}
}
if(!_e){
if(_c.fixUpper=="minor"){
_c.fixUpper="micro";
}
if(_c.fixLower=="minor"){
_c.fixLower="micro";
}
}
if(!_f){
if(_c.fixUpper=="micro"){
_c.fixUpper="none";
}
if(_c.fixLower=="micro"){
_c.fixLower="none";
}
}
var _11=_7(_c.fixLower,["major"])?Math.floor(_c.min/_d)*_d:_7(_c.fixLower,["minor"])?Math.floor(_c.min/_e)*_e:_7(_c.fixLower,["micro"])?Math.floor(_c.min/_f)*_f:_c.min,_12=_7(_c.fixUpper,["major"])?Math.ceil(_c.max/_d)*_d:_7(_c.fixUpper,["minor"])?Math.ceil(_c.max/_e)*_e:_7(_c.fixUpper,["micro"])?Math.ceil(_c.max/_f)*_f:_c.max;
if(_c.useMin){
_a=_11;
}
if(_c.useMax){
_b=_12;
}
var _13=(!_d||_c.useMin&&_7(_c.fixLower,["major"]))?_a:Math.ceil(_a/_d)*_d,_14=(!_e||_c.useMin&&_7(_c.fixLower,["major","minor"]))?_a:Math.ceil(_a/_e)*_e,_15=(!_f||_c.useMin&&_7(_c.fixLower,["major","minor","micro"]))?_a:Math.ceil(_a/_f)*_f,_16=!_d?0:(_c.useMax&&_7(_c.fixUpper,["major"])?Math.round((_b-_13)/_d):Math.floor((_b-_13)/_d))+1,_17=!_e?0:(_c.useMax&&_7(_c.fixUpper,["major","minor"])?Math.round((_b-_14)/_e):Math.floor((_b-_14)/_e))+1,_18=!_f?0:(_c.useMax&&_7(_c.fixUpper,["major","minor","micro"])?Math.round((_b-_15)/_f):Math.floor((_b-_15)/_f))+1,_19=_e?Math.round(_d/_e):0,_1a=_f?Math.round(_e/_f):0,_1b=_d?Math.floor(Math.log(_d)/Math.LN10):0,_1c=_e?Math.floor(Math.log(_e)/Math.LN10):0,_1d=_10/(_b-_a);
if(!isFinite(_1d)){
_1d=1;
}
return {bounds:{lower:_11,upper:_12,from:_a,to:_b,scale:_1d,span:_10},major:{tick:_d,start:_13,count:_16,prec:_1b},minor:{tick:_e,start:_14,count:_17,prec:_1c},micro:{tick:_f,start:_15,count:_18,prec:0},minorPerMajor:_19,microPerMinor:_1a,scaler:_5};
};
return _1.mixin(_5,{buildScaler:function(min,max,_1e,_1f){
var h={fixUpper:"none",fixLower:"none",natural:false};
if(_1f){
if("fixUpper" in _1f){
h.fixUpper=String(_1f.fixUpper);
}
if("fixLower" in _1f){
h.fixLower=String(_1f.fixLower);
}
if("natural" in _1f){
h.natural=Boolean(_1f.natural);
}
}
if("min" in _1f){
min=_1f.min;
}
if("max" in _1f){
max=_1f.max;
}
if(_1f.includeZero){
if(min>0){
min=0;
}
if(max<0){
max=0;
}
}
h.min=min;
h.useMin=true;
h.max=max;
h.useMax=true;
if("from" in _1f){
min=_1f.from;
h.useMin=false;
}
if("to" in _1f){
max=_1f.to;
h.useMax=false;
}
if(max<=min){
return _9(min,max,h,0,0,0,_1e);
}
var mag=Math.floor(Math.log(max-min)/Math.LN10),_20=_1f&&("majorTickStep" in _1f)?_1f.majorTickStep:Math.pow(10,mag),_21=0,_22=0,_23;
if(_1f&&("minorTickStep" in _1f)){
_21=_1f.minorTickStep;
}else{
do{
_21=_20/10;
if(!h.natural||_21>0.9){
_23=_9(min,max,h,_20,_21,0,_1e);
if(_23.bounds.scale*_23.minor.tick>_6){
break;
}
}
_21=_20/5;
if(!h.natural||_21>0.9){
_23=_9(min,max,h,_20,_21,0,_1e);
if(_23.bounds.scale*_23.minor.tick>_6){
break;
}
}
_21=_20/2;
if(!h.natural||_21>0.9){
_23=_9(min,max,h,_20,_21,0,_1e);
if(_23.bounds.scale*_23.minor.tick>_6){
break;
}
}
return _9(min,max,h,_20,0,0,_1e);
}while(false);
}
if(_1f&&("microTickStep" in _1f)){
_22=_1f.microTickStep;
_23=_9(min,max,h,_20,_21,_22,_1e);
}else{
do{
_22=_21/10;
if(!h.natural||_22>0.9){
_23=_9(min,max,h,_20,_21,_22,_1e);
if(_23.bounds.scale*_23.micro.tick>_6){
break;
}
}
_22=_21/5;
if(!h.natural||_22>0.9){
_23=_9(min,max,h,_20,_21,_22,_1e);
if(_23.bounds.scale*_23.micro.tick>_6){
break;
}
}
_22=_21/2;
if(!h.natural||_22>0.9){
_23=_9(min,max,h,_20,_21,_22,_1e);
if(_23.bounds.scale*_23.micro.tick>_6){
break;
}
}
_22=0;
}while(false);
}
return _22?_23:_9(min,max,h,_20,_21,0,_1e);
},buildTicks:function(_24,_25){
var _26,_27,_28,_29=_24.major.start,_2a=_24.minor.start,_2b=_24.micro.start;
if(_25.microTicks&&_24.micro.tick){
_26=_24.micro.tick,_27=_2b;
}else{
if(_25.minorTicks&&_24.minor.tick){
_26=_24.minor.tick,_27=_2a;
}else{
if(_24.major.tick){
_26=_24.major.tick,_27=_29;
}else{
return null;
}
}
}
var _2c=1/_24.bounds.scale;
if(_24.bounds.to<=_24.bounds.from||isNaN(_2c)||!isFinite(_2c)||_26<=0||isNaN(_26)||!isFinite(_26)){
return null;
}
var _2d=[],_2e=[],_2f=[];
while(_27<=_24.bounds.to+_2c){
if(Math.abs(_29-_27)<_26/2){
_28={value:_29};
if(_25.majorLabels){
_28.label=_8(_29,_24.major.prec,_25);
}
_2d.push(_28);
_29+=_24.major.tick;
_2a+=_24.minor.tick;
_2b+=_24.micro.tick;
}else{
if(Math.abs(_2a-_27)<_26/2){
if(_25.minorTicks){
_28={value:_2a};
if(_25.minorLabels&&(_24.minMinorStep<=_24.minor.tick*_24.bounds.scale)){
_28.label=_8(_2a,_24.minor.prec,_25);
}
_2e.push(_28);
}
_2a+=_24.minor.tick;
_2b+=_24.micro.tick;
}else{
if(_25.microTicks){
_2f.push({value:_2b});
}
_2b+=_24.micro.tick;
}
}
_27+=_26;
}
return {major:_2d,minor:_2e,micro:_2f};
},getTransformerFromModel:function(_30){
var _31=_30.bounds.from,_32=_30.bounds.scale;
return function(x){
return (x-_31)*_32;
};
},getTransformerFromPlot:function(_33){
var _34=_33.bounds.from,_35=_33.bounds.scale;
return function(x){
return x/_35+_34;
};
}});
});
