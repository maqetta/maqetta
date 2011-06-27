/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dojox/grid/resources/_Grid.html"]="<div hidefocus=\"hidefocus\" role=\"grid\" dojoAttachEvent=\"onmouseout:_mouseOut\">\n\t<div class=\"dojoxGridMasterHeader\" dojoAttachPoint=\"viewsHeaderNode\" role=\"presentation\"></div>\n\t<div class=\"dojoxGridMasterView\" dojoAttachPoint=\"viewsNode\" role=\"presentation\"></div>\n\t<div class=\"dojoxGridMasterMessages\" style=\"display: none;\" dojoAttachPoint=\"messagesNode\"></div>\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\n</div>\n";
define("dojox/grid/_Grid",["dojo","dijit","dojox","dojo/text!./resources/_Grid.html","dojo/i18n!dijit/nls/loading","dijit/dijit","dijit/CheckedMenuItem","dijit/Menu","dojox/html/metrics","./util","./_Scroller","./_Layout","./_View","./_ViewManager","./_RowManager","./_FocusManager","./_EditManager","./Selection","./_RowSelector","./_Events"],function(_1,_2,_3,_4){
if(!_1.isCopyKey){
_1.isCopyKey=_1.dnd.getCopyKeyState;
}
_1.declare("dojox.grid._Grid",[_2._Widget,_2._TemplatedMixin,_3.grid._Events],{templateString:_4,classTag:"dojoxGrid",rowCount:5,keepRows:75,rowsPerPage:25,autoWidth:false,initialWidth:"",autoHeight:"",rowHeight:0,autoRender:true,defaultHeight:"15em",height:"",structure:null,elasticView:-1,singleClickEdit:false,selectionMode:"extended",rowSelector:"",columnReordering:false,headerMenu:null,placeholderLabel:"GridColumns",selectable:false,_click:null,loadingMessage:"<span class='dojoxGridLoading'>${loadingState}</span>",errorMessage:"<span class='dojoxGridError'>${errorState}</span>",noDataMessage:"",escapeHTMLInData:true,formatterScope:null,editable:false,sortInfo:0,themeable:true,_placeholders:null,_layoutClass:_3.grid._Layout,buildRendering:function(){
this.inherited(arguments);
if(!this.domNode.getAttribute("tabIndex")){
this.domNode.tabIndex="0";
}
this.createScroller();
this.createLayout();
this.createViews();
this.createManagers();
this.createSelection();
this.connect(this.selection,"onSelected","onSelected");
this.connect(this.selection,"onDeselected","onDeselected");
this.connect(this.selection,"onChanged","onSelectionChanged");
_3.html.metrics.initOnFontResize();
this.connect(_3.html.metrics,"onFontResize","textSizeChanged");
_3.grid.util.funnelEvents(this.domNode,this,"doKeyEvent",_3.grid.util.keyEvents);
if(this.selectionMode!="none"){
this.domNode.setAttribute("aria-multiselectable",this.selectionMode=="single"?"false":"true");
}
_1.addClass(this.domNode,this.classTag);
if(!this.isLeftToRight()){
_1.addClass(this.domNode,this.classTag+"Rtl");
}
},postMixInProperties:function(){
this.inherited(arguments);
var _5=_1.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=_1.string.substitute(this.loadingMessage,_5);
this.errorMessage=_1.string.substitute(this.errorMessage,_5);
if(this.srcNodeRef&&this.srcNodeRef.style.height){
this.height=this.srcNodeRef.style.height;
}
this._setAutoHeightAttr(this.autoHeight,true);
this.lastScrollTop=this.scrollTop=0;
},postCreate:function(){
this._placeholders=[];
this._setHeaderMenuAttr(this.headerMenu);
this._setStructureAttr(this.structure);
this._click=[];
this.inherited(arguments);
if(this.domNode&&this.autoWidth&&this.initialWidth){
this.domNode.style.width=this.initialWidth;
}
if(this.domNode&&!this.editable){
_1.attr(this.domNode,"aria-readonly","true");
}
},destroy:function(){
this.domNode.onReveal=null;
this.domNode.onSizeChange=null;
delete this._click;
this.edit.destroy();
delete this.edit;
this.views.destroyViews();
if(this.scroller){
this.scroller.destroy();
delete this.scroller;
}
if(this.focus){
this.focus.destroy();
delete this.focus;
}
if(this.headerMenu&&this._placeholders.length){
_1.forEach(this._placeholders,function(p){
p.unReplace(true);
});
this.headerMenu.unBindDomNode(this.viewsHeaderNode);
}
this.inherited(arguments);
},_setAutoHeightAttr:function(ah,_6){
if(typeof ah=="string"){
if(!ah||ah=="false"){
ah=false;
}else{
if(ah=="true"){
ah=true;
}else{
ah=window.parseInt(ah,10);
}
}
}
if(typeof ah=="number"){
if(isNaN(ah)){
ah=false;
}
if(ah<0){
ah=true;
}else{
if(ah===0){
ah=false;
}
}
}
this.autoHeight=ah;
if(typeof ah=="boolean"){
this._autoHeight=ah;
}else{
if(typeof ah=="number"){
this._autoHeight=(ah>=this.get("rowCount"));
}else{
this._autoHeight=false;
}
}
if(this._started&&!_6){
this.render();
}
},_getRowCountAttr:function(){
return this.updating&&this.invalidated&&this.invalidated.rowCount!=undefined?this.invalidated.rowCount:this.rowCount;
},textSizeChanged:function(){
this.render();
},sizeChange:function(){
this.update();
},createManagers:function(){
this.rows=new _3.grid._RowManager(this);
this.focus=new _3.grid._FocusManager(this);
this.edit=new _3.grid._EditManager(this);
},createSelection:function(){
this.selection=new _3.grid.Selection(this);
},createScroller:function(){
this.scroller=new _3.grid._Scroller();
this.scroller.grid=this;
this.scroller.renderRow=_1.hitch(this,"renderRow");
this.scroller.removeRow=_1.hitch(this,"rowRemoved");
},createLayout:function(){
this.layout=new this._layoutClass(this);
this.connect(this.layout,"moveColumn","onMoveColumn");
},onMoveColumn:function(){
this.render();
},onResizeColumn:function(_7){
},createViews:function(){
this.views=new _3.grid._ViewManager(this);
this.views.createView=_1.hitch(this,"createView");
},createView:function(_8,_9){
var c=_1.getObject(_8);
var _a=new c({grid:this,index:_9});
this.viewsNode.appendChild(_a.domNode);
this.viewsHeaderNode.appendChild(_a.headerNode);
this.views.addView(_a);
_1.attr(this.domNode,"align",_1._isBodyLtr()?"left":"right");
return _a;
},buildViews:function(){
for(var i=0,vs;(vs=this.layout.structure[i]);i++){
this.createView(vs.type||_3._scopeName+".grid._View",i).setStructure(vs);
}
this.scroller.setContentNodes(this.views.getContentNodes());
},_setStructureAttr:function(_b){
var s=_b;
if(s&&_1.isString(s)){
_1.deprecated("dojox.grid._Grid.set('structure', 'objVar')","use dojox.grid._Grid.set('structure', objVar) instead","2.0");
s=_1.getObject(s);
}
this.structure=s;
if(!s){
if(this.layout.structure){
s=this.layout.structure;
}else{
return;
}
}
this.views.destroyViews();
this.focus.focusView=null;
if(s!==this.layout.structure){
this.layout.setStructure(s);
}
this._structureChanged();
},setStructure:function(_c){
_1.deprecated("dojox.grid._Grid.setStructure(obj)","use dojox.grid._Grid.set('structure', obj) instead.","2.0");
this._setStructureAttr(_c);
},getColumnTogglingItems:function(){
return _1.map(this.layout.cells,function(_d){
if(!_d.menuItems){
_d.menuItems=[];
}
var _e=this;
var _f=new _2.CheckedMenuItem({label:_d.name,checked:!_d.hidden,_gridCell:_d,onChange:function(_10){
if(_e.layout.setColumnVisibility(this._gridCell.index,_10)){
var _11=this._gridCell.menuItems;
if(_11.length>1){
_1.forEach(_11,function(_12){
if(_12!==this){
_12.setAttribute("checked",_10);
}
},this);
}
_10=_1.filter(_e.layout.cells,function(c){
if(c.menuItems.length>1){
_1.forEach(c.menuItems,"item.set('disabled', false);");
}else{
c.menuItems[0].set("disabled",false);
}
return !c.hidden;
});
if(_10.length==1){
_1.forEach(_10[0].menuItems,"item.set('disabled', true);");
}
}
},destroy:function(){
var _13=_1.indexOf(this._gridCell.menuItems,this);
this._gridCell.menuItems.splice(_13,1);
delete this._gridCell;
_2.CheckedMenuItem.prototype.destroy.apply(this,arguments);
}});
_d.menuItems.push(_f);
return _f;
},this);
},_setHeaderMenuAttr:function(_14){
if(this._placeholders&&this._placeholders.length){
_1.forEach(this._placeholders,function(p){
p.unReplace(true);
});
this._placeholders=[];
}
if(this.headerMenu){
this.headerMenu.unBindDomNode(this.viewsHeaderNode);
}
this.headerMenu=_14;
if(!_14){
return;
}
this.headerMenu.bindDomNode(this.viewsHeaderNode);
if(this.headerMenu.getPlaceholders){
this._placeholders=this.headerMenu.getPlaceholders(this.placeholderLabel);
}
},setHeaderMenu:function(_15){
_1.deprecated("dojox.grid._Grid.setHeaderMenu(obj)","use dojox.grid._Grid.set('headerMenu', obj) instead.","2.0");
this._setHeaderMenuAttr(_15);
},setupHeaderMenu:function(){
if(this._placeholders&&this._placeholders.length){
_1.forEach(this._placeholders,function(p){
if(p._replaced){
p.unReplace(true);
}
p.replace(this.getColumnTogglingItems());
},this);
}
},_fetch:function(_16){
this.setScrollTop(0);
},getItem:function(_17){
return null;
},showMessage:function(_18){
if(_18){
this.messagesNode.innerHTML=_18;
this.messagesNode.style.display="";
}else{
this.messagesNode.innerHTML="";
this.messagesNode.style.display="none";
}
},_structureChanged:function(){
this.buildViews();
if(this.autoRender&&this._started){
this.render();
}
},hasLayout:function(){
return this.layout.cells.length;
},resize:function(_19,_1a){
this._pendingChangeSize=_19;
this._pendingResultSize=_1a;
this.sizeChange();
},_getPadBorder:function(){
this._padBorder=this._padBorder||_1._getPadBorderExtents(this.domNode);
return this._padBorder;
},_getHeaderHeight:function(){
var vns=this.viewsHeaderNode.style,t=vns.display=="none"?0:this.views.measureHeader();
vns.height=t+"px";
this.views.normalizeHeaderNodeHeight();
return t;
},_resize:function(_1b,_1c){
_1b=_1b||this._pendingChangeSize;
_1c=_1c||this._pendingResultSize;
delete this._pendingChangeSize;
delete this._pendingResultSize;
if(!this.domNode){
return;
}
var pn=this.domNode.parentNode;
if(!pn||pn.nodeType!=1||!this.hasLayout()||pn.style.visibility=="hidden"||pn.style.display=="none"){
return;
}
var _1d=this._getPadBorder();
var hh=undefined;
var h;
if(this._autoHeight){
this.domNode.style.height="auto";
}else{
if(typeof this.autoHeight=="number"){
h=hh=this._getHeaderHeight();
h+=(this.scroller.averageRowHeight*this.autoHeight);
this.domNode.style.height=h+"px";
}else{
if(this.domNode.clientHeight<=_1d.h){
if(pn==document.body){
this.domNode.style.height=this.defaultHeight;
}else{
if(this.height){
this.domNode.style.height=this.height;
}else{
this.fitTo="parent";
}
}
}
}
}
if(_1c){
_1b=_1c;
}
if(!this._autoHeight&&_1b){
_1.marginBox(this.domNode,_1b);
this.height=this.domNode.style.height;
delete this.fitTo;
}else{
if(this.fitTo=="parent"){
h=this._parentContentBoxHeight=this._parentContentBoxHeight||_1._getContentBox(pn).h;
this.domNode.style.height=Math.max(0,h)+"px";
}
}
var _1e=_1.some(this.views.views,function(v){
return v.flexCells;
});
if(!this._autoHeight&&(h||_1._getContentBox(this.domNode).h)===0){
this.viewsHeaderNode.style.display="none";
}else{
this.viewsHeaderNode.style.display="block";
if(!_1e&&hh===undefined){
hh=this._getHeaderHeight();
}
}
if(_1e){
hh=undefined;
}
this.adaptWidth();
this.adaptHeight(hh);
this.postresize();
},adaptWidth:function(){
var _1f=(!this.initialWidth&&this.autoWidth);
var w=_1f?0:this.domNode.clientWidth||(this.domNode.offsetWidth-this._getPadBorder().w),vw=this.views.arrange(1,w);
this.views.onEach("adaptWidth");
if(_1f){
this.domNode.style.width=vw+"px";
}
},adaptHeight:function(_20){
var t=_20===undefined?this._getHeaderHeight():_20;
var h=(this._autoHeight?-1:Math.max(this.domNode.clientHeight-t,0)||0);
this.views.onEach("setSize",[0,h]);
this.views.onEach("adaptHeight");
if(!this._autoHeight){
var _21=0,_22=0;
var _23=_1.filter(this.views.views,function(v){
var has=v.hasHScrollbar();
if(has){
_21++;
}else{
_22++;
}
return (!has);
});
if(_21>0&&_22>0){
_1.forEach(_23,function(v){
v.adaptHeight(true);
});
}
}
if(this.autoHeight===true||h!=-1||(typeof this.autoHeight=="number"&&this.autoHeight>=this.get("rowCount"))){
this.scroller.windowHeight=h;
}else{
this.scroller.windowHeight=Math.max(this.domNode.clientHeight-t,0);
}
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(this.autoRender){
this.render();
}
},render:function(){
if(!this.domNode){
return;
}
if(!this._started){
return;
}
if(!this.hasLayout()){
this.scroller.init(0,this.keepRows,this.rowsPerPage);
return;
}
this.update=this.defaultUpdate;
this._render();
},_render:function(){
this.scroller.init(this.get("rowCount"),this.keepRows,this.rowsPerPage);
this.prerender();
this.setScrollTop(0);
this.postrender();
},prerender:function(){
this.keepRows=this._autoHeight?0:this.keepRows;
this.scroller.setKeepInfo(this.keepRows);
this.views.render();
this._resize();
},postrender:function(){
this.postresize();
this.focus.initFocusView();
_1.setSelectable(this.domNode,this.selectable);
},postresize:function(){
if(this._autoHeight){
var _24=Math.max(this.views.measureContent())+"px";
this.viewsNode.style.height=_24;
}
},renderRow:function(_25,_26){
this.views.renderRow(_25,_26,this._skipRowRenormalize);
},rowRemoved:function(_27){
this.views.rowRemoved(_27);
},invalidated:null,updating:false,beginUpdate:function(){
this.invalidated=[];
this.updating=true;
},endUpdate:function(){
this.updating=false;
var i=this.invalidated,r;
if(i.all){
this.update();
}else{
if(i.rowCount!=undefined){
this.updateRowCount(i.rowCount);
}else{
for(r in i){
this.updateRow(Number(r));
}
}
}
this.invalidated=[];
},defaultUpdate:function(){
if(!this.domNode){
return;
}
if(this.updating){
this.invalidated.all=true;
return;
}
this.lastScrollTop=this.scrollTop;
this.prerender();
this.scroller.invalidateNodes();
this.setScrollTop(this.lastScrollTop);
this.postrender();
},update:function(){
this.render();
},updateRow:function(_28){
_28=Number(_28);
if(this.updating){
this.invalidated[_28]=true;
}else{
this.views.updateRow(_28);
this.scroller.rowHeightChanged(_28);
}
},updateRows:function(_29,_2a){
_29=Number(_29);
_2a=Number(_2a);
var i;
if(this.updating){
for(i=0;i<_2a;i++){
this.invalidated[i+_29]=true;
}
}else{
for(i=0;i<_2a;i++){
this.views.updateRow(i+_29,this._skipRowRenormalize);
}
this.scroller.rowHeightChanged(_29);
}
},updateRowCount:function(_2b){
if(this.updating){
this.invalidated.rowCount=_2b;
}else{
this.rowCount=_2b;
this._setAutoHeightAttr(this.autoHeight,true);
if(this.layout.cells.length){
this.scroller.updateRowCount(_2b);
}
this._resize();
if(this.layout.cells.length){
this.setScrollTop(this.scrollTop);
}
}
},updateRowStyles:function(_2c){
this.views.updateRowStyles(_2c);
},getRowNode:function(_2d){
if(this.focus.focusView&&!(this.focus.focusView instanceof _3.grid._RowSelector)){
return this.focus.focusView.rowNodes[_2d];
}else{
for(var i=0,_2e;(_2e=this.views.views[i]);i++){
if(!(_2e instanceof _3.grid._RowSelector)){
return _2e.rowNodes[_2d];
}
}
}
return null;
},rowHeightChanged:function(_2f){
this.views.renormalizeRow(_2f);
this.scroller.rowHeightChanged(_2f);
},fastScroll:true,delayScroll:false,scrollRedrawThreshold:(_1.isIE?100:50),scrollTo:function(_30){
if(!this.fastScroll){
this.setScrollTop(_30);
return;
}
var _31=Math.abs(this.lastScrollTop-_30);
this.lastScrollTop=_30;
if(_31>this.scrollRedrawThreshold||this.delayScroll){
this.delayScroll=true;
this.scrollTop=_30;
this.views.setScrollTop(_30);
if(this._pendingScroll){
window.clearTimeout(this._pendingScroll);
}
var _32=this;
this._pendingScroll=window.setTimeout(function(){
delete _32._pendingScroll;
_32.finishScrollJob();
},200);
}else{
this.setScrollTop(_30);
}
},finishScrollJob:function(){
this.delayScroll=false;
this.setScrollTop(this.scrollTop);
},setScrollTop:function(_33){
this.scroller.scroll(this.views.setScrollTop(_33));
},scrollToRow:function(_34){
this.setScrollTop(this.scroller.findScrollTop(_34)+1);
},styleRowNode:function(_35,_36){
if(_36){
this.rows.styleRowNode(_35,_36);
}
},_mouseOut:function(e){
this.rows.setOverRow(-2);
},getCell:function(_37){
return this.layout.cells[_37];
},setCellWidth:function(_38,_39){
this.getCell(_38).unitWidth=_39;
},getCellName:function(_3a){
return "Cell "+_3a.index;
},canSort:function(_3b){
},sort:function(){
},getSortAsc:function(_3c){
_3c=_3c==undefined?this.sortInfo:_3c;
return Boolean(_3c>0);
},getSortIndex:function(_3d){
_3d=_3d==undefined?this.sortInfo:_3d;
return Math.abs(_3d)-1;
},setSortIndex:function(_3e,_3f){
var si=_3e+1;
if(_3f!=undefined){
si*=(_3f?1:-1);
}else{
if(this.getSortIndex()==_3e){
si=-this.sortInfo;
}
}
this.setSortInfo(si);
},setSortInfo:function(_40){
if(this.canSort(_40)){
this.sortInfo=_40;
this.sort();
this.update();
}
},doKeyEvent:function(e){
e.dispatch="do"+e.type;
this.onKeyEvent(e);
},_dispatch:function(m,e){
if(m in this){
return this[m](e);
}
return false;
},dispatchKeyEvent:function(e){
this._dispatch(e.dispatch,e);
},dispatchContentEvent:function(e){
this.edit.dispatchEvent(e)||e.sourceView.dispatchContentEvent(e)||this._dispatch(e.dispatch,e);
},dispatchHeaderEvent:function(e){
e.sourceView.dispatchHeaderEvent(e)||this._dispatch("doheader"+e.type,e);
},dokeydown:function(e){
this.onKeyDown(e);
},doclick:function(e){
if(e.cellNode){
this.onCellClick(e);
}else{
this.onRowClick(e);
}
},dodblclick:function(e){
if(e.cellNode){
this.onCellDblClick(e);
}else{
this.onRowDblClick(e);
}
},docontextmenu:function(e){
if(e.cellNode){
this.onCellContextMenu(e);
}else{
this.onRowContextMenu(e);
}
},doheaderclick:function(e){
if(e.cellNode){
this.onHeaderCellClick(e);
}else{
this.onHeaderClick(e);
}
},doheaderdblclick:function(e){
if(e.cellNode){
this.onHeaderCellDblClick(e);
}else{
this.onHeaderDblClick(e);
}
},doheadercontextmenu:function(e){
if(e.cellNode){
this.onHeaderCellContextMenu(e);
}else{
this.onHeaderContextMenu(e);
}
},doStartEdit:function(_41,_42){
this.onStartEdit(_41,_42);
},doApplyCellEdit:function(_43,_44,_45){
this.onApplyCellEdit(_43,_44,_45);
},doCancelEdit:function(_46){
this.onCancelEdit(_46);
},doApplyEdit:function(_47){
this.onApplyEdit(_47);
},addRow:function(){
this.updateRowCount(this.get("rowCount")+1);
},removeSelectedRows:function(){
if(this.allItemsSelected){
this.updateRowCount(0);
}else{
this.updateRowCount(Math.max(0,this.get("rowCount")-this.selection.getSelected().length));
}
this.selection.clear();
}});
_3.grid._Grid.markupFactory=function(_48,_49,_4a,_4b){
var d=_1;
var _4c=function(n){
var w=d.attr(n,"width")||"auto";
if((w!="auto")&&(w.slice(-2)!="em")&&(w.slice(-1)!="%")){
w=parseInt(w,10)+"px";
}
return w;
};
if(!_48.structure&&_49.nodeName.toLowerCase()=="table"){
_48.structure=d.query("> colgroup",_49).map(function(cg){
var sv=d.attr(cg,"span");
var v={noscroll:(d.attr(cg,"noscroll")=="true")?true:false,__span:(!!sv?parseInt(sv,10):1),cells:[]};
if(d.hasAttr(cg,"width")){
v.width=_4c(cg);
}
return v;
});
if(!_48.structure.length){
_48.structure.push({__span:Infinity,cells:[]});
}
d.query("thead > tr",_49).forEach(function(tr,_4d){
var _4e=0;
var _4f=0;
var _50;
var _51=null;
d.query("> th",tr).map(function(th){
if(!_51){
_50=0;
_51=_48.structure[0];
}else{
if(_4e>=(_50+_51.__span)){
_4f++;
_50+=_51.__span;
var _52=_51;
_51=_48.structure[_4f];
}
}
var _53={name:d.trim(d.attr(th,"name")||th.innerHTML),colSpan:parseInt(d.attr(th,"colspan")||1,10),type:d.trim(d.attr(th,"cellType")||""),id:d.trim(d.attr(th,"id")||"")};
_4e+=_53.colSpan;
var _54=d.attr(th,"rowspan");
if(_54){
_53.rowSpan=_54;
}
if(d.hasAttr(th,"width")){
_53.width=_4c(th);
}
if(d.hasAttr(th,"relWidth")){
_53.relWidth=window.parseInt(_1.attr(th,"relWidth"),10);
}
if(d.hasAttr(th,"hidden")){
_53.hidden=(d.attr(th,"hidden")=="true"||d.attr(th,"hidden")===true);
}
if(_4b){
_4b(th,_53);
}
_53.type=_53.type?_1.getObject(_53.type):_3.grid.cells.Cell;
if(_53.type&&_53.type.markupFactory){
_53.type.markupFactory(th,_53);
}
if(!_51.cells[_4d]){
_51.cells[_4d]=[];
}
_51.cells[_4d].push(_53);
});
});
}
return new _4a(_48,_49);
};
return _3.grid._Grid;
});
