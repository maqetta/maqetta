/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/ViewSource",["dojo/_base/kernel","../..","../../focus","dojo/window","dojo/i18n","../_Plugin","../../form/ToggleButton","dojo/i18n!../nls/commands","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2){
_1.declare("dijit._editor.plugins.ViewSource",_2._editor._Plugin,{stripScripts:true,stripComments:true,stripIFrames:true,readOnly:false,_fsPlugin:null,toggle:function(){
if(_1.isWebKit){
this._vsFocused=true;
}
this.button.set("checked",!this.button.get("checked"));
},_initButton:function(){
var _3=_1.i18n.getLocalization("dijit._editor","commands"),_4=this.editor;
this.button=new _2.form.ToggleButton({label:_3["viewSource"],dir:_4.dir,lang:_4.lang,showLabel:false,iconClass:this.iconClassPrefix+" "+this.iconClassPrefix+"ViewSource",tabIndex:"-1",onChange:_1.hitch(this,"_showSource")});
if(_1.isIE==7){
this._ieFixNode=_1.create("div",{style:{opacity:"0",zIndex:"-1000",position:"absolute",top:"-1000px"}},_1.body());
}
this.button.set("readOnly",false);
},setEditor:function(_5){
this.editor=_5;
this._initButton();
this.editor.addKeyHandler(_1.keys.F12,true,true,_1.hitch(this,function(e){
this.button.focus();
this.toggle();
_1.stopEvent(e);
setTimeout(_1.hitch(this,function(){
this.editor.focus();
}),100);
}));
},_showSource:function(_6){
var ed=this.editor;
var _7=ed._plugins;
var _8;
this._sourceShown=_6;
var _9=this;
try{
if(!this.sourceArea){
this._createSourceView();
}
if(_6){
ed._sourceQueryCommandEnabled=ed.queryCommandEnabled;
ed.queryCommandEnabled=function(_a){
return _a.toLowerCase()==="viewsource";
};
this.editor.onDisplayChanged();
_8=ed.get("value");
_8=this._filter(_8);
ed.set("value",_8);
this._pluginList=[];
_1.forEach(_7,function(p){
if(!(p instanceof _2._editor.plugins.ViewSource)){
p.set("disabled",true);
}
});
if(this._fsPlugin){
this._fsPlugin._getAltViewNode=function(){
return _9.sourceArea;
};
}
this.sourceArea.value=_8;
this.sourceArea.style.height=ed.iframe.style.height;
this.sourceArea.style.width=ed.iframe.style.width;
_1.style(ed.iframe,"display","none");
_1.style(this.sourceArea,{display:"block"});
var _b=function(){
var vp=_1.window.getBox();
if("_prevW" in this&&"_prevH" in this){
if(vp.w===this._prevW&&vp.h===this._prevH){
return;
}else{
this._prevW=vp.w;
this._prevH=vp.h;
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
this._resize();
}),10);
};
this._resizeHandle=_1.connect(window,"onresize",this,_b);
setTimeout(_1.hitch(this,this._resize),100);
this.editor.onNormalizedDisplayChanged();
this.editor.__oldGetValue=this.editor.getValue;
this.editor.getValue=_1.hitch(this,function(){
var _c=this.sourceArea.value;
_c=this._filter(_c);
return _c;
});
}else{
if(!ed._sourceQueryCommandEnabled){
return;
}
_1.disconnect(this._resizeHandle);
delete this._resizeHandle;
if(this.editor.__oldGetValue){
this.editor.getValue=this.editor.__oldGetValue;
delete this.editor.__oldGetValue;
}
ed.queryCommandEnabled=ed._sourceQueryCommandEnabled;
if(!this._readOnly){
_8=this.sourceArea.value;
_8=this._filter(_8);
ed.beginEditing();
ed.set("value",_8);
ed.endEditing();
}
_1.forEach(_7,function(p){
p.set("disabled",false);
});
_1.style(this.sourceArea,"display","none");
_1.style(ed.iframe,"display","block");
delete ed._sourceQueryCommandEnabled;
this.editor.onDisplayChanged();
}
setTimeout(_1.hitch(this,function(){
var _d=ed.domNode.parentNode;
if(_d){
var _e=_2.getEnclosingWidget(_d);
if(_e&&_e.resize){
_e.resize();
}
}
ed.resize();
}),300);
}
catch(e){
}
},updateState:function(){
this.button.set("disabled",this.get("disabled"));
},_resize:function(){
var ed=this.editor;
var _f=ed.getHeaderHeight();
var fH=ed.getFooterHeight();
var eb=_1.position(ed.domNode);
var _10=_1._getPadBorderExtents(ed.iframe.parentNode);
var _11=_1._getMarginExtents(ed.iframe.parentNode);
var _12=_1._getPadBorderExtents(ed.domNode);
var edb={w:eb.w-_12.w,h:eb.h-(_f+_12.h+ +fH)};
if(this._fsPlugin&&this._fsPlugin.isFullscreen){
var vp=_1.window.getBox();
edb.w=(vp.w-_12.w);
edb.h=(vp.h-(_f+_12.h+fH));
}
if(_1.isIE){
edb.h-=2;
}
if(this._ieFixNode){
var _13=-this._ieFixNode.offsetTop/1000;
edb.w=Math.floor((edb.w+0.9)/_13);
edb.h=Math.floor((edb.h+0.9)/_13);
}
_1.marginBox(this.sourceArea,{w:edb.w-(_10.w+_11.w),h:edb.h-(_10.h+_11.h)});
_1.marginBox(ed.iframe.parentNode,{h:edb.h});
},_createSourceView:function(){
var ed=this.editor;
var _14=ed._plugins;
this.sourceArea=_1.create("textarea");
if(this.readOnly){
_1.attr(this.sourceArea,"readOnly",true);
this._readOnly=true;
}
_1.style(this.sourceArea,{padding:"0px",margin:"0px",borderWidth:"0px",borderStyle:"none"});
_1.place(this.sourceArea,ed.iframe,"before");
if(_1.isIE&&ed.iframe.parentNode.lastChild!==ed.iframe){
_1.style(ed.iframe.parentNode.lastChild,{width:"0px",height:"0px",padding:"0px",margin:"0px",borderWidth:"0px",borderStyle:"none"});
}
ed._viewsource_oldFocus=ed.focus;
var _15=this;
ed.focus=function(){
if(_15._sourceShown){
_15.setSourceAreaCaret();
}else{
try{
if(this._vsFocused){
delete this._vsFocused;
_2.focus(ed.editNode);
}else{
ed._viewsource_oldFocus();
}
}
catch(e){
}
}
};
var i,p;
for(i=0;i<_14.length;i++){
p=_14[i];
if(p&&(p.declaredClass==="dijit._editor.plugins.FullScreen"||p.declaredClass===(_2._scopeName+"._editor.plugins.FullScreen"))){
this._fsPlugin=p;
break;
}
}
if(this._fsPlugin){
this._fsPlugin._viewsource_getAltViewNode=this._fsPlugin._getAltViewNode;
this._fsPlugin._getAltViewNode=function(){
return _15._sourceShown?_15.sourceArea:this._viewsource_getAltViewNode();
};
}
this.connect(this.sourceArea,"onkeydown",_1.hitch(this,function(e){
if(this._sourceShown&&e.keyCode==_1.keys.F12&&e.ctrlKey&&e.shiftKey){
this.button.focus();
this.button.set("checked",false);
setTimeout(_1.hitch(this,function(){
ed.focus();
}),100);
_1.stopEvent(e);
}
}));
},_stripScripts:function(_16){
if(_16){
_16=_16.replace(/<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>/ig,"");
_16=_16.replace(/<\s*script\b([^<>]|\s)*>?/ig,"");
_16=_16.replace(/<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>/ig,"");
}
return _16;
},_stripComments:function(_17){
if(_17){
_17=_17.replace(/<!--(.|\s){1,}?-->/g,"");
}
return _17;
},_stripIFrames:function(_18){
if(_18){
_18=_18.replace(/<\s*iframe[^>]*>((.|\s)*?)<\\?\/\s*iframe\s*>/ig,"");
}
return _18;
},_filter:function(_19){
if(_19){
if(this.stripScripts){
_19=this._stripScripts(_19);
}
if(this.stripComments){
_19=this._stripComments(_19);
}
if(this.stripIFrames){
_19=this._stripIFrames(_19);
}
}
return _19;
},setSourceAreaCaret:function(){
var win=_1.global;
var _1a=this.sourceArea;
_2.focus(_1a);
if(this._sourceShown&&!this.readOnly){
if(_1.isIE){
if(this.sourceArea.createTextRange){
var _1b=_1a.createTextRange();
_1b.collapse(true);
_1b.moveStart("character",-99999);
_1b.moveStart("character",0);
_1b.moveEnd("character",0);
_1b.select();
}
}else{
if(win.getSelection){
if(_1a.setSelectionRange){
_1a.setSelectionRange(0,0);
}
}
}
}
},destroy:function(){
if(this._ieFixNode){
_1.body().removeChild(this._ieFixNode);
}
if(this._resizer){
clearTimeout(this._resizer);
delete this._resizer;
}
if(this._resizeHandle){
_1.disconnect(this._resizeHandle);
delete this._resizeHandle;
}
this.inherited(arguments);
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
var _1c=o.args.name.toLowerCase();
if(_1c==="viewsource"){
o.plugin=new _2._editor.plugins.ViewSource({readOnly:("readOnly" in o.args)?o.args.readOnly:false,stripComments:("stripComments" in o.args)?o.args.stripComments:true,stripScripts:("stripScripts" in o.args)?o.args.stripScripts:true,stripIFrames:("stripIFrames" in o.args)?o.args.stripIFrames:true});
}
});
return _2._editor.plugins.ViewSource;
});
