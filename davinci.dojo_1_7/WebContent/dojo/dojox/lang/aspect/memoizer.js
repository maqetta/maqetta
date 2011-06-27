/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/lang/aspect/memoizer",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.lang.aspect.memoizer",1);
(function(){
var _4=_3.lang.aspect;
var _5={around:function(_6){
var _7=_4.getContext(),_8=_7.joinPoint,_9=_7.instance,t,u,_a;
if((t=_9.__memoizerCache)&&(t=t[_8.targetName])&&(_6 in t)){
return t[_6];
}
var _a=_4.proceed.apply(null,arguments);
if(!(t=_9.__memoizerCache)){
t=_9.__memoizerCache={};
}
if(!(u=t[_8.targetName])){
u=t[_8.targetName]={};
}
return u[_6]=_a;
}};
var _b=function(_c){
return {around:function(){
var _d=_4.getContext(),_e=_d.joinPoint,_f=_d.instance,t,u,ret,key=_c.apply(_f,arguments);
if((t=_f.__memoizerCache)&&(t=t[_e.targetName])&&(key in t)){
return t[key];
}
var ret=_4.proceed.apply(null,arguments);
if(!(t=_f.__memoizerCache)){
t=_f.__memoizerCache={};
}
if(!(u=t[_e.targetName])){
u=t[_e.targetName]={};
}
return u[key]=ret;
}};
};
_4.memoizer=function(_10){
return arguments.length==0?_5:_b(_10);
};
})();
return _1.getObject("dojox.lang.aspect.memoizer");
});
require(["dojox/lang/aspect/memoizer"]);
