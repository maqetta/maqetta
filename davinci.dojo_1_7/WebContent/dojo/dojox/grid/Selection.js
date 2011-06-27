/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/Selection",["dojo","dojox"],function(_1,_2){
_1.declare("dojox.grid.Selection",null,{constructor:function(_3){
this.grid=_3;
this.selected=[];
this.setMode(_3.selectionMode);
},mode:"extended",selected:null,updating:0,selectedIndex:-1,setMode:function(_4){
if(this.selected.length){
this.deselectAll();
}
if(_4!="extended"&&_4!="multiple"&&_4!="single"&&_4!="none"){
this.mode="extended";
}else{
this.mode=_4;
}
},onCanSelect:function(_5){
return this.grid.onCanSelect(_5);
},onCanDeselect:function(_6){
return this.grid.onCanDeselect(_6);
},onSelected:function(_7){
},onDeselected:function(_8){
},onChanging:function(){
},onChanged:function(){
},isSelected:function(_9){
if(this.mode=="none"){
return false;
}
return this.selected[_9];
},getFirstSelected:function(){
if(!this.selected.length||this.mode=="none"){
return -1;
}
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getNextSelected:function(_a){
if(this.mode=="none"){
return -1;
}
for(var i=_a+1,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getSelected:function(){
var _b=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_b.push(i);
}
}
return _b;
},getSelectedCount:function(){
var c=0;
for(var i=0;i<this.selected.length;i++){
if(this.selected[i]){
c++;
}
}
return c;
},_beginUpdate:function(){
if(this.updating===0){
this.onChanging();
}
this.updating++;
},_endUpdate:function(){
this.updating--;
if(this.updating===0){
this.onChanged();
}
},select:function(_c){
if(this.mode=="none"){
return;
}
if(this.mode!="multiple"){
this.deselectAll(_c);
this.addToSelection(_c);
}else{
this.toggleSelect(_c);
}
},addToSelection:function(_d){
if(this.mode=="none"){
return;
}
if(_1.isArray(_d)){
_1.forEach(_d,this.addToSelection,this);
return;
}
_d=Number(_d);
if(this.selected[_d]){
this.selectedIndex=_d;
}else{
if(this.onCanSelect(_d)!==false){
this.selectedIndex=_d;
var _e=this.grid.getRowNode(_d);
if(_e){
_1.attr(_e,"aria-selected","true");
}
this._beginUpdate();
this.selected[_d]=true;
this.onSelected(_d);
this._endUpdate();
}
}
},deselect:function(_f){
if(this.mode=="none"){
return;
}
if(_1.isArray(_f)){
_1.forEach(_f,this.deselect,this);
return;
}
_f=Number(_f);
if(this.selectedIndex==_f){
this.selectedIndex=-1;
}
if(this.selected[_f]){
if(this.onCanDeselect(_f)===false){
return;
}
var _10=this.grid.getRowNode(_f);
if(_10){
_1.attr(_10,"aria-selected","false");
}
this._beginUpdate();
delete this.selected[_f];
this.onDeselected(_f);
this._endUpdate();
}
},setSelected:function(_11,_12){
this[(_12?"addToSelection":"deselect")](_11);
},toggleSelect:function(_13){
if(_1.isArray(_13)){
_1.forEach(_13,this.toggleSelect,this);
return;
}
this.setSelected(_13,!this.selected[_13]);
},_range:function(_14,_15,_16){
var s=(_14>=0?_14:_15),e=_15;
if(s>e){
e=s;
s=_15;
}
for(var i=s;i<=e;i++){
_16(i);
}
},selectRange:function(_17,_18){
this._range(_17,_18,_1.hitch(this,"addToSelection"));
},deselectRange:function(_19,_1a){
this._range(_19,_1a,_1.hitch(this,"deselect"));
},insert:function(_1b){
this.selected.splice(_1b,0,false);
if(this.selectedIndex>=_1b){
this.selectedIndex++;
}
},remove:function(_1c){
this.selected.splice(_1c,1);
if(this.selectedIndex>=_1c){
this.selectedIndex--;
}
},deselectAll:function(_1d){
for(var i in this.selected){
if((i!=_1d)&&(this.selected[i]===true)){
this.deselect(i);
}
}
},clickSelect:function(_1e,_1f,_20){
if(this.mode=="none"){
return;
}
this._beginUpdate();
if(this.mode!="extended"){
this.select(_1e);
}else{
var _21=this.selectedIndex;
if(!_1f){
this.deselectAll(_1e);
}
if(_20){
this.selectRange(_21,_1e);
}else{
if(_1f){
this.toggleSelect(_1e);
}else{
this.addToSelection(_1e);
}
}
}
this._endUpdate();
},clickSelectEvent:function(e){
this.clickSelect(e.rowIndex,_1.isCopyKey(e),e.shiftKey);
},clear:function(){
this._beginUpdate();
this.deselectAll();
this._endUpdate();
}});
return _2.grid.Selection;
});
