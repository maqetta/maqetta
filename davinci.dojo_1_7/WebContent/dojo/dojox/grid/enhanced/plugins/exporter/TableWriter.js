/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dojox","./_ExportWriter"],function(_1,_2){
_2.grid.enhanced.plugins.Exporter.registerWriter("table","dojox.grid.enhanced.plugins.exporter.TableWriter");
_1.declare("dojox.grid.enhanced.plugins.exporter.TableWriter",_2.grid.enhanced.plugins.exporter._ExportWriter,{constructor:function(_3){
this._viewTables=[];
this._tableAttrs=_3||{};
},_getTableAttrs:function(_4){
var _5=this._tableAttrs[_4]||"";
if(_5&&_5[0]!=" "){
_5=" "+_5;
}
return _5;
},_getRowClass:function(_6){
return _6.isHeader?" grid_header":[" grid_row grid_row_",_6.rowIdx+1,_6.rowIdx%2?" grid_even_row":" grid_odd_row"].join("");
},_getColumnClass:function(_7){
var _8=_7.cell.index+_7.colOffset+1;
return [" grid_column_",_8,_8%2?" grid_odd_column":" grid_even_column"].join("");
},beforeView:function(_9){
var _a=_9.viewIdx,_b=this._viewTables[_a],_c,_d,_e=_1.marginBox(_9.view.contentNode).w;
if(!_b){
var _f=0;
for(var i=0;i<_a;++i){
_f+=this._viewTables[i]._width;
}
_b=this._viewTables[_a]=["<table class=\"grid_view\" style=\"position: absolute; top: 0; left:",_f,"px;\"",this._getTableAttrs("table"),">"];
}
_b._width=_e;
if(_9.isHeader){
_c="thead";
_d=_1.contentBox(_9.view.headerContentNode).h;
}else{
_c="tbody";
var _10=_9.grid.getRowNode(_9.rowIdx);
if(_10){
_d=_1.contentBox(_10).h;
}else{
_d=_9.grid.scroller.averageRowHeight;
}
}
_b.push("<",_c," style=\"height:",_d,"px; width:",_e,"px;\""," class=\"",this._getRowClass(_9),"\"",this._getTableAttrs(_c),">");
return true;
},afterView:function(_11){
this._viewTables[_11.viewIdx].push(_11.isHeader?"</thead>":"</tbody>");
},beforeSubrow:function(_12){
this._viewTables[_12.viewIdx].push("<tr",this._getTableAttrs("tr"),">");
return true;
},afterSubrow:function(_13){
this._viewTables[_13.viewIdx].push("</tr>");
},handleCell:function(_14){
var _15=_14.cell;
if(_15.hidden||_1.indexOf(_14.spCols,_15.index)>=0){
return;
}
var _16=_14.isHeader?"th":"td",_17=[_15.colSpan?" colspan=\""+_15.colSpan+"\"":"",_15.rowSpan?" rowspan=\""+_15.rowSpan+"\"":""," style=\"width: ",_1.contentBox(_15.getHeaderNode()).w,"px;\"",this._getTableAttrs(_16)," class=\"",this._getColumnClass(_14),"\""].join(""),_18=this._viewTables[_14.viewIdx];
_18.push("<",_16,_17,">");
if(_14.isHeader){
_18.push(_15.name||_15.field);
}else{
_18.push(this._getExportDataForCell(_14.rowIdx,_14.row,_15,_14.grid));
}
_18.push("</",_16,">");
},afterContent:function(){
_1.forEach(this._viewTables,function(_19){
_19.push("</table>");
});
},toString:function(){
var _1a=_1.map(this._viewTables,function(_1b){
return _1b.join("");
}).join("");
return ["<div style=\"position: relative;\">",_1a,"</div>"].join("");
}});
return _2.grid.enhanced.plugins.exporter.TableWriter;
});
