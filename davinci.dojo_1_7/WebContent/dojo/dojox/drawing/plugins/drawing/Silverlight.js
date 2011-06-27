/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/plugins/drawing/Silverlight",["dojo","../_Plugin","../../util/oo"],function(_1){
_1.getObject("drawing.plugins.drawing",true,dojox);
dojox.drawing.plugins.drawing.Silverlight=dojox.drawing.util.oo.declare(function(_2){
if(dojox.gfx.renderer!="silverlight"){
return;
}
this.mouse=_2.mouse;
this.stencils=_2.stencils;
this.anchors=_2.anchors;
this.canvas=_2.canvas;
this.util=_2.util;
_1.connect(this.stencils,"register",this,function(_3){
var c1,c2,c3,c4,c5,_4=this;
var _5=function(){
c1=_3.container.connect("onmousedown",function(_6){
_6.superTarget=_3;
_4.mouse.down(_6);
});
};
_5();
c2=_1.connect(_3,"setTransform",this,function(){
});
c3=_1.connect(_3,"onBeforeRender",function(){
});
c4=_1.connect(_3,"onRender",this,function(){
});
c5=_1.connect(_3,"destroy",this,function(){
_1.forEach([c1,c2,c3,c4,c5],_1.disconnect,_1);
});
});
_1.connect(this.anchors,"onAddAnchor",this,function(_7){
var c1=_7.shape.connect("onmousedown",this.mouse,function(_8){
_8.superTarget=_7;
this.down(_8);
});
var c2=_1.connect(_7,"disconnectMouse",this,function(){
_1.disconnect(c1);
_1.disconnect(c2);
});
});
this.mouse._down=function(_9){
var _a=this._getXY(_9);
var x=_a.x-this.origin.x;
var y=_a.y-this.origin.y;
x*=this.zoom;
y*=this.zoom;
this.origin.startx=x;
this.origin.starty=y;
this._lastx=x;
this._lasty=y;
this.drawingType=this.util.attr(_9,"drawingType")||"";
var id=this._getId(_9);
var _b={x:x,y:y,id:id};
this.onDown(_b);
this._clickTime=new Date().getTime();
if(this._lastClickTime){
if(this._clickTime-this._lastClickTime<this.doublClickSpeed){
var _c=this.eventName("doubleClick");
console.warn("DOUBLE CLICK",_c,_b);
this._broadcastEvent(_c,_b);
}else{
}
}
this._lastClickTime=this._clickTime;
};
this.mouse.down=function(_d){
clearTimeout(this.__downInv);
if(this.util.attr(_d,"drawingType")=="surface"){
this.__downInv=setTimeout(_1.hitch(this,function(){
this._down(_d);
}),500);
return;
}
this._down(_d);
};
this.mouse._getXY=function(_e){
if(_e.pageX){
return {x:_e.pageX,y:_e.pageY,cancelBubble:true};
}
for(var nm in _e){
}
if(_e.x!==undefined){
return {x:_e.x+this.origin.x,y:_e.y+this.origin.y};
}else{
return {x:_e.pageX,y:_e.pageY};
}
};
this.mouse._getId=function(_f){
return this.util.attr(_f,"id");
};
this.util.attr=function(_10,_11,_12,_13){
if(!_10){
return false;
}
try{
var t;
if(_10.superTarget){
t=_10.superTarget;
}else{
if(_10.superClass){
t=_10.superClass;
}else{
if(_10.target){
t=_10.target;
}else{
t=_10;
}
}
}
if(_12!==undefined){
_10[_11]=_12;
return _12;
}
if(t.tagName){
if(_11=="drawingType"&&t.tagName.toLowerCase()=="object"){
return "surface";
}
var r=_1.attr(t,_11);
}
var r=t[_11];
return r;
}
catch(e){
if(!_13){
}
return false;
}
};
},{});
return dojox.drawing.plugins.drawing.Silverlight;
});
