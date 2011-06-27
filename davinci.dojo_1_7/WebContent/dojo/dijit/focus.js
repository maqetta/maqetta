/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/focus",["dojo/_base/kernel",".","dojo/on","dojo/aspect","dojo/Stateful","dojo/window","./_base/manager","dojo/_base/declare","dojo/_base/html","dojo/_base/lang","dojo/ready","dojo/_base/sniff","dojo/_base/unload","dojo/_base/window","dijit/_base/manager"],function(_1,_2,on,_3,_4){
var _5=_1.declare([_4,on.Evented],{curNode:null,activeStack:[],constructor:function(){
var _6=_1.hitch(this,function(_7){
if(_1.isDescendant(this.curNode,_7)){
this.set("curNode",null);
}
if(_1.isDescendant(this.prevNode,_7)){
this.set("prevNode",null);
}
});
_3.before(_1,"empty",_6);
_3.before(_1,"destroy",_6);
},registerIframe:function(_8){
return this.registerWin(_8.contentWindow,_8);
},unregisterIframe:function(_9){
this.unregisterWin(_9);
},registerWin:function(_a,_b){
var _c=this;
var _d=function(_e){
_c._justMouseDowned=true;
setTimeout(function(){
_c._justMouseDowned=false;
},0);
if(_1.isIE&&_e&&_e.srcElement&&_e.srcElement.parentNode==null){
return;
}
_c._onTouchNode(_b||_e.target||_e.srcElement,"mouse");
};
var _f=_1.isIE?_a.document.documentElement:_a.document;
if(_f){
if(_1.isIE){
_a.document.body.attachEvent("onmousedown",_d);
var _10=function(evt){
var tag=evt.srcElement.tagName.toLowerCase();
if(tag=="#document"||tag=="body"){
return;
}
if(_2.isTabNavigable(evt.srcElement)){
_c._onFocusNode(_b||evt.srcElement);
}else{
_c._onTouchNode(_b||evt.srcElement);
}
};
_f.attachEvent("onactivate",_10);
var _11=function(evt){
_c._onBlurNode(_b||evt.srcElement);
};
_f.attachEvent("ondeactivate",_11);
return function(){
_a.document.detachEvent("onmousedown",_d);
_f.detachEvent("onactivate",_10);
_f.detachEvent("ondeactivate",_11);
_f=null;
};
}else{
_f.body.addEventListener("mousedown",_d,true);
_f.body.addEventListener("touchstart",_d,true);
var _12=function(evt){
_c._onFocusNode(_b||evt.target);
};
_f.addEventListener("focus",_12,true);
var _13=function(evt){
_c._onBlurNode(_b||evt.target);
};
_f.addEventListener("blur",_13,true);
return function(){
_f.body.removeEventListener("mousedown",_d,true);
_f.body.removeEventListener("touchstart",_d,true);
_f.removeEventListener("focus",_12,true);
_f.removeEventListener("blur",_13,true);
_f=null;
};
}
}
},unregisterWin:function(_14){
_14&&_14();
},_onBlurNode:function(_15){
this.set("prevNode",this.curNode);
this.set("curNode",null);
if(this._justMouseDowned){
return;
}
if(this._clearActiveWidgetsTimer){
clearTimeout(this._clearActiveWidgetsTimer);
}
this._clearActiveWidgetsTimer=setTimeout(_1.hitch(this,function(){
delete this._clearActiveWidgetsTimer;
this._setStack([]);
this.prevNode=null;
}),100);
},_onTouchNode:function(_16,by){
if(this._clearActiveWidgetsTimer){
clearTimeout(this._clearActiveWidgetsTimer);
delete this._clearActiveWidgetsTimer;
}
var _17=[];
try{
while(_16){
var _18=_1.attr(_16,"dijitPopupParent");
if(_18){
_16=_2.byId(_18).domNode;
}else{
if(_16.tagName&&_16.tagName.toLowerCase()=="body"){
if(_16===_1.body()){
break;
}
_16=_1.window.get(_16.ownerDocument).frameElement;
}else{
var id=_16.getAttribute&&_16.getAttribute("widgetId"),_19=id&&_2.byId(id);
if(_19&&!(by=="mouse"&&_19.get("disabled"))){
_17.unshift(id);
}
_16=_16.parentNode;
}
}
}
}
catch(e){
}
this._setStack(_17,by);
},_onFocusNode:function(_1a){
if(!_1a){
return;
}
if(_1a.nodeType==9){
return;
}
this._onTouchNode(_1a);
if(_1a==this.curNode){
return;
}
this.set("curNode",_1a);
},_setStack:function(_1b,by){
var _1c=this.activeStack;
this.set("activeStack",_1b);
for(var _1d=0;_1d<Math.min(_1c.length,_1b.length);_1d++){
if(_1c[_1d]!=_1b[_1d]){
break;
}
}
var _1e;
for(var i=_1c.length-1;i>=_1d;i--){
_1e=_2.byId(_1c[i]);
if(_1e){
_1e._hasBeenBlurred=true;
_1e.set("focused",false);
if(_1e._focusManager==this){
_1e._onBlur(by);
}
this.emit("widget-blur",_1e,by);
}
}
for(i=_1d;i<_1b.length;i++){
_1e=_2.byId(_1b[i]);
if(_1e){
_1e.set("focused",true);
if(_1e._focusManager==this){
_1e._onFocus(by);
}
this.emit("widget-focus",_1e,by);
}
}
},focus:function(_1f){
if(_1f){
try{
_1f.focus();
}
catch(e){
}
}
}});
var _20=new _5();
_1.addOnLoad(function(){
var _21=_20.registerWin(_1.global);
if(_1.isIE){
_1.addOnWindowUnload(function(){
_20.unregisterWin(_21);
_21=null;
});
}
});
_2.focus=function(_22){
_20.focus(_22);
};
for(var _23 in _20){
if(!/^_/.test(_23)){
_2.focus[_23]=typeof _20[_23]=="function"?_1.hitch(_20,_23):_20[_23];
}
}
_20.watch(function(_24,_25,_26){
_2.focus[_24]=_26;
});
return _20;
});
