/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/Deferred",["./kernel","./lang"],function(_1){
var _2=function(){
};
var _3=Object.freeze||function(){
};
_1.Deferred=function(_4){
var _5,_6,_7,_8,_9;
var _a=(this.promise={});
function _b(_c){
if(_6){
throw new Error("This deferred has already been resolved");
}
_5=_c;
_6=true;
_d();
};
function _d(){
var _e;
while(!_e&&_9){
var _f=_9;
_9=_9.next;
if((_e=(_f.progress==_2))){
_6=false;
}
var _10=(_7?_f.error:_f.resolved);
if(_10){
try{
var _11=_10(_5);
if(_11&&typeof _11.then==="function"){
_11.then(_1.hitch(_f.deferred,"resolve"),_1.hitch(_f.deferred,"reject"));
continue;
}
var _12=_e&&_11===undefined;
if(_e&&!_12){
_7=_11 instanceof Error;
}
_f.deferred[_12&&_7?"reject":"resolve"](_12?_5:_11);
}
catch(e){
_f.deferred.reject(e);
}
}else{
if(_7){
_f.deferred.reject(_5);
}else{
_f.deferred.resolve(_5);
}
}
}
};
this.resolve=this.callback=function(_13){
this.fired=0;
this.results=[_13,null];
_b(_13);
};
this.reject=this.errback=function(_14){
_7=true;
this.fired=1;
_b(_14);
this.results=[null,_14];
if(!_14||_14.log!==false){
(_1.config.deferredOnError||function(x){
console.error(x);
})(_14);
}
};
this.progress=function(_15){
var _16=_9;
while(_16){
var _17=_16.progress;
_17&&_17(_15);
_16=_16.next;
}
};
this.addCallbacks=function(_18,_19){
this.then(_18,_19,_2);
return this;
};
this.then=_a.then=function(_1a,_1b,_1c){
var _1d=_1c==_2?this:new _1.Deferred(_a.cancel);
var _1e={resolved:_1a,error:_1b,progress:_1c,deferred:_1d};
if(_9){
_8=_8.next=_1e;
}else{
_9=_8=_1e;
}
if(_6){
_d();
}
return _1d.promise;
};
var _1f=this;
this.cancel=_a.cancel=function(){
if(!_6){
var _20=_4&&_4(_1f);
if(!_6){
if(!(_20 instanceof Error)){
_20=new Error(_20);
}
_20.log=false;
_1f.reject(_20);
}
}
};
_3(_a);
};
_1.extend(_1.Deferred,{addCallback:function(_21){
return this.addCallbacks(_1.hitch.apply(_1,arguments));
},addErrback:function(_22){
return this.addCallbacks(null,_1.hitch.apply(_1,arguments));
},addBoth:function(_23){
var _24=_1.hitch.apply(_1,arguments);
return this.addCallbacks(_24,_24);
},fired:-1});
_1.Deferred.when=_1.when=function(_25,_26,_27,_28){
if(_25&&typeof _25.then==="function"){
return _25.then(_26,_27,_28);
}
return _26(_25);
};
return _1.Deferred;
});
