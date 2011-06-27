/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/_FocusManager",["dojo","dojox","./util"],function(_1,_2){
_1.declare("dojox.grid._FocusManager",null,{constructor:function(_3){
this.grid=_3;
this.cell=null;
this.rowIndex=-1;
this._connects=[];
this._headerConnects=[];
this.headerMenu=this.grid.headerMenu;
this._connects.push(_1.connect(this.grid.domNode,"onfocus",this,"doFocus"));
this._connects.push(_1.connect(this.grid.domNode,"onblur",this,"doBlur"));
this._connects.push(_1.connect(this.grid.domNode,"oncontextmenu",this,"doContextMenu"));
this._connects.push(_1.connect(this.grid.lastFocusNode,"onfocus",this,"doLastNodeFocus"));
this._connects.push(_1.connect(this.grid.lastFocusNode,"onblur",this,"doLastNodeBlur"));
this._connects.push(_1.connect(this.grid,"_onFetchComplete",this,"_delayedCellFocus"));
this._connects.push(_1.connect(this.grid,"postrender",this,"_delayedHeaderFocus"));
},destroy:function(){
_1.forEach(this._connects,_1.disconnect);
_1.forEach(this._headerConnects,_1.disconnect);
delete this.grid;
delete this.cell;
},_colHeadNode:null,_colHeadFocusIdx:null,_contextMenuBindNode:null,tabbingOut:false,focusClass:"dojoxGridCellFocus",focusView:null,initFocusView:function(){
this.focusView=this.grid.views.getFirstScrollingView()||this.focusView||this.grid.views.views[0];
this._initColumnHeaders();
},isFocusCell:function(_4,_5){
return (this.cell==_4)&&(this.rowIndex==_5);
},isLastFocusCell:function(){
if(this.cell){
return (this.rowIndex==this.grid.rowCount-1)&&(this.cell.index==this.grid.layout.cellCount-1);
}
return false;
},isFirstFocusCell:function(){
if(this.cell){
return (this.rowIndex===0)&&(this.cell.index===0);
}
return false;
},isNoFocusCell:function(){
return (this.rowIndex<0)||!this.cell;
},isNavHeader:function(){
return (!!this._colHeadNode);
},getHeaderIndex:function(){
if(this._colHeadNode){
return _1.indexOf(this._findHeaderCells(),this._colHeadNode);
}else{
return -1;
}
},_focusifyCellNode:function(_6){
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
_1.toggleClass(n,this.focusClass,_6);
if(_6){
var sl=this.scrollIntoView();
try{
if(!this.grid.edit.isEditing()){
_2.grid.util.fire(n,"focus");
if(sl){
this.cell.view.scrollboxNode.scrollLeft=sl;
}
}
}
catch(e){
}
}
}
},_delayedCellFocus:function(){
if(this.isNavHeader()||!this.grid.focused){
return;
}
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
try{
if(!this.grid.edit.isEditing()){
_1.toggleClass(n,this.focusClass,true);
if(this._colHeadNode){
this.blurHeader();
}
_2.grid.util.fire(n,"focus");
}
}
catch(e){
}
}
},_delayedHeaderFocus:function(){
if(this.isNavHeader()){
this.focusHeader();
this.grid.domNode.focus();
}
},_initColumnHeaders:function(){
_1.forEach(this._headerConnects,_1.disconnect);
this._headerConnects=[];
var _7=this._findHeaderCells();
for(var i=0;i<_7.length;i++){
this._headerConnects.push(_1.connect(_7[i],"onfocus",this,"doColHeaderFocus"));
this._headerConnects.push(_1.connect(_7[i],"onblur",this,"doColHeaderBlur"));
}
},_findHeaderCells:function(){
var _8=_1.query("th",this.grid.viewsHeaderNode);
var _9=[];
for(var i=0;i<_8.length;i++){
var _a=_8[i];
var _b=_1.hasAttr(_a,"tabIndex");
var _c=_1.attr(_a,"tabIndex");
if(_b&&_c<0){
_9.push(_a);
}
}
return _9;
},_setActiveColHeader:function(_d,_e,_f){
this.grid.domNode.setAttribute("aria-activedescendant",_d.id);
if(_f!=null&&_f>=0&&_f!=_e){
_1.toggleClass(this._findHeaderCells()[_f],this.focusClass,false);
}
_1.toggleClass(_d,this.focusClass,true);
this._colHeadNode=_d;
this._colHeadFocusIdx=_e;
this._scrollHeader(this._colHeadFocusIdx);
},scrollIntoView:function(){
var _10=(this.cell?this._scrollInfo(this.cell):null);
if(!_10||!_10.s){
return null;
}
var rt=this.grid.scroller.findScrollTop(this.rowIndex);
if(_10.n&&_10.sr){
if(_10.n.offsetLeft+_10.n.offsetWidth>_10.sr.l+_10.sr.w){
_10.s.scrollLeft=_10.n.offsetLeft+_10.n.offsetWidth-_10.sr.w;
}else{
if(_10.n.offsetLeft<_10.sr.l){
_10.s.scrollLeft=_10.n.offsetLeft;
}
}
}
if(_10.r&&_10.sr){
if(rt+_10.r.offsetHeight>_10.sr.t+_10.sr.h){
this.grid.setScrollTop(rt+_10.r.offsetHeight-_10.sr.h);
}else{
if(rt<_10.sr.t){
this.grid.setScrollTop(rt);
}
}
}
return _10.s.scrollLeft;
},_scrollInfo:function(_11,_12){
if(_11){
var cl=_11,sbn=cl.view.scrollboxNode,_13={w:sbn.clientWidth,l:sbn.scrollLeft,t:sbn.scrollTop,h:sbn.clientHeight},rn=cl.view.getRowNode(this.rowIndex);
return {c:cl,s:sbn,sr:_13,n:(_12?_12:_11.getNode(this.rowIndex)),r:rn};
}
return null;
},_scrollHeader:function(_14){
var _15=null;
if(this._colHeadNode){
var _16=this.grid.getCell(_14);
if(!_16){
return;
}
_15=this._scrollInfo(_16,_16.getNode(0));
}
if(_15&&_15.s&&_15.sr&&_15.n){
var _17=_15.sr.l+_15.sr.w;
if(_15.n.offsetLeft+_15.n.offsetWidth>_17){
_15.s.scrollLeft=_15.n.offsetLeft+_15.n.offsetWidth-_15.sr.w;
}else{
if(_15.n.offsetLeft<_15.sr.l){
_15.s.scrollLeft=_15.n.offsetLeft;
}else{
if(_1.isIE<=7&&_16&&_16.view.headerNode){
_16.view.headerNode.scrollLeft=_15.s.scrollLeft;
}
}
}
}
},_isHeaderHidden:function(){
var _18=this.focusView;
if(!_18){
for(var i=0,_19;(_19=this.grid.views.views[i]);i++){
if(_19.headerNode){
_18=_19;
break;
}
}
}
return (_18&&_1.getComputedStyle(_18.headerNode).display=="none");
},colSizeAdjust:function(e,_1a,_1b){
var _1c=this._findHeaderCells();
var _1d=this.focusView;
if(!_1d){
for(var i=0,_1e;(_1e=this.grid.views.views[i]);i++){
if(_1e.header.tableMap.map){
_1d=_1e;
break;
}
}
}
var _1f=_1c[_1a];
if(!_1d||(_1a==_1c.length-1&&_1a===0)){
return;
}
_1d.content.baseDecorateEvent(e);
e.cellNode=_1f;
e.cellIndex=_1d.content.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
if(_1d.header.canResize(e)){
var _20={l:_1b};
var _21=_1d.header.colResizeSetup(e,false);
_1d.header.doResizeColumn(_21,null,_20);
_1d.update();
}
},styleRow:function(_22){
return;
},setFocusIndex:function(_23,_24){
this.setFocusCell(this.grid.getCell(_24),_23);
},setFocusCell:function(_25,_26){
if(_25&&!this.isFocusCell(_25,_26)){
this.tabbingOut=false;
if(this._colHeadNode){
this.blurHeader();
}
this._colHeadNode=this._colHeadFocusIdx=null;
this.focusGridView();
this._focusifyCellNode(false);
this.cell=_25;
this.rowIndex=_26;
this._focusifyCellNode(true);
}
if(_1.isOpera){
setTimeout(_1.hitch(this.grid,"onCellFocus",this.cell,this.rowIndex),1);
}else{
this.grid.onCellFocus(this.cell,this.rowIndex);
}
},next:function(){
if(this.cell){
var row=this.rowIndex,col=this.cell.index+1,cc=this.grid.layout.cellCount-1,rc=this.grid.rowCount-1;
if(col>cc){
col=0;
row++;
}
if(row>rc){
col=cc;
row=rc;
}
if(this.grid.edit.isEditing()){
var _27=this.grid.getCell(col);
if(!this.isLastFocusCell()&&(!_27.editable||this.grid.canEdit&&!this.grid.canEdit(_27,row))){
this.cell=_27;
this.rowIndex=row;
this.next();
return;
}
}
this.setFocusIndex(row,col);
}
},previous:function(){
if(this.cell){
var row=(this.rowIndex||0),col=(this.cell.index||0)-1;
if(col<0){
col=this.grid.layout.cellCount-1;
row--;
}
if(row<0){
row=0;
col=0;
}
if(this.grid.edit.isEditing()){
var _28=this.grid.getCell(col);
if(!this.isFirstFocusCell()&&!_28.editable){
this.cell=_28;
this.rowIndex=row;
this.previous();
return;
}
}
this.setFocusIndex(row,col);
}
},move:function(_29,_2a){
var _2b=_2a<0?-1:1;
if(this.isNavHeader()){
var _2c=this._findHeaderCells();
var _2d=currentIdx=_1.indexOf(_2c,this._colHeadNode);
currentIdx+=_2a;
while(currentIdx>=0&&currentIdx<_2c.length&&_2c[currentIdx].style.display=="none"){
currentIdx+=_2b;
}
if((currentIdx>=0)&&(currentIdx<_2c.length)){
this._setActiveColHeader(_2c[currentIdx],currentIdx,_2d);
}
}else{
if(this.cell){
var sc=this.grid.scroller,r=this.rowIndex,rc=this.grid.rowCount-1,row=Math.min(rc,Math.max(0,r+_29));
if(_29){
if(_29>0){
if(row>sc.getLastPageRow(sc.page)){
this.grid.setScrollTop(this.grid.scrollTop+sc.findScrollTop(row)-sc.findScrollTop(r));
}
}else{
if(_29<0){
if(row<=sc.getPageRow(sc.page)){
this.grid.setScrollTop(this.grid.scrollTop-sc.findScrollTop(r)-sc.findScrollTop(row));
}
}
}
}
var cc=this.grid.layout.cellCount-1,i=this.cell.index,col=Math.min(cc,Math.max(0,i+_2a));
var _2e=this.grid.getCell(col);
while(col>=0&&col<cc&&_2e&&_2e.hidden===true){
col+=_2b;
_2e=this.grid.getCell(col);
}
if(!_2e||_2e.hidden===true){
col=i;
}
var n=_2e.getNode(row);
if(!n&&_29){
if((row+_29)>=0&&(row+_29)<=rc){
this.move(_29>0?++_29:--_29,_2a);
}
return;
}else{
if((!n||_1.style(n,"display")==="none")&&_2a){
if((col+_29)>=0&&(col+_29)<=cc){
this.move(_29,_2a>0?++_2a:--_2a);
}
return;
}
}
this.setFocusIndex(row,col);
if(_29){
this.grid.updateRow(r);
}
}
}
},previousKey:function(e){
if(this.grid.edit.isEditing()){
_1.stopEvent(e);
this.previous();
}else{
if(!this.isNavHeader()&&!this._isHeaderHidden()){
this.grid.domNode.focus();
_1.stopEvent(e);
}else{
this.tabOut(this.grid.domNode);
if(this._colHeadFocusIdx!=null){
_1.toggleClass(this._findHeaderCells()[this._colHeadFocusIdx],this.focusClass,false);
this._colHeadFocusIdx=null;
}
this._focusifyCellNode(false);
}
}
},nextKey:function(e){
var _2f=(this.grid.rowCount===0);
if(e.target===this.grid.domNode&&this._colHeadFocusIdx==null){
this.focusHeader();
_1.stopEvent(e);
}else{
if(this.isNavHeader()){
this.blurHeader();
if(!this.findAndFocusGridCell()){
this.tabOut(this.grid.lastFocusNode);
}
this._colHeadNode=this._colHeadFocusIdx=null;
}else{
if(this.grid.edit.isEditing()){
_1.stopEvent(e);
this.next();
}else{
this.tabOut(this.grid.lastFocusNode);
}
}
}
},tabOut:function(_30){
this.tabbingOut=true;
_30.focus();
},focusGridView:function(){
_2.grid.util.fire(this.focusView,"focus");
},focusGrid:function(_31){
this.focusGridView();
this._focusifyCellNode(true);
},findAndFocusGridCell:function(){
var _32=true;
var _33=(this.grid.rowCount===0);
if(this.isNoFocusCell()&&!_33){
var _34=0;
var _35=this.grid.getCell(_34);
if(_35.hidden){
_34=this.isNavHeader()?this._colHeadFocusIdx:0;
}
this.setFocusIndex(0,_34);
}else{
if(this.cell&&!_33){
if(this.focusView&&!this.focusView.rowNodes[this.rowIndex]){
this.grid.scrollToRow(this.rowIndex);
}
this.focusGrid();
}else{
_32=false;
}
}
this._colHeadNode=this._colHeadFocusIdx=null;
return _32;
},focusHeader:function(){
var _36=this._findHeaderCells();
var _37=this._colHeadFocusIdx;
if(this._isHeaderHidden()){
this.findAndFocusGridCell();
}else{
if(!this._colHeadFocusIdx){
if(this.isNoFocusCell()){
this._colHeadFocusIdx=0;
}else{
this._colHeadFocusIdx=this.cell.index;
}
}
}
this._colHeadNode=_36[this._colHeadFocusIdx];
while(this._colHeadNode&&this._colHeadFocusIdx>=0&&this._colHeadFocusIdx<_36.length&&this._colHeadNode.style.display=="none"){
this._colHeadFocusIdx++;
this._colHeadNode=_36[this._colHeadFocusIdx];
}
if(this._colHeadNode&&this._colHeadNode.style.display!="none"){
if(this.headerMenu&&this._contextMenuBindNode!=this.grid.domNode){
this.headerMenu.unBindDomNode(this.grid.viewsHeaderNode);
this.headerMenu.bindDomNode(this.grid.domNode);
this._contextMenuBindNode=this.grid.domNode;
}
this._setActiveColHeader(this._colHeadNode,this._colHeadFocusIdx,_37);
this._scrollHeader(this._colHeadFocusIdx);
this._focusifyCellNode(false);
}else{
this.findAndFocusGridCell();
}
},blurHeader:function(){
_1.removeClass(this._colHeadNode,this.focusClass);
_1.removeAttr(this.grid.domNode,"aria-activedescendant");
if(this.headerMenu&&this._contextMenuBindNode==this.grid.domNode){
var _38=this.grid.viewsHeaderNode;
this.headerMenu.unBindDomNode(this.grid.domNode);
this.headerMenu.bindDomNode(_38);
this._contextMenuBindNode=_38;
}
},doFocus:function(e){
if(e&&e.target!=e.currentTarget){
_1.stopEvent(e);
return;
}
if(!this.tabbingOut){
this.focusHeader();
}
this.tabbingOut=false;
_1.stopEvent(e);
},doBlur:function(e){
_1.stopEvent(e);
},doContextMenu:function(e){
if(!this.headerMenu){
_1.stopEvent(e);
}
},doLastNodeFocus:function(e){
if(this.tabbingOut){
this._focusifyCellNode(false);
}else{
if(this.grid.rowCount>0){
if(this.isNoFocusCell()){
this.setFocusIndex(0,0);
}
this._focusifyCellNode(true);
}else{
this.focusHeader();
}
}
this.tabbingOut=false;
_1.stopEvent(e);
},doLastNodeBlur:function(e){
_1.stopEvent(e);
},doColHeaderFocus:function(e){
this._setActiveColHeader(e.target,_1.attr(e.target,"idx"),this._colHeadFocusIdx);
this._scrollHeader(this.getHeaderIndex());
_1.stopEvent(e);
},doColHeaderBlur:function(e){
_1.toggleClass(e.target,this.focusClass,false);
}});
return _2.grid._FocusManager;
});
