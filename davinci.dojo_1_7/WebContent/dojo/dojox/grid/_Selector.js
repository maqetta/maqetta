/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/_Selector",["dojo","dojox","./Selection","./_View","./_Builder"],function(_1,_2){
_2.grid._InputSelectorHeaderBuilder=_1.extend(function(_3){
_2.grid._HeaderBuilder.call(this,_3);
},_2.grid._HeaderBuilder.prototype,{generateHtml:function(){
var w=this.view.contentWidth||0;
var _4=this.view.grid.selection.getSelectedCount();
var _5=(_4&&_4==this.view.grid.rowCount)?" dijitCheckBoxChecked dijitChecked":"";
return "<table style=\"width:"+w+"px;\" "+"border=\"0\" cellspacing=\"0\" cellpadding=\"0\" "+"role=\"presentation\"><tr><th style=\"text-align: center;\">"+"<div class=\"dojoxGridCheckSelector dijitReset dijitInline dijitCheckBox"+_5+"\"></div></th></tr></table>";
},doclick:function(e){
var _6=this.view.grid.selection.getSelectedCount();
this.view._selectionChanging=true;
if(_6==this.view.grid.rowCount){
this.view.grid.selection.deselectAll();
}else{
this.view.grid.selection.selectRange(0,this.view.grid.rowCount-1);
}
this.view._selectionChanging=false;
this.view.onSelectionChanged();
return true;
}});
_2.grid._SelectorContentBuilder=_1.extend(function(_7){
_2.grid._ContentBuilder.call(this,_7);
},_2.grid._ContentBuilder.prototype,{generateHtml:function(_8,_9){
var w=this.view.contentWidth||0;
return "<table class=\"dojoxGridRowbarTable\" style=\"width:"+w+"px;\" border=\"0\" "+"cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\"><tr>"+"<td  style=\"text-align: center;\" class=\"dojoxGridRowbarInner\">"+this.getCellContent(_9)+"</td></tr></table>";
},getCellContent:function(_a){
return "&nbsp;";
},findTarget:function(){
var t=_2.grid._ContentBuilder.prototype.findTarget.apply(this,arguments);
return t;
},domouseover:function(e){
this.view.grid.onMouseOverRow(e);
},domouseout:function(e){
if(!this.isIntraRowEvent(e)){
this.view.grid.onMouseOutRow(e);
}
},doclick:function(e){
var _b=e.rowIndex;
var _c=this.view.grid.selection.isSelected(_b);
var _d=this.view.grid.selection.mode;
if(!_c){
if(_d=="single"){
this.view.grid.selection.select(_b);
}else{
if(_d!="none"){
this.view.grid.selection.addToSelection(_b);
}
}
}else{
this.view.grid.selection.deselect(_b);
}
return true;
}});
_2.grid._InputSelectorContentBuilder=_1.extend(function(_e){
_2.grid._SelectorContentBuilder.call(this,_e);
},_2.grid._SelectorContentBuilder.prototype,{getCellContent:function(_f){
var v=this.view;
var _10=v.inputType=="checkbox"?"CheckBox":"Radio";
var _11=!!v.grid.selection.isSelected(_f)?" dijit"+_10+"Checked dijitChecked":"";
return "<div class=\"dojoxGridCheckSelector dijitReset dijitInline dijit"+_10+_11+"\"></div>";
}});
_1.declare("dojox.grid._Selector",_2.grid._View,{inputType:"",selectionMode:"",defaultWidth:"2em",noscroll:true,padBorderWidth:2,_contentBuilderClass:_2.grid._SelectorContentBuilder,postCreate:function(){
this.inherited(arguments);
if(this.selectionMode){
this.grid.selection.mode=this.selectionMode;
}
this.connect(this.grid.selection,"onSelected","onSelected");
this.connect(this.grid.selection,"onDeselected","onDeselected");
},buildRendering:function(){
this.inherited(arguments);
this.scrollboxNode.style.overflow="hidden";
},getWidth:function(){
return this.viewWidth||this.defaultWidth;
},resize:function(){
this.adaptHeight();
},setStructure:function(s){
this.inherited(arguments);
if(s.defaultWidth){
this.defaultWidth=s.defaultWidth;
}
},adaptWidth:function(){
if(!("contentWidth" in this)&&this.contentNode){
this.contentWidth=this.contentNode.offsetWidth-this.padBorderWidth;
}
},doStyleRowNode:function(_12,_13){
var n=["dojoxGridRowbar dojoxGridNonNormalizedCell"];
if(this.grid.rows.isOver(_12)){
n.push("dojoxGridRowbarOver");
}
if(this.grid.selection.isSelected(_12)){
n.push("dojoxGridRowbarSelected");
}
_13.className=n.join(" ");
},onSelected:function(_14){
this.grid.updateRow(_14);
},onDeselected:function(_15){
this.grid.updateRow(_15);
}});
if(!_2.grid._View.prototype._headerBuilderClass&&!_2.grid._View.prototype._contentBuilderClass){
_2.grid._Selector.prototype.postCreate=function(){
this.connect(this.scrollboxNode,"onscroll","doscroll");
_2.grid.util.funnelEvents(this.contentNode,this,"doContentEvent",["mouseover","mouseout","click","dblclick","contextmenu","mousedown"]);
_2.grid.util.funnelEvents(this.headerNode,this,"doHeaderEvent",["dblclick","mouseover","mouseout","mousemove","mousedown","click","contextmenu"]);
if(this._contentBuilderClass){
this.content=new this._contentBuilderClass(this);
}else{
this.content=new _2.grid._ContentBuilder(this);
}
if(this._headerBuilderClass){
this.header=new this._headerBuilderClass(this);
}else{
this.header=new _2.grid._HeaderBuilder(this);
}
if(!_1._isBodyLtr()){
this.headerNodeContainer.style.width="";
}
this.connect(this.grid.selection,"onSelected","onSelected");
this.connect(this.grid.selection,"onDeselected","onDeselected");
};
}
_1.declare("dojox.grid._RadioSelector",_2.grid._Selector,{inputType:"radio",selectionMode:"single",_contentBuilderClass:_2.grid._InputSelectorContentBuilder,buildRendering:function(){
this.inherited(arguments);
this.headerNode.style.visibility="hidden";
},renderHeader:function(){
}});
_1.declare("dojox.grid._CheckBoxSelector",_2.grid._Selector,{inputType:"checkbox",_headerBuilderClass:_2.grid._InputSelectorHeaderBuilder,_contentBuilderClass:_2.grid._InputSelectorContentBuilder,postCreate:function(){
this.inherited(arguments);
this.connect(this.grid,"onSelectionChanged","onSelectionChanged");
this.connect(this.grid,"updateRowCount","_updateVisibility");
},renderHeader:function(){
this.inherited(arguments);
this._updateVisibility(this.grid.rowCount);
},_updateVisibility:function(_16){
this.headerNode.style.visibility=_16?"":"hidden";
},onSelectionChanged:function(){
if(this._selectionChanging){
return;
}
var _17=_1.query(".dojoxGridCheckSelector",this.headerNode)[0];
var g=this.grid;
var s=(g.rowCount&&g.rowCount==g.selection.getSelectedCount());
g.allItemsSelected=s||false;
_1.toggleClass(_17,"dijitChecked",g.allItemsSelected);
_1.toggleClass(_17,"dijitCheckBoxChecked",g.allItemsSelected);
}});
return _2.grid._Selector;
});
