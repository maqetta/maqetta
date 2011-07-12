/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/manager/Canvas",["dojo","../util/oo","./Stencil"],function(_1){
dojox.drawing.manager.Canvas=dojox.drawing.util.oo.declare(function(_2){
_1.mixin(this,_2);
var _3=_1.contentBox(this.srcRefNode);
this.height=this.parentHeight=_3.h;
this.width=this.parentWidth=_3.w;
this.domNode=_1.create("div",{id:"canvasNode"},this.srcRefNode);
_1.style(this.domNode,{width:this.width,height:"auto"});
_1.setSelectable(this.domNode,false);
this.id=this.id||this.util.uid("surface");
this.gfxSurface=dojox.gfx.createSurface(this.domNode,this.width,this.height);
this.gfxSurface.whenLoaded(this,function(){
setTimeout(_1.hitch(this,function(){
this.surfaceReady=true;
if(_1.isIE){
}else{
if(dojox.gfx.renderer=="silverlight"){
this.id=this.domNode.firstChild.id;
}else{
}
}
this.underlay=this.gfxSurface.createGroup();
this.surface=this.gfxSurface.createGroup();
this.overlay=this.gfxSurface.createGroup();
this.surface.setTransform({dx:0,dy:0,xx:1,yy:1});
this.gfxSurface.getDimensions=_1.hitch(this.gfxSurface,"getDimensions");
if(_2.callback){
_2.callback(this.domNode);
}
}),500);
});
this._mouseHandle=this.mouse.register(this);
},{zoom:1,useScrollbars:true,baseClass:"drawingCanvas",resize:function(_4,_5){
this.parentWidth=_4;
this.parentHeight=_5;
this.setDimensions(_4,_5);
},setDimensions:function(_6,_7,_8,_9){
var sw=this.getScrollWidth();
this.width=Math.max(_6,this.parentWidth);
this.height=Math.max(_7,this.parentHeight);
if(this.height>this.parentHeight){
this.width-=sw;
}
if(this.width>this.parentWidth){
this.height-=sw;
}
this.mouse.resize(this.width,this.height);
this.gfxSurface.setDimensions(this.width,this.height);
this.domNode.parentNode.scrollTop=_9||0;
this.domNode.parentNode.scrollLeft=_8||0;
if(this.useScrollbars){
_1.style(this.domNode.parentNode,{overflowY:this.height>this.parentHeight?"scroll":"hidden",overflowX:this.width>this.parentWidth?"scroll":"hidden"});
}else{
_1.style(this.domNode.parentNode,{overflowY:"hidden",overflowX:"hidden"});
}
},setZoom:function(_a){
this.zoom=_a;
this.surface.setTransform({xx:_a,yy:_a});
this.setDimensions(this.width*_a,this.height*_a);
},onScroll:function(){
},getScrollOffset:function(){
return {top:this.domNode.parentNode.scrollTop,left:this.domNode.parentNode.scrollLeft};
},getScrollWidth:function(){
var p=_1.create("div");
p.innerHTML="<div style=\"width:50px;height:50px;overflow:hidden;position:absolute;top:0;left:-1000px;\"><div style=\"height:100px;\"></div>";
var _b=p.firstChild;
_1.body().appendChild(_b);
var _c=_1.contentBox(_b).h;
_1.style(_b,"overflow","scroll");
var _d=_c-_1.contentBox(_b).h;
_1.destroy(_b);
this.getScrollWidth=function(){
return _d;
};
return _d;
}});
return dojox.drawing.manager.Canvas;
});
