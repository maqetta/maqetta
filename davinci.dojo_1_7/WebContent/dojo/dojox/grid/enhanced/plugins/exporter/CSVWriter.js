/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/exporter/CSVWriter",["dojo","dojox","./_ExportWriter"],function(_1,_2){
_2.grid.enhanced.plugins.Exporter.registerWriter("csv","dojox.grid.enhanced.plugins.exporter.CSVWriter");
_1.declare("dojox.grid.enhanced.plugins.exporter.CSVWriter",_2.grid.enhanced.plugins.exporter._ExportWriter,{_separator:",",_newline:"\r\n",constructor:function(_3){
if(_3){
this._separator=_3.separator?_3.separator:this._separator;
this._newline=_3.newline?_3.newline:this._newline;
}
this._headers=[];
this._dataRows=[];
},_formatCSVCell:function(_4){
if(_4===null||_4===undefined){
return "";
}
var _5=String(_4).replace(/"/g,"\"\"");
if(_5.indexOf(this._separator)>=0||_5.search(/[" \t\r\n]/)>=0){
_5="\""+_5+"\"";
}
return _5;
},beforeContentRow:function(_6){
var _7=[],_8=this._formatCSVCell;
_1.forEach(_6.grid.layout.cells,function(_9){
if(!_9.hidden&&_1.indexOf(_6.spCols,_9.index)<0){
_7.push(_8(this._getExportDataForCell(_6.rowIndex,_6.row,_9,_6.grid)));
}
},this);
this._dataRows.push(_7);
return false;
},handleCell:function(_a){
var _b=_a.cell;
if(_a.isHeader&&!_b.hidden&&_1.indexOf(_a.spCols,_b.index)<0){
this._headers.push(_b.name||_b.field);
}
},toString:function(){
var _c=this._headers.join(this._separator);
for(var i=this._dataRows.length-1;i>=0;--i){
this._dataRows[i]=this._dataRows[i].join(this._separator);
}
return _c+this._newline+this._dataRows.join(this._newline);
}});
return _2.grid.enhanced.plugins.exporter.CSVWriter;
});
