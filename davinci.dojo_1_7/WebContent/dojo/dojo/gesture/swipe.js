/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/gesture/swipe",["dojo","../gesture"],function(_1,_2){
var _3=_1.declare(null,{swipeTimeout:300,swipeSpeed:600,swipeRange:60,swipeDirection:{none:0,up:1,down:2,left:4,right:8},swipeContext:{x:0,y:0,t:0},defaultEvent:"swipe",subEvents:["up","right","down","left"],constructor:function(_4){
_1.mixin(this,_4);
},press:function(_5,e){
this.swipeContext.t=new Date().getTime();
this.swipeContext.x=e.screenX;
this.swipeContext.y=e.screenY;
},release:function(_6,e){
var t=(new Date().getTime()-this.swipeContext.t);
if(t>this.swipeTimeout){
return;
}
var dx=e.screenX-this.swipeContext.x,dy=e.screenY-this.swipeContext.y,_7=(dx>0?this.swipeDirection.right:dx<0?this.swipeDirection.left:this.swipeDirection.none),_8=(dy>0?this.swipeDirection.down:dy<0?this.swipeDirection.up:this.swipeDirection.none);
if(_7===this.swipeDirection.none&&_8===this.swipeDirection.none){
return;
}
dx=Math.abs(dx);
dy=Math.abs(dy);
if(dx>dy){
if(dx/t*1000<this.swipeSpeed){
return;
}
switch(dy>this.swipeRange?this.swipeDirection.none:_7){
case this.swipeDirection.left:
_2.fire(_6,"swipe.left",e);
break;
case this.swipeDirection.right:
_2.fire(_6,"swipe.right",e);
break;
default:
return;
}
}else{
if(dy/t*1000<this.swipeSpeed){
return;
}
switch(dx>this.swipeRange?this.swipeDirection.none:_8){
case this.swipeDirection.up:
_2.fire(_6,"swipe.up",e);
break;
case this.swipeDirection.down:
_2.fire(_6,"swipe.down",e);
break;
default:
return;
}
}
_2.fire(_6,"swipe",e);
}});
_1.gesture.swipe=new _3();
_1.gesture.swipe.Swipe=_3;
_2.register(_1.gesture.swipe);
return _1.gesture.swipe;
});
