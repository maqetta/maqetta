/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/ClientFilter",["dojo","dojox","dojo/data/util/filter"],function(_1,_2){
var cf;
var _3=function(_4,_5,_6){
return function(_7){
_4._updates.push({create:_5&&_7,remove:_6&&_7});
cf.onUpdate();
};
};
cf=_1.declare("dojox.data.ClientFilter",null,{cacheByDefault:false,constructor:function(){
this.onSet=_3(this,true,true);
this.onNew=_3(this,true,false);
this.onDelete=_3(this,false,true);
this._updates=[];
this._fetchCache=[];
},clearCache:function(){
this._fetchCache=[];
},updateResultSet:function(_8,_9){
if(this.isUpdateable(_9)){
for(var i=_9._version||0;i<this._updates.length;i++){
var _a=this._updates[i].create;
var _b=this._updates[i].remove;
if(_b){
for(var j=0;j<_8.length;j++){
if(this.getIdentity(_8[j])==this.getIdentity(_b)){
_8.splice(j--,1);
var _c=true;
}
}
}
if(_a&&this.matchesQuery(_a,_9)&&_1.indexOf(_8,_a)==-1){
_8.push(_a);
_c=true;
}
}
if(_9.sort&&_c){
_8.sort(this.makeComparator(_9.sort.concat()));
}
_8._fullLength=_8.length;
if(_9.count&&_c&&_9.count!==Infinity){
_8.splice(_9.count,_8.length);
}
_9._version=this._updates.length;
return _c?2:1;
}
return 0;
},querySuperSet:function(_d,_e){
if(_d.query==_e.query){
return {};
}
if(!(_e.query instanceof Object&&(!_d.query||typeof _d.query=="object"))){
return false;
}
var _f=_1.mixin({},_e.query);
for(var i in _d.query){
if(_f[i]==_d.query[i]){
delete _f[i];
}else{
if(!(typeof _d.query[i]=="string"&&_1.data.util.filter.patternToRegExp(_d.query[i]).test(_f[i]))){
return false;
}
}
}
return _f;
},serverVersion:0,cachingFetch:function(_10){
var _11=this;
for(var i=0;i<this._fetchCache.length;i++){
var _12=this._fetchCache[i];
var _13=this.querySuperSet(_12,_10);
if(_13!==false){
var _14=_12._loading;
if(!_14){
_14=new _1.Deferred();
_14.callback(_12.cacheResults);
}
_14.addCallback(function(_15){
_15=_11.clientSideFetch(_1.mixin(_1.mixin({},_10),{query:_13}),_15);
_14.fullLength=_15._fullLength;
return _15;
});
_10._version=_12._version;
break;
}
}
if(!_14){
var _16=_1.mixin({},_10);
var _17=(_10.queryOptions||0).cache;
var _18=this._fetchCache;
if(_17===undefined?this.cacheByDefault:_17){
if(_10.start||_10.count){
delete _16.start;
delete _16.count;
_10.clientQuery=_1.mixin(_10.clientQuery||{},{start:_10.start,count:_10.count});
}
_10=_16;
_18.push(_10);
}
_14=_10._loading=this._doQuery(_10);
_14.addErrback(function(){
_18.splice(_1.indexOf(_18,_10),1);
});
}
var _19=this.serverVersion;
_14.addCallback(function(_1a){
delete _10._loading;
if(_1a){
_10._version=typeof _10._version=="number"?_10._version:_19;
_11.updateResultSet(_1a,_10);
_10.cacheResults=_1a;
if(!_10.count||_1a.length<_10.count){
_14.fullLength=((_10.start)?_10.start:0)+_1a.length;
}
}
return _1a;
});
return _14;
},isUpdateable:function(_1b){
return typeof _1b.query=="object";
},clientSideFetch:function(_1c,_1d){
if(_1c.queryOptions&&_1c.queryOptions.results){
_1d=_1c.queryOptions.results;
}
if(_1c.query){
var _1e=[];
for(var i=0;i<_1d.length;i++){
var _1f=_1d[i];
if(_1f&&this.matchesQuery(_1f,_1c)){
_1e.push(_1d[i]);
}
}
}else{
_1e=_1c.sort?_1d.concat():_1d;
}
if(_1c.sort){
_1e.sort(this.makeComparator(_1c.sort.concat()));
}
return this.clientSidePaging(_1c,_1e);
},clientSidePaging:function(_20,_21){
var _22=_20.start||0;
var _23=(_22||_20.count)?_21.slice(_22,_22+(_20.count||_21.length)):_21;
_23._fullLength=_21.length;
return _23;
},matchesQuery:function(_24,_25){
var _26=_25.query;
var _27=_25.queryOptions&&_25.queryOptions.ignoreCase;
for(var i in _26){
var _28=_26[i];
var _29=this.getValue(_24,i);
if((typeof _28=="string"&&(_28.match(/[\*\.]/)||_27))?!_1.data.util.filter.patternToRegExp(_28,_27).test(_29):_29!=_28){
return false;
}
}
return true;
},makeComparator:function(_2a){
var _2b=_2a.shift();
if(!_2b){
return function(){
return 0;
};
}
var _2c=_2b.attribute;
var _2d=!!_2b.descending;
var _2e=this.makeComparator(_2a);
var _2f=this;
return function(a,b){
var av=_2f.getValue(a,_2c);
var bv=_2f.getValue(b,_2c);
if(av!=bv){
return av<bv==_2d?1:-1;
}
return _2e(a,b);
};
}});
cf.onUpdate=function(){
};
return _2.data.ClientFilter;
});
