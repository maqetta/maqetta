/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/Exporter",["dojo","dojox","../_Plugin","../../_RowSelector"],function(_1,_2){
_1.declare("dojox.grid.enhanced.plugins.Exporter",_2.grid.enhanced._Plugin,{name:"exporter",constructor:function(_3,_4){
this.grid=_3;
this.formatter=(_4&&_1.isObject(_4))&&_4.exportFormatter;
this._mixinGrid();
},_mixinGrid:function(){
var g=this.grid;
g.exportTo=_1.hitch(this,this.exportTo);
g.exportGrid=_1.hitch(this,this.exportGrid);
g.exportSelected=_1.hitch(this,this.exportSelected);
g.setExportFormatter=_1.hitch(this,this.setExportFormatter);
},setExportFormatter:function(_5){
this.formatter=_5;
},exportGrid:function(_6,_7,_8){
if(_1.isFunction(_7)){
_8=_7;
_7={};
}
if(!_1.isString(_6)||!_1.isFunction(_8)){
return;
}
_7=_7||{};
var g=this.grid,_9=this,_a=this._getExportWriter(_6,_7.writerArgs),_b=(_7.fetchArgs&&_1.isObject(_7.fetchArgs))?_7.fetchArgs:{},_c=_b.onComplete;
if(g.store){
_b.onComplete=function(_d,_e){
if(_c){
_c(_d,_e);
}
_8(_9._goThroughGridData(_d,_a));
};
_b.sort=_b.sort||g.getSortProps();
g._storeLayerFetch(_b);
}else{
var _f=_b.start||0,_10=_b.count||-1,_11=[];
for(var i=_f;i!=_f+_10&&i<g.rowCount;++i){
_11.push(g.getItem(i));
}
_8(this._goThroughGridData(_11,_a));
}
},exportSelected:function(_12,_13){
if(!_1.isString(_12)){
return "";
}
var _14=this._getExportWriter(_12,_13);
return this._goThroughGridData(this.grid.selection.getSelected(),_14);
},_buildRow:function(_15,_16){
var _17=this;
_1.forEach(_15._views,function(_18,_19){
_15.view=_18;
_15.viewIdx=_19;
if(_16.beforeView(_15)){
_1.forEach(_18.structure.cells,function(_1a,_1b){
_15.subrow=_1a;
_15.subrowIdx=_1b;
if(_16.beforeSubrow(_15)){
_1.forEach(_1a,function(_1c,_1d){
if(_15.isHeader&&_17._isSpecialCol(_1c)){
_15.spCols.push(_1c.index);
}
_15.cell=_1c;
_15.cellIdx=_1d;
_16.handleCell(_15);
});
_16.afterSubrow(_15);
}
});
_16.afterView(_15);
}
});
},_goThroughGridData:function(_1e,_1f){
var _20=this.grid,_21=_1.filter(_20.views.views,function(_22){
return !(_22 instanceof _2.grid._RowSelector);
}),_23={"grid":_20,"isHeader":true,"spCols":[],"_views":_21,"colOffset":(_21.length<_20.views.views.length?-1:0)};
if(_1f.beforeHeader(_20)){
this._buildRow(_23,_1f);
_1f.afterHeader();
}
_23.isHeader=false;
if(_1f.beforeContent(_1e)){
_1.forEach(_1e,function(_24,_25){
_23.row=_24;
_23.rowIdx=_25;
if(_1f.beforeContentRow(_23)){
this._buildRow(_23,_1f);
_1f.afterContentRow(_23);
}
},this);
_1f.afterContent();
}
return _1f.toString();
},_isSpecialCol:function(_26){
return _26.isRowSelector||_26 instanceof _2.grid.cells.RowIndex;
},_getExportWriter:function(_27,_28){
var _29,cls,_2a=_2.grid.enhanced.plugins.Exporter;
if(_2a.writerNames){
_29=_2a.writerNames[_27.toLowerCase()];
cls=_1.getObject(_29);
if(cls){
var _2b=new cls(_28);
_2b.formatter=this.formatter;
return _2b;
}else{
throw new Error("Please make sure class \""+_29+"\" is required.");
}
}
throw new Error("The writer for \""+_27+"\" has not been registered.");
}});
_2.grid.enhanced.plugins.Exporter.registerWriter=function(_2c,_2d){
var _2e=_2.grid.enhanced.plugins.Exporter;
_2e.writerNames=_2e.writerNames||{};
_2e.writerNames[_2c]=_2d;
};
_2.grid.EnhancedGrid.registerPlugin(_2.grid.enhanced.plugins.Exporter);
return _2.grid.enhanced.plugins.Exporter;
});
