/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/KeyValueStore",["dojo","dojox","dojo/data/util/simpleFetch","dojo/data/util/filter"],function(_1,_2){
_1.declare("dojox.data.KeyValueStore",null,{constructor:function(_3){
if(_3.url){
this.url=_3.url;
}
this._keyValueString=_3.data;
this._keyValueVar=_3.dataVar;
this._keyAttribute="key";
this._valueAttribute="value";
this._storeProp="_keyValueStore";
this._features={"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
this._loadInProgress=false;
this._queuedFetches=[];
if(_3&&"urlPreventCache" in _3){
this.urlPreventCache=_3.urlPreventCache?true:false;
}
},url:"",data:"",urlPreventCache:false,_assertIsItem:function(_4){
if(!this.isItem(_4)){
throw new Error("dojox.data.KeyValueStore: a function was passed an item argument that was not an item");
}
},_assertIsAttribute:function(_5,_6){
if(!_1.isString(_6)){
throw new Error("dojox.data.KeyValueStore: a function was passed an attribute argument that was not an attribute object nor an attribute name string");
}
},getValue:function(_7,_8,_9){
this._assertIsItem(_7);
this._assertIsAttribute(_7,_8);
var _a;
if(_8==this._keyAttribute){
_a=_7[this._keyAttribute];
}else{
_a=_7[this._valueAttribute];
}
if(_a===undefined){
_a=_9;
}
return _a;
},getValues:function(_b,_c){
var _d=this.getValue(_b,_c);
return (_d?[_d]:[]);
},getAttributes:function(_e){
return [this._keyAttribute,this._valueAttribute,_e[this._keyAttribute]];
},hasAttribute:function(_f,_10){
this._assertIsItem(_f);
this._assertIsAttribute(_f,_10);
return (_10==this._keyAttribute||_10==this._valueAttribute||_10==_f[this._keyAttribute]);
},containsValue:function(_11,_12,_13){
var _14=undefined;
if(typeof _13==="string"){
_14=_1.data.util.filter.patternToRegExp(_13,false);
}
return this._containsValue(_11,_12,_13,_14);
},_containsValue:function(_15,_16,_17,_18){
var _19=this.getValues(_15,_16);
for(var i=0;i<_19.length;++i){
var _1a=_19[i];
if(typeof _1a==="string"&&_18){
return (_1a.match(_18)!==null);
}else{
if(_17===_1a){
return true;
}
}
}
return false;
},isItem:function(_1b){
if(_1b&&_1b[this._storeProp]===this){
return true;
}
return false;
},isItemLoaded:function(_1c){
return this.isItem(_1c);
},loadItem:function(_1d){
},getFeatures:function(){
return this._features;
},close:function(_1e){
},getLabel:function(_1f){
return _1f[this._keyAttribute];
},getLabelAttributes:function(_20){
return [this._keyAttribute];
},_fetchItems:function(_21,_22,_23){
var _24=this;
var _25=function(_26,_27){
var _28=null;
if(_26.query){
_28=[];
var _29=_26.queryOptions?_26.queryOptions.ignoreCase:false;
var _2a={};
for(var key in _26.query){
var _2b=_26.query[key];
if(typeof _2b==="string"){
_2a[key]=_1.data.util.filter.patternToRegExp(_2b,_29);
}
}
for(var i=0;i<_27.length;++i){
var _2c=true;
var _2d=_27[i];
for(var key in _26.query){
var _2b=_26.query[key];
if(!_24._containsValue(_2d,key,_2b,_2a[key])){
_2c=false;
}
}
if(_2c){
_28.push(_2d);
}
}
}else{
if(_26.identity){
_28=[];
var _2e;
for(var key in _27){
_2e=_27[key];
if(_2e[_24._keyAttribute]==_26.identity){
_28.push(_2e);
break;
}
}
}else{
if(_27.length>0){
_28=_27.slice(0,_27.length);
}
}
}
_22(_28,_26);
};
if(this._loadFinished){
_25(_21,this._arrayOfAllItems);
}else{
if(this.url!==""){
if(this._loadInProgress){
this._queuedFetches.push({args:_21,filter:_25});
}else{
this._loadInProgress=true;
var _2f={url:_24.url,handleAs:"json-comment-filtered",preventCache:this.urlPreventCache};
var _30=_1.xhrGet(_2f);
_30.addCallback(function(_31){
_24._processData(_31);
_25(_21,_24._arrayOfAllItems);
_24._handleQueuedFetches();
});
_30.addErrback(function(_32){
_24._loadInProgress=false;
throw _32;
});
}
}else{
if(this._keyValueString){
this._processData(eval(this._keyValueString));
this._keyValueString=null;
_25(_21,this._arrayOfAllItems);
}else{
if(this._keyValueVar){
this._processData(this._keyValueVar);
this._keyValueVar=null;
_25(_21,this._arrayOfAllItems);
}else{
throw new Error("dojox.data.KeyValueStore: No source data was provided as either URL, String, or Javascript variable data input.");
}
}
}
}
},_handleQueuedFetches:function(){
if(this._queuedFetches.length>0){
for(var i=0;i<this._queuedFetches.length;i++){
var _33=this._queuedFetches[i];
var _34=_33.filter;
var _35=_33.args;
if(_34){
_34(_35,this._arrayOfAllItems);
}else{
this.fetchItemByIdentity(_33.args);
}
}
this._queuedFetches=[];
}
},_processData:function(_36){
this._arrayOfAllItems=[];
for(var i=0;i<_36.length;i++){
this._arrayOfAllItems.push(this._createItem(_36[i]));
}
this._loadFinished=true;
this._loadInProgress=false;
},_createItem:function(_37){
var _38={};
_38[this._storeProp]=this;
for(var i in _37){
_38[this._keyAttribute]=i;
_38[this._valueAttribute]=_37[i];
break;
}
return _38;
},getIdentity:function(_39){
if(this.isItem(_39)){
return _39[this._keyAttribute];
}
return null;
},getIdentityAttributes:function(_3a){
return [this._keyAttribute];
},fetchItemByIdentity:function(_3b){
_3b.oldOnItem=_3b.onItem;
_3b.onItem=null;
_3b.onComplete=this._finishFetchItemByIdentity;
this.fetch(_3b);
},_finishFetchItemByIdentity:function(_3c,_3d){
var _3e=_3d.scope||_1.global;
if(_3c.length){
_3d.oldOnItem.call(_3e,_3c[0]);
}else{
_3d.oldOnItem.call(_3e,null);
}
}});
_1.extend(_2.data.KeyValueStore,_1.data.util.simpleFetch);
return _2.data.KeyValueStore;
});
