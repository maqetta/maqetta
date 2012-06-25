/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/Deferred",["./has","./_base/lang","./errors/CancelError","./promise/Promise"],function(_1,_2,_3,_4){
"use strict";
var _5=0,_6=1,_7=2;
var _8="This deferred has already been fulfilled.";
var _9=Object.freeze||function(){
};
var _a=function(_b,_c,_d,_e,_f){
if(0){
if(_c===_7&&_10.instrumentRejected&&_b.length===0){
_10.instrumentRejected(_d,false,_e,_f);
}
}
for(var i=0;i<_b.length;i++){
_11(_b[i],_c,_d,_e);
}
};
var _11=function(_12,_13,_14,_15){
var _16=_12[_13];
var _17=_12.deferred;
if(_16){
try{
var _18=_16(_14);
if(_18&&typeof _18.then==="function"){
_12.cancel=_18.cancel;
_18.then(_19(_17,_6),_19(_17,_7),_19(_17,_5));
return;
}
_1a(_17,_6,_18);
}
catch(error){
_1a(_17,_7,error);
}
}else{
_1a(_17,_13,_14);
}
if(0){
if(_13===_7&&_10.instrumentRejected){
_10.instrumentRejected(_14,!!_16,_15,_17.promise);
}
}
};
var _19=function(_1b,_1c){
return function(_1d){
_1a(_1b,_1c,_1d);
};
};
var _1a=function(_1e,_1f,_20){
if(!_1e.isCanceled()){
switch(_1f){
case _5:
_1e.progress(_20);
break;
case _6:
_1e.resolve(_20);
break;
case _7:
_1e.reject(_20);
break;
}
}
};
var _10=function(_21){
var _22=this.promise=new _4();
var _23=this;
var _24,_25,_26;
var _27=false;
var _28=[];
if(0&&Error.captureStackTrace){
Error.captureStackTrace(_23,_10);
Error.captureStackTrace(_22,_10);
}
this.isResolved=_22.isResolved=function(){
return _24===_6;
};
this.isRejected=_22.isRejected=function(){
return _24===_7;
};
this.isFulfilled=_22.isFulfilled=function(){
return !!_24;
};
this.isCanceled=_22.isCanceled=function(){
return _27;
};
this.progress=function(_29,_2a){
if(!_24){
_a(_28,_5,_29,null,_23);
return _22;
}else{
if(_2a===true){
throw new Error(_8);
}else{
return _22;
}
}
};
this.resolve=function(_2b,_2c){
if(!_24){
_a(_28,_24=_6,_25=_2b,null,_23);
_28=null;
return _22;
}else{
if(_2c===true){
throw new Error(_8);
}else{
return _22;
}
}
};
var _2d=this.reject=function(_2e,_2f){
if(!_24){
if(0&&Error.captureStackTrace){
Error.captureStackTrace(_26={},_2d);
}
_a(_28,_24=_7,_25=_2e,_26,_23);
_28=null;
return _22;
}else{
if(_2f===true){
throw new Error(_8);
}else{
return _22;
}
}
};
this.then=_22.then=function(_30,_31,_32){
var _33=[_32,_30,_31];
_33.cancel=_22.cancel;
_33.deferred=new _10(function(_34){
return _33.cancel&&_33.cancel(_34);
});
if(_24&&!_28){
_11(_33,_24,_25,_26);
}else{
_28.push(_33);
}
return _33.deferred.promise;
};
this.cancel=_22.cancel=function(_35,_36){
if(!_24){
if(_21){
var _37=_21(_35);
_35=typeof _37==="undefined"?_35:_37;
}
_27=true;
if(!_24){
if(typeof _35==="undefined"){
_35=new _3();
}
_2d(_35);
return _35;
}else{
if(_24===_7&&_25===_35){
return _35;
}
}
}else{
if(_36===true){
throw new Error(_8);
}
}
};
_9(_22);
};
_10.prototype.toString=function(){
return "[object Deferred]";
};
return _10;
});
