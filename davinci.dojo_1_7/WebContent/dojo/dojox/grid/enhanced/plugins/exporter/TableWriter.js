/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/exporter/TableWriter",["dojo","dojox","./_ExportWriter"],function(_1,_2){
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
return [" grid_column grid_column_",_8,_8%2?" grid_odd_column":" grid_even_column"].join("");
},beforeView:function(_9){
var _a=_9.viewIdx,_b=this._viewTables[_a],_c,_d=_1.marginBox(_9.view.contentNode).w;
if(!_b){
var _e=0;
for(var i=0;i<_a;++i){
_e+=this._viewTables[i]._width;
}
_b=this._viewTables[_a]=["<div class=\"grid_view\" style=\"position: absolute; top: 0; ",_1._isBodyLtr()?"left":"right",":",_e,"px;\">"];
}
_b._width=_d;
if(_9.isHeader){
_c=_1.contentBox(_9.view.headerContentNode).h;
}else{
var _f=_9.grid.getRowNode(_9.rowIdx);
if(_f){
_c=_1.contentBox(_f).h;
}else{
_c=_9.grid.scroller.averageRowHeight;
}
}
_b.push("<table class=\"",this._getRowClass(_9),"\" style=\"table-layout:fixed; height:",_c,"px; width:",_d,"px;\" ","border=\"0\" cellspacing=\"0\" cellpadding=\"0\" ",this._getTableAttrs("table"),"><tbody ",this._getTableAttrs("tbody"),">");
return true;
},afterView:function(_10){
this._viewTables[_10.viewIdx].push("</tbody></table>");
},beforeSubrow:function(_11){
this._viewTables[_11.viewIdx].push("<tr",this._getTableAttrs("tr"),">");
return true;
},afterSubrow:function(_12){
this._viewTables[_12.viewIdx].push("</tr>");
},handleCell:function(_13){
var _14=_13.cell;
if(_14.hidden||_1.indexOf(_13.spCols,_14.index)>=0){
return;
}
var _15=_13.isHeader?"th":"td",_16=[_14.colSpan?" colspan=\""+_14.colSpan+"\"":"",_14.rowSpan?" rowspan=\""+_14.rowSpan+"\"":""," style=\"width: ",_1.contentBox(_14.getHeaderNode()).w,"px;\"",this._getTableAttrs(_15)," class=\"",this._getColumnClass(_13),"\""].join(""),_17=this._viewTables[_13.viewIdx];
_17.push("<",_15,_16,">");
if(_13.isHeader){
_17.push(_14.name||_14.field);
}else{
_17.push(this._getExportDataForCell(_13.rowIdx,_13.row,_14,_13.grid));
}
_17.push("</",_15,">");
},afterContent:function(){
_1.forEach(this._viewTables,function(_18){
_18.push("</div>");
});
},toString:function(){
var _19=_1.map(this._viewTables,function(_1a){
return _1a.join("");
}).join("");
return ["<div style=\"position: relative;\">",_19,"</div>"].join("");
}});
return _2.grid.enhanced.plugins.exporter.TableWriter;
});
