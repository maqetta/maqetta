/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/Menu",["dojo","dijit","dojox","../_Plugin"],function(_1,_2,_3){
_1.declare("dojox.grid.enhanced.plugins.Menu",_3.grid.enhanced._Plugin,{name:"menus",types:["headerMenu","rowMenu","cellMenu","selectedRegionMenu"],constructor:function(){
var g=this.grid;
g.showMenu=_1.hitch(g,this.showMenu);
g._setRowMenuAttr=_1.hitch(this,"_setRowMenuAttr");
g._setCellMenuAttr=_1.hitch(this,"_setCellMenuAttr");
g._setSelectedRegionMenuAttr=_1.hitch(this,"_setSelectedRegionMenuAttr");
},onStartUp:function(){
var _4,_5=this.option;
for(_4 in _5){
if(_1.indexOf(this.types,_4)>=0&&_5[_4]){
this._initMenu(_4,_5[_4]);
}
}
},_initMenu:function(_6,_7){
var g=this.grid;
if(!g[_6]){
var m=this._getMenuWidget(_7);
if(!m){
return;
}
g.set(_6,m);
if(_6!="headerMenu"){
m._scheduleOpen=function(){
return;
};
}
}
},_getMenuWidget:function(_8){
return (_8 instanceof _2.Menu)?_8:_2.byId(_8);
},_setRowMenuAttr:function(_9){
this._setMenuAttr(_9,"rowMenu");
},_setCellMenuAttr:function(_a){
this._setMenuAttr(_a,"cellMenu");
},_setSelectedRegionMenuAttr:function(_b){
this._setMenuAttr(_b,"selectedRegionMenu");
},_setMenuAttr:function(_c,_d){
var g=this.grid,n=g.domNode;
if(!_c||!(_c instanceof _2.Menu)){
console.warn(_d," of Grid ",g.id," is not existed!");
return;
}
if(g[_d]){
g[_d].unBindDomNode(n);
}
g[_d]=_c;
g[_d].bindDomNode(n);
},showMenu:function(e){
var _e=(e.cellNode&&_1.hasClass(e.cellNode,"dojoxGridRowSelected")||e.rowNode&&(_1.hasClass(e.rowNode,"dojoxGridRowSelected")||_1.hasClass(e.rowNode,"dojoxGridRowbarSelected")));
if(_e&&this.selectedRegionMenu){
this.onSelectedRegionContextMenu(e);
return;
}
var _f={target:e.target,coords:e.keyCode!==_1.keys.F10&&"pageX" in e?{x:e.pageX,y:e.pageY}:null};
if(this.rowMenu&&(!this.cellMenu||this.selection.isSelected(e.rowIndex)||e.rowNode&&_1.hasClass(e.rowNode,"dojoxGridRowbar"))){
this.rowMenu._openMyself(_f);
_1.stopEvent(e);
return;
}
if(this.cellMenu){
this.cellMenu._openMyself(_f);
}
_1.stopEvent(e);
},destroy:function(){
var g=this.grid;
if(g.headerMenu){
g.headerMenu.unBindDomNode(g.viewsHeaderNode);
}
if(g.rowMenu){
g.rowMenu.unBindDomNode(g.domNode);
}
if(g.cellMenu){
g.cellMenu.unBindDomNode(g.domNode);
}
if(g.selectedRegionMenu){
g.selectedRegionMenu.destroy();
}
this.inherited(arguments);
}});
_3.grid.EnhancedGrid.registerPlugin(_3.grid.enhanced.plugins.Menu);
return _3.grid.enhanced.plugins.Menu;
});
