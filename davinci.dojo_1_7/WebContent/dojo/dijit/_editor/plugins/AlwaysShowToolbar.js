/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/AlwaysShowToolbar",["dojo/_base/kernel","../..","../_Plugin","dojo/_base/array","dojo/_base/connect","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2){
_1.declare("dijit._editor.plugins.AlwaysShowToolbar",_2._editor._Plugin,{_handleScroll:true,setEditor:function(e){
if(!e.iframe){
return;
}
this.editor=e;
e.onLoadDeferred.addCallback(_1.hitch(this,this.enable));
},enable:function(d){
this._updateHeight();
this.connect(window,"onscroll","globalOnScrollHandler");
this.connect(this.editor,"onNormalizedDisplayChanged","_updateHeight");
return d;
},_updateHeight:function(){
var e=this.editor;
if(!e.isLoaded){
return;
}
if(e.height){
return;
}
var _3=_1._getMarginSize(e.editNode).h;
if(_1.isOpera){
_3=e.editNode.scrollHeight;
}
if(!_3){
_3=_1._getMarginSize(e.document.body).h;
}
if(_3==0){
return;
}
if(_1.isIE<=7&&this.editor.minHeight){
var _4=parseInt(this.editor.minHeight);
if(_3<_4){
_3=_4;
}
}
if(_3!=this._lastHeight){
this._lastHeight=_3;
_1.marginBox(e.iframe,{h:this._lastHeight});
}
},_lastHeight:0,globalOnScrollHandler:function(){
var _5=_1.isIE<7;
if(!this._handleScroll){
return;
}
var _6=this.editor.header;
var db=_1.body;
if(!this._scrollSetUp){
this._scrollSetUp=true;
this._scrollThreshold=_1.position(_6,true).y;
}
var _7=_1._docScroll().y;
var s=_6.style;
if(_7>this._scrollThreshold&&_7<this._scrollThreshold+this._lastHeight){
if(!this._fixEnabled){
var _8=_1._getMarginSize(_6);
this.editor.iframe.style.marginTop=_8.h+"px";
if(_5){
s.left=_1.position(_6).x;
if(_6.previousSibling){
this._IEOriginalPos=["after",_6.previousSibling];
}else{
if(_6.nextSibling){
this._IEOriginalPos=["before",_6.nextSibling];
}else{
this._IEOriginalPos=["last",_6.parentNode];
}
}
_1.body().appendChild(_6);
_1.addClass(_6,"dijitIEFixedToolbar");
}else{
s.position="fixed";
s.top="0px";
}
_1.marginBox(_6,{w:_8.w});
s.zIndex=2000;
this._fixEnabled=true;
}
var _9=(this.height)?parseInt(this.editor.height):this.editor._lastHeight;
s.display=(_7>this._scrollThreshold+_9)?"none":"";
}else{
if(this._fixEnabled){
this.editor.iframe.style.marginTop="";
s.position="";
s.top="";
s.zIndex="";
s.display="";
if(_5){
s.left="";
_1.removeClass(_6,"dijitIEFixedToolbar");
if(this._IEOriginalPos){
_1.place(_6,this._IEOriginalPos[1],this._IEOriginalPos[0]);
this._IEOriginalPos=null;
}else{
_1.place(_6,this.editor.iframe,"before");
}
}
s.width="";
this._fixEnabled=false;
}
}
},destroy:function(){
this._IEOriginalPos=null;
this._handleScroll=false;
_1.forEach(this._connects,_1.disconnect);
if(_1.isIE<7){
_1.removeClass(this.editor.header,"dijitIEFixedToolbar");
}
}});
return _2._editor.plugins.AlwaysShowToolbar;
});
