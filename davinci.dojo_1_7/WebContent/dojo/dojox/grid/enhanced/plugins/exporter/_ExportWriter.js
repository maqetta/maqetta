/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/exporter/_ExportWriter",["dojo","dojox","../Exporter"],function(_1,_2){
_1.declare("dojox.grid.enhanced.plugins.exporter._ExportWriter",null,{constructor:function(_3){
},_getExportDataForCell:function(_4,_5,_6,_7){
var _8=(_6.get||_7.get).call(_6,_4,_5);
if(this.formatter){
return this.formatter(_8,_6,_4,_5);
}else{
return _8;
}
},beforeHeader:function(_9){
return true;
},afterHeader:function(){
},beforeContent:function(_a){
return true;
},afterContent:function(){
},beforeContentRow:function(_b){
return true;
},afterContentRow:function(_c){
},beforeView:function(_d){
return true;
},afterView:function(_e){
},beforeSubrow:function(_f){
return true;
},afterSubrow:function(_10){
},handleCell:function(_11){
},toString:function(){
return "";
}});
return _2.grid.enhanced.plugins.exporter._ExportWriter;
});
