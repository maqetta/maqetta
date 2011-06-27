/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dojox/grid/enhanced/templates/Pagination.html"]="<div dojoAttachPoint=\"paginatorBar\">\n\t<table cellpadding=\"0\" cellspacing=\"0\"  class=\"dojoxGridPaginator\">\n\t\t<tr>\n\t\t\t<td dojoAttachPoint=\"descriptionTd\" class=\"dojoxGridDescriptionTd\">\n\t\t\t\t<div dojoAttachPoint=\"descriptionDiv\" class=\"dojoxGridDescription\" />\n\t\t\t</td>\n\t\t\t<td dojoAttachPoint=\"sizeSwitchTd\"></td>\n\t\t\t<td dojoAttachPoint=\"pageStepperTd\" class=\"dojoxGridPaginatorFastStep\">\n\t\t\t\t<div dojoAttachPoint=\"pageStepperDiv\" class=\"dojoxGridPaginatorStep\"></div>\n\t\t\t</td>\n\t\t</tr>\n\t</table>\n</div>\n";
define("dojox/grid/enhanced/plugins/Pagination",["dojo","dijit","dojox","dojo/text!../templates/Pagination.html","./Dialog","./_StoreLayer","../_Plugin","dijit/form/Button","dijit/form/NumberTextBox","dijit/focus","dojo/i18n!../nls/Pagination"],function(_1,_2,_3,_4){
_1.declare("dojox.grid.enhanced.plugins.Pagination",_3.grid.enhanced._Plugin,{name:"pagination",_pageSize:25,_defaultRowsPerPage:25,_currentPage:0,_maxSize:0,init:function(){
this.gh=null;
this._defaultRowsPerPage=this.grid.rowsPerPage;
var _5=this.option.defaultPageSize>0?this.option.defaultPageSize:(this.grid.rowsPerPage?this.grid.rowsPerPage:this._pageSize);
this.grid.rowsPerPage=this._pageSize=_5;
this._currentPage=this.option.defaultPage>0?this.option.defaultPage-1:0;
this.grid.usingPagination=true;
this.nls=_1.i18n.getLocalization("dojox.grid.enhanced","Pagination");
this._wrapStoreLayer();
this._createPaginators(this.option);
this._regApis();
},_createPaginators:function(_6){
this.paginators=[];
if(_6.position==="both"){
this.paginators=[new _3.grid.enhanced.plugins._Paginator(_1.mixin(_6,{position:"bottom",plugin:this})),new _3.grid.enhanced.plugins._Paginator(_1.mixin(_6,{position:"top",plugin:this}))];
}else{
this.paginators=[new _3.grid.enhanced.plugins._Paginator(_1.mixin(_6,{plugin:this}))];
}
},_wrapStoreLayer:function(){
var g=this.grid,ns=_3.grid.enhanced.plugins;
this._store=g.store;
this.forcePageStoreLayer=new ns._ForcedPageStoreLayer(this);
ns.wrap(g,"_storeLayerFetch",this.forcePageStoreLayer);
},_stopEvent:function(_7){
try{
_1.stopEvent(_7);
}
catch(e){
}
},_onNew:function(_8,_9){
var _a=Math.ceil(this._maxSize/this._pageSize);
if(((this._currentPage+1===_a||_a===0)&&this.grid.rowCount<this._pageSize)||this.showAll){
_1.hitch(this.grid,this._originalOnNew)(_8,_9);
this.forcePageStoreLayer.endIdx++;
}
this._maxSize++;
if(this.showAll){
this._pageSize++;
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
if(this._maxSize>((this._currentPage+1)*this._pageSize)){
this.gotoPage(this._currentPage+2);
}
},prevPage:function(){
if(this._currentPage>0){
this.gotoPage(this._currentPage);
}
},gotoPage:function(_b){
var _c=Math.ceil(this._maxSize/this._pageSize);
_b--;
if(_b<_c&&_b>=0&&this._currentPage!==_b){
this._currentPage=_b;
this.grid._refresh(true);
this.grid.resize();
}
},gotoFirstPage:function(){
this.gotoPage(1);
},gotoLastPage:function(){
var _d=Math.ceil(this._maxSize/this._pageSize);
this.gotoPage(_d);
},changePageSize:function(_e){
if(typeof _e==="string"){
_e=parseInt(_e,10);
}
var _f=this._pageSize*this._currentPage;
_1.forEach(this.paginators,function(f){
f.currentPageSize=this.grid.rowsPerPage=this._pageSize=_e;
if(_e>=this._maxSize){
this.grid.rowsPerPage=this._defaultRowsPerPage;
this.showAll=true;
this.grid.usingPagination=false;
}else{
this.grid.usingPagination=true;
}
},this);
var _10=_f+Math.min(this._pageSize,this._maxSize);
if(_10>this._maxSize){
this.gotoLastPage();
}else{
var cp=Math.ceil(_f/this._pageSize);
if(cp!==this._currentPage){
this.gotoPage(cp+1);
}else{
this.grid._refresh(true);
}
}
this.grid.resize();
},showGotoPageButton:function(_11){
_1.forEach(this.paginators,function(p){
p._showGotoButton(_11);
});
},scrollToRow:function(_12){
var _13=parseInt(_12/this._pageSize,10),_14=Math.ceil(this._maxSize/this._pageSize);
if(_13>_14){
return;
}
this.gotoPage(_13+1);
var _15=_12%this._pageSize;
this.grid.setScrollTop(this.grid.scroller.findScrollTop(_15)+1);
},getTotalRowCount:function(){
return this._maxSize;
}});
_1.declare("dojox.grid.enhanced.plugins._ForcedPageStoreLayer",_3.grid.enhanced.plugins._StoreLayer,{tags:["presentation"],constructor:function(_16){
this._plugin=_16;
},_fetch:function(_17){
var _18=this,_19=_18._plugin,_1a=_19.grid,_1b=_17.scope||_1.global,_1c=_17.onBegin;
_17.start=_19._currentPage*_19._pageSize+_17.start;
_18.startIdx=_17.start;
_18.endIdx=_17.start+_19._pageSize-1;
if(_1c&&(_19.showAll||_1.every(_19.paginators,function(p){
_19.showAll=!p.sizeSwitch&&!p.pageStepper&&!p.gotoButton;
return _19.showAll;
}))){
_17.onBegin=function(_1d,req){
_19._maxSize=_19._pageSize=_1d;
_18.startIdx=0;
_18.endIdx=_1d-1;
_1.forEach(_19.paginators,function(f){
f.update();
});
req.onBegin=_1c;
req.onBegin.call(_1b,_1d,req);
};
}else{
if(_1c){
_17.onBegin=function(_1e,req){
req.start=0;
req.count=_19._pageSize;
_19._maxSize=_1e;
_18.endIdx=_18.endIdx>=_1e?(_1e-1):_18.endIdx;
if(_18.startIdx>_1e&&_1e!==0){
_1a._pending_requests[req.start]=false;
_19.gotoFirstPage();
}
_1.forEach(_19.paginators,function(f){
f.update();
});
req.onBegin=_1c;
req.onBegin.call(_1b,Math.min(_19._pageSize,(_1e-_18.startIdx)),req);
};
}
}
return _1.hitch(this._store,this._originFetch)(_17);
}});
_1.declare("dojox.grid.enhanced.plugins._Paginator",[_2._Widget,_2._TemplatedMixin],{templateString:_4,position:"bottom",_maxItemSize:0,description:true,pageStepper:true,maxPageStep:7,sizeSwitch:true,pageSizes:["10","25","50","100","All"],gotoButton:false,constructor:function(_1f){
_1.mixin(this,_1f);
this.grid=this.plugin.grid;
this.itemTitle=this.itemTitle?this.itemTitle:this.plugin.nls.itemTitle;
this.descTemplate=this.descTemplate?this.descTemplate:this.plugin.nls.descTemplate;
},postCreate:function(){
this.inherited(arguments);
this._setWidthValue();
var _20=this;
var g=this.grid;
this.plugin.connect(g,"_resize",_1.hitch(this,"_resetGridHeight"));
this._originalResize=_1.hitch(g,"resize");
g.resize=function(_21,_22){
_20._changeSize=g._pendingChangeSize=_21;
_20._resultSize=g._pendingResultSize=_22;
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
this.currentPageSize=this.plugin._pageSize;
this._maxItemSize=this.plugin._maxSize;
this._updateDescription();
this._updatePageStepper();
this._updateSizeSwitch();
this._updateGotoButton();
},_setWidthValue:function(){
var _23=["description","sizeSwitch","pageStepper"];
var _24=function(_25,_26){
var reg=new RegExp(_26+"$");
return reg.test(_25);
};
_1.forEach(_23,function(t){
var _27,_28=this[t];
if(_28===undefined||typeof _28==="boolean"){
return;
}
if(_1.isString(_28)){
_27=_24(_28,"px")||_24(_28,"%")||_24(_28,"em")?_28:parseInt(_28,10)>0?parseInt(_28,10)+"px":null;
}else{
if(typeof _28==="number"&&_28>0){
_27=_28+"px";
}
}
this[t]=_27?true:false;
this[t+"Width"]=_27;
},this);
},_regFocusMgr:function(_29){
this.grid.focus.addArea({name:"pagination"+_29,onFocus:_1.hitch(this,this._onFocusPaginator),onBlur:_1.hitch(this,this._onBlurPaginator),onMove:_1.hitch(this,this._moveFocus),onKeyDown:_1.hitch(this,this._onKeyDown)});
switch(_29){
case "top":
this.grid.focus.placeArea("pagination"+_29,"before","header");
break;
case "bottom":
default:
this.grid.focus.placeArea("pagination"+_29,"after","content");
break;
}
},_placeSelf:function(){
var g=this.grid;
var _2a=_1.trim(this.position.toLowerCase());
switch(_2a){
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
},_resetGridHeight:function(_2b,_2c){
var g=this.grid;
_2b=_2b||this._changeSize;
_2c=_2c||this._resultSize;
delete this._changeSize;
delete this._resultSize;
if(g._autoHeight){
return;
}
var _2d=g._getPadBorder().h;
if(!this.plugin.gh){
this.plugin.gh=_1.contentBox(g.domNode).h+2*_2d;
}
if(_2c){
_2b=_2c;
}
if(_2b){
this.plugin.gh=_1.contentBox(g.domNode).h+2*_2d;
}
var gh=this.plugin.gh,hh=g._getHeaderHeight(),ph=_1.marginBox(this.domNode).h;
ph=this.plugin.paginators[1]?ph*2:ph;
if(typeof g.autoHeight==="number"){
var cgh=gh+ph-_2d;
_1.style(g.domNode,"height",cgh+"px");
_1.style(g.viewsNode,"height",(cgh-ph-hh)+"px");
this._styleMsgNode(hh,_1.marginBox(g.viewsNode).w,cgh-ph-hh);
}else{
var h=gh-ph-hh-_2d;
_1.style(g.viewsNode,"height",h+"px");
var _2e=_1.some(g.views.views,function(v){
return v.hasHScrollbar();
});
_1.forEach(g.viewsNode.childNodes,function(c){
_1.style(c,"height",h+"px");
});
_1.forEach(g.views.views,function(v){
if(v.scrollboxNode){
if(!v.hasHScrollbar()&&_2e){
_1.style(v.scrollboxNode,"height",(h-_3.html.metrics.getScrollbar().h)+"px");
}else{
_1.style(v.scrollboxNode,"height",h+"px");
}
}
});
this._styleMsgNode(hh,_1.marginBox(g.viewsNode).w,h);
}
},_styleMsgNode:function(top,_2f,_30){
var _31=this.grid.messagesNode;
_1.style(_31,{"position":"absolute","top":top+"px","width":_2f+"px","height":_30+"px","z-Index":"100"});
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
if(this.sizeSwitchTd.childNodes.length<1){
this._createSizeSwitchNodes();
}
this._updateSwitchNodeClass();
this._moveToNextActivableNode(this._getAllPageSizeNodes(),this.pageSizeValue);
this.pageSizeValue=null;
},_createSizeSwitchNodes:function(){
var _32=null;
if(!this.pageSizes||this.pageSizes.length<1){
return;
}
_1.forEach(this.pageSizes,function(_33){
var _34=_33.toLowerCase()==="all"?this.plugin.nls.allItemsLabelTemplate:_1.string.substitute(this.plugin.nls.pageSizeLabelTemplate,[_33]);
_32=_1.create("span",{innerHTML:_33,title:_34,value:_33,tabindex:0},this.sizeSwitchTd,"last");
_32.setAttribute("aria-label",_34);
this.plugin.connect(_32,"onclick",_1.hitch(this,"_onSwitchPageSize"));
this.plugin.connect(_32,"onmouseover",function(e){
_1.addClass(e.target,"dojoxGridPageTextHover");
});
this.plugin.connect(_32,"onmouseout",function(e){
_1.removeClass(e.target,"dojoxGridPageTextHover");
});
_32=_1.create("span",{innerHTML:"|"},this.sizeSwitchTd,"last");
_1.addClass(_32,"dojoxGridSeparator");
},this);
_1.destroy(_32);
if(this.sizeSwitchWidth){
_1.style(this.sizeSwitchTd,"width",this.sizeSwitchWidth);
}
},_updateSwitchNodeClass:function(){
var _35=null;
var _36=false;
var _37=function(_38,_39){
if(_39){
_1.addClass(_38,"dojoxGridActivedSwitch");
_1.attr(_38,"tabindex","-1");
_36=true;
}else{
_1.addClass(_38,"dojoxGridInactiveSwitch");
_1.attr(_38,"tabindex","0");
}
};
_1.forEach(this.sizeSwitchTd.childNodes,function(_3a){
if(_3a.value){
_35=_3a.value;
_1.removeClass(_3a);
if(this.plugin._pageSizeValue){
_37(_3a,_35===this.plugin._pageSizeValue&&!_36);
}else{
if(_35.toLowerCase()=="all"){
_35=this._maxItemSize;
}
_37(_3a,this.currentPageSize===parseInt(_35,10)&&!_36);
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
var _3b=this._getStartPage(),_3c=this._getStepPageSize(),_3d="",_3e=null,i=_3b;
for(;i<_3b+this.maxPageStep+1;i++){
_3d=_1.string.substitute(this.plugin.nls.pageStepLabelTemplate,[i]);
_3e=_1.create("div",{innerHTML:i,value:i,title:_3d,tabindex:i<_3b+_3c?0:-1},this.pageStepperDiv,"last");
_3e.setAttribute("aria-label",_3d);
this.plugin.connect(_3e,"onclick",_1.hitch(this,"_onPageStep"));
this.plugin.connect(_3e,"onmouseover",function(e){
_1.addClass(e.target,"dojoxGridPageTextHover");
});
this.plugin.connect(_3e,"onmouseout",function(e){
_1.removeClass(e.target,"dojoxGridPageTextHover");
});
_1.style(_3e,"display",i<_3b+_3c?"block":"none");
}
if(this.pageStepperWidth){
_1.style(this.pageStepperTd,"width",this.pageStepperWidth);
}
},_createWardBtns:function(){
var _3f=this;
var _40={prevPage:"&#60;",firstPage:"&#171;",nextPage:"&#62;",lastPage:"&#187;"};
var _41=function(_42,_43,_44){
var _45=_1.create("div",{value:_42,title:_43,tabindex:1},_3f.pageStepperDiv,_44);
_3f.plugin.connect(_45,"onclick",_1.hitch(_3f,"_onPageStep"));
_45.setAttribute("aria-label",_43);
var _46=_1.create("span",{value:_42,title:_43,innerHTML:_40[_42]},_45,_44);
_1.addClass(_46,"dojoxGridWardButtonInner");
};
_41("prevPage",this.plugin.nls.prevTip,"first");
_41("firstPage",this.plugin.nls.firstTip,"first");
_41("nextPage",this.plugin.nls.nextTip,"last");
_41("lastPage",this.plugin.nls.lastTip,"last");
},_resetPageStepNodes:function(){
var _47=this._getStartPage(),_48=this._getStepPageSize(),_49=this.pageStepperDiv.childNodes,_4a=null,i=_47,j=2,tip;
for(;j<_49.length-2;j++,i++){
_4a=_49[j];
if(i<_47+_48){
tip=_1.string.substitute(this.plugin.nls.pageStepLabelTemplate,[i]);
_1.attr(_4a,{"innerHTML":i,"title":tip,"value":i});
_1.style(_4a,"display","block");
_4a.setAttribute("aria-label",tip);
}else{
_1.style(_4a,"display","none");
}
}
},_updatePageStepNodeClass:function(){
var _4b=null,_4c=this._getCurrentPageNo(),_4d=this._getPageCount();
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
var _56=_55.value=="prevPage"||_55.value=="firstPage"?1:_4d;
_4e(_55,true,(_4c===_56));
}else{
_4b=parseInt(_55.value,10);
_4e(_55,false,(_4b===_4c||_1.style(_55,"display")==="none"));
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
_1.toggleClass(this.gotoPageDiv,"dojoxGridPaginatorGotoDivDisabled",this.plugin._pageSize>=this.plugin._maxSize);
_1.attr(this.gotoPageDiv,"tabindex","-1");
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
if(_5e.target===this.gotoPageDiv){
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
var _6e=[],i=0,len=this.pageStepperDiv.childNodes.length;
for(;i<len;i++){
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
if(n.value===_70){
nl.push(n);
_71=n;
}else{
if(_1.attr(n,"tabindex")==="0"){
nl.push(n);
}
}
});
if(nl.length<2){
this.grid.focus.tab(1);
}
_72=_1.indexOf(nl,_71);
if(_1.attr(_71,"tabindex")!=="0"){
_71=nl[_72+1]?nl[_72+1]:nl[_72-1];
}
_2.focus(_71);
this._currentFocusNode=_71;
},_onSwitchPageSize:function(e){
var _73=this.plugin._pageSizeValue=this.pageSizeValue=e.target.value;
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
