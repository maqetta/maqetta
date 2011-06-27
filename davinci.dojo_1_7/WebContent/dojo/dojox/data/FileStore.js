/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/FileStore",["dojo","dojox"],function(_1,_2){
_1.declare("dojox.data.FileStore",null,{constructor:function(_3){
if(_3&&_3.label){
this.label=_3.label;
}
if(_3&&_3.url){
this.url=_3.url;
}
if(_3&&_3.options){
if(_1.isArray(_3.options)){
this.options=_3.options;
}else{
if(_1.isString(_3.options)){
this.options=_3.options.split(",");
}
}
}
if(_3&&_3.pathAsQueryParam){
this.pathAsQueryParam=true;
}
if(_3&&"urlPreventCache" in _3){
this.urlPreventCache=_3.urlPreventCache?true:false;
}
},url:"",_storeRef:"_S",label:"name",_identifier:"path",_attributes:["children","directory","name","path","modified","size","parentDir"],pathSeparator:"/",options:[],failOk:false,urlPreventCache:true,_assertIsItem:function(_4){
if(!this.isItem(_4)){
throw new Error("dojox.data.FileStore: a function was passed an item argument that was not an item");
}
},_assertIsAttribute:function(_5){
if(typeof _5!=="string"){
throw new Error("dojox.data.FileStore: a function was passed an attribute argument that was not an attribute name string");
}
},pathAsQueryParam:false,getFeatures:function(){
return {"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
},getValue:function(_6,_7,_8){
var _9=this.getValues(_6,_7);
if(_9&&_9.length>0){
return _9[0];
}
return _8;
},getAttributes:function(_a){
return this._attributes;
},hasAttribute:function(_b,_c){
this._assertIsItem(_b);
this._assertIsAttribute(_c);
return (_c in _b);
},getIdentity:function(_d){
return this.getValue(_d,this._identifier);
},getIdentityAttributes:function(_e){
return [this._identifier];
},isItemLoaded:function(_f){
var _10=this.isItem(_f);
if(_10&&typeof _f._loaded=="boolean"&&!_f._loaded){
_10=false;
}
return _10;
},loadItem:function(_11){
var _12=_11.item;
var _13=this;
var _14=_11.scope||_1.global;
var _15={};
if(this.options.length>0){
_15.options=_1.toJson(this.options);
}
if(this.pathAsQueryParam){
_15.path=_12.parentPath+this.pathSeparator+_12.name;
}
var _16={url:this.pathAsQueryParam?this.url:this.url+"/"+_12.parentPath+"/"+_12.name,handleAs:"json-comment-optional",content:_15,preventCache:this.urlPreventCache,failOk:this.failOk};
var _17=_1.xhrGet(_16);
_17.addErrback(function(_18){
if(_11.onError){
_11.onError.call(_14,_18);
}
});
_17.addCallback(function(_19){
delete _12.parentPath;
delete _12._loaded;
_1.mixin(_12,_19);
_13._processItem(_12);
if(_11.onItem){
_11.onItem.call(_14,_12);
}
});
},getLabel:function(_1a){
return this.getValue(_1a,this.label);
},getLabelAttributes:function(_1b){
return [this.label];
},containsValue:function(_1c,_1d,_1e){
var _1f=this.getValues(_1c,_1d);
for(var i=0;i<_1f.length;i++){
if(_1f[i]==_1e){
return true;
}
}
return false;
},getValues:function(_20,_21){
this._assertIsItem(_20);
this._assertIsAttribute(_21);
var _22=_20[_21];
if(typeof _22!=="undefined"&&!_1.isArray(_22)){
_22=[_22];
}else{
if(typeof _22==="undefined"){
_22=[];
}
}
return _22;
},isItem:function(_23){
if(_23&&_23[this._storeRef]===this){
return true;
}
return false;
},close:function(_24){
},fetch:function(_25){
_25=_25||{};
if(!_25.store){
_25.store=this;
}
var _26=this;
var _27=_25.scope||_1.global;
var _28={};
if(_25.query){
_28.query=_1.toJson(_25.query);
}
if(_25.sort){
_28.sort=_1.toJson(_25.sort);
}
if(_25.queryOptions){
_28.queryOptions=_1.toJson(_25.queryOptions);
}
if(typeof _25.start=="number"){
_28.start=""+_25.start;
}
if(typeof _25.count=="number"){
_28.count=""+_25.count;
}
if(this.options.length>0){
_28.options=_1.toJson(this.options);
}
var _29={url:this.url,preventCache:this.urlPreventCache,failOk:this.failOk,handleAs:"json-comment-optional",content:_28};
var _2a=_1.xhrGet(_29);
_2a.addCallback(function(_2b){
_26._processResult(_2b,_25);
});
_2a.addErrback(function(_2c){
if(_25.onError){
_25.onError.call(_27,_2c,_25);
}
});
},fetchItemByIdentity:function(_2d){
var _2e=_2d.identity;
var _2f=this;
var _30=_2d.scope||_1.global;
var _31={};
if(this.options.length>0){
_31.options=_1.toJson(this.options);
}
if(this.pathAsQueryParam){
_31.path=_2e;
}
var _32={url:this.pathAsQueryParam?this.url:this.url+"/"+_2e,handleAs:"json-comment-optional",content:_31,preventCache:this.urlPreventCache,failOk:this.failOk};
var _33=_1.xhrGet(_32);
_33.addErrback(function(_34){
if(_2d.onError){
_2d.onError.call(_30,_34);
}
});
_33.addCallback(function(_35){
var _36=_2f._processItem(_35);
if(_2d.onItem){
_2d.onItem.call(_30,_36);
}
});
},_processResult:function(_37,_38){
var _39=_38.scope||_1.global;
try{
if(_37.pathSeparator){
this.pathSeparator=_37.pathSeparator;
}
if(_38.onBegin){
_38.onBegin.call(_39,_37.total,_38);
}
var _3a=this._processItemArray(_37.items);
if(_38.onItem){
var i;
for(i=0;i<_3a.length;i++){
_38.onItem.call(_39,_3a[i],_38);
}
_3a=null;
}
if(_38.onComplete){
_38.onComplete.call(_39,_3a,_38);
}
}
catch(e){
if(_38.onError){
_38.onError.call(_39,e,_38);
}else{
}
}
},_processItemArray:function(_3b){
var i;
for(i=0;i<_3b.length;i++){
this._processItem(_3b[i]);
}
return _3b;
},_processItem:function(_3c){
if(!_3c){
return null;
}
_3c[this._storeRef]=this;
if(_3c.children&&_3c.directory){
if(_1.isArray(_3c.children)){
var _3d=_3c.children;
var i;
for(i=0;i<_3d.length;i++){
var _3e=_3d[i];
if(_1.isObject(_3e)){
_3d[i]=this._processItem(_3e);
}else{
_3d[i]={name:_3e,_loaded:false,parentPath:_3c.path};
_3d[i][this._storeRef]=this;
}
}
}else{
delete _3c.children;
}
}
return _3c;
}});
return _2.data.FileStore;
});
