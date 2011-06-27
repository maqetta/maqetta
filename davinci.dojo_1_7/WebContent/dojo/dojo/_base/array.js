/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/array",["./kernel","./lang"],function(_1){
var _2=function(_3,_4,cb){
return [(typeof _3=="string")?_3.split(""):_3,_4||_1.global,(typeof cb=="string")?new Function("item","index","array",cb):cb];
},_5=function(_6,_7,_8,_9){
var _a=_2(_7,_9,_8);
_7=_a[0];
for(var i=0,l=_7.length;i<l;++i){
var _b=!!_a[2].call(_a[1],_7[i],i,_7);
if(_6^_b){
return _b;
}
}
return _6;
};
_1.mixin(_1,{indexOf:function(_c,_d,_e,_f){
var _10=1,end=_c.length||0,i=0;
if(_f){
i=end-1;
_10=end=-1;
}
if(_e!=undefined){
i=_e;
}
if((_f&&i>end)||i<end){
for(;i!=end;i+=_10){
if(_c[i]==_d){
return i;
}
}
}
return -1;
},lastIndexOf:function(_11,_12,_13){
return _1.indexOf(_11,_12,_13,true);
},forEach:function(arr,_14,_15){
if(!arr||!arr.length){
return;
}
var _16=_2(arr,_15,_14);
arr=_16[0];
for(var i=0,l=arr.length;i<l;++i){
_16[2].call(_16[1],arr[i],i,arr);
}
},every:function(arr,_17,_18){
return _5(true,arr,_17,_18);
},some:function(arr,_19,_1a){
return _5(false,arr,_19,_1a);
},map:function(arr,_1b,_1c){
var _1d=_2(arr,_1c,_1b);
arr=_1d[0];
var _1e=(arguments[3]?(new arguments[3]()):[]);
for(var i=0,l=arr.length;i<l;++i){
_1e.push(_1d[2].call(_1d[1],arr[i],i,arr));
}
return _1e;
},filter:function(arr,_1f,_20){
var _21=_2(arr,_20,_1f);
arr=_21[0];
var _22=[];
for(var i=0,l=arr.length;i<l;++i){
if(_21[2].call(_21[1],arr[i],i,arr)){
_22.push(arr[i]);
}
}
return _22;
}});
return {indexOf:_1.indexOf,lastIndexOf:_1.lastIndexOf,forEach:_1.forEach,every:_1.every,some:_1.some,map:_1.map,filter:_1.filter};
});
