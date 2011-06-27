/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/image/MagnifierLite",["dojo","dijit","dojox/main","dijit/_Widget"],function(_1,_2,_3){
_1.experimental("dojox.image.MagnifierLite");
_1.getObject("image",true,_3);
return _1.declare("dojox.image.MagnifierLite",_2._Widget,{glassSize:125,scale:6,postCreate:function(){
this.inherited(arguments);
this._adjustScale();
this._createGlass();
this.connect(this.domNode,"onmouseenter","_showGlass");
this.connect(this.glassNode,"onmousemove","_placeGlass");
this.connect(this.img,"onmouseout","_hideGlass");
this.connect(window,"onresize","_adjustScale");
},_createGlass:function(){
var _4=this.glassNode=_1.create("div",{style:{height:this.glassSize+"px",width:this.glassSize+"px"},className:"glassNode"},_1.body());
this.surfaceNode=_4.appendChild(_1.create("div"));
this.img=_1.place(_1.clone(this.domNode),_4);
_1.style(this.img,{position:"relative",top:0,left:0,width:this._zoomSize.w+"px",height:this._zoomSize.h+"px"});
},_adjustScale:function(){
this.offset=_1.position(this.domNode,true);
this._imageSize={w:this.offset.w,h:this.offset.h};
this._zoomSize={w:this._imageSize.w*this.scale,h:this._imageSize.h*this.scale};
},_showGlass:function(e){
this._placeGlass(e);
_1.style(this.glassNode,{visibility:"visible",display:""});
},_hideGlass:function(e){
_1.style(this.glassNode,{visibility:"hidden",display:"none"});
},_placeGlass:function(e){
this._setImage(e);
var _5=Math.floor(this.glassSize/2);
_1.style(this.glassNode,{top:Math.floor(e.pageY-_5)+"px",left:Math.floor(e.pageX-_5)+"px"});
},_setImage:function(e){
var _6=(e.pageX-this.offset.x)/this.offset.w,_7=(e.pageY-this.offset.y)/this.offset.h,x=(this._zoomSize.w*_6*-1)+(this.glassSize*_6),y=(this._zoomSize.h*_7*-1)+(this.glassSize*_7);
_1.style(this.img,{top:y+"px",left:x+"px"});
},destroy:function(_8){
_1.destroy(this.glassNode);
this.inherited(arguments);
}});
});
