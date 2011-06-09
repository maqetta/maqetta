/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dojo/on",["./aspect","./_base/kernel","./has"],function(_1,_2,_3){
"use strict";
var _4=_1.after;
if(typeof window!="undefined"){
var _5=window.ScriptEngineMajorVersion;
_3.add("jscript",_5&&(_5()+ScriptEngineMinorVersion()/10));
_3.add("event-orientationchange",_3("touch")&&!_2.isAndroid);
}
var on=function(_6,_7,_8,_9){
if(!_8){
return on(on,_6,_7);
}
if(_6.on){
return _6.on(_7,_8);
}
return _a(_6,_7,_8,_9,this);
};
on.pausable=function(_b,_c,_d,_e){
var _f;
var _10=on(_b,_c,function(){
if(!_f){
return _d.apply(this,arguments);
}
},_e);
_10.pause=function(){
_f=true;
};
_10.resume=function(){
_f=false;
};
return _10;
};
var _11=(on.Evented=function(){
}).prototype;
_11.on=function(_12,_13,_14){
return _a(this,_12,_13,_14,this);
};
var _15=/^touch/;
function _a(_16,_17,_18,_19,_1a){
if(_17.call){
return _17.call(_1a,_16,_18);
}
if(_17.indexOf(",")>-1){
var _1b=_17.split(/\s*,\s*/);
var _1c=[];
var i=0;
var _1d;
while(_1d=_1b[i++]){
_1c.push(_a(_16,_1d,_18,_19,_1a));
}
_1c.remove=function(){
for(var i=0;i<_1c.length;i++){
_1c[i].remove();
}
};
return _1c;
}
var _1e=_17.match(/(.*):(.*)/);
if(_1e){
_17=_1e[2];
_1e=_1e[1];
return on.selector(_1e,_17).call(_1a,_16,_18);
}
if(_3("touch")){
if(_15.test(_17)){
_18=_44(_18);
}
if(!_3("event-orientationchange")&&(_17=="orientationchange")){
_17="resize";
_16=window;
_18=_44(_18);
}
}
if(_16.addEventListener){
var _1f={remove:function(){
_16.removeEventListener(_17,_18,false);
}};
_16.addEventListener(_17,_18,false);
return _1f;
}
_17="on"+_17;
if(_20&&_16.attachEvent){
return _20(_16,_17,_18);
}
return _4(_16,_17,_18,true);
};
on.selector=function(_21,_22){
return function(_23,_24){
var _25=this;
return on(_23,_22,function(_26){
var _27=_26.target;
_25=_25&&_25.matches?_25:_2.query;
while(!_25.matches(_27,_21,_23)){
if(_27==_23||!_27){
return;
}
_27=_27.parentNode;
}
return _24.call(_27,_26);
});
};
};
function _28(){
this.cancelable=false;
};
function _29(){
this.bubbles=false;
};
var _2a=on.emit=function(_2b,_2c,_2d){
var _2e="on"+_2c;
if("parentNode" in _2b){
_2d.preventDefault=_28;
_2d.stopPropagation=_29;
_2d.target=_2b;
_2d.type=_2c;
}
do{
_2b[_2e]&&_2b[_2e].call(_2b,_2d);
}while(_2d.bubbles&&(_2b=_2b.parentNode));
return _2d.cancelable&&_2d;
};
if(_3("dom-addeventlistener")){
on.emit=function(_2f,_30,_31){
if(_2f.dispatchEvent&&document.createEvent){
var _32=document.createEvent("HTMLEvents");
_32.initEvent(_30,!!_31.bubbles,!!_31.cancelable);
for(var i in _31){
var _33=_31[i];
if(_33!==_32[i]){
try{
_32[i]=_31[i];
}
catch(e){
}
}
}
return _2f.dispatchEvent(_32)&&_32;
}
return _2a(_2f,_30,_31);
};
}else{
on._fixEvent=function(evt,_34){
if(!evt){
var w=_34&&(_34.ownerDocument||_34.document||_34).parentWindow||window;
evt=w.event;
}
if(!evt){
return (evt);
}
if(!evt.target){
evt.target=evt.srcElement;
evt.currentTarget=(_34||evt.srcElement);
evt.layerX=evt.offsetX;
evt.layerY=evt.offsetY;
if(evt.type=="mouseover"){
evt.relatedTarget=evt.fromElement;
}
if(evt.type=="mouseout"){
evt.relatedTarget=evt.toElement;
}
if(!evt.stopPropagation){
evt.stopPropagation=_35;
evt.preventDefault=_36;
}
switch(evt.type){
case "keypress":
var c=("charCode" in evt?evt.charCode:evt.keyCode);
if(c==10){
c=0;
evt.keyCode=13;
}else{
if(c==13||c==27){
c=0;
}else{
if(c==3){
c=99;
}
}
}
evt.charCode=c;
_37(evt);
break;
}
}
return evt;
};
var _38=function(_39){
this.handle=_39;
};
_38.prototype.remove=function(){
delete _dojoIEListeners_[this.handle];
};
var _3a=function(_3b){
return function(evt){
evt=on._fixEvent(evt,this);
return _3b.call(this,evt);
};
};
var _20=function(_3c,_3d,_3e){
_3e=_3a(_3e);
if(((_3c.ownerDocument?_3c.ownerDocument.parentWindow:_3c.parentWindow||_3c.window||window)!=top||_3("jscript")<5.8)&&!_3("config-_allow_leaks")){
if(typeof _dojoIEListeners_=="undefined"){
_dojoIEListeners_=[];
}
var _3f=_3c[_3d];
if(!_3f||!_3f.listeners){
var _40=_3f;
_3c[_3d]=_3f=Function("event","var callee = arguments.callee; for(var i = 0; i<callee.listeners.length; i++){var listener = _dojoIEListeners_[callee.listeners[i]]; if(listener){listener.call(this,event);}}");
_3f.listeners=[];
if(_40){
_3f.listeners.push(_dojoIEListeners_.push(_40)-1);
}
}
var _41;
_3f.listeners.push(_41=(_dojoIEListeners_.push(_3e)-1));
return new _38(_41);
}
return _4(_3c,_3d,_3e,true);
};
var _37=function(evt){
evt.keyChar=evt.charCode?String.fromCharCode(evt.charCode):"";
evt.charOrCode=evt.keyChar||evt.keyCode;
};
var _35=function(){
this.cancelBubble=true;
};
var _36=on._preventDefault=function(){
this.bubbledKeyCode=this.keyCode;
if(this.ctrlKey){
try{
this.keyCode=0;
}
catch(e){
}
}
this.returnValue=false;
};
}
if(_3("touch")){
var _42=window.orientation;
var _43=function(){
};
var _44=function(_45){
return function(_46){
var _47=_46.corrected;
if(!_47){
var _48=_46.type;
delete _46.type;
if(_46.type){
_43.prototype=_46;
var _47=new _43;
_47.preventDefault=function(){
_46.preventDefault();
};
_47.stopPropagation=function(){
_46.stopPropagation();
};
}else{
_47=_46;
_47.type=_48;
}
_46.corrected=_47;
if(_48=="resize"){
if(_42==window.orientation){
return null;
}
_42=window.orientation;
_47.type="orientationchange";
return _45.call(this,_47);
}
if(!("rotation" in _47)){
_47.rotation=0;
_47.scale=1;
}
var _49=_47.changedTouches[0];
for(var i in _49){
delete _47[i];
_47[i]=_49[i];
}
}
return _45.call(this,_47);
};
};
}
on.publish=_11.emit=function(_4a,_4b){
_4a="on"+_4a;
this[_4a]&&this[_4a](_4b);
};
return on;
});
