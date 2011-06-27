/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/selection",["dojo/_base/kernel","..","dojo/NodeList-manipulate","dojo/_base/html","dojo/_base/sniff","dojo/_base/window"],function(_1,_2){
_1.getObject("_editor.selection",true,_2);
_1.mixin(_2._editor.selection,{getType:function(){
if(_1.isIE<9){
return _1.doc.selection.type.toLowerCase();
}else{
var _3="text";
var _4;
try{
_4=_1.global.getSelection();
}
catch(e){
}
if(_4&&_4.rangeCount==1){
var _5=_4.getRangeAt(0);
if((_5.startContainer==_5.endContainer)&&((_5.endOffset-_5.startOffset)==1)&&(_5.startContainer.nodeType!=3)){
_3="control";
}
}
return _3;
}
},getSelectedText:function(){
if(_1.isIE<9){
if(_2._editor.selection.getType()=="control"){
return null;
}
return _1.doc.selection.createRange().text;
}else{
var _6=_1.global.getSelection();
if(_6){
return _6.toString();
}
}
return "";
},getSelectedHtml:function(){
if(_1.isIE<9){
if(_2._editor.selection.getType()=="control"){
return null;
}
return _1.doc.selection.createRange().htmlText;
}else{
var _7=_1.global.getSelection();
if(_7&&_7.rangeCount){
var i;
var _8="";
for(i=0;i<_7.rangeCount;i++){
var _9=_7.getRangeAt(i).cloneContents();
var _a=_1.doc.createElement("div");
_a.appendChild(_9);
_8+=_a.innerHTML;
}
return _8;
}
return null;
}
},getSelectedElement:function(){
if(_2._editor.selection.getType()=="control"){
if(_1.isIE<9){
var _b=_1.doc.selection.createRange();
if(_b&&_b.item){
return _1.doc.selection.createRange().item(0);
}
}else{
var _c=_1.global.getSelection();
return _c.anchorNode.childNodes[_c.anchorOffset];
}
}
return null;
},getParentElement:function(){
if(_2._editor.selection.getType()=="control"){
var p=this.getSelectedElement();
if(p){
return p.parentNode;
}
}else{
if(_1.isIE<9){
var r=_1.doc.selection.createRange();
r.collapse(true);
return r.parentElement();
}else{
var _d=_1.global.getSelection();
if(_d){
var _e=_d.anchorNode;
while(_e&&(_e.nodeType!=1)){
_e=_e.parentNode;
}
return _e;
}
}
}
return null;
},hasAncestorElement:function(_f){
return this.getAncestorElement.apply(this,arguments)!=null;
},getAncestorElement:function(_10){
var _11=this.getSelectedElement()||this.getParentElement();
return this.getParentOfType(_11,arguments);
},isTag:function(_12,_13){
if(_12&&_12.tagName){
var _14=_12.tagName.toLowerCase();
for(var i=0;i<_13.length;i++){
var _15=String(_13[i]).toLowerCase();
if(_14==_15){
return _15;
}
}
}
return "";
},getParentOfType:function(_16,_17){
while(_16){
if(this.isTag(_16,_17).length){
return _16;
}
_16=_16.parentNode;
}
return null;
},collapse:function(_18){
if(window.getSelection){
var _19=_1.global.getSelection();
if(_19.removeAllRanges){
if(_18){
_19.collapseToStart();
}else{
_19.collapseToEnd();
}
}else{
_19.collapse(_18);
}
}else{
if(_1.isIE){
var _1a=_1.doc.selection.createRange();
_1a.collapse(_18);
_1a.select();
}
}
},remove:function(){
var sel=_1.doc.selection;
if(_1.isIE<9){
if(sel.type.toLowerCase()!="none"){
sel.clear();
}
return sel;
}else{
sel=_1.global.getSelection();
sel.deleteFromDocument();
return sel;
}
},selectElementChildren:function(_1b,_1c){
var win=_1.global;
var doc=_1.doc;
var _1d;
_1b=_1.byId(_1b);
if(doc.selection&&_1.isIE<9&&_1.body().createTextRange){
_1d=_1b.ownerDocument.body.createTextRange();
_1d.moveToElementText(_1b);
if(!_1c){
try{
_1d.select();
}
catch(e){
}
}
}else{
if(win.getSelection){
var _1e=_1.global.getSelection();
if(_1.isOpera){
if(_1e.rangeCount){
_1d=_1e.getRangeAt(0);
}else{
_1d=doc.createRange();
}
_1d.setStart(_1b,0);
_1d.setEnd(_1b,(_1b.nodeType==3)?_1b.length:_1b.childNodes.length);
_1e.addRange(_1d);
}else{
_1e.selectAllChildren(_1b);
}
}
}
},selectElement:function(_1f,_20){
var _21;
var doc=_1.doc;
var win=_1.global;
_1f=_1.byId(_1f);
if(_1.isIE<9&&_1.body().createTextRange){
try{
var tg=_1f.tagName?_1f.tagName.toLowerCase():"";
if(tg==="img"||tg==="table"){
_21=_1.body().createControlRange();
}else{
_21=_1.body().createRange();
}
_21.addElement(_1f);
if(!_20){
_21.select();
}
}
catch(e){
this.selectElementChildren(_1f,_20);
}
}else{
if(_1.global.getSelection){
var _22=win.getSelection();
_21=doc.createRange();
if(_22.removeAllRanges){
if(_1.isOpera){
if(_22.getRangeAt(0)){
_21=_22.getRangeAt(0);
}
}
_21.selectNode(_1f);
_22.removeAllRanges();
_22.addRange(_21);
}
}
}
},inSelection:function(_23){
if(_23){
var _24;
var doc=_1.doc;
var _25;
if(_1.global.getSelection){
var sel=_1.global.getSelection();
if(sel&&sel.rangeCount>0){
_25=sel.getRangeAt(0);
}
if(_25&&_25.compareBoundaryPoints&&doc.createRange){
try{
_24=doc.createRange();
_24.setStart(_23,0);
if(_25.compareBoundaryPoints(_25.START_TO_END,_24)===1){
return true;
}
}
catch(e){
}
}
}else{
if(doc.selection){
_25=doc.selection.createRange();
try{
_24=_23.ownerDocument.body.createControlRange();
if(_24){
_24.addElement(_23);
}
}
catch(e1){
try{
_24=_23.ownerDocument.body.createTextRange();
_24.moveToElementText(_23);
}
catch(e2){
}
}
if(_25&&_24){
if(_25.compareEndPoints("EndToStart",_24)===1){
return true;
}
}
}
}
}
return false;
}});
return _2._editor.selection;
});
