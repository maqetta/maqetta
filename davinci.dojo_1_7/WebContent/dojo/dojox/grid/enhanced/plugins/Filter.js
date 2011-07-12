/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/Filter",["dojo","dojox","../_Plugin","./Dialog","./filter/FilterLayer","./filter/FilterBar","./filter/FilterDefDialog","./filter/FilterStatusTip","./filter/ClearFilterConfirm","dojo/i18n!../nls/Filter"],function(_1,_2){
var ns=_1.getObject("grid.enhanced.plugins",true,_2),_3=_1.getObject("grid.enhanced.plugins.filter",true,_2);
_1.declare("dojox.grid.enhanced.plugins.Filter",_2.grid.enhanced._Plugin,{name:"filter",constructor:function(_4,_5){
this.grid=_4;
this.nls=_1.i18n.getLocalization("dojox.grid.enhanced","Filter");
_5=this.args=_1.isObject(_5)?_5:{};
if(typeof _5.ruleCount!="number"||_5.ruleCount<0){
_5.ruleCount=3;
}
this._wrapStore();
var _6={"plugin":this};
this.clearFilterDialog=new _2.grid.enhanced.plugins.Dialog({refNode:this.grid.domNode,title:this.nls["clearFilterDialogTitle"],content:new _3.ClearFilterConfirm(_6)});
this.filterDefDialog=new _3.FilterDefDialog(_6);
this.filterBar=new _3.FilterBar(_6);
this.filterStatusTip=new _3.FilterStatusTip(_6);
_4.onFilterDefined=function(){
};
this.connect(_4.layer("filter"),"onFilterDefined",function(_7){
_4.onFilterDefined(_4.getFilter(),_4.getFilterRelation());
});
},destroy:function(){
this.inherited(arguments);
try{
this.grid.unwrap("filter");
this.filterBar.destroyRecursive();
this.filterBar=null;
this.clearFilterDialog.destroyRecursive();
this.clearFilterDialog=null;
this.filterStatusTip.destroy();
this.filterStatusTip=null;
this.filterDefDialog.destroy();
this.filterDefDialog=null;
this.grid=null;
this.nls=null;
this.args=null;
}
catch(e){
console.warn("Filter.destroy() error:",e);
}
},_wrapStore:function(){
var g=this.grid;
var _8=this.args;
var _9=_8.isServerSide?new _3.ServerSideFilterLayer(_8):new _3.ClientSideFilterLayer({cacheSize:_8.filterCacheSize,fetchAll:_8.fetchAllOnFirstFilter,getter:this._clientFilterGetter});
ns.wrap(g,"_storeLayerFetch",_9);
this.connect(g,"_onDelete",_1.hitch(_9,"invalidate"));
},onSetStore:function(_a){
this.filterDefDialog.clearFilter(true);
},_clientFilterGetter:function(_b,_c,_d){
return _c.get(_d,_b);
}});
_2.grid.EnhancedGrid.registerPlugin(_2.grid.enhanced.plugins.Filter);
return _2.grid.enhanced.plugins.Filter;
});
