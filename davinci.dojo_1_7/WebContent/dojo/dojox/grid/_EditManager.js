/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/_EditManager",["dojo","dojox","./util"],function(_1,_2){
_1.declare("dojox.grid._EditManager",null,{constructor:function(_3){
this.grid=_3;
if(_1.isIE){
this.connections=[_1.connect(document.body,"onfocus",_1.hitch(this,"_boomerangFocus"))];
}else{
this.connections=[_1.connect(this.grid,"onBlur",this,"apply")];
}
},info:{},destroy:function(){
_1.forEach(this.connections,_1.disconnect);
},cellFocus:function(_4,_5){
if(this.grid.singleClickEdit||this.isEditRow(_5)){
this.setEditCell(_4,_5);
}else{
this.apply();
}
if(this.isEditing()||(_4&&_4.editable&&_4.alwaysEditing)){
this._focusEditor(_4,_5);
}
},rowClick:function(e){
if(this.isEditing()&&!this.isEditRow(e.rowIndex)){
this.apply();
}
},styleRow:function(_6){
if(_6.index==this.info.rowIndex){
_6.customClasses+=" dojoxGridRowEditing";
}
},dispatchEvent:function(e){
var c=e.cell,ed=(c&&c["editable"])?c:0;
return ed&&ed.dispatchEvent(e.dispatch,e);
},isEditing:function(){
return this.info.rowIndex!==undefined;
},isEditCell:function(_7,_8){
return (this.info.rowIndex===_7)&&(this.info.cell.index==_8);
},isEditRow:function(_9){
return this.info.rowIndex===_9;
},setEditCell:function(_a,_b){
if(!this.isEditCell(_b,_a.index)&&this.grid.canEdit&&this.grid.canEdit(_a,_b)){
this.start(_a,_b,this.isEditRow(_b)||_a.editable);
}
},_focusEditor:function(_c,_d){
_2.grid.util.fire(_c,"focus",[_d]);
},focusEditor:function(){
if(this.isEditing()){
this._focusEditor(this.info.cell,this.info.rowIndex);
}
},_boomerangWindow:500,_shouldCatchBoomerang:function(){
return this._catchBoomerang>new Date().getTime();
},_boomerangFocus:function(){
if(this._shouldCatchBoomerang()){
this.grid.focus.focusGrid();
this.focusEditor();
this._catchBoomerang=0;
}
},_doCatchBoomerang:function(){
if(_1.isIE){
this._catchBoomerang=new Date().getTime()+this._boomerangWindow;
}
},start:function(_e,_f,_10){
if(!this._isValidInput()){
return;
}
this.grid.beginUpdate();
this.editorApply();
if(this.isEditing()&&!this.isEditRow(_f)){
this.applyRowEdit();
this.grid.updateRow(_f);
}
if(_10){
this.info={cell:_e,rowIndex:_f};
this.grid.doStartEdit(_e,_f);
this.grid.updateRow(_f);
}else{
this.info={};
}
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._focusEditor(_e,_f);
this._doCatchBoomerang();
},_editorDo:function(_11){
var c=this.info.cell;
if(c&&c.editable){
c[_11](this.info.rowIndex);
}
},editorApply:function(){
this._editorDo("apply");
},editorCancel:function(){
this._editorDo("cancel");
},applyCellEdit:function(_12,_13,_14){
if(this.grid.canEdit(_13,_14)){
this.grid.doApplyCellEdit(_12,_14,_13.field);
}
},applyRowEdit:function(){
this.grid.doApplyEdit(this.info.rowIndex,this.info.cell.field);
},apply:function(){
if(this.isEditing()&&this._isValidInput()){
this.grid.beginUpdate();
this.editorApply();
this.applyRowEdit();
this.info={};
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._doCatchBoomerang();
}
},cancel:function(){
if(this.isEditing()){
this.grid.beginUpdate();
this.editorCancel();
this.info={};
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._doCatchBoomerang();
}
},save:function(_15,_16){
var c=this.info.cell;
if(this.isEditRow(_15)&&(!_16||c.view==_16)&&c.editable){
c.save(c,this.info.rowIndex);
}
},restore:function(_17,_18){
var c=this.info.cell;
if(this.isEditRow(_18)&&c.view==_17&&c.editable){
c.restore(c,this.info.rowIndex);
}
},_isValidInput:function(){
var w=(this.info.cell||{}).widget;
if(!w||!w.isValid){
return true;
}
w.focused=true;
return w.isValid(true);
}});
return _2.grid._EditManager;
});
