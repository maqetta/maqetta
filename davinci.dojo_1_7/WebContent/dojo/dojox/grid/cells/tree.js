/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/cells/tree",["dojo","dojox","../cells"],function(_1,_2){
_2.grid.cells.TreeCell={formatAggregate:function(_3,_4,_5){
var f,g=this.grid,i=g.edit.info,d=g.aggregator?g.aggregator.getForCell(this,_4,_3,_4===this.level?"cnt":this.parentCell.aggregate):(this.value||this.defaultValue);
return this._defaultFormat(d,[d,_4-this.level,_5,this]);
},formatIndexes:function(_6,_7){
var f,g=this.grid,i=g.edit.info,d=this.get?this.get(_6[0],_7,_6):(this.value||this.defaultValue);
if(this.editable&&(this.alwaysEditing||(i.rowIndex==_6[0]&&i.cell==this))){
return this.formatEditing(d,_6[0],_6);
}else{
return this._defaultFormat(d,[d,_6[0],_6,this]);
}
},getOpenState:function(_8){
var _9=this.grid,_a=_9.store,_b=null;
if(_a.isItem(_8)){
_b=_8;
_8=_a.getIdentity(_8);
}
if(!this.openStates){
this.openStates={};
}
if(typeof _8!="string"||!(_8 in this.openStates)){
this.openStates[_8]=_9.getDefaultOpenState(this,_b);
}
return this.openStates[_8];
},formatAtLevel:function(_c,_d,_e,_f,_10,_11){
if(!_1.isArray(_c)){
_c=[_c];
}
var _12="";
if(_e>this.level||(_e===this.level&&_f)){
_11.push("dojoxGridSpacerCell");
if(_e===this.level){
_11.push("dojoxGridTotalCell");
}
_12="<span></span>";
}else{
if(_e<this.level){
_11.push("dojoxGridSummaryCell");
_12="<span class=\"dojoxGridSummarySpan\">"+this.formatAggregate(_d,_e,_c)+"</span>";
}else{
var ret="";
if(this.isCollapsable){
var _13=this.grid.store,id="";
if(_13.isItem(_d)){
id=_13.getIdentity(_d);
}
_11.push("dojoxGridExpandoCell");
ret="<span "+_1._scopeName+"Type=\"dojox.grid._Expando\" level=\""+_e+"\" class=\"dojoxGridExpando\""+"\" toggleClass=\""+_10+"\" itemId=\""+id+"\" cellIdx=\""+this.index+"\"></span>";
}
_12=ret+this.formatIndexes(_c,_d);
}
}
if(this.grid.focus.cell&&this.index==this.grid.focus.cell.index&&_c.join("/")==this.grid.focus.rowIndex){
_11.push(this.grid.focus.focusClass);
}
return _12;
}};
return _2.grid.cells.tree;
});
