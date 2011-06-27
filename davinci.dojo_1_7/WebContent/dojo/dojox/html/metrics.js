/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/html/metrics",["dojo/_base/kernel","dojo/_base/window","dojo/_base/lang","dojo/_base/html"],function(_1,_2){
var _3=_1.getObject("html.metrics",true,dojox);
_3.getFontMeasurements=function(){
var _4={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
if(_1.isIE){
_1.doc.documentElement.style.fontSize="100%";
}
var _5=_1.doc.createElement("div");
var ds=_5.style;
ds.position="absolute";
ds.left="-100px";
ds.top="0";
ds.width="30px";
ds.height="1000em";
ds.borderWidth="0";
ds.margin="0";
ds.padding="0";
ds.outline="0";
ds.lineHeight="1";
ds.overflow="hidden";
_1.body().appendChild(_5);
for(var p in _4){
ds.fontSize=p;
_4[p]=Math.round(_5.offsetHeight*12/16)*16/12/1000;
}
_1.body().removeChild(_5);
_5=null;
return _4;
};
var _6=null;
_3.getCachedFontMeasurements=function(_7){
if(_7||!_6){
_6=_3.getFontMeasurements();
}
return _6;
};
var _8=null,_9={};
_3.getTextBox=function(_a,_b,_c){
var m,s;
if(!_8){
m=_8=_1.doc.createElement("div");
var c=_1.doc.createElement("div");
c.appendChild(m);
s=c.style;
s.overflow="scroll";
s.position="absolute";
s.left="0px";
s.top="-10000px";
s.width="1px";
s.height="1px";
s.visibility="hidden";
s.borderWidth="0";
s.margin="0";
s.padding="0";
s.outline="0";
_1.body().appendChild(c);
}else{
m=_8;
}
m.className="";
s=m.style;
s.borderWidth="0";
s.margin="0";
s.padding="0";
s.outline="0";
if(arguments.length>1&&_b){
for(var i in _b){
if(i in _9){
continue;
}
s[i]=_b[i];
}
}
if(arguments.length>2&&_c){
m.className=_c;
}
m.innerHTML=_a;
var _d=_1.position(m);
_d.w=m.parentNode.scrollWidth;
return _d;
};
var _e={w:16,h:16};
_3.getScrollbar=function(){
return {w:_e.w,h:_e.h};
};
_3._fontResizeNode=null;
_3.initOnFontResize=function(_f){
var f=_3._fontResizeNode=_1.doc.createElement("iframe");
var fs=f.style;
fs.position="absolute";
fs.width="5em";
fs.height="10em";
fs.top="-10000px";
if(_1.isIE){
f.onreadystatechange=function(){
if(f.contentWindow.document.readyState=="complete"){
f.onresize=f.contentWindow.parent[dojox._scopeName].html.metrics._fontresize;
}
};
}else{
f.onload=function(){
f.contentWindow.onresize=f.contentWindow.parent[dojox._scopeName].html.metrics._fontresize;
};
}
f.setAttribute("src","javascript:'<html><head><script>if(\"loadFirebugConsole\" in window){window.loadFirebugConsole();}</script></head><body></body></html>'");
_1.body().appendChild(f);
_3.initOnFontResize=function(){
};
};
_3.onFontResize=function(){
};
_3._fontresize=function(){
_3.onFontResize();
};
_1.addOnUnload(function(){
var f=_3._fontResizeNode;
if(f){
if(_1.isIE&&f.onresize){
f.onresize=null;
}else{
if(f.contentWindow&&f.contentWindow.onresize){
f.contentWindow.onresize=null;
}
}
_3._fontResizeNode=null;
}
});
_1.addOnLoad(function(){
try{
var n=_1.doc.createElement("div");
n.style.cssText="top:0;left:0;width:100px;height:100px;overflow:scroll;position:absolute;visibility:hidden;";
_1.body().appendChild(n);
_e.w=n.offsetWidth-n.clientWidth;
_e.h=n.offsetHeight-n.clientHeight;
_1.body().removeChild(n);
delete n;
}
catch(e){
}
if("fontSizeWatch" in _1.config&&!!_1.config.fontSizeWatch){
_3.initOnFontResize();
}
});
return _3;
});
