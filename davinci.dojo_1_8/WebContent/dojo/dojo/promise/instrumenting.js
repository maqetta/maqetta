/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/promise/instrumenting",["../Deferred","../has","../_base/config","../_base/array","exports","require"],function(_1,_2,_3,_4,_5,_6){
function _7(_8,_9,_a){
var _b="";
if(_8&&_8.stack){
_b+=_8.stack;
}
if(_9&&_9.stack){
_b+="\n    ----------------------------------------\n    rejected"+_9.stack.split("\n").slice(1).join("\n").replace(/^\s+/," ");
}
if(_a&&_a.stack){
_b+="\n    ----------------------------------------\n"+_a.stack;
}
console.error(_b);
};
function _c(_d,_e,_f,_10){
if(!_e){
_7(_d,_f,_10);
}
};
var _11=[];
var _12=false;
var _13=1000;
function _14(_15,_16,_17,_18){
if(_16){
_4.some(_11,function(obj,ix){
if(obj.error===_15){
_11.splice(ix,1);
return true;
}
});
}else{
if(!_4.some(_11,function(obj){
return obj.error===_15;
})){
_11.push({error:_15,rejection:_17,deferred:_18,timestamp:new Date().getTime()});
}
}
if(!_12){
_12=setTimeout(_19,_13);
}
};
function _19(){
var now=new Date().getTime();
var _1a=now-_13;
_11=_4.filter(_11,function(obj){
if(obj.timestamp<_1a){
_7(obj.error,obj.rejection,obj.deferred);
return false;
}
return true;
});
if(_11.length){
_12=setTimeout(_19,_11[0].timestamp+_13-now);
}
};
_5.load=function(id,_1b,_1c){
var _1d=id.split(",");
var _1e=_1d.shift();
switch(_1e){
case 0:
break;
case "report-rejections":
_1.instrumentRejected=_c;
break;
case "report-unhandled-rejections":
_1.instrumentRejected=_14;
_13=parseInt(_1d[0],10)||_13;
break;
default:
throw new Error("Unknown instrumenting option <"+_1e+">");
}
_1c();
};
if(0){
_5.load(0,_6,function(){
});
}
return _5;
});
