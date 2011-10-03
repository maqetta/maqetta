//>>built
define("dojox/html/metrics",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/sniff","dojo/_base/unload","dojo/_base/window","dojo/dom-geometry"],function(_1,_2,_3,_4,_5,_6){
var _7=_2.getObject("dojox.html.metrics",true);
var _8=_2.getObject("dojox");
_7.getFontMeasurements=function(){
var _9={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
if(_3("ie")){
_5.doc.documentElement.style.fontSize="100%";
}
var _a=_5.doc.createElement("div");
var ds=_a.style;
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
_5.body().appendChild(_a);
for(var p in _9){
ds.fontSize=p;
_9[p]=Math.round(_a.offsetHeight*12/16)*16/12/1000;
}
_5.body().removeChild(_a);
_a=null;
return _9;
};
var _b=null;
_7.getCachedFontMeasurements=function(_c){
if(_c||!_b){
_b=_7.getFontMeasurements();
}
return _b;
};
var _d=null,_e={};
_7.getTextBox=function(_f,_10,_11){
var m,s;
if(!_d){
m=_d=_5.doc.createElement("div");
var c=_5.doc.createElement("div");
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
_5.body().appendChild(c);
}else{
m=_d;
}
m.className="";
s=m.style;
s.borderWidth="0";
s.margin="0";
s.padding="0";
s.outline="0";
if(arguments.length>1&&_10){
for(var i in _10){
if(i in _e){
continue;
}
s[i]=_10[i];
}
}
if(arguments.length>2&&_11){
m.className=_11;
}
m.innerHTML=_f;
var box=_6.position(m);
box.w=m.parentNode.scrollWidth;
return box;
};
var _12={w:16,h:16};
_7.getScrollbar=function(){
return {w:_12.w,h:_12.h};
};
_7._fontResizeNode=null;
_7.initOnFontResize=function(_13){
var f=_7._fontResizeNode=_5.doc.createElement("iframe");
var fs=f.style;
fs.position="absolute";
fs.width="5em";
fs.height="10em";
fs.top="-10000px";
if(_3("ie")){
f.onreadystatechange=function(){
if(f.contentWindow.document.readyState=="complete"){
f.onresize=f.contentWindow.parent[_8._scopeName].html.metrics._fontresize;
}
};
}else{
f.onload=function(){
f.contentWindow.onresize=f.contentWindow.parent[_8._scopeName].html.metrics._fontresize;
};
}
f.setAttribute("src","javascript:'<html><head><script>if(\"loadFirebugConsole\" in window){window.loadFirebugConsole();}</script></head><body></body></html>'");
_5.body().appendChild(f);
_7.initOnFontResize=function(){
};
};
_7.onFontResize=function(){
};
_7._fontresize=function(){
_7.onFontResize();
};
_4.addOnUnload(function(){
var f=_7._fontResizeNode;
if(f){
if(_3("ie")&&f.onresize){
f.onresize=null;
}else{
if(f.contentWindow&&f.contentWindow.onresize){
f.contentWindow.onresize=null;
}
}
_7._fontResizeNode=null;
}
});
_4.addOnUnload(function(){
try{
var n=_5.doc.createElement("div");
n.style.cssText="top:0;left:0;width:100px;height:100px;overflow:scroll;position:absolute;visibility:hidden;";
_5.body().appendChild(n);
_12.w=n.offsetWidth-n.clientWidth;
_12.h=n.offsetHeight-n.clientHeight;
_5.body().removeChild(n);
delete n;
}
catch(e){
}
if("fontSizeWatch" in _1.config&&!!_1.config.fontSizeWatch){
_7.initOnFontResize();
}
});
return _7;
});
