/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/IndirectSelection",["dojo","dijit","dojox","dojo/string","../_Plugin","../../cells/dijit"],function(_1,_2,_3){
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
},formatter:function(_11,_12,_13){
var _14=_13;
var _15=_14.baseClass;
var _16=_14.getValue(_12);
var _17=!!_14.disabledMap[_12];
if(_16){
_15+=_14.checkedClass;
if(_17){
_15+=_14.checkedDisabledClass;
}
}else{
if(_17){
_15+=_14.disabledClass;
}
}
return ["<div tabindex = -1 ","id = '"+_14.grid.id+"_rowSelector_"+_12+"' ","name = '"+_14.grid.id+"_rowSelector' class = '"+_15+"' ","role = 'presentation' aria-pressed = '"+_16+"' aria-disabled = '"+_17+"' aria-label = '"+_1.string.substitute(_14.grid._nls["indirectSelection"+_14.inputType],[_12+1])+"'>","<span class = '"+_14.statusTextClass+"'>"+(_16?_14.checkedText:_14.unCheckedText)+"</span>","</div>"].join("");
},setValue:function(_18,_19){
},getValue:function(_1a){
return this.grid.selection.isSelected(_1a);
},toggleRow:function(_1b,_1c){
this._nativeSelect(_1b,_1c);
},setDisabled:function(_1d,_1e){
if(_1d<0){
return;
}
this._toggleDisabledStyle(_1d,_1e);
},disabled:function(_1f){
return !!this.disabledMap[_1f];
},_onClick:function(e){
if(e.cell===this){
this._selectRow(e);
}
},_dokeyup:function(e){
if(e.cellIndex==this.index&&e.rowIndex>=0&&e.keyCode==_1.keys.SPACE){
this._selectRow(e);
}
},focus:function(_20){
var _21=this.map[_20];
if(_21){
_21.focus();
}
},_focusEndingCell:function(_22,_23){
var _24=this.grid.getCell(_23);
this.grid.focus.setFocusCell(_24,_22);
},_nativeSelect:function(_25,_26){
this.grid.selection[_26?"select":"deselect"](_25);
},_onSelected:function(_27){
this._toggleCheckedStyle(_27,true);
},_onDeselected:function(_28){
this._toggleCheckedStyle(_28,false);
},_onUpdateRow:function(_29){
delete this.map[_29];
},_toggleCheckedStyle:function(_2a,_2b){
var _2c=this._getSelector(_2a);
if(_2c){
_1.toggleClass(_2c,this.checkedClass,_2b);
if(this.disabledMap[_2a]){
_1.toggleClass(_2c,this.checkedDisabledClass,_2b);
}
_2c.setAttribute("aria-pressed",_2b);
if(this.inA11YMode){
_1.attr(_2c.firstChild,"innerHTML",_2b?this.checkedText:this.unCheckedText);
}
}
},_toggleDisabledStyle:function(_2d,_2e){
var _2f=this._getSelector(_2d);
if(_2f){
_1.toggleClass(_2f,this.disabledClass,_2e);
if(this.getValue(_2d)){
_1.toggleClass(_2f,this.checkedDisabledClass,_2e);
}
_2f.setAttribute("aria-disabled",_2e);
}
this.disabledMap[_2d]=_2e;
if(_2d>=0){
this.disabledCount+=_2e?1:-1;
}
},_getSelector:function(_30){
var _31=this.map[_30];
if(!_31){
var _32=this.view.rowNodes[_30];
if(_32){
_31=_1.query(".dojoxGridRowSelector",_32)[0];
if(_31){
this.map[_30]=_31;
}
}
}
return _31;
},_pageDestroyed:function(_33){
var _34=this.grid.scroller.rowsPerPage;
var _35=_33*_34,end=_35+_34-1;
for(var i=_35;i<=end;i++){
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
var _36=e.rowIndex;
if(this.disabledMap[_36]){
return;
}
this._focusEndingCell(_36,0);
this._nativeSelect(_36,!this.grid.selection.selected[_36]);
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
},toggleAllSelection:function(_37){
var _38=this.grid,_39=_38.selection;
if(_37){
_39.selectRange(0,_38.rowCount-1);
}else{
_39.deselectAll();
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
var _3a=e.cellIndex>=0&&this.inSwipeSelection()&&!this.grid.edit.isEditRow(e.rowIndex);
if(_3a){
this._focusEndingCell(e.rowIndex,e.cellIndex);
}
this._finishSelect();
},_dokeyup:function(e){
this.inherited(arguments);
if(!e.shiftKey){
this._finishSelect();
}
},_startSelection:function(_3b){
this.swipeStartRowIndex=this.swipeMinRowIndex=this.swipeMaxRowIndex=_3b;
this.toSelect=!this.getValue(_3b);
},_updateSelection:function(e,_3c){
if(!this.inSwipeSelection()){
return;
}
var _3d=_3c!==0;
var _3e=e.rowIndex,_3f=_3e-this.swipeStartRowIndex+_3c;
if(_3f>0&&this.swipeMaxRowIndex<_3e+_3c){
this.swipeMaxRowIndex=_3e+_3c;
}
if(_3f<0&&this.swipeMinRowIndex>_3e+_3c){
this.swipeMinRowIndex=_3e+_3c;
}
var min=_3f>0?this.swipeStartRowIndex:_3e+_3c;
var max=_3f>0?_3e+_3c:this.swipeStartRowIndex;
for(var i=this.swipeMinRowIndex;i<=this.swipeMaxRowIndex;i++){
if(this.disabledMap[i]||i<0){
continue;
}
if(i>=min&&i<=max){
this._nativeSelect(i,this.toSelect);
}else{
if(!_3d){
this._nativeSelect(i,!this.toSelect);
}
}
}
},_swipeByKey:function(_40,_41,e){
if(!e||_40===0||!e.shiftKey||e.cellIndex!=this.index||this.grid.focus.rowIndex<0){
return;
}
var _42=e.rowIndex;
if(this.swipeStartRowIndex<0){
this.swipeStartRowIndex=_42;
if(_40>0){
this.swipeMaxRowIndex=_42+_40;
this.swipeMinRowIndex=_42;
}else{
this.swipeMinRowIndex=_42+_40;
this.swipeMaxRowIndex=_42;
}
this.toSelect=this.getValue(_42);
}
this._updateSelection(e,_40);
},_finishSelect:function(){
this.swipeStartRowIndex=-1;
this.swipeMinRowIndex=-1;
this.swipeMaxRowIndex=-1;
this.toSelect=false;
},inSwipeSelection:function(){
return this.swipeStartRowIndex>=0;
},_nativeSelect:function(_43,_44){
this.grid.selection[_44?"addToSelection":"deselect"](_43);
},_selectRow:function(e){
var _45=e.rowIndex;
if(this.disabledMap[_45]){
return;
}
_1.stopEvent(e);
this._focusEndingCell(_45,0);
var _46=_45-this.lastClickRowIdx;
var _47=!this.grid.selection.selected[_45];
if(this.lastClickRowIdx>=0&&!e.ctrlKey&&!e.altKey&&e.shiftKey){
var min=_46>0?this.lastClickRowIdx:_45;
var max=_46>0?_45:this.lastClickRowIdx;
for(var i=min;i>=0&&i<=max;i++){
this._nativeSelect(i,_47);
}
}else{
this._nativeSelect(_45,_47);
}
this.lastClickRowIdx=_45;
},getValue:function(_48){
if(_48==-1){
var g=this.grid;
return g.rowCount>0&&g.rowCount<=g.selection.getSelectedCount();
}
return this.inherited(arguments);
},_addHeaderSelector:function(){
var _49=this.view.getHeaderCellNode(this.index);
if(!_49){
return;
}
_1.empty(_49);
var g=this.grid;
var _4a=_49.appendChild(_1.create("div",{"tabindex":-1,"id":g.id+"_rowSelector_-1","class":this.baseClass,"role":"presentation","innerHTML":"<span class = '"+this.statusTextClass+"'></span><span style='height: 0; width: 0; overflow: hidden; display: block;'>"+g._nls["selectAll"]+"</span>"}));
this.map[-1]=_4a;
var idx=this._headerSelectorConnectIdx;
if(idx!==undefined){
_1.disconnect(this._connects[idx]);
this._connects.splice(idx,1);
}
this._headerSelectorConnectIdx=this._connects.length;
this._connects.push(_1.connect(_4a,"onclick",this,"_toggletHeader"));
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
},_toggleDisabledStyle:function(_4b,_4c){
this.inherited(arguments);
if(this.headerSelector){
var _4d=(this.grid.rowCount==this.disabledCount);
if(_4d!=!!this.disabledMap[-1]){
arguments[0]=-1;
arguments[1]=_4d;
this.inherited(arguments);
}
}
}});
_3.grid.EnhancedGrid.registerPlugin(_3.grid.enhanced.plugins.IndirectSelection,{"preInit":true});
return _3.grid.enhanced.plugins.IndirectSelection;
});
