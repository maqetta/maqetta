//>>built
define("dojox/app/utils/mvcModel",["dojo/_base/lang","dojo/Deferred","dojo/when","dojo/_base/config","dojo/store/DataStore","dojox/mvc/getStateful","dojo/has"],function(_1,_2,_3,_4,_5,_6,_7){
return function(_8,_9,_a){
var _b={};
var _c=new _2();
var _d;
if(_9.store&&_9.store.params&&_9.store.params.data){
_d={"store":_9.store.store,"query":_9.store.query?_9.store.query:{}};
}else{
if(_9.datastore){
var _e={};
for(var _a in _9.query){
if(_a.charAt(0)!=="_"){
_e[_a]=_9.query[_a];
}
}
_d={"store":new _5({store:_9.datastore.store}),"query":_e};
}else{
if(_9.data){
if(_9.data&&_1.isString(_9.data)){
_9.data=_1.getObject(_9.data);
}
_d={"data":_9.data,query:{}};
}
}
}
var _f;
var _10=null;
var _11=null;
var _12=_8[_a].type?_8[_a].type:"dojox/mvc/EditStoreRefListController";
var def=new _2();
require([_12],function(_13){
def.resolve(_13);
});
_3(def,function(_14){
_11=new _14(_d);
var _15;
try{
if(_11.queryStore){
_15=_11.queryStore(_d.query);
}else{
var _16=_11._refSourceModelProp||_11._refModelProp||"model";
_11.set(_16,_6(_d.data));
_15=_11;
}
}
catch(ex){
_c.reject("load mvc model error.");
return _c.promise;
}
if(_15.then){
_3(_15,_1.hitch(this,function(){
_b=_11;
_c.resolve(_b);
return _b;
}),function(){
loadModelLoaderDeferred.reject("load model error.");
});
}else{
_b=_11;
_c.resolve(_b);
return _b;
}
});
return _c;
};
});
