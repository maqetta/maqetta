/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/store/Memory",["../_base/declare","./util/QueryResults","./util/SimpleQueryEngine"],function(_1,_2,_3){
return _1("dojo.store.Memory",null,{constructor:function(_4){
this.index={};
for(var i in _4){
this[i]=_4[i];
}
this.setData(this.data||[]);
},data:null,idProperty:"id",index:null,queryEngine:_3,get:function(id){
return this.index[id];
},getIdentity:function(_5){
return _5[this.idProperty];
},put:function(_6,_7){
var id=_7&&_7.id||_6[this.idProperty]||Math.random();
this.index[id]=_6;
var _8=this.data,_9=this.idProperty;
for(var i=0,l=_8.length;i<l;i++){
if(_8[i][_9]==id){
_8[i]=_6;
return id;
}
}
this.data.push(_6);
return id;
},add:function(_a,_b){
if(this.index[_b&&_b.id||_a[this.idProperty]]){
throw new Error("Object already exists");
}
return this.put(_a,_b);
},remove:function(id){
delete this.index[id];
var _c=this.data,_d=this.idProperty;
for(var i=0,l=_c.length;i<l;i++){
if(_c[i][_d]==id){
_c.splice(i,1);
return;
}
}
},query:function(_e,_f){
return _2(this.queryEngine(_e,_f)(this.data));
},setData:function(_10){
if(_10.items){
this.idProperty=_10.identifier;
_10=this.data=_10.items;
}else{
this.data=_10;
}
for(var i=0,l=_10.length;i<l;i++){
var _11=_10[i];
this.index[_11[this.idProperty]]=_11;
}
}});
});
