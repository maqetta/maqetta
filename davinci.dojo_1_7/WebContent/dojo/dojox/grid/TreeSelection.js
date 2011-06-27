/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/TreeSelection",["dojo","dojox","./DataSelection"],function(_1,_2){
_1.declare("dojox.grid.TreeSelection",_2.grid.DataSelection,{setMode:function(_3){
this.selected={};
this.sorted_sel=[];
this.sorted_ltos={};
this.sorted_stol={};
_2.grid.DataSelection.prototype.setMode.call(this,_3);
},addToSelection:function(_4){
if(this.mode=="none"){
return;
}
var _5=null;
if(typeof _4=="number"||typeof _4=="string"){
_5=_4;
}else{
_5=this.grid.getItemIndex(_4);
}
if(this.selected[_5]){
this.selectedIndex=_5;
}else{
if(this.onCanSelect(_5)!==false){
this.selectedIndex=_5;
var _6=_1.query("tr[dojoxTreeGridPath='"+_5+"']",this.grid.domNode);
if(_6.length){
_1.attr(_6[0],"aria-selected","true");
}
this._beginUpdate();
this.selected[_5]=true;
this._insertSortedSelection(_5);
this.onSelected(_5);
this._endUpdate();
}
}
},deselect:function(_7){
if(this.mode=="none"){
return;
}
var _8=null;
if(typeof _7=="number"||typeof _7=="string"){
_8=_7;
}else{
_8=this.grid.getItemIndex(_7);
}
if(this.selectedIndex==_8){
this.selectedIndex=-1;
}
if(this.selected[_8]){
if(this.onCanDeselect(_8)===false){
return;
}
var _9=_1.query("tr[dojoxTreeGridPath='"+_8+"']",this.grid.domNode);
if(_9.length){
_1.attr(_9[0],"aria-selected","false");
}
this._beginUpdate();
delete this.selected[_8];
this._removeSortedSelection(_8);
this.onDeselected(_8);
this._endUpdate();
}
},getSelected:function(){
var _a=[];
for(var i in this.selected){
if(this.selected[i]){
_a.push(this.grid.getItem(i));
}
}
return _a;
},getSelectedCount:function(){
var c=0;
for(var i in this.selected){
if(this.selected[i]){
c++;
}
}
return c;
},_bsearch:function(v){
var o=this.sorted_sel;
var h=o.length-1,l=0,m;
while(l<=h){
var _b=this._comparePaths(o[m=(l+h)>>1],v);
if(_b<0){
l=m+1;
continue;
}
if(_b>0){
h=m-1;
continue;
}
return m;
}
return _b<0?m-_b:m;
},_comparePaths:function(a,b){
for(var i=0,l=(a.length<b.length?a.length:b.length);i<l;i++){
if(a[i]<b[i]){
return -1;
}
if(a[i]>b[i]){
return 1;
}
}
if(a.length<b.length){
return -1;
}
if(a.length>b.length){
return 1;
}
return 0;
},_insertSortedSelection:function(_c){
_c=String(_c);
var s=this.sorted_sel;
var sl=this.sorted_ltos;
var ss=this.sorted_stol;
var _d=_c.split("/");
_d=_1.map(_d,function(_e){
return parseInt(_e,10);
});
sl[_d]=_c;
ss[_c]=_d;
if(s.length===0){
s.push(_d);
return;
}
if(s.length==1){
var _f=this._comparePaths(s[0],_d);
if(_f==1){
s.unshift(_d);
}else{
s.push(_d);
}
return;
}
var idx=this._bsearch(_d);
this.sorted_sel.splice(idx,0,_d);
},_removeSortedSelection:function(_10){
_10=String(_10);
var s=this.sorted_sel;
var sl=this.sorted_ltos;
var ss=this.sorted_stol;
if(s.length===0){
return;
}
var _11=ss[_10];
if(!_11){
return;
}
var idx=this._bsearch(_11);
if(idx>-1){
delete sl[_11];
delete ss[_10];
s.splice(idx,1);
}
},getFirstSelected:function(){
if(!this.sorted_sel.length||this.mode=="none"){
return -1;
}
var _12=this.sorted_sel[0];
if(!_12){
return -1;
}
_12=this.sorted_ltos[_12];
if(!_12){
return -1;
}
return _12;
},getNextSelected:function(_13){
if(!this.sorted_sel.length||this.mode=="none"){
return -1;
}
_13=String(_13);
var _14=this.sorted_stol[_13];
if(!_14){
return -1;
}
var idx=this._bsearch(_14);
var _15=this.sorted_sel[idx+1];
if(!_15){
return -1;
}
return this.sorted_ltos[_15];
},_range:function(_16,_17,_18){
if(!_1.isString(_16)&&_16<0){
_16=_17;
}
var _19=this.grid.layout.cells,_1a=this.grid.store,_1b=this.grid;
_16=new _2.grid.TreePath(String(_16),_1b);
_17=new _2.grid.TreePath(String(_17),_1b);
if(_16.compare(_17)>0){
var tmp=_16;
_16=_17;
_17=tmp;
}
var _1c=_16._str,_1d=_17._str;
_18(_1c);
var p=_16;
while((p=p.next())){
if(p._str==_1d){
break;
}
_18(p._str);
}
_18(_1d);
}});
return _2.grid.TreeSelection;
});
