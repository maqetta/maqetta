/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojo/string","../_Plugin","../../cells/dijit"],function(_1,_2,_3){
_1.declare("dojox.grid.enhanced.plugins.IndirectSelection",_3.grid.enhanced._Plugin,{name:"indirectSelection",constructor:function(){
var _4=this.grid.layout;
this.connect(_4,"setStructure",_1.hitch(_4,this.addRowSelectCell,this.option));
},addRowSelectCell:function(_5){
if(!this.grid.indirectSelection||this.grid.selectionMode=="none"){
return;
}
var _6=false,_7=["get","formatter","field","fields"],_8={type:_3.grid.cells.MultipleRowSelector,name:"",width:"30px",styles:"text-align: center;"};
if(_5.headerSelector){
_5.name="";
}
if(this.grid.rowSelectCell){
this.grid.rowSelectCell.destroy();
}
_1.forEach(this.structure,function(_9){
var _a=_9.cells;
if(_a&&_a.length>0&&!_6){
var _b=_a[0];
if(_b[0]&&_b[0].isRowSelector){
_6=true;
return;
}
var _c,_d=this.grid.selectionMode=="single"?_3.grid.cells.SingleRowSelector:_3.grid.cells.MultipleRowSelector;
_c=_1.mixin(_8,_5,{type:_d,editable:false,notselectable:true,filterable:false,navigatable:true,nosort:true});
_1.forEach(_7,function(_e){
if(_e in _c){
delete _c[_e];
}
});
if(_a.length>1){
_c.rowSpan=_a.length;
}
_1.forEach(this.cells,function(_f,i){
if(_f.index>=0){
_f.index+=1;
}else{
console.warn("Error:IndirectSelection.addRowSelectCell()-  cell "+i+" has no index!");
}
});
var _10=this.addCellDef(0,0,_c);
_10.index=0;
_b.unshift(_10);
this.cells.unshift(_10);
this.grid.rowSelectCell=_10;
_6=true;
}
},this);
this.cellCount=this.cells.length;
},destroy:function(){
this.grid.rowSelectCell.destroy();
delete this.grid.rowSelectCell;
this.inherited(arguments);
}});
_1.declare("dojox.grid.cells.RowSelector",_3.grid.cells._Widget,{inputType:"",map:null,disabledMap:null,isRowSelector:true,_connects:null,_subscribes:null,checkedText:"&#8730;",unCheckedText:"O",constructor:function(){
this.map={};
this.disabledMap={},this.disabledCount=0;
this._connects=[];
this._subscribes=[];
this.inA11YMode=_1.hasClass(_1.body(),"dijit_a11y");
this.baseClass="dojoxGridRowSelector dijitReset dijitInline dijit"+this.inputType;
this.checkedClass=" dijit"+this.inputType+"Checked";
this.disabledClass=" dijit"+this.inputType+"Disabled";
this.checkedDisabledClass=" dijit"+this.inputType+"CheckedDisabled";
this.statusTextClass=" dojoxGridRowSelectorStatusText";
this._connects.push(_1.connect(this.grid,"dokeyup",this,"_dokeyup"));
this._connects.push(_1.connect(this.grid.selection,"onSelected",this,"_onSelected"));
this._connects.push(_1.connect(this.grid.selection,"onDeselected",this,"_onDeselected"));
this._connects.push(_1.connect(this.grid.scroller,"invalidatePageNode",this,"_pageDestroyed"));
this._connects.push(_1.connect(this.grid,"onCellClick",this,"_onClick"));
this._connects.push(_1.connect(this.grid,"updateRow",this,"_onUpdateRow"));
},formatter:function(_11,_12){
var _13=this.baseClass;
var _14=this.getValue(_12);
var _15=!!this.disabledMap[_12];
if(_14){
_13+=this.checkedClass;
if(_15){
_13+=this.checkedDisabledClass;
}
}else{
if(_15){
_13+=this.disabledClass;
}
}
return ["<div tabindex = -1 ","id = '"+this.grid.id+"_rowSelector_"+_12+"' ","name = '"+this.grid.id+"_rowSelector' class = '"+_13+"' ","role = 'presentation' aria-pressed = '"+_14+"' aria-disabled = '"+_15+"' aria-label = '"+_1.string.substitute(this.grid._nls["indirectSelection"+this.inputType],[_12+1])+"'>","<span class = '"+this.statusTextClass+"'>"+(_14?this.checkedText:this.unCheckedText)+"</span>","</div>"].join("");
},setValue:function(_16,_17){
},getValue:function(_18){
return this.grid.selection.isSelected(_18);
},toggleRow:function(_19,_1a){
this._nativeSelect(_19,_1a);
},setDisabled:function(_1b,_1c){
if(_1b<0){
return;
}
this._toggleDisabledStyle(_1b,_1c);
},disabled:function(_1d){
return !!this.disabledMap[_1d];
},_onClick:function(e){
if(e.cell===this){
this._selectRow(e);
}
},_dokeyup:function(e){
if(e.cellIndex==this.index&&e.rowIndex>=0&&e.keyCode==_1.keys.SPACE){
this._selectRow(e);
}
},focus:function(_1e){
var _1f=this.map[_1e];
if(_1f){
_1f.focus();
}
},_focusEndingCell:function(_20,_21){
var _22=this.grid.getCell(_21);
this.grid.focus.setFocusCell(_22,_20);
},_nativeSelect:function(_23,_24){
this.grid.selection[_24?"select":"deselect"](_23);
},_onSelected:function(_25){
this._toggleCheckedStyle(_25,true);
},_onDeselected:function(_26){
this._toggleCheckedStyle(_26,false);
},_onUpdateRow:function(_27){
delete this.map[_27];
},_toggleCheckedStyle:function(_28,_29){
var _2a=this._getSelector(_28);
if(_2a){
_1.toggleClass(_2a,this.checkedClass,_29);
if(this.disabledMap[_28]){
_1.toggleClass(_2a,this.checkedDisabledClass,_29);
}
_2a.setAttribute("aria-pressed",_29);
if(this.inA11YMode){
_1.attr(_2a.firstChild,"innerHTML",_29?this.checkedText:this.unCheckedText);
}
}
},_toggleDisabledStyle:function(_2b,_2c){
var _2d=this._getSelector(_2b);
if(_2d){
_1.toggleClass(_2d,this.disabledClass,_2c);
if(this.getValue(_2b)){
_1.toggleClass(_2d,this.checkedDisabledClass,_2c);
}
_2d.setAttribute("aria-disabled",_2c);
}
this.disabledMap[_2b]=_2c;
if(_2b>=0){
this.disabledCount+=_2c?1:-1;
}
},_getSelector:function(_2e){
var _2f=this.map[_2e];
if(!_2f){
var _30=this.view.rowNodes[_2e];
if(_30){
_2f=_1.query(".dojoxGridRowSelector",_30)[0];
if(_2f){
this.map[_2e]=_2f;
}
}
}
return _2f;
},_pageDestroyed:function(_31){
var _32=this.grid.scroller.rowsPerPage;
var _33=_31*_32,end=_33+_32-1;
for(var i=_33;i<=end;i++){
if(!this.map[i]){
continue;
}
_1.destroy(this.map[i]);
delete this.map[i];
}
},destroy:function(){
for(var i in this.map){
_1.destroy(this.map[i]);
delete this.map[i];
}
for(i in this.disabledMap){
delete this.disabledMap[i];
}
_1.forEach(this._connects,_1.disconnect);
_1.forEach(this._subscribes,_1.unsubscribe);
delete this._connects;
delete this._subscribes;
}});
_1.declare("dojox.grid.cells.SingleRowSelector",_3.grid.cells.RowSelector,{inputType:"Radio",_selectRow:function(e){
var _34=e.rowIndex;
if(this.disabledMap[_34]){
return;
}
this._focusEndingCell(_34,0);
this._nativeSelect(_34,!this.grid.selection.selected[_34]);
}});
_1.declare("dojox.grid.cells.MultipleRowSelector",_3.grid.cells.RowSelector,{inputType:"CheckBox",swipeStartRowIndex:-1,swipeMinRowIndex:-1,swipeMaxRowIndex:-1,toSelect:false,lastClickRowIdx:-1,toggleAllTrigerred:false,unCheckedText:"&#9633;",constructor:function(){
this._connects.push(_1.connect(_1.doc,"onmouseup",this,"_domouseup"));
this._connects.push(_1.connect(this.grid,"onRowMouseOver",this,"_onRowMouseOver"));
this._connects.push(_1.connect(this.grid.focus,"move",this,"_swipeByKey"));
this._connects.push(_1.connect(this.grid,"onCellMouseDown",this,"_onMouseDown"));
if(this.headerSelector){
this._connects.push(_1.connect(this.grid.views,"render",this,"_addHeaderSelector"));
this._connects.push(_1.connect(this.grid,"onSelectionChanged",this,"_onSelectionChanged"));
this._connects.push(_1.connect(this.grid,"onKeyDown",this,function(e){
if(e.rowIndex==-1&&e.cellIndex==this.index&&e.keyCode==_1.keys.SPACE){
this._toggletHeader();
}
}));
}
},toggleAllSelection:function(_35){
var _36=this.grid,_37=_36.selection;
if(_35){
_37.selectRange(0,_36.rowCount-1);
}else{
_37.deselectAll();
}
this.toggleAllTrigerred=true;
},_onMouseDown:function(e){
if(e.cell==this){
this._startSelection(e.rowIndex);
_1.stopEvent(e);
}
},_onRowMouseOver:function(e){
this._updateSelection(e,0);
},_domouseup:function(e){
if(_1.isIE){
this.view.content.decorateEvent(e);
}
var _38=e.cellIndex>=0&&this.inSwipeSelection()&&!this.grid.edit.isEditRow(e.rowIndex);
if(_38){
this._focusEndingCell(e.rowIndex,e.cellIndex);
}
this._finishSelect();
},_dokeyup:function(e){
this.inherited(arguments);
if(!e.shiftKey){
this._finishSelect();
}
},_startSelection:function(_39){
this.swipeStartRowIndex=this.swipeMinRowIndex=this.swipeMaxRowIndex=_39;
this.toSelect=!this.getValue(_39);
},_updateSelection:function(e,_3a){
if(!this.inSwipeSelection()){
return;
}
var _3b=_3a!==0;
var _3c=e.rowIndex,_3d=_3c-this.swipeStartRowIndex+_3a;
if(_3d>0&&this.swipeMaxRowIndex<_3c+_3a){
this.swipeMaxRowIndex=_3c+_3a;
}
if(_3d<0&&this.swipeMinRowIndex>_3c+_3a){
this.swipeMinRowIndex=_3c+_3a;
}
var min=_3d>0?this.swipeStartRowIndex:_3c+_3a;
var max=_3d>0?_3c+_3a:this.swipeStartRowIndex;
for(var i=this.swipeMinRowIndex;i<=this.swipeMaxRowIndex;i++){
if(this.disabledMap[i]||i<0){
continue;
}
if(i>=min&&i<=max){
this._nativeSelect(i,this.toSelect);
}else{
if(!_3b){
this._nativeSelect(i,!this.toSelect);
}
}
}
},_swipeByKey:function(_3e,_3f,e){
if(!e||_3e===0||!e.shiftKey||e.cellIndex!=this.index||this.grid.focus.rowIndex<0){
return;
}
var _40=e.rowIndex;
if(this.swipeStartRowIndex<0){
this.swipeStartRowIndex=_40;
if(_3e>0){
this.swipeMaxRowIndex=_40+_3e;
this.swipeMinRowIndex=_40;
}else{
this.swipeMinRowIndex=_40+_3e;
this.swipeMaxRowIndex=_40;
}
this.toSelect=this.getValue(_40);
}
this._updateSelection(e,_3e);
},_finishSelect:function(){
this.swipeStartRowIndex=-1;
this.swipeMinRowIndex=-1;
this.swipeMaxRowIndex=-1;
this.toSelect=false;
},inSwipeSelection:function(){
return this.swipeStartRowIndex>=0;
},_nativeSelect:function(_41,_42){
this.grid.selection[_42?"addToSelection":"deselect"](_41);
},_selectRow:function(e){
var _43=e.rowIndex;
if(this.disabledMap[_43]){
return;
}
_1.stopEvent(e);
this._focusEndingCell(_43,0);
var _44=_43-this.lastClickRowIdx;
var _45=!this.grid.selection.selected[_43];
if(this.lastClickRowIdx>=0&&!e.ctrlKey&&!e.altKey&&e.shiftKey){
var min=_44>0?this.lastClickRowIdx:_43;
var max=_44>0?_43:this.lastClickRowIdx;
for(var i=min;i>=0&&i<=max;i++){
this._nativeSelect(i,_45);
}
}else{
this._nativeSelect(_43,_45);
}
this.lastClickRowIdx=_43;
},getValue:function(_46){
if(_46==-1){
var g=this.grid;
return g.rowCount>0&&g.rowCount<=g.selection.getSelectedCount();
}
return this.inherited(arguments);
},_addHeaderSelector:function(){
var _47=this.view.getHeaderCellNode(this.index);
if(!_47){
return;
}
_1.empty(_47);
var g=this.grid;
var _48=_47.appendChild(_1.create("div",{"tabindex":-1,"id":g.id+"_rowSelector_-1","class":this.baseClass,"role":"presentation","innerHTML":"<span class = '"+this.statusTextClass+"'></span><span style='height: 0; width: 0; overflow: hidden; display: block;'>"+g._nls["selectAll"]+"</span>"}));
this.map[-1]=_48;
var idx=this._headerSelectorConnectIdx;
if(idx!==undefined){
_1.disconnect(this._connects[idx]);
this._connects.splice(idx,1);
}
this._headerSelectorConnectIdx=this._connects.length;
this._connects.push(_1.connect(_48,"onclick",this,"_toggletHeader"));
this._onSelectionChanged();
},_toggletHeader:function(){
if(!!this.disabledMap[-1]){
return;
}
this.grid._selectingRange=true;
this.toggleAllSelection(!this.getValue(-1));
this._onSelectionChanged();
this.grid._selectingRange=false;
},_onSelectionChanged:function(){
var g=this.grid;
if(!this.map[-1]||g._selectingRange){
return;
}
this._toggleCheckedStyle(-1,this.getValue(-1));
},_toggleDisabledStyle:function(_49,_4a){
this.inherited(arguments);
if(this.headerSelector){
var _4b=(this.grid.rowCount==this.disabledCount);
if(_4b!=!!this.disabledMap[-1]){
arguments[0]=-1;
arguments[1]=_4b;
this.inherited(arguments);
}
}
}});
_3.grid.EnhancedGrid.registerPlugin(_3.grid.enhanced.plugins.IndirectSelection,{"preInit":true});
return _3.grid.enhanced.plugins.IndirectSelection;
});
