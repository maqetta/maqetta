/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/robot",["dojo","doh/robot","dojo/window"],function(_1){
_1.experimental("dojo.robot");
_1.mixin(doh.robot,{_resolveNode:function(n){
if(typeof n=="function"){
n=n();
}
return n?_1.byId(n):null;
},_scrollIntoView:function(n){
var dr=doh.robot,p=null;
_1.forEach(dr._getWindowChain(n),function(w){
_1.withGlobal(w,function(){
var p2=_1.position(n,false),b=_1._getPadBorderExtents(n),_2=null;
if(!p){
p=p2;
}else{
_2=p;
p={x:p.x+p2.x+b.l,y:p.y+p2.y+b.t,w:p.w,h:p.h};
}
_1.window.scrollIntoView(n,p);
p2=_1.position(n,false);
if(!_2){
p=p2;
}else{
p={x:_2.x+p2.x+b.l,y:_2.y+p2.y+b.t,w:p.w,h:p.h};
}
n=w.frameElement;
});
});
},_position:function(n){
var p=null,M=Math.max,m=Math.min;
_1.forEach(doh.robot._getWindowChain(n),function(w){
_1.withGlobal(w,function(){
var p2=_1.position(n,false),b=_1._getPadBorderExtents(n);
if(!p){
p=p2;
}else{
var _3;
_1.withGlobal(n.contentWindow,function(){
_3=_1.window.getBox();
});
p2.r=p2.x+_3.w;
p2.b=p2.y+_3.h;
p={x:M(p.x+p2.x,p2.x)+b.l,y:M(p.y+p2.y,p2.y)+b.t,r:m(p.x+p2.x+p.w,p2.r)+b.l,b:m(p.y+p2.y+p.h,p2.b)+b.t};
p.w=p.r-p.x;
p.h=p.b-p.y;
}
n=w.frameElement;
});
});
return p;
},_getWindowChain:function(n){
var cW=_1.window.get(n.ownerDocument);
var _4=[cW];
var f=cW.frameElement;
return (cW==_1.global||f==null)?_4:_4.concat(doh.robot._getWindowChain(f));
},scrollIntoView:function(_5,_6){
doh.robot.sequence(function(){
doh.robot._scrollIntoView(doh.robot._resolveNode(_5));
},_6);
},mouseMoveAt:function(_7,_8,_9,_a,_b){
doh.robot._assertRobot();
_9=_9||100;
this.sequence(function(){
_7=doh.robot._resolveNode(_7);
doh.robot._scrollIntoView(_7);
var _c=doh.robot._position(_7);
if(_b===undefined){
_a=_c.w/2;
_b=_c.h/2;
}
var x=_c.x+_a;
var y=_c.y+_b;
doh.robot._mouseMove(x,y,false,_9);
},_8,_9);
}});
return doh.robot;
});
