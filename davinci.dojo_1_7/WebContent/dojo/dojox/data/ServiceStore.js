/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/ServiceStore",["dojo","dojox"],function(_1,_2){
_1.declare("dojox.data.ServiceStore",_1.getObject("data.ClientFilter",0,_2)||null,{service:null,constructor:function(_3){
this.byId=this.fetchItemByIdentity;
this._index={};
if(_3){
_1.mixin(this,_3);
}
this.idAttribute=(_3&&_3.idAttribute)||(this.schema&&this.schema._idAttr);
},schema:null,idAttribute:"id",labelAttribute:"label",syncMode:false,estimateCountFactor:1,getSchema:function(){
return this.schema;
},loadLazyValues:true,getValue:function(_4,_5,_6){
var _7=_4[_5];
return _7||(_5 in _4?_7:_4._loadObject?(_2.rpc._sync=true)&&arguments.callee.call(this,_2.data.ServiceStore.prototype.loadItem({item:_4})||{},_5,_6):_6);
},getValues:function(_8,_9){
var _a=this.getValue(_8,_9);
if(_a instanceof Array){
return _a;
}
if(!this.isItemLoaded(_a)){
_2.rpc._sync=true;
_a=this.loadItem({item:_a});
}
return _a instanceof Array?_a:_a===undefined?[]:[_a];
},getAttributes:function(_b){
var _c=[];
for(var i in _b){
if(_b.hasOwnProperty(i)&&!(i.charAt(0)=="_"&&i.charAt(1)=="_")){
_c.push(i);
}
}
return _c;
},hasAttribute:function(_d,_e){
return _e in _d;
},containsValue:function(_f,_10,_11){
return _1.indexOf(this.getValues(_f,_10),_11)>-1;
},isItem:function(_12){
return (typeof _12=="object")&&_12&&!(_12 instanceof Date);
},isItemLoaded:function(_13){
return _13&&!_13._loadObject;
},loadItem:function(_14){
var _15;
if(_14.item._loadObject){
_14.item._loadObject(function(_16){
_15=_16;
delete _15._loadObject;
var _17=_16 instanceof Error?_14.onError:_14.onItem;
if(_17){
_17.call(_14.scope,_16);
}
});
}else{
if(_14.onItem){
_14.onItem.call(_14.scope,_14.item);
}
}
return _15;
},_currentId:0,_processResults:function(_18,_19){
if(_18&&typeof _18=="object"){
var id=_18.__id;
if(!id){
if(this.idAttribute){
id=_18[this.idAttribute];
}else{
id=this._currentId++;
}
if(id!==undefined){
var _1a=this._index[id];
if(_1a){
for(var j in _1a){
delete _1a[j];
}
_18=_1.mixin(_1a,_18);
}
_18.__id=id;
this._index[id]=_18;
}
}
for(var i in _18){
_18[i]=this._processResults(_18[i],_19).items;
}
var _1b=_18.length;
}
return {totalCount:_19.request.count==_1b?(_19.request.start||0)+_1b*this.estimateCountFactor:_1b,items:_18};
},close:function(_1c){
return _1c&&_1c.abort&&_1c.abort();
},fetch:function(_1d){
_1d=_1d||{};
if("syncMode" in _1d?_1d.syncMode:this.syncMode){
_2.rpc._sync=true;
}
var _1e=this;
var _1f=_1d.scope||_1e;
var _20=this.cachingFetch?this.cachingFetch(_1d):this._doQuery(_1d);
_20.request=_1d;
_20.addCallback(function(_21){
if(_1d.clientFetch){
_21=_1e.clientSideFetch({query:_1d.clientFetch,sort:_1d.sort,start:_1d.start,count:_1d.count},_21);
}
var _22=_1e._processResults(_21,_20);
_21=_1d.results=_22.items;
if(_1d.onBegin){
_1d.onBegin.call(_1f,_22.totalCount,_1d);
}
if(_1d.onItem){
for(var i=0;i<_21.length;i++){
_1d.onItem.call(_1f,_21[i],_1d);
}
}
if(_1d.onComplete){
_1d.onComplete.call(_1f,_1d.onItem?null:_21,_1d);
}
return _21;
});
_20.addErrback(_1d.onError&&function(err){
return _1d.onError.call(_1f,err,_1d);
});
_1d.abort=function(){
_20.cancel();
};
_1d.store=this;
return _1d;
},_doQuery:function(_23){
var _24=typeof _23.queryStr=="string"?_23.queryStr:_23.query;
return this.service(_24);
},getFeatures:function(){
return {"dojo.data.api.Read":true,"dojo.data.api.Identity":true,"dojo.data.api.Schema":this.schema};
},getLabel:function(_25){
return this.getValue(_25,this.labelAttribute);
},getLabelAttributes:function(_26){
return [this.labelAttribute];
},getIdentity:function(_27){
return _27.__id;
},getIdentityAttributes:function(_28){
return [this.idAttribute];
},fetchItemByIdentity:function(_29){
var _2a=this._index[(_29._prefix||"")+_29.identity];
if(_2a){
if(_2a._loadObject){
_29.item=_2a;
return this.loadItem(_29);
}else{
if(_29.onItem){
_29.onItem.call(_29.scope,_2a);
}
}
}else{
return this.fetch({query:_29.identity,onComplete:_29.onItem,onError:_29.onError,scope:_29.scope}).results;
}
return _2a;
}});
return _2.data.ServiceStore;
});
