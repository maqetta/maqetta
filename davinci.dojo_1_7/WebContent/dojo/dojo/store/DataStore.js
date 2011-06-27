/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/store/DataStore",["../main","./util/QueryResults"],function(_1){
_1.declare("dojo.store.DataStore",null,{target:"",constructor:function(_2){
_1.mixin(this,_2);
},store:null,_objectConverter:function(_3){
var _4=this.store;
return function(_5){
var _6={};
var _7=_4.getAttributes(_5);
for(var i=0;i<_7.length;i++){
_6[_7[i]]=_4.getValue(_5,_7[i]);
}
return _3(_6);
};
},get:function(id,_8){
var _9,_a;
var _b=new _1.Deferred();
this.store.fetchItemByIdentity({identity:id,onItem:this._objectConverter(function(_c){
_b.resolve(_9=_c);
}),onError:function(_d){
_b.reject(_a=_d);
}});
if(_9){
return _9;
}
if(_a){
throw _a;
}
return _b.promise;
},put:function(_e,_f){
var id=_f&&typeof _f.id!="undefined"||this.getIdentity(_e);
var _10=this.store;
if(typeof id=="undefined"){
_10.newItem(_e);
}else{
_10.fetchItemByIdentity({identity:id,onItem:function(_11){
if(_11){
for(var i in _e){
if(_10.getValue(_11,i)!=_e[i]){
_10.setValue(_11,i,_e[i]);
}
}
}else{
_10.newItem(_e);
}
}});
}
},remove:function(id){
var _12=this.store;
this.store.fetchItemByIdentity({identity:id,onItem:function(_13){
_12.deleteItem(_13);
}});
},query:function(_14,_15){
var _16;
var _17=new _1.Deferred(function(){
_16.abort&&_16.abort();
});
_17.total=new _1.Deferred();
var _18=this._objectConverter(function(_19){
return _19;
});
_16=this.store.fetch(_1.mixin({query:_14,onBegin:function(_1a){
_17.total.resolve(_1a);
},onComplete:function(_1b){
_17.resolve(_1.map(_1b,_18));
},onError:function(_1c){
_17.reject(_1c);
}},_15));
return _1.store.util.QueryResults(_17);
},getIdentity:function(_1d){
return _1d[this.idProperty||this.store.getIdentityAttributes()[0]];
}});
return _1.store.DataStore;
});
