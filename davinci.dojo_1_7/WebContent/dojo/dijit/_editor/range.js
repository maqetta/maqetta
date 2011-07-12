/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/range",["dojo/_base/kernel","..","dojo/_base/array","dojo/_base/lang","dojo/_base/window"],function(_1,_2){
_2.range={};
_2.range.getIndex=function(_3,_4){
var _5=[],_6=[];
var _7=_4;
var _8=_3;
var _9,n;
while(_3!=_7){
var i=0;
_9=_3.parentNode;
while((n=_9.childNodes[i++])){
if(n===_3){
--i;
break;
}
}
_5.unshift(i);
_6.unshift(i-_9.childNodes.length);
_3=_9;
}
if(_5.length>0&&_8.nodeType==3){
n=_8.previousSibling;
while(n&&n.nodeType==3){
_5[_5.length-1]--;
n=n.previousSibling;
}
n=_8.nextSibling;
while(n&&n.nodeType==3){
_6[_6.length-1]++;
n=n.nextSibling;
}
}
return {o:_5,r:_6};
};
_2.range.getNode=function(_a,_b){
if(!_1.isArray(_a)||_a.length==0){
return _b;
}
var _c=_b;
_1.every(_a,function(i){
if(i>=0&&i<_c.childNodes.length){
_c=_c.childNodes[i];
}else{
_c=null;
return false;
}
return true;
});
return _c;
};
_2.range.getCommonAncestor=function(n1,n2,_d){
_d=_d||n1.ownerDocument.body;
var _e=function(n){
var as=[];
while(n){
as.unshift(n);
if(n!==_d){
n=n.parentNode;
}else{
break;
}
}
return as;
};
var _f=_e(n1);
var _10=_e(n2);
var m=Math.min(_f.length,_10.length);
var com=_f[0];
for(var i=1;i<m;i++){
if(_f[i]===_10[i]){
com=_f[i];
}else{
break;
}
}
return com;
};
_2.range.getAncestor=function(_11,_12,_13){
_13=_13||_11.ownerDocument.body;
while(_11&&_11!==_13){
var _14=_11.nodeName.toUpperCase();
if(_12.test(_14)){
return _11;
}
_11=_11.parentNode;
}
return null;
};
_2.range.BlockTagNames=/^(?:P|DIV|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|OL|UL|LI|DT|DE)$/;
_2.range.getBlockAncestor=function(_15,_16,_17){
_17=_17||_15.ownerDocument.body;
_16=_16||_2.range.BlockTagNames;
var _18=null,_19;
while(_15&&_15!==_17){
var _1a=_15.nodeName.toUpperCase();
if(!_18&&_16.test(_1a)){
_18=_15;
}
if(!_19&&(/^(?:BODY|TD|TH|CAPTION)$/).test(_1a)){
_19=_15;
}
_15=_15.parentNode;
}
return {blockNode:_18,blockContainer:_19||_15.ownerDocument.body};
};
_2.range.atBeginningOfContainer=function(_1b,_1c,_1d){
var _1e=false;
var _1f=(_1d==0);
if(!_1f&&_1c.nodeType==3){
if(/^[\s\xA0]+$/.test(_1c.nodeValue.substr(0,_1d))){
_1f=true;
}
}
if(_1f){
var _20=_1c;
_1e=true;
while(_20&&_20!==_1b){
if(_20.previousSibling){
_1e=false;
break;
}
_20=_20.parentNode;
}
}
return _1e;
};
_2.range.atEndOfContainer=function(_21,_22,_23){
var _24=false;
var _25=(_23==(_22.length||_22.childNodes.length));
if(!_25&&_22.nodeType==3){
if(/^[\s\xA0]+$/.test(_22.nodeValue.substr(_23))){
_25=true;
}
}
if(_25){
var _26=_22;
_24=true;
while(_26&&_26!==_21){
if(_26.nextSibling){
_24=false;
break;
}
_26=_26.parentNode;
}
}
return _24;
};
_2.range.adjacentNoneTextNode=function(_27,_28){
var _29=_27;
var len=(0-_27.length)||0;
var _2a=_28?"nextSibling":"previousSibling";
while(_29){
if(_29.nodeType!=3){
break;
}
len+=_29.length;
_29=_29[_2a];
}
return [_29,len];
};
_2.range._w3c=Boolean(window["getSelection"]);
_2.range.create=function(win){
if(_2.range._w3c){
return (win||_1.global).document.createRange();
}else{
return new _2.range.W3CRange;
}
};
_2.range.getSelection=function(win,_2b){
if(_2.range._w3c){
return win.getSelection();
}else{
var s=new _2.range.ie.selection(win);
if(!_2b){
s._getCurrentSelection();
}
return s;
}
};
if(!_2.range._w3c){
_2.range.ie={cachedSelection:{},selection:function(win){
this._ranges=[];
this.addRange=function(r,_2c){
this._ranges.push(r);
if(!_2c){
r._select();
}
this.rangeCount=this._ranges.length;
};
this.removeAllRanges=function(){
this._ranges=[];
this.rangeCount=0;
};
var _2d=function(){
var r=win.document.selection.createRange();
var _2e=win.document.selection.type.toUpperCase();
if(_2e=="CONTROL"){
return new _2.range.W3CRange(_2.range.ie.decomposeControlRange(r));
}else{
return new _2.range.W3CRange(_2.range.ie.decomposeTextRange(r));
}
};
this.getRangeAt=function(i){
return this._ranges[i];
};
this._getCurrentSelection=function(){
this.removeAllRanges();
var r=_2d();
if(r){
this.addRange(r,true);
this.isCollapsed=r.collapsed;
}else{
this.isCollapsed=true;
}
};
},decomposeControlRange:function(_2f){
var _30=_2f.item(0),_31=_2f.item(_2f.length-1);
var _32=_30.parentNode,_33=_31.parentNode;
var _34=_2.range.getIndex(_30,_32).o;
var _35=_2.range.getIndex(_31,_33).o+1;
return [_32,_34,_33,_35];
},getEndPoint:function(_36,end){
var _37=_36.duplicate();
_37.collapse(!end);
var _38="EndTo"+(end?"End":"Start");
var _39=_37.parentElement();
var _3a,_3b,_3c;
if(_39.childNodes.length>0){
_1.every(_39.childNodes,function(_3d,i){
var _3e;
if(_3d.nodeType!=3){
_37.moveToElementText(_3d);
if(_37.compareEndPoints(_38,_36)>0){
if(_3c&&_3c.nodeType==3){
_3a=_3c;
_3e=true;
}else{
_3a=_39;
_3b=i;
return false;
}
}else{
if(i==_39.childNodes.length-1){
_3a=_39;
_3b=_39.childNodes.length;
return false;
}
}
}else{
if(i==_39.childNodes.length-1){
_3a=_3d;
_3e=true;
}
}
if(_3e&&_3a){
var _3f=_2.range.adjacentNoneTextNode(_3a)[0];
if(_3f){
_3a=_3f.nextSibling;
}else{
_3a=_39.firstChild;
}
var _40=_2.range.adjacentNoneTextNode(_3a);
_3f=_40[0];
var _41=_40[1];
if(_3f){
_37.moveToElementText(_3f);
_37.collapse(false);
}else{
_37.moveToElementText(_39);
}
_37.setEndPoint(_38,_36);
_3b=_37.text.length-_41;
return false;
}
_3c=_3d;
return true;
});
}else{
_3a=_39;
_3b=0;
}
if(!end&&_3a.nodeType==1&&_3b==_3a.childNodes.length){
var _42=_3a.nextSibling;
if(_42&&_42.nodeType==3){
_3a=_42;
_3b=0;
}
}
return [_3a,_3b];
},setEndPoint:function(_43,_44,_45){
var _46=_43.duplicate(),_47,len;
if(_44.nodeType!=3){
if(_45>0){
_47=_44.childNodes[_45-1];
if(_47){
if(_47.nodeType==3){
_44=_47;
_45=_47.length;
}else{
if(_47.nextSibling&&_47.nextSibling.nodeType==3){
_44=_47.nextSibling;
_45=0;
}else{
_46.moveToElementText(_47.nextSibling?_47:_44);
var _48=_47.parentNode;
var _49=_48.insertBefore(_47.ownerDocument.createTextNode(" "),_47.nextSibling);
_46.collapse(false);
_48.removeChild(_49);
}
}
}
}else{
_46.moveToElementText(_44);
_46.collapse(true);
}
}
if(_44.nodeType==3){
var _4a=_2.range.adjacentNoneTextNode(_44);
var _4b=_4a[0];
len=_4a[1];
if(_4b){
_46.moveToElementText(_4b);
_46.collapse(false);
if(_4b.contentEditable!="inherit"){
len++;
}
}else{
_46.moveToElementText(_44.parentNode);
_46.collapse(true);
}
_45+=len;
if(_45>0){
if(_46.move("character",_45)!=_45){
console.error("Error when moving!");
}
}
}
return _46;
},decomposeTextRange:function(_4c){
var _4d=_2.range.ie.getEndPoint(_4c);
var _4e=_4d[0],_4f=_4d[1];
var _50=_4d[0],_51=_4d[1];
if(_4c.htmlText.length){
if(_4c.htmlText==_4c.text){
_51=_4f+_4c.text.length;
}else{
_4d=_2.range.ie.getEndPoint(_4c,true);
_50=_4d[0],_51=_4d[1];
}
}
return [_4e,_4f,_50,_51];
},setRange:function(_52,_53,_54,_55,_56,_57){
var _58=_2.range.ie.setEndPoint(_52,_53,_54);
_52.setEndPoint("StartToStart",_58);
if(!_57){
var end=_2.range.ie.setEndPoint(_52,_55,_56);
}
_52.setEndPoint("EndToEnd",end||_58);
return _52;
}};
_1.declare("dijit.range.W3CRange",null,{constructor:function(){
if(arguments.length>0){
this.setStart(arguments[0][0],arguments[0][1]);
this.setEnd(arguments[0][2],arguments[0][3]);
}else{
this.commonAncestorContainer=null;
this.startContainer=null;
this.startOffset=0;
this.endContainer=null;
this.endOffset=0;
this.collapsed=true;
}
},_updateInternal:function(){
if(this.startContainer!==this.endContainer){
this.commonAncestorContainer=_2.range.getCommonAncestor(this.startContainer,this.endContainer);
}else{
this.commonAncestorContainer=this.startContainer;
}
this.collapsed=(this.startContainer===this.endContainer)&&(this.startOffset==this.endOffset);
},setStart:function(_59,_5a){
_5a=parseInt(_5a);
if(this.startContainer===_59&&this.startOffset==_5a){
return;
}
delete this._cachedBookmark;
this.startContainer=_59;
this.startOffset=_5a;
if(!this.endContainer){
this.setEnd(_59,_5a);
}else{
this._updateInternal();
}
},setEnd:function(_5b,_5c){
_5c=parseInt(_5c);
if(this.endContainer===_5b&&this.endOffset==_5c){
return;
}
delete this._cachedBookmark;
this.endContainer=_5b;
this.endOffset=_5c;
if(!this.startContainer){
this.setStart(_5b,_5c);
}else{
this._updateInternal();
}
},setStartAfter:function(_5d,_5e){
this._setPoint("setStart",_5d,_5e,1);
},setStartBefore:function(_5f,_60){
this._setPoint("setStart",_5f,_60,0);
},setEndAfter:function(_61,_62){
this._setPoint("setEnd",_61,_62,1);
},setEndBefore:function(_63,_64){
this._setPoint("setEnd",_63,_64,0);
},_setPoint:function(_65,_66,_67,ext){
var _68=_2.range.getIndex(_66,_66.parentNode).o;
this[_65](_66.parentNode,_68.pop()+ext);
},_getIERange:function(){
var r=(this._body||this.endContainer.ownerDocument.body).createTextRange();
_2.range.ie.setRange(r,this.startContainer,this.startOffset,this.endContainer,this.endOffset,this.collapsed);
return r;
},getBookmark:function(_69){
this._getIERange();
return this._cachedBookmark;
},_select:function(){
var r=this._getIERange();
r.select();
},deleteContents:function(){
var r=this._getIERange();
r.pasteHTML("");
this.endContainer=this.startContainer;
this.endOffset=this.startOffset;
this.collapsed=true;
},cloneRange:function(){
var r=new _2.range.W3CRange([this.startContainer,this.startOffset,this.endContainer,this.endOffset]);
r._body=this._body;
return r;
},detach:function(){
this._body=null;
this.commonAncestorContainer=null;
this.startContainer=null;
this.startOffset=0;
this.endContainer=null;
this.endOffset=0;
this.collapsed=true;
}});
}
return _2.range;
});
