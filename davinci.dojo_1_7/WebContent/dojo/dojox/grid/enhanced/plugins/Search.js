/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/Search",["dojo","dojox","../_Plugin","dojo/data/util/filter"],function(_1,_2){
_1.declare("dojox.grid.enhanced.plugins.Search",_2.grid.enhanced._Plugin,{name:"search",constructor:function(_3,_4){
this.grid=_3;
_4=(_4&&_1.isObject(_4))?_4:{};
this._cacheSize=_4.cacheSize||-1;
_3.searchRow=_1.hitch(this,"searchRow");
},searchRow:function(_5,_6){
if(!_1.isFunction(_6)){
return;
}
if(_1.isString(_5)){
_5=_1.data.util.filter.patternToRegExp(_5);
}
var _7=false;
if(_5 instanceof RegExp){
_7=true;
}else{
if(_1.isObject(_5)){
var _8=true;
for(var _9 in _5){
if(_1.isString(_5[_9])){
_5[_9]=_1.data.util.filter.patternToRegExp(_5[_9]);
}
_8=false;
}
if(_8){
return;
}
}else{
return;
}
}
this._search(_5,0,_6,_7);
},_search:function(_a,_b,_c,_d){
var _e=this,_f=this._cacheSize,_10={"start":_b,"onBegin":function(_11){
_e._storeSize=_11;
},"onComplete":function(_12){
if(!_1.some(_12,function(_13,i){
if(_e._checkRow(_13,_a,_d)){
_c(_b+i,_13);
return true;
}
return false;
})){
if(_f>0&&_b+_f<_e._storeSize){
_e._search(_a,_b+_f,_c,_d);
}else{
_c(-1,null);
}
}
}};
if(_f>0){
_10.count=_f;
}
this.grid._storeLayerFetch(_10);
},_checkRow:function(_14,_15,_16){
var g=this.grid,s=g.store,i,_17,_18=_1.filter(g.layout.cells,function(_19){
return !_19.hidden;
});
if(_16){
return _1.some(_18,function(_1a){
try{
if(_1a.field){
return String(s.getValue(_14,_1a.field)).search(_15)>=0;
}
}
catch(e){
}
return false;
});
}else{
for(_17 in _15){
if(_15[_17] instanceof RegExp){
for(i=_18.length-1;i>=0;--i){
if(_18[i].field==_17){
try{
if(String(s.getValue(_14,_17)).search(_15[_17])<0){
return false;
}
break;
}
catch(e){
return false;
}
}
}
if(i<0){
return false;
}
}
}
return true;
}
}});
_2.grid.EnhancedGrid.registerPlugin(_2.grid.enhanced.plugins.Search);
return _2.grid.enhanced.plugins.Search;
});
