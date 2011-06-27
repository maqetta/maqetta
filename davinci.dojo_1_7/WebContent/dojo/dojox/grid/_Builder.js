/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/_Builder",["dojo","dojox","dojo/dnd/Moveable","./util"],function(_1,_2){
var dg=_2.grid;
var _3=function(td){
return td.cellIndex>=0?td.cellIndex:_1.indexOf(td.parentNode.cells,td);
};
var _4=function(tr){
return tr.rowIndex>=0?tr.rowIndex:_1.indexOf(tr.parentNode.childNodes,tr);
};
var _5=function(_6,_7){
return _6&&((_6.rows||0)[_7]||_6.childNodes[_7]);
};
var _8=function(_9){
for(var n=_9;n&&n.tagName!="TABLE";n=n.parentNode){
}
return n;
};
var _a=function(_b,_c){
for(var n=_b;n&&_c(n);n=n.parentNode){
}
return n;
};
var _d=function(_e){
var _f=_e.toUpperCase();
return function(_10){
return _10.tagName!=_f;
};
};
var _11=_2.grid.util.rowIndexTag;
var _12=_2.grid.util.gridViewTag;
dg._Builder=_1.extend(function(_13){
if(_13){
this.view=_13;
this.grid=_13.grid;
}
},{view:null,_table:"<table class=\"dojoxGridRowTable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\"",getTableArray:function(){
var _14=[this._table];
if(this.view.viewWidth){
_14.push([" style=\"width:",this.view.viewWidth,";\""].join(""));
}
_14.push(">");
return _14;
},generateCellMarkup:function(_15,_16,_17,_18){
var _19=[],_1a;
if(_18){
var _1b=_15.index!=_15.grid.getSortIndex()?"":_15.grid.sortInfo>0?"aria-sort=\"ascending\"":"aria-sort=\"descending\"";
if(!_15.id){
_15.id=this.grid.id+"Hdr"+_15.index;
}
_1a=["<th tabIndex=\"-1\" aria-readonly=\"true\" role=\"columnheader\"",_1b,"id=\"",_15.id,"\""];
}else{
var _1c=this.grid.editable&&!_15.editable?"aria-readonly=\"true\"":"";
_1a=["<td tabIndex=\"-1\" role=\"gridcell\"",_1c];
}
if(_15.colSpan){
_1a.push(" colspan=\"",_15.colSpan,"\"");
}
if(_15.rowSpan){
_1a.push(" rowspan=\"",_15.rowSpan,"\"");
}
_1a.push(" class=\"dojoxGridCell ");
if(_15.classes){
_1a.push(_15.classes," ");
}
if(_17){
_1a.push(_17," ");
}
_19.push(_1a.join(""));
_19.push("");
_1a=["\" idx=\"",_15.index,"\" style=\""];
if(_16&&_16[_16.length-1]!=";"){
_16+=";";
}
_1a.push(_15.styles,_16||"",_15.hidden?"display:none;":"");
if(_15.unitWidth){
_1a.push("width:",_15.unitWidth,";");
}
_19.push(_1a.join(""));
_19.push("");
_1a=["\""];
if(_15.attrs){
_1a.push(" ",_15.attrs);
}
_1a.push(">");
_19.push(_1a.join(""));
_19.push("");
_19.push(_18?"</th>":"</td>");
return _19;
},isCellNode:function(_1d){
return Boolean(_1d&&_1d!=_1.doc&&_1.attr(_1d,"idx"));
},getCellNodeIndex:function(_1e){
return _1e?Number(_1.attr(_1e,"idx")):-1;
},getCellNode:function(_1f,_20){
for(var i=0,row;((row=_5(_1f.firstChild,i))&&row.cells);i++){
for(var j=0,_21;(_21=row.cells[j]);j++){
if(this.getCellNodeIndex(_21)==_20){
return _21;
}
}
}
return null;
},findCellTarget:function(_22,_23){
var n=_22;
while(n&&(!this.isCellNode(n)||(n.offsetParent&&_12 in n.offsetParent.parentNode&&n.offsetParent.parentNode[_12]!=this.view.id))&&(n!=_23)){
n=n.parentNode;
}
return n!=_23?n:null;
},baseDecorateEvent:function(e){
e.dispatch="do"+e.type;
e.grid=this.grid;
e.sourceView=this.view;
e.cellNode=this.findCellTarget(e.target,e.rowNode);
e.cellIndex=this.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
},findTarget:function(_24,_25){
var n=_24;
while(n&&(n!=this.domNode)&&(!(_25 in n)||(_12 in n&&n[_12]!=this.view.id))){
n=n.parentNode;
}
return (n!=this.domNode)?n:null;
},findRowTarget:function(_26){
return this.findTarget(_26,_11);
},isIntraNodeEvent:function(e){
try{
return (e.cellNode&&e.relatedTarget&&_1.isDescendant(e.relatedTarget,e.cellNode));
}
catch(x){
return false;
}
},isIntraRowEvent:function(e){
try{
var row=e.relatedTarget&&this.findRowTarget(e.relatedTarget);
return !row&&(e.rowIndex==-1)||row&&(e.rowIndex==row.gridRowIndex);
}
catch(x){
return false;
}
},dispatchEvent:function(e){
if(e.dispatch in this){
return this[e.dispatch](e);
}
return false;
},domouseover:function(e){
if(e.cellNode&&(e.cellNode!=this.lastOverCellNode)){
this.lastOverCellNode=e.cellNode;
this.grid.onMouseOver(e);
}
this.grid.onMouseOverRow(e);
},domouseout:function(e){
if(e.cellNode&&(e.cellNode==this.lastOverCellNode)&&!this.isIntraNodeEvent(e,this.lastOverCellNode)){
this.lastOverCellNode=null;
this.grid.onMouseOut(e);
if(!this.isIntraRowEvent(e)){
this.grid.onMouseOutRow(e);
}
}
},domousedown:function(e){
if(e.cellNode){
this.grid.onMouseDown(e);
}
this.grid.onMouseDownRow(e);
}});
dg._ContentBuilder=_1.extend(function(_27){
dg._Builder.call(this,_27);
},dg._Builder.prototype,{update:function(){
this.prepareHtml();
},prepareHtml:function(){
var _28=this.grid.get,_29=this.view.structure.cells;
for(var j=0,row;(row=_29[j]);j++){
for(var i=0,_2a;(_2a=row[i]);i++){
_2a.get=_2a.get||(_2a.value==undefined)&&_28;
_2a.markup=this.generateCellMarkup(_2a,_2a.cellStyles,_2a.cellClasses,false);
if(!this.grid.editable&&_2a.editable){
this.grid.editable=true;
}
}
}
},generateHtml:function(_2b,_2c){
var _2d=this.getTableArray(),v=this.view,_2e=v.structure.cells,_2f=this.grid.getItem(_2c);
_2.grid.util.fire(this.view,"onBeforeRow",[_2c,_2e]);
for(var j=0,row;(row=_2e[j]);j++){
if(row.hidden||row.header){
continue;
}
_2d.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,_30,m,cc,cs;(_30=row[i]);i++){
m=_30.markup;
cc=_30.customClasses=[];
cs=_30.customStyles=[];
m[5]=_30.format(_2c,_2f);
if(_1.isIE<8&&(m[5]===null||m[5]===""||/^\s+$/.test(m[5]))){
m[5]="&nbsp;";
}
m[1]=cc.join(" ");
m[3]=cs.join(";");
_2d.push.apply(_2d,m);
}
_2d.push("</tr>");
}
_2d.push("</table>");
return _2d.join("");
},decorateEvent:function(e){
e.rowNode=this.findRowTarget(e.target);
if(!e.rowNode){
return false;
}
e.rowIndex=e.rowNode[_11];
this.baseDecorateEvent(e);
e.cell=this.grid.getCell(e.cellIndex);
return true;
}});
dg._HeaderBuilder=_1.extend(function(_31){
this.moveable=null;
dg._Builder.call(this,_31);
},dg._Builder.prototype,{_skipBogusClicks:false,overResizeWidth:4,minColWidth:1,update:function(){
if(this.tableMap){
this.tableMap.mapRows(this.view.structure.cells);
}else{
this.tableMap=new dg._TableMap(this.view.structure.cells);
}
},generateHtml:function(_32,_33){
var _34=this.getTableArray(),_35=this.view.structure.cells;
_2.grid.util.fire(this.view,"onBeforeRow",[-1,_35]);
for(var j=0,row;(row=_35[j]);j++){
if(row.hidden){
continue;
}
_34.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,_36,_37;(_36=row[i]);i++){
_36.customClasses=[];
_36.customStyles=[];
if(this.view.simpleStructure){
if(_36.draggable){
if(_36.headerClasses){
if(_36.headerClasses.indexOf("dojoDndItem")==-1){
_36.headerClasses+=" dojoDndItem";
}
}else{
_36.headerClasses="dojoDndItem";
}
}
if(_36.attrs){
if(_36.attrs.indexOf("dndType='gridColumn_")==-1){
_36.attrs+=" dndType='gridColumn_"+this.grid.id+"'";
}
}else{
_36.attrs="dndType='gridColumn_"+this.grid.id+"'";
}
}
_37=this.generateCellMarkup(_36,_36.headerStyles,_36.headerClasses,true);
_37[5]=(_33!=undefined?_33:_32(_36));
_37[3]=_36.customStyles.join(";");
_37[1]=_36.customClasses.join(" ");
_34.push(_37.join(""));
}
_34.push("</tr>");
}
_34.push("</table>");
return _34.join("");
},getCellX:function(e){
var n,x=e.layerX;
if(_1.isMoz||_1.isIE>=9){
n=_a(e.target,_d("th"));
x-=(n&&n.offsetLeft)||0;
var t=e.sourceView.getScrollbarWidth();
if(!_1._isBodyLtr()){
table=_a(n,_d("table"));
x-=(table&&table.offsetLeft)||0;
}
}
n=_a(e.target,function(){
if(!n||n==e.cellNode){
return false;
}
x+=(n.offsetLeft<0?0:n.offsetLeft);
return true;
});
return x;
},decorateEvent:function(e){
this.baseDecorateEvent(e);
e.rowIndex=-1;
e.cellX=this.getCellX(e);
return true;
},prepareResize:function(e,mod){
do{
var i=_3(e.cellNode);
e.cellNode=(i?e.cellNode.parentNode.cells[i+mod]:null);
e.cellIndex=(e.cellNode?this.getCellNodeIndex(e.cellNode):-1);
}while(e.cellNode&&e.cellNode.style.display=="none");
return Boolean(e.cellNode);
},canResize:function(e){
if(!e.cellNode||e.cellNode.colSpan>1){
return false;
}
var _38=this.grid.getCell(e.cellIndex);
return !_38.noresize&&_38.canResize();
},overLeftResizeArea:function(e){
if(_1.hasClass(_1.body(),"dojoDndMove")){
return false;
}
if(_1.isIE){
var tN=e.target;
if(_1.hasClass(tN,"dojoxGridArrowButtonNode")||_1.hasClass(tN,"dojoxGridArrowButtonChar")){
return false;
}
}
if(_1._isBodyLtr()){
return (e.cellIndex>0)&&(e.cellX>0&&e.cellX<this.overResizeWidth)&&this.prepareResize(e,-1);
}
var t=e.cellNode&&(e.cellX>0&&e.cellX<this.overResizeWidth);
return t;
},overRightResizeArea:function(e){
if(_1.hasClass(_1.body(),"dojoDndMove")){
return false;
}
if(_1.isIE){
var tN=e.target;
if(_1.hasClass(tN,"dojoxGridArrowButtonNode")||_1.hasClass(tN,"dojoxGridArrowButtonChar")){
return false;
}
}
if(_1._isBodyLtr()){
return e.cellNode&&(e.cellX>=e.cellNode.offsetWidth-this.overResizeWidth);
}
return (e.cellIndex>0)&&(e.cellX>=e.cellNode.offsetWidth-this.overResizeWidth)&&this.prepareResize(e,-1);
},domousemove:function(e){
if(!this.moveable){
var c=(this.overRightResizeArea(e)?"dojoxGridColResize":(this.overLeftResizeArea(e)?"dojoxGridColResize":""));
if(c&&!this.canResize(e)){
c="dojoxGridColNoResize";
}
_1.toggleClass(e.sourceView.headerNode,"dojoxGridColNoResize",(c=="dojoxGridColNoResize"));
_1.toggleClass(e.sourceView.headerNode,"dojoxGridColResize",(c=="dojoxGridColResize"));
if(_1.isIE){
var t=e.sourceView.headerNode.scrollLeft;
e.sourceView.headerNode.scrollLeft=t;
}
if(c){
_1.stopEvent(e);
}
}
},domousedown:function(e){
if(!this.moveable){
if((this.overRightResizeArea(e)||this.overLeftResizeArea(e))&&this.canResize(e)){
this.beginColumnResize(e);
}else{
this.grid.onMouseDown(e);
this.grid.onMouseOverRow(e);
}
}
},doclick:function(e){
if(this._skipBogusClicks){
_1.stopEvent(e);
return true;
}
return false;
},colResizeSetup:function(e,_39){
var _3a=_1.contentBox(e.sourceView.headerNode);
if(_39){
this.lineDiv=document.createElement("div");
var vw=(_1.position||_1._abs)(e.sourceView.headerNode,true);
var _3b=_1.contentBox(e.sourceView.domNode);
var l=e.pageX;
if(!_1._isBodyLtr()&&_1.isIE<8){
l-=_2.html.metrics.getScrollbar().w;
}
_1.style(this.lineDiv,{top:vw.y+"px",left:l+"px",height:(_3b.h+_3a.h)+"px"});
_1.addClass(this.lineDiv,"dojoxGridResizeColLine");
this.lineDiv._origLeft=l;
_1.body().appendChild(this.lineDiv);
}
var _3c=[],_3d=this.tableMap.findOverlappingNodes(e.cellNode);
for(var i=0,_3e;(_3e=_3d[i]);i++){
_3c.push({node:_3e,index:this.getCellNodeIndex(_3e),width:_3e.offsetWidth});
}
var _3f=e.sourceView;
var adj=_1._isBodyLtr()?1:-1;
var _40=e.grid.views.views;
var _41=[];
for(var j=_3f.idx+adj,_42;(_42=_40[j]);j=j+adj){
_41.push({node:_42.headerNode,left:window.parseInt(_42.headerNode.style.left)});
}
var _43=_3f.headerContentNode.firstChild;
var _44={scrollLeft:e.sourceView.headerNode.scrollLeft,view:_3f,node:e.cellNode,index:e.cellIndex,w:_1.contentBox(e.cellNode).w,vw:_3a.w,table:_43,tw:_1.contentBox(_43).w,spanners:_3c,followers:_41};
return _44;
},beginColumnResize:function(e){
this.moverDiv=document.createElement("div");
_1.style(this.moverDiv,{position:"absolute",left:0});
_1.body().appendChild(this.moverDiv);
_1.addClass(this.grid.domNode,"dojoxGridColumnResizing");
var m=(this.moveable=new _1.dnd.Moveable(this.moverDiv));
var _45=this.colResizeSetup(e,true);
m.onMove=_1.hitch(this,"doResizeColumn",_45);
_1.connect(m,"onMoveStop",_1.hitch(this,function(){
this.endResizeColumn(_45);
if(_45.node.releaseCapture){
_45.node.releaseCapture();
}
this.moveable.destroy();
delete this.moveable;
this.moveable=null;
_1.removeClass(this.grid.domNode,"dojoxGridColumnResizing");
}));
if(e.cellNode.setCapture){
e.cellNode.setCapture();
}
m.onMouseDown(e);
},doResizeColumn:function(_46,_47,_48){
var _49=_48.l;
var _4a={deltaX:_49,w:_46.w+(_1._isBodyLtr()?_49:-_49),vw:_46.vw+_49,tw:_46.tw+_49};
this.dragRecord={inDrag:_46,mover:_47,leftTop:_48};
if(_4a.w>=this.minColWidth){
if(!_47){
this.doResizeNow(_46,_4a);
}else{
_1.style(this.lineDiv,"left",(this.lineDiv._origLeft+_4a.deltaX)+"px");
}
}
},endResizeColumn:function(_4b){
if(this.dragRecord){
var _4c=this.dragRecord.leftTop;
var _4d=_1._isBodyLtr()?_4c.l:-_4c.l;
_4d+=Math.max(_4b.w+_4d,this.minColWidth)-(_4b.w+_4d);
if(_1.isWebKit&&_4b.spanners.length){
_4d+=_1._getPadBorderExtents(_4b.spanners[0].node).w;
}
var _4e={deltaX:_4d,w:_4b.w+_4d,vw:_4b.vw+_4d,tw:_4b.tw+_4d};
this.doResizeNow(_4b,_4e);
delete this.dragRecord;
}
_1.destroy(this.lineDiv);
_1.destroy(this.moverDiv);
_1.destroy(this.moverDiv);
delete this.moverDiv;
this._skipBogusClicks=true;
_4b.view.update();
this._skipBogusClicks=false;
this.grid.onResizeColumn(_4b.index);
},doResizeNow:function(_4f,_50){
_4f.view.convertColPctToFixed();
if(_4f.view.flexCells&&!_4f.view.testFlexCells()){
var t=_8(_4f.node);
if(t){
(t.style.width="");
}
}
var i,s,sw,f,fl;
for(i=0;(s=_4f.spanners[i]);i++){
sw=s.width+_50.deltaX;
if(sw>0){
s.node.style.width=sw+"px";
_4f.view.setColWidth(s.index,sw);
}
}
if(_1._isBodyLtr()||!_1.isIE){
for(i=0;(f=_4f.followers[i]);i++){
fl=f.left+_50.deltaX;
f.node.style.left=fl+"px";
}
}
_4f.node.style.width=_50.w+"px";
_4f.view.setColWidth(_4f.index,_50.w);
_4f.view.headerNode.style.width=_50.vw+"px";
_4f.view.setColumnsWidth(_50.tw);
if(!_1._isBodyLtr()){
_4f.view.headerNode.scrollLeft=_4f.scrollLeft+_50.deltaX;
}
}});
dg._TableMap=_1.extend(function(_51){
this.mapRows(_51);
},{map:null,mapRows:function(_52){
var _53=_52.length;
if(!_53){
return;
}
this.map=[];
var row;
for(var k=0;(row=_52[k]);k++){
this.map[k]=[];
}
for(var j=0;(row=_52[j]);j++){
for(var i=0,x=0,_54,_55,_56;(_54=row[i]);i++){
while(this.map[j][x]){
x++;
}
this.map[j][x]={c:i,r:j};
_56=_54.rowSpan||1;
_55=_54.colSpan||1;
for(var y=0;y<_56;y++){
for(var s=0;s<_55;s++){
this.map[j+y][x+s]=this.map[j][x];
}
}
x+=_55;
}
}
},dumpMap:function(){
for(var j=0,row,h="";(row=this.map[j]);j++,h=""){
for(var i=0,_57;(_57=row[i]);i++){
h+=_57.r+","+_57.c+"   ";
}
}
},getMapCoords:function(_58,_59){
for(var j=0,row;(row=this.map[j]);j++){
for(var i=0,_5a;(_5a=row[i]);i++){
if(_5a.c==_59&&_5a.r==_58){
return {j:j,i:i};
}
}
}
return {j:-1,i:-1};
},getNode:function(_5b,_5c,_5d){
var row=_5b&&_5b.rows[_5c];
return row&&row.cells[_5d];
},_findOverlappingNodes:function(_5e,_5f,_60){
var _61=[];
var m=this.getMapCoords(_5f,_60);
for(var j=0,row;(row=this.map[j]);j++){
if(j==m.j){
continue;
}
var rw=row[m.i];
var n=(rw?this.getNode(_5e,rw.r,rw.c):null);
if(n){
_61.push(n);
}
}
return _61;
},findOverlappingNodes:function(_62){
return this._findOverlappingNodes(_8(_62),_4(_62.parentNode),_3(_62));
}});
return _2.grid._Builder;
});
