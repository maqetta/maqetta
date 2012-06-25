//>>built
define("dojox/app/utils/simpleModel",["dojo/_base/lang","dojo/Deferred","dojo/when","dojo/_base/config","dojo/store/DataStore"],function(_1,_2,_3,_4,_5){
return function(_6,_7,_8){
var _9={};
var _a=new _2();
var _b;
if(_7.store){
if((_7.store.params.data||_7.store.params.store)){
_b={"store":_7.store.store,"query":_7.store.query?_7.store.query:{}};
}else{
if(_7.store.params.url){
_b={"store":new dataStore({store:_7.store.store}),"query":_7.store.query?_7.store.query:{}};
}
}
}else{
if(_7.data){
if(_7.data&&_1.isString(_7.data)){
_7.data=_1.getObject(_7.data);
}
_b={"data":_7.data,query:{}};
}
}
var _c;
var _d=null;
var _e=null;
var _f;
try{
if(_b.store){
_f=_b.store.query();
}else{
_f=_b.data;
}
}
catch(ex){
_a.reject("load mvc model error.");
return _a.promise;
}
if(_f.then){
_3(_f,_1.hitch(this,function(_10){
_9=_10;
_a.resolve(_9);
return _9;
}),function(){
loadModelLoaderDeferred.reject("load model error.");
});
}else{
_9=_f;
_a.resolve(_9);
return _9;
}
return _a;
};
});
