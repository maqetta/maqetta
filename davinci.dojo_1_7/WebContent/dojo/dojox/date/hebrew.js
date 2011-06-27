/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/date/hebrew",["dojo/_base/kernel","dojo/date","./hebrew/Date"],function(d,dd,_1){
dojo.getObject("date.hebrew",true,dojox);
dojo.experimental("dojox.date.hebrew");
dojox.date.hebrew.getDaysInMonth=function(_2){
return _2.getDaysInHebrewMonth(_2.getMonth(),_2.getFullYear());
};
dojox.date.hebrew.compare=function(_3,_4,_5){
if(_3 instanceof _1){
_3=_3.toGregorian();
}
if(_4 instanceof _1){
_4=_4.toGregorian();
}
return dd.compare.apply(null,arguments);
};
dojox.date.hebrew.add=function(_6,_7,_8){
var _9=new _1(_6);
switch(_7){
case "day":
_9.setDate(_6.getDate()+_8);
break;
case "weekday":
var _a=_6.getDay();
var _b=0;
if(_8<0&&_a==6){
_a=5;
_b=-1;
}
if((_a+_8)<5&&(_a+_8)>=0){
_9.setDate(_6.getDate()+_8+_b);
}else{
var _c=(_8>0)?5:-1;
var _d=(_8>0)?2:-2;
if(_8>0&&(_a==5||_a==6)){
_b=4-_a;
_a=4;
}
var _e=_a+_8-_c;
var _f=parseInt(_e/5);
var _10=_e%5;
_9.setDate(_6.getDate()-_a+_d+_f*7+_b+_10+_c);
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
var _11=_6.getMonth();
var _c=_11+_8;
if(!_6.isLeapYear(_6.getFullYear())){
if(_11<5&&_c>=5){
_c++;
}else{
if(_11>5&&_c<=5){
_c--;
}
}
}
_9.setMonth(_c);
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
dojox.date.hebrew.difference=function(_12,_13,_14){
_13=_13||new _1();
_14=_14||"day";
var _15=_12.getFullYear()-_13.getFullYear();
var _16=1;
switch(_14){
case "weekday":
var _17=Math.round(dojox.date.hebrew.difference(_12,_13,"day"));
var _18=parseInt(dojox.date.hebrew.difference(_12,_13,"week"));
var mod=_17%7;
if(mod==0){
_17=_18*5;
}else{
var adj=0;
var _19=_13.getDay();
var _1a=_12.getDay();
_18=parseInt(_17/7);
mod=_17%7;
var _1b=new _1(_13);
_1b.setDate(_1b.getDate()+(_18*7));
var _1c=_1b.getDay();
if(_17>0){
switch(true){
case _19==5:
adj=-1;
break;
case _19==6:
adj=0;
break;
case _1a==5:
adj=-1;
break;
case _1a==6:
adj=-2;
break;
case (_1c+mod)>5:
adj=-2;
}
}else{
if(_17<0){
switch(true){
case _19==5:
adj=0;
break;
case _19==6:
adj=1;
break;
case _1a==5:
adj=2;
break;
case _1a==6:
adj=1;
break;
case (_1c+mod)<0:
adj=2;
}
}
}
_17+=adj;
_17-=(_18*2);
}
_16=_17;
break;
case "year":
_16=_15;
break;
case "month":
var _1d=(_12.toGregorian()>_13.toGregorian())?_12:_13;
var _1e=(_12.toGregorian()>_13.toGregorian())?_13:_12;
var _1f=_1d.getMonth();
var _20=_1e.getMonth();
if(_15==0){
_16=(!_12.isLeapYear(_12.getFullYear())&&_1d.getMonth()>5&&_1e.getMonth()<=5)?(_1d.getMonth()-_1e.getMonth()-1):(_1d.getMonth()-_1e.getMonth());
}else{
_16=(!_1e.isLeapYear(_1e.getFullYear())&&_20<6)?(13-_20-1):(13-_20);
_16+=(!_1d.isLeapYear(_1d.getFullYear())&&_1f>5)?(_1f-1):_1f;
var i=_1e.getFullYear()+1;
var e=_1d.getFullYear();
for(i;i<e;i++){
_16+=_1e.isLeapYear(i)?13:12;
}
}
if(_12.toGregorian()<_13.toGregorian()){
_16=-_16;
}
break;
case "week":
_16=parseInt(dojox.date.hebrew.difference(_12,_13,"day")/7);
break;
case "day":
_16/=24;
case "hour":
_16/=60;
case "minute":
_16/=60;
case "second":
_16/=1000;
case "millisecond":
_16*=_12.toGregorian().getTime()-_13.toGregorian().getTime();
}
return Math.round(_16);
};
return dojox.date.hebrew;
});
