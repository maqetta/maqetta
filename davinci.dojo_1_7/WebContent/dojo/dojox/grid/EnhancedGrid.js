/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/EnhancedGrid",["dojo","dojox","./DataGrid","./enhanced/_PluginManager","./enhanced/plugins/_SelectionPreserver","dojo/i18n!./enhanced/nls/EnhancedGrid"],function(_1,_2){
_1.experimental("dojox.grid.EnhancedGrid");
_1.declare("dojox.grid.EnhancedGrid",_2.grid.DataGrid,{plugins:null,pluginMgr:null,_pluginMgrClass:_2.grid.enhanced._PluginManager,postMixInProperties:function(){
this._nls=_1.i18n.getLocalization("dojox.grid.enhanced","EnhancedGrid",this.lang);
this.inherited(arguments);
},postCreate:function(){
this.pluginMgr=new this._pluginMgrClass(this);
this.pluginMgr.preInit();
this.inherited(arguments);
this.pluginMgr.postInit();
},plugin:function(_3){
return this.pluginMgr.getPlugin(_3);
},startup:function(){
this.inherited(arguments);
this.pluginMgr.startup();
},createSelection:function(){
this.selection=new _2.grid.enhanced.DataSelection(this);
},canSort:function(_4,_5){
return true;
},doKeyEvent:function(e){
try{
var _6=this.focus.focusView;
_6.content.decorateEvent(e);
if(!e.cell){
_6.header.decorateEvent(e);
}
}
catch(e){
}
this.inherited(arguments);
},doApplyCellEdit:function(_7,_8,_9){
if(!_9){
this.invalidated[_8]=true;
return;
}
this.inherited(arguments);
},mixin:function(_a,_b){
var _c={};
for(var p in _b){
if(p=="_inherited"||p=="declaredClass"||p=="constructor"||_b["privates"]&&_b["privates"][p]){
continue;
}
_c[p]=_b[p];
}
_1.mixin(_a,_c);
},_copyAttr:function(_d,_e){
if(!_e){
return;
}
return this.inherited(arguments);
},_getHeaderHeight:function(){
this.inherited(arguments);
return _1.marginBox(this.viewsHeaderNode).h;
},_fetch:function(_f,_10){
if(this.items){
return this.inherited(arguments);
}
_f=_f||0;
if(this.store&&!this._pending_requests[_f]){
if(!this._isLoaded&&!this._isLoading){
this._isLoading=true;
this.showMessage(this.loadingMessage);
}
this._pending_requests[_f]=true;
try{
var req={start:_f,count:this.rowsPerPage,query:this.query,sort:this.getSortProps(),queryOptions:this.queryOptions,isRender:_10,onBegin:_1.hitch(this,"_onFetchBegin"),onComplete:_1.hitch(this,"_onFetchComplete"),onError:_1.hitch(this,"_onFetchError")};
this._storeLayerFetch(req);
}
catch(e){
this._onFetchError(e,{start:_f,count:this.rowsPerPage});
}
}
return 0;
},_storeLayerFetch:function(req){
this.store.fetch(req);
},getCellByField:function(_11){
return _1.filter(this.layout.cells,function(_12){
return _12.field==_11;
})[0];
},onMouseUp:function(e){
},createView:function(){
var _13=this.inherited(arguments);
if(_1.isMoz){
var _14=function(_15,_16){
for(var n=_15;n&&_16(n);n=n.parentNode){
}
return n;
};
var _17=function(_18){
var _19=_18.toUpperCase();
return function(_1a){
return _1a.tagName!=_19;
};
};
var _1b=_13.header.getCellX;
_13.header.getCellX=function(e){
var x=_1b.call(_13.header,e);
var n=_14(e.target,_17("th"));
if(n&&n!==e.target&&_1.isDescendant(e.target,n)){
x+=n.firstChild.offsetLeft;
}
return x;
};
}
return _13;
},destroy:function(){
delete this._nls;
this.pluginMgr.destroy();
this.inherited(arguments);
}});
_1.declare("dojox.grid.enhanced.DataSelection",_2.grid.DataSelection,{constructor:function(_1c){
if(_1c.keepSelection){
if(this.preserver){
this.preserver.destroy();
}
this.preserver=new _2.grid.enhanced.plugins._SelectionPreserver(this);
}
},_range:function(_1d,_1e){
this.grid._selectingRange=true;
this.inherited(arguments);
this.grid._selectingRange=false;
this.onChanged();
},deselectAll:function(_1f){
this.grid._selectingRange=true;
this.inherited(arguments);
this.grid._selectingRange=false;
this.onChanged();
}});
_2.grid.EnhancedGrid.markupFactory=function(_20,_21,_22,_23){
return _2.grid._Grid.markupFactory(_20,_21,_22,_1.partial(_2.grid.DataGrid.cell_markupFactory,_23));
};
_2.grid.EnhancedGrid.registerPlugin=function(_24,_25){
_2.grid.enhanced._PluginManager.registerPlugin(_24,_25);
};
return _2.grid.EnhancedGrid;
});
