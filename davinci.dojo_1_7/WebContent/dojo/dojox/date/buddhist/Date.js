/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/date/buddhist/Date",["dojo/_base/kernel","dojo/date"],function(_1,dd){
_1.getObject("date.buddhist.Date",true,dojox);
_1.experimental("dojox.date.buddhist.Date");
_1.declare("dojox.date.buddhist.Date",null,{_date:0,_month:0,_year:0,_hours:0,_minutes:0,_seconds:0,_milliseconds:0,_day:0,constructor:function(){
var _2=arguments.length;
if(!_2){
this.fromGregorian(new Date());
}else{
if(_2==1){
var _3=arguments[0];
if(typeof _3=="number"){
_3=new Date(_3);
}
if(_3 instanceof Date){
this.fromGregorian(_3);
}else{
if(_3==""){
this._date=new Date("");
}else{
this._year=_3._year;
this._month=_3._month;
this._date=_3._date;
this._hours=_3._hours;
this._minutes=_3._minutes;
this._seconds=_3._seconds;
this._milliseconds=_3._milliseconds;
}
}
}else{
if(_2>=3){
this._year+=arguments[0];
this._month+=arguments[1];
this._date+=arguments[2];
if(this._month>11){
console.warn("the month is incorrect , set 0");
this._month=0;
}
this._hours+=arguments[3]||0;
this._minutes+=arguments[4]||0;
this._seconds+=arguments[5]||0;
this._milliseconds+=arguments[6]||0;
}
}
}
},getDate:function(_4){
return parseInt(this._date);
},getMonth:function(){
return parseInt(this._month);
},getFullYear:function(){
return parseInt(this._year);
},getHours:function(){
return this._hours;
},getMinutes:function(){
return this._minutes;
},getSeconds:function(){
return this._seconds;
},getMilliseconds:function(){
return this._milliseconds;
},setDate:function(_5){
_5=parseInt(_5);
if(_5>0&&_5<=this._getDaysInMonth(this._month,this._year)){
this._date=_5;
}else{
var _6;
if(_5>0){
for(_6=this._getDaysInMonth(this._month,this._year);_5>_6;_5-=_6,_6=this._getDaysInMonth(this._month,this._year)){
this._month++;
if(this._month>=12){
this._year++;
this._month-=12;
}
}
this._date=_5;
}else{
for(_6=this._getDaysInMonth((this._month-1)>=0?(this._month-1):11,((this._month-1)>=0)?this._year:this._year-1);_5<=0;_6=this._getDaysInMonth((this._month-1)>=0?(this._month-1):11,((this._month-1)>=0)?this._year:this._year-1)){
this._month--;
if(this._month<0){
this._year--;
this._month+=12;
}
_5+=_6;
}
this._date=_5;
}
}
return this;
},setFullYear:function(_7,_8,_9){
this._year=parseInt(_7);
},setMonth:function(_a){
this._year+=Math.floor(_a/12);
this._month=Math.floor(_a%12);
for(;this._month<0;this._month=this._month+12){
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
var _d=this._getDaysInMonth(this._month,this._year);
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
var _f=this._getDaysInMonth(this._month,this._year);
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
var _11=this._getDaysInMonth(this._month,this._year);
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
var _13=this._getDaysInMonth(this._month,this._year);
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
return this._date+", "+this._month+", "+this._year+"  "+this._hours+":"+this._minutes+":"+this._seconds;
},_getDaysInMonth:function(_14,_15){
return dd.getDaysInMonth(new Date(_15-543,_14));
},fromGregorian:function(_16){
var _17=new Date(_16);
this._date=_17.getDate();
this._month=_17.getMonth();
this._year=_17.getFullYear()+543;
this._hours=_17.getHours();
this._minutes=_17.getMinutes();
this._seconds=_17.getSeconds();
this._milliseconds=_17.getMilliseconds();
this._day=_17.getDay();
return this;
},toGregorian:function(){
return new Date(this._year-543,this._month,this._date,this._hours,this._minutes,this._seconds,this._milliseconds);
},getDay:function(){
return this.toGregorian().getDay();
}});
dojox.date.buddhist.Date.prototype.valueOf=function(){
return this.toGregorian().valueOf();
};
return dojox.date.buddhist.Date;
});
