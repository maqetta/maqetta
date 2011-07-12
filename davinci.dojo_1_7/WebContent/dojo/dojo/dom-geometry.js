/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dom-geometry",["./_base/kernel","./_base/sniff","./_base/window","./dom","./dom-style"],function(_1,_2,_3,_4,_5){
_1.boxModel="content-box";
if(_2.isIE){
_1.boxModel=document.compatMode=="BackCompat"?"border-box":"content-box";
}
_1._getPadExtents=function(n,_6){
var s=_6||_5.getComputedStyle(n),px=_5.toPixelValue,l=px(n,s.paddingLeft),t=px(n,s.paddingTop);
return {l:l,t:t,w:l+px(n,s.paddingRight),h:t+px(n,s.paddingBottom)};
};
_1._getBorderExtents=function(n,_7){
var ne="none",px=_5.toPixelValue,s=_7||_5.getComputedStyle(n),bl=(s.borderLeftStyle!=ne?px(n,s.borderLeftWidth):0),bt=(s.borderTopStyle!=ne?px(n,s.borderTopWidth):0);
return {l:bl,t:bt,w:bl+(s.borderRightStyle!=ne?px(n,s.borderRightWidth):0),h:bt+(s.borderBottomStyle!=ne?px(n,s.borderBottomWidth):0)};
};
_1._getPadBorderExtents=function(n,_8){
var s=_8||_5.getComputedStyle(n),p=_1._getPadExtents(n,s),b=_1._getBorderExtents(n,s);
return {l:p.l+b.l,t:p.t+b.t,w:p.w+b.w,h:p.h+b.h};
};
_1._getMarginExtents=function(n,_9){
var s=_9||_5.getComputedStyle(n),px=_5.toPixelValue,l=px(n,s.marginLeft),t=px(n,s.marginTop),r=px(n,s.marginRight),b=px(n,s.marginBottom);
if(_2.isWebKit&&(s.position!="absolute")){
r=l;
}
return {l:l,t:t,w:l+r,h:t+b};
};
_1._getMarginBox=function(_a,_b){
var s=_b||_5.getComputedStyle(_a),me=_1._getMarginExtents(_a,s),l=_a.offsetLeft-me.l,t=_a.offsetTop-me.t,p=_a.parentNode;
if(_2.isMoz){
var sl=parseFloat(s.left),st=parseFloat(s.top);
if(!isNaN(sl)&&!isNaN(st)){
l=sl,t=st;
}else{
if(p&&p.style){
var _c=_5.getComputedStyle(p);
if(_c.overflow!="visible"){
var be=_1._getBorderExtents(p,_c);
l+=be.l,t+=be.t;
}
}
}
}else{
if(_2.isOpera||(_2.isIE==8&&!_2.isQuirks)){
if(p){
be=_1._getBorderExtents(p);
l-=be.l;
t-=be.t;
}
}
}
return {l:l,t:t,w:_a.offsetWidth+me.w,h:_a.offsetHeight+me.h};
};
_1._getContentBox=function(_d,_e){
var s=_e||_5.getComputedStyle(_d),pe=_1._getPadExtents(_d,s),be=_1._getBorderExtents(_d,s),w=_d.clientWidth,h;
if(!w){
w=_d.offsetWidth,h=_d.offsetHeight;
}else{
h=_d.clientHeight,be.w=be.h=0;
}
if(_2.isOpera){
pe.l+=be.l;
pe.t+=be.t;
}
return {l:pe.l,t:pe.t,w:w-pe.w-be.w,h:h-pe.h-be.h};
};
_1._setBox=function(_f,l,t,w,h,u){
u=u||"px";
var s=_f.style;
if(!isNaN(l)){
s.left=l+u;
}
if(!isNaN(t)){
s.top=t+u;
}
if(w>=0){
s.width=w+u;
}
if(h>=0){
s.height=h+u;
}
};
function _10(_11){
return _11.tagName=="BUTTON"||_11.tagName=="INPUT"&&(_11.getAttribute("type")||"").toUpperCase()=="BUTTON";
};
function _12(_13){
var n=_13.tagName;
return _1.boxModel=="border-box"||n=="TABLE"||_10(_13);
};
_1._setContentSize=function(_14,_15,_16,_17){
if(_12(_14)){
var pb=_1._getPadBorderExtents(_14,_17);
if(_15>=0){
_15+=pb.w;
}
if(_16>=0){
_16+=pb.h;
}
}
_1._setBox(_14,NaN,NaN,_15,_16);
};
_1._setMarginBox=function(_18,_19,_1a,_1b,_1c,_1d){
var s=_1d||_5.getComputedStyle(_18),bb=_12(_18),pb=bb?_1e:_1._getPadBorderExtents(_18,s);
if(_2.isWebKit){
if(_10(_18)){
var ns=_18.style;
if(_1b>=0&&!ns.width){
ns.width="4px";
}
if(_1c>=0&&!ns.height){
ns.height="4px";
}
}
}
var mb=_1._getMarginExtents(_18,s);
if(_1b>=0){
_1b=Math.max(_1b-pb.w-mb.w,0);
}
if(_1c>=0){
_1c=Math.max(_1c-pb.h-mb.h,0);
}
_1._setBox(_18,_19,_1a,_1b,_1c);
};
var _1e={l:0,t:0,w:0,h:0};
_1.marginBox=function(_1f,box){
var n=_4.byId(_1f),s=_5.getComputedStyle(n);
return !box?_1._getMarginBox(n,s):_1._setMarginBox(n,box.l,box.t,box.w,box.h,s);
};
_1.contentBox=function(_20,box){
var n=_4.byId(_20),s=_5.getComputedStyle(n);
return !box?_1._getContentBox(n,s):_1._setContentSize(n,box.w,box.h,s);
};
_1._isBodyLtr=function(){
return "_bodyLtr" in _1?_1._bodyLtr:_1._bodyLtr=(_1.body().dir||_3.doc.documentElement.dir||"ltr").toLowerCase()=="ltr";
};
_1._docScroll=function(){
var n=_3.global;
return "pageXOffset" in n?{x:n.pageXOffset,y:n.pageYOffset}:(n=_2.isQuirks?_3.body():_3.doc.documentElement,{x:_1._fixIeBiDiScrollLeft(n.scrollLeft||0),y:n.scrollTop||0});
};
_1._getIeDocumentElementOffset=function(){
var de=_3.doc.documentElement;
if(_2.isIE<8){
var r=de.getBoundingClientRect(),l=r.left,t=r.top;
if(_2.isIE<7){
l+=de.clientLeft;
t+=de.clientTop;
}
return {x:l<0?0:l,y:t<0?0:t};
}else{
return {x:0,y:0};
}
};
_1._fixIeBiDiScrollLeft=function(_21){
var ie=_2.isIE;
if(ie&&!_1._isBodyLtr()){
var qk=_2.isQuirks,de=qk?_3.body():_3.doc.documentElement;
if(ie==6&&!qk&&_1.global.frameElement&&de.scrollHeight>de.clientHeight){
_21+=de.clientLeft;
}
return (ie<8||qk)?(_21+de.clientWidth-de.scrollWidth):-_21;
}
return _21;
};
_1.position=function(_22,_23){
_22=_4.byId(_22);
var db=_3.body(),dh=db.parentNode,ret=_22.getBoundingClientRect();
ret={x:ret.left,y:ret.top,w:ret.right-ret.left,h:ret.bottom-ret.top};
if(_2.isIE){
var _24=_1._getIeDocumentElementOffset();
ret.x-=_24.x+(_2.isQuirks?db.clientLeft+db.offsetLeft:0);
ret.y-=_24.y+(_2.isQuirks?db.clientTop+db.offsetTop:0);
}else{
if(_2.isFF==3){
var cs=_5.getComputedStyle(dh),px=_5.toPixelValue;
ret.x-=px(dh,cs.marginLeft)+px(dh,cs.borderLeftWidth);
ret.y-=px(dh,cs.marginTop)+px(dh,cs.borderTopWidth);
}
}
if(_23){
var _25=_1._docScroll();
ret.x+=_25.x;
ret.y+=_25.y;
}
return ret;
};
_1.coords=function(_26,_27){
_1.deprecated("dojo.coords()","Use dojo.position() or dojo.marginBox().");
var n=_4.byId(_26),s=_5.getComputedStyle(n),mb=_1._getMarginBox(n,s);
var abs=_1.position(n,_27);
mb.x=abs.x;
mb.y=abs.y;
return mb;
};
_1._getMarginSize=function(_28,_29){
_28=_4.byId(_28);
var me=_1._getMarginExtents(_28,_29||_5.getComputedStyle(_28));
var _2a=_28.getBoundingClientRect();
return {w:(_2a.right-_2a.left)+me.w,h:(_2a.bottom-_2a.top)+me.h};
};
return {marginBox:_1.marginBox,contentBox:_1.contentBox,position:_1.position,isBodyLtr:_1._isBodyLtr,docScroll:_1._docScroll};
});
