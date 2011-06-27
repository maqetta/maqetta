/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/_Events",["dojo","dojox"],function(_1,_2){
_1.declare("dojox.grid.enhanced._Events",null,{_events:null,headerCellActiveClass:"dojoxGridHeaderActive",cellActiveClass:"dojoxGridCellActive",rowActiveClass:"dojoxGridRowActive",constructor:function(_3){
this._events=new _2.grid._Events();
_3.mixin(_3,this);
},dokeyup:function(e){
this.focus.currentArea().keyup(e);
},onKeyDown:function(e){
if(e.altKey||e.metaKey){
return;
}
var dk=_1.keys;
var _4=this.focus;
var _5=this.edit.isEditing();
switch(e.keyCode){
case dk.TAB:
if(e.ctrlKey){
return;
}
_4.tab(e.shiftKey?-1:1,e);
break;
case dk.UP_ARROW:
case dk.DOWN_ARROW:
if(_5){
return;
}
_4.currentArea().move(e.keyCode==dk.UP_ARROW?-1:1,0,e);
break;
case dk.LEFT_ARROW:
case dk.RIGHT_ARROW:
if(_5){
return;
}
var _6=(e.keyCode==dk.LEFT_ARROW)?1:-1;
if(_1._isBodyLtr()){
_6*=-1;
}
_4.currentArea().move(0,_6,e);
break;
case dk.F10:
if(this.menus&&e.shiftKey){
this.onRowContextMenu(e);
}
break;
default:
_4.currentArea().keydown(e);
break;
}
},domouseup:function(e){
if(e.cellNode){
this.onMouseUp(e);
}else{
this.onRowSelectorMouseUp(e);
}
},domousedown:function(e){
if(!e.cellNode){
this.onRowSelectorMouseDown(e);
}
},onMouseUp:function(e){
this[e.rowIndex==-1?"onHeaderCellMouseUp":"onCellMouseUp"](e);
},onCellMouseDown:function(e){
_1.addClass(e.cellNode,this.cellActiveClass);
_1.addClass(e.rowNode,this.rowActiveClass);
},onCellMouseUp:function(e){
_1.removeClass(e.cellNode,this.cellActiveClass);
_1.removeClass(e.rowNode,this.rowActiveClass);
},onCellClick:function(e){
this._events.onCellClick.call(this,e);
this.focus.contentMouseEvent(e);
},onCellDblClick:function(e){
if(this.pluginMgr.isFixedCell(e.cell)){
return;
}
if(this._click.length>1&&(!this._click[0]||!this._click[1])){
this._click[0]=this._click[1]=e;
}
this._events.onCellDblClick.call(this,e);
},onRowClick:function(e){
this.edit.rowClick(e);
if(!e.cell||(!e.cell.isRowSelector&&(!this.rowSelectCell||!this.rowSelectCell.disabled(e.rowIndex)))){
this.selection.clickSelectEvent(e);
}
},onRowContextMenu:function(e){
if(!this.edit.isEditing()&&this.menus){
this.showMenu(e);
}
},onSelectedRegionContextMenu:function(e){
if(this.selectedRegionMenu){
this.selectedRegionMenu._openMyself({target:e.target,coords:e.keyCode!==_1.keys.F10&&"pageX" in e?{x:e.pageX,y:e.pageY}:null});
_1.stopEvent(e);
}
},onHeaderCellMouseOut:function(e){
if(e.cellNode){
_1.removeClass(e.cellNode,this.cellOverClass);
_1.removeClass(e.cellNode,this.headerCellActiveClass);
}
},onHeaderCellMouseDown:function(e){
if(e.cellNode){
_1.addClass(e.cellNode,this.headerCellActiveClass);
}
},onHeaderCellMouseUp:function(e){
if(e.cellNode){
_1.removeClass(e.cellNode,this.headerCellActiveClass);
}
},onHeaderCellClick:function(e){
this.focus.currentArea("header");
if(!e.cell.isRowSelector){
this._events.onHeaderCellClick.call(this,e);
}
this.focus.headerMouseEvent(e);
},onRowSelectorMouseDown:function(e){
this.focus.focusArea("rowHeader",e);
},onRowSelectorMouseUp:function(e){
},onMouseUpRow:function(e){
if(e.rowIndex!=-1){
this.onRowMouseUp(e);
}
},onRowMouseUp:function(e){
}});
return _2.grid.enhanced._Events;
});
