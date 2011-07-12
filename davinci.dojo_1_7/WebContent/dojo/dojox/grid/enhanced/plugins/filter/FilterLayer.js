/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/filter/FilterLayer",["dojo","dojox","./_FilterExpr","../_StoreLayer"],function(_1,_2){
var ns=_1.getObject("grid.enhanced.plugins",true,_2),_3="filter",_4="clear",_5=function(_6,_7){
return _7?_1.hitch(_6||_1.global,_7):function(){
};
},_8=function(_9){
var _a={};
if(_9&&_1.isObject(_9)){
for(var _b in _9){
_a[_b]=_9[_b];
}
}
return _a;
};
_1.declare("dojox.grid.enhanced.plugins.filter._FilterLayerMixin",null,{tags:["sizeChange"],name:function(){
return "filter";
},onFilterDefined:function(_c){
},onFiltered:function(_d,_e){
}});
_1.declare("dojox.grid.enhanced.plugins.filter.ServerSideFilterLayer",[ns._ServerSideLayer,ns.filter._FilterLayerMixin],{constructor:function(_f){
this._onUserCommandLoad=_f.setupFilterQuery||this._onUserCommandLoad;
this.filterDef(null);
},filterDef:function(_10){
if(_10){
this._filter=_10;
var obj=_10.toObject();
this.command(_3,this._isStateful?_1.toJson(obj):obj);
this.command(_4,null);
this.useCommands(true);
this.onFilterDefined(_10);
}else{
if(_10===null){
this._filter=null;
this.command(_3,null);
this.command(_4,true);
this.useCommands(true);
this.onFilterDefined(null);
}
}
return this._filter;
},onCommandLoad:function(_11,_12){
this.inherited(arguments);
var _13=_12.onBegin;
if(this._isStateful){
var _14;
if(_11){
this.command(_3,null);
this.command(_4,null);
this.useCommands(false);
var _15=_11.split(",");
if(_15.length>=2){
_14=this._filteredSize=parseInt(_15[0],10);
this.onFiltered(_14,parseInt(_15[1],10));
}else{
return;
}
}else{
_14=this._filteredSize;
}
if(this.enabled()){
_12.onBegin=function(_16,req){
_5(_12.scope,_13)(_14,req);
};
}
}else{
var _17=this;
_12.onBegin=function(_18,req){
if(!_17._filter){
_17._storeSize=_18;
}
_17.onFiltered(_18,_17._storeSize||_18);
req.onBegin=_13;
_5(_12.scope,_13)(_18,req);
};
}
}});
_1.declare("dojox.grid.enhanced.plugins.filter.ClientSideFilterLayer",[ns._StoreLayer,ns.filter._FilterLayerMixin],{_storeSize:-1,_fetchAll:true,constructor:function(_19){
this.filterDef(null);
_19=_1.isObject(_19)?_19:{};
this.fetchAllOnFirstFilter(_19.fetchAll);
this._getter=_1.isFunction(_19.getter)?_19.getter:this._defaultGetter;
},_defaultGetter:function(_1a,_1b,_1c,_1d){
return _1d.getValue(_1a,_1b);
},filterDef:function(_1e){
if(_1e!==undefined){
this._filter=_1e;
this.invalidate();
this.onFilterDefined(_1e);
}
return this._filter;
},setGetter:function(_1f){
if(_1.isFunction(_1f)){
this._getter=_1f;
}
},fetchAllOnFirstFilter:function(_20){
if(_20!==undefined){
this._fetchAll=!!_20;
}
return this._fetchAll;
},invalidate:function(){
this._items=[];
this._nextUnfetchedIdx=0;
this._result=[];
this._indexMap=[];
this._resultStartIdx=0;
},_fetch:function(_21,_22){
if(!this._filter){
var _23=_21.onBegin,_24=this;
_21.onBegin=function(_25,r){
_5(_21.scope,_23)(_25,r);
_24.onFiltered(_25,_25);
};
this.originFetch(_21);
return _21;
}
try{
var _26=_22?_22._nextResultItemIdx:_21.start;
_26=_26||0;
if(!_22){
this._result=[];
this._resultStartIdx=_26;
var _27;
if(_1.isArray(_21.sort)&&_21.sort.length>0&&(_27=_1.toJson(_21.sort))!=this._lastSortInfo){
this.invalidate();
this._lastSortInfo=_27;
}
}
var end=typeof _21.count=="number"?_26+_21.count-this._result.length:this._items.length;
if(this._result.length){
this._result=this._result.concat(this._items.slice(_26,end));
}else{
this._result=this._items.slice(_21.start,typeof _21.count=="number"?_21.start+_21.count:this._items.length);
}
if(this._result.length>=_21.count||this._hasReachedStoreEnd()){
this._completeQuery(_21);
}else{
if(!_22){
_22=_8(_21);
_22.onBegin=_1.hitch(this,this._onFetchBegin);
_22.onComplete=_1.hitch(this,function(_28,req){
this._nextUnfetchedIdx+=_28.length;
this._doFilter(_28,req.start,_21);
this._fetch(_21,req);
});
}
_22.start=this._nextUnfetchedIdx;
if(this._fetchAll){
delete _22.count;
}
_22._nextResultItemIdx=end<this._items.length?end:this._items.length;
this.originFetch(_22);
}
}
catch(e){
if(_21.onError){
_5(_21.scope,_21.onError)(e,_21);
}else{
throw e;
}
}
return _21;
},_hasReachedStoreEnd:function(){
return this._storeSize>=0&&this._nextUnfetchedIdx>=this._storeSize;
},_applyFilter:function(_29,_2a){
var g=this._getter,s=this._store;
try{
return !!(this._filter.applyRow(_29,function(_2b,arg){
return g(_2b,arg,_2a,s);
}).getValue());
}
catch(e){
console.warn("FilterLayer._applyFilter() error: ",e);
return false;
}
},_doFilter:function(_2c,_2d,_2e){
for(var i=0,cnt=0;i<_2c.length;++i){
if(this._applyFilter(_2c[i],_2d+i)){
_5(_2e.scope,_2e.onItem)(_2c[i],_2e);
cnt+=this._addCachedItems(_2c[i],this._items.length);
this._indexMap.push(_2d+i);
}
}
},_onFetchBegin:function(_2f,req){
this._storeSize=_2f;
},_completeQuery:function(_30){
var _31=this._items.length;
if(this._nextUnfetchedIdx<this._storeSize){
_31++;
}
_5(_30.scope,_30.onBegin)(_31,_30);
this.onFiltered(this._items.length,this._storeSize);
_5(_30.scope,_30.onComplete)(this._result,_30);
},_addCachedItems:function(_32,_33){
if(!_1.isArray(_32)){
_32=[_32];
}
for(var k=0;k<_32.length;++k){
this._items[_33+k]=_32[k];
}
return _32.length;
},onRowMappingChange:function(_34){
if(this._filter){
var m=_1.clone(_34),_35={};
for(var r in m){
r=parseInt(r,10);
_34[this._indexMap[r]]=this._indexMap[m[r]];
if(!_35[this._indexMap[r]]){
_35[this._indexMap[r]]=true;
}
if(!_35[r]){
_35[r]=true;
delete _34[r];
}
}
}
}});
return _2.grid.enhanced.plugins.filter.FilterLayer;
});
