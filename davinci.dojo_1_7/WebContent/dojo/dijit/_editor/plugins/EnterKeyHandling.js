/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/EnterKeyHandling",["dojo/_base/kernel","../..","dojo/window","../_Plugin","../range","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2){
_1.declare("dijit._editor.plugins.EnterKeyHandling",_2._editor._Plugin,{blockNodeForEnter:"BR",constructor:function(_3){
if(_3){
if("blockNodeForEnter" in _3){
_3.blockNodeForEnter=_3.blockNodeForEnter.toUpperCase();
}
_1.mixin(this,_3);
}
},setEditor:function(_4){
if(this.editor===_4){
return;
}
this.editor=_4;
if(this.blockNodeForEnter=="BR"){
this.editor.customUndo=true;
_4.onLoadDeferred.addCallback(_1.hitch(this,function(d){
this.connect(_4.document,"onkeypress",function(e){
if(e.charOrCode==_1.keys.ENTER){
var ne=_1.mixin({},e);
ne.shiftKey=true;
if(!this.handleEnterKey(ne)){
_1.stopEvent(e);
}
}
});
return d;
}));
}else{
if(this.blockNodeForEnter){
var h=_1.hitch(this,this.handleEnterKey);
_4.addKeyHandler(13,0,0,h);
_4.addKeyHandler(13,0,1,h);
this.connect(this.editor,"onKeyPressed","onKeyPressed");
}
}
},onKeyPressed:function(e){
if(this._checkListLater){
if(_1.withGlobal(this.editor.window,"isCollapsed",_2)){
var _5=_1.withGlobal(this.editor.window,"getAncestorElement",_2._editor.selection,["LI"]);
if(!_5){
_2._editor.RichText.prototype.execCommand.call(this.editor,"formatblock",this.blockNodeForEnter);
var _6=_1.withGlobal(this.editor.window,"getAncestorElement",_2._editor.selection,[this.blockNodeForEnter]);
if(_6){
_6.innerHTML=this.bogusHtmlContent;
if(_1.isIE){
var r=this.editor.document.selection.createRange();
r.move("character",-1);
r.select();
}
}else{
console.error("onKeyPressed: Cannot find the new block node");
}
}else{
if(_1.isMoz){
if(_5.parentNode.parentNode.nodeName=="LI"){
_5=_5.parentNode.parentNode;
}
}
var fc=_5.firstChild;
if(fc&&fc.nodeType==1&&(fc.nodeName=="UL"||fc.nodeName=="OL")){
_5.insertBefore(fc.ownerDocument.createTextNode(" "),fc);
var _7=_2.range.create(this.editor.window);
_7.setStart(_5.firstChild,0);
var _8=_2.range.getSelection(this.editor.window,true);
_8.removeAllRanges();
_8.addRange(_7);
}
}
}
this._checkListLater=false;
}
if(this._pressedEnterInBlock){
if(this._pressedEnterInBlock.previousSibling){
this.removeTrailingBr(this._pressedEnterInBlock.previousSibling);
}
delete this._pressedEnterInBlock;
}
},bogusHtmlContent:"&nbsp;",blockNodes:/^(?:P|H1|H2|H3|H4|H5|H6|LI)$/,handleEnterKey:function(e){
var _9,_a,_b,_c,_d,_e,_f=this.editor.document,br,rs,txt;
if(e.shiftKey){
var _10=_1.withGlobal(this.editor.window,"getParentElement",_2._editor.selection);
var _11=_2.range.getAncestor(_10,this.blockNodes);
if(_11){
if(_11.tagName=="LI"){
return true;
}
_9=_2.range.getSelection(this.editor.window);
_a=_9.getRangeAt(0);
if(!_a.collapsed){
_a.deleteContents();
_9=_2.range.getSelection(this.editor.window);
_a=_9.getRangeAt(0);
}
if(_2.range.atBeginningOfContainer(_11,_a.startContainer,_a.startOffset)){
br=_f.createElement("br");
_b=_2.range.create(this.editor.window);
_11.insertBefore(br,_11.firstChild);
_b.setStartBefore(br.nextSibling);
_9.removeAllRanges();
_9.addRange(_b);
}else{
if(_2.range.atEndOfContainer(_11,_a.startContainer,_a.startOffset)){
_b=_2.range.create(this.editor.window);
br=_f.createElement("br");
_11.appendChild(br);
_11.appendChild(_f.createTextNode(" "));
_b.setStart(_11.lastChild,0);
_9.removeAllRanges();
_9.addRange(_b);
}else{
rs=_a.startContainer;
if(rs&&rs.nodeType==3){
txt=rs.nodeValue;
_1.withGlobal(this.editor.window,function(){
_c=_f.createTextNode(txt.substring(0,_a.startOffset));
_d=_f.createTextNode(txt.substring(_a.startOffset));
_e=_f.createElement("br");
if(_d.nodeValue==""&&_1.isWebKit){
_d=_f.createTextNode(" ");
}
_1.place(_c,rs,"after");
_1.place(_e,_c,"after");
_1.place(_d,_e,"after");
_1.destroy(rs);
_b=_2.range.create(_1.gobal);
_b.setStart(_d,0);
_9.removeAllRanges();
_9.addRange(_b);
});
return false;
}
return true;
}
}
}else{
_9=_2.range.getSelection(this.editor.window);
if(_9.rangeCount){
_a=_9.getRangeAt(0);
if(_a&&_a.startContainer){
if(!_a.collapsed){
_a.deleteContents();
_9=_2.range.getSelection(this.editor.window);
_a=_9.getRangeAt(0);
}
rs=_a.startContainer;
if(rs&&rs.nodeType==3){
_1.withGlobal(this.editor.window,_1.hitch(this,function(){
var _12=false;
var _13=_a.startOffset;
if(rs.length<_13){
ret=this._adjustNodeAndOffset(rs,_13);
rs=ret.node;
_13=ret.offset;
}
txt=rs.nodeValue;
_c=_f.createTextNode(txt.substring(0,_13));
_d=_f.createTextNode(txt.substring(_13));
_e=_f.createElement("br");
if(!_d.length){
_d=_f.createTextNode(" ");
_12=true;
}
if(_c.length){
_1.place(_c,rs,"after");
}else{
_c=rs;
}
_1.place(_e,_c,"after");
_1.place(_d,_e,"after");
_1.destroy(rs);
_b=_2.range.create(_1.gobal);
_b.setStart(_d,0);
_b.setEnd(_d,_d.length);
_9.removeAllRanges();
_9.addRange(_b);
if(_12&&!_1.isWebKit){
_2._editor.selection.remove();
}else{
_2._editor.selection.collapse(true);
}
}));
}else{
var _14;
if(_a.startOffset>=0){
_14=rs.childNodes[_a.startOffset];
}
_1.withGlobal(this.editor.window,_1.hitch(this,function(){
var _15=_f.createElement("br");
var _16=_f.createTextNode(" ");
if(!_14){
rs.appendChild(_15);
rs.appendChild(_16);
}else{
_1.place(_15,_14,"before");
_1.place(_16,_15,"after");
}
_b=_2.range.create(_1.global);
_b.setStart(_16,0);
_b.setEnd(_16,_16.length);
_9.removeAllRanges();
_9.addRange(_b);
_2._editor.selection.collapse(true);
}));
}
}
}else{
_2._editor.RichText.prototype.execCommand.call(this.editor,"inserthtml","<br>");
}
}
return false;
}
var _17=true;
_9=_2.range.getSelection(this.editor.window);
_a=_9.getRangeAt(0);
if(!_a.collapsed){
_a.deleteContents();
_9=_2.range.getSelection(this.editor.window);
_a=_9.getRangeAt(0);
}
var _18=_2.range.getBlockAncestor(_a.endContainer,null,this.editor.editNode);
var _19=_18.blockNode;
if((this._checkListLater=(_19&&(_19.nodeName=="LI"||_19.parentNode.nodeName=="LI")))){
if(_1.isMoz){
this._pressedEnterInBlock=_19;
}
if(/^(\s|&nbsp;|\xA0|<span\b[^>]*\bclass=['"]Apple-style-span['"][^>]*>(\s|&nbsp;|\xA0)<\/span>)?(<br>)?$/.test(_19.innerHTML)){
_19.innerHTML="";
if(_1.isWebKit){
_b=_2.range.create(this.editor.window);
_b.setStart(_19,0);
_9.removeAllRanges();
_9.addRange(_b);
}
this._checkListLater=false;
}
return true;
}
if(!_18.blockNode||_18.blockNode===this.editor.editNode){
try{
_2._editor.RichText.prototype.execCommand.call(this.editor,"formatblock",this.blockNodeForEnter);
}
catch(e2){
}
_18={blockNode:_1.withGlobal(this.editor.window,"getAncestorElement",_2._editor.selection,[this.blockNodeForEnter]),blockContainer:this.editor.editNode};
if(_18.blockNode){
if(_18.blockNode!=this.editor.editNode&&(!(_18.blockNode.textContent||_18.blockNode.innerHTML).replace(/^\s+|\s+$/g,"").length)){
this.removeTrailingBr(_18.blockNode);
return false;
}
}else{
_18.blockNode=this.editor.editNode;
}
_9=_2.range.getSelection(this.editor.window);
_a=_9.getRangeAt(0);
}
var _1a=_f.createElement(this.blockNodeForEnter);
_1a.innerHTML=this.bogusHtmlContent;
this.removeTrailingBr(_18.blockNode);
var _1b=_a.endOffset;
var _1c=_a.endContainer;
if(_1c.length<_1b){
var ret=this._adjustNodeAndOffset(_1c,_1b);
_1c=ret.node;
_1b=ret.offset;
}
if(_2.range.atEndOfContainer(_18.blockNode,_1c,_1b)){
if(_18.blockNode===_18.blockContainer){
_18.blockNode.appendChild(_1a);
}else{
_1.place(_1a,_18.blockNode,"after");
}
_17=false;
_b=_2.range.create(this.editor.window);
_b.setStart(_1a,0);
_9.removeAllRanges();
_9.addRange(_b);
if(this.editor.height){
_1.window.scrollIntoView(_1a);
}
}else{
if(_2.range.atBeginningOfContainer(_18.blockNode,_a.startContainer,_a.startOffset)){
_1.place(_1a,_18.blockNode,_18.blockNode===_18.blockContainer?"first":"before");
if(_1a.nextSibling&&this.editor.height){
_b=_2.range.create(this.editor.window);
_b.setStart(_1a.nextSibling,0);
_9.removeAllRanges();
_9.addRange(_b);
_1.window.scrollIntoView(_1a.nextSibling);
}
_17=false;
}else{
if(_18.blockNode===_18.blockContainer){
_18.blockNode.appendChild(_1a);
}else{
_1.place(_1a,_18.blockNode,"after");
}
_17=false;
if(_18.blockNode.style){
if(_1a.style){
if(_18.blockNode.style.cssText){
_1a.style.cssText=_18.blockNode.style.cssText;
}
}
}
rs=_a.startContainer;
var _1d;
if(rs&&rs.nodeType==3){
var _1e,_1f;
_1b=_a.endOffset;
if(rs.length<_1b){
ret=this._adjustNodeAndOffset(rs,_1b);
rs=ret.node;
_1b=ret.offset;
}
txt=rs.nodeValue;
_c=_f.createTextNode(txt.substring(0,_1b));
_d=_f.createTextNode(txt.substring(_1b,txt.length));
_1.place(_c,rs,"before");
_1.place(_d,rs,"after");
_1.destroy(rs);
var _20=_c.parentNode;
while(_20!==_18.blockNode){
var tg=_20.tagName;
var _21=_f.createElement(tg);
if(_20.style){
if(_21.style){
if(_20.style.cssText){
_21.style.cssText=_20.style.cssText;
}
}
}
if(_20.tagName==="FONT"){
if(_20.color){
_21.color=_20.color;
}
if(_20.face){
_21.face=_20.face;
}
if(_20.size){
_21.size=_20.size;
}
}
_1e=_d;
while(_1e){
_1f=_1e.nextSibling;
_21.appendChild(_1e);
_1e=_1f;
}
_1.place(_21,_20,"after");
_c=_20;
_d=_21;
_20=_20.parentNode;
}
_1e=_d;
if(_1e.nodeType==1||(_1e.nodeType==3&&_1e.nodeValue)){
_1a.innerHTML="";
}
_1d=_1e;
while(_1e){
_1f=_1e.nextSibling;
_1a.appendChild(_1e);
_1e=_1f;
}
}
_b=_2.range.create(this.editor.window);
var _22;
var _23=_1d;
if(this.blockNodeForEnter!=="BR"){
while(_23){
_22=_23;
_1f=_23.firstChild;
_23=_1f;
}
if(_22&&_22.parentNode){
_1a=_22.parentNode;
_b.setStart(_1a,0);
_9.removeAllRanges();
_9.addRange(_b);
if(this.editor.height){
_1.window.scrollIntoView(_1a);
}
if(_1.isMoz){
this._pressedEnterInBlock=_18.blockNode;
}
}else{
_17=true;
}
}else{
_b.setStart(_1a,0);
_9.removeAllRanges();
_9.addRange(_b);
if(this.editor.height){
_1.window.scrollIntoView(_1a);
}
if(_1.isMoz){
this._pressedEnterInBlock=_18.blockNode;
}
}
}
}
return _17;
},_adjustNodeAndOffset:function(_24,_25){
while(_24.length<_25&&_24.nextSibling&&_24.nextSibling.nodeType==3){
_25=_25-_24.length;
_24=_24.nextSibling;
}
return {"node":_24,"offset":_25};
},removeTrailingBr:function(_26){
var _27=/P|DIV|LI/i.test(_26.tagName)?_26:_2._editor.selection.getParentOfType(_26,["P","DIV","LI"]);
if(!_27){
return;
}
if(_27.lastChild){
if((_27.childNodes.length>1&&_27.lastChild.nodeType==3&&/^[\s\xAD]*$/.test(_27.lastChild.nodeValue))||_27.lastChild.tagName=="BR"){
_1.destroy(_27.lastChild);
}
}
if(!_27.childNodes.length){
_27.innerHTML=this.bogusHtmlContent;
}
}});
return _2._editor.plugins.EnterKeyHandling;
});
