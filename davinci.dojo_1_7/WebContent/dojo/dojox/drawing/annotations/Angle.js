/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/annotations/Angle",["dojo","../util/oo","../util/positioning"],function(_1){
_1.getObject("drawing.annotations",true,dojox);
dojox.drawing.annotations.Angle=dojox.drawing.util.oo.declare(function(_2){
this.stencil=_2.stencil;
this.util=_2.stencil.util;
this.mouse=_2.stencil.mouse;
this.stencil.connectMult([["onDrag",this,"showAngle"],["onUp",this,"hideAngle"],["onTransformBegin",this,"showAngle"],["onTransform",this,"showAngle"],["onTransformEnd",this,"hideAngle"]]);
},{type:"dojox.drawing.tools.custom",angle:0,showAngle:function(){
if(!this.stencil.selected&&this.stencil.created){
return;
}
if(this.stencil.getRadius()<this.stencil.minimumSize){
this.hideAngle();
return;
}
var _3=this.getAngleNode();
var d=this.stencil.pointsToData();
var pt=dojox.drawing.util.positioning.angle({x:d.x1,y:d.y1},{x:d.x2,y:d.y2});
var sc=this.mouse.scrollOffset();
var mx=this.stencil.getTransform();
var dx=mx.dx/this.mouse.zoom;
var dy=mx.dy/this.mouse.zoom;
pt.x/=this.mouse.zoom;
pt.y/=this.mouse.zoom;
var x=this.stencil._offX+pt.x-sc.left+dx;
var y=this.stencil._offY+pt.y-sc.top+dy;
_1.style(_3,{left:x+"px",top:y+"px",align:pt.align});
var _4=this.stencil.getAngle();
if(this.stencil.style.zAxis&&this.stencil.shortType=="vector"){
_3.innerHTML=this.stencil.data.cosphi>0?"out of":"into";
}else{
if(this.stencil.shortType=="line"){
_3.innerHTML=this.stencil.style.zAxis?"out of":Math.ceil(_4%180);
}else{
_3.innerHTML=Math.ceil(_4);
}
}
},getAngleNode:function(){
if(!this._angleNode){
this._angleNode=_1.create("span",null,_1.body());
_1.addClass(this._angleNode,"textAnnotation");
_1.style(this._angleNode,"opacity",1);
}
return this._angleNode;
},hideAngle:function(){
if(this._angleNode&&_1.style(this._angleNode,"opacity")>0.9){
_1.fadeOut({node:this._angleNode,duration:500,onEnd:function(_5){
_1.destroy(_5);
}}).play();
this._angleNode=null;
}
}});
return dojox.drawing.annotations.Angle;
});
