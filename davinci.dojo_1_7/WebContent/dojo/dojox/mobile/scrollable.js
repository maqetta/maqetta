/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(typeof dojo==="undefined"){
dojo={doc:document,global:window,isWebKit:navigator.userAgent.indexOf("WebKit")!=-1};
dojox={mobile:{}};
}
if(typeof define==="undefined"){
define=function(_1){
_1.apply();
};
}
define(function(_2,_3){
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
this.resize=function(e){
this._appFooterHeight=(this.fixedFooterHeight&&!this.isLocalFooter)?this.fixedFooterHeight:0;
if(this.isLocalHeader){
this.containerNode.style.marginTop=this.fixedHeaderHeight+"px";
}
var _a=0;
for(var n=this.domNode;n&&n.tagName!="BODY";n=n.offsetParent){
n=this.findDisp(n);
if(!n){
break;
}
_a+=n.offsetTop;
}
var h;
var dh=(_4.global.innerHeight||_4.doc.documentElement.clientHeight)-_a-this._appFooterHeight;
if(this.height==="inherit"){
if(this.domNode.offsetParent){
h=this.domNode.offsetParent.offsetHeight+"px";
}
}else{
if(this.height==="auto"){
var _b=Math.max(this.domNode.scrollHeight,this.containerNode.scrollHeight);
h=(_b?Math.min(_b,dh):dh)+"px";
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
if(e&&e.animationName&&e.animationName.indexOf("scrollableViewScroll")===-1){
return;
}
if(e&&e.srcElement){
_4.stopEvent(e);
}
this.stopAnimation();
if(this._bounce){
var _c=this;
var _d=_c._bounce;
setTimeout(function(){
_c.slideTo(_d,0.3,"ease-out");
},0);
_c._bounce=undefined;
}else{
this.hideScrollBar();
this.removeCover();
}
};
this.isFormElement=function(_e){
if(_e.nodeType!==1){
return false;
}
var t=_e.tagName;
return (t==="SELECT"||t==="INPUT"||t==="TEXTAREA"||t==="BUTTON");
};
this.onTouchStart=function(e){
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
var _f=this._dim;
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
var _10=this.weight;
if(this._v&&this.constraint){
if(to.y>0){
to.y=Math.round(to.y*_10);
}else{
if(to.y<-_f.o.h){
if(_f.c.h<_f.d.h){
to.y=Math.round(to.y*_10);
}else{
to.y=-_f.o.h-Math.round((-_f.o.h-to.y)*_10);
}
}
}
}
if((this._h||this._f)&&this.constraint){
if(to.x>0){
to.x=Math.round(to.x*_10);
}else{
if(to.x<-_f.o.w){
if(_f.c.w<_f.d.w){
to.x=Math.round(to.x*_10);
}else{
to.x=-_f.o.w-Math.round((-_f.o.w-to.x)*_10);
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
var _11=this._speed={x:0,y:0};
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
var _12=false;
if(!this._aborted){
if(n<=1){
_12=true;
}else{
if(n==2&&Math.abs(this._posY[1]-this._posY[0])<4){
_12=true;
}
}
}
if(_12&&!this.isFormElement(e.target)){
this.hideScrollBar();
this.removeCover();
if(_5.mobile.hasTouch){
var _13=e.target;
if(_13.nodeType!=1){
_13=_13.parentNode;
}
var ev=_4.doc.createEvent("MouseEvents");
ev.initEvent("click",true,true);
_13.dispatchEvent(ev);
}
return;
}
_11=this._speed=this.getSpeed();
}else{
if(pos.x==0&&pos.y==0){
return;
}
dim=this.getDim();
}
if(this._v){
to.y=pos.y+_11.y;
}
if(this._h||this._f){
to.x=pos.x+_11.x;
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
var _14,_15="ease-out";
var _16={};
if(this._v&&this.constraint){
if(to.y>0){
if(pos.y>0){
_14=0.3;
to.y=0;
}else{
to.y=Math.min(to.y,20);
_15="linear";
_16.y=0;
}
}else{
if(-_11.y>dim.o.h-(-pos.y)){
if(pos.y<-dim.o.h){
_14=0.3;
to.y=dim.c.h<=dim.d.h?0:-dim.o.h;
}else{
to.y=Math.max(to.y,-dim.o.h-20);
_15="linear";
_16.y=-dim.o.h;
}
}
}
}
if((this._h||this._f)&&this.constraint){
if(to.x>0){
if(pos.x>0){
_14=0.3;
to.x=0;
}else{
to.x=Math.min(to.x,20);
_15="linear";
_16.x=0;
}
}else{
if(-_11.x>dim.o.w-(-pos.x)){
if(pos.x<-dim.o.w){
_14=0.3;
to.x=dim.c.w<=dim.d.w?0:-dim.o.w;
}else{
to.x=Math.max(to.x,-dim.o.w-20);
_15="linear";
_16.x=-dim.o.w;
}
}
}
}
this._bounce=(_16.x!==undefined||_16.y!==undefined)?_16:undefined;
if(_14===undefined){
var _17,_18;
if(this._v&&this._h){
_18=Math.sqrt(_11.x+_11.x+_11.y*_11.y);
_17=Math.sqrt(Math.pow(to.y-pos.y,2)+Math.pow(to.x-pos.x,2));
}else{
if(this._v){
_18=_11.y;
_17=to.y-pos.y;
}else{
if(this._h){
_18=_11.x;
_17=to.x-pos.x;
}
}
}
_14=_18!==0?Math.abs(_17/_18):0.01;
}
this.slideTo(to,_14,_15);
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
this.scrollTo=function(to,_19,_1a){
var s=(_1a||this.containerNode).style;
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
if(!_19){
this.scrollScrollBarTo(this.calcScrollBarPos(to));
}
};
this.slideTo=function(to,_1b,_1c){
this._runSlideAnimation(this.getPos(),to,_1b,_1c,this.containerNode,2);
this.slideScrollBarTo(to,_1b,_1c);
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
var _1d=function(_1e,dir){
var bar=_1e["_scrollBarNode"+dir];
if(!bar){
var _1f=_4.create("div",null,_1e.domNode);
var _20={position:"absolute",overflow:"hidden"};
if(dir=="V"){
_20.right="2px";
_20.width="5px";
}else{
_20.bottom=(_1e.isLocalFooter?_1e.fixedFooterHeight:0)+2+"px";
_20.height="5px";
}
_4.style(_1f,_20);
_1f.className="mblScrollBarWrapper";
_1e["_scrollBarWrapper"+dir]=_1f;
bar=_4.create("div",null,_1f);
_4.style(bar,{opacity:0.6,position:"absolute",backgroundColor:"#606060",fontSize:"1px",webkitBorderRadius:"2px",MozBorderRadius:"2px",webkitTransformOrigin:"0 0",zIndex:2147483647});
_4.style(bar,dir=="V"?{width:"5px"}:{height:"5px"});
_1e["_scrollBarNode"+dir]=bar;
}
return bar;
};
if(this._v&&!this._scrollBarV){
this._scrollBarV=_1d(this,"V");
}
if(this._h&&!this._scrollBarH){
this._scrollBarH=_1d(this,"H");
}
this.resetScrollBar();
};
this.hideScrollBar=function(){
var _21;
if(this.fadeScrollBar&&_4.isWebKit){
if(!_5.mobile._fadeRule){
var _22=_4.create("style",null,_4.doc.getElementsByTagName("head")[0]);
_22.textContent=".mblScrollableFadeScrollBar{"+"  -webkit-animation-duration: 1s;"+"  -webkit-animation-name: scrollableViewFadeScrollBar;}"+"@-webkit-keyframes scrollableViewFadeScrollBar{"+"  from { opacity: 0.6; }"+"  to { opacity: 0; }}";
_5.mobile._fadeRule=_22.sheet.cssRules[1];
}
_21=_5.mobile._fadeRule;
}
if(!this.scrollBar){
return;
}
var f=function(bar){
_4.style(bar,{opacity:0,webkitAnimationDuration:_4.isAndroid?"0s":""});
bar.className="mblScrollableFadeScrollBar";
};
if(this._scrollBarV){
f(this._scrollBarV);
this._scrollBarV=null;
}
if(this._scrollBarH){
f(this._scrollBarH);
this._scrollBarH=null;
}
};
this.calcScrollBarPos=function(to){
var pos={};
var dim=this._dim;
var f=function(_23,_24,t,d,c){
var y=Math.round((d-_24-8)/(d-c)*t);
if(y<-_24+5){
y=-_24+5;
}
if(y>_23-5){
y=_23-5;
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
this.slideScrollBarTo=function(to,_25,_26){
if(!this.scrollBar){
return;
}
var _27=this.calcScrollBarPos(this.getPos());
var _28=this.calcScrollBarPos(to);
if(this._v&&this._scrollBarV){
this._runSlideAnimation({y:_27.y},{y:_28.y},_25,_26,this._scrollBarV,0);
}
if(this._h&&this._scrollBarH){
this._runSlideAnimation({x:_27.x},{x:_28.x},_25,_26,this._scrollBarH,1);
}
};
this._runSlideAnimation=function(_29,to,_2a,_2b,_2c,idx){
if(_4.isWebKit){
this.setKeyframes(_29,to,idx);
_4.style(_2c,{webkitAnimationDuration:_2a+"s",webkitAnimationTimingFunction:_2b});
_4.addClass(_2c,"mblScrollableScrollTo"+idx);
if(idx==2){
this.scrollTo(to,true,_2c);
}else{
this.scrollScrollBarTo(to);
}
}else{
if(_4.fx&&_4.fx.easing&&_2a){
var s=_4.fx.slideTo({node:_2c,duration:_2a*1000,left:to.x,top:to.y,easing:(_2b=="ease-out")?_4.fx.easing.quadOut:_4.fx.easing.linear}).play();
if(idx==2){
_4.connect(s,"onEnd",this,"onFlickAnimationEnd");
}
}else{
if(idx==2){
this.scrollTo(to,false,_2c);
this.onFlickAnimationEnd();
}else{
this.scrollScrollBarTo(to);
}
}
}
};
this.resetScrollBar=function(){
var f=function(_2d,bar,d,c,hd,v){
if(!bar){
return;
}
var _2e={};
_2e[v?"top":"left"]=hd+4+"px";
_2e[v?"height":"width"]=d-8+"px";
_4.style(_2d,_2e);
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
var _2f=this;
setTimeout(function(){
_2f.hideScrollBar();
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
this.setKeyframes=function(_30,to,idx){
if(!_5.mobile._rule){
_5.mobile._rule=[];
}
if(!_5.mobile._rule[idx]){
var _31=_4.create("style",null,_4.doc.getElementsByTagName("head")[0]);
_31.textContent=".mblScrollableScrollTo"+idx+"{-webkit-animation-name: scrollableViewScroll"+idx+";}"+"@-webkit-keyframes scrollableViewScroll"+idx+"{}";
_5.mobile._rule[idx]=_31.sheet.cssRules[1];
}
var _32=_5.mobile._rule[idx];
if(_32){
if(_30){
_32.deleteRule("from");
_32.insertRule("from { -webkit-transform: "+this.makeTranslateStr(_30)+"; }");
}
if(to){
if(to.x===undefined){
to.x=_30.x;
}
if(to.y===undefined){
to.y=_30.y;
}
_32.deleteRule("to");
_32.insertRule("to { -webkit-transform: "+this.makeTranslateStr(to)+"; }");
}
}
};
this.setSelectable=function(_33,_34){
_33.style.KhtmlUserSelect=_34?"auto":"none";
_33.style.MozUserSelect=_34?"":"none";
_33.onselectstart=_34?null:function(){
return false;
};
if(_4.isIE){
_33.unselectable=_34?"":"on";
_4.forEach(_33.getElementsByTagName("*"),function(n){
n.unselectable=_34?"":"on";
});
}
};
if(_4.isWebKit){
var _35=_4.doc.createElement("div");
_35.style.webkitTransform="translate3d(0px,1px,0px)";
_4.doc.documentElement.appendChild(_35);
var v=_4.doc.defaultView.getComputedStyle(_35,"")["-webkit-transform"];
_5.mobile.hasTranslate3d=v&&v.indexOf("matrix")===0;
_4.doc.documentElement.removeChild(_35);
_5.mobile.hasTouch=(typeof _4.doc.documentElement.ontouchstart!="undefined"&&navigator.appVersion.indexOf("Mobile")!=-1)||!!_4.isAndroid;
}
};
return dojox.mobile.scrollable;
});
