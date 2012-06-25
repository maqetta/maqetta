/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/request/util",["exports","require","../errors/RequestError","../errors/CancelError","../Deferred","../io-query","../_base/array","../_base/lang"],function(_1,_2,_3,_4,_5,_6,_7,_8){
_1.deepCopy=function deepCopy(_9,_a){
for(var _b in _a){
var _c=_9[_b],_d=_a[_b];
if(_c!==_d){
if(_c&&typeof _c==="object"&&_d&&typeof _d==="object"){
_1.deepCopy(_c,_d);
}else{
_9[_b]=_d;
}
}
}
return _9;
};
_1.deepCreate=function deepCreate(_e,_f){
_f=_f||{};
var _10=_8.delegate(_e),_11,_12;
for(_11 in _e){
_12=_e[_11];
if(_12&&typeof _12==="object"){
_10[_11]=_1.deepCreate(_12,_f[_11]);
}
}
return _1.deepCopy(_10,_f);
};
var _13=Object.freeze||function(obj){
return obj;
};
function _14(_15){
return _13(_15);
};
_1.deferred=function deferred(_16,_17,_18,_19,_1a,_1b){
var def=new _5(function(_1c){
_17&&_17(def,_16);
if(!_1c||!(_1c instanceof _3)&&!(_1c instanceof _4)){
return new _4("Request canceled",_16);
}
return _1c;
});
def.response=_16;
def.isValid=_18;
def.isReady=_19;
def.handleResponse=_1a;
function _1d(_1e){
_1e.response=_16;
throw _1e;
};
var _1f=def.then(_14).otherwise(_1d);
try{
var _20=_2("./notify");
_1f.then(_20.load,_20.error);
}
catch(e){
}
var _21=_1f.then(function(_22){
return _22.data||_22.text;
});
var _23=_13(_8.delegate(_21,{response:_1f}));
if(_1b){
def.then(function(_24){
_1b.call(def,_24);
},function(_25){
_1b.call(def,_16,_25);
});
}
def.promise=_23;
def.then=_23.then;
return def;
};
_1.addCommonMethods=function addCommonMethods(_26,_27){
_7.forEach(_27||["GET","POST","PUT","DELETE"],function(_28){
_26[(_28==="DELETE"?"DEL":_28).toLowerCase()]=function(url,_29){
_29=_8.delegate(_29||{});
_29.method=_28;
return _26(url,_29);
};
});
};
_1.parseArgs=function parseArgs(url,_2a,_2b){
var _2c=_2a.data,_2d=_2a.query;
if(_2c&&!_2b){
if(typeof _2c==="object"){
_2a.data=_6.objectToQuery(_2c);
}
}
if(_2d){
if(typeof _2d==="object"){
_2d=_6.objectToQuery(_2d);
}
if(_2a.preventCache){
_2d+=(_2d?"&":"")+"request.preventCache="+(+(new Date));
}
}else{
if(_2a.preventCache){
_2d="request.preventCache="+(+(new Date));
}
}
if(url&&_2d){
url+=(~url.indexOf("?")?"&":"?")+_2d;
}
return {url:url,options:_2a,getHeader:function(_2e){
return null;
}};
};
_1.checkStatus=function(_2f){
_2f=_2f||0;
return (_2f>=200&&_2f<300)||_2f===304||_2f===1223||!_2f;
};
});
