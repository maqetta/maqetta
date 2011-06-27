/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/JsonRestStore",["dojo","dojox","dojox/rpc/JsonRest","dojox/data/ServiceStore"],function(_1,_2){
_1.declare("dojox.data.JsonRestStore",_2.data.ServiceStore,{constructor:function(_3){
_1.connect(_2.rpc.Rest._index,"onUpdate",this,function(_4,_5,_6,_7){
var _8=this.service.servicePath;
if(!_4.__id){
}else{
if(_4.__id.substring(0,_8.length)==_8){
this.onSet(_4,_5,_6,_7);
}
}
});
this.idAttribute=this.idAttribute||"id";
if(typeof _3.target=="string"){
_3.target=_3.target.match(/\/$/)||this.allowNoTrailingSlash?_3.target:(_3.target+"/");
if(!this.service){
this.service=_2.rpc.JsonRest.services[_3.target]||_2.rpc.Rest(_3.target,true);
}
}
_2.rpc.JsonRest.registerService(this.service,_3.target,this.schema);
this.schema=this.service._schema=this.schema||this.service._schema||{};
this.service._store=this;
this.service.idAsRef=this.idAsRef;
this.schema._idAttr=this.idAttribute;
var _9=_2.rpc.JsonRest.getConstructor(this.service);
var _a=this;
this._constructor=function(_b){
_9.call(this,_b);
_a.onNew(this);
};
this._constructor.prototype=_9.prototype;
this._index=_2.rpc.Rest._index;
},loadReferencedSchema:true,idAsRef:false,referenceIntegrity:true,target:"",allowNoTrailingSlash:false,newItem:function(_c,_d){
_c=new this._constructor(_c);
if(_d){
var _e=this.getValue(_d.parent,_d.attribute,[]);
_e=_e.concat([_c]);
_c.__parent=_e;
this.setValue(_d.parent,_d.attribute,_e);
}
return _c;
},deleteItem:function(_f){
var _10=[];
var _11=_2.data._getStoreForItem(_f)||this;
if(this.referenceIntegrity){
_2.rpc.JsonRest._saveNotNeeded=true;
var _12=_2.rpc.Rest._index;
var _13=function(_14){
var _15;
_10.push(_14);
_14.__checked=1;
for(var i in _14){
if(i.substring(0,2)!="__"){
var _16=_14[i];
if(_16==_f){
if(_14!=_12){
if(_14 instanceof Array){
(_15=_15||[]).push(i);
}else{
(_2.data._getStoreForItem(_14)||_11).unsetAttribute(_14,i);
}
}
}else{
if((typeof _16=="object")&&_16){
if(!_16.__checked){
_13(_16);
}
if(typeof _16.__checked=="object"&&_14!=_12){
(_2.data._getStoreForItem(_14)||_11).setValue(_14,i,_16.__checked);
}
}
}
}
}
if(_15){
i=_15.length;
_14=_14.__checked=_14.concat();
while(i--){
_14.splice(_15[i],1);
}
return _14;
}
return null;
};
_13(_12);
_2.rpc.JsonRest._saveNotNeeded=false;
var i=0;
while(_10[i]){
delete _10[i++].__checked;
}
}
_2.rpc.JsonRest.deleteObject(_f);
_11.onDelete(_f);
},changing:function(_17,_18){
_2.rpc.JsonRest.changing(_17,_18);
},cancelChanging:function(_19){
if(!_19.__id){
return;
}
dirtyObjects=_1a=_2.rpc.JsonRest.getDirtyObjects();
for(var i=0;i<dirtyObjects.length;i++){
var _1a=dirtyObjects[i];
if(_19==_1a.object){
dirtyObjects.splice(i,1);
return;
}
}
},setValue:function(_1b,_1c,_1d){
var old=_1b[_1c];
var _1e=_1b.__id?_2.data._getStoreForItem(_1b):this;
if(_2.json.schema&&_1e.schema&&_1e.schema.properties){
_2.json.schema.mustBeValid(_2.json.schema.checkPropertyChange(_1d,_1e.schema.properties[_1c]));
}
if(_1c==_1e.idAttribute){
throw new Error("Can not change the identity attribute for an item");
}
_1e.changing(_1b);
_1b[_1c]=_1d;
if(_1d&&!_1d.__parent){
_1d.__parent=_1b;
}
_1e.onSet(_1b,_1c,old,_1d);
},setValues:function(_1f,_20,_21){
if(!_1.isArray(_21)){
throw new Error("setValues expects to be passed an Array object as its value");
}
this.setValue(_1f,_20,_21);
},unsetAttribute:function(_22,_23){
this.changing(_22);
var old=_22[_23];
delete _22[_23];
this.onSet(_22,_23,old,undefined);
},save:function(_24){
if(!(_24&&_24.global)){
(_24=_24||{}).service=this.service;
}
if("syncMode" in _24?_24.syncMode:this.syncMode){
_2.rpc._sync=true;
}
var _25=_2.rpc.JsonRest.commit(_24);
this.serverVersion=this._updates&&this._updates.length;
return _25;
},revert:function(_26){
_2.rpc.JsonRest.revert(_26&&_26.global&&this.service);
},isDirty:function(_27){
return _2.rpc.JsonRest.isDirty(_27,this);
},isItem:function(_28,_29){
return _28&&_28.__id&&(_29||this.service==_2.rpc.JsonRest.getServiceAndId(_28.__id).service);
},_doQuery:function(_2a){
var _2b=typeof _2a.queryStr=="string"?_2a.queryStr:_2a.query;
var _2c=_2.rpc.JsonRest.query(this.service,_2b,_2a);
var _2d=this;
if(this.loadReferencedSchema){
_2c.addCallback(function(_2e){
var _2f=_2c.ioArgs&&_2c.ioArgs.xhr&&_2c.ioArgs.xhr.getResponseHeader("Content-Type");
var _30=_2f&&_2f.match(/definedby\s*=\s*([^;]*)/);
if(_2f&&!_30){
_30=_2c.ioArgs.xhr.getResponseHeader("Link");
_30=_30&&_30.match(/<([^>]*)>;\s*rel="?definedby"?/);
}
_30=_30&&_30[1];
if(_30){
var _31=_2.rpc.JsonRest.getServiceAndId((_2d.target+_30).replace(/^(.*\/)?(\w+:\/\/)|[^\/\.]+\/\.\.\/|^.*\/(\/)/,"$2$3"));
var _32=_2.rpc.JsonRest.byId(_31.service,_31.id);
_32.addCallbacks(function(_33){
_1.mixin(_2d.schema,_33);
return _2e;
},function(_34){
console.error(_34);
return _2e;
});
return _32;
}
return undefined;
});
}
return _2c;
},_processResults:function(_35,_36){
var _37=_35.length;
return {totalCount:_36.fullLength||(_36.request.count==_37?(_36.request.start||0)+_37*2:_37),items:_35};
},getConstructor:function(){
return this._constructor;
},getIdentity:function(_38){
var id=_38.__clientId||_38.__id;
if(!id){
return id;
}
var _39=this.service.servicePath.replace(/[^\/]*$/,"");
return id.substring(0,_39.length)!=_39?id:id.substring(_39.length);
},fetchItemByIdentity:function(_3a){
var id=_3a.identity;
var _3b=this;
if(id.toString().match(/^(\w*:)?\//)){
var _3c=_2.rpc.JsonRest.getServiceAndId(id);
_3b=_3c.service._store;
_3a.identity=_3c.id;
}
_3a._prefix=_3b.service.servicePath.replace(/[^\/]*$/,"");
return _3b.inherited(arguments);
},onSet:function(){
},onNew:function(){
},onDelete:function(){
},getFeatures:function(){
var _3d=this.inherited(arguments);
_3d["dojo.data.api.Write"]=true;
_3d["dojo.data.api.Notification"]=true;
return _3d;
},getParent:function(_3e){
return _3e&&_3e.__parent;
}});
_2.data.JsonRestStore.getStore=function(_3f,_40){
if(typeof _3f.target=="string"){
_3f.target=_3f.target.match(/\/$/)||_3f.allowNoTrailingSlash?_3f.target:(_3f.target+"/");
var _41=(_2.rpc.JsonRest.services[_3f.target]||{})._store;
if(_41){
return _41;
}
}
return new (_40||_2.data.JsonRestStore)(_3f);
};
_2.data._getStoreForItem=function(_42){
if(_42.__id){
var _43=_2.rpc.JsonRest.getServiceAndId(_42.__id);
if(_43&&_43.service._store){
return _43.service._store;
}else{
var _44=_42.__id.toString().match(/.*\//)[0];
return new _2.data.JsonRestStore({target:_44});
}
}
return null;
};
_2.json.ref._useRefs=true;
return _2.data.JsonRestStore;
});
