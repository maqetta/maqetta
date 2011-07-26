/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/_Layout",["dojo","dojox","./cells","./_RowSelector"],function(_1,_2){
_1.declare("dojox.grid._Layout",null,{constructor:function(_3){
this.grid=_3;
},cells:[],structure:null,defaultWidth:"6em",moveColumn:function(_4,_5,_6,_7,_8){
var _9=this.structure[_4].cells[0];
var _a=this.structure[_5].cells[0];
var _b=null;
var _c=0;
var _d=0;
for(var i=0,c;c=_9[i];i++){
if(c.index==_6){
_c=i;
break;
}
}
_b=_9.splice(_c,1)[0];
_b.view=this.grid.views.views[_5];
for(i=0,c=null;c=_a[i];i++){
if(c.index==_7){
_d=i;
break;
}
}
if(!_8){
_d+=1;
}
_a.splice(_d,0,_b);
var _e=this.grid.getCell(this.grid.getSortIndex());
if(_e){
_e._currentlySorted=this.grid.getSortAsc();
}
this.cells=[];
_6=0;
var v;
for(i=0;v=this.structure[i];i++){
for(var j=0,cs;cs=v.cells[j];j++){
for(var k=0;c=cs[k];k++){
c.index=_6;
this.cells.push(c);
if("_currentlySorted" in c){
var si=_6+1;
si*=c._currentlySorted?1:-1;
this.grid.sortInfo=si;
delete c._currentlySorted;
}
_6++;
}
}
}
_1.forEach(this.cells,function(c){
var _f=c.markup[2].split(" ");
var _10=parseInt(_f[1].substring(5));
if(_10!=c.index){
_f[1]="idx=\""+c.index+"\"";
c.markup[2]=_f.join(" ");
}
});
this.grid.setupHeaderMenu();
},setColumnVisibility:function(_11,_12){
var _13=this.cells[_11];
if(_13.hidden==_12){
_13.hidden=!_12;
var v=_13.view,w=v.viewWidth;
if(w&&w!="auto"){
v._togglingColumn=_1.marginBox(_13.getHeaderNode()).w||0;
}
v.update();
return true;
}else{
return false;
}
},addCellDef:function(_14,_15,_16){
var _17=this;
var _18=function(_19){
var w=0;
if(_19.colSpan>1){
w=0;
}else{
w=_19.width||_17._defaultCellProps.width||_17.defaultWidth;
if(!isNaN(w)){
w=w+"em";
}
}
return w;
};
var _1a={grid:this.grid,subrow:_14,layoutIndex:_15,index:this.cells.length};
if(_16&&_16 instanceof _2.grid.cells._Base){
var _1b=_1.clone(_16);
_1a.unitWidth=_18(_1b._props);
_1b=_1.mixin(_1b,this._defaultCellProps,_16._props,_1a);
return _1b;
}
var _1c=_16.type||_16.cellType||this._defaultCellProps.type||this._defaultCellProps.cellType||_2.grid.cells.Cell;
if(dojo.isString(_1c)){
_1c=dojo.getObject(_1c);
}
_1a.unitWidth=_18(_16);
return new _1c(_1.mixin({},this._defaultCellProps,_16,_1a));
},addRowDef:function(_1d,_1e){
var _1f=[];
var _20=0,_21=0,_22=true;
for(var i=0,def,_23;(def=_1e[i]);i++){
_23=this.addCellDef(_1d,i,def);
_1f.push(_23);
this.cells.push(_23);
if(_22&&_23.relWidth){
_20+=_23.relWidth;
}else{
if(_23.width){
var w=_23.width;
if(typeof w=="string"&&w.slice(-1)=="%"){
_21+=window.parseInt(w,10);
}else{
if(w=="auto"){
_22=false;
}
}
}
}
}
if(_20&&_22){
_1.forEach(_1f,function(_24){
if(_24.relWidth){
_24.width=_24.unitWidth=((_24.relWidth/_20)*(100-_21))+"%";
}
});
}
return _1f;
},addRowsDef:function(_25){
var _26=[];
if(_1.isArray(_25)){
if(_1.isArray(_25[0])){
for(var i=0,row;_25&&(row=_25[i]);i++){
_26.push(this.addRowDef(i,row));
}
}else{
_26.push(this.addRowDef(0,_25));
}
}
return _26;
},addViewDef:function(_27){
this._defaultCellProps=_27.defaultCell||{};
if(_27.width&&_27.width=="auto"){
delete _27.width;
}
return _1.mixin({},_27,{cells:this.addRowsDef(_27.rows||_27.cells)});
},setStructure:function(_28){
this.fieldIndex=0;
this.cells=[];
var s=this.structure=[];
if(this.grid.rowSelector){
var sel={type:_2._scopeName+".grid._RowSelector"};
if(_1.isString(this.grid.rowSelector)){
var _29=this.grid.rowSelector;
if(_29=="false"){
sel=null;
}else{
if(_29!="true"){
sel["width"]=_29;
}
}
}else{
if(!this.grid.rowSelector){
sel=null;
}
}
if(sel){
s.push(this.addViewDef(sel));
}
}
var _2a=function(def){
return ("name" in def||"field" in def||"get" in def);
};
var _2b=function(def){
if(_1.isArray(def)){
if(_1.isArray(def[0])||_2a(def[0])){
return true;
}
}
return false;
};
var _2c=function(def){
return (def!==null&&_1.isObject(def)&&("cells" in def||"rows" in def||("type" in def&&!_2a(def))));
};
if(_1.isArray(_28)){
var _2d=false;
for(var i=0,st;(st=_28[i]);i++){
if(_2c(st)){
_2d=true;
break;
}
}
if(!_2d){
s.push(this.addViewDef({cells:_28}));
}else{
for(i=0;(st=_28[i]);i++){
if(_2b(st)){
s.push(this.addViewDef({cells:st}));
}else{
if(_2c(st)){
s.push(this.addViewDef(st));
}
}
}
}
}else{
if(_2c(_28)){
s.push(this.addViewDef(_28));
}
}
this.cellCount=this.cells.length;
this.grid.setupHeaderMenu();
}});
return _2.grid._Layout;
});
