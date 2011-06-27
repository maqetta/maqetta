/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/typematic",["dojo/_base/kernel",".","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/_base/lang","dojo/_base/sniff"],function(_1,_2){
_2.typematic={_fireEventAndReload:function(){
this._timer=null;
this._callback(++this._count,this._node,this._evt);
this._currentTimeout=Math.max(this._currentTimeout<0?this._initialDelay:(this._subsequentDelay>1?this._subsequentDelay:Math.round(this._currentTimeout*this._subsequentDelay)),this._minDelay);
this._timer=setTimeout(_1.hitch(this,"_fireEventAndReload"),this._currentTimeout);
},trigger:function(_3,_4,_5,_6,_7,_8,_9,_a){
if(_7!=this._obj){
this.stop();
this._initialDelay=_9||500;
this._subsequentDelay=_8||0.9;
this._minDelay=_a||10;
this._obj=_7;
this._evt=_3;
this._node=_5;
this._currentTimeout=-1;
this._count=-1;
this._callback=_1.hitch(_4,_6);
this._fireEventAndReload();
this._evt=_1.mixin({faux:true},_3);
}
},stop:function(){
if(this._timer){
clearTimeout(this._timer);
this._timer=null;
}
if(this._obj){
this._callback(-1,this._node,this._evt);
this._obj=null;
}
},addKeyListener:function(_b,_c,_d,_e,_f,_10,_11){
if(_c.keyCode){
_c.charOrCode=_c.keyCode;
_1.deprecated("keyCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.","","2.0");
}else{
if(_c.charCode){
_c.charOrCode=String.fromCharCode(_c.charCode);
_1.deprecated("charCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.","","2.0");
}
}
var _12=[_1.connect(_b,"onkeypress",this,function(evt){
if(evt.charOrCode==_c.charOrCode&&(_c.ctrlKey===undefined||_c.ctrlKey==evt.ctrlKey)&&(_c.altKey===undefined||_c.altKey==evt.altKey)&&(_c.metaKey===undefined||_c.metaKey==(evt.metaKey||false))&&(_c.shiftKey===undefined||_c.shiftKey==evt.shiftKey)){
_1.stopEvent(evt);
_2.typematic.trigger(evt,_d,_b,_e,_c,_f,_10,_11);
}else{
if(_2.typematic._obj==_c){
_2.typematic.stop();
}
}
}),_1.connect(_b,"onkeyup",this,function(evt){
if(_2.typematic._obj==_c){
_2.typematic.stop();
}
})];
return {remove:function(){
_1.forEach(_12,function(h){
h.remove();
});
}};
},addMouseListener:function(_13,_14,_15,_16,_17,_18){
var dc=_1.connect;
var _19=[dc(_13,"mousedown",this,function(evt){
_1.stopEvent(evt);
_2.typematic.trigger(evt,_14,_13,_15,_13,_16,_17,_18);
}),dc(_13,"mouseup",this,function(evt){
_1.stopEvent(evt);
_2.typematic.stop();
}),dc(_13,"mouseout",this,function(evt){
_1.stopEvent(evt);
_2.typematic.stop();
}),dc(_13,"mousemove",this,function(evt){
evt.preventDefault();
}),dc(_13,"dblclick",this,function(evt){
_1.stopEvent(evt);
if(_1.isIE){
_2.typematic.trigger(evt,_14,_13,_15,_13,_16,_17,_18);
setTimeout(_1.hitch(this,_2.typematic.stop),50);
}
})];
return {remove:function(){
_1.forEach(_19,function(h){
h.remove();
});
}};
},addListener:function(_1a,_1b,_1c,_1d,_1e,_1f,_20,_21){
var _22=[this.addKeyListener(_1b,_1c,_1d,_1e,_1f,_20,_21),this.addMouseListener(_1a,_1d,_1e,_1f,_20,_21)];
return {remove:function(){
_1.forEach(_22,function(h){
h.remove();
});
}};
}};
return _2.typematic;
});
