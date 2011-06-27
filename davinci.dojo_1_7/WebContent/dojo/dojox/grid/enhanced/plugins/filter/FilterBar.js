/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/filter/FilterBar",["dojo","dijit","dojox","dojo/fx","dojo/string","dijit/form/Button","dijit/_WidgetsInTemplateMixin","dijit/focus"],function(_1,_2,_3){
var _4="dojoxGridFBarHover",_5="dojoxGridFBarFiltered",_6=function(_7){
try{
if(_7&&_7.preventDefault){
_1.stopEvent(_7);
}
}
catch(e){
}
};
_1.declare("dojox.grid.enhanced.plugins.filter.FilterBar",[_2._Widget,_2._TemplatedMixin,_2._WidgetsInTemplateMixin],{templateString:_1.cache("dojox.grid","enhanced/templates/FilterBar.html"),widgetsInTemplate:true,_timeout_statusTooltip:300,_handle_statusTooltip:null,_curColIdx:-1,plugin:null,postMixInProperties:function(){
var _8=this.plugin;
var _9=_8.nls;
this._filterBarDefBtnLabel=_9["filterBarDefButton"];
this._filterBarClearBtnLabel=_9["filterBarClearButton"];
this._closeFilterBarBtnLabel=_9["closeFilterBarBtn"];
var _a=_8.args.itemsName||_9["defaultItemsName"];
this._noFilterMsg=_1.string.substitute(_9["filterBarMsgNoFilterTemplate"],["",_a]);
var t=this.plugin.args.statusTipTimeout;
if(typeof t=="number"){
this._timeout_statusTooltip=t;
}
var g=_8.grid;
g.showFilterBar=_1.hitch(this,"showFilterBar");
g.toggleFilterBar=_1.hitch(this,"toggleFilterBar");
g.isFilterBarShown=_1.hitch(this,"isFilterBarShown");
},postCreate:function(){
this.inherited(arguments);
if(!this.plugin.args.closeFilterbarButton){
_1.style(this.closeFilterBarButton.domNode,"display","none");
}
var _b=this,g=this.plugin.grid,_c=this.oldGetHeaderHeight=_1.hitch(g,g._getHeaderHeight);
this.placeAt(g.viewsHeaderNode,"after");
this.connect(this.plugin.filterDefDialog,"showDialog","_onShowFilterDefDialog");
this.connect(this.plugin.filterDefDialog,"closeDialog","_onCloseFilterDefDialog");
this.connect(g.layer("filter"),"onFiltered",this._onFiltered);
this.defineFilterButton.domNode.title=this.plugin.nls["filterBarDefButton"];
if(_1.hasClass(_1.body(),"dijit_a11y")){
this.defineFilterButton.set("label",this.plugin.nls["a11yFilterBarDefButton"]);
}
this.connect(this.defineFilterButton.domNode,"click",_6);
this.connect(this.clearFilterButton.domNode,"click",_6);
this.connect(this.closeFilterBarButton.domNode,"click",_6);
this.toggleClearFilterBtn(true);
this._initAriaInfo();
g._getHeaderHeight=function(){
return _c()+_1.marginBox(_b.domNode).h;
};
g.focus.addArea({name:"filterbar",onFocus:_1.hitch(this,this._onFocusFilterBar,false),onBlur:_1.hitch(this,this._onBlurFilterBar)});
g.focus.placeArea("filterbar","after","header");
},uninitialize:function(){
var g=this.plugin.grid;
g._getHeaderHeight=this.oldGetHeaderHeight;
g.focus.removeArea("filterbar");
this.plugin=null;
},isFilterBarShown:function(){
return _1.style(this.domNode,"display")!="none";
},showFilterBar:function(_d,_e,_f){
var g=this.plugin.grid;
if(_e){
if(Boolean(_d)==this.isFilterBarShown()){
return;
}
_f=_f||{};
var _10=[],_11=500;
_10.push(_1.fx[_d?"wipeIn":"wipeOut"](_1.mixin({"node":this.domNode,"duration":_11},_f)));
var _12=g.views.views[0].domNode.offsetHeight;
var _13={"duration":_11,"properties":{"height":{"end":_1.hitch(this,function(){
var _14=this.domNode.scrollHeight;
if(_1.isFF){
_14-=2;
}
return _d?(_12-_14):(_12+_14);
})}}};
_1.forEach(g.views.views,function(_15){
_10.push(_1.animateProperty(_1.mixin({"node":_15.domNode},_13,_f)),_1.animateProperty(_1.mixin({"node":_15.scrollboxNode},_13,_f)));
});
_10.push(_1.animateProperty(_1.mixin({"node":g.viewsNode},_13,_f)));
_1.fx.combine(_10).play();
}else{
_1.style(this.domNode,"display",_d?"":"none");
g.update();
}
},toggleFilterBar:function(_16,_17){
this.showFilterBar(!this.isFilterBarShown(),_16,_17);
},getColumnIdx:function(_18){
var _19=_1.query("[role='columnheader']",this.plugin.grid.viewsHeaderNode);
var idx=-1;
for(var i=_19.length-1;i>=0;--i){
var _1a=_1.coords(_19[i]);
if(_18>=_1a.x&&_18<_1a.x+_1a.w){
idx=i;
break;
}
}
if(idx>=0&&this.plugin.grid.layout.cells[idx].filterable!==false){
return idx;
}else{
return -1;
}
},toggleClearFilterBtn:function(_1b){
_1.style(this.clearFilterButton.domNode,"display",_1b?"none":"");
},_closeFilterBar:function(e){
_6(e);
var _1c=this.plugin.filterDefDialog.getCriteria();
if(_1c){
var _1d=_1.connect(this.plugin.filterDefDialog,"clearFilter",this,function(){
this.showFilterBar(false,true);
_1.disconnect(_1d);
});
this._clearFilterDefDialog(e);
}else{
this.showFilterBar(false,true);
}
},_showFilterDefDialog:function(e){
_6(e);
this.plugin.filterDefDialog.showDialog(this._curColIdx);
this.plugin.grid.focus.focusArea("filterbar");
},_clearFilterDefDialog:function(e){
_6(e);
this.plugin.filterDefDialog.onClearFilter();
this.plugin.grid.focus.focusArea("filterbar");
},_onEnterButton:function(e){
this._onBlurFilterBar();
_6(e);
},_onMoveButton:function(e){
this._onBlurFilterBar();
},_onLeaveButton:function(e){
this._leavingBtn=true;
},_onShowFilterDefDialog:function(_1e){
if(typeof _1e=="number"){
this._curColIdx=_1e;
}
this._defPaneIsShown=true;
},_onCloseFilterDefDialog:function(){
this._defPaneIsShown=false;
this._curColIdx=-1;
_2.focus(this.defineFilterButton.domNode);
},_onClickFilterBar:function(e){
_6(e);
this._clearStatusTipTimeout();
this.plugin.grid.focus.focusArea("filterbar");
this.plugin.filterDefDialog.showDialog(this.getColumnIdx(e.clientX));
},_onMouseEnter:function(e){
this._onFocusFilterBar(true,null);
this._updateTipPosition(e);
this._setStatusTipTimeout();
},_onMouseMove:function(e){
if(this._leavingBtn){
this._onFocusFilterBar(true,null);
this._leavingBtn=false;
}
if(this._isFocused){
this._setStatusTipTimeout();
this._highlightHeader(this.getColumnIdx(e.clientX));
if(this._handle_statusTooltip){
this._updateTipPosition(e);
}
}
},_onMouseLeave:function(e){
this._onBlurFilterBar();
},_updateTipPosition:function(evt){
this._tippos={x:evt.pageX,y:evt.pageY};
},_onFocusFilterBar:function(_1f,evt,_20){
if(!this.isFilterBarShown()){
return false;
}
this._isFocused=true;
_1.addClass(this.domNode,_4);
if(!_1f){
var _21=_1.style(this.clearFilterButton.domNode,"display")!=="none";
var _22=_1.style(this.closeFilterBarButton.domNode,"display")!=="none";
if(typeof this._focusPos=="undefined"){
if(_20>0){
this._focusPos=0;
}else{
if(_22){
this._focusPos=1;
}else{
this._focusPos=0;
}
if(_21){
++this._focusPos;
}
}
}
if(this._focusPos===0){
_2.focus(this.defineFilterButton.focusNode);
}else{
if(this._focusPos===1&&_21){
_2.focus(this.clearFilterButton.focusNode);
}else{
_2.focus(this.closeFilterBarButton.focusNode);
}
}
}
_6(evt);
return true;
},_onBlurFilterBar:function(evt,_23){
if(this._isFocused){
this._isFocused=false;
_1.removeClass(this.domNode,_4);
this._clearStatusTipTimeout();
this._clearHeaderHighlight();
}
var _24=true;
if(_23){
var _25=3;
if(_1.style(this.closeFilterBarButton.domNode,"display")==="none"){
--_25;
}
if(_1.style(this.clearFilterButton.domNode,"display")==="none"){
--_25;
}
if(_25==1){
delete this._focusPos;
}else{
var _26=this._focusPos;
for(var _27=_26+_23;_27<0;_27+=_25){
}
_27%=_25;
if((_23>0&&_27<_26)||(_23<0&&_27>_26)){
delete this._focusPos;
}else{
this._focusPos=_27;
_24=false;
}
}
}
return _24;
},_onFiltered:function(_28,_29){
var p=this.plugin,_2a=p.args.itemsName||p.nls["defaultItemsName"],msg="",g=p.grid,_2b=g.layer("filter");
if(_2b.filterDef()){
msg=_1.string.substitute(p.nls["filterBarMsgHasFilterTemplate"],[_28,_29,_2a]);
_1.addClass(this.domNode,_5);
}else{
msg=_1.string.substitute(p.nls["filterBarMsgNoFilterTemplate"],[_29,_2a]);
_1.removeClass(this.domNode,_5);
}
this.statusBarNode.innerHTML=msg;
this._focusPos=0;
},_initAriaInfo:function(){
this.defineFilterButton.domNode.setAttribute("aria-label",this.plugin.nls["waiFilterBarDefButton"]);
this.clearFilterButton.domNode.setAttribute("aria-label",this.plugin.nls["waiFilterBarClearButton"]);
},_isInColumn:function(_2c,_2d,_2e){
var _2f=_1.coords(_2d);
return _2c>=_2f.x&&_2c<_2f.x+_2f.w;
},_setStatusTipTimeout:function(){
this._clearStatusTipTimeout();
if(!this._defPaneIsShown){
this._handle_statusTooltip=setTimeout(_1.hitch(this,this._showStatusTooltip),this._timeout_statusTooltip);
}
},_clearStatusTipTimeout:function(){
clearTimeout(this._handle_statusTooltip);
this._handle_statusTooltip=null;
},_showStatusTooltip:function(){
this._handle_statusTooltip=null;
this.plugin.filterStatusTip.showDialog(this._tippos.x,this._tippos.y,this.getColumnIdx(this._tippos.x));
},_highlightHeader:function(_30){
if(_30!=this._previousHeaderIdx){
var g=this.plugin.grid,_31=g.getCell(this._previousHeaderIdx);
if(_31){
_1.removeClass(_31.getHeaderNode(),"dojoxGridCellOver");
}
_31=g.getCell(_30);
if(_31){
_1.addClass(_31.getHeaderNode(),"dojoxGridCellOver");
}
this._previousHeaderIdx=_30;
}
},_clearHeaderHighlight:function(){
if(typeof this._previousHeaderIdx!="undefined"){
var g=this.plugin.grid,_32=g.getCell(this._previousHeaderIdx);
if(_32){
g.onHeaderCellMouseOut({cellNode:_32.getHeaderNode()});
}
delete this._previousHeaderIdx;
}
}});
return _3.grid.enhanced.plugins.filter.FilterBar;
});
