/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/data/util/simpleFetch",["../..","./sorter"],function(_1){
_1.getObject("data.util.simpleFetch",true,_1);
_1.data.util.simpleFetch.fetch=function(_2){
_2=_2||{};
if(!_2.store){
_2.store=this;
}
var _3=this;
var _4=function(_5,_6){
if(_6.onError){
var _7=_6.scope||_1.global;
_6.onError.call(_7,_5,_6);
}
};
var _8=function(_9,_a){
var _b=_a.abort||null;
var _c=false;
var _d=_a.start?_a.start:0;
var _e=(_a.count&&(_a.count!==Infinity))?(_d+_a.count):_9.length;
_a.abort=function(){
_c=true;
if(_b){
_b.call(_a);
}
};
var _f=_a.scope||_1.global;
if(!_a.store){
_a.store=_3;
}
if(_a.onBegin){
_a.onBegin.call(_f,_9.length,_a);
}
if(_a.sort){
_9.sort(_1.data.util.sorter.createSortFunction(_a.sort,_3));
}
if(_a.onItem){
for(var i=_d;(i<_9.length)&&(i<_e);++i){
var _10=_9[i];
if(!_c){
_a.onItem.call(_f,_10,_a);
}
}
}
if(_a.onComplete&&!_c){
var _11=null;
if(!_a.onItem){
_11=_9.slice(_d,_e);
}
_a.onComplete.call(_f,_11,_a);
}
};
this._fetchItems(_2,_8,_4);
return _2;
};
return _1.data.util.simpleFetch;
});
