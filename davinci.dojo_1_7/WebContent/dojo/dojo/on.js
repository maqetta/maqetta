/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
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
on.once=function(_11,_12,_13,_14){
var _15=on(_11,_12,function(){
_15.remove();
return _13.apply(this,arguments);
});
return _15;
};
var _16=(on.Evented=function(){
}).prototype;
_16.on=function(_17,_18,_19){
return _a(this,_17,_18,_19,this);
};
var _1a=/^touch/;
function _a(_1b,_1c,_1d,_1e,_1f){
if(_1c.call){
return _1c.call(_1f,_1b,_1d);
}
if(_1c.indexOf(",")>-1){
var _20=_1c.split(/\s*,\s*/);
var _21=[];
var i=0;
var _22;
while(_22=_20[i++]){
_21.push(_a(_1b,_22,_1d,_1e,_1f));
}
_21.remove=function(){
for(var i=0;i<_21.length;i++){
_21[i].remove();
}
};
return _21;
}
var _23=_1c.match(/(.*):(.*)/);
if(_23){
_1c=_23[2];
_23=_23[1];
return on.selector(_23,_1c).call(_1f,_1b,_1d);
}
if(_3("touch")){
if(_1a.test(_1c)){
_1d=_49(_1d);
}
if(!_3("event-orientationchange")&&(_1c=="orientationchange")){
_1c="resize";
_1b=window;
_1d=_49(_1d);
}
}
if(_1b.addEventListener){
var _24={remove:function(){
_1b.removeEventListener(_1c,_1d,false);
}};
_1b.addEventListener(_1c,_1d,false);
return _24;
}
_1c="on"+_1c;
if(_25&&_1b.attachEvent){
return _25(_1b,_1c,_1d);
}
return _4(_1b,_1c,_1d,true);
};
on.selector=function(_26,_27){
return function(_28,_29){
var _2a=this;
return on(_28,_27,function(_2b){
var _2c=_2b.target;
_2a=_2a&&_2a.matches?_2a:_2.query;
while(!_2a.matches(_2c,_26,_28)){
if(_2c==_28||!(_2c=_2c.parentNode)){
return;
}
}
return _29.call(_2c,_2b);
});
};
};
function _2d(){
this.cancelable=false;
};
function _2e(){
this.bubbles=false;
};
var _2f=on.emit=function(_30,_31,_32){
var _33="on"+_31;
if("parentNode" in _30){
_32.preventDefault=_2d;
_32.stopPropagation=_2e;
_32.target=_30;
_32.type=_31;
}
do{
_30[_33]&&_30[_33].call(_30,_32);
}while(_32.bubbles&&(_30=_30.parentNode));
return _32.cancelable&&_32;
};
if(_3("dom-addeventlistener")){
on.emit=function(_34,_35,_36){
if(_34.dispatchEvent&&document.createEvent){
var _37=document.createEvent("HTMLEvents");
_37.initEvent(_35,!!_36.bubbles,!!_36.cancelable);
for(var i in _36){
var _38=_36[i];
if(_38!==_37[i]){
try{
_37[i]=_36[i];
}
catch(e){
}
}
}
return _34.dispatchEvent(_37)&&_37;
}
return _2f(_34,_35,_36);
};
}else{
on._fixEvent=function(evt,_39){
if(!evt){
var w=_39&&(_39.ownerDocument||_39.document||_39).parentWindow||window;
evt=w.event;
}
if(!evt){
return (evt);
}
if(!evt.target){
evt.target=evt.srcElement;
evt.currentTarget=(_39||evt.srcElement);
evt.layerX=evt.offsetX;
evt.layerY=evt.offsetY;
if(evt.type=="mouseover"){
evt.relatedTarget=evt.fromElement;
}
if(evt.type=="mouseout"){
evt.relatedTarget=evt.toElement;
}
if(!evt.stopPropagation){
evt.stopPropagation=_3a;
evt.preventDefault=_3b;
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
_3c(evt);
break;
}
}
return evt;
};
var _3d=function(_3e){
this.handle=_3e;
};
_3d.prototype.remove=function(){
delete _dojoIEListeners_[this.handle];
};
var _3f=function(_40){
return function(evt){
evt=on._fixEvent(evt,this);
return _40.call(this,evt);
};
};
var _25=function(_41,_42,_43){
_43=_3f(_43);
if(((_41.ownerDocument?_41.ownerDocument.parentWindow:_41.parentWindow||_41.window||window)!=top||_3("jscript")<5.8)&&!_3("config-_allow_leaks")){
if(typeof _dojoIEListeners_=="undefined"){
_dojoIEListeners_=[];
}
var _44=_41[_42];
if(!_44||!_44.listeners){
var _45=_44;
_41[_42]=_44=Function("event","var callee = arguments.callee; for(var i = 0; i<callee.listeners.length; i++){var listener = _dojoIEListeners_[callee.listeners[i]]; if(listener){listener.call(this,event);}}");
_44.listeners=[];
if(_45){
_44.listeners.push(_dojoIEListeners_.push(_45)-1);
}
}
var _46;
_44.listeners.push(_46=(_dojoIEListeners_.push(_43)-1));
return new _3d(_46);
}
return _4(_41,_42,_43,true);
};
var _3c=function(evt){
evt.keyChar=evt.charCode?String.fromCharCode(evt.charCode):"";
evt.charOrCode=evt.keyChar||evt.keyCode;
};
var _3a=function(){
this.cancelBubble=true;
};
var _3b=on._preventDefault=function(){
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
var _47=window.orientation;
var _48=function(){
};
var _49=function(_4a){
return function(_4b){
var _4c=_4b.corrected;
if(!_4c){
var _4d=_4b.type;
delete _4b.type;
if(_4b.type){
_48.prototype=_4b;
var _4c=new _48;
_4c.preventDefault=function(){
_4b.preventDefault();
};
_4c.stopPropagation=function(){
_4b.stopPropagation();
};
}else{
_4c=_4b;
_4c.type=_4d;
}
_4b.corrected=_4c;
if(_4d=="resize"){
if(_47==window.orientation){
return null;
}
_47=window.orientation;
_4c.type="orientationchange";
return _4a.call(this,_4c);
}
if(!("rotation" in _4c)){
_4c.rotation=0;
_4c.scale=1;
}
var _4e=_4c.changedTouches[0];
for(var i in _4e){
delete _4c[i];
_4c[i]=_4e[i];
}
}
return _4a.call(this,_4c);
};
};
}
on.publish=_16.emit=function(_4f,_50){
_4f="on"+_4f;
this[_4f]&&this[_4f](_50);
};
return on;
});
