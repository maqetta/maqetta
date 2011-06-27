/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/FullScreen",["dojo/_base/kernel","../..","../../focus","../../_base/focus","dojo/window","dojo/i18n","../_Plugin","../../form/ToggleButton","dojo/i18n!../nls/commands","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2){
_1.declare("dijit._editor.plugins.FullScreen",_2._editor._Plugin,{zIndex:500,_origState:null,_origiFrameState:null,_resizeHandle:null,isFullscreen:false,toggle:function(){
this.button.set("checked",!this.button.get("checked"));
},_initButton:function(){
var _3=_1.i18n.getLocalization("dijit._editor","commands"),_4=this.editor;
this.button=new _2.form.ToggleButton({label:_3["fullScreen"],dir:_4.dir,lang:_4.lang,showLabel:false,iconClass:this.iconClassPrefix+" "+this.iconClassPrefix+"FullScreen",tabIndex:"-1",onChange:_1.hitch(this,"_setFullScreen")});
},setEditor:function(_5){
this.editor=_5;
this._initButton();
this.editor.addKeyHandler(_1.keys.F11,true,true,_1.hitch(this,function(e){
this.toggle();
_1.stopEvent(e);
setTimeout(_1.hitch(this,function(){
this.editor.focus();
}),250);
return true;
}));
this.connect(this.editor.domNode,"onkeydown","_containFocus");
},_containFocus:function(e){
if(this.isFullscreen){
var ed=this.editor;
if(!ed.isTabIndent&&ed._fullscreen_oldOnKeyDown&&e.keyCode===_1.keys.TAB){
var f=_2.getFocus();
var _6=this._getAltViewNode();
if(f.node==ed.iframe||(_6&&f.node===_6)){
setTimeout(_1.hitch(this,function(){
ed.toolbar.focus();
}),10);
}else{
if(_6&&_1.style(ed.iframe,"display")==="none"){
setTimeout(_1.hitch(this,function(){
_2.focus(_6);
}),10);
}else{
setTimeout(_1.hitch(this,function(){
ed.focus();
}),10);
}
}
_1.stopEvent(e);
}else{
if(ed._fullscreen_oldOnKeyDown){
ed._fullscreen_oldOnKeyDown(e);
}
}
}
},_resizeEditor:function(){
var vp=_1.window.getBox();
_1.marginBox(this.editor.domNode,{w:vp.w,h:vp.h});
var _7=this.editor.getHeaderHeight();
var _8=this.editor.getFooterHeight();
var _9=_1._getPadBorderExtents(this.editor.domNode);
var _a=_1._getPadBorderExtents(this.editor.iframe.parentNode);
var _b=_1._getMarginExtents(this.editor.iframe.parentNode);
var _c=vp.h-(_7+_9.h+_8);
_1.marginBox(this.editor.iframe.parentNode,{h:_c,w:vp.w});
_1.marginBox(this.editor.iframe,{h:_c-(_a.h+_b.h)});
},_getAltViewNode:function(){
},_setFullScreen:function(_d){
var vp=_1.window.getBox();
var ed=this.editor;
var _e=_1.body();
var _f=ed.domNode.parentNode;
this.isFullscreen=_d;
if(_d){
while(_f&&_f!==_1.body()){
_1.addClass(_f,"dijitForceStatic");
_f=_f.parentNode;
}
this._editorResizeHolder=this.editor.resize;
ed.resize=function(){
};
ed._fullscreen_oldOnKeyDown=ed.onKeyDown;
ed.onKeyDown=_1.hitch(this,this._containFocus);
this._origState={};
this._origiFrameState={};
var _10=ed.domNode,_11=_10&&_10.style||{};
this._origState={width:_11.width||"",height:_11.height||"",top:_1.style(_10,"top")||"",left:_1.style(_10,"left")||"",position:_1.style(_10,"position")||"static",marginBox:_1.marginBox(ed.domNode)};
var _12=ed.iframe,_13=_12&&_12.style||{};
var bc=_1.style(ed.iframe,"backgroundColor");
this._origiFrameState={backgroundColor:bc||"transparent",width:_13.width||"auto",height:_13.height||"auto",zIndex:_13.zIndex||""};
_1.style(ed.domNode,{position:"absolute",top:"0px",left:"0px",zIndex:this.zIndex,width:vp.w+"px",height:vp.h+"px"});
_1.style(ed.iframe,{height:"100%",width:"100%",zIndex:this.zIndex,backgroundColor:bc!=="transparent"&&bc!=="rgba(0, 0, 0, 0)"?bc:"white"});
_1.style(ed.iframe.parentNode,{height:"95%",width:"100%"});
if(_e.style&&_e.style.overflow){
this._oldOverflow=_1.style(_e,"overflow");
}else{
this._oldOverflow="";
}
if(_1.isIE&&!_1.isQuirks){
if(_e.parentNode&&_e.parentNode.style&&_e.parentNode.style.overflow){
this._oldBodyParentOverflow=_e.parentNode.style.overflow;
}else{
try{
this._oldBodyParentOverflow=_1.style(_e.parentNode,"overflow");
}
catch(e){
this._oldBodyParentOverflow="scroll";
}
}
_1.style(_e.parentNode,"overflow","hidden");
}
_1.style(_e,"overflow","hidden");
var _14=function(){
var vp=_1.window.getBox();
if("_prevW" in this&&"_prevH" in this){
if(vp.w===this._prevW&&vp.h===this._prevH){
return;
}
}else{
this._prevW=vp.w;
this._prevH=vp.h;
}
if(this._resizer){
clearTimeout(this._resizer);
delete this._resizer;
}
this._resizer=setTimeout(_1.hitch(this,function(){
delete this._resizer;
this._resizeEditor();
}),10);
};
this._resizeHandle=_1.connect(window,"onresize",this,_14);
this._resizeHandle2=_1.connect(ed,"resize",_1.hitch(this,function(){
if(this._resizer){
clearTimeout(this._resizer);
delete this._resizer;
}
this._resizer=setTimeout(_1.hitch(this,function(){
delete this._resizer;
this._resizeEditor();
}),10);
}));
this._resizeEditor();
var dn=this.editor.toolbar.domNode;
setTimeout(function(){
_1.window.scrollIntoView(dn);
},250);
}else{
if(this._resizeHandle){
_1.disconnect(this._resizeHandle);
this._resizeHandle=null;
}
if(this._resizeHandle2){
_1.disconnect(this._resizeHandle2);
this._resizeHandle2=null;
}
if(this._rst){
clearTimeout(this._rst);
this._rst=null;
}
while(_f&&_f!==_1.body()){
_1.removeClass(_f,"dijitForceStatic");
_f=_f.parentNode;
}
if(this._editorResizeHolder){
this.editor.resize=this._editorResizeHolder;
}
if(!this._origState&&!this._origiFrameState){
return;
}
if(ed._fullscreen_oldOnKeyDown){
ed.onKeyDown=ed._fullscreen_oldOnKeyDown;
delete ed._fullscreen_oldOnKeyDown;
}
var _15=this;
setTimeout(function(){
var mb=_15._origState.marginBox;
var oh=_15._origState.height;
if(_1.isIE&&!_1.isQuirks){
_e.parentNode.style.overflow=_15._oldBodyParentOverflow;
delete _15._oldBodyParentOverflow;
}
_1.style(_e,"overflow",_15._oldOverflow);
delete _15._oldOverflow;
_1.style(ed.domNode,_15._origState);
_1.style(ed.iframe.parentNode,{height:"",width:""});
_1.style(ed.iframe,_15._origiFrameState);
delete _15._origState;
delete _15._origiFrameState;
var _16=_2.getEnclosingWidget(ed.domNode.parentNode);
if(_16&&_16.resize){
_16.resize();
}else{
if(!oh||oh.indexOf("%")<0){
setTimeout(_1.hitch(this,function(){
ed.resize({h:mb.h});
}),0);
}
}
_1.window.scrollIntoView(_15.editor.toolbar.domNode);
},100);
}
},updateState:function(){
this.button.set("disabled",this.get("disabled"));
},destroy:function(){
if(this._resizeHandle){
_1.disconnect(this._resizeHandle);
this._resizeHandle=null;
}
if(this._resizeHandle2){
_1.disconnect(this._resizeHandle2);
this._resizeHandle2=null;
}
if(this._resizer){
clearTimeout(this._resizer);
this._resizer=null;
}
this.inherited(arguments);
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
var _17=o.args.name.toLowerCase();
if(_17==="fullscreen"){
o.plugin=new _2._editor.plugins.FullScreen({zIndex:("zIndex" in o.args)?o.args.zIndex:500});
}
});
return _2._editor.plugins.FullScreen;
});
