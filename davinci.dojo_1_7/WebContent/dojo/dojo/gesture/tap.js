/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/gesture/tap",["dojo","../gesture"],function(_1,_2){
function _3(_4){
clearTimeout(_4);
delete _4;
};
var _5=_1.declare(null,{holdThreshold:500,doubleTapTimeout:250,tapRadius:8,tapContext:{x:0,y:0,t:0,c:0},defaultEvent:"tap",subEvents:["hold","doubletap"],constructor:function(_6){
_1.mixin(this,_6);
},press:function(_7,e){
this._initTap(e);
_3(_7.tapTimeOut);
_7.tapTimeOut=setTimeout(_1.hitch(this,function(){
if(this._isTap(e)){
_2.fire(_7,"tap.hold",e);
}
_3(_7.tapTimeOut);
this.tapContext.t=0;
this.tapContext.c=0;
}),this.holdThreshold);
},release:function(_8,e){
switch(this.tapContext.c){
case 1:
_2.fire(_8,"tap",e);
break;
case 2:
_2.fire(_8,"tap.doubletap",e);
break;
}
_3(_8.tapTimeOut);
},_initTap:function(e){
var ct=new Date().getTime();
if(ct-this.tapContext.t<=this.doubleTapTimeout){
this.tapContext.c++;
}else{
this.tapContext.c=1;
this.tapContext.x=e.screenX;
this.tapContext.y=e.screenY;
}
this.tapContext.t=ct;
},_isTap:function(e){
var dx=Math.abs(this.tapContext.x-e.screenX);
var dy=Math.abs(this.tapContext.y-e.screenY);
return dx<=this.tapRadius&&dy<=this.tapRadius;
}});
_1.gesture.tap=new _5();
_1.gesture.tap.Tap=_5;
_2.register(_1.gesture.tap);
return _1.gesture.tap;
});
