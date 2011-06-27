/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/filter/dates",["dojo/_base/kernel","../utils/date"],function(dk,_1){
dojo.getObject("dtl.filter.dates",true,dojox);
var _2=dojox.dtl.filter.dates;
dojo.mixin(_2,{_toDate:function(_3){
if(_3 instanceof Date){
return _3;
}
_3=new Date(_3);
if(_3.getTime()==new Date(0).getTime()){
return "";
}
return _3;
},date:function(_4,_5){
_4=_2._toDate(_4);
if(!_4){
return "";
}
_5=_5||"N j, Y";
return _1.format(_4,_5);
},time:function(_6,_7){
_6=_2._toDate(_6);
if(!_6){
return "";
}
_7=_7||"P";
return _1.format(_6,_7);
},timesince:function(_8,_9){
_8=_2._toDate(_8);
if(!_8){
return "";
}
var _a=_1.timesince;
if(_9){
return _a(_9,_8);
}
return _a(_8);
},timeuntil:function(_b,_c){
_b=_2._toDate(_b);
if(!_b){
return "";
}
var _d=_1.timesince;
if(_c){
return _d(_c,_b);
}
return _d(new Date(),_b);
}});
return dojox.dtl.filter.dates;
});
