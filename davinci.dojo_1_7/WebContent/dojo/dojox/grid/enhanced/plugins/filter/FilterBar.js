//>>built
define("dojox/grid/enhanced/plugins/filter/FilterBar",["dojo/_base/declare","dojo/_base/array","dojo/_base/connect","dojo/_base/lang","dojo/_base/sniff","dojo/_base/event","dojo/_base/html","dojo/_base/window","dojo/cache","dojo/query","dijit/_Widget","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin","dojo/fx","dojo/string","dijit/focus"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,fx,_e,_f){
var _10="dojoxGridFBarHover",_11="dojoxGridFBarFiltered",_12=function(evt){
try{
if(evt&&evt.preventDefault){
_6.stop(evt);
}
}
catch(e){
}
};
return _1("dojox.grid.enhanced.plugins.filter.FilterBar",[_b,_c,_d],{templateString:_9("dojox.grid","enhanced/templates/FilterBar.html"),widgetsInTemplate:true,_timeout_statusTooltip:300,_handle_statusTooltip:null,_curColIdx:-1,plugin:null,postMixInProperties:function(){
var _13=this.plugin;
var nls=_13.nls;
this._filterBarDefBtnLabel=nls["filterBarDefButton"];
this._filterBarClearBtnLabel=nls["filterBarClearButton"];
this._closeFilterBarBtnLabel=nls["closeFilterBarBtn"];
var _14=_13.args.itemsName||nls["defaultItemsName"];
this._noFilterMsg=_e.substitute(nls["filterBarMsgNoFilterTemplate"],["",_14]);
var t=this.plugin.args.statusTipTimeout;
if(typeof t=="number"){
this._timeout_statusTooltip=t;
}
var g=_13.grid;
g.showFilterBar=_4.hitch(this,"showFilterBar");
g.toggleFilterBar=_4.hitch(this,"toggleFilterBar");
g.isFilterBarShown=_4.hitch(this,"isFilterBarShown");
},postCreate:function(){
this.inherited(arguments);
if(!this.plugin.args.closeFilterbarButton){
_7.style(this.closeFilterBarButton.domNode,"display","none");
}
var _15=this,g=this.plugin.grid,_16=this.oldGetHeaderHeight=_4.hitch(g,g._getHeaderHeight);
this.placeAt(g.viewsHeaderNode,"after");
this.connect(this.plugin.filterDefDialog,"showDialog","_onShowFilterDefDialog");
this.connect(this.plugin.filterDefDialog,"closeDialog","_onCloseFilterDefDialog");
this.connect(g.layer("filter"),"onFiltered",this._onFiltered);
this.defineFilterButton.domNode.title=this.plugin.nls["filterBarDefButton"];
if(_7.hasClass(_8.body(),"dijit_a11y")){
this.defineFilterButton.set("label",this.plugin.nls["a11yFilterBarDefButton"]);
}
this.connect(this.defineFilterButton.domNode,"click",_12);
this.connect(this.clearFilterButton.domNode,"click",_12);
this.connect(this.closeFilterBarButton.domNode,"click",_12);
this.toggleClearFilterBtn(true);
this._initAriaInfo();
g._getHeaderHeight=function(){
return _16()+_7.marginBox(_15.domNode).h;
};
g.focus.addArea({name:"filterbar",onFocus:_4.hitch(this,this._onFocusFilterBar,false),onBlur:_4.hitch(this,this._onBlurFilterBar)});
g.focus.placeArea("filterbar","after","header");
},uninitialize:function(){
var g=this.plugin.grid;
g._getHeaderHeight=this.oldGetHeaderHeight;
g.focus.removeArea("filterbar");
this.plugin=null;
},isFilterBarShown:function(){
return _7.style(this.domNode,"display")!="none";
},showFilterBar:function(_17,_18,_19){
var g=this.plugin.grid;
if(_18){
if(Boolean(_17)==this.isFilterBarShown()){
return;
}
_19=_19||{};
var _1a=[],_1b=500;
_1a.push(fx[_17?"wipeIn":"wipeOut"](_4.mixin({"node":this.domNode,"duration":_1b},_19)));
var _1c=g.views.views[0].domNode.offsetHeight;
var _1d={"duration":_1b,"properties":{"height":{"end":_4.hitch(this,function(){
var _1e=this.domNode.scrollHeight;
if(_5("ff")){
_1e-=2;
}
return _17?(_1c-_1e):(_1c+_1e);
})}}};
_2.forEach(g.views.views,function(_1f){
_1a.push(fx.animateProperty(_4.mixin({"node":_1f.domNode},_1d,_19)),fx.animateProperty(_4.mixin({"node":_1f.scrollboxNode},_1d,_19)));
});
_1a.push(fx.animateProperty(_4.mixin({"node":g.viewsNode},_1d,_19)));
fx.combine(_1a).play();
}else{
_7.style(this.domNode,"display",_17?"":"none");
g.update();
}
},toggleFilterBar:function(_20,_21){
this.showFilterBar(!this.isFilterBarShown(),_20,_21);
},getColumnIdx:function(_22){
var _23=_a("[role='columnheader']",this.plugin.grid.viewsHeaderNode);
var idx=-1;
for(var i=_23.length-1;i>=0;--i){
var _24=_7.position(_23[i]);
if(_22>=_24.x&&_22<_24.x+_24.w){
idx=i;
break;
}
}
if(idx>=0&&this.plugin.grid.layout.cells[idx].filterable!==false){
return idx;
}else{
return -1;
}
},toggleClearFilterBtn:function(_25){
_7.style(this.clearFilterButton.domNode,"display",_25?"none":"");
},_closeFilterBar:function(e){
_12(e);
var _26=this.plugin.filterDefDialog.getCriteria();
if(_26){
var _27=_3.connect(this.plugin.filterDefDialog,"clearFilter",this,function(){
this.showFilterBar(false,true);
_3.disconnect(_27);
});
this._clearFilterDefDialog(e);
}else{
this.showFilterBar(false,true);
}
},_showFilterDefDialog:function(e){
_12(e);
this.plugin.filterDefDialog.showDialog(this._curColIdx);
this.plugin.grid.focus.focusArea("filterbar");
},_clearFilterDefDialog:function(e){
_12(e);
this.plugin.filterDefDialog.onClearFilter();
this.plugin.grid.focus.focusArea("filterbar");
},_onEnterButton:function(e){
this._onBlurFilterBar();
_12(e);
},_onMoveButton:function(e){
this._onBlurFilterBar();
},_onLeaveButton:function(e){
this._leavingBtn=true;
},_onShowFilterDefDialog:function(_28){
if(typeof _28=="number"){
this._curColIdx=_28;
}
this._defPaneIsShown=true;
},_onCloseFilterDefDialog:function(){
this._defPaneIsShown=false;
this._curColIdx=-1;
_f.focus(this.defineFilterButton.domNode);
},_onClickFilterBar:function(e){
_12(e);
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
},_onFocusFilterBar:function(_29,evt,_2a){
if(!this.isFilterBarShown()){
return false;
}
this._isFocused=true;
_7.addClass(this.domNode,_10);
if(!_29){
var _2b=_7.style(this.clearFilterButton.domNode,"display")!=="none";
var _2c=_7.style(this.closeFilterBarButton.domNode,"display")!=="none";
if(typeof this._focusPos=="undefined"){
if(_2a>0){
this._focusPos=0;
}else{
if(_2c){
this._focusPos=1;
}else{
this._focusPos=0;
}
if(_2b){
++this._focusPos;
}
}
}
if(this._focusPos===0){
_f.focus(this.defineFilterButton.focusNode);
}else{
if(this._focusPos===1&&_2b){
_f.focus(this.clearFilterButton.focusNode);
}else{
_f.focus(this.closeFilterBarButton.focusNode);
}
}
}
_12(evt);
return true;
},_onBlurFilterBar:function(evt,_2d){
if(this._isFocused){
this._isFocused=false;
_7.removeClass(this.domNode,_10);
this._clearStatusTipTimeout();
this._clearHeaderHighlight();
}
var _2e=true;
if(_2d){
var _2f=3;
if(_7.style(this.closeFilterBarButton.domNode,"display")==="none"){
--_2f;
}
if(_7.style(this.clearFilterButton.domNode,"display")==="none"){
--_2f;
}
if(_2f==1){
delete this._focusPos;
}else{
var _30=this._focusPos;
for(var _31=_30+_2d;_31<0;_31+=_2f){
}
_31%=_2f;
if((_2d>0&&_31<_30)||(_2d<0&&_31>_30)){
delete this._focusPos;
}else{
this._focusPos=_31;
_2e=false;
}
}
}
return _2e;
},_onFiltered:function(_32,_33){
var p=this.plugin,_34=p.args.itemsName||p.nls["defaultItemsName"],msg="",g=p.grid,_35=g.layer("filter");
if(_35.filterDef()){
msg=_e.substitute(p.nls["filterBarMsgHasFilterTemplate"],[_32,_33,_34]);
_7.addClass(this.domNode,_11);
}else{
msg=_e.substitute(p.nls["filterBarMsgNoFilterTemplate"],[_33,_34]);
_7.removeClass(this.domNode,_11);
}
this.statusBarNode.innerHTML=msg;
this._focusPos=0;
},_initAriaInfo:function(){
this.defineFilterButton.domNode.setAttribute("aria-label",this.plugin.nls["waiFilterBarDefButton"]);
this.clearFilterButton.domNode.setAttribute("aria-label",this.plugin.nls["waiFilterBarClearButton"]);
},_isInColumn:function(_36,_37,_38){
var _39=_7.position(_37);
return _36>=_39.x&&_36<_39.x+_39.w;
},_setStatusTipTimeout:function(){
this._clearStatusTipTimeout();
if(!this._defPaneIsShown){
this._handle_statusTooltip=setTimeout(_4.hitch(this,this._showStatusTooltip),this._timeout_statusTooltip);
}
},_clearStatusTipTimeout:function(){
clearTimeout(this._handle_statusTooltip);
this._handle_statusTooltip=null;
},_showStatusTooltip:function(){
this._handle_statusTooltip=null;
this.plugin.filterStatusTip.showDialog(this._tippos.x,this._tippos.y,this.getColumnIdx(this._tippos.x));
},_highlightHeader:function(_3a){
if(_3a!=this._previousHeaderIdx){
var g=this.plugin.grid,_3b=g.getCell(this._previousHeaderIdx);
if(_3b){
_7.removeClass(_3b.getHeaderNode(),"dojoxGridCellOver");
}
_3b=g.getCell(_3a);
if(_3b){
_7.addClass(_3b.getHeaderNode(),"dojoxGridCellOver");
}
this._previousHeaderIdx=_3a;
}
},_clearHeaderHighlight:function(){
if(typeof this._previousHeaderIdx!="undefined"){
var g=this.plugin.grid,_3c=g.getCell(this._previousHeaderIdx);
if(_3c){
g.onHeaderCellMouseOut({cellNode:_3c.getHeaderNode()});
}
delete this._previousHeaderIdx;
}
}});
});
