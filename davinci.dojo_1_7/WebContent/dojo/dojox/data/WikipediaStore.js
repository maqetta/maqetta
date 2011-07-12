/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/WikipediaStore",["dojo","dojox","dojo/io/script","dojox/rpc/Service","dojox/data/ServiceStore"],function(_1,_2){
_1.experimental("dojox.data.WikipediaStore");
_1.declare("dojox.data.WikipediaStore",_2.data.ServiceStore,{constructor:function(_3){
if(_3&&_3.service){
this.service=_3.service;
}else{
var _4=new _2.rpc.Service(_1.moduleUrl("dojox.rpc.SMDLibrary","wikipedia.smd"));
this.service=_4.query;
}
this.idAttribute=this.labelAttribute="title";
},fetch:function(_5){
var rq=_1.mixin({},_5.query);
if(rq&&(!rq.action||rq.action==="parse")){
rq.action="parse";
rq.page=rq.title;
delete rq.title;
}else{
if(rq.action==="query"){
rq.list="search";
rq.srwhat="text";
rq.srsearch=rq.text;
if(_5.start){
rq.sroffset=_5.start-1;
}
if(_5.count){
rq.srlimit=_5.count>=500?500:_5.count;
}
delete rq.text;
}
}
_5.query=rq;
return this.inherited(arguments);
},_processResults:function(_6,_7){
if(_6.parse){
_6.parse.title=_1.queryToObject(_7.ioArgs.url.split("?")[1]).page;
_6=[_6.parse];
}else{
if(_6.query&&_6.query.search){
_6=_6.query.search;
var _8=this;
for(var i in _6){
_6[i]._loadObject=function(_9){
_8.fetch({query:{action:"parse",title:this.title},onItem:_9});
delete this._loadObject;
};
}
}
}
return this.inherited(arguments);
}});
return _2.data.WikipediaStore;
});
