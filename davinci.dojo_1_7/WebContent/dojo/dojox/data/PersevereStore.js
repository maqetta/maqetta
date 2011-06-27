/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/PersevereStore",["dojo","dijit","dojox","dojox/io/xhrScriptPlugin","dojox/io/xhrPlugins"],function(_1,_2,_3){
_1.getObject("dojox.data.PersevereStore",1);
define("dojox/data/PersevereStore",["dojo","dojox","dojox/data/JsonQueryRestStore","dojox/rpc/Client","dojo/_base/url"],function(_4,_5){
_5.json.ref.serializeFunctions=true;
_4.declare("dojox.data.PersevereStore",_5.data.JsonQueryRestStore,{useFullIdInQueries:true,jsonQueryPagination:false});
_5.data.PersevereStore.getStores=function(_6,_7){
_6=(_6&&(_6.match(/\/$/)?_6:(_6+"/")))||"/";
if(_6.match(/^\w*:\/\//)){
_5.io.xhrScriptPlugin(_6,"callback",_5.io.xhrPlugins.fullHttpAdapter);
}
var _8=_4.xhr;
_4.xhr=function(_9,_a){
(_a.headers=_a.headers||{})["Server-Methods"]="false";
return _8.apply(_4,arguments);
};
var _b=_5.rpc.Rest(_6,true);
_5.rpc._sync=_7;
var _c=_b("Class/");
var _d;
var _e={};
var _f=0;
_c.addCallback(function(_10){
_5.json.ref.resolveJson(_10,{index:_5.rpc.Rest._index,idPrefix:"/Class/",assignAbsoluteIds:true});
function _11(_12){
if(_12["extends"]&&_12["extends"].prototype){
if(!_12.prototype||!_12.prototype.isPrototypeOf(_12["extends"].prototype)){
_11(_12["extends"]);
_5.rpc.Rest._index[_12.prototype.__id]=_12.prototype=_4.mixin(_4.delegate(_12["extends"].prototype),_12.prototype);
}
}
};
function _13(_14,_15){
if(_14&&_15){
for(var j in _14){
var _16=_14[j];
if(_16.runAt!="client"&&!_15[j]){
_15[j]=(function(_17){
return function(){
var _18=_4.rawXhrPost({url:this.__id,postData:_5.json.ref.toJson({method:_17,id:_f++,params:_4._toArray(arguments)}),handleAs:"json"});
_18.addCallback(function(_19){
return _19.error?new Error(_19.error):_19.result;
});
return _18;
};
})(j);
}
}
}
};
for(var i in _10){
if(typeof _10[i]=="object"){
var _1a=_10[i];
_11(_1a);
_13(_1a.methods,_1a.prototype=_1a.prototype||{});
_13(_1a.staticMethods,_1a);
_e[_10[i].id]=new _5.data.PersevereStore({target:new _4._Url(_6,_10[i].id)+"/",schema:_1a});
}
}
return (_d=_e);
});
_4.xhr=_8;
return _7?_d:_c;
};
_5.data.PersevereStore.addProxy=function(){
_5.io.xhrPlugins.addProxy("/proxy/");
};
return _5.data.PersevereStore;
});
return _1.getObject("dojox.data.PersevereStore");
});
require(["dojox/data/PersevereStore"]);
