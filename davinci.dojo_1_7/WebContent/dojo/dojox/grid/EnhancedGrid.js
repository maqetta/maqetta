/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/grid/enhanced/plugins/_SelectionPreserver"],function(_1,_2,_3){
_1.getObject("dojox.grid.EnhancedGrid",1);
define(["dojo","dojox","./DataGrid","./enhanced/_PluginManager","dojo/i18n!./enhanced/nls/EnhancedGrid"],function(_4,_5){
_4.experimental("dojox.grid.EnhancedGrid");
_4.declare("dojox.grid.EnhancedGrid",_5.grid.DataGrid,{plugins:null,pluginMgr:null,keepSelection:false,_pluginMgrClass:_5.grid.enhanced._PluginManager,postMixInProperties:function(){
this._nls=_4.i18n.getLocalization("dojox.grid.enhanced","EnhancedGrid",this.lang);
this.inherited(arguments);
},postCreate:function(){
this.pluginMgr=new this._pluginMgrClass(this);
this.pluginMgr.preInit();
this.inherited(arguments);
this.pluginMgr.postInit();
},plugin:function(_6){
return this.pluginMgr.getPlugin(_6);
},startup:function(){
this.inherited(arguments);
this.pluginMgr.startup();
},createSelection:function(){
this.selection=new _5.grid.enhanced.DataSelection(this);
},canSort:function(_7,_8){
return true;
},doKeyEvent:function(e){
try{
var _9=this.focus.focusView;
_9.content.decorateEvent(e);
if(!e.cell){
_9.header.decorateEvent(e);
}
}
catch(e){
}
this.inherited(arguments);
},doApplyCellEdit:function(_a,_b,_c){
if(!_c){
this.invalidated[_b]=true;
return;
}
this.inherited(arguments);
},mixin:function(_d,_e){
var _f={};
for(var p in _e){
if(p=="_inherited"||p=="declaredClass"||p=="constructor"||_e["privates"]&&_e["privates"][p]){
continue;
}
_f[p]=_e[p];
}
_4.mixin(_d,_f);
},_copyAttr:function(idx,_10){
if(!_10){
return;
}
return this.inherited(arguments);
},_getHeaderHeight:function(){
this.inherited(arguments);
return _4.marginBox(this.viewsHeaderNode).h;
},_fetch:function(_11,_12){
if(this.items){
return this.inherited(arguments);
}
_11=_11||0;
if(this.store&&!this._pending_requests[_11]){
if(!this._isLoaded&&!this._isLoading){
this._isLoading=true;
this.showMessage(this.loadingMessage);
}
this._pending_requests[_11]=true;
try{
var req={start:_11,count:this.rowsPerPage,query:this.query,sort:this.getSortProps(),queryOptions:this.queryOptions,isRender:_12,onBegin:_4.hitch(this,"_onFetchBegin"),onComplete:_4.hitch(this,"_onFetchComplete"),onError:_4.hitch(this,"_onFetchError")};
this._storeLayerFetch(req);
}
catch(e){
this._onFetchError(e,{start:_11,count:this.rowsPerPage});
}
}
return 0;
},_storeLayerFetch:function(req){
this.store.fetch(req);
},getCellByField:function(_13){
return _4.filter(this.layout.cells,function(_14){
return _14.field==_13;
})[0];
},onMouseUp:function(e){
},createView:function(){
var _15=this.inherited(arguments);
if(_4.isMoz){
var _16=function(_17,_18){
for(var n=_17;n&&_18(n);n=n.parentNode){
}
return n;
};
var _19=function(_1a){
var _1b=_1a.toUpperCase();
return function(_1c){
return _1c.tagName!=_1b;
};
};
var _1d=_15.header.getCellX;
_15.header.getCellX=function(e){
var x=_1d.call(_15.header,e);
var n=_16(e.target,_19("th"));
if(n&&n!==e.target&&_4.isDescendant(e.target,n)){
x+=n.firstChild.offsetLeft;
}
return x;
};
}
return _15;
},destroy:function(){
delete this._nls;
this.selection.destroy();
this.pluginMgr.destroy();
this.inherited(arguments);
}});
_4.declare("dojox.grid.enhanced.DataSelection",_5.grid.DataSelection,{constructor:function(_1e){
if(_1e.keepSelection){
this.preserver=new _5.grid.enhanced.plugins._SelectionPreserver(this);
}
},_range:function(_1f,_20){
this.grid._selectingRange=true;
this.inherited(arguments);
this.grid._selectingRange=false;
this.onChanged();
},deselectAll:function(_21){
this.grid._selectingRange=true;
this.inherited(arguments);
this.grid._selectingRange=false;
this.onChanged();
},destroy:function(){
if(this.preserver){
this.preserver.destroy();
}
}});
_5.grid.EnhancedGrid.markupFactory=function(_22,_23,_24,_25){
return _5.grid._Grid.markupFactory(_22,_23,_24,_4.partial(_5.grid.DataGrid.cell_markupFactory,_25));
};
_5.grid.EnhancedGrid.registerPlugin=function(_26,_27){
_5.grid.enhanced._PluginManager.registerPlugin(_26,_27);
};
return _5.grid.EnhancedGrid;
});
return _1.getObject("dojox.grid.EnhancedGrid");
});
require(["dojox/grid/EnhancedGrid"]);
