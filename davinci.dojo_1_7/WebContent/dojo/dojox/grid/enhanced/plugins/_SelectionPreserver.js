/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dojox"],function(_1,_2){
_1.declare("dojox.grid.enhanced.plugins._SelectionPreserver",null,{_connects:[],constructor:function(_3){
this.selection=_3;
var _4=this.grid=_3.grid;
_4.onSelectedById=this.onSelectedById;
this.reset();
var _5=_4._clearData;
var _6=this;
_4._clearData=function(){
_6._updateMapping(!_4._noInternalMapping);
_6._trustSelection=[];
_5.apply(_4,arguments);
};
this.connect(_4,"_setStore","reset");
this.connect(_4,"_addItem","_reSelectById");
this.connect(_3,"addToSelection",_1.hitch(this,"_selectById",true));
this.connect(_3,"deselect",_1.hitch(this,"_selectById",false));
this.connect(_3,"selectRange",_1.hitch(this,"_updateMapping",true,true,false));
this.connect(_3,"deselectRange",_1.hitch(this,"_updateMapping",true,false,false));
this.connect(_3,"deselectAll",_1.hitch(this,"_updateMapping",true,false,true));
},destroy:function(){
this.reset();
_1.forEach(this._connects,_1.disconnect);
delete this._connects;
},connect:function(_7,_8,_9){
var _a=_1.connect(_7,_8,this,_9);
this._connects.push(_a);
return _a;
},reset:function(){
this._idMap=[];
this._selectedById={};
this._trustSelection=[];
this._defaultSelected=false;
},_reSelectById:function(_b,_c){
var s=this.selection,g=this.grid;
if(_b&&g._hasIdentity){
var id=g.store.getIdentity(_b);
if(this._selectedById[id]===undefined){
if(!this._trustSelection[_c]){
s.selected[_c]=this._defaultSelected;
}
}else{
s.selected[_c]=this._selectedById[id];
}
this._idMap.push(id);
g.onSelectedById(id,_c,s.selected[_c]);
}
},_selectById:function(_d,_e){
if(this.selection.mode=="none"||!this.grid._hasIdentity){
return;
}
var _f=_e;
if(typeof _e=="number"||typeof _e=="string"){
var _10=this.grid._by_idx[_e];
_f=_10&&_10.item;
}
if(_f){
var id=this.grid.store.getIdentity(_f);
this._selectedById[id]=!!_d;
}else{
this._trustSelection[_e]=true;
}
},onSelectedById:function(id,_11,_12){
},_updateMapping:function(_13,_14,_15,_16,to){
var s=this.selection,g=this.grid,_17=0,_18=0,i,id;
for(i=g.rowCount-1;i>=0;--i){
if(!g._by_idx[i]){
++_18;
_17+=s.selected[i]?1:-1;
}else{
id=g._by_idx[i].idty;
if(id&&(_13||this._selectedById[id]===undefined)){
this._selectedById[id]=!!s.selected[i];
}
}
}
if(_18){
this._defaultSelected=_17>0;
}
if(!_15&&_16!==undefined&&to!==undefined){
_15=!g.usingPagination&&Math.abs(to-_16+1)===g.rowCount;
}
if(_15&&!g.usingPagination){
for(i=this._idMap.length;i>=0;--i){
this._selectedById[this._idMap[i]]=_14;
}
}
}});
return _2.grid.enhanced.plugins._SelectionPreserver;
});
