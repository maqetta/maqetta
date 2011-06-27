/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/_SelectionPreserver",["dojo","dojox","../../_SelectionPreserver"],function(_1,_2,_3){
_1.declare("dojox.grid.enhanced.plugins._SelectionPreserver",_3,{constructor:function(_4){
var _5=this.grid;
_5.onSelectedById=this.onSelectedById;
this._oldClearData=_5._clearData;
var _6=this;
_5._clearData=function(){
_6._updateMapping(!_5._noInternalMapping);
_6._trustSelection=[];
_6._oldClearData.apply(_5,arguments);
};
this._connects.push(_1.connect(_4,"selectRange",_1.hitch(this,"_updateMapping",true,true,false)),_1.connect(_4,"deselectRange",_1.hitch(this,"_updateMapping",true,false,false)),_1.connect(_4,"deselectAll",_1.hitch(this,"_updateMapping",true,false,true)));
},destroy:function(){
this.inherited(arguments);
this.grid._clearData=this._oldClearData;
},reset:function(){
this.inherited(arguments);
this._idMap=[];
this._trustSelection=[];
this._defaultSelected=false;
},_reSelectById:function(_7,_8){
var s=this.selection,g=this.grid;
if(_7&&g._hasIdentity){
var id=g.store.getIdentity(_7);
if(this._selectedById[id]===undefined){
if(!this._trustSelection[_8]){
s.selected[_8]=this._defaultSelected;
}
}else{
s.selected[_8]=this._selectedById[id];
}
this._idMap.push(id);
g.onSelectedById(id,_8,s.selected[_8]);
}
},_selectById:function(_9,_a){
if(!this.inherited(arguments)){
this._trustSelection[_a]=true;
}
},onSelectedById:function(id,_b,_c){
},_updateMapping:function(_d,_e,_f,_10,to){
var s=this.selection,g=this.grid,_11=0,_12=0,i,id;
for(i=g.rowCount-1;i>=0;--i){
if(!g._by_idx[i]){
++_12;
_11+=s.selected[i]?1:-1;
}else{
id=g._by_idx[i].idty;
if(id&&(_d||this._selectedById[id]===undefined)){
this._selectedById[id]=!!s.selected[i];
}
}
}
if(_12){
this._defaultSelected=_11>0;
}
if(!_f&&_10!==undefined&&to!==undefined){
_f=!g.usingPagination&&Math.abs(to-_10+1)===g.rowCount;
}
if(_f&&(!g.usingPagination||g.selectionMode==="single")){
for(i=this._idMap.length-1;i>=0;--i){
this._selectedById[this._idMap[i]]=_e;
}
}
}});
return _2.grid.enhanced.plugins._SelectionPreserver;
});
