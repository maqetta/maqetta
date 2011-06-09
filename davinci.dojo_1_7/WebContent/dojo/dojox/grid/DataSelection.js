/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dojox","./Selection"],function(_1,_2){
_1.declare("dojox.grid.DataSelection",_2.grid.Selection,{getFirstSelected:function(){
var _3=_2.grid.Selection.prototype.getFirstSelected.call(this);
if(_3==-1){
return null;
}
return this.grid.getItem(_3);
},getNextSelected:function(_4){
var _5=this.grid.getItemIndex(_4);
var _6=_2.grid.Selection.prototype.getNextSelected.call(this,_5);
if(_6==-1){
return null;
}
return this.grid.getItem(_6);
},getSelected:function(){
var _7=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_7.push(this.grid.getItem(i));
}
}
return _7;
},addToSelection:function(_8){
if(this.mode=="none"){
return;
}
var _9=null;
if(typeof _8=="number"||typeof _8=="string"){
_9=_8;
}else{
_9=this.grid.getItemIndex(_8);
}
_2.grid.Selection.prototype.addToSelection.call(this,_9);
},deselect:function(_a){
if(this.mode=="none"){
return;
}
var _b=null;
if(typeof _a=="number"||typeof _a=="string"){
_b=_a;
}else{
_b=this.grid.getItemIndex(_a);
}
_2.grid.Selection.prototype.deselect.call(this,_b);
},deselectAll:function(_c){
var _d=null;
if(_c||typeof _c=="number"){
if(typeof _c=="number"||typeof _c=="string"){
_d=_c;
}else{
_d=this.grid.getItemIndex(_c);
}
_2.grid.Selection.prototype.deselectAll.call(this,_d);
}else{
this.inherited(arguments);
}
}});
return _2.grid.DataSelection;
});
