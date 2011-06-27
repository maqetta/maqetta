/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_base/focus",["dojo/_base/kernel","..","../focus","./manager","dojo/_base/array","dojo/_base/connect","dojo/_base/html","dojo/_base/lang","dojo/_base/window"],function(_1,_2,_3){
_1.mixin(_2,{_curFocus:null,_prevFocus:null,isCollapsed:function(){
return _2.getBookmark().isCollapsed;
},getBookmark:function(){
var bm,rg,tg,_4=_1.doc.selection,cf=_3.curNode;
if(_1.global.getSelection){
_4=_1.global.getSelection();
if(_4){
if(_4.isCollapsed){
tg=cf?cf.tagName:"";
if(tg){
tg=tg.toLowerCase();
if(tg=="textarea"||(tg=="input"&&(!cf.type||cf.type.toLowerCase()=="text"))){
_4={start:cf.selectionStart,end:cf.selectionEnd,node:cf,pRange:true};
return {isCollapsed:(_4.end<=_4.start),mark:_4};
}
}
bm={isCollapsed:true};
if(_4.rangeCount){
bm.mark=_4.getRangeAt(0).cloneRange();
}
}else{
rg=_4.getRangeAt(0);
bm={isCollapsed:false,mark:rg.cloneRange()};
}
}
}else{
if(_4){
tg=cf?cf.tagName:"";
tg=tg.toLowerCase();
if(cf&&tg&&(tg=="button"||tg=="textarea"||tg=="input")){
if(_4.type&&_4.type.toLowerCase()=="none"){
return {isCollapsed:true,mark:null};
}else{
rg=_4.createRange();
return {isCollapsed:rg.text&&rg.text.length?false:true,mark:{range:rg,pRange:true}};
}
}
bm={};
try{
rg=_4.createRange();
bm.isCollapsed=!(_4.type=="Text"?rg.htmlText.length:rg.length);
}
catch(e){
bm.isCollapsed=true;
return bm;
}
if(_4.type.toUpperCase()=="CONTROL"){
if(rg.length){
bm.mark=[];
var i=0,_5=rg.length;
while(i<_5){
bm.mark.push(rg.item(i++));
}
}else{
bm.isCollapsed=true;
bm.mark=null;
}
}else{
bm.mark=rg.getBookmark();
}
}else{
console.warn("No idea how to store the current selection for this browser!");
}
}
return bm;
},moveToBookmark:function(_6){
var _7=_1.doc,_8=_6.mark;
if(_8){
if(_1.global.getSelection){
var _9=_1.global.getSelection();
if(_9&&_9.removeAllRanges){
if(_8.pRange){
var n=_8.node;
n.selectionStart=_8.start;
n.selectionEnd=_8.end;
}else{
_9.removeAllRanges();
_9.addRange(_8);
}
}else{
console.warn("No idea how to restore selection for this browser!");
}
}else{
if(_7.selection&&_8){
var rg;
if(_8.pRange){
rg=_8.range;
}else{
if(_1.isArray(_8)){
rg=_7.body.createControlRange();
_1.forEach(_8,function(n){
rg.addElement(n);
});
}else{
rg=_7.body.createTextRange();
rg.moveToBookmark(_8);
}
}
rg.select();
}
}
}
},getFocus:function(_a,_b){
var _c=!_3.curNode||(_a&&_1.isDescendant(_3.curNode,_a.domNode))?_2._prevFocus:_3.curNode;
return {node:_c,bookmark:_c&&(_c==_3.curNode)&&_1.withGlobal(_b||_1.global,_2.getBookmark),openedForWindow:_b};
},_activeStack:[],registerIframe:function(_d){
return _3.registerIframe(_d);
},unregisterIframe:function(_e){
_3.unregisterIframe(_e);
},registerWin:function(_f,_10){
return _3.registerWin(_f,_10);
},unregisterWin:function(_11){
return _3.unregisterWin(_11);
}});
_3.focus=function(_12){
if(!_12){
return;
}
var _13="node" in _12?_12.node:_12,_14=_12.bookmark,_15=_12.openedForWindow,_16=_14?_14.isCollapsed:false;
if(_13){
var _17=(_13.tagName.toLowerCase()=="iframe")?_13.contentWindow:_13;
if(_17&&_17.focus){
try{
_17.focus();
}
catch(e){
}
}
_3._onFocusNode(_13);
}
if(_14&&_1.withGlobal(_15||_1.global,_2.isCollapsed)&&!_16){
if(_15){
_15.focus();
}
try{
_1.withGlobal(_15||_1.global,_2.moveToBookmark,null,[_14]);
}
catch(e2){
}
}
};
_3.watch("curNode",function(_18,_19,_1a){
_2._curFocus=_1a;
_2._prevFocus=_19;
if(_1a){
_1.publish("focusNode",[_1a]);
}
});
_3.watch("activeStack",function(_1b,_1c,_1d){
_2._activeStack=_1d;
});
_3.on("widget-blur",function(_1e,by){
_1.publish("widgetBlur",[_1e,by]);
});
_3.on("widget-focus",function(_1f,by){
_1.publish("widgetFocus",[_1f,by]);
});
return _2;
});
