/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/date/islamic",["dojo/_base/kernel","dojo/date","./islamic/Date"],function(d,dd,_1){
dojo.getObject("date.islamic",true,dojox);
dojo.experimental("dojox.date.islamic");
dojox.date.islamic.getDaysInMonth=function(_2){
return _2.getDaysInIslamicMonth(_2.getMonth(),_2.getFullYear());
};
dojox.date.islamic.compare=function(_3,_4,_5){
if(_3 instanceof _1){
_3=_3.toGregorian();
}
if(_4 instanceof _1){
_4=_4.toGregorian();
}
return dd.compare.apply(null,arguments);
};
dojox.date.islamic.add=function(_6,_7,_8){
var _9=new _1(_6);
switch(_7){
case "day":
_9.setDate(_6.getDate()+_8);
break;
case "weekday":
var _a=_6.getDay();
if(((_a+_8)<5)&&((_a+_8)>0)){
_9.setDate(_6.getDate()+_8);
}else{
var _b=0,_c=0;
if(_a==5){
_a=4;
_c=(_8>0)?-1:1;
}else{
if(_a==6){
_a=4;
_c=(_8>0)?-2:2;
}
}
var _d=(_8>0)?(5-_a-1):-_a;
var _e=_8-_d;
var _f=parseInt(_e/5);
if(_e%5!=0){
_b=(_8>0)?2:-2;
}
_b=_b+_f*7+_e%5+_d;
_9.setDate(_6.getDate()+_b+_c);
}
break;
case "year":
_9.setFullYear(_6.getFullYear()+_8);
break;
case "week":
_8*=7;
_9.setDate(_6.getDate()+_8);
break;
case "month":
var _10=_6.getMonth();
_9.setMonth(_10+_8);
break;
case "hour":
_9.setHours(_6.getHours()+_8);
break;
case "minute":
_9.setMinutes(_6.getMinutes()+_8);
break;
case "second":
_9.setSeconds(_6.getSeconds()+_8);
break;
case "millisecond":
_9.setMilliseconds(_6.getMilliseconds()+_8);
break;
}
return _9;
};
dojox.date.islamic.difference=function(_11,_12,_13){
_12=_12||new _1();
_13=_13||"day";
var _14=_11.getFullYear()-_12.getFullYear();
var _15=1;
switch(_13){
case "weekday":
var _16=Math.round(dojox.date.islamic.difference(_11,_12,"day"));
var _17=parseInt(dojox.date.islamic.difference(_11,_12,"week"));
var mod=_16%7;
if(mod==0){
_16=_17*5;
}else{
var adj=0;
var _18=_12.getDay();
var _19=_11.getDay();
_17=parseInt(_16/7);
mod=_16%7;
var _1a=new _1(_12);
_1a.setDate(_1a.getDate()+(_17*7));
var _1b=_1a.getDay();
if(_16>0){
switch(true){
case _18==5:
adj=-1;
break;
case _18==6:
adj=0;
break;
case _19==5:
adj=-1;
break;
case _19==6:
adj=-2;
break;
case (_1b+mod)>5:
adj=-2;
}
}else{
if(_16<0){
switch(true){
case _18==5:
adj=0;
break;
case _18==6:
adj=1;
break;
case _19==5:
adj=2;
break;
case _19==6:
adj=1;
break;
case (_1b+mod)<0:
adj=2;
}
}
}
_16+=adj;
_16-=(_17*2);
}
_15=_16;
break;
case "year":
_15=_14;
break;
case "month":
var _1c=(_11.toGregorian()>_12.toGregorian())?_11:_12;
var _1d=(_11.toGregorian()>_12.toGregorian())?_12:_11;
var _1e=_1c.getMonth();
var _1f=_1d.getMonth();
if(_14==0){
_15=_1c.getMonth()-_1d.getMonth();
}else{
_15=12-_1f;
_15+=_1e;
var i=_1d.getFullYear()+1;
var e=_1c.getFullYear();
for(i;i<e;i++){
_15+=12;
}
}
if(_11.toGregorian()<_12.toGregorian()){
_15=-_15;
}
break;
case "week":
_15=parseInt(dojox.date.islamic.difference(_11,_12,"day")/7);
break;
case "day":
_15/=24;
case "hour":
_15/=60;
case "minute":
_15/=60;
case "second":
_15/=1000;
case "millisecond":
_15*=_11.toGregorian().getTime()-_12.toGregorian().getTime();
}
return Math.round(_15);
};
return dojox.date.islamic;
});
