/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/contrib/data",["dojo/_base/kernel","dojo/_base/lang","../_base","dojo/_base/array"],function(_1,_2,dd){
_1.getObject("dtl.contrib.data",true,dojox);
var _3=dd.contrib.data;
var _4=true;
_3._BoundItem=_1.extend(function(_5,_6){
this.item=_5;
this.store=_6;
},{get:function(_7){
var _8=this.store;
var _9=this.item;
if(_7=="getLabel"){
return _8.getLabel(_9);
}else{
if(_7=="getAttributes"){
return _8.getAttributes(_9);
}else{
if(_7=="getIdentity"){
if(_8.getIdentity){
return _8.getIdentity(_9);
}
return "Store has no identity API";
}else{
if(!_8.hasAttribute(_9,_7)){
if(_7.slice(-1)=="s"){
if(_4){
_4=false;
_1.deprecated("You no longer need an extra s to call getValues, it can be figured out automatically");
}
_7=_7.slice(0,-1);
}
if(!_8.hasAttribute(_9,_7)){
return;
}
}
var _a=_8.getValues(_9,_7);
if(!_a){
return;
}
if(!_1.isArray(_a)){
return new _3._BoundItem(_a,_8);
}
_a=_1.map(_a,function(_b){
if(_1.isObject(_b)&&_8.isItem(_b)){
return new _3._BoundItem(_b,_8);
}
return _b;
});
_a.get=_3._get;
return _a;
}
}
}
}});
_3._BoundItem.prototype.get.safe=true;
_3.BindDataNode=_1.extend(function(_c,_d,_e,_f){
this.items=_c&&new dd._Filter(_c);
this.query=_d&&new dd._Filter(_d);
this.store=new dd._Filter(_e);
this.alias=_f;
},{render:function(_10,_11){
var _12=this.items&&this.items.resolve(_10);
var _13=this.query&&this.query.resolve(_10);
var _14=this.store.resolve(_10);
if(!_14||!_14.getFeatures){
throw new Error("data_bind didn't receive a store");
}
if(_13){
var _15=false;
_14.fetch({query:_13,sync:true,scope:this,onComplete:function(it){
_15=true;
_12=it;
}});
if(!_15){
throw new Error("The bind_data tag only works with a query if the store executed synchronously");
}
}
var _16=[];
if(_12){
for(var i=0,_17;_17=_12[i];i++){
_16.push(new _3._BoundItem(_17,_14));
}
}
_10[this.alias]=_16;
return _11;
},unrender:function(_18,_19){
return _19;
},clone:function(){
return this;
}});
_1.mixin(_3,{_get:function(key){
if(this.length){
return (this[0] instanceof _3._BoundItem)?this[0].get(key):this[0][key];
}
},bind_data:function(_1a,_1b){
var _1c=_1b.contents.split();
if(_1c[2]!="to"||_1c[4]!="as"||!_1c[5]){
throw new Error("data_bind expects the format: 'data_bind items to store as varName'");
}
return new _3.BindDataNode(_1c[1],null,_1c[3],_1c[5]);
},bind_query:function(_1d,_1e){
var _1f=_1e.contents.split();
if(_1f[2]!="to"||_1f[4]!="as"||!_1f[5]){
throw new Error("data_bind expects the format: 'bind_query query to store as varName'");
}
return new _3.BindDataNode(null,_1f[1],_1f[3],_1f[5]);
}});
_3._get.safe=true;
dd.register.tags("dojox.dtl.contrib",{"data":["bind_data","bind_query"]});
return dojox.dtl.contrib.data;
});
