/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/date/stamp",["../main"],function(_1){
_1.getObject("date.stamp",true,_1);
_1.date.stamp.fromISOString=function(_2,_3){
if(!_1.date.stamp._isoRegExp){
_1.date.stamp._isoRegExp=/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
}
var _4=_1.date.stamp._isoRegExp.exec(_2),_5=null;
if(_4){
_4.shift();
if(_4[1]){
_4[1]--;
}
if(_4[6]){
_4[6]*=1000;
}
if(_3){
_3=new Date(_3);
_1.forEach(_1.map(["FullYear","Month","Date","Hours","Minutes","Seconds","Milliseconds"],function(_6){
return _3["get"+_6]();
}),function(_7,_8){
_4[_8]=_4[_8]||_7;
});
}
_5=new Date(_4[0]||1970,_4[1]||0,_4[2]||1,_4[3]||0,_4[4]||0,_4[5]||0,_4[6]||0);
if(_4[0]<100){
_5.setFullYear(_4[0]||1970);
}
var _9=0,_a=_4[7]&&_4[7].charAt(0);
if(_a!="Z"){
_9=((_4[8]||0)*60)+(Number(_4[9])||0);
if(_a!="-"){
_9*=-1;
}
}
if(_a){
_9-=_5.getTimezoneOffset();
}
if(_9){
_5.setTime(_5.getTime()+_9*60000);
}
}
return _5;
};
_1.date.stamp.toISOString=function(_b,_c){
var _d=function(n){
return (n<10)?"0"+n:n;
};
_c=_c||{};
var _e=[],_f=_c.zulu?"getUTC":"get",_10="";
if(_c.selector!="time"){
var _11=_b[_f+"FullYear"]();
_10=["0000".substr((_11+"").length)+_11,_d(_b[_f+"Month"]()+1),_d(_b[_f+"Date"]())].join("-");
}
_e.push(_10);
if(_c.selector!="date"){
var _12=[_d(_b[_f+"Hours"]()),_d(_b[_f+"Minutes"]()),_d(_b[_f+"Seconds"]())].join(":");
var _13=_b[_f+"Milliseconds"]();
if(_c.milliseconds){
_12+="."+(_13<100?"0":"")+_d(_13);
}
if(_c.zulu){
_12+="Z";
}else{
if(_c.selector!="time"){
var _14=_b.getTimezoneOffset();
var _15=Math.abs(_14);
_12+=(_14>0?"-":"+")+_d(Math.floor(_15/60))+":"+_d(_15%60);
}
}
_e.push(_12);
}
return _e.join("T");
};
return _1.date.stamp;
});
