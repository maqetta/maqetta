/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/date",["./_base/kernel"],function(_1){
_1.getObject("date",true,_1);
_1.date.getDaysInMonth=function(_2){
var _3=_2.getMonth();
var _4=[31,28,31,30,31,30,31,31,30,31,30,31];
if(_3==1&&_1.date.isLeapYear(_2)){
return 29;
}
return _4[_3];
};
_1.date.isLeapYear=function(_5){
var _6=_5.getFullYear();
return !(_6%400)||(!(_6%4)&&!!(_6%100));
};
_1.date.getTimezoneName=function(_7){
var _8=_7.toString();
var tz="";
var _9;
var _a=_8.indexOf("(");
if(_a>-1){
tz=_8.substring(++_a,_8.indexOf(")"));
}else{
var _b=/([A-Z\/]+) \d{4}$/;
if((_9=_8.match(_b))){
tz=_9[1];
}else{
_8=_7.toLocaleString();
_b=/ ([A-Z\/]+)$/;
if((_9=_8.match(_b))){
tz=_9[1];
}
}
}
return (tz=="AM"||tz=="PM")?"":tz;
};
_1.date.compare=function(_c,_d,_e){
_c=new Date(+_c);
_d=new Date(+(_d||new Date()));
if(_e=="date"){
_c.setHours(0,0,0,0);
_d.setHours(0,0,0,0);
}else{
if(_e=="time"){
_c.setFullYear(0,0,0);
_d.setFullYear(0,0,0);
}
}
if(_c>_d){
return 1;
}
if(_c<_d){
return -1;
}
return 0;
};
_1.date.add=function(_f,_10,_11){
var sum=new Date(+_f);
var _12=false;
var _13="Date";
switch(_10){
case "day":
break;
case "weekday":
var _14,_15;
var mod=_11%5;
if(!mod){
_14=(_11>0)?5:-5;
_15=(_11>0)?((_11-5)/5):((_11+5)/5);
}else{
_14=mod;
_15=parseInt(_11/5);
}
var _16=_f.getDay();
var adj=0;
if(_16==6&&_11>0){
adj=1;
}else{
if(_16==0&&_11<0){
adj=-1;
}
}
var _17=_16+_14;
if(_17==0||_17==6){
adj=(_11>0)?2:-2;
}
_11=(7*_15)+_14+adj;
break;
case "year":
_13="FullYear";
_12=true;
break;
case "week":
_11*=7;
break;
case "quarter":
_11*=3;
case "month":
_12=true;
_13="Month";
break;
default:
_13="UTC"+_10.charAt(0).toUpperCase()+_10.substring(1)+"s";
}
if(_13){
sum["set"+_13](sum["get"+_13]()+_11);
}
if(_12&&(sum.getDate()<_f.getDate())){
sum.setDate(0);
}
return sum;
};
_1.date.difference=function(_18,_19,_1a){
_19=_19||new Date();
_1a=_1a||"day";
var _1b=_19.getFullYear()-_18.getFullYear();
var _1c=1;
switch(_1a){
case "quarter":
var m1=_18.getMonth();
var m2=_19.getMonth();
var q1=Math.floor(m1/3)+1;
var q2=Math.floor(m2/3)+1;
q2+=(_1b*4);
_1c=q2-q1;
break;
case "weekday":
var _1d=Math.round(_1.date.difference(_18,_19,"day"));
var _1e=parseInt(_1.date.difference(_18,_19,"week"));
var mod=_1d%7;
if(mod==0){
_1d=_1e*5;
}else{
var adj=0;
var _1f=_18.getDay();
var _20=_19.getDay();
_1e=parseInt(_1d/7);
mod=_1d%7;
var _21=new Date(_18);
_21.setDate(_21.getDate()+(_1e*7));
var _22=_21.getDay();
if(_1d>0){
switch(true){
case _1f==6:
adj=-1;
break;
case _1f==0:
adj=0;
break;
case _20==6:
adj=-1;
break;
case _20==0:
adj=-2;
break;
case (_22+mod)>5:
adj=-2;
}
}else{
if(_1d<0){
switch(true){
case _1f==6:
adj=0;
break;
case _1f==0:
adj=1;
break;
case _20==6:
adj=2;
break;
case _20==0:
adj=1;
break;
case (_22+mod)<0:
adj=2;
}
}
}
_1d+=adj;
_1d-=(_1e*2);
}
_1c=_1d;
break;
case "year":
_1c=_1b;
break;
case "month":
_1c=(_19.getMonth()-_18.getMonth())+(_1b*12);
break;
case "week":
_1c=parseInt(_1.date.difference(_18,_19,"day")/7);
break;
case "day":
_1c/=24;
case "hour":
_1c/=60;
case "minute":
_1c/=60;
case "second":
_1c/=1000;
case "millisecond":
_1c*=_19.getTime()-_18.getTime();
}
return Math.round(_1c);
};
return _1.date;
});
