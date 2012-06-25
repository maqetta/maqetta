/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/Deferred",["./kernel","../Deferred","../promise/Promise","../has","./lang","../when"],function(_1,_2,_3,_4,_5,_6){
var _7=function(){
};
var _8=Object.freeze||function(){
};
var _9=_1.Deferred=function(_a){
var _b,_c,_d,_e,_f;
var _10=(this.promise=new _3());
function _11(_12){
if(_c){
throw new Error("This deferred has already been resolved");
}
_b=_12;
_c=true;
_13();
};
function _13(){
var _14;
while(!_14&&_f){
var _15=_f;
_f=_f.next;
if((_14=(_15.progress==_7))){
_c=false;
}
var _16=(_d?_15.error:_15.resolved);
if(0){
if(_d&&_2.instrumentRejected){
_2.instrumentRejected(_b,!!_16);
}
}
if(_16){
try{
var _17=_16(_b);
if(_17&&typeof _17.then==="function"){
_17.then(_5.hitch(_15.deferred,"resolve"),_5.hitch(_15.deferred,"reject"),_5.hitch(_15.deferred,"progress"));
continue;
}
var _18=_14&&_17===undefined;
if(_14&&!_18){
_d=_17 instanceof Error;
}
_15.deferred[_18&&_d?"reject":"resolve"](_18?_b:_17);
}
catch(e){
_15.deferred.reject(e);
}
}else{
if(_d){
_15.deferred.reject(_b);
}else{
_15.deferred.resolve(_b);
}
}
}
};
this.resolve=this.callback=function(_19){
this.fired=0;
this.results=[_19,null];
_11(_19);
};
this.reject=this.errback=function(_1a){
_d=true;
this.fired=1;
if(0){
if(_2.instrumentRejected&&!_f){
_2.instrumentRejected(_1a,false);
}
}
_11(_1a);
this.results=[null,_1a];
};
this.progress=function(_1b){
var _1c=_f;
while(_1c){
var _1d=_1c.progress;
_1d&&_1d(_1b);
_1c=_1c.next;
}
};
this.addCallbacks=function(_1e,_1f){
this.then(_1e,_1f,_7);
return this;
};
_10.then=this.then=function(_20,_21,_22){
var _23=_22==_7?this:new _9(_10.cancel);
var _24={resolved:_20,error:_21,progress:_22,deferred:_23};
if(_f){
_e=_e.next=_24;
}else{
_f=_e=_24;
}
if(_c){
_13();
}
return _23.promise;
};
var _25=this;
_10.cancel=this.cancel=function(){
if(!_c){
var _26=_a&&_a(_25);
if(!_c){
if(!(_26 instanceof Error)){
_26=new Error(_26);
}
_26.log=false;
_25.reject(_26);
}
}
};
_8(_10);
};
_5.extend(_9,{addCallback:function(_27){
return this.addCallbacks(_5.hitch.apply(_1,arguments));
},addErrback:function(_28){
return this.addCallbacks(null,_5.hitch.apply(_1,arguments));
},addBoth:function(_29){
var _2a=_5.hitch.apply(_1,arguments);
return this.addCallbacks(_2a,_2a);
},fired:-1});
_9.when=_1.when=_6;
return _9;
});
