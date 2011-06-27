/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/date/islamic/Date",["dojo","dijit","dojox","dojo/i18n","dojo/cldr/nls/islamic"],function(_1,_2,_3){
_1.getObject("dojox.date.islamic.Date",1);
define(["dojo/_base/kernel","dojo/date"],function(_4,dd){
_4.getObject("date.buddhist.Date",true,_3);
_4.experimental("dojox.date.buddhist.Date");
_4.requireLocalization("dojo.cldr","islamic");
_4.declare("dojox.date.islamic.Date",null,{_date:0,_month:0,_year:0,_hours:0,_minutes:0,_seconds:0,_milliseconds:0,_day:0,_GREGORIAN_EPOCH:1721425.5,_ISLAMIC_EPOCH:1948439.5,constructor:function(){
var _5=arguments.length;
if(!_5){
this.fromGregorian(new Date());
}else{
if(_5==1){
var _6=arguments[0];
if(typeof _6=="number"){
_6=new Date(_6);
}
if(_6 instanceof Date){
this.fromGregorian(_6);
}else{
if(_6==""){
this._date=new Date("");
}else{
this._year=_6._year;
this._month=_6._month;
this._date=_6._date;
this._hours=_6._hours;
this._minutes=_6._minutes;
this._seconds=_6._seconds;
this._milliseconds=_6._milliseconds;
}
}
}else{
if(_5>=3){
this._year+=arguments[0];
this._month+=arguments[1];
this._date+=arguments[2];
this._hours+=arguments[3]||0;
this._minutes+=arguments[4]||0;
this._seconds+=arguments[5]||0;
this._milliseconds+=arguments[6]||0;
}
}
}
},getDate:function(){
return this._date;
},getMonth:function(){
return this._month;
},getFullYear:function(){
return this._year;
},getDay:function(){
return this.toGregorian().getDay();
},getHours:function(){
return this._hours;
},getMinutes:function(){
return this._minutes;
},getSeconds:function(){
return this._seconds;
},getMilliseconds:function(){
return this._milliseconds;
},setDate:function(_7){
_7=parseInt(_7);
if(_7>0&&_7<=this.getDaysInIslamicMonth(this._month,this._year)){
this._date=_7;
}else{
var _8;
if(_7>0){
for(_8=this.getDaysInIslamicMonth(this._month,this._year);_7>_8;_7-=_8,_8=this.getDaysInIslamicMonth(this._month,this._year)){
this._month++;
if(this._month>=12){
this._year++;
this._month-=12;
}
}
this._date=_7;
}else{
for(_8=this.getDaysInIslamicMonth((this._month-1)>=0?(this._month-1):11,((this._month-1)>=0)?this._year:this._year-1);_7<=0;_8=this.getDaysInIslamicMonth((this._month-1)>=0?(this._month-1):11,((this._month-1)>=0)?this._year:this._year-1)){
this._month--;
if(this._month<0){
this._year--;
this._month+=12;
}
_7+=_8;
}
this._date=_7;
}
}
return this;
},setFullYear:function(_9){
this._year=+_9;
},setMonth:function(_a){
this._year+=Math.floor(_a/12);
if(_a>0){
this._month=Math.floor(_a%12);
}else{
this._month=Math.floor(((_a%12)+12)%12);
}
},setHours:function(){
var _b=arguments.length;
var _c=0;
if(_b>=1){
_c=parseInt(arguments[0]);
}
if(_b>=2){
this._minutes=parseInt(arguments[1]);
}
if(_b>=3){
this._seconds=parseInt(arguments[2]);
}
if(_b==4){
this._milliseconds=parseInt(arguments[3]);
}
while(_c>=24){
this._date++;
var _d=this.getDaysInIslamicMonth(this._month,this._year);
if(this._date>_d){
this._month++;
if(this._month>=12){
this._year++;
this._month-=12;
}
this._date-=_d;
}
_c-=24;
}
this._hours=_c;
},setMinutes:function(_e){
while(_e>=60){
this._hours++;
if(this._hours>=24){
this._date++;
this._hours-=24;
var _f=this.getDaysInIslamicMonth(this._month,this._year);
if(this._date>_f){
this._month++;
if(this._month>=12){
this._year++;
this._month-=12;
}
this._date-=_f;
}
}
_e-=60;
}
this._minutes=_e;
},setSeconds:function(_10){
while(_10>=60){
this._minutes++;
if(this._minutes>=60){
this._hours++;
this._minutes-=60;
if(this._hours>=24){
this._date++;
this._hours-=24;
var _11=this.getDaysInIslamicMonth(this._month,this._year);
if(this._date>_11){
this._month++;
if(this._month>=12){
this._year++;
this._month-=12;
}
this._date-=_11;
}
}
}
_10-=60;
}
this._seconds=_10;
},setMilliseconds:function(_12){
while(_12>=1000){
this.setSeconds++;
if(this.setSeconds>=60){
this._minutes++;
this.setSeconds-=60;
if(this._minutes>=60){
this._hours++;
this._minutes-=60;
if(this._hours>=24){
this._date++;
this._hours-=24;
var _13=this.getDaysInIslamicMonth(this._month,this._year);
if(this._date>_13){
this._month++;
if(this._month>=12){
this._year++;
this._month-=12;
}
this._date-=_13;
}
}
}
}
_12-=1000;
}
this._milliseconds=_12;
},toString:function(){
var x=new Date();
x.setHours(this._hours);
x.setMinutes(this._minutes);
x.setSeconds(this._seconds);
x.setMilliseconds(this._milliseconds);
return this._month+" "+this._date+" "+this._year+" "+x.toTimeString();
},toGregorian:function(){
var _14=this._year;
var _15=this._month;
var _16=this._date;
var _17=_16+Math.ceil(29.5*_15)+(_14-1)*354+Math.floor((3+(11*_14))/30)+this._ISLAMIC_EPOCH-1;
var wjd=Math.floor(_17-0.5)+0.5,_18=wjd-this._GREGORIAN_EPOCH,_19=Math.floor(_18/146097),dqc=this._mod(_18,146097),_1a=Math.floor(dqc/36524),_1b=this._mod(dqc,36524),_1c=Math.floor(_1b/1461),_1d=this._mod(_1b,1461),_1e=Math.floor(_1d/365),_1f=(_19*400)+(_1a*100)+(_1c*4)+_1e;
if(!(_1a==4||_1e==4)){
_1f++;
}
var _20=this._GREGORIAN_EPOCH+(365*(_1f-1))+Math.floor((_1f-1)/4)-(Math.floor((_1f-1)/100))+Math.floor((_1f-1)/400);
var _21=wjd-_20;
var tjd=(this._GREGORIAN_EPOCH-1)+(365*(_1f-1))+Math.floor((_1f-1)/4)-(Math.floor((_1f-1)/100))+Math.floor((_1f-1)/400)+Math.floor((739/12)+((dd.isLeapYear(new Date(_1f,3,1))?-1:-2))+1);
var _22=((wjd<tjd)?0:(dd.isLeapYear(new Date(_1f,3,1))?1:2));
var _23=Math.floor((((_21+_22)*12)+373)/367);
var _24=(this._GREGORIAN_EPOCH-1)+(365*(_1f-1))+Math.floor((_1f-1)/4)-(Math.floor((_1f-1)/100))+Math.floor((_1f-1)/400)+Math.floor((((367*_23)-362)/12)+((_23<=2)?0:(dd.isLeapYear(new Date(_1f,_23,1))?-1:-2))+1);
var day=(wjd-_24)+1;
var _25=new Date(_1f,(_23-1),day,this._hours,this._minutes,this._seconds,this._milliseconds);
return _25;
},fromGregorian:function(_26){
var _27=new Date(_26);
var _28=_27.getFullYear(),_29=_27.getMonth(),_2a=_27.getDate();
var _2b=(this._GREGORIAN_EPOCH-1)+(365*(_28-1))+Math.floor((_28-1)/4)+(-Math.floor((_28-1)/100))+Math.floor((_28-1)/400)+Math.floor((((367*(_29+1))-362)/12)+(((_29+1)<=2)?0:(dd.isLeapYear(_27)?-1:-2))+_2a);
_2b=Math.floor(_2b)+0.5;
var _2c=_2b-this._ISLAMIC_EPOCH;
var _2d=Math.floor((30*_2c+10646)/10631);
var _2e=Math.ceil((_2c-29-this._yearStart(_2d))/29.5);
_2e=Math.min(_2e,11);
var _2f=Math.ceil(_2c-this._monthStart(_2d,_2e))+1;
this._date=_2f;
this._month=_2e;
this._year=_2d;
this._hours=_27.getHours();
this._minutes=_27.getMinutes();
this._seconds=_27.getSeconds();
this._milliseconds=_27.getMilliseconds();
this._day=_27.getDay();
return this;
},valueOf:function(){
return this.toGregorian().valueOf();
},_yearStart:function(_30){
return (_30-1)*354+Math.floor((3+11*_30)/30);
},_monthStart:function(_31,_32){
return Math.ceil(29.5*_32)+(_31-1)*354+Math.floor((3+11*_31)/30);
},_civilLeapYear:function(_33){
return (14+11*_33)%30<11;
},getDaysInIslamicMonth:function(_34,_35){
var _36=0;
_36=29+((_34+1)%2);
if(_34==11&&this._civilLeapYear(_35)){
_36++;
}
return _36;
},_mod:function(a,b){
return a-(b*Math.floor(a/b));
}});
_3.date.islamic.Date.getDaysInIslamicMonth=function(_37){
return new _3.date.islamic.Date().getDaysInIslamicMonth(_37.getMonth(),_37.getFullYear());
};
return _3.date.islamic.Date;
});
return _1.getObject("dojox.date.islamic.Date");
});
require(["dojox/date/islamic/Date"]);
