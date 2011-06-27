/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/window",["./_base/kernel","./dom","./dom-geometry","./dom-style","./_base/sniff","./_base/window"],function(_1){
_1.getObject("window",true,_1);
_1.window.getBox=function(){
var _2=(_1.doc.compatMode=="BackCompat")?_1.body():_1.doc.documentElement;
var _3=_1._docScroll();
return {w:_1.global.innerWidth||_2.clientWidth,h:_1.global.innerHeight||_2.clientHeight,l:_3.x,t:_3.y};
};
_1.window.get=function(_4){
if(_1.isIE&&window!==document.parentWindow){
_4.parentWindow.execScript("document._parentWindow = window;","Javascript");
var _5=_4._parentWindow;
_4._parentWindow=null;
return _5;
}
return _4.parentWindow||_4.defaultView;
};
_1.window.scrollIntoView=function(_6,_7){
try{
_6=_1.byId(_6);
var _8=_6.ownerDocument||_1.doc,_9=_8.body||_1.body(),_a=_8.documentElement||_9.parentNode,_b=_1.isIE,_c=_1.isWebKit;
if((!(_1.isMoz||_b||_c||_1.isOpera)||_6==_9||_6==_a)&&(typeof _6.scrollIntoView!="undefined")){
_6.scrollIntoView(false);
return;
}
var _d=_8.compatMode=="BackCompat",_e=(_b>=9&&_6.ownerDocument.parentWindow.frameElement)?((_a.clientHeight>0&&_a.clientWidth>0&&(_9.clientHeight==0||_9.clientWidth==0||_9.clientHeight>_a.clientHeight||_9.clientWidth>_a.clientWidth))?_a:_9):(_d?_9:_a),_f=_c?_9:_e,_10=_e.clientWidth,_11=_e.clientHeight,rtl=!_1._isBodyLtr(),_12=_7||_1.position(_6),el=_6.parentNode,_13=function(el){
return ((_b<=6||(_b&&_d))?false:(_1.style(el,"position").toLowerCase()=="fixed"));
};
if(_13(_6)){
return;
}
while(el){
if(el==_9){
el=_f;
}
var _14=_1.position(el),_15=_13(el);
if(el==_f){
_14.w=_10;
_14.h=_11;
if(_f==_a&&_b&&rtl){
_14.x+=_f.offsetWidth-_14.w;
}
if(_14.x<0||!_b){
_14.x=0;
}
if(_14.y<0||!_b){
_14.y=0;
}
}else{
var pb=_1._getPadBorderExtents(el);
_14.w-=pb.w;
_14.h-=pb.h;
_14.x+=pb.l;
_14.y+=pb.t;
var _16=el.clientWidth,_17=_14.w-_16;
if(_16>0&&_17>0){
_14.w=_16;
_14.x+=(rtl&&(_b||el.clientLeft>pb.l))?_17:0;
}
_16=el.clientHeight;
_17=_14.h-_16;
if(_16>0&&_17>0){
_14.h=_16;
}
}
if(_15){
if(_14.y<0){
_14.h+=_14.y;
_14.y=0;
}
if(_14.x<0){
_14.w+=_14.x;
_14.x=0;
}
if(_14.y+_14.h>_11){
_14.h=_11-_14.y;
}
if(_14.x+_14.w>_10){
_14.w=_10-_14.x;
}
}
var l=_12.x-_14.x,t=_12.y-Math.max(_14.y,0),r=l+_12.w-_14.w,bot=t+_12.h-_14.h;
if(r*l>0){
var s=Math[l<0?"max":"min"](l,r);
if(rtl&&((_b==8&&!_d)||_b>=9)){
s=-s;
}
_12.x+=el.scrollLeft;
el.scrollLeft+=s;
_12.x-=el.scrollLeft;
}
if(bot*t>0){
_12.y+=el.scrollTop;
el.scrollTop+=Math[t<0?"max":"min"](t,bot);
_12.y-=el.scrollTop;
}
el=(el!=_f)&&!_15&&el.parentNode;
}
}
catch(error){
console.error("scrollIntoView: "+error);
_6.scrollIntoView(false);
}
};
return _1.window;
});
