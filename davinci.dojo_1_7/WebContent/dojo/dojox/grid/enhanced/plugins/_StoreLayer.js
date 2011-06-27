/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/_StoreLayer",["dojo","dojox"],function(_1,_2){
var ns=_1.getObject("grid.enhanced.plugins",true,_2);
getPrevTags=function(_3){
var _4=["reorder","sizeChange","normal","presentation"];
var _5=_4.length;
for(var i=_3.length-1;i>=0;--i){
var p=_1.indexOf(_4,_3[i]);
if(p>=0&&p<=_5){
_5=p;
}
}
if(_5<_4.length-1){
return _4.slice(0,_5+1);
}else{
return _4;
}
},unwrap=function(_6){
var i,_7=this._layers,_8=_7.length;
if(_6){
for(i=_8-1;i>=0;--i){
if(_7[i].name()==_6){
_7[i]._unwrap(_7[i+1]);
break;
}
}
_7.splice(i,1);
}else{
for(i=_8-1;i>=0;--i){
_7[i]._unwrap();
}
}
if(!_7.length){
delete this._layers;
delete this.layer;
delete this.unwrap;
delete this.forEachLayer;
}
return this;
},getLayer=function(_9){
var i,_a=this._layers;
if(typeof _9=="undefined"){
return _a.length;
}
if(typeof _9=="number"){
return _a[_9];
}
for(i=_a.length-1;i>=0;--i){
if(_a[i].name()==_9){
return _a[i];
}
}
return null;
},forEachLayer=function(_b,_c){
var _d=this._layers.length,_e,_f,dir;
if(_c){
_e=0;
_f=_d;
dir=1;
}else{
_e=_d-1;
_f=-1;
dir=-1;
}
for(var i=_e;i!=_f;i+=dir){
if(_b(this._layers[i],i)===false){
return i;
}
}
return _f;
};
ns.wrap=function(_10,_11,_12,_13){
if(!_10._layers){
_10._layers=[];
_10.layer=_1.hitch(_10,getLayer);
_10.unwrap=_1.hitch(_10,unwrap);
_10.forEachLayer=_1.hitch(_10,forEachLayer);
}
var _14=getPrevTags(_12.tags);
if(!_1.some(_10._layers,function(lyr,i){
if(_1.some(lyr.tags,function(tag){
return _1.indexOf(_14,tag)>=0;
})){
return false;
}else{
_10._layers.splice(i,0,_12);
_12._wrap(_10,_11,_13,lyr);
return true;
}
})){
_10._layers.push(_12);
_12._wrap(_10,_11,_13);
}
return _10;
};
_1.declare("dojox.grid.enhanced.plugins._StoreLayer",null,{tags:["normal"],layerFuncName:"_fetch",constructor:function(){
this._store=null;
this._originFetch=null;
this.__enabled=true;
},initialize:function(_15){
},uninitialize:function(_16){
},invalidate:function(){
},_wrap:function(_17,_18,_19,_1a){
this._store=_17;
this._funcName=_18;
var _1b=_1.hitch(this,function(){
return (this.enabled()?this[_19||this.layerFuncName]:this.originFetch).apply(this,arguments);
});
if(_1a){
this._originFetch=_1a._originFetch;
_1a._originFetch=_1b;
}else{
this._originFetch=_17[_18]||function(){
};
_17[_18]=_1b;
}
this.initialize(_17);
},_unwrap:function(_1c){
this.uninitialize(this._store);
if(_1c){
_1c._originFetch=this._originFetch;
}else{
this._store[this._funcName]=this._originFetch;
}
this._originFetch=null;
this._store=null;
},enabled:function(_1d){
if(typeof _1d!="undefined"){
this.__enabled=!!_1d;
}
return this.__enabled;
},name:function(){
if(!this.__name){
var m=this.declaredClass.match(/(?:\.(?:_*)([^\.]+)Layer$)|(?:\.([^\.]+)$)/i);
this.__name=m?(m[1]||m[2]).toLowerCase():this.declaredClass;
}
return this.__name;
},originFetch:function(){
return (_1.hitch(this._store,this._originFetch)).apply(this,arguments);
}});
_1.declare("dojox.grid.enhanced.plugins._ServerSideLayer",ns._StoreLayer,{constructor:function(_1e){
_1e=_1e||{};
this._url=_1e.url||"";
this._isStateful=!!_1e.isStateful;
this._onUserCommandLoad=_1e.onCommandLoad||function(){
};
this.__cmds={cmdlayer:this.name(),enable:true};
this.useCommands(this._isStateful);
},enabled:function(_1f){
var res=this.inherited(arguments);
this.__cmds.enable=this.__enabled;
return res;
},useCommands:function(_20){
if(typeof _20!="undefined"){
this.__cmds.cmdlayer=(_20&&this._isStateful)?this.name():null;
}
return !!(this.__cmds.cmdlayer);
},_fetch:function(_21){
if(this.__cmds.cmdlayer){
_1.xhrPost({url:this._url||this._store.url,content:this.__cmds,load:_1.hitch(this,function(_22){
this.onCommandLoad(_22,_21);
this.originFetch(_21);
}),error:_1.hitch(this,this.onCommandError)});
}else{
this.onCommandLoad("",_21);
this.originFetch(_21);
}
return _21;
},command:function(_23,_24){
var _25=this.__cmds;
if(_24===null){
delete _25[_23];
}else{
if(typeof _24!=="undefined"){
_25[_23]=_24;
}
}
return _25[_23];
},onCommandLoad:function(_26,_27){
this._onUserCommandLoad(this.__cmds,_27,_26);
},onCommandError:function(_28){
throw _28;
}});
return _2.grid.enhanced.plugins._StoreLayer;
});
