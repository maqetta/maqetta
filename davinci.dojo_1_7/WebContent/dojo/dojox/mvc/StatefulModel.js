/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mvc/StatefulModel",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/array","dojo/_base/declare","dojo/Stateful"],function(_1,_2,_3,_4,_5){
var _6=_4("dojox.mvc.StatefulModel",[_5],{data:null,store:null,valid:true,value:"",reset:function(){
if(_2.isObject(this.data)){
for(var x in this){
if(this[x]&&_2.isFunction(this[x].reset)){
this[x].reset();
}
}
}else{
this.set("value",this.data);
}
},commit:function(_7){
this._commit();
var ds=_7||this.store;
if(ds){
this._saveToStore(ds);
}
},toPlainObject:function(){
var _8={};
var _9=false;
for(var p in this){
if(this[p]&&_2.isFunction(this[p].toPlainObject)){
if(!_9&&typeof this.get("length")==="number"){
_8=[];
}
_9=true;
_8[p]=this[p].toPlainObject();
}
}
if(!_9){
_8=this.value;
}
return _8;
},add:function(_a,_b){
var n,n1,_c,_d,_e=new _6({data:""});
if(typeof this.get("length")==="number"&&/^[0-9]+$/.test(_a.toString())){
n=_a;
if(!this.get(n)){
n1=n-1;
if(!this.get(n1)){
throw new Error("Out of bounds insert attempted, must be contiguous.");
}
this.set(n,_b);
}else{
n1=n-0+1;
_c=_b;
_d=this.get(n1);
if(!_d){
this.set(n1,_c);
}else{
do{
this._copyStatefulProperties(_d,_e);
this._copyStatefulProperties(_c,_d);
this._copyStatefulProperties(_e,_c);
this.set(n1,_d);
_d=this.get(++n1);
}while(_d);
this.set(n1,_c);
}
}
this.set("length",this.get("length")+1);
}else{
this.set(_a,_b);
}
},remove:function(_f){
var n,_10,_11;
if(typeof this.get("length")==="number"&&/^[0-9]+$/.test(_f.toString())){
n=_f;
_10=this.get(n);
if(!_10){
throw new Error("Out of bounds delete attempted - no such index: "+n);
}else{
this._removals=this._removals||[];
this._removals.push(_10.toPlainObject());
n1=n-0+1;
_11=this.get(n1);
if(!_11){
this.set(n,undefined);
delete this[n];
}else{
while(_11){
this._copyStatefulProperties(_11,_10);
_10=this.get(n1++);
_11=this.get(n1);
}
this.set(n1-1,undefined);
delete this[n1-1];
}
this.set("length",this.get("length")-1);
}
}else{
_10=this.get(_f);
if(!_10){
throw new Error("Illegal delete attempted - no such property: "+_f);
}else{
this._removals=this._removals||[];
this._removals.push(_10.toPlainObject());
this.set(_f,undefined);
delete this[_f];
}
}
},constructor:function(_12){
if(_12.data){
this._createModel(_12.data);
}
},_createModel:function(obj){
if(_2.isObject(obj)){
for(var x in obj){
var _13=new _6({data:obj[x]});
this.set(x,_13);
}
if(_2.isArray(obj)){
this.set("length",obj.length);
}
}else{
this.set("value",obj);
}
},_commit:function(){
for(var x in this){
if(this[x]&&_2.isFunction(this[x]._commit)){
this[x]._commit();
}
}
this.data=this.toPlainObject();
},_saveToStore:function(_14){
if(this._removals){
_3.forEach(this._removals,function(d){
_14.remove(_14.getIdentity(d));
},this);
delete this._removals;
}
var _15=this.toPlainObject();
if(_2.isArray(_15)){
_3.forEach(_15,function(d){
_14.put(d);
},this);
}else{
_14.put(_15);
}
},_copyStatefulProperties:function(src,_16){
for(var x in src){
var o=src.get(x);
if(o&&_2.isObject(o)&&_2.isFunction(o.get)){
_16.set(x,o);
}
}
}});
return _6;
});
