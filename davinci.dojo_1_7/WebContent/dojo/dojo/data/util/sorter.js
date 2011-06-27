/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/data/util/sorter",["../.."],function(_1){
_1.getObject("data.util.sorter",true,_1);
_1.data.util.sorter.basicComparator=function(a,b){
var r=-1;
if(a===null){
a=undefined;
}
if(b===null){
b=undefined;
}
if(a==b){
r=0;
}else{
if(a>b||a==null){
r=1;
}
}
return r;
};
_1.data.util.sorter.createSortFunction=function(_2,_3){
var _4=[];
function _5(_6,_7,_8,s){
return function(_9,_a){
var a=s.getValue(_9,_6);
var b=s.getValue(_a,_6);
return _7*_8(a,b);
};
};
var _b;
var _c=_3.comparatorMap;
var bc=_1.data.util.sorter.basicComparator;
for(var i=0;i<_2.length;i++){
_b=_2[i];
var _d=_b.attribute;
if(_d){
var _e=(_b.descending)?-1:1;
var _f=bc;
if(_c){
if(typeof _d!=="string"&&("toString" in _d)){
_d=_d.toString();
}
_f=_c[_d]||bc;
}
_4.push(_5(_d,_e,_f,_3));
}
}
return function(_10,_11){
var i=0;
while(i<_4.length){
var ret=_4[i++](_10,_11);
if(ret!==0){
return ret;
}
}
return 0;
};
};
return _1.data.util.sorter;
});
