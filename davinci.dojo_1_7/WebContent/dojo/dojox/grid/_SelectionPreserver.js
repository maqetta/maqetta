/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/_SelectionPreserver",["dojo","dojox"],function(_1,_2){
_1.declare("dojox.grid._SelectionPreserver",null,{constructor:function(_3){
this.selection=_3;
var _4=this.grid=_3.grid;
this.reset();
this._connects=[_1.connect(_4,"_setStore",this,"reset"),_1.connect(_4,"_addItem",this,"_reSelectById"),_1.connect(_3,"addToSelection",_1.hitch(this,"_selectById",true)),_1.connect(_3,"deselect",_1.hitch(this,"_selectById",false))];
},destroy:function(){
this.reset();
_1.forEach(this._connects,_1.disconnect);
delete this._connects;
},reset:function(){
this._selectedById={};
},_reSelectById:function(_5,_6){
if(_5&&this.grid._hasIdentity){
this.selection.selected[_6]=this._selectedById[this.grid.store.getIdentity(_5)];
}
},_selectById:function(_7,_8){
if(this.selection.mode=="none"||!this.grid._hasIdentity){
return;
}
var _9=_8,g=this.grid;
if(typeof _8=="number"||typeof _8=="string"){
var _a=g._by_idx[_8];
_9=_a&&_a.item;
}
if(_9){
this._selectedById[g.store.getIdentity(_9)]=!!_7;
}
return _9;
}});
return _2.grid._SelectionPreserver;
});
