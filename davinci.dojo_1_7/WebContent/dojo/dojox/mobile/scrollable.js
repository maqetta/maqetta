/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
if(typeof dojo==="undefined"){
dojo={doc:document,global:window,isWebKit:navigator.userAgent.indexOf("WebKit")!=-1,isAndroid:parseFloat(navigator.userAgent.split("Android ")[1])||undefined};
dojox={mobile:{}};
}
if(typeof define==="undefined"){
define=function(_1){
_1.apply();
};
}
define("dojox/mobile/scrollable",function(_2,_3){
dojox.mobile.scrollable=function(_4,_5){
this.fixedHeaderHeight=0;
this.fixedFooterHeight=0;
this.isLocalFooter=false;
this.scrollBar=true;
this.scrollDir="v";
this.weight=0.6;
this.fadeScrollBar=true;
this.disableFlashScrollBar=false;
this.threshold=4;
this.constraint=true;
this.touchNode=null;
this.isNested=false;
this.dirLock=false;
this.height="";
this.androidWorkaroud=true;
this.init=function(_6){
if(_6){
for(var p in _6){
if(_6.hasOwnProperty(p)){
this[p]=((p=="domNode"||p=="containerNode")&&typeof _6[p]=="string")?_4.doc.getElementById(_6[p]):_6[p];
}
}
}
this.touchNode=this.touchNode||this.containerNode;
this._v=(this.scrollDir.indexOf("v")!=-1);
this._h=(this.scrollDir.indexOf("h")!=-1);
this._f=(this.scrollDir=="f");
this._ch=[];
this._ch.push(_4.connect(this.touchNode,_5.mobile.hasTouch?"touchstart":"onmousedown",this,"onTouchStart"));
if(_4.isWebKit){
this._ch.push(_4.connect(this.domNode,"webkitAnimationEnd",this,"onFlickAnimationEnd"));
this._ch.push(_4.connect(this.domNode,"webkitAnimationStart",this,"onFlickAnimationStart"));
this._aw=this.androidWorkaroud&&_4.isAndroid>=2.2&&_4.isAndroid<3;
if(this._aw){
this._ch.push(_4.connect(_4.global,"onresize",this,"onScreenSizeChanged"));
this._ch.push(_4.connect(_4.global,"onfocus",this,function(e){
if(this.containerNode.style.webkitTransform){
this.stopAnimation();
this.toTopLeft();
}
}));
this._sz=this.getScreenSize();
}
}
this._appFooterHeight=0;
if(this.isTopLevel()&&!this.noResize){
this.resize();
}
var _7=this;
setTimeout(function(){
_7.flashScrollBar();
},600);
};
this.isTopLevel=function(){
return true;
};
this.cleanup=function(){
for(var i=0;i<this._ch.length;i++){
_4.disconnect(this._ch[i]);
}
this._ch=null;
};
this.findDisp=function(_8){
var _9=_8.parentNode.childNodes;
for(var i=0;i<_9.length;i++){
var n=_9[i];
if(n.nodeType===1&&_4.hasClass(n,"mblView")&&n.style.display!=="none"){
return n;
}
}
return _8;
};
this.getScreenSize=function(){
return {h:_4.global.innerHeight||_4.doc.documentElement.clientHeight,w:_4.global.innerWidth||_4.doc.documentElement.clientWidth};
};
this.isKeyboardShown=function(e){
if(!this._sz){
return false;
}
var sz=this.getScreenSize();
return (sz.w*sz.h)/(this._sz.w*this._sz.h)<0.8;
};
this.disableScroll=function(v){
if(this.disableTouchScroll===v||_4.style(this.domNode,"display")==="none"){
return;
}
this.disableTouchScroll=v;
this.scrollBar=!v;
_5.mobile.disableHideAddressBar=_5.mobile.disableResizeAll=v;
var of=v?"visible":"hidden";
_4.style(this.domNode,"overflow",of);
_4.style(_4.doc.documentElement,"overflow",of);
_4.style(_4.body(),"overflow",of);
var c=this.containerNode;
if(v){
if(!c.style.webkitTransform){
this.stopAnimation();
this.toTopLeft();
}
var mt=parseInt(c.style.marginTop)||0;
var h=c.offsetHeight+mt+this.fixedFooterHeight-this._appFooterHeight;
_4.style(this.domNode,"height",h+"px");
this._cPos={x:parseInt(c.style.left)||0,y:parseInt(c.style.top)||0};
_4.style(c,{top:"0px",left:"0px"});
_4.body().scrollTop=Math.max(Math.abs(this._cPos.y)+mt,1);
}else{
if(this._cPos){
_4.style(c,{top:this._cPos.y+"px",left:this._cPos.x+"px"});
this._cPos=null;
}
var _a=this.domNode.getElementsByTagName("*");
for(var i=0;i<_a.length;i++){
_a[i].blur&&_a[i].blur();
}
}
};
this.onScreenSizeChanged=function(e){
var sz=this.getScreenSize();
if(sz.w*sz.h>this._sz.w*this._sz.h){
this._sz=sz;
}
this.disableScroll(this.isKeyboardShown());
};
this.toTransform=function(e){
var c=this.containerNode;
if(c.offsetTop===0&&c.offsetLeft===0||!c._webkitTransform){
return;
}
_4.style(c,{webkitTransform:c._webkitTransform,top:"0px",left:"0px"});
c._webkitTransform=null;
};
this.toTopLeft=function(){
var c=this.containerNode;
if(!c.style.webkitTransform){
return;
}
c._webkitTransform=c.style.webkitTransform;
var _b=this.getPos();
_4.style(c,{webkitTransform:"",top:_b.y+"px",left:_b.x+"px"});
};
this.resize=function(e){
this._appFooterHeight=(this.fixedFooterHeight&&!this.isLocalFooter)?this.fixedFooterHeight:0;
if(this.isLocalHeader){
this.containerNode.style.marginTop=this.fixedHeaderHeight+"px";
}
var _c=0;
for(var n=this.domNode;n&&n.tagName!="BODY";n=n.offsetParent){
n=this.findDisp(n);
if(!n){
break;
}
_c+=n.offsetTop;
}
var h;
var dh=(_4.global.innerHeight||_4.doc.documentElement.clientHeight)-_c-this._appFooterHeight;
if(this.height==="inherit"){
if(this.domNode.offsetParent){
h=this.domNode.offsetParent.offsetHeight+"px";
}
}else{
if(this.height==="auto"){
var _d=Math.max(this.domNode.scrollHeight,this.containerNode.scrollHeight);
h=(_d?Math.min(_d,dh):dh)+"px";
}else{
if(this.height){
h=this.height;
}
}
}
if(!h){
h=dh+"px";
}
this.domNode.style.height=h;
this.onTouchEnd();
};
this.onFlickAnimationStart=function(e){
_4.stopEvent(e);
};
this.onFlickAnimationEnd=function(e){
if(this._scrollBarNodeV){
this._scrollBarNodeV.className="";
}
if(this._scrollBarNodeH){
this._scrollBarNodeH.className="";
}
if(e&&e.animationName&&e.animationName.indexOf("scrollableViewScroll2")===-1){
return;
}
if(e&&e.srcElement){
_4.stopEvent(e);
}
this.stopAnimation();
if(this._bounce){
var _e=this;
var _f=_e._bounce;
setTimeout(function(){
_e.slideTo(_f,0.3,"ease-out");
},0);
_e._bounce=undefined;
}else{
this.hideScrollBar();
this.removeCover();
if(this._aw){
this.toTopLeft();
}
}
};
this.isFormElement=function(_10){
if(_10&&_10.nodeType!==1){
_10=_10.parentNode;
}
if(!_10||_10.nodeType!==1){
return false;
}
var t=_10.tagName;
return (t==="SELECT"||t==="INPUT"||t==="TEXTAREA"||t==="BUTTON");
};
this.onTouchStart=function(e){
if(this.disableTouchScroll){
return;
}
if(this._conn&&(new Date()).getTime()-this.startTime<500){
return;
}
if(!this._conn){
this._conn=[];
this._conn.push(_4.connect(_4.doc,_5.mobile.hasTouch?"touchmove":"onmousemove",this,"onTouchMove"));
this._conn.push(_4.connect(_4.doc,_5.mobile.hasTouch?"touchend":"onmouseup",this,"onTouchEnd"));
}
this._aborted=false;
if(_4.hasClass(this.containerNode,"mblScrollableScrollTo2")){
this.abort();
}
if(this._aw){
this.toTransform(e);
}
this.touchStartX=e.touches?e.touches[0].pageX:e.clientX;
this.touchStartY=e.touches?e.touches[0].pageY:e.clientY;
this.startTime=(new Date()).getTime();
this.startPos=this.getPos();
this._dim=this.getDim();
this._time=[0];
this._posX=[this.touchStartX];
this._posY=[this.touchStartY];
this._locked=false;
if(!this.isFormElement(e.target)&&!this.isNested){
_4.stopEvent(e);
}
};
this.onTouchMove=function(e){
if(this._locked){
return;
}
var x=e.touches?e.touches[0].pageX:e.clientX;
var y=e.touches?e.touches[0].pageY:e.clientY;
var dx=x-this.touchStartX;
var dy=y-this.touchStartY;
var to={x:this.startPos.x+dx,y:this.startPos.y+dy};
var dim=this._dim;
dx=Math.abs(dx);
dy=Math.abs(dy);
if(this._time.length==1){
if(this.dirLock){
if(this._v&&!this._h&&dx>=this.threshold&&dx>=dy||(this._h||this._f)&&!this._v&&dy>=this.threshold&&dy>=dx){
this._locked=true;
return;
}
}
if(this._v&&Math.abs(dy)<this.threshold||(this._h||this._f)&&Math.abs(dx)<this.threshold){
return;
}
this.addCover();
this.showScrollBar();
}
var _11=this.weight;
if(this._v&&this.constraint){
if(to.y>0){
to.y=Math.round(to.y*_11);
}else{
if(to.y<-dim.o.h){
if(dim.c.h<dim.d.h){
to.y=Math.round(to.y*_11);
}else{
to.y=-dim.o.h-Math.round((-dim.o.h-to.y)*_11);
}
}
}
}
if((this._h||this._f)&&this.constraint){
if(to.x>0){
to.x=Math.round(to.x*_11);
}else{
if(to.x<-dim.o.w){
if(dim.c.w<dim.d.w){
to.x=Math.round(to.x*_11);
}else{
to.x=-dim.o.w-Math.round((-dim.o.w-to.x)*_11);
}
}
}
}
this.scrollTo(to);
var max=10;
var n=this._time.length;
if(n>=2){
var d0,d1;
if(this._v&&!this._h){
d0=this._posY[n-1]-this._posY[n-2];
d1=y-this._posY[n-1];
}else{
if(!this._v&&this._h){
d0=this._posX[n-1]-this._posX[n-2];
d1=x-this._posX[n-1];
}
}
if(d0*d1<0){
this._time=[this._time[n-1]];
this._posX=[this._posX[n-1]];
this._posY=[this._posY[n-1]];
n=1;
}
}
if(n==max){
this._time.shift();
this._posX.shift();
this._posY.shift();
}
this._time.push((new Date()).getTime()-this.startTime);
this._posX.push(x);
this._posY.push(y);
};
this.onTouchEnd=function(e){
if(this._locked){
return;
}
var _12=this._speed={x:0,y:0};
var dim=this._dim;
var pos=this.getPos();
var to={};
if(e){
if(!this._conn){
return;
}
for(var i=0;i<this._conn.length;i++){
_4.disconnect(this._conn[i]);
}
this._conn=null;
var n=this._time.length;
var _13=false;
if(!this._aborted){
if(n<=1){
_13=true;
}else{
if(n==2&&Math.abs(this._posY[1]-this._posY[0])<4){
_13=true;
}
}
}
if(_13&&!this.isFormElement(e.target)){
this.hideScrollBar();
this.removeCover();
if(_5.mobile.hasTouch){
var _14=e.target;
if(_14.nodeType!=1){
_14=_14.parentNode;
}
var ev=_4.doc.createEvent("MouseEvents");
ev.initMouseEvent("click",true,true,_4.global,1,e.screenX,e.screenY,e.clientX,e.clientY);
setTimeout(function(){
_14.dispatchEvent(ev);
},0);
}
return;
}
_12=this._speed=this.getSpeed();
}else{
if(pos.x==0&&pos.y==0){
return;
}
dim=this.getDim();
}
if(this._v){
to.y=pos.y+_12.y;
}
if(this._h||this._f){
to.x=pos.x+_12.x;
}
this.adjustDestination(to,pos);
if(this.scrollDir=="v"&&dim.c.h<dim.d.h){
this.slideTo({y:0},0.3,"ease-out");
return;
}else{
if(this.scrollDir=="h"&&dim.c.w<dim.d.w){
this.slideTo({x:0},0.3,"ease-out");
return;
}else{
if(this._v&&this._h&&dim.c.h<dim.d.h&&dim.c.w<dim.d.w){
this.slideTo({x:0,y:0},0.3,"ease-out");
return;
}
}
}
var _15,_16="ease-out";
var _17={};
if(this._v&&this.constraint){
if(to.y>0){
if(pos.y>0){
_15=0.3;
to.y=0;
}else{
to.y=Math.min(to.y,20);
_16="linear";
_17.y=0;
}
}else{
if(-_12.y>dim.o.h-(-pos.y)){
if(pos.y<-dim.o.h){
_15=0.3;
to.y=dim.c.h<=dim.d.h?0:-dim.o.h;
}else{
to.y=Math.max(to.y,-dim.o.h-20);
_16="linear";
_17.y=-dim.o.h;
}
}
}
}
if((this._h||this._f)&&this.constraint){
if(to.x>0){
if(pos.x>0){
_15=0.3;
to.x=0;
}else{
to.x=Math.min(to.x,20);
_16="linear";
_17.x=0;
}
}else{
if(-_12.x>dim.o.w-(-pos.x)){
if(pos.x<-dim.o.w){
_15=0.3;
to.x=dim.c.w<=dim.d.w?0:-dim.o.w;
}else{
to.x=Math.max(to.x,-dim.o.w-20);
_16="linear";
_17.x=-dim.o.w;
}
}
}
}
this._bounce=(_17.x!==undefined||_17.y!==undefined)?_17:undefined;
if(_15===undefined){
var _18,_19;
if(this._v&&this._h){
_19=Math.sqrt(_12.x+_12.x+_12.y*_12.y);
_18=Math.sqrt(Math.pow(to.y-pos.y,2)+Math.pow(to.x-pos.x,2));
}else{
if(this._v){
_19=_12.y;
_18=to.y-pos.y;
}else{
if(this._h){
_19=_12.x;
_18=to.x-pos.x;
}
}
}
if(_18===0&&!e){
return;
}
_15=_19!==0?Math.abs(_18/_19):0.01;
}
this.slideTo(to,_15,_16);
};
this.adjustDestination=function(to,pos){
};
this.abort=function(){
this.scrollTo(this.getPos());
this.stopAnimation();
this._aborted=true;
};
this.stopAnimation=function(){
_4.removeClass(this.containerNode,"mblScrollableScrollTo2");
if(_4.isAndroid){
_4.style(this.containerNode,"webkitAnimationDuration","0s");
}
if(this._scrollBarV){
this._scrollBarV.className="";
}
if(this._scrollBarH){
this._scrollBarH.className="";
}
};
this.getSpeed=function(){
var x=0,y=0,n=this._time.length;
if(n>=2&&(new Date()).getTime()-this.startTime-this._time[n-1]<500){
var dy=this._posY[n-(n>3?2:1)]-this._posY[(n-6)>=0?n-6:0];
var dx=this._posX[n-(n>3?2:1)]-this._posX[(n-6)>=0?n-6:0];
var dt=this._time[n-(n>3?2:1)]-this._time[(n-6)>=0?n-6:0];
y=this.calcSpeed(dy,dt);
x=this.calcSpeed(dx,dt);
}
return {x:x,y:y};
};
this.calcSpeed=function(d,t){
return Math.round(d/t*100)*4;
};
this.scrollTo=function(to,_1a,_1b){
var s=(_1b||this.containerNode).style;
if(_4.isWebKit){
s.webkitTransform=this.makeTranslateStr(to);
}else{
if(this._v){
s.top=to.y+"px";
}
if(this._h||this._f){
s.left=to.x+"px";
}
}
if(!_1a){
this.scrollScrollBarTo(this.calcScrollBarPos(to));
}
};
this.slideTo=function(to,_1c,_1d){
this._runSlideAnimation(this.getPos(),to,_1c,_1d,this.containerNode,2);
this.slideScrollBarTo(to,_1c,_1d);
};
this.makeTranslateStr=function(to){
var y=this._v&&typeof to.y=="number"?to.y+"px":"0px";
var x=(this._h||this._f)&&typeof to.x=="number"?to.x+"px":"0px";
return _5.mobile.hasTranslate3d?"translate3d("+x+","+y+",0px)":"translate("+x+","+y+")";
};
this.getPos=function(){
if(_4.isWebKit){
var m=_4.doc.defaultView.getComputedStyle(this.containerNode,"")["-webkit-transform"];
if(m&&m.indexOf("matrix")===0){
var arr=m.split(/[,\s\)]+/);
return {y:arr[5]-0,x:arr[4]-0};
}
return {x:0,y:0};
}else{
var y=parseInt(this.containerNode.style.top)||0;
return {y:y,x:this.containerNode.offsetLeft};
}
};
this.getDim=function(){
var d={};
d.c={h:this.containerNode.offsetHeight,w:this.containerNode.offsetWidth};
d.v={h:this.domNode.offsetHeight+this._appFooterHeight,w:this.domNode.offsetWidth};
d.d={h:d.v.h-this.fixedHeaderHeight-this.fixedFooterHeight,w:d.v.w};
d.o={h:d.c.h-d.v.h+this.fixedHeaderHeight+this.fixedFooterHeight,w:d.c.w-d.v.w};
return d;
};
this.showScrollBar=function(){
if(!this.scrollBar){
return;
}
var dim=this._dim;
if(this.scrollDir=="v"&&dim.c.h<=dim.d.h){
return;
}
if(this.scrollDir=="h"&&dim.c.w<=dim.d.w){
return;
}
if(this._v&&this._h&&dim.c.h<=dim.d.h&&dim.c.w<=dim.d.w){
return;
}
var _1e=function(_1f,dir){
var bar=_1f["_scrollBarNode"+dir];
if(!bar){
var _20=_4.create("div",null,_1f.domNode);
var _21={position:"absolute",overflow:"hidden"};
if(dir=="V"){
_21.right="2px";
_21.width="5px";
}else{
_21.bottom=(_1f.isLocalFooter?_1f.fixedFooterHeight:0)+2+"px";
_21.height="5px";
}
_4.style(_20,_21);
_20.className="mblScrollBarWrapper";
_1f["_scrollBarWrapper"+dir]=_20;
bar=_4.create("div",null,_20);
_4.style(bar,{opacity:0.6,position:"absolute",backgroundColor:"#606060",fontSize:"1px",webkitBorderRadius:"2px",MozBorderRadius:"2px",webkitTransformOrigin:"0 0",zIndex:2147483647});
_4.style(bar,dir=="V"?{width:"5px"}:{height:"5px"});
_1f["_scrollBarNode"+dir]=bar;
}
return bar;
};
if(this._v&&!this._scrollBarV){
this._scrollBarV=_1e(this,"V");
}
if(this._h&&!this._scrollBarH){
this._scrollBarH=_1e(this,"H");
}
this.resetScrollBar();
};
this.hideScrollBar=function(){
var _22;
if(this.fadeScrollBar&&_4.isWebKit){
if(!_5.mobile._fadeRule){
var _23=_4.create("style",null,_4.doc.getElementsByTagName("head")[0]);
_23.textContent=".mblScrollableFadeScrollBar{"+"  -webkit-animation-duration: 1s;"+"  -webkit-animation-name: scrollableViewFadeScrollBar;}"+"@-webkit-keyframes scrollableViewFadeScrollBar{"+"  from { opacity: 0.6; }"+"  to { opacity: 0; }}";
_5.mobile._fadeRule=_23.sheet.cssRules[1];
}
_22=_5.mobile._fadeRule;
}
if(!this.scrollBar){
return;
}
var f=function(bar,_24){
_4.style(bar,{opacity:0,webkitAnimationDuration:""});
if(_24._aw){
bar.style.webkitTransform="";
}else{
bar.className="mblScrollableFadeScrollBar";
}
};
if(this._scrollBarV){
f(this._scrollBarV,this);
this._scrollBarV=null;
}
if(this._scrollBarH){
f(this._scrollBarH,this);
this._scrollBarH=null;
}
};
this.calcScrollBarPos=function(to){
var pos={};
var dim=this._dim;
var f=function(_25,_26,t,d,c){
var y=Math.round((d-_26-8)/(d-c)*t);
if(y<-_26+5){
y=-_26+5;
}
if(y>_25-5){
y=_25-5;
}
return y;
};
if(typeof to.y=="number"&&this._scrollBarV){
pos.y=f(this._scrollBarWrapperV.offsetHeight,this._scrollBarV.offsetHeight,to.y,dim.d.h,dim.c.h);
}
if(typeof to.x=="number"&&this._scrollBarH){
pos.x=f(this._scrollBarWrapperH.offsetWidth,this._scrollBarH.offsetWidth,to.x,dim.d.w,dim.c.w);
}
return pos;
};
this.scrollScrollBarTo=function(to){
if(!this.scrollBar){
return;
}
if(this._v&&this._scrollBarV&&typeof to.y=="number"){
if(_4.isWebKit){
this._scrollBarV.style.webkitTransform=this.makeTranslateStr({y:to.y});
}else{
this._scrollBarV.style.top=to.y+"px";
}
}
if(this._h&&this._scrollBarH&&typeof to.x=="number"){
if(_4.isWebKit){
this._scrollBarH.style.webkitTransform=this.makeTranslateStr({x:to.x});
}else{
this._scrollBarH.style.left=to.x+"px";
}
}
};
this.slideScrollBarTo=function(to,_27,_28){
if(!this.scrollBar){
return;
}
var _29=this.calcScrollBarPos(this.getPos());
var _2a=this.calcScrollBarPos(to);
if(this._v&&this._scrollBarV){
this._runSlideAnimation({y:_29.y},{y:_2a.y},_27,_28,this._scrollBarV,0);
}
if(this._h&&this._scrollBarH){
this._runSlideAnimation({x:_29.x},{x:_2a.x},_27,_28,this._scrollBarH,1);
}
};
this._runSlideAnimation=function(_2b,to,_2c,_2d,_2e,idx){
if(_4.isWebKit){
this.setKeyframes(_2b,to,idx);
_4.style(_2e,{webkitAnimationDuration:_2c+"s",webkitAnimationTimingFunction:_2d});
_4.addClass(_2e,"mblScrollableScrollTo"+idx);
if(idx==2){
this.scrollTo(to,true,_2e);
}else{
this.scrollScrollBarTo(to);
}
}else{
if(_4.fx&&_4.fx.easing&&_2c){
var s=_4.fx.slideTo({node:_2e,duration:_2c*1000,left:to.x,top:to.y,easing:(_2d=="ease-out")?_4.fx.easing.quadOut:_4.fx.easing.linear}).play();
if(idx==2){
_4.connect(s,"onEnd",this,"onFlickAnimationEnd");
}
}else{
if(idx==2){
this.scrollTo(to,false,_2e);
this.onFlickAnimationEnd();
}else{
this.scrollScrollBarTo(to);
}
}
}
};
this.resetScrollBar=function(){
var f=function(_2f,bar,d,c,hd,v){
if(!bar){
return;
}
var _30={};
_30[v?"top":"left"]=hd+4+"px";
_30[v?"height":"width"]=d-8+"px";
_4.style(_2f,_30);
var l=Math.round(d*d/c);
l=Math.min(Math.max(l-8,5),d-8);
bar.style[v?"height":"width"]=l+"px";
_4.style(bar,{"opacity":0.6});
};
var dim=this.getDim();
f(this._scrollBarWrapperV,this._scrollBarV,dim.d.h,dim.c.h,this.fixedHeaderHeight,true);
f(this._scrollBarWrapperH,this._scrollBarH,dim.d.w,dim.c.w,0);
this.createMask();
};
this.createMask=function(){
if(!_4.isWebKit){
return;
}
var ctx;
if(this._scrollBarWrapperV){
var h=this._scrollBarWrapperV.offsetHeight;
ctx=_4.doc.getCSSCanvasContext("2d","scrollBarMaskV",5,h);
ctx.fillStyle="rgba(0,0,0,0.5)";
ctx.fillRect(1,0,3,2);
ctx.fillRect(0,1,5,1);
ctx.fillRect(0,h-2,5,1);
ctx.fillRect(1,h-1,3,2);
ctx.fillStyle="rgb(0,0,0)";
ctx.fillRect(0,2,5,h-4);
this._scrollBarWrapperV.style.webkitMaskImage="-webkit-canvas(scrollBarMaskV)";
}
if(this._scrollBarWrapperH){
var w=this._scrollBarWrapperH.offsetWidth;
ctx=_4.doc.getCSSCanvasContext("2d","scrollBarMaskH",w,5);
ctx.fillStyle="rgba(0,0,0,0.5)";
ctx.fillRect(0,1,2,3);
ctx.fillRect(1,0,1,5);
ctx.fillRect(w-2,0,1,5);
ctx.fillRect(w-1,1,2,3);
ctx.fillStyle="rgb(0,0,0)";
ctx.fillRect(2,0,w-4,5);
this._scrollBarWrapperH.style.webkitMaskImage="-webkit-canvas(scrollBarMaskH)";
}
};
this.flashScrollBar=function(){
if(this.disableFlashScrollBar){
return;
}
this._dim=this.getDim();
if(this._dim.d.h<=0){
return;
}
this.showScrollBar();
var _31=this;
setTimeout(function(){
_31.hideScrollBar();
},300);
};
this.addCover=function(){
if(!_5.mobile.hasTouch&&!this.noCover){
if(!this._cover){
this._cover=_4.create("div",null,_4.doc.body);
_4.style(this._cover,{backgroundColor:"#ffff00",opacity:0,position:"absolute",top:"0px",left:"0px",width:"100%",height:"100%",zIndex:2147483647});
this._ch.push(_4.connect(this._cover,_5.mobile.hasTouch?"touchstart":"onmousedown",this,"onTouchEnd"));
}else{
this._cover.style.display="";
}
this.setSelectable(this._cover,false);
this.setSelectable(this.domNode,false);
}
};
this.removeCover=function(){
if(!_5.mobile.hasTouch&&this._cover){
this._cover.style.display="none";
this.setSelectable(this._cover,true);
this.setSelectable(this.domNode,true);
}
};
this.setKeyframes=function(_32,to,idx){
if(!_5.mobile._rule){
_5.mobile._rule=[];
}
if(!_5.mobile._rule[idx]){
var _33=_4.create("style",null,_4.doc.getElementsByTagName("head")[0]);
_33.textContent=".mblScrollableScrollTo"+idx+"{-webkit-animation-name: scrollableViewScroll"+idx+";}"+"@-webkit-keyframes scrollableViewScroll"+idx+"{}";
_5.mobile._rule[idx]=_33.sheet.cssRules[1];
}
var _34=_5.mobile._rule[idx];
if(_34){
if(_32){
_34.deleteRule("from");
_34.insertRule("from { -webkit-transform: "+this.makeTranslateStr(_32)+"; }");
}
if(to){
if(to.x===undefined){
to.x=_32.x;
}
if(to.y===undefined){
to.y=_32.y;
}
_34.deleteRule("to");
_34.insertRule("to { -webkit-transform: "+this.makeTranslateStr(to)+"; }");
}
}
};
this.setSelectable=function(_35,_36){
_35.style.KhtmlUserSelect=_36?"auto":"none";
_35.style.MozUserSelect=_36?"":"none";
_35.onselectstart=_36?null:function(){
return false;
};
if(_4.isIE){
_35.unselectable=_36?"":"on";
_4.forEach(_35.getElementsByTagName("*"),function(n){
n.unselectable=_36?"":"on";
});
}
};
if(_4.isWebKit){
var _37=_4.doc.createElement("div");
_37.style.webkitTransform="translate3d(0px,1px,0px)";
_4.doc.documentElement.appendChild(_37);
var v=_4.doc.defaultView.getComputedStyle(_37,"")["-webkit-transform"];
_5.mobile.hasTranslate3d=v&&v.indexOf("matrix")===0;
_4.doc.documentElement.removeChild(_37);
_5.mobile.hasTouch=(typeof _4.doc.documentElement.ontouchstart!="undefined"&&navigator.appVersion.indexOf("Mobile")!=-1)||!!_4.isAndroid;
}
};
return dojox.mobile.scrollable;
});
