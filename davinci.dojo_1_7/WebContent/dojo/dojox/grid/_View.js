/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dojox/grid/resources/View.html"]="<div class=\"dojoxGridView\" role=\"presentation\">\n\t<div class=\"dojoxGridHeader\" dojoAttachPoint=\"headerNode\" role=\"presentation\">\n\t\t<div dojoAttachPoint=\"headerNodeContainer\" style=\"width:9000em\" role=\"presentation\">\n\t\t\t<div dojoAttachPoint=\"headerContentNode\" role=\"row\"></div>\n\t\t</div>\n\t</div>\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" dojoAttachPoint=\"hiddenFocusNode\" role=\"presentation\" />\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" role=\"presentation\" />\n\t<div class=\"dojoxGridScrollbox\" dojoAttachPoint=\"scrollboxNode\" role=\"presentation\">\n\t\t<div class=\"dojoxGridContent\" dojoAttachPoint=\"contentNode\" hidefocus=\"hidefocus\" role=\"presentation\"></div>\n\t</div>\n</div>\n";
define("dojox/grid/_View",["dojo","dijit","dojox","dojo/text!./resources/View.html","dojo/dnd/Source","dojo/dnd/Manager","dijit/_TemplatedMixin","dijit/_Widget","dojox/html/metrics","./_Builder","./util"],function(_1,_2,_3,_4){
var _5=function(_6,_7){
return _6.style.cssText==undefined?_6.getAttribute("style"):_6.style.cssText;
};
_1.declare("dojox.grid._View",[_2._Widget,_2._TemplatedMixin],{defaultWidth:"18em",viewWidth:"",templateString:_4,themeable:false,classTag:"dojoxGrid",marginBottom:0,rowPad:2,_togglingColumn:-1,_headerBuilderClass:_3.grid._HeaderBuilder,_contentBuilderClass:_3.grid._ContentBuilder,postMixInProperties:function(){
this.rowNodes={};
},postCreate:function(){
this.connect(this.scrollboxNode,"onscroll","doscroll");
_3.grid.util.funnelEvents(this.contentNode,this,"doContentEvent",["mouseover","mouseout","click","dblclick","contextmenu","mousedown"]);
_3.grid.util.funnelEvents(this.headerNode,this,"doHeaderEvent",["dblclick","mouseover","mouseout","mousemove","mousedown","click","contextmenu"]);
this.content=new this._contentBuilderClass(this);
this.header=new this._headerBuilderClass(this);
if(!_1._isBodyLtr()){
this.headerNodeContainer.style.width="";
}
},destroy:function(){
_1.destroy(this.headerNode);
delete this.headerNode;
for(var i in this.rowNodes){
_1.destroy(this.rowNodes[i]);
}
this.rowNodes={};
if(this.source){
this.source.destroy();
}
this.inherited(arguments);
},focus:function(){
if(_1.isIE||_1.isWebKit||_1.isOpera){
this.hiddenFocusNode.focus();
}else{
this.scrollboxNode.focus();
}
},setStructure:function(_8){
var vs=(this.structure=_8);
if(vs.width&&!isNaN(vs.width)){
this.viewWidth=vs.width+"em";
}else{
this.viewWidth=vs.width||(vs.noscroll?"auto":this.viewWidth);
}
this._onBeforeRow=vs.onBeforeRow||function(){
};
this._onAfterRow=vs.onAfterRow||function(){
};
this.noscroll=vs.noscroll;
if(this.noscroll){
this.scrollboxNode.style.overflow="hidden";
}
this.simpleStructure=Boolean(vs.cells.length==1);
this.testFlexCells();
this.updateStructure();
},_cleanupRowWidgets:function(_9){
if(_9){
_1.forEach(_1.query("[widgetId]",_9).map(_2.byNode),function(w){
if(w._destroyOnRemove){
w.destroy();
delete w;
}else{
if(w.domNode&&w.domNode.parentNode){
w.domNode.parentNode.removeChild(w.domNode);
}
}
});
}
},onBeforeRow:function(_a,_b){
this._onBeforeRow(_a,_b);
if(_a>=0){
this._cleanupRowWidgets(this.getRowNode(_a));
}
},onAfterRow:function(_c,_d,_e){
this._onAfterRow(_c,_d,_e);
var g=this.grid;
_1.forEach(_1.query(".dojoxGridStubNode",_e),function(n){
if(n&&n.parentNode){
var lw=n.getAttribute("linkWidget");
var _f=window.parseInt(_1.attr(n,"cellIdx"),10);
var _10=g.getCell(_f);
var w=_2.byId(lw);
if(w){
n.parentNode.replaceChild(w.domNode,n);
if(!w._started){
w.startup();
}
}else{
n.innerHTML="";
}
}
},this);
},testFlexCells:function(){
this.flexCells=false;
for(var j=0,row;(row=this.structure.cells[j]);j++){
for(var i=0,_11;(_11=row[i]);i++){
_11.view=this;
this.flexCells=this.flexCells||_11.isFlex();
}
}
return this.flexCells;
},updateStructure:function(){
this.header.update();
this.content.update();
},getScrollbarWidth:function(){
var _12=this.hasVScrollbar();
var _13=_1.style(this.scrollboxNode,"overflow");
if(this.noscroll||!_13||_13=="hidden"){
_12=false;
}else{
if(_13=="scroll"){
_12=true;
}
}
return (_12?_3.html.metrics.getScrollbar().w:0);
},getColumnsWidth:function(){
var h=this.headerContentNode;
return h&&h.firstChild?h.firstChild.offsetWidth:0;
},setColumnsWidth:function(_14){
this.headerContentNode.firstChild.style.width=_14+"px";
if(this.viewWidth){
this.viewWidth=_14+"px";
}
},getWidth:function(){
return this.viewWidth||(this.getColumnsWidth()+this.getScrollbarWidth())+"px";
},getContentWidth:function(){
return Math.max(0,_1._getContentBox(this.domNode).w-this.getScrollbarWidth())+"px";
},render:function(){
this.scrollboxNode.style.height="";
this.renderHeader();
if(this._togglingColumn>=0){
this.setColumnsWidth(this.getColumnsWidth()-this._togglingColumn);
this._togglingColumn=-1;
}
var _15=this.grid.layout.cells;
var _16=_1.hitch(this,function(_17,_18){
!_1._isBodyLtr()&&(_18=!_18);
var inc=_18?-1:1;
var idx=this.header.getCellNodeIndex(_17)+inc;
var _19=_15[idx];
while(_19&&_19.getHeaderNode()&&_19.getHeaderNode().style.display=="none"){
idx+=inc;
_19=_15[idx];
}
if(_19){
return _19.getHeaderNode();
}
return null;
});
if(this.grid.columnReordering&&this.simpleStructure){
if(this.source){
this.source.destroy();
}
var _1a="dojoxGrid_bottomMarker";
var _1b="dojoxGrid_topMarker";
if(this.bottomMarker){
_1.destroy(this.bottomMarker);
}
this.bottomMarker=_1.byId(_1a);
if(this.topMarker){
_1.destroy(this.topMarker);
}
this.topMarker=_1.byId(_1b);
if(!this.bottomMarker){
this.bottomMarker=_1.create("div",{"id":_1a,"class":"dojoxGridColPlaceBottom"},_1.body());
this._hide(this.bottomMarker);
this.topMarker=_1.create("div",{"id":_1b,"class":"dojoxGridColPlaceTop"},_1.body());
this._hide(this.topMarker);
}
this.arrowDim=_1.contentBox(this.bottomMarker);
var _1c=_1.contentBox(this.headerContentNode.firstChild.rows[0]).h;
this.source=new _1.dnd.Source(this.headerContentNode.firstChild.rows[0],{horizontal:true,accept:["gridColumn_"+this.grid.id],viewIndex:this.index,generateText:false,onMouseDown:_1.hitch(this,function(e){
this.header.decorateEvent(e);
if((this.header.overRightResizeArea(e)||this.header.overLeftResizeArea(e))&&this.header.canResize(e)&&!this.header.moveable){
this.header.beginColumnResize(e);
}else{
if(this.grid.headerMenu){
this.grid.headerMenu.onCancel(true);
}
if(e.button===(_1.isIE?1:0)){
_1.dnd.Source.prototype.onMouseDown.call(this.source,e);
}
}
}),onMouseOver:_1.hitch(this,function(e){
var src=this.source;
if(src._getChildByEvent(e)){
_1.dnd.Source.prototype.onMouseOver.apply(src,arguments);
}
}),_markTargetAnchor:_1.hitch(this,function(_1d){
var src=this.source;
if(src.current==src.targetAnchor&&src.before==_1d){
return;
}
if(src.targetAnchor&&_16(src.targetAnchor,src.before)){
src._removeItemClass(_16(src.targetAnchor,src.before),src.before?"After":"Before");
}
_1.dnd.Source.prototype._markTargetAnchor.call(src,_1d);
var _1e=_1d?src.targetAnchor:_16(src.targetAnchor,src.before);
var _1f=0;
if(!_1e){
_1e=src.targetAnchor;
_1f=_1.contentBox(_1e).w+this.arrowDim.w/2+2;
}
var pos=(_1.position||_1._abs)(_1e,true);
var _20=Math.floor(pos.x-this.arrowDim.w/2+_1f);
_1.style(this.bottomMarker,"visibility","visible");
_1.style(this.topMarker,"visibility","visible");
_1.style(this.bottomMarker,{"left":_20+"px","top":(_1c+pos.y)+"px"});
_1.style(this.topMarker,{"left":_20+"px","top":(pos.y-this.arrowDim.h)+"px"});
if(src.targetAnchor&&_16(src.targetAnchor,src.before)){
src._addItemClass(_16(src.targetAnchor,src.before),src.before?"After":"Before");
}
}),_unmarkTargetAnchor:_1.hitch(this,function(){
var src=this.source;
if(!src.targetAnchor){
return;
}
if(src.targetAnchor&&_16(src.targetAnchor,src.before)){
src._removeItemClass(_16(src.targetAnchor,src.before),src.before?"After":"Before");
}
this._hide(this.bottomMarker);
this._hide(this.topMarker);
_1.dnd.Source.prototype._unmarkTargetAnchor.call(src);
}),destroy:_1.hitch(this,function(){
_1.disconnect(this._source_conn);
_1.unsubscribe(this._source_sub);
_1.dnd.Source.prototype.destroy.call(this.source);
if(this.bottomMarker){
_1.destroy(this.bottomMarker);
delete this.bottomMarker;
}
if(this.topMarker){
_1.destroy(this.topMarker);
delete this.topMarker;
}
}),onDndCancel:_1.hitch(this,function(){
_1.dnd.Source.prototype.onDndCancel.call(this.source);
this._hide(this.bottomMarker);
this._hide(this.topMarker);
})});
this._source_conn=_1.connect(this.source,"onDndDrop",this,"_onDndDrop");
this._source_sub=_1.subscribe("/dnd/drop/before",this,"_onDndDropBefore");
this.source.startup();
}
},_hide:function(_21){
_1.style(_21,{left:"-10000px",top:"-10000px","visibility":"hidden"});
},_onDndDropBefore:function(_22,_23,_24){
if(_1.dnd.manager().target!==this.source){
return;
}
this.source._targetNode=this.source.targetAnchor;
this.source._beforeTarget=this.source.before;
var _25=this.grid.views.views;
var _26=_25[_22.viewIndex];
var _27=_25[this.index];
if(_27!=_26){
_26.convertColPctToFixed();
_27.convertColPctToFixed();
}
},_onDndDrop:function(_28,_29,_2a){
if(_1.dnd.manager().target!==this.source){
if(_1.dnd.manager().source===this.source){
this._removingColumn=true;
}
return;
}
this._hide(this.bottomMarker);
this._hide(this.topMarker);
var _2b=function(n){
return n?_1.attr(n,"idx"):null;
};
var w=_1.marginBox(_29[0]).w;
if(_28.viewIndex!==this.index){
var _2c=this.grid.views.views;
var _2d=_2c[_28.viewIndex];
var _2e=_2c[this.index];
if(_2d.viewWidth&&_2d.viewWidth!="auto"){
_2d.setColumnsWidth(_2d.getColumnsWidth()-w);
}
if(_2e.viewWidth&&_2e.viewWidth!="auto"){
_2e.setColumnsWidth(_2e.getColumnsWidth());
}
}
var stn=this.source._targetNode;
var stb=this.source._beforeTarget;
!_1._isBodyLtr()&&(stb=!stb);
var _2f=this.grid.layout;
var idx=this.index;
delete this.source._targetNode;
delete this.source._beforeTarget;
_2f.moveColumn(_28.viewIndex,idx,_2b(_29[0]),_2b(stn),stb);
},renderHeader:function(){
this.headerContentNode.innerHTML=this.header.generateHtml(this._getHeaderContent);
if(this.flexCells){
this.contentWidth=this.getContentWidth();
this.headerContentNode.firstChild.style.width=this.contentWidth;
}
_3.grid.util.fire(this,"onAfterRow",[-1,this.structure.cells,this.headerContentNode]);
},_getHeaderContent:function(_30){
var n=_30.name||_30.grid.getCellName(_30);
if(/^\s+$/.test(n)){
n="&nbsp;";
}
var ret=["<div class=\"dojoxGridSortNode"];
if(_30.index!=_30.grid.getSortIndex()){
ret.push("\">");
}else{
ret=ret.concat([" ",_30.grid.sortInfo>0?"dojoxGridSortUp":"dojoxGridSortDown","\"><div class=\"dojoxGridArrowButtonChar\">",_30.grid.sortInfo>0?"&#9650;":"&#9660;","</div><div class=\"dojoxGridArrowButtonNode\" role=\"presentation\"></div>","<div class=\"dojoxGridColCaption\">"]);
}
ret=ret.concat([n,"</div></div>"]);
return ret.join("");
},resize:function(){
this.adaptHeight();
this.adaptWidth();
},hasHScrollbar:function(_31){
var _32=this._hasHScroll||false;
if(this._hasHScroll==undefined||_31){
if(this.noscroll){
this._hasHScroll=false;
}else{
var _33=_1.style(this.scrollboxNode,"overflow");
if(_33=="hidden"){
this._hasHScroll=false;
}else{
if(_33=="scroll"){
this._hasHScroll=true;
}else{
this._hasHScroll=(this.scrollboxNode.offsetWidth-this.getScrollbarWidth()<this.contentNode.offsetWidth);
}
}
}
}
if(_32!==this._hasHScroll){
this.grid.update();
}
return this._hasHScroll;
},hasVScrollbar:function(_34){
var _35=this._hasVScroll||false;
if(this._hasVScroll==undefined||_34){
if(this.noscroll){
this._hasVScroll=false;
}else{
var _36=_1.style(this.scrollboxNode,"overflow");
if(_36=="hidden"){
this._hasVScroll=false;
}else{
if(_36=="scroll"){
this._hasVScroll=true;
}else{
this._hasVScroll=(this.scrollboxNode.scrollHeight>this.scrollboxNode.clientHeight);
}
}
}
}
if(_35!==this._hasVScroll){
this.grid.update();
}
return this._hasVScroll;
},convertColPctToFixed:function(){
var _37=false;
this.grid.initialWidth="";
var _38=_1.query("th",this.headerContentNode);
var _39=_1.map(_38,function(c,_3a){
var w=c.style.width;
_1.attr(c,"vIdx",_3a);
if(w&&w.slice(-1)=="%"){
_37=true;
}else{
if(w&&w.slice(-2)=="px"){
return window.parseInt(w,10);
}
}
return _1.contentBox(c).w;
});
if(_37){
_1.forEach(this.grid.layout.cells,function(_3b,idx){
if(_3b.view==this){
var _3c=_3b.view.getHeaderCellNode(_3b.index);
if(_3c&&_1.hasAttr(_3c,"vIdx")){
var _3d=window.parseInt(_1.attr(_3c,"vIdx"));
this.setColWidth(idx,_39[_3d]);
_1.removeAttr(_3c,"vIdx");
}
}
},this);
return true;
}
return false;
},adaptHeight:function(_3e){
if(!this.grid._autoHeight){
var h=(this.domNode.style.height&&parseInt(this.domNode.style.height.replace(/px/,""),10))||this.domNode.clientHeight;
var _3f=this;
var _40=function(){
var v;
for(var i in _3f.grid.views.views){
v=_3f.grid.views.views[i];
if(v!==_3f&&v.hasHScrollbar()){
return true;
}
}
return false;
};
if(_3e||(this.noscroll&&_40())){
h-=_3.html.metrics.getScrollbar().h;
}
_3.grid.util.setStyleHeightPx(this.scrollboxNode,h);
}
this.hasVScrollbar(true);
},adaptWidth:function(){
if(this.flexCells){
this.contentWidth=this.getContentWidth();
this.headerContentNode.firstChild.style.width=this.contentWidth;
}
var w=this.scrollboxNode.offsetWidth-this.getScrollbarWidth();
if(!this._removingColumn){
w=Math.max(w,this.getColumnsWidth())+"px";
}else{
w=Math.min(w,this.getColumnsWidth())+"px";
this._removingColumn=false;
}
var cn=this.contentNode;
cn.style.width=w;
this.hasHScrollbar(true);
},setSize:function(w,h){
var ds=this.domNode.style;
var hs=this.headerNode.style;
if(w){
ds.width=w;
hs.width=w;
}
ds.height=(h>=0?h+"px":"");
},renderRow:function(_41){
var _42=this.createRowNode(_41);
this.buildRow(_41,_42);
return _42;
},createRowNode:function(_43){
var _44=document.createElement("div");
_44.className=this.classTag+"Row";
if(this instanceof _3.grid._RowSelector){
_1.attr(_44,"role","presentation");
}else{
_1.attr(_44,"role","row");
if(this.grid.selectionMode!="none"){
_44.setAttribute("aria-selected","false");
}
}
_44[_3.grid.util.gridViewTag]=this.id;
_44[_3.grid.util.rowIndexTag]=_43;
this.rowNodes[_43]=_44;
return _44;
},buildRow:function(_45,_46){
this.buildRowContent(_45,_46);
this.styleRow(_45,_46);
},buildRowContent:function(_47,_48){
_48.innerHTML=this.content.generateHtml(_47,_47);
if(this.flexCells&&this.contentWidth){
_48.firstChild.style.width=this.contentWidth;
}
_3.grid.util.fire(this,"onAfterRow",[_47,this.structure.cells,_48]);
},rowRemoved:function(_49){
if(_49>=0){
this._cleanupRowWidgets(this.getRowNode(_49));
}
this.grid.edit.save(this,_49);
delete this.rowNodes[_49];
},getRowNode:function(_4a){
return this.rowNodes[_4a];
},getCellNode:function(_4b,_4c){
var row=this.getRowNode(_4b);
if(row){
return this.content.getCellNode(row,_4c);
}
},getHeaderCellNode:function(_4d){
if(this.headerContentNode){
return this.header.getCellNode(this.headerContentNode,_4d);
}
},styleRow:function(_4e,_4f){
_4f._style=_5(_4f);
this.styleRowNode(_4e,_4f);
},styleRowNode:function(_50,_51){
if(_51){
this.doStyleRowNode(_50,_51);
}
},doStyleRowNode:function(_52,_53){
this.grid.styleRowNode(_52,_53);
},updateRow:function(_54){
var _55=this.getRowNode(_54);
if(_55){
_55.style.height="";
this.buildRow(_54,_55);
}
return _55;
},updateRowStyles:function(_56){
this.styleRowNode(_56,this.getRowNode(_56));
},lastTop:0,firstScroll:0,doscroll:function(_57){
var _58=_1._isBodyLtr();
if(this.firstScroll<2){
if((!_58&&this.firstScroll==1)||(_58&&this.firstScroll===0)){
var s=_1.marginBox(this.headerNodeContainer);
if(_1.isIE){
this.headerNodeContainer.style.width=s.w+this.getScrollbarWidth()+"px";
}else{
if(_1.isMoz){
this.headerNodeContainer.style.width=s.w-this.getScrollbarWidth()+"px";
this.scrollboxNode.scrollLeft=_58?this.scrollboxNode.clientWidth-this.scrollboxNode.scrollWidth:this.scrollboxNode.scrollWidth-this.scrollboxNode.clientWidth;
}
}
}
this.firstScroll++;
}
this.headerNode.scrollLeft=this.scrollboxNode.scrollLeft;
var top=this.scrollboxNode.scrollTop;
if(top!==this.lastTop){
this.grid.scrollTo(top);
}
},setScrollTop:function(_59){
this.lastTop=_59;
this.scrollboxNode.scrollTop=_59;
return this.scrollboxNode.scrollTop;
},doContentEvent:function(e){
if(this.content.decorateEvent(e)){
this.grid.onContentEvent(e);
}
},doHeaderEvent:function(e){
if(this.header.decorateEvent(e)){
this.grid.onHeaderEvent(e);
}
},dispatchContentEvent:function(e){
return this.content.dispatchEvent(e);
},dispatchHeaderEvent:function(e){
return this.header.dispatchEvent(e);
},setColWidth:function(_5a,_5b){
this.grid.setCellWidth(_5a,_5b+"px");
},update:function(){
if(!this.domNode){
return;
}
this.content.update();
this.grid.update();
var _5c=this.scrollboxNode.scrollLeft;
this.scrollboxNode.scrollLeft=_5c;
this.headerNode.scrollLeft=_5c;
}});
_1.declare("dojox.grid._GridAvatar",_1.dnd.Avatar,{construct:function(){
var dd=_1.doc;
var a=dd.createElement("table");
a.cellPadding=a.cellSpacing="0";
a.className="dojoxGridDndAvatar";
a.style.position="absolute";
a.style.zIndex=1999;
a.style.margin="0px";
var b=dd.createElement("tbody");
var tr=dd.createElement("tr");
var td=dd.createElement("td");
var img=dd.createElement("td");
tr.className="dojoxGridDndAvatarItem";
img.className="dojoxGridDndAvatarItemImage";
img.style.width="16px";
var _5d=this.manager.source,_5e;
if(_5d.creator){
_5e=_5d._normalizedCreator(_5d.getItem(this.manager.nodes[0].id).data,"avatar").node;
}else{
_5e=this.manager.nodes[0].cloneNode(true);
var _5f,_60;
if(_5e.tagName.toLowerCase()=="tr"){
_5f=dd.createElement("table");
_60=dd.createElement("tbody");
_60.appendChild(_5e);
_5f.appendChild(_60);
_5e=_5f;
}else{
if(_5e.tagName.toLowerCase()=="th"){
_5f=dd.createElement("table");
_60=dd.createElement("tbody");
var r=dd.createElement("tr");
_5f.cellPadding=_5f.cellSpacing="0";
r.appendChild(_5e);
_60.appendChild(r);
_5f.appendChild(_60);
_5e=_5f;
}
}
}
_5e.id="";
td.appendChild(_5e);
tr.appendChild(img);
tr.appendChild(td);
_1.style(tr,"opacity",0.9);
b.appendChild(tr);
a.appendChild(b);
this.node=a;
var m=_1.dnd.manager();
this.oldOffsetY=m.OFFSET_Y;
m.OFFSET_Y=1;
},destroy:function(){
_1.dnd.manager().OFFSET_Y=this.oldOffsetY;
this.inherited(arguments);
}});
var _61=_1.dnd.manager().makeAvatar;
_1.dnd.manager().makeAvatar=function(){
var src=this.source;
if(src.viewIndex!==undefined&&!_1.hasClass(_1.body(),"dijit_a11y")){
return new _3.grid._GridAvatar(this);
}
return _61.call(_1.dnd.manager());
};
return _3.grid._View;
});
