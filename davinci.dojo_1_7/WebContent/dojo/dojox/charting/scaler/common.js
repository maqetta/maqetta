/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/scaler/common",["dojo/_base/kernel","../../main","dojo/_base/lang"],function(_1,_2){
var eq=function(a,b){
return Math.abs(a-b)<=0.000001*(Math.abs(a)+Math.abs(b));
};
var _3=_1.getObject("charting.scaler.common",true,_2);
return _1.mixin(_3,{findString:function(_4,_5){
_4=_4.toLowerCase();
for(var i=0;i<_5.length;++i){
if(_4==_5[i]){
return true;
}
}
return false;
},getNumericLabel:function(_6,_7,_8){
var _9="";
if(_1&&_1.number){
_9=(_8.fixed?_1.number.format(_6,{places:_7<0?-_7:0}):_1.number.format(_6))||"";
}else{
_9=_8.fixed?_6.toFixed(_7<0?-_7:0):_6.toString();
}
if(_8.labelFunc){
var r=_8.labelFunc(_9,_6,_7);
if(r){
return r;
}
}
if(_8.labels){
var l=_8.labels,lo=0,hi=l.length;
while(lo<hi){
var _a=Math.floor((lo+hi)/2),_b=l[_a].value;
if(_b<_6){
lo=_a+1;
}else{
hi=_a;
}
}
if(lo<l.length&&eq(l[lo].value,_6)){
return l[lo].text;
}
--lo;
if(lo>=0&&lo<l.length&&eq(l[lo].value,_6)){
return l[lo].text;
}
lo+=2;
if(lo<l.length&&eq(l[lo].value,_6)){
return l[lo].text;
}
}
return _9;
}});
});
