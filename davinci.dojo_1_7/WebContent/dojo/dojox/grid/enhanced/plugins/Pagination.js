/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

require.cache["dojox/grid/enhanced/templates/Pagination.html"]="<div dojoAttachPoint=\"paginatorBar\">\n\t<table cellpadding=\"0\" cellspacing=\"0\"  class=\"dojoxGridPaginator\">\n\t\t<tr>\n\t\t\t<td dojoAttachPoint=\"descriptionTd\" class=\"dojoxGridDescriptionTd\">\n\t\t\t\t<div dojoAttachPoint=\"descriptionDiv\" class=\"dojoxGridDescription\" />\n\t\t\t</td>\n\t\t\t<td dojoAttachPoint=\"sizeSwitchTd\"></td>\n\t\t\t<td dojoAttachPoint=\"pageStepperTd\" class=\"dojoxGridPaginatorFastStep\">\n\t\t\t\t<div dojoAttachPoint=\"pageStepperDiv\" class=\"dojoxGridPaginatorStep\"></div>\n\t\t\t</td>\n\t\t</tr>\n\t</table>\n</div>\n";
define(["dojo","dijit","dojox","dojo/text!../templates/Pagination.html","./Dialog","./_StoreLayer","../_Plugin","dijit/form/Button","dijit/form/NumberTextBox","dijit/focus","dojo/i18n!../nls/Pagination"],function(_1,_2,_3,_4){
_1.declare("dojox.grid.enhanced.plugins.Pagination",_3.grid.enhanced._Plugin,{name:"pagination",pageSize:25,_defaultRowsPerPage:25,_currentPage:0,_maxSize:0,init:function(){
this.gh=null;
this.grid.rowsPerPage=this.pageSize=this.grid.rowsPerPage?this.grid.rowsPerPage:this.pageSize;
this.grid.usingPagination=true;
this.nls=_1.i18n.getLocalization("dojox.grid.enhanced","Pagination");
this._wrapStoreLayer();
this._createPaginators(this.option);
this._regApis();
},_createPaginators:function(_5){
this.paginators=[];
if(_5.position==="both"){
this.paginators=[new _3.grid.enhanced.plugins._Paginator(_1.mixin(_5,{position:"bottom",plugin:this})),new _3.grid.enhanced.plugins._Paginator(_1.mixin(_5,{position:"top",plugin:this}))];
}else{
this.paginators=[new _3.grid.enhanced.plugins._Paginator(_1.mixin(_5,{plugin:this}))];
}
},_wrapStoreLayer:function(){
var g=this.grid,ns=_3.grid.enhanced.plugins;
this._store=g.store;
this.forcePageStoreLayer=new ns._ForcedPageStoreLayer(this);
ns.wrap(g,"_storeLayerFetch",this.forcePageStoreLayer);
},_stopEvent:function(_6){
try{
_1.stopEvent(_6);
}
catch(e){
}
},_onNew:function(_7,_8){
var _9=Math.ceil(this._maxSize/this.pageSize);
if(((this._currentPage+1===_9||_9===0)&&this.grid.rowCount<this.pageSize)||this.showAll){
_1.hitch(this.grid,this._originalOnNew)(_7,_8);
this.forcePageStoreLayer.endIdx++;
}
this._maxSize++;
if(this.showAll){
this.pageSize++;
}
if(this.showAll&&this.grid.autoHeight){
this.grid._refresh();
}else{
_1.forEach(this.paginators,function(p){
p.update();
});
}
},_removeSelectedRows:function(){
this._multiRemoving=true;
this._originalRemove();
this._multiRemoving=false;
this.grid.resize();
this.grid._refresh();
},_onDelete:function(){
if(!this._multiRemoving){
this.grid.resize();
if(this.showAll){
this.grid._refresh();
}
}
if(this.grid.get("rowCount")===0){
this.prevPage();
}
},_regApis:function(){
var g=this.grid;
g.gotoPage=_1.hitch(this,this.gotoPage);
g.nextPage=_1.hitch(this,this.nextPage);
g.prevPage=_1.hitch(this,this.prevPage);
g.gotoFirstPage=_1.hitch(this,this.gotoFirstPage);
g.gotoLastPage=_1.hitch(this,this.gotoLastPage);
g.changePageSize=_1.hitch(this,this.changePageSize);
g.showGotoPageButton=_1.hitch(this,this.showGotoPageButton);
g.getTotalRowCount=_1.hitch(this,this.getTotalRowCount);
this.originalScrollToRow=_1.hitch(g,g.scrollToRow);
g.scrollToRow=_1.hitch(this,this.scrollToRow);
this._originalOnNew=_1.hitch(g,g._onNew);
this._originalRemove=_1.hitch(g,g.removeSelectedRows);
g.removeSelectedRows=_1.hitch(this,this._removeSelectedRows);
g._onNew=_1.hitch(this,this._onNew);
this.connect(g,"_onDelete",_1.hitch(this,this._onDelete));
},destroy:function(){
this.inherited(arguments);
var g=this.grid;
try{
_1.forEach(this.paginators,function(p){
p.destroy();
});
g.unwrap(this.forcePageStoreLayer.name());
g._onNew=this._originalOnNew;
g.removeSelectedRows=this._originalRemove;
g.scrollToRow=this.originalScrollToRow;
this.paginators=null;
this.nls=null;
}
catch(e){
console.warn("Pagination.destroy() error: ",e);
}
},nextPage:function(){
if(this._maxSize>((this._currentPage+1)*this.pageSize)){
this.gotoPage(this._currentPage+2);
}
},prevPage:function(){
if(this._currentPage>0){
this.gotoPage(this._currentPage);
}
},gotoPage:function(_a){
var _b=Math.ceil(this._maxSize/this.pageSize);
_a--;
if(_a<_b&&_a>=0&&this._currentPage!==_a){
this._currentPage=_a;
this.grid._refresh(true);
this.grid.resize();
}
},gotoFirstPage:function(){
this.gotoPage(1);
},gotoLastPage:function(){
var _c=Math.ceil(this._maxSize/this.pageSize);
this.gotoPage(_c);
},changePageSize:function(_d){
if(typeof _d=="string"){
_d=parseInt(_d,10);
}
var _e=this.pageSize*this._currentPage;
_1.forEach(this.paginators,function(f){
f.currentPageSize=this.grid.rowsPerPage=this.pageSize=_d;
if(_d>=this._maxSize){
this.grid.rowsPerPage=this._defaultRowsPerPage;
this.showAll=true;
this.grid.usingPagination=false;
}else{
this.grid.usingPagination=true;
}
},this);
var _f=_e+Math.min(this.pageSize,this._maxSize);
if(_f>this._maxSize){
this.gotoLastPage();
}else{
var cp=Math.ceil(_e/this.pageSize);
if(cp!==this._currentPage){
this.gotoPage(cp+1);
}else{
this.grid._refresh(true);
}
}
this.grid.resize();
},showGotoPageButton:function(_10){
_1.forEach(this.paginators,function(p){
p._showGotoButton(_10);
});
},scrollToRow:function(_11){
var _12=parseInt(_11/this.pageSize,10),_13=Math.ceil(this._maxSize/this.pageSize);
if(_12>_13){
return;
}
this.gotoPage(_12+1);
var _14=_11%this.pageSize;
this.grid.setScrollTop(this.grid.scroller.findScrollTop(_14)+1);
},getTotalRowCount:function(){
return this._maxSize;
}});
_1.declare("dojox.grid.enhanced.plugins._ForcedPageStoreLayer",_3.grid.enhanced.plugins._StoreLayer,{tags:["presentation"],constructor:function(_15){
this._plugin=_15;
},_fetch:function(_16){
var _17=this,_18=_17._plugin,_19=_18.grid,_1a=_16.scope||_1.global,_1b=_16.onBegin;
_16.start=_18._currentPage*_18.pageSize+_16.start;
_17.startIdx=_16.start;
_17.endIdx=_16.start+_18.pageSize-1;
if(_1b&&(_18.showAll||_1.every(_18.paginators,function(p){
return _18.showAll=!p.sizeSwitch&&!p.pageStepper&&!p.gotoButton;
}))){
_16.onBegin=function(_1c,req){
_18._maxSize=_18.pageSize=_1c;
_17.startIdx=0;
_17.endIdx=_1c-1;
_1.forEach(_18.paginators,function(f){
f.update();
});
req.onBegin=_1b;
req.onBegin.call(_1a,_1c,req);
};
}else{
if(_1b){
_16.onBegin=function(_1d,req){
req.start=0;
req.count=_18.pageSize;
_18._maxSize=_1d;
_17.endIdx=_17.endIdx>=_1d?(_1d-1):_17.endIdx;
if(_17.startIdx>_1d&&_1d!==0){
_19._pending_requests[req.start]=false;
_18.gotoFirstPage();
}
_1.forEach(_18.paginators,function(f){
f.update();
});
req.onBegin=_1b;
req.onBegin.call(_1a,Math.min(_18.pageSize,(_1d-_17.startIdx)),req);
};
}
}
return _1.hitch(this._store,this._originFetch)(_16);
}});
_1.declare("dojox.grid.enhanced.plugins._Paginator",[_2._Widget,_2._TemplatedMixin],{templateString:_4,position:"bottom",_maxItemSize:0,description:true,pageStepper:true,maxPageStep:7,sizeSwitch:true,pageSizes:["10","25","50","100","All"],gotoButton:false,constructor:function(_1e){
_1.mixin(this,_1e);
this.grid=this.plugin.grid;
this.itemTitle=this.itemTitle?this.itemTitle:this.plugin.nls.itemTitle;
this.descTemplate=this.descTemplate?this.descTemplate:this.plugin.nls.descTemplate;
},postCreate:function(){
this.inherited(arguments);
this._setWidthValue();
var _1f=this;
var g=this.grid;
this.plugin.connect(g,"_resize",_1.hitch(this,"_resetGridHeight"));
this._originalResize=_1.hitch(g,"resize");
g.resize=function(_20,_21){
_1f._changeSize=g._pendingChangeSize=_20;
_1f._resultSize=g._pendingResultSize=_21;
g.sizeChange();
};
this._placeSelf();
},destroy:function(){
this.inherited(arguments);
this.grid.focus.removeArea("pagination"+this.position.toLowerCase());
if(this._gotoPageDialog){
this._gotoPageDialog.destroy();
_1.destroy(this.gotoPageTd);
delete this.gotoPageTd;
delete this._gotoPageDialog;
}
this.grid.resize=this._originalResize;
this.pageSizes=null;
},update:function(){
this.currentPageSize=this.plugin.pageSize;
this._maxItemSize=this.plugin._maxSize;
this._updateDescription();
this._updatePageStepper();
this._updateSizeSwitch();
this._updateGotoButton();
},_setWidthValue:function(){
var _22=["description","sizeSwitch","pageStepper"];
var _23=function(_24,_25){
var reg=new RegExp(_25+"$");
return reg.test(_24);
};
_1.forEach(_22,function(t){
var _26,_27=this[t];
if(_27===undefined||typeof _27=="boolean"){
return;
}
if(_1.isString(_27)){
_26=_23(_27,"px")||_23(_27,"%")||_23(_27,"em")?_27:parseInt(_27,10)>0?parseInt(_27,10)+"px":null;
}else{
if(typeof _27==="number"&&_27>0){
_26=_27+"px";
}
}
this[t]=_26?true:false;
this[t+"Width"]=_26;
},this);
},_regFocusMgr:function(_28){
this.grid.focus.addArea({name:"pagination"+_28,onFocus:_1.hitch(this,this._onFocusPaginator),onBlur:_1.hitch(this,this._onBlurPaginator),onMove:_1.hitch(this,this._moveFocus),onKeyDown:_1.hitch(this,this._onKeyDown)});
switch(_28){
case "top":
this.grid.focus.placeArea("pagination"+_28,"before","header");
break;
case "bottom":
default:
this.grid.focus.placeArea("pagination"+_28,"after","content");
break;
}
},_placeSelf:function(){
var g=this.grid;
var _29=_1.trim(this.position.toLowerCase());
switch(_29){
case "top":
this.placeAt(g.viewsHeaderNode,"before");
this._regFocusMgr("top");
break;
case "bottom":
default:
this.placeAt(g.viewsNode,"after");
this._regFocusMgr("bottom");
break;
}
},_resetGridHeight:function(_2a,_2b){
var g=this.grid;
_2a=_2a||this._changeSize;
_2b=_2b||this._resultSize;
delete this._changeSize;
delete this._resultSize;
if(g._autoHeight){
return;
}
var _2c=g._getPadBorder().h;
if(!this.plugin.gh){
this.plugin.gh=_1.contentBox(g.domNode).h+2*_2c;
}
if(_2b){
_2a=_2b;
}
if(_2a){
this.plugin.gh=_1.contentBox(g.domNode).h+2*_2c;
}
var gh=this.plugin.gh,hh=g._getHeaderHeight(),ph=_1.marginBox(this.domNode).h;
ph=this.plugin.paginators[1]?ph*2:ph;
if(typeof g.autoHeight=="number"){
var cgh=gh+ph-_2c;
_1.style(g.domNode,"height",cgh+"px");
_1.style(g.viewsNode,"height",(cgh-ph-hh)+"px");
this._styleMsgNode(hh,_1.marginBox(g.viewsNode).w,cgh-ph-hh);
}else{
var h=gh-ph-hh-_2c;
_1.style(g.viewsNode,"height",h+"px");
var _2d=_1.some(g.views.views,function(v){
return v.hasHScrollbar();
});
_1.forEach(g.viewsNode.childNodes,function(c,idx){
_1.style(c,"height",h+"px");
});
_1.forEach(g.views.views,function(v,idx){
if(v.scrollboxNode){
if(!v.hasHScrollbar()&&_2d){
_1.style(v.scrollboxNode,"height",(h-_3.html.metrics.getScrollbar().h)+"px");
}else{
_1.style(v.scrollboxNode,"height",h+"px");
}
}
});
this._styleMsgNode(hh,_1.marginBox(g.viewsNode).w,h);
}
},_styleMsgNode:function(top,_2e,_2f){
var _30=this.grid.messagesNode;
_1.style(_30,{"position":"absolute","top":top+"px","width":_2e+"px","height":_2f+"px","z-Index":"100"});
},_updateDescription:function(){
var s=this.plugin.forcePageStoreLayer;
if(this.description&&this.descriptionDiv){
this.descriptionDiv.innerHTML=this._maxItemSize>0?_1.string.substitute(this.descTemplate,[this.itemTitle,this._maxItemSize,s.startIdx+1,s.endIdx+1]):"0 "+this.itemTitle;
}
if(this.descriptionWidth){
_1.style(this.descriptionTd,"width",this.descriptionWidth);
}
},_updateSizeSwitch:function(){
if(!this.sizeSwitchTd){
return;
}
if(!this.sizeSwitch||this._maxItemSize<=0){
_1.style(this.sizeSwitchTd,"display","none");
return;
}else{
_1.style(this.sizeSwitchTd,"display","");
}
if(this.initializedSizeNode&&!this.pageSizeValue){
return;
}
if(this.sizeSwitchTd.childNodes.length<1){
this._createSizeSwitchNodes();
}
this._updateSwitchNodeClass();
this._moveToNextActivableNode(this._getAllPageSizeNodes(),this.pageSizeValue);
this.pageSizeValue=null;
},_createSizeSwitchNodes:function(){
var _31=null;
if(!this.pageSizes||this.pageSizes.length<1){
return;
}
_1.forEach(this.pageSizes,function(_32){
_32=_1.trim(_32);
var _33=_32.toLowerCase()=="all"?this.plugin.nls.allItemsLabelTemplate:_1.string.substitute(this.plugin.nls.pageSizeLabelTemplate,[_32]);
_31=_1.create("span",{innerHTML:_32,title:_33,value:_32,tabindex:0},this.sizeSwitchTd,"last");
_31.setAttribute("aria-label",_33);
this.plugin.connect(_31,"onclick",_1.hitch(this,"_onSwitchPageSize"));
this.plugin.connect(_31,"onmouseover",function(e){
_1.addClass(e.target,"dojoxGridPageTextHover");
});
this.plugin.connect(_31,"onmouseout",function(e){
_1.removeClass(e.target,"dojoxGridPageTextHover");
});
_31=_1.create("span",{innerHTML:"|"},this.sizeSwitchTd,"last");
_1.addClass(_31,"dojoxGridSeparator");
},this);
_1.destroy(_31);
this.initializedSizeNode=true;
if(this.sizeSwitchWidth){
_1.style(this.sizeSwitchTd,"width",this.sizeSwitchWidth);
}
},_updateSwitchNodeClass:function(){
var _34=null;
var _35=false;
var _36=function(_37,_38){
if(_38){
_1.addClass(_37,"dojoxGridActivedSwitch");
_1.attr(_37,"tabindex","-1");
_35=true;
}else{
_1.addClass(_37,"dojoxGridInactiveSwitch");
_1.attr(_37,"tabindex","0");
}
};
_1.forEach(this.sizeSwitchTd.childNodes,function(_39){
if(_39.value){
_34=_39.value;
_1.removeClass(_39);
if(this.pageSizeValue){
_36(_39,_34===this.pageSizeValue&&!_35);
}else{
if(_34.toLowerCase()=="all"){
_34=this._maxItemSize;
}
_36(_39,this.currentPageSize===parseInt(_34,10)&&!_35);
}
}
},this);
},_updatePageStepper:function(){
if(!this.pageStepperTd){
return;
}
if(!this.pageStepper||this._maxItemSize<=0){
_1.style(this.pageStepperTd,"display","none");
return;
}else{
_1.style(this.pageStepperTd,"display","");
}
if(this.pageStepperDiv.childNodes.length<1){
this._createPageStepNodes();
this._createWardBtns();
}else{
this._resetPageStepNodes();
}
this._updatePageStepNodeClass();
this._moveToNextActivableNode(this._getAllPageStepNodes(),this.pageStepValue);
this.pageStepValue=null;
},_createPageStepNodes:function(){
var _3a=this._getStartPage(),_3b=this._getStepPageSize(),_3c="",_3d=null;
for(var i=_3a;i<this.maxPageStep+1;i++){
_3c=_1.string.substitute(this.plugin.nls.pageStepLabelTemplate,[i]);
_3d=_1.create("div",{innerHTML:i,value:i,title:_3c,tabindex:i<_3a+_3b?0:-1},this.pageStepperDiv,"last");
_3d.setAttribute("aria-label",_3c);
this.plugin.connect(_3d,"onclick",_1.hitch(this,"_onPageStep"));
this.plugin.connect(_3d,"onmouseover",function(e){
_1.addClass(e.target,"dojoxGridPageTextHover");
});
this.plugin.connect(_3d,"onmouseout",function(e){
_1.removeClass(e.target,"dojoxGridPageTextHover");
});
_1.style(_3d,"display",i<_3a+_3b?"block":"none");
}
if(this.pageStepperWidth){
_1.style(this.pageStepperTd,"width",this.pageStepperWidth);
}
},_createWardBtns:function(){
var _3e=this;
var _3f={prevPage:"&#60;",firstPage:"&#171;",nextPage:"&#62;",lastPage:"&#187;"};
var _40=function(_41,_42,_43){
var _44=_1.create("div",{value:_41,title:_42,tabindex:1},_3e.pageStepperDiv,_43);
_3e.plugin.connect(_44,"onclick",_1.hitch(_3e,"_onPageStep"));
_44.setAttribute("aria-label",_42);
var _45=_1.create("span",{value:_41,title:_42,innerHTML:_3f[_41]},_44,_43);
_1.addClass(_45,"dojoxGridWardButtonInner");
};
_40("prevPage",this.plugin.nls.prevTip,"first");
_40("firstPage",this.plugin.nls.firstTip,"first");
_40("nextPage",this.plugin.nls.nextTip,"last");
_40("lastPage",this.plugin.nls.lastTip,"last");
},_resetPageStepNodes:function(){
var _46=this._getStartPage(),_47=this._getStepPageSize(),_48=this.pageStepperDiv.childNodes,_49=null,i=_46,j=2,tip;
for(;j<_48.length-2;j++,i++){
_49=_48[j];
if(i<_46+_47){
tip=_1.string.substitute(this.plugin.nls.pageStepLabelTemplate,[i]);
_1.attr(_49,{"innerHTML":i,"title":tip,"value":i});
_1.style(_49,"display","block");
_49.setAttribute("aria-label",tip);
}else{
_1.style(_49,"display","none");
}
}
},_updatePageStepNodeClass:function(){
var _4a=null,_4b=this._getCurrentPageNo(),_4c=this._getPageCount(),_4d=0;
var _4e=function(_4f,_50,_51){
var _52=_4f.value,_53=_50?"dojoxGrid"+_52+"Btn":"dojoxGridInactived",_54=_50?"dojoxGrid"+_52+"BtnDisable":"dojoxGridActived";
if(_51){
_1.addClass(_4f,_54);
_1.attr(_4f,"tabindex","-1");
}else{
_1.addClass(_4f,_53);
_1.attr(_4f,"tabindex","0");
}
};
_1.forEach(this.pageStepperDiv.childNodes,function(_55){
_1.removeClass(_55);
if(isNaN(parseInt(_55.value,10))){
_1.addClass(_55,"dojoxGridWardButton");
var _56=_55.value=="prevPage"||_55.value=="firstPage"?1:_4c;
_4e(_55,true,(_4b==_56));
}else{
_4a=parseInt(_55.value,10);
_4e(_55,false,(_4a===_4b||_1.style(_55,"display")==="none"));
}
},this);
},_showGotoButton:function(_57){
this.gotoButton=_57;
this._updateGotoButton();
},_updateGotoButton:function(){
if(!this.gotoButton){
if(this.gotoPageTd){
if(this._gotoPageDialog){
this._gotoPageDialog.destroy();
}
_1.destroy(this.gotoPageDiv);
_1.destroy(this.gotoPageTd);
delete this.gotoPageDiv;
delete this.gotoPageTd;
}
return;
}
if(!this.gotoPageTd){
this._createGotoNode();
}
_1.toggleClass(this.gotoPageDiv,"dojoxGridPaginatorGotoDivDisabled",this.plugin.pageSize>=this.plugin._maxSize);
},_createGotoNode:function(){
this.gotoPageTd=_1.create("td",{},_1.query("tr",this.domNode)[0],"last");
_1.addClass(this.gotoPageTd,"dojoxGridPaginatorGotoTd");
this.gotoPageDiv=_1.create("div",{tabindex:"0",title:this.plugin.nls.gotoButtonTitle},this.gotoPageTd,"first");
_1.addClass(this.gotoPageDiv,"dojoxGridPaginatorGotoDiv");
this.plugin.connect(this.gotoPageDiv,"onclick",_1.hitch(this,"_openGotopageDialog"));
var _58=_1.create("span",{title:this.plugin.nls.gotoButtonTitle,innerHTML:"&#8869;"},this.gotoPageDiv,"last");
_1.addClass(_58,"dojoxGridWardButtonInner");
},_openGotopageDialog:function(_59){
if(this._getPageCount()<=1){
return;
}
if(!this._gotoPageDialog){
this._gotoPageDialog=new _3.grid.enhanced.plugins.pagination._GotoPageDialog(this.plugin);
}
if(!this._currentFocusNode){
this.grid.focus.focusArea("pagination"+this.position,_59);
}else{
this._currentFocusNode=this.gotoPageDiv;
}
if(this.focusArea!="pageStep"){
this.focusArea="pageStep";
}
this._gotoPageDialog.updatePageCount();
this._gotoPageDialog.showDialog();
},_onFocusPaginator:function(_5a,_5b){
if(!this._currentFocusNode){
if(_5b>0){
return this._onFocusPageSizeNode(_5a)?true:this._onFocusPageStepNode(_5a);
}else{
if(_5b<0){
return this._onFocusPageStepNode(_5a)?true:this._onFocusPageSizeNode(_5a);
}else{
return false;
}
}
}else{
if(_5b>0){
return this.focusArea==="pageSize"?this._onFocusPageStepNode(_5a):false;
}else{
if(_5b<0){
return this.focusArea==="pageStep"?this._onFocusPageSizeNode(_5a):false;
}else{
return false;
}
}
}
},_onFocusPageSizeNode:function(_5c){
var _5d=this._getPageSizeActivableNodes();
if(_5c&&_5c.type!=="click"){
if(_5d[0]){
_2.focus(_5d[0]);
this._currentFocusNode=_5d[0];
this.focusArea="pageSize";
this.plugin._stopEvent(_5c);
return true;
}else{
return false;
}
}
if(_5c&&_5c.type=="click"){
if(_1.indexOf(this._getPageSizeActivableNodes(),_5c.target)>-1){
this.focusArea="pageSize";
this.plugin._stopEvent(_5c);
return true;
}
}
return false;
},_onFocusPageStepNode:function(_5e){
var _5f=this._getPageStepActivableNodes();
if(_5e&&_5e.type!=="click"){
if(_5f[0]){
_2.focus(_5f[0]);
this._currentFocusNode=_5f[0];
this.focusArea="pageStep";
this.plugin._stopEvent(_5e);
return true;
}else{
if(this.gotoPageDiv){
_2.focus(this.gotoPageDiv);
this._currentFocusNode=this.gotoPageDiv;
this.focusArea="pageStep";
this.plugin._stopEvent(_5e);
return true;
}else{
return false;
}
}
}
if(_5e&&_5e.type=="click"){
if(_1.indexOf(this._getPageStepActivableNodes(),_5e.target)>-1){
this.focusArea="pageStep";
this.plugin._stopEvent(_5e);
return true;
}else{
if(_5e.target==this.gotoPageDiv){
_2.focus(this.gotoPageDiv);
this._currentFocusNode=this.gotoPageDiv;
this.focusArea="pageStep";
this.plugin._stopEvent(_5e);
return true;
}
}
}
return false;
},_onFocusGotoPageNode:function(_60){
if(!this.gotoButton||!this.gotoPageTd){
return false;
}
if(_60&&_60.type!=="click"||(_60.type=="click"&&_60.target==this.gotoPageDiv)){
_2.focus(this.gotoPageDiv);
this._currentFocusNode=this.gotoPageDiv;
this.focusArea="gotoButton";
this.plugin._stopEvent(_60);
return true;
}
return true;
},_onBlurPaginator:function(_61,_62){
var _63=this._getPageSizeActivableNodes(),_64=this._getPageStepActivableNodes();
if(_62>0&&this.focusArea==="pageSize"&&(_64.length>1||this.gotoButton)){
return false;
}else{
if(_62<0&&this.focusArea==="pageStep"&&_63.length>1){
return false;
}
}
this._currentFocusNode=null;
this.focusArea=null;
return true;
},_onKeyDown:function(_65,_66){
if(_66){
return;
}
if(_65.altKey||_65.metaKey){
return;
}
var dk=_1.keys;
if(_65.keyCode===dk.ENTER||_65.keyCode===dk.SPACE){
if(_1.indexOf(this._getPageStepActivableNodes(),this._currentFocusNode)>-1){
this._onPageStep(_65);
}else{
if(_1.indexOf(this._getPageSizeActivableNodes(),this._currentFocusNode)>-1){
this._onSwitchPageSize(_65);
}else{
if(this._currentFocusNode===this.gotoPageDiv){
this._openGotopageDialog(_65);
}
}
}
}
this.plugin._stopEvent(_65);
},_moveFocus:function(_67,_68,evt){
var _69;
if(this.focusArea=="pageSize"){
_69=this._getPageSizeActivableNodes();
}else{
if(this.focusArea=="pageStep"){
_69=this._getPageStepActivableNodes();
if(this.gotoPageDiv){
_69.push(this.gotoPageDiv);
}
}
}
if(_69.length<1){
return;
}
var _6a=_1.indexOf(_69,this._currentFocusNode);
var _6b=_6a+_68;
if(_6b>=0&&_6b<_69.length){
_2.focus(_69[_6b]);
this._currentFocusNode=_69[_6b];
}
this.plugin._stopEvent(evt);
},_getPageSizeActivableNodes:function(){
return _1.query("span[tabindex='0']",this.sizeSwitchTd);
},_getPageStepActivableNodes:function(){
return (_1.query("div[tabindex='0']",this.pageStepperDiv));
},_getAllPageSizeNodes:function(){
var _6c=[];
_1.forEach(this.sizeSwitchTd.childNodes,function(_6d){
if(_6d.value){
_6c.push(_6d);
}
});
return _6c;
},_getAllPageStepNodes:function(){
var _6e=[];
for(var i=0,len=this.pageStepperDiv.childNodes.length;i<len;i++){
_6e.push(this.pageStepperDiv.childNodes[i]);
}
return _6e;
},_moveToNextActivableNode:function(_6f,_70){
if(!_70){
return;
}
if(_6f.length<2){
this.grid.focus.tab(1);
}
var nl=[],_71=null,_72=0;
_1.forEach(_6f,function(n){
if(n.value==_70){
nl.push(n);
_71=n;
}else{
if(_1.attr(n,"tabindex")=="0"){
nl.push(n);
}
}
});
if(nl.length<2){
this.grid.focus.tab(1);
}
_72=_1.indexOf(nl,_71);
if(_1.attr(_71,"tabindex")!="0"){
_71=nl[_72+1]?nl[_72+1]:nl[_72-1];
}
_2.focus(_71);
this._currentFocusNode=_71;
},_onSwitchPageSize:function(e){
var _73=this.pageSizeValue=e.target.value;
if(!_73){
return;
}
if(_1.trim(_73.toLowerCase())=="all"){
_73=this._maxItemSize;
this.plugin.showAll=true;
}else{
this.plugin.showAll=false;
}
this.plugin.grid.usingPagination=!this.plugin.showAll;
_73=parseInt(_73,10);
if(isNaN(_73)||_73<=0){
return;
}
if(!this._currentFocusNode){
this.grid.focus.currentArea("pagination"+this.position);
}
if(this.focusArea!="pageSize"){
this.focusArea="pageSize";
}
this.plugin.changePageSize(_73);
},_onPageStep:function(e){
var p=this.plugin,_74=this.pageStepValue=e.target.value;
if(!this._currentFocusNode){
this.grid.focus.currentArea("pagination"+this.position);
}
if(this.focusArea!="pageStep"){
this.focusArea="pageStep";
}
if(!isNaN(parseInt(_74,10))){
p.gotoPage(_74);
}else{
switch(e.target.value){
case "prevPage":
p.prevPage();
break;
case "nextPage":
p.nextPage();
break;
case "firstPage":
p.gotoFirstPage();
break;
case "lastPage":
p.gotoLastPage();
}
}
},_getCurrentPageNo:function(){
return this.plugin._currentPage+1;
},_getPageCount:function(){
if(!this._maxItemSize||!this.currentPageSize){
return 0;
}
return Math.ceil(this._maxItemSize/this.currentPageSize);
},_getStartPage:function(){
var cp=this._getCurrentPageNo();
var ms=parseInt(this.maxPageStep/2,10);
var pc=this._getPageCount();
if(cp<ms||(cp-ms)<1){
return 1;
}else{
if(pc<=this.maxPageStep){
return 1;
}else{
if(pc-cp<ms&&cp-this.maxPageStep>=0){
return pc-this.maxPageStep+1;
}else{
return (cp-ms);
}
}
}
},_getStepPageSize:function(){
var sp=this._getStartPage();
var _75=this._getPageCount();
if((sp+this.maxPageStep)>_75){
return _75-sp+1;
}else{
return this.maxPageStep;
}
}});
_1.declare("dojox.grid.enhanced.plugins.pagination._GotoPageDialog",null,{pageCount:0,constructor:function(_76){
this.plugin=_76;
this.pageCount=this.plugin.paginators[0]._getPageCount();
this._dialogNode=_1.create("div",{},_1.body(),"last");
this._gotoPageDialog=new _3.grid.enhanced.plugins.Dialog({"refNode":_76.grid.domNode,"title":this.plugin.nls.dialogTitle},this._dialogNode);
this._createDialogContent();
this._gotoPageDialog.startup();
},_createDialogContent:function(){
this._specifyNode=_1.create("div",{innerHTML:this.plugin.nls.dialogIndication},this._gotoPageDialog.containerNode,"last");
this._pageInputDiv=_1.create("div",{},this._gotoPageDialog.containerNode,"last");
this._pageTextBox=new _2.form.NumberTextBox();
this._pageTextBox.constraints={fractional:false,min:1,max:this.pageCount};
this.plugin.connect(this._pageTextBox.textbox,"onkeyup",_1.hitch(this,"_setConfirmBtnState"));
this._pageInputDiv.appendChild(this._pageTextBox.domNode);
this._pageLabel=_1.create("label",{innerHTML:_1.string.substitute(this.plugin.nls.pageCountIndication,[this.pageCount])},this._pageInputDiv,"last");
this._buttonDiv=_1.create("div",{},this._gotoPageDialog.containerNode,"last");
this._confirmBtn=new _2.form.Button({label:this.plugin.nls.dialogConfirm,onClick:_1.hitch(this,this._onConfirm)});
this._confirmBtn.set("disabled",true);
this._cancelBtn=new _2.form.Button({label:this.plugin.nls.dialogCancel,onClick:_1.hitch(this,this._onCancel)});
this._buttonDiv.appendChild(this._confirmBtn.domNode);
this._buttonDiv.appendChild(this._cancelBtn.domNode);
this._styleContent();
this._gotoPageDialog.onCancel=_1.hitch(this,this._onCancel);
this.plugin.connect(this._gotoPageDialog,"_onKey",_1.hitch(this,"_onKeyDown"));
},_styleContent:function(){
_1.addClass(this._specifyNode,"dojoxGridDialogMargin");
_1.addClass(this._pageInputDiv,"dojoxGridDialogMargin");
_1.addClass(this._buttonDiv,"dojoxGridDialogButton");
_1.style(this._pageTextBox.domNode,"width","50px");
},updatePageCount:function(){
this.pageCount=this.plugin.paginators[0]._getPageCount();
this._pageTextBox.constraints={fractional:false,min:1,max:this.pageCount};
_1.attr(this._pageLabel,"innerHTML",_1.string.substitute(this.plugin.nls.pageCountIndication,[this.pageCount]));
},showDialog:function(){
this._gotoPageDialog.show();
},_onConfirm:function(_77){
if(this._pageTextBox.isValid()&&this._pageTextBox.getDisplayedValue()!==""){
this.plugin.gotoPage(this._pageTextBox.parse(this._pageTextBox.getDisplayedValue()));
this._gotoPageDialog.hide();
this._pageTextBox.reset();
}
this.plugin._stopEvent(_77);
},_onCancel:function(_78){
this._pageTextBox.reset();
this._gotoPageDialog.hide();
this.plugin._stopEvent(_78);
},_onKeyDown:function(_79){
if(_79.altKey||_79.metaKey){
return;
}
var dk=_1.keys;
if(_79.keyCode===dk.ENTER){
this._onConfirm(_79);
}
},_setConfirmBtnState:function(){
if(this._pageTextBox.isValid()&&this._pageTextBox.getDisplayedValue()!==""){
this._confirmBtn.set("disabled",false);
}else{
this._confirmBtn.set("disabled",true);
}
},destroy:function(){
this._pageTextBox.destroy();
this._confirmBtn.destroy();
this._cancelBtn.destroy();
this._gotoPageDialog.destroy();
_1.destroy(this._specifyNode);
_1.destroy(this._pageInputDiv);
_1.destroy(this._pageLabel);
_1.destroy(this._buttonDiv);
_1.destroy(this._dialogNode);
}});
_3.grid.EnhancedGrid.registerPlugin(_3.grid.enhanced.plugins.Pagination);
return _3.grid.enhanced.plugins.Pagination;
});
