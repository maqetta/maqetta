/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/date/buddhist",["dojo/_base/kernel","dojo/date","./buddhist/Date"],function(d,dd,_1){
dojo.getObject("date.buddhist",true,dojox);
dojo.experimental("dojox.date.buddhist");
dojox.date.buddhist.getDaysInMonth=function(_2){
return dd.getDaysInMonth(_2.toGregorian());
};
dojox.date.buddhist.isLeapYear=function(_3){
return dd.isLeapYear(_3.toGregorian());
};
dojox.date.buddhist.compare=function(_4,_5,_6){
return dd.compare(_4,_5,_6);
};
dojox.date.buddhist.add=function(_7,_8,_9){
var _a=new _1(_7);
switch(_8){
case "day":
_a.setDate(_7.getDate(true)+_9);
break;
case "weekday":
var _b,_c;
var _d=_9%5;
if(!_d){
_b=(_9>0)?5:-5;
_c=(_9>0)?((_9-5)/5):((_9+5)/5);
}else{
_b=_d;
_c=parseInt(_9/5);
}
var _e=_7.getDay();
var _f=0;
if(_e==6&&_9>0){
_f=1;
}else{
if(_e==0&&_9<0){
_f=-1;
}
}
var _10=_e+_b;
if(_10==0||_10==6){
_f=(_9>0)?2:-2;
}
_9=(7*_c)+_b+_f;
_a.setDate(_7.getDate(true)+_9);
break;
case "year":
_a.setFullYear(_7.getFullYear()+_9);
break;
case "week":
_9*=7;
_a.setDate(_7.getDate(true)+_9);
break;
case "month":
_a.setMonth(_7.getMonth()+_9);
break;
case "hour":
_a.setHours(_7.getHours()+_9);
break;
case "minute":
_a.setMinutes(_7.getMinutes()+_9);
break;
case "second":
_a.setSeconds(_7.getSeconds()+_9);
break;
case "millisecond":
_a.setMilliseconds(_7.getMilliseconds()+_9);
break;
}
return _a;
};
dojox.date.buddhist.difference=function(_11,_12,_13){
_12=_12||new _1();
_13=_13||"day";
var _14=_11.getFullYear()-_12.getFullYear();
var _15=1;
switch(_13){
case "weekday":
var _16=Math.round(dojox.date.buddhist.difference(_11,_12,"day"));
var _17=parseInt(dojox.date.buddhist.difference(_11,_12,"week"));
var mod=_16%7;
if(mod==0){
_16=_17*5;
}else{
var adj=0;
var _18=_12.getDay();
var _19=_11.getDay();
_17=parseInt(_16/7);
mod=_16%7;
var _1a=new _1(_11);
_1a.setDate(_1a.getDate(true)+(_17*7));
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
_15=parseInt(dojox.date.buddhist.difference(_11,_12,"day")/7);
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
return dojo.date.buddhist;
});
