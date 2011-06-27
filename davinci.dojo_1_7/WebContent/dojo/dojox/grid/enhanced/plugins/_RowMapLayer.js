/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/_RowMapLayer",["dojo","dojox","./_StoreLayer"],function(_1,_2){
var _3=function(a){
a.sort(function(v1,v2){
return v1-v2;
});
var _4=[[a[0]]];
for(var i=1,j=0;i<a.length;++i){
if(a[i]==a[i-1]+1){
_4[j].push(a[i]);
}else{
_4[++j]=[a[i]];
}
}
return _4;
},_5=function(_6,_7){
return _7?_1.hitch(_6||_1.global,_7):function(){
};
};
_1.declare("dojox.grid.enhanced.plugins._RowMapLayer",_2.grid.enhanced.plugins._StoreLayer,{tags:["reorder"],constructor:function(_8){
this._map={};
this._revMap={};
this.grid=_8;
this._oldOnDelete=_8._onDelete;
var _9=this;
_8._onDelete=function(_a){
_9._onDelete(_a);
_9._oldOnDelete.call(_8,_a);
};
this._oldSort=_8.sort;
_8.sort=function(){
_9.clearMapping();
_9._oldSort.apply(_8,arguments);
};
},uninitialize:function(){
this.grid._onDelete=this._oldOnDelete;
this.grid.sort=this._oldSort;
},setMapping:function(_b){
this._store.forEachLayer(function(_c){
if(_c.name()==="rowmap"){
return false;
}else{
if(_c.onRowMappingChange){
_c.onRowMappingChange(_b);
}
}
return true;
},false);
var _d,to,_e,_f={};
for(_d in _b){
_d=parseInt(_d,10);
to=_b[_d];
if(typeof to=="number"){
if(_d in this._revMap){
_e=this._revMap[_d];
delete this._revMap[_d];
}else{
_e=_d;
}
if(_e==to){
delete this._map[_e];
_f[to]="eq";
}else{
this._map[_e]=to;
_f[to]=_e;
}
}
}
for(to in _f){
if(_f[to]==="eq"){
delete this._revMap[parseInt(to,10)];
}else{
this._revMap[parseInt(to,10)]=_f[to];
}
}
},clearMapping:function(){
this._map={};
this._revMap={};
},_onDelete:function(_10){
var idx=this.grid._getItemIndex(_10,true);
if(idx in this._revMap){
var _11=[],r,i,_12=this._revMap[idx];
delete this._map[_12];
delete this._revMap[idx];
for(r in this._revMap){
r=parseInt(r,10);
if(this._revMap[r]>_12){
--this._revMap[r];
}
}
for(r in this._revMap){
r=parseInt(r,10);
if(r>idx){
_11.push(r);
}
}
_11.sort(function(a,b){
return b-a;
});
for(i=_11.length-1;i>=0;--i){
r=_11[i];
this._revMap[r-1]=this._revMap[r];
delete this._revMap[r];
}
this._map={};
for(r in this._revMap){
this._map[this._revMap[r]]=r;
}
}
},_fetch:function(_13){
var _14=0,r;
var _15=_13.start||0;
for(r in this._revMap){
r=parseInt(r,10);
if(r>=_15){
++_14;
}
}
if(_14>0){
var _16=[],i,map={},_17=_13.count>0?_13.count:-1;
if(_17>0){
for(i=0;i<_17;++i){
r=_15+i;
r=r in this._revMap?this._revMap[r]:r;
map[r]=i;
_16.push(r);
}
}else{
for(i=0;;++i){
r=_15+i;
if(r in this._revMap){
--_14;
r=this._revMap[r];
}
map[r]=i;
_16.push(r);
if(_14<=0){
break;
}
}
}
this._subFetch(_13,this._getRowArrays(_16),0,[],map,_13.onComplete,_15,_17);
return _13;
}else{
return _1.hitch(this._store,this._originFetch)(_13);
}
},_getRowArrays:function(_18){
return _3(_18);
},_subFetch:function(_19,_1a,_1b,_1c,map,_1d,_1e,_1f){
var arr=_1a[_1b],_20=this;
var _21=_19.start=arr[0];
_19.count=arr[arr.length-1]-arr[0]+1;
_19.onComplete=function(_22){
_1.forEach(_22,function(_23,i){
var r=_21+i;
if(r in map){
_1c[map[r]]=_23;
}
});
if(++_1b==_1a.length){
if(_1f>0){
_19.start=_1e;
_19.count=_1f;
_19.onComplete=_1d;
_5(_19.scope,_1d)(_1c,_19);
}else{
_19.start=_19.start+_22.length;
delete _19.count;
_19.onComplete=function(_24){
_1c=_1c.concat(_24);
_19.start=_1e;
_19.onComplete=_1d;
_5(_19.scope,_1d)(_1c,_19);
};
_20.originFetch(_19);
}
}else{
_20._subFetch(_19,_1a,_1b,_1c,map,_1d,_1e,_1f);
}
};
_20.originFetch(_19);
}});
return _2.grid.enhanced.plugins._RowMapLayer;
});
