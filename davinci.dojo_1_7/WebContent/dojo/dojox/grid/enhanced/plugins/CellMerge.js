/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/CellMerge",["dojo","dojox","../_Plugin"],function(_1,_2){
_1.declare("dojox.grid.enhanced.plugins.CellMerge",_2.grid.enhanced._Plugin,{name:"cellMerge",constructor:function(_3,_4){
this.grid=_3;
this._records=[];
this._merged={};
if(_4&&_1.isObject(_4)){
this._setupConfig(_4.mergedCells);
}
this._initEvents();
this._mixinGrid();
},mergeCells:function(_5,_6,_7,_8){
var _9=this._createRecord({"row":_5,"start":_6,"end":_7,"major":_8});
if(_9){
this._updateRows(_9);
}
return _9;
},unmergeCells:function(_a){
var _b;
if(_a&&(_b=_1.indexOf(this._records,_a))>=0){
this._records.splice(_b,1);
this._updateRows(_a);
}
},getMergedCells:function(){
var _c=[];
for(var i in this._merged){
_c=_c.concat(this._merged[i]);
}
return _c;
},getMergedCellsByRow:function(_d){
return this._merged[_d]||[];
},_setupConfig:function(_e){
_1.forEach(_e,this._createRecord,this);
},_initEvents:function(){
_1.forEach(this.grid.views.views,function(_f){
this.connect(_f,"onAfterRow",_1.hitch(this,"_onAfterRow",_f.index));
},this);
},_mixinGrid:function(){
var g=this.grid;
g.mergeCells=_1.hitch(this,"mergeCells");
g.unmergeCells=_1.hitch(this,"unmergeCells");
g.getMergedCells=_1.hitch(this,"getMergedCells");
g.getMergedCellsByRow=_1.hitch(this,"getMergedCellsByRow");
},_getWidth:function(_10){
var _11=this.grid.layout.cells[_10].getHeaderNode();
return _1.position(_11).w;
},_onAfterRow:function(_12,_13,_14){
try{
if(_13<0){
return;
}
var _15=[],i,j,len=this._records.length,_16=this.grid.layout.cells;
for(i=0;i<len;++i){
var _17=this._records[i];
var _18=this.grid._by_idx[_13];
if(_17.view==_12&&_17.row(_13,_18&&_18.item,this.grid.store)){
var res={record:_17,hiddenCells:[],totalWidth:0,majorNode:_16[_17.major].getNode(_13),majorHeaderNode:_16[_17.major].getHeaderNode()};
for(j=_17.start;j<=_17.end;++j){
var w=this._getWidth(j,_13);
res.totalWidth+=w;
if(j!=_17.major){
res.hiddenCells.push(_16[j].getNode(_13));
}
}
if(_14.length!=1||res.totalWidth>0){
for(j=_15.length-1;j>=0;--j){
var r=_15[j].record;
if((r.start>=_17.start&&r.start<=_17.end)||(r.end>=_17.start&&r.end<=_17.end)){
_15.splice(j,1);
}
}
_15.push(res);
}
}
}
this._merged[_13]=[];
_1.forEach(_15,function(res){
_1.forEach(res.hiddenCells,function(_19){
_1.style(_19,"display","none");
});
var pbm=_1.marginBox(res.majorHeaderNode).w-_1.contentBox(res.majorHeaderNode).w;
var tw=res.totalWidth;
if(!_1.isWebKit){
tw-=pbm;
}
_1.style(res.majorNode,"width",tw+"px");
_1.attr(res.majorNode,"colspan",res.hiddenCells.length+1);
this._merged[_13].push({"row":_13,"start":res.record.start,"end":res.record.end,"major":res.record.major,"handle":res.record});
},this);
}
catch(e){
console.warn("CellMerge._onAfterRow() error: ",_13,e);
}
},_createRecord:function(_1a){
if(this._isValid(_1a)){
_1a={"row":_1a.row,"start":_1a.start,"end":_1a.end,"major":_1a.major};
var _1b=this.grid.layout.cells;
_1a.view=_1b[_1a.start].view.index;
_1a.major=typeof _1a.major=="number"&&!isNaN(_1a.major)?_1a.major:_1a.start;
if(typeof _1a.row=="number"){
var r=_1a.row;
_1a.row=function(_1c){
return _1c===r;
};
}else{
if(typeof _1a.row=="string"){
var id=_1a.row;
_1a.row=function(_1d,_1e,_1f){
try{
if(_1f&&_1e&&_1f.getFeatures()["dojo.data.api.Identity"]){
return _1f.getIdentity(_1e)==id;
}
}
catch(e){
console.error(e);
}
return false;
};
}
}
if(_1.isFunction(_1a.row)){
this._records.push(_1a);
return _1a;
}
}
return null;
},_isValid:function(_20){
var _21=this.grid.layout.cells,_22=_21.length;
return (_1.isObject(_20)&&("row" in _20)&&("start" in _20)&&("end" in _20)&&_20.start>=0&&_20.start<_22&&_20.end>_20.start&&_20.end<_22&&_21[_20.start].view.index==_21[_20.end].view.index&&_21[_20.start].subrow==_21[_20.end].subrow&&!(typeof _20.major=="number"&&(_20.major<_20.start||_20.major>_20.end)));
},_updateRows:function(_23){
var min=null;
for(var i=0,_24=this.grid.rowCount;i<_24;++i){
var _25=this.grid._by_idx[i];
if(_25&&_23.row(i,_25&&_25.item,this.grid.store)){
this.grid.views.updateRow(i);
if(min===null){
min=i;
}
}
}
if(min>=0){
this.grid.scroller.rowHeightChanged(min);
}
}});
_2.grid.EnhancedGrid.registerPlugin(_2.grid.enhanced.plugins.CellMerge);
return _2.grid.enhanced.plugins.CellMerge;
});
