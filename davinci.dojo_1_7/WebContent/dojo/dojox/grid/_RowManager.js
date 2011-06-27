/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/_RowManager",["dojo","dojox"],function(_1,_2){
var _3=function(_4,_5){
if(_4.style.cssText==undefined){
_4.setAttribute("style",_5);
}else{
_4.style.cssText=_5;
}
};
_1.declare("dojox.grid._RowManager",null,{constructor:function(_6){
this.grid=_6;
},linesToEms:2,overRow:-2,prepareStylingRow:function(_7,_8){
return {index:_7,node:_8,odd:Boolean(_7&1),selected:!!this.grid.selection.isSelected(_7),over:this.isOver(_7),customStyles:"",customClasses:"dojoxGridRow"};
},styleRowNode:function(_9,_a){
var _b=this.prepareStylingRow(_9,_a);
this.grid.onStyleRow(_b);
this.applyStyles(_b);
},applyStyles:function(_c){
var i=_c;
i.node.className=i.customClasses;
var h=i.node.style.height;
_3(i.node,i.customStyles+";"+(i.node._style||""));
i.node.style.height=h;
},updateStyles:function(_d){
this.grid.updateRowStyles(_d);
},setOverRow:function(_e){
var _f=this.overRow;
this.overRow=_e;
if((_f!=this.overRow)&&(_1.isString(_f)||_f>=0)){
this.updateStyles(_f);
}
this.updateStyles(this.overRow);
},isOver:function(_10){
return (this.overRow==_10&&!_1.hasClass(this.grid.domNode,"dojoxGridColumnResizing"));
}});
return _2.grid._RowManager;
});
