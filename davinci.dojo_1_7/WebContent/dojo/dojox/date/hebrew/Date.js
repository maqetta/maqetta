/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/date/hebrew/Date",["dojo/_base/kernel","./numerals"],function(_1,_2){
_1.getObject("date.hebrew.Date",true,dojox);
_1.experimental("dojox.date.hebrew.Date");
_1.declare("dojox.date.hebrew.Date",null,{_MONTH_LENGTH:[[30,30,30],[29,29,30],[29,30,30],[29,29,29],[30,30,30],[30,30,30],[29,29,29],[30,30,30],[29,29,29],[30,30,30],[29,29,29],[30,30,30],[29,29,29]],_MONTH_START:[[0,0,0],[30,30,30],[59,59,60],[88,89,90],[117,118,119],[147,148,149],[147,148,149],[176,177,178],[206,207,208],[235,236,237],[265,266,267],[294,295,296],[324,325,326],[353,354,355]],_LEAP_MONTH_START:[[0,0,0],[30,30,30],[59,59,60],[88,89,90],[117,118,119],[147,148,149],[177,178,179],[206,207,208],[236,237,238],[265,266,267],[295,296,297],[324,325,326],[354,355,356],[383,384,385]],_GREGORIAN_MONTH_COUNT:[[31,31,0,0],[28,29,31,31],[31,31,59,60],[30,30,90,91],[31,31,120,121],[30,30,151,152],[31,31,181,182],[31,31,212,213],[30,30,243,244],[31,31,273,274],[30,30,304,305],[31,31,334,335]],_date:0,_month:0,_year:0,_hours:0,_minutes:0,_seconds:0,_milliseconds:0,_day:0,constructor:function(){
var _3=arguments.length;
if(!_3){
this.fromGregorian(new Date());
}else{
if(_3==1){
var _4=arguments[0];
if(typeof _4=="number"){
_4=new Date(_4);
}
if(_4 instanceof Date){
this.fromGregorian(_4);
}else{
if(_4==""){
this._date=new Date("");
}else{
this._year=_4._year;
this._month=_4._month;
this._date=_4._date;
this._hours=_4._hours;
this._minutes=_4._minutes;
this._seconds=_4._seconds;
this._milliseconds=_4._milliseconds;
}
}
}else{
if(_3>=3){
this._year+=arguments[0];
this._month+=arguments[1];
this._date+=arguments[2];
if(this._month>12){
console.warn("the month is incorrect , set 0  "+this._month+"   "+this._year);
this._month=0;
}
this._hours+=arguments[3]||0;
this._minutes+=arguments[4]||0;
this._seconds+=arguments[5]||0;
this._milliseconds+=arguments[6]||0;
}
}
}
this._setDay();
},getDate:function(){
return this._date;
},getDateLocalized:function(_5){
return (_5||_1.locale).match(/^he(?:-.+)?$/)?_2.getDayHebrewLetters(this._date):this.getDate();
},getMonth:function(){
return this._month;
},getFullYear:function(){
return this._year;
},getHours:function(){
return this._hours;
},getMinutes:function(){
return this._minutes;
},getSeconds:function(){
return this._seconds;
},getMilliseconds:function(){
return this._milliseconds;
},setDate:function(_6){
_6=+_6;
var _7;
if(_6>0){
while(_6>(_7=this.getDaysInHebrewMonth(this._month,this._year))){
_6-=_7;
this._month++;
if(this._month>=13){
this._year++;
this._month-=13;
}
}
}else{
while(_6<=0){
_7=this.getDaysInHebrewMonth((this._month-1)>=0?(this._month-1):12,((this._month-1)>=0)?this._year:this._year-1);
this._month--;
if(this._month<0){
this._year--;
this._month+=13;
}
_6+=_7;
}
}
this._date=_6;
this._setDay();
return this;
},setFullYear:function(_8,_9,_a){
this._year=_8=+_8;
if(!this.isLeapYear(_8)&&this._month==5){
this._month++;
}
if(_9!==undefined){
this.setMonth(_9);
}
if(_a!==undefined){
this.setDate(_a);
}
var _b=this.getDaysInHebrewMonth(this._month,this._year);
if(_b<this._date){
this._date=_b;
}
this._setDay();
return this;
},setMonth:function(_c){
_c=+_c;
if(!this.isLeapYear(this._year)&&_c==5){
_c++;
}
if(_c>=0){
while(_c>12){
this._year++;
_c-=13;
if(!this.isLeapYear(this._year)&&_c>=5){
_c++;
}
}
}else{
while(_c<0){
this._year--;
_c+=(!this.isLeapYear(this._year)&&_c<-7)?12:13;
}
}
this._month=_c;
var _d=this.getDaysInHebrewMonth(this._month,this._year);
if(_d<this._date){
this._date=_d;
}
this._setDay();
return this;
},setHours:function(){
var _e=arguments.length;
var _f=0;
if(_e>=1){
_f+=+arguments[0];
}
if(_e>=2){
this._minutes+=+arguments[1];
}
if(_e>=3){
this._seconds+=+arguments[2];
}
if(_e==4){
this._milliseconds+=+arguments[3];
}
while(_f>=24){
this._date++;
var _10=this.getDaysInHebrewMonth(this._month,this._year);
if(this._date>_10){
this._month++;
if(!this.isLeapYear(this._year)&&this._month==5){
this._month++;
}
if(this._month>=13){
this._year++;
this._month-=13;
}
this._date-=_10;
}
_f-=24;
}
this._hours=_f;
this._setDay();
return this;
},setMinutes:function(_11){
_11=+_11;
this._minutes=_11%60;
this.setHours(parseInt(_11/60));
this._setDay();
return this;
},setSeconds:function(_12){
_12=+_12;
this._seconds=_12%60;
this.setMinutes(parseInt(_12/60));
this._setDay();
return this;
},setMilliseconds:function(_13){
_13=+_13;
this._milliseconds=_13%1000;
this.setSeconds(parseInt(_13/1000));
this._setDay();
return this;
},_setDay:function(){
var day=this._startOfYear(this._year);
if(this._month!=0){
day+=(this.isLeapYear(this._year)?this._LEAP_MONTH_START:this._MONTH_START)[this._month][this._yearType(this._year)];
}
day+=this._date-1;
this._day=(day+1)%7;
},toString:function(){
return this._date+", "+this._month+", "+this._year+"  "+this._hours+":"+this._minutes+":"+this._seconds;
},getDaysInHebrewMonth:function(_14,_15){
var _16=(_14==1||_14==2)?this._yearType(_15):0;
return (!this.isLeapYear(this._year)&&_14==5)?0:this._MONTH_LENGTH[_14][_16];
},_yearType:function(_17){
var _18=this._handleGetYearLength(Number(_17));
if(_18>380){
_18-=30;
}
var _19=_18-353;
if(_19<0||_19>2){
throw new Error("Illegal year length "+_18+" in year "+_17);
}
return _19;
},_handleGetYearLength:function(_1a){
return this._startOfYear(_1a+1)-this._startOfYear(_1a);
},_startOfYear:function(_1b){
var _1c=Math.floor((235*_1b-234)/19),_1d=_1c*(12*1080+793)+11*1080+204,day=_1c*29+Math.floor(_1d/(24*1080));
_1d%=24*1080;
var wd=day%7;
if(wd==2||wd==4||wd==6){
day+=1;
wd=day%7;
}
if(wd==1&&_1d>15*1080+204&&!this.isLeapYear(_1b)){
day+=2;
}else{
if(wd==0&&_1d>21*1080+589&&this.isLeapYear(_1b-1)){
day+=1;
}
}
return day;
},isLeapYear:function(_1e){
var x=(_1e*12+17)%19;
return x>=((x<0)?-7:12);
},fromGregorian:function(_1f){
var _20=this._computeHebrewFields(_1f);
this._year=_20[0];
this._month=_20[1];
this._date=_20[2];
this._hours=_1f.getHours();
this._milliseconds=_1f.getMilliseconds();
this._minutes=_1f.getMinutes();
this._seconds=_1f.getSeconds();
this._setDay();
return this;
},_computeHebrewFields:function(_21){
var _22=this._getJulianDayFromGregorianDate(_21),d=_22-347997,m=Math.floor((d*24*1080)/(29*24*1080+12*1080+793)),_23=Math.floor((19*m+234)/235)+1,ys=this._startOfYear(_23),_24=(d-ys);
while(_24<1){
_23--;
ys=this._startOfYear(_23);
_24=d-ys;
}
var _25=this._yearType(_23),_26=this.isLeapYear(_23)?this._LEAP_MONTH_START:this._MONTH_START,_27=0;
while(_24>_26[_27][_25]){
_27++;
}
_27--;
var _28=_24-_26[_27][_25];
return [_23,_27,_28];
},toGregorian:function(){
var _29=this._year,_2a=this._month,_2b=this._date,day=this._startOfYear(_29);
if(_2a!=0){
day+=(this.isLeapYear(_29)?this._LEAP_MONTH_START:this._MONTH_START)[_2a][this._yearType(_29)];
}
var _2c=(_2b+day+347997),_2d=_2c-1721426;
var rem=[];
var _2e=this._floorDivide(_2d,146097,rem),_2f=this._floorDivide(rem[0],36524,rem),n4=this._floorDivide(rem[0],1461,rem),n1=this._floorDivide(rem[0],365,rem),_30=400*_2e+100*_2f+4*n4+n1,_31=rem[0];
if(_2f==4||n1==4){
_31=365;
}else{
++_30;
}
var _32=!(_30%4)&&(_30%100||!(_30%400)),_33=0,_34=_32?60:59;
if(_31>=_34){
_33=_32?1:2;
}
var _35=Math.floor((12*(_31+_33)+6)/367);
var _36=_31-this._GREGORIAN_MONTH_COUNT[_35][_32?3:2]+1;
return new Date(_30,_35,_36,this._hours,this._minutes,this._seconds,this._milliseconds);
},_floorDivide:function(_37,_38,_39){
if(_37>=0){
_39[0]=(_37%_38);
return Math.floor(_37/_38);
}
var _3a=Math.floor(_37/_38);
_39[0]=_37-(_3a*_38);
return _3a;
},getDay:function(){
var _3b=this._year,_3c=this._month,_3d=this._date,day=this._startOfYear(_3b);
if(_3c!=0){
day+=(this.isLeapYear(_3b)?this._LEAP_MONTH_START:this._MONTH_START)[_3c][this._yearType(_3b)];
}
day+=_3d-1;
return (day+1)%7;
},_getJulianDayFromGregorianDate:function(_3e){
var _3f=_3e.getFullYear(),_40=_3e.getMonth(),d=_3e.getDate(),_41=!(_3f%4)&&(_3f%100||!(_3f%400)),y=_3f-1;
var _42=365*y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400)+1721426-1;
if(_40!=0){
_42+=this._GREGORIAN_MONTH_COUNT[_40][_41?3:2];
}
_42+=d;
return _42;
}});
dojox.date.hebrew.Date.prototype.valueOf=function(){
return this.toGregorian().valueOf();
};
return dojox.date.hebrew.Date;
});
