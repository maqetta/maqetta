/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/Selector",["dojo","dijit","dojox","dijit/focus","../../cells/_base","../_Plugin","./AutoScroll"],function(_1,_2,_3){
var _4=0,_5=1,_6=2,_7={col:"row",row:"col"},_8=function(_9,_a,_b,_c,_d){
if(_9!=="cell"){
_a=_a[_9];
_b=_b[_9];
_c=_c[_9];
if(typeof _a!=="number"||typeof _b!=="number"||typeof _c!=="number"){
return false;
}
return _d?((_a>=_b&&_a<_c)||(_a>_c&&_a<=_b)):((_a>=_b&&_a<=_c)||(_a>=_c&&_a<=_b));
}else{
return _8("col",_a,_b,_c,_d)&&_8("row",_a,_b,_c,_d);
}
},_e=function(_f,v1,v2){
try{
if(v1&&v2){
switch(_f){
case "col":
case "row":
return v1[_f]==v2[_f]&&typeof v1[_f]=="number"&&!(_7[_f] in v1)&&!(_7[_f] in v2);
case "cell":
return v1.col==v2.col&&v1.row==v2.row&&typeof v1.col=="number"&&typeof v1.row=="number";
}
}
}
catch(e){
}
return false;
},_10=function(evt){
try{
if(evt&&evt.preventDefault){
_1.stopEvent(evt);
}
}
catch(e){
}
},_11=function(_12,_13,_14){
switch(_12){
case "col":
return {"col":typeof _14=="undefined"?_13:_14,"except":[]};
case "row":
return {"row":_13,"except":[]};
case "cell":
return {"row":_13,"col":_14};
}
return null;
};
_1.declare("dojox.grid.enhanced.plugins.Selector",_3.grid.enhanced._Plugin,{name:"selector",constructor:function(_15,_16){
this.grid=_15;
this._config={row:_6,col:_6,cell:_6};
this.setupConfig(_16);
if(_15.selectionMode==="single"){
this._config.row=_5;
}
this._enabled=true;
this._selecting={};
this._selected={"col":[],"row":[],"cell":[]};
this._startPoint={};
this._currentPoint={};
this._lastAnchorPoint={};
this._lastEndPoint={};
this._lastSelectedAnchorPoint={};
this._lastSelectedEndPoint={};
this._keyboardSelect={};
this._lastType=null;
this._selectedRowModified={};
this._hacks();
this._initEvents();
this._initAreas();
this._mixinGrid();
},destroy:function(){
this.inherited(arguments);
},setupConfig:function(_17){
if(!_17||!_1.isObject(_17)){
return;
}
var _18=["row","col","cell"];
for(var _19 in _17){
if(_1.indexOf(_18,_19)>=0){
if(!_17[_19]||_17[_19]=="disabled"){
this._config[_19]=_4;
}else{
if(_17[_19]=="single"){
this._config[_19]=_5;
}else{
this._config[_19]=_6;
}
}
}
}
var _1a=["none","single","extended"][this._config.row];
this.grid.selection.setMode(_1a);
},isSelected:function(_1b,_1c,_1d){
return this._isSelected(_1b,_11(_1b,_1c,_1d));
},toggleSelect:function(_1e,_1f,_20){
this._startSelect(_1e,_11(_1e,_1f,_20),this._config[_1e]===_6,false,false,!this.isSelected(_1e,_1f,_20));
this._endSelect(_1e);
},select:function(_21,_22,_23){
if(!this.isSelected(_21,_22,_23)){
this.toggleSelect(_21,_22,_23);
}
},deselect:function(_24,_25,_26){
if(this.isSelected(_24,_25,_26)){
this.toggleSelect(_24,_25,_26);
}
},selectRange:function(_27,_28,end,_29){
this.grid._selectingRange=true;
var _2a=_27=="cell"?_11(_27,_28.row,_28.col):_11(_27,_28),_2b=_27=="cell"?_11(_27,end.row,end.col):_11(_27,end);
this._startSelect(_27,_2a,false,false,false,_29);
this._highlight(_27,_2b,_29===undefined?true:_29);
this._endSelect(_27);
this.grid._selectingRange=false;
},clear:function(_2c){
this._clearSelection(_2c||"all");
},isSelecting:function(_2d){
if(typeof _2d=="undefined"){
return this._selecting.col||this._selecting.row||this._selecting.cell;
}
return this._selecting[_2d];
},selectEnabled:function(_2e){
if(typeof _2e!="undefined"&&!this.isSelecting()){
this._enabled=!!_2e;
}
return this._enabled;
},getSelected:function(_2f,_30){
switch(_2f){
case "cell":
return _1.map(this._selected[_2f],function(_31){
return _31;
});
case "col":
case "row":
return _1.map(_30?this._selected[_2f]:_1.filter(this._selected[_2f],function(_32){
return _32.except.length===0;
}),function(_33){
return _30?_33:_33[_2f];
});
}
return [];
},getSelectedCount:function(_34,_35){
switch(_34){
case "cell":
return this._selected[_34].length;
case "col":
case "row":
return (_35?this._selected[_34]:_1.filter(this._selected[_34],function(_36){
return _36.except.length===0;
})).length;
}
return 0;
},getSelectedType:function(){
var s=this._selected;
return ["","cell","row","row|cell","col","col|cell","col|row","col|row|cell"][(!!s.cell.length)|(!!s.row.length<<1)|(!!s.col.length<<2)];
},getLastSelectedRange:function(_37){
return this._lastAnchorPoint[_37]?{"start":this._lastAnchorPoint[_37],"end":this._lastEndPoint[_37]}:null;
},_hacks:function(){
var g=this.grid;
var _38=function(e){
if(e.cellNode){
g.onMouseUp(e);
}
g.onMouseUpRow(e);
};
var _39=_1.hitch(g,"onMouseUp");
var _3a=_1.hitch(g,"onMouseDown");
var _3b=function(e){
e.cellNode.style.border="solid 1px";
};
_1.forEach(g.views.views,function(_3c){
_3c.content.domouseup=_38;
_3c.header.domouseup=_39;
if(_3c.declaredClass=="dojox.grid._RowSelector"){
_3c.domousedown=_3a;
_3c.domouseup=_39;
_3c.dofocus=_3b;
}
});
g.selection.clickSelect=function(){
};
this._oldDeselectAll=g.selection.deselectAll;
var _3d=this;
g.selection.selectRange=function(_3e,to){
_3d.selectRange("row",_3e,to,true);
if(g.selection.preserver){
g.selection.preserver._updateMapping(true,true,false,_3e,to);
}
g.selection.onChanged();
};
g.selection.deselectRange=function(_3f,to){
_3d.selectRange("row",_3f,to,false);
if(g.selection.preserver){
g.selection.preserver._updateMapping(true,false,false,_3f,to);
}
g.selection.onChanged();
};
g.selection.deselectAll=function(){
g._selectingRange=true;
_3d._oldDeselectAll.apply(g.selection,arguments);
_3d._clearSelection("row");
g._selectingRange=false;
if(g.selection.preserver){
g.selection.preserver._updateMapping(true,false,true);
}
g.selection.onChanged();
};
var _40=g.views.views[0];
if(_40 instanceof _3.grid._RowSelector){
_40.doStyleRowNode=function(_41,_42){
_1.removeClass(_42,"dojoxGridRow");
_1.addClass(_42,"dojoxGridRowbar");
_1.addClass(_42,"dojoxGridNonNormalizedCell");
_1.toggleClass(_42,"dojoxGridRowbarOver",g.rows.isOver(_41));
_1.toggleClass(_42,"dojoxGridRowbarSelected",!!g.selection.isSelected(_41));
};
}
this.connect(g,"updateRow",function(_43){
_1.forEach(g.layout.cells,function(_44){
if(this.isSelected("cell",_43,_44.index)){
this._highlightNode(_44.getNode(_43),true);
}
},this);
});
},_mixinGrid:function(){
var g=this.grid;
g.setupSelectorConfig=_1.hitch(this,this.setupConfig);
g.onStartSelect=function(){
};
g.onEndSelect=function(){
};
g.onStartDeselect=function(){
};
g.onEndDeselect=function(){
};
g.onSelectCleared=function(){
};
},_initEvents:function(){
var g=this.grid,_45=this,dp=_1.partial,_46=function(_47,e){
if(_47==="row"){
_45._isUsingRowSelector=true;
}
if(_45.selectEnabled()&&_45._config[_47]&&e.button!=2){
if(_45._keyboardSelect.col||_45._keyboardSelect.row||_45._keyboardSelect.cell){
_45._endSelect("all");
_45._keyboardSelect.col=_45._keyboardSelect.row=_45._keyboardSelect.cell=0;
}
if(_45._usingKeyboard){
_45._usingKeyboard=false;
}
var _48=_11(_47,e.rowIndex,e.cell&&e.cell.index);
_45._startSelect(_47,_48,e.ctrlKey,e.shiftKey);
}
},_49=_1.hitch(this,"_endSelect");
this.connect(g,"onHeaderCellMouseDown",dp(_46,"col"));
this.connect(g,"onHeaderCellMouseUp",dp(_49,"col"));
this.connect(g,"onRowSelectorMouseDown",dp(_46,"row"));
this.connect(g,"onRowSelectorMouseUp",dp(_49,"row"));
this.connect(g,"onCellMouseDown",function(e){
if(e.cell&&e.cell.isRowSelector){
return;
}
if(g.singleClickEdit){
_45._singleClickEdit=true;
g.singleClickEdit=false;
}
_46(_45._config["cell"]==_4?"row":"cell",e);
});
this.connect(g,"onCellMouseUp",function(e){
if(_45._singleClickEdit){
delete _45._singleClickEdit;
g.singleClickEdit=true;
}
_49("all",e);
});
this.connect(g,"onCellMouseOver",function(e){
if(_45._curType!="row"&&_45._selecting[_45._curType]&&_45._config[_45._curType]==_6){
_45._highlight("col",_11("col",e.cell.index),_45._toSelect);
if(!_45._keyboardSelect.cell){
_45._highlight("cell",_11("cell",e.rowIndex,e.cell.index),_45._toSelect);
}
}
});
this.connect(g,"onHeaderCellMouseOver",function(e){
if(_45._selecting.col&&_45._config.col==_6){
_45._highlight("col",_11("col",e.cell.index),_45._toSelect);
}
});
this.connect(g,"onRowMouseOver",function(e){
if(_45._selecting.row&&_45._config.row==_6){
_45._highlight("row",_11("row",e.rowIndex),_45._toSelect);
}
});
this.connect(g,"onSelectedById","_onSelectedById");
this.connect(g,"_onFetchComplete",function(){
if(!g._notRefreshSelection){
this._refreshSelected(true);
}
});
this.connect(g.scroller,"buildPage",function(){
if(!g._notRefreshSelection){
this._refreshSelected(true);
}
});
this.connect(_1.doc,"onmouseup",dp(_49,"all"));
this.connect(g,"onEndAutoScroll",function(_4a,_4b,_4c,_4d){
var _4e=_45._selecting.cell,_4f,_50,dir=_4b?1:-1;
if(_4a&&(_4e||_45._selecting.row)){
_4f=_4e?"cell":"row";
_50=_45._currentPoint[_4f];
_45._highlight(_4f,_11(_4f,_50.row+dir,_50.col),_45._toSelect);
}else{
if(!_4a&&(_4e||_45._selecting.col)){
_4f=_4e?"cell":"col";
_50=_45._currentPoint[_4f];
_45._highlight(_4f,_11(_4f,_50.row,_4d),_45._toSelect);
}
}
});
this.subscribe("dojox/grid/rearrange/move/"+g.id,"_onInternalRearrange");
this.subscribe("dojox/grid/rearrange/copy/"+g.id,"_onInternalRearrange");
this.subscribe("dojox/grid/rearrange/change/"+g.id,"_onExternalChange");
this.subscribe("dojox/grid/rearrange/insert/"+g.id,"_onExternalChange");
this.subscribe("dojox/grid/rearrange/remove/"+g.id,"clear");
this.connect(g,"onSelected",function(_51){
if(this._selectedRowModified&&this._isUsingRowSelector){
delete this._selectedRowModified;
}else{
if(!this.grid._selectingRange){
this.select("row",_51);
}
}
});
this.connect(g,"onDeselected",function(_52){
if(this._selectedRowModified&&this._isUsingRowSelector){
delete this._selectedRowModified;
}else{
if(!this.grid._selectingRange){
this.deselect("row",_52);
}
}
});
},_onSelectedById:function(id,_53,_54){
if(this.grid._noInternalMapping){
return;
}
var _55=[this._lastAnchorPoint.row,this._lastEndPoint.row,this._lastSelectedAnchorPoint.row,this._lastSelectedEndPoint.row];
_55=_55.concat(this._selected.row);
var _56=false;
_1.forEach(_55,function(_57){
if(_57){
if(_57.id===id){
_56=true;
_57.row=_53;
}else{
if(_57.row===_53&&_57.id){
_57.row=-1;
}
}
}
});
if(!_56&&_54){
_1.some(this._selected.row,function(_58){
if(_58&&!_58.id&&!_58.except.length){
_58.id=id;
_58.row=_53;
return true;
}
return false;
});
}
_56=false;
_55=[this._lastAnchorPoint.cell,this._lastEndPoint.cell,this._lastSelectedAnchorPoint.cell,this._lastSelectedEndPoint.cell];
_55=_55.concat(this._selected.cell);
_1.forEach(_55,function(_59){
if(_59){
if(_59.id===id){
_56=true;
_59.row=_53;
}else{
if(_59.row===_53&&_59.id){
_59.row=-1;
}
}
}
});
},onSetStore:function(){
this._clearSelection("all");
},_onInternalRearrange:function(_5a,_5b){
try{
this._refresh("col",false);
_1.forEach(this._selected.row,function(_5c){
_1.forEach(this.grid.layout.cells,function(_5d){
this._highlightNode(_5d.getNode(_5c.row),false);
},this);
},this);
_1.query(".dojoxGridRowSelectorSelected").forEach(function(_5e){
_1.removeClass(_5e,"dojoxGridRowSelectorSelected");
_1.removeClass(_5e,"dojoxGridRowSelectorSelectedUp");
_1.removeClass(_5e,"dojoxGridRowSelectorSelectedDown");
});
var _5f=function(_60){
if(_60){
delete _60.converted;
}
},_61=[this._lastAnchorPoint[_5a],this._lastEndPoint[_5a],this._lastSelectedAnchorPoint[_5a],this._lastSelectedEndPoint[_5a]];
if(_5a==="cell"){
this.selectRange("cell",_5b.to.min,_5b.to.max);
var _62=this.grid.layout.cells;
_1.forEach(_61,function(_63){
if(_63.converted){
return;
}
for(var r=_5b.from.min.row,tr=_5b.to.min.row;r<=_5b.from.max.row;++r,++tr){
for(var c=_5b.from.min.col,tc=_5b.to.min.col;c<=_5b.from.max.col;++c,++tc){
while(_62[c].hidden){
++c;
}
while(_62[tc].hidden){
++tc;
}
if(_63.row==r&&_63.col==c){
_63.row=tr;
_63.col=tc;
_63.converted=true;
return;
}
}
}
});
}else{
_61=this._selected.cell.concat(this._selected[_5a]).concat(_61).concat([this._lastAnchorPoint.cell,this._lastEndPoint.cell,this._lastSelectedAnchorPoint.cell,this._lastSelectedEndPoint.cell]);
_1.forEach(_61,function(_64){
if(_64&&!_64.converted){
var _65=_64[_5a];
if(_65 in _5b){
_64[_5a]=_5b[_65];
}
_64.converted=true;
}
});
_1.forEach(this._selected[_7[_5a]],function(_66){
for(var i=0,len=_66.except.length;i<len;++i){
var _67=_66.except[i];
if(_67 in _5b){
_66.except[i]=_5b[_67];
}
}
});
}
_1.forEach(_61,_5f);
this._refreshSelected(true);
this._focusPoint(_5a,this._lastEndPoint);
}
catch(e){
console.warn("Selector._onInternalRearrange() error",e);
}
},_onExternalChange:function(_68,_69){
var _6a=_68=="cell"?_69.min:_69[0],end=_68=="cell"?_69.max:_69[_69.length-1];
this.selectRange(_68,_6a,end);
},_refresh:function(_6b,_6c){
if(!this._keyboardSelect[_6b]){
_1.forEach(this._selected[_6b],function(_6d){
this._highlightSingle(_6b,_6c,_6d,undefined,true);
},this);
}
},_refreshSelected:function(){
this._refresh("col",true);
this._refresh("row",true);
this._refresh("cell",true);
},_initAreas:function(){
var g=this.grid,f=g.focus,_6e=this,dk=_1.keys,_6f=1,_70=2,_71=function(_72,_73,_74,_75,evt){
var ks=_6e._keyboardSelect;
if(evt.shiftKey&&ks[_72]){
if(ks[_72]===_6f){
if(_72==="cell"){
var _76=_6e._lastEndPoint[_72];
if(f.cell!=g.layout.cells[_76.col+_75]||f.rowIndex!=_76.row+_74){
ks[_72]=0;
return;
}
}
_6e._startSelect(_72,_6e._lastAnchorPoint[_72],true,false,true);
_6e._highlight(_72,_6e._lastEndPoint[_72],_6e._toSelect);
ks[_72]=_70;
}
var _77=_73(_72,_74,_75,evt);
if(_6e._isValid(_72,_77,g)){
_6e._highlight(_72,_77,_6e._toSelect);
}
_10(evt);
}
},_78=function(_79,_7a,evt,_7b){
if(_7b&&_6e.selectEnabled()&&_6e._config[_79]!=_4){
switch(evt.keyCode){
case dk.SPACE:
_6e._startSelect(_79,_7a(),evt.ctrlKey,evt.shiftKey);
_6e._endSelect(_79);
break;
case dk.SHIFT:
if(_6e._config[_79]==_6&&_6e._isValid(_79,_6e._lastAnchorPoint[_79],g)){
_6e._endSelect(_79);
_6e._keyboardSelect[_79]=_6f;
_6e._usingKeyboard=true;
}
}
}
},_7c=function(_7d,evt,_7e){
if(_7e&&evt.keyCode==_1.keys.SHIFT&&_6e._keyboardSelect[_7d]){
_6e._endSelect(_7d);
_6e._keyboardSelect[_7d]=0;
}
};
if(g.views.views[0] instanceof _3.grid._RowSelector){
this._lastFocusedRowBarIdx=0;
f.addArea({name:"rowHeader",onFocus:function(evt,_7f){
var _80=g.views.views[0];
if(_80 instanceof _3.grid._RowSelector){
var _81=_80.getCellNode(_6e._lastFocusedRowBarIdx,0);
if(_81){
_1.toggleClass(_81,f.focusClass,false);
}
if(evt&&"rowIndex" in evt){
if(evt.rowIndex>=0){
_6e._lastFocusedRowBarIdx=evt.rowIndex;
}else{
if(!_6e._lastFocusedRowBarIdx){
_6e._lastFocusedRowBarIdx=0;
}
}
}
_81=_80.getCellNode(_6e._lastFocusedRowBarIdx,0);
if(_81){
_2.focus(_81);
_1.toggleClass(_81,f.focusClass,true);
}
f.rowIndex=_6e._lastFocusedRowBarIdx;
_10(evt);
return true;
}
return false;
},onBlur:function(evt,_82){
var _83=g.views.views[0];
if(_83 instanceof _3.grid._RowSelector){
var _84=_83.getCellNode(_6e._lastFocusedRowBarIdx,0);
if(_84){
_1.toggleClass(_84,f.focusClass,false);
}
_10(evt);
}
return true;
},onMove:function(_85,_86,evt){
var _87=g.views.views[0];
if(_85&&_87 instanceof _3.grid._RowSelector){
var _88=_6e._lastFocusedRowBarIdx+_85;
if(_88>=0&&_88<g.rowCount){
_10(evt);
var _89=_87.getCellNode(_6e._lastFocusedRowBarIdx,0);
_1.toggleClass(_89,f.focusClass,false);
var sc=g.scroller;
var _8a=sc.getLastPageRow(sc.page);
var rc=g.rowCount-1,row=Math.min(rc,_88);
if(_88>_8a){
g.setScrollTop(g.scrollTop+sc.findScrollTop(row)-sc.findScrollTop(_6e._lastFocusedRowBarIdx));
}
_89=_87.getCellNode(_88,0);
_2.focus(_89);
_1.toggleClass(_89,f.focusClass,true);
_6e._lastFocusedRowBarIdx=_88;
f.cell=_89;
f.cell.view=_87;
f.cell.getNode=function(_8b){
return f.cell;
};
f.rowIndex=_6e._lastFocusedRowBarIdx;
f.scrollIntoView();
f.cell=null;
}
}
}});
f.placeArea("rowHeader","before","content");
}
f.addArea({name:"cellselect",onMove:_1.partial(_71,"cell",function(_8c,_8d,_8e,evt){
var _8f=_6e._currentPoint[_8c];
return _11("cell",_8f.row+_8d,_8f.col+_8e);
}),onKeyDown:_1.partial(_78,"cell",function(){
return _11("cell",f.rowIndex,f.cell.index);
}),onKeyUp:_1.partial(_7c,"cell")});
f.placeArea("cellselect","below","content");
f.addArea({name:"colselect",onMove:_1.partial(_71,"col",function(_90,_91,_92,evt){
var _93=_6e._currentPoint[_90];
return _11("col",_93.col+_92);
}),onKeyDown:_1.partial(_78,"col",function(){
return _11("col",f.getHeaderIndex());
}),onKeyUp:_1.partial(_7c,"col")});
f.placeArea("colselect","below","header");
f.addArea({name:"rowselect",onMove:_1.partial(_71,"row",function(_94,_95,_96,evt){
return _11("row",f.rowIndex);
}),onKeyDown:_1.partial(_78,"row",function(){
return _11("row",f.rowIndex);
}),onKeyUp:_1.partial(_7c,"row")});
f.placeArea("rowselect","below","rowHeader");
},_clearSelection:function(_97,_98){
if(_97=="all"){
this._clearSelection("cell",_98);
this._clearSelection("col",_98);
this._clearSelection("row",_98);
return;
}
this._isUsingRowSelector=true;
_1.forEach(this._selected[_97],function(_99){
if(!_e(_97,_98,_99)){
this._highlightSingle(_97,false,_99);
}
},this);
this._blurPoint(_97,this._currentPoint);
this._selecting[_97]=false;
this._startPoint[_97]=this._currentPoint[_97]=null;
this._selected[_97]=[];
if(_97=="row"&&!this.grid._selectingRange){
this._oldDeselectAll.call(this.grid.selection);
this.grid.selection._selectedById={};
}
this.grid.onEndDeselect(_97,null,null,this._selected);
this.grid.onSelectCleared(_97);
},_startSelect:function(_9a,_9b,_9c,_9d,_9e,_9f){
if(!this._isValid(_9a,_9b)){
return;
}
var _a0=this._isSelected(_9a,this._lastEndPoint[_9a]),_a1=this._isSelected(_9a,_9b);
this._toSelect=_9e?_a1:!_a1;
if(!_9c||(!_a1&&this._config[_9a]==_5)){
this._clearSelection("all",_9b);
this._toSelect=_9f===undefined?true:_9f;
}
this._selecting[_9a]=true;
this._currentPoint[_9a]=null;
if(_9d&&this._lastType==_9a&&_a0==this._toSelect){
if(_9a==="row"){
this._isUsingRowSelector=true;
}
this._startPoint[_9a]=this._lastEndPoint[_9a];
this._highlight(_9a,this._startPoint[_9a]);
this._isUsingRowSelector=false;
}else{
this._startPoint[_9a]=_9b;
}
this._curType=_9a;
this._fireEvent("start",_9a);
this._isStartFocus=true;
this._isUsingRowSelector=true;
this._highlight(_9a,_9b,this._toSelect);
this._isStartFocus=false;
},_endSelect:function(_a2){
if(_a2==="row"){
delete this._isUsingRowSelector;
}
if(_a2=="all"){
this._endSelect("col");
this._endSelect("row");
this._endSelect("cell");
}else{
if(this._selecting[_a2]){
this._addToSelected(_a2);
this._lastAnchorPoint[_a2]=this._startPoint[_a2];
this._lastEndPoint[_a2]=this._currentPoint[_a2];
if(this._toSelect){
this._lastSelectedAnchorPoint[_a2]=this._lastAnchorPoint[_a2];
this._lastSelectedEndPoint[_a2]=this._lastEndPoint[_a2];
}
this._startPoint[_a2]=this._currentPoint[_a2]=null;
this._selecting[_a2]=false;
this._lastType=_a2;
this._fireEvent("end",_a2);
}
}
},_fireEvent:function(_a3,_a4){
switch(_a3){
case "start":
this.grid[this._toSelect?"onStartSelect":"onStartDeselect"](_a4,this._startPoint[_a4],this._selected);
break;
case "end":
this.grid[this._toSelect?"onEndSelect":"onEndDeselect"](_a4,this._lastAnchorPoint[_a4],this._lastEndPoint[_a4],this._selected);
break;
}
},_calcToHighlight:function(_a5,_a6,_a7,_a8){
if(_a8!==undefined){
var _a9;
if(this._usingKeyboard&&!_a7){
var _aa=this._isInLastRange(this._lastType,_a6);
if(_aa){
_a9=this._isSelected(_a5,_a6);
if(_a8&&_a9){
return false;
}
if(!_a8&&!_a9&&this._isInLastRange(this._lastType,_a6,true)){
return true;
}
}
}
return _a7?_a8:(_a9||this._isSelected(_a5,_a6));
}
return _a7;
},_highlightNode:function(_ab,_ac){
if(_ab){
var _ad="dojoxGridRowSelected";
var _ae="dojoxGridCellSelected";
_1.toggleClass(_ab,_ad,_ac);
_1.toggleClass(_ab,_ae,_ac);
}
},_highlightHeader:function(_af,_b0){
var _b1=this.grid.layout.cells;
var _b2=_b1[_af].getHeaderNode();
var _b3="dojoxGridHeaderSelected";
_1.toggleClass(_b2,_b3,_b0);
},_highlightRowSelector:function(_b4,_b5){
var _b6=this.grid.views.views[0];
if(_b6 instanceof _3.grid._RowSelector){
var _b7=_b6.getRowNode(_b4);
if(_b7){
var _b8="dojoxGridRowSelectorSelected";
_1.toggleClass(_b7,_b8,_b5);
}
}
},_highlightSingle:function(_b9,_ba,_bb,_bc,_bd){
var _be=this,_bf,g=_be.grid,_c0=g.layout.cells;
switch(_b9){
case "cell":
_bf=this._calcToHighlight(_b9,_bb,_ba,_bc);
var c=_c0[_bb.col];
if(!c.hidden&&!c.notselectable){
this._highlightNode(_bb.node||c.getNode(_bb.row),_bf);
}
break;
case "col":
_bf=this._calcToHighlight(_b9,_bb,_ba,_bc);
this._highlightHeader(_bb.col,_bf);
_1.query("td[idx='"+_bb.col+"']",g.domNode).forEach(function(_c1){
var _c2=_c0[_bb.col].view.content.findRowTarget(_c1);
if(_c2){
var _c3=_c2[_3.grid.util.rowIndexTag];
_be._highlightSingle("cell",_bf,{"row":_c3,"col":_bb.col,"node":_c1});
}
});
break;
case "row":
_bf=this._calcToHighlight(_b9,_bb,_ba,_bc);
this._highlightRowSelector(_bb.row,_bf);
_1.forEach(_c0,function(_c4){
_be._highlightSingle("cell",_bf,{"row":_bb.row,"col":_c4.index,"node":_c4.getNode(_bb.row)});
});
this._selectedRowModified=true;
if(!_bd){
g.selection.setSelected(_bb.row,_bf);
}
}
},_highlight:function(_c5,_c6,_c7){
if(this._selecting[_c5]&&_c6!==null){
var _c8=this._startPoint[_c5],_c9=this._currentPoint[_c5],_ca=this,_cb=function(_cc,to,_cd){
_ca._forEach(_c5,_cc,to,function(_ce){
_ca._highlightSingle(_c5,_cd,_ce,_c7);
},true);
};
switch(_c5){
case "col":
case "row":
if(_c9!==null){
if(_8(_c5,_c6,_c8,_c9,true)){
_cb(_c9,_c6,false);
}else{
if(_8(_c5,_c8,_c6,_c9,true)){
_cb(_c9,_c8,false);
_c9=_c8;
}
_cb(_c6,_c9,true);
}
}else{
this._highlightSingle(_c5,true,_c6,_c7);
}
break;
case "cell":
if(_c9!==null){
if(_8("row",_c6,_c8,_c9,true)||_8("col",_c6,_c8,_c9,true)||_8("row",_c8,_c6,_c9,true)||_8("col",_c8,_c6,_c9,true)){
_cb(_c8,_c9,false);
}
}
_cb(_c8,_c6,true);
}
this._currentPoint[_c5]=_c6;
this._focusPoint(_c5,this._currentPoint);
}
},_focusPoint:function(_cf,_d0){
if(!this._isStartFocus){
var _d1=_d0[_cf],f=this.grid.focus;
if(_cf=="col"){
f._colHeadFocusIdx=_d1.col;
f.focusArea("header");
}else{
if(_cf=="row"){
f.focusArea("rowHeader",{"rowIndex":_d1.row});
}else{
if(_cf=="cell"){
f.setFocusIndex(_d1.row,_d1.col);
}
}
}
}
},_blurPoint:function(_d2,_d3){
var f=this.grid.focus;
if(_d2=="col"){
f._blurHeader();
}else{
if(_d2=="cell"){
f._blurContent();
}
}
},_addToSelected:function(_d4){
var _d5=this._toSelect,_d6=this,_d7=[],_d8=[],_d9=this._startPoint[_d4],end=this._currentPoint[_d4];
if(this._usingKeyboard){
this._forEach(_d4,this._lastAnchorPoint[_d4],this._lastEndPoint[_d4],function(_da){
if(!_8(_d4,_da,_d9,end)){
(_d5?_d8:_d7).push(_da);
}
});
}
this._forEach(_d4,_d9,end,function(_db){
var _dc=_d6._isSelected(_d4,_db);
if(_d5&&!_dc){
_d7.push(_db);
}else{
if(!_d5){
_d8.push(_db);
}
}
});
this._add(_d4,_d7);
this._remove(_d4,_d8);
_1.forEach(this._selected.row,function(_dd){
if(_dd.except.length>0){
this._selectedRowModified=true;
this.grid.selection.setSelected(_dd.row,false);
}
},this);
},_forEach:function(_de,_df,end,_e0,_e1){
if(!this._isValid(_de,_df,true)||!this._isValid(_de,end,true)){
return;
}
switch(_de){
case "col":
case "row":
_df=_df[_de];
end=end[_de];
var dir=end>_df?1:-1;
if(!_e1){
end+=dir;
}
for(;_df!=end;_df+=dir){
_e0(_11(_de,_df));
}
break;
case "cell":
var _e2=end.col>_df.col?1:-1,_e3=end.row>_df.row?1:-1;
for(var i=_df.row,p=end.row+_e3;i!=p;i+=_e3){
for(var j=_df.col,q=end.col+_e2;j!=q;j+=_e2){
_e0(_11(_de,i,j));
}
}
}
},_makeupForExceptions:function(_e4,_e5){
var _e6=[];
_1.forEach(this._selected[_e4],function(v1){
_1.forEach(_e5,function(v2){
if(v1[_e4]==v2[_e4]){
var pos=_1.indexOf(v1.except,v2[_7[_e4]]);
if(pos>=0){
v1.except.splice(pos,1);
}
_e6.push(v2);
}
});
});
return _e6;
},_makeupForCells:function(_e7,_e8){
var _e9=[];
_1.forEach(this._selected.cell,function(v1){
_1.some(_e8,function(v2){
if(v1[_e7]==v2[_e7]){
_e9.push(v1);
return true;
}
return false;
});
});
this._remove("cell",_e9);
_1.forEach(this._selected[_7[_e7]],function(v1){
_1.forEach(_e8,function(v2){
var pos=_1.indexOf(v1.except,v2[_e7]);
if(pos>=0){
v1.except.splice(pos,1);
}
});
});
},_addException:function(_ea,_eb){
_1.forEach(this._selected[_ea],function(v1){
_1.forEach(_eb,function(v2){
v1.except.push(v2[_7[_ea]]);
});
});
},_addCellException:function(_ec,_ed){
_1.forEach(this._selected[_ec],function(v1){
_1.forEach(_ed,function(v2){
if(v1[_ec]==v2[_ec]){
v1.except.push(v2[_7[_ec]]);
}
});
});
},_add:function(_ee,_ef){
var _f0=this.grid.layout.cells;
if(_ee=="cell"){
var _f1=this._makeupForExceptions("col",_ef);
var _f2=this._makeupForExceptions("row",_ef);
_ef=_1.filter(_ef,function(_f3){
return _1.indexOf(_f1,_f3)<0&&_1.indexOf(_f2,_f3)<0&&!_f0[_f3.col].hidden&&!_f0[_f3.col].notselectable;
});
}else{
if(_ee=="col"){
_ef=_1.filter(_ef,function(_f4){
return !_f0[_f4.col].hidden&&!_f0[_f4.col].notselectable;
});
}
this._makeupForCells(_ee,_ef);
this._selected[_ee]=_1.filter(this._selected[_ee],function(v){
return _1.every(_ef,function(_f5){
return v[_ee]!==_f5[_ee];
});
});
}
if(_ee!="col"&&this.grid._hasIdentity){
_1.forEach(_ef,function(_f6){
var _f7=this.grid._by_idx[_f6.row];
if(_f7){
_f6.id=_f7.idty;
}
},this);
}
this._selected[_ee]=this._selected[_ee].concat(_ef);
},_remove:function(_f8,_f9){
var _fa=_1.partial(_e,_f8);
this._selected[_f8]=_1.filter(this._selected[_f8],function(v1){
return !_1.some(_f9,function(v2){
return _fa(v1,v2);
});
});
if(_f8=="cell"){
this._addCellException("col",_f9);
this._addCellException("row",_f9);
}else{
this._addException(_7[_f8],_f9);
}
},_isCellNotInExcept:function(_fb,_fc){
var _fd=_fc[_fb],_fe=_fc[_7[_fb]];
return _1.some(this._selected[_fb],function(v){
return v[_fb]==_fd&&_1.indexOf(v.except,_fe)<0;
});
},_isSelected:function(_ff,item){
if(!item){
return false;
}
var res=_1.some(this._selected[_ff],function(v){
var ret=_e(_ff,item,v);
if(ret&&_ff!=="cell"){
return v.except.length===0;
}
return ret;
});
if(!res&&_ff==="cell"){
res=(this._isCellNotInExcept("col",item)||this._isCellNotInExcept("row",item));
if(_ff==="cell"){
res=res&&!this.grid.layout.cells[item.col].notselectable;
}
}
return res;
},_isInLastRange:function(type,item,_100){
var _101=this[_100?"_lastSelectedAnchorPoint":"_lastAnchorPoint"][type],end=this[_100?"_lastSelectedEndPoint":"_lastEndPoint"][type];
if(!item||!_101||!end){
return false;
}
return _8(type,item,_101,end);
},_isValid:function(type,item,_102){
if(!item){
return false;
}
try{
var g=this.grid,_103=item[type];
switch(type){
case "col":
return _103>=0&&_103<g.layout.cells.length&&_1.isArray(item.except)&&(_102||!g.layout.cells[_103].notselectable);
case "row":
return _103>=0&&_103<g.rowCount&&_1.isArray(item.except);
case "cell":
return item.col>=0&&item.col<g.layout.cells.length&&item.row>=0&&item.row<g.rowCount&&(_102||!g.layout.cells[item.col].notselectable);
}
}
catch(e){
}
return false;
}});
_3.grid.EnhancedGrid.registerPlugin(_3.grid.enhanced.plugins.Selector,{"dependency":["autoScroll"]});
return _3.grid.enhanced.plugins.Selector;
});
