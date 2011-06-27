/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/lang",["./kernel","../has","./sniff"],function(_1,_2){
var _3=Object.prototype.toString;
_1.isString=function(it){
return (typeof it=="string"||it instanceof String);
};
_1.isArray=function(it){
return it&&(it instanceof Array||typeof it=="array");
};
_1.isFunction=function(it){
return _3.call(it)==="[object Function]";
};
_1.isObject=function(it){
return it!==undefined&&(it===null||typeof it=="object"||_1.isArray(it)||_1.isFunction(it));
};
_1.isArrayLike=function(it){
return it&&it!==undefined&&!_1.isString(it)&&!_1.isFunction(it)&&!(it.tagName&&it.tagName.toLowerCase()=="form")&&(_1.isArray(it)||isFinite(it.length));
};
_1.isAlien=function(it){
return it&&!_1.isFunction(it)&&/\{\s*\[native code\]\s*\}/.test(String(it));
};
_1.extend=function(_4,_5){
for(var i=1,l=arguments.length;i<l;i++){
_1._mixin(_4.prototype,arguments[i]);
}
return _4;
};
_1._hitchArgs=function(_6,_7){
var _8=_1._toArray(arguments,2);
var _9=_1.isString(_7);
return function(){
var _a=_1._toArray(arguments);
var f=_9?(_6||_1.global)[_7]:_7;
return f&&f.apply(_6||this,_8.concat(_a));
};
};
_1.hitch=function(_b,_c){
if(arguments.length>2){
return _1._hitchArgs.apply(_1,arguments);
}
if(!_c){
_c=_b;
_b=null;
}
if(_1.isString(_c)){
_b=_b||_1.global;
if(!_b[_c]){
throw (["dojo.hitch: scope[\"",_c,"\"] is null (scope=\"",_b,"\")"].join(""));
}
return function(){
return _b[_c].apply(_b,arguments||[]);
};
}
return !_b?_c:function(){
return _c.apply(_b,arguments||[]);
};
};
_1.delegate=_1._delegate=(function(){
function _d(){
};
return function(_e,_f){
_d.prototype=_e;
var tmp=new _d();
_d.prototype=null;
if(_f){
_1._mixin(tmp,_f);
}
return tmp;
};
})();
var _10=function(obj,_11,_12){
return (_12||[]).concat(Array.prototype.slice.call(obj,_11||0));
};
var _13=function(obj,_14,_15){
var arr=_15||[];
for(var x=_14||0;x<obj.length;x++){
arr.push(obj[x]);
}
return arr;
};
_1._toArray=_1.isIE?function(obj){
return ((obj.item)?_13:_10).apply(this,arguments);
}:_10;
_1.partial=function(_16){
var arr=[null];
return _1.hitch.apply(_1,arr.concat(_1._toArray(arguments)));
};
var _17={};
_1.clone=function(o){
if(!o||typeof o!="object"||_1.isFunction(o)){
return o;
}
if(o.nodeType&&"cloneNode" in o){
return o.cloneNode(true);
}
if(o instanceof Date){
return new Date(o.getTime());
}
if(o instanceof RegExp){
return new RegExp(o);
}
var r,i,l,s,_18;
if(_1.isArray(o)){
r=[];
for(i=0,l=o.length;i<l;++i){
if(i in o){
r.push(_1.clone(o[i]));
}
}
}else{
r=o.constructor?new o.constructor():{};
}
for(_18 in o){
s=o[_18];
if(!(_18 in r)||(r[_18]!==s&&(!(_18 in _17)||_17[_18]!==s))){
r[_18]=_1.clone(s);
}
}
if(_2("bug-for-in-skips-shadowed")){
var _19=_1._extraNames;
for(i=_19.length;i;){
_18=_19[--i];
s=o[_18];
if(!(_18 in r)||(r[_18]!==s&&(!(_18 in _17)||_17[_18]!==s))){
r[_18]=s;
}
}
}
return r;
};
_1.trim=String.prototype.trim?function(str){
return str.trim();
}:function(str){
return str.replace(/^\s\s*/,"").replace(/\s\s*$/,"");
};
var _1a=/\{([^\}]+)\}/g;
_1.replace=function(_1b,map,_1c){
return _1b.replace(_1c||_1a,_1.isFunction(map)?map:function(_1d,k){
return _1.getObject(k,false,map);
});
};
return {isString:_1.isString,isArray:_1.isArray,isFunction:_1.isFunction,isObject:_1.isObject,isArrayLike:_1.isArrayLike,isAlien:_1.isAlien,extend:_1.extend,_hitchArgs:_1._hitchArgs,hitch:_1.hitch,delegate:_1.delegate,_toArray:_1._toArray,partial:_1.partial,clone:_1.clone,trim:_1.trim,replace:_1.replace};
});
