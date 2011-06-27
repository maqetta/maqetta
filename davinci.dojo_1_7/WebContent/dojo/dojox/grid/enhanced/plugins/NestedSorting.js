/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/NestedSorting",["dojo","dijit","dojox","../_Plugin"],function(_1,_2,_3){
_1.declare("dojox.grid.enhanced.plugins.NestedSorting",_3.grid.enhanced._Plugin,{name:"nestedSorting",_currMainSort:"none",_currRegionIdx:-1,_a11yText:{"dojoxGridDescending":"&#9662;","dojoxGridAscending":"&#9652;","dojoxGridAscendingTip":"&#1784;","dojoxGridDescendingTip":"&#1783;","dojoxGridUnsortedTip":"x"},constructor:function(){
this._sortDef=[];
this._sortData={};
this._headerNodes={};
this._excludedColIdx=[];
this.nls=this.grid._nls;
this.grid.setSortInfo=function(){
};
this.grid.setSortIndex=_1.hitch(this,"_setGridSortIndex");
this.grid.getSortProps=_1.hitch(this,"getSortProps");
if(this.grid.sortFields){
this._setGridSortIndex(this.grid.sortFields,null,true);
}
this.connect(this.grid.views,"render","_initSort");
this.initCookieHandler();
_1.subscribe("dojox/grid/rearrange/move/"+this.grid.id,_1.hitch(this,"_onColumnDnD"));
},onStartUp:function(){
this.inherited(arguments);
this.connect(this.grid,"onHeaderCellClick","_onHeaderCellClick");
this.connect(this.grid,"onHeaderCellMouseOver","_onHeaderCellMouseOver");
this.connect(this.grid,"onHeaderCellMouseOut","_onHeaderCellMouseOut");
},_onColumnDnD:function(_4,_5){
if(_4!=="col"){
return;
}
var m=_5,_6={},d=this._sortData,p;
var cr=this._getCurrentRegion();
this._blurRegion(cr);
var _7=_1.attr(this._getRegionHeader(cr),"idx");
for(p in m){
if(d[p]){
_6[m[p]]=d[p];
delete d[p];
}
if(p===_7){
_7=m[p];
}
}
for(p in _6){
d[p]=_6[p];
}
var c=this._headerNodes[_7];
this._currRegionIdx=_1.indexOf(this._getRegions(),c.firstChild);
this._initSort(false);
},_setGridSortIndex:function(_8,_9,_a){
if(_1.isArray(_8)){
var i,d,_b;
for(i=0;i<_8.length;i++){
d=_8[i];
_b=this.grid.getCellByField(d.attribute);
if(!_b){
console.warn("Invalid sorting option, column ",d.attribute," not found.");
return;
}
if(_b["nosort"]||!this.grid.canSort(_b.index,_b.field)){
console.warn("Invalid sorting option, column ",d.attribute," is unsortable.");
return;
}
}
this.clearSort();
_1.forEach(_8,function(d,i){
_b=this.grid.getCellByField(d.attribute);
this.setSortData(_b.index,"index",i);
this.setSortData(_b.index,"order",d.descending?"desc":"asc");
},this);
}else{
if(!isNaN(_8)){
if(_9===undefined){
return;
}
this.setSortData(_8,"order",_9?"asc":"desc");
}else{
return;
}
}
this._updateSortDef();
if(!_a){
this.grid.sort();
}
},getSortProps:function(){
return this._sortDef.length?this._sortDef:null;
},_initSort:function(_c){
var g=this.grid,n=g.domNode,_d=this._sortDef.length;
_1.toggleClass(n,"dojoxGridSorted",!!_d);
_1.toggleClass(n,"dojoxGridSingleSorted",_d===1);
_1.toggleClass(n,"dojoxGridNestSorted",_d>1);
if(_d>0){
this._currMainSort=this._sortDef[0].descending?"desc":"asc";
}
var _e,_f=this._excludedCoIdx=[];
this._headerNodes=_1.query("th",g.viewsHeaderNode).forEach(function(n){
_e=parseInt(_1.attr(n,"idx"),10);
if(_1.style(n,"display")==="none"||g.layout.cells[_e]["nosort"]||(g.canSort&&!g.canSort(_e,g.layout.cells[_e]["field"]))){
_f.push(_e);
}
});
this._headerNodes.forEach(this._initHeaderNode,this);
this._initFocus();
if(_c){
this._focusHeader();
}
},_initHeaderNode:function(_10){
var _11=_1.query(".dojoxGridSortNode",_10)[0];
if(_11){
_1.toggleClass(_11,"dojoxGridSortNoWrap",true);
}
if(_1.indexOf(this._excludedCoIdx,_1.attr(_10,"idx"))>=0){
_1.addClass(_10,"dojoxGridNoSort");
return;
}
if(!_1.query(".dojoxGridSortBtn",_10).length){
this._connects=_1.filter(this._connects,function(_12){
if(_12._sort){
_1.disconnect(_12);
return false;
}
return true;
});
var n=_1.create("a",{className:"dojoxGridSortBtn dojoxGridSortBtnNested",title:this.nls.nestedSort+" - "+this.nls.ascending,innerHTML:"1"},_10.firstChild,"last");
n.onmousedown=_1.stopEvent;
n=_1.create("a",{className:"dojoxGridSortBtn dojoxGridSortBtnSingle",title:this.nls.singleSort+" - "+this.nls.ascending},_10.firstChild,"last");
n.onmousedown=_1.stopEvent;
}else{
var a1=_1.query(".dojoxGridSortBtnSingle",_10)[0];
var a2=_1.query(".dojoxGridSortBtnNested",_10)[0];
a1.className="dojoxGridSortBtn dojoxGridSortBtnSingle";
a2.className="dojoxGridSortBtn dojoxGridSortBtnNested";
a2.innerHTML="1";
_1.removeClass(_10,"dojoxGridCellShowIndex");
_1.removeClass(_10.firstChild,"dojoxGridSortNodeSorted");
_1.removeClass(_10.firstChild,"dojoxGridSortNodeAsc");
_1.removeClass(_10.firstChild,"dojoxGridSortNodeDesc");
_1.removeClass(_10.firstChild,"dojoxGridSortNodeMain");
_1.removeClass(_10.firstChild,"dojoxGridSortNodeSub");
}
this._updateHeaderNodeUI(_10);
},_onHeaderCellClick:function(e){
this._focusRegion(e.target);
if(_1.hasClass(e.target,"dojoxGridSortBtn")){
this._onSortBtnClick(e);
_1.stopEvent(e);
this._focusRegion(this._getCurrentRegion());
}
},_onHeaderCellMouseOver:function(e){
if(!e.cell){
return;
}
if(this._sortDef.length>1){
return;
}
if(this._sortData[e.cellIndex]&&this._sortData[e.cellIndex].index===0){
return;
}
var p;
for(p in this._sortData){
if(this._sortData[p]&&this._sortData[p].index===0){
_1.addClass(this._headerNodes[p],"dojoxGridCellShowIndex");
break;
}
}
if(!_1.hasClass(_1.body(),"dijit_a11y")){
return;
}
var i=e.cell.index,_13=e.cellNode;
var _14=_1.query(".dojoxGridSortBtnSingle",_13)[0];
var _15=_1.query(".dojoxGridSortBtnNested",_13)[0];
var _16="none";
if(_1.hasClass(this.grid.domNode,"dojoxGridSingleSorted")){
_16="single";
}else{
if(_1.hasClass(this.grid.domNode,"dojoxGridNestSorted")){
_16="nested";
}
}
var _17=_1.attr(_15,"orderIndex");
if(_17===null||_17===undefined){
_1.attr(_15,"orderIndex",_15.innerHTML);
_17=_15.innerHTML;
}
if(this.isAsc(i)){
_15.innerHTML=_17+this._a11yText.dojoxGridDescending;
}else{
if(this.isDesc(i)){
_15.innerHTML=_17+this._a11yText.dojoxGridUnsortedTip;
}else{
_15.innerHTML=_17+this._a11yText.dojoxGridAscending;
}
}
if(this._currMainSort==="none"){
_14.innerHTML=this._a11yText.dojoxGridAscending;
}else{
if(this._currMainSort==="asc"){
_14.innerHTML=this._a11yText.dojoxGridDescending;
}else{
if(this._currMainSort==="desc"){
_14.innerHTML=this._a11yText.dojoxGridUnsortedTip;
}
}
}
},_onHeaderCellMouseOut:function(e){
var p;
for(p in this._sortData){
if(this._sortData[p]&&this._sortData[p].index===0){
_1.removeClass(this._headerNodes[p],"dojoxGridCellShowIndex");
break;
}
}
},_onSortBtnClick:function(e){
var _18=e.cell.index;
if(_1.hasClass(e.target,"dojoxGridSortBtnSingle")){
this._prepareSingleSort(_18);
}else{
if(_1.hasClass(e.target,"dojoxGridSortBtnNested")){
this._prepareNestedSort(_18);
}else{
return;
}
}
_1.stopEvent(e);
this._doSort(_18);
},_doSort:function(_19){
if(!this._sortData[_19]||!this._sortData[_19].order){
this.setSortData(_19,"order","asc");
}else{
if(this.isAsc(_19)){
this.setSortData(_19,"order","desc");
}else{
if(this.isDesc(_19)){
this.removeSortData(_19);
}
}
}
this._updateSortDef();
this.grid.sort();
this._initSort(true);
},setSortData:function(_1a,_1b,_1c){
var sd=this._sortData[_1a];
if(!sd){
sd=this._sortData[_1a]={};
}
sd[_1b]=_1c;
},removeSortData:function(_1d){
var d=this._sortData,i=d[_1d].index,p;
delete d[_1d];
for(p in d){
if(d[p].index>i){
d[p].index--;
}
}
},_prepareSingleSort:function(_1e){
var d=this._sortData,p;
for(p in d){
delete d[p];
}
this.setSortData(_1e,"index",0);
this.setSortData(_1e,"order",this._currMainSort==="none"?null:this._currMainSort);
if(!this._sortData[_1e]||!this._sortData[_1e].order){
this._currMainSort="asc";
}else{
if(this.isAsc(_1e)){
this._currMainSort="desc";
}else{
if(this.isDesc(_1e)){
this._currMainSort="none";
}
}
}
},_prepareNestedSort:function(_1f){
var i=this._sortData[_1f]?this._sortData[_1f].index:null;
if(i===0||!!i){
return;
}
this.setSortData(_1f,"index",this._sortDef.length);
},_updateSortDef:function(){
this._sortDef.length=0;
var d=this._sortData,p;
for(p in d){
this._sortDef[d[p].index]={attribute:this.grid.layout.cells[p].field,descending:d[p].order==="desc"};
}
},_updateHeaderNodeUI:function(_20){
var _21=this._getCellByNode(_20);
var _22=_21.index;
var _23=this._sortData[_22];
var _24=_1.query(".dojoxGridSortNode",_20)[0];
var _25=_1.query(".dojoxGridSortBtnSingle",_20)[0];
var _26=_1.query(".dojoxGridSortBtnNested",_20)[0];
_1.toggleClass(_25,"dojoxGridSortBtnAsc",this._currMainSort==="asc");
_1.toggleClass(_25,"dojoxGridSortBtnDesc",this._currMainSort==="desc");
if(this._currMainSort==="asc"){
_25.title=this.nls.singleSort+" - "+this.nls.descending;
}else{
if(this._currMainSort==="desc"){
_25.title=this.nls.singleSort+" - "+this.nls.unsorted;
}else{
_25.title=this.nls.singleSort+" - "+this.nls.ascending;
}
}
var _27=this;
function _28(){
var _29="Column "+(_21.index+1)+" "+_21.field;
var _2a="none";
var _2b="ascending";
if(_23){
_2a=_23.order==="asc"?"ascending":"descending";
_2b=_23.order==="asc"?"descending":"none";
}
var _2c=_29+" - is sorted by "+_2a;
var _2d=_29+" - is nested sorted by "+_2a;
var _2e=_29+" - choose to sort by "+_2b;
var _2f=_29+" - choose to nested sort by "+_2b;
_25.setAttribute("aria-label",_2c);
_26.setAttribute("aria-label",_2d);
var _30=[_27.connect(_25,"onmouseover",function(){
_25.setAttribute("aria-label",_2e);
}),_27.connect(_25,"onmouseout",function(){
_25.setAttribute("aria-label",_2c);
}),_27.connect(_26,"onmouseover",function(){
_26.setAttribute("aria-label",_2f);
}),_27.connect(_26,"onmouseout",function(){
_26.setAttribute("aria-label",_2d);
})];
_1.forEach(_30,function(_31){
_31._sort=true;
});
};
_28();
var _32=_1.hasClass(_1.body(),"dijit_a11y");
if(!_23){
_26.innerHTML=this._sortDef.length+1;
_26.title=this.nls.nestedSort+" - "+this.nls.ascending;
if(_32){
_24.innerHTML=this._a11yText.dojoxGridUnsortedTip;
}
return;
}
if(_23.index||(_23.index===0&&this._sortDef.length>1)){
_26.innerHTML=_23.index+1;
}
_1.addClass(_24,"dojoxGridSortNodeSorted");
if(this.isAsc(_22)){
_1.addClass(_24,"dojoxGridSortNodeAsc");
_26.title=this.nls.nestedSort+" - "+this.nls.descending;
if(_32){
_24.innerHTML=this._a11yText.dojoxGridAscendingTip;
}
}else{
if(this.isDesc(_22)){
_1.addClass(_24,"dojoxGridSortNodeDesc");
_26.title=this.nls.nestedSort+" - "+this.nls.unsorted;
if(_32){
_24.innerHTML=this._a11yText.dojoxGridDescendingTip;
}
}
}
_1.addClass(_24,(_23.index===0?"dojoxGridSortNodeMain":"dojoxGridSortNodeSub"));
},isAsc:function(_33){
return this._sortData[_33].order==="asc";
},isDesc:function(_34){
return this._sortData[_34].order==="desc";
},_getCellByNode:function(_35){
var i;
for(i=0;i<this._headerNodes.length;i++){
if(this._headerNodes[i]===_35){
return this.grid.layout.cells[i];
}
}
return null;
},clearSort:function(){
this._sortData={};
this._sortDef.length=0;
},initCookieHandler:function(){
if(this.grid.addCookieHandler){
this.grid.addCookieHandler({name:"sortOrder",onLoad:_1.hitch(this,"_loadNestedSortingProps"),onSave:_1.hitch(this,"_saveNestedSortingProps")});
}
},_loadNestedSortingProps:function(_36,_37){
this._setGridSortIndex(_36);
},_saveNestedSortingProps:function(_38){
return this.getSortProps();
},_initFocus:function(){
var f=this.focus=this.grid.focus;
this._focusRegions=this._getRegions();
if(!this._headerArea){
var _39=this._headerArea=f.getArea("header");
_39.onFocus=f.focusHeader=_1.hitch(this,"_focusHeader");
_39.onBlur=f.blurHeader=f._blurHeader=_1.hitch(this,"_blurHeader");
_39.onMove=_1.hitch(this,"_onMove");
_39.onKeyDown=_1.hitch(this,"_onKeyDown");
_39._regions=[];
_39.getRegions=null;
this.connect(this.grid,"onBlur","_blurHeader");
}
},_focusHeader:function(evt){
if(this._currRegionIdx===-1){
this._onMove(0,1,null);
}else{
this._focusRegion(this._getCurrentRegion());
}
try{
_1.stopEvent(evt);
}
catch(e){
}
return true;
},_blurHeader:function(evt){
this._blurRegion(this._getCurrentRegion());
return true;
},_onMove:function(_3a,_3b,evt){
var _3c=this._currRegionIdx||0,_3d=this._focusRegions;
var _3e=_3d[_3c+_3b];
if(!_3e){
return;
}else{
if(_1.style(_3e,"display")==="none"||_1.style(_3e,"visibility")==="hidden"){
this._onMove(_3a,_3b+(_3b>0?1:-1),evt);
return;
}
}
this._focusRegion(_3e);
var _3f=this._getRegionView(_3e);
_3f.scrollboxNode.scrollLeft=_3f.headerNode.scrollLeft;
},_onKeyDown:function(e,_40){
if(_40){
switch(e.keyCode){
case _1.keys.ENTER:
case _1.keys.SPACE:
if(_1.hasClass(e.target,"dojoxGridSortBtnSingle")||_1.hasClass(e.target,"dojoxGridSortBtnNested")){
this._onSortBtnClick(e);
}
}
}
},_getRegionView:function(_41){
var _42=_41;
while(_42&&!_1.hasClass(_42,"dojoxGridHeader")){
_42=_42.parentNode;
}
if(_42){
return _1.filter(this.grid.views.views,function(_43){
return _43.headerNode===_42;
})[0]||null;
}
return null;
},_getRegions:function(){
var _44=[],_45=this.grid.layout.cells;
this._headerNodes.forEach(function(n,i){
if(_1.style(n,"display")==="none"){
return;
}
if(_45[i]["isRowSelector"]){
_44.push(n);
return;
}
_1.query(".dojoxGridSortNode,.dojoxGridSortBtnNested,.dojoxGridSortBtnSingle",n).forEach(function(_46){
_1.attr(_46,"tabindex",0);
_44.push(_46);
});
},this);
return _44;
},_focusRegion:function(_47){
if(!_47){
return;
}
var _48=this._getCurrentRegion();
if(_48&&_47!==_48){
this._blurRegion(_48);
}
var _49=this._getRegionHeader(_47);
_1.addClass(_49,"dojoxGridCellSortFocus");
if(_1.hasClass(_47,"dojoxGridSortNode")){
_1.addClass(_47,"dojoxGridSortNodeFocus");
}else{
if(_1.hasClass(_47,"dojoxGridSortBtn")){
_1.addClass(_47,"dojoxGridSortBtnFocus");
}
}
_47.focus();
this.focus.currentArea("header");
this._currRegionIdx=_1.indexOf(this._focusRegions,_47);
},_blurRegion:function(_4a){
if(!_4a){
return;
}
var _4b=this._getRegionHeader(_4a);
_1.removeClass(_4b,"dojoxGridCellSortFocus");
if(_1.hasClass(_4a,"dojoxGridSortNode")){
_1.removeClass(_4a,"dojoxGridSortNodeFocus");
}else{
if(_1.hasClass(_4a,"dojoxGridSortBtn")){
_1.removeClass(_4a,"dojoxGridSortBtnFocus");
}
}
_4a.blur();
},_getCurrentRegion:function(){
return this._focusRegions?this._focusRegions[this._currRegionIdx]:null;
},_getRegionHeader:function(_4c){
while(_4c&&!_1.hasClass(_4c,"dojoxGridCell")){
_4c=_4c.parentNode;
}
return _4c;
},destroy:function(){
this._sortDef=this._sortData=null;
this._headerNodes=this._focusRegions=null;
this.inherited(arguments);
}});
_3.grid.EnhancedGrid.registerPlugin(_3.grid.enhanced.plugins.NestedSorting);
return _3.grid.enhanced.plugins.NestedSorting;
});
