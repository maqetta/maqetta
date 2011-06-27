/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/image/Magnifier",["dojo","dojox","dojox/gfx","./MagnifierLite"],function(_1,_2){
_1.getObject("image",true,_2);
return _1.declare("dojox.image.Magnifier",_2.image.MagnifierLite,{_createGlass:function(){
this.glassNode=_1.create("div",{style:{height:this.glassSize+"px",width:this.glassSize+"px"},"className":"glassNode"},_1.body());
this.surfaceNode=_1.create("div",null,this.glassNode);
this.surface=_2.gfx.createSurface(this.surfaceNode,this.glassSize,this.glassSize);
this.img=this.surface.createImage({src:this.domNode.src,width:this._zoomSize.w,height:this._zoomSize.h});
},_placeGlass:function(e){
var x=e.pageX-2,y=e.pageY-2,_3=this.offset.x+this.offset.w+2,_4=this.offset.y+this.offset.h+2;
if(x<this.offset.x||y<this.offset.y||x>_3||y>_4){
this._hideGlass();
}else{
this.inherited(arguments);
}
},_setImage:function(e){
var _5=(e.pageX-this.offset.x)/this.offset.w,_6=(e.pageY-this.offset.y)/this.offset.h,x=(this._zoomSize.w*_5*-1)+(this.glassSize*_5),y=(this._zoomSize.h*_6*-1)+(this.glassSize*_6);
this.img.setShape({x:x,y:y});
}});
});
