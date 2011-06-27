/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/GfxLayer",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/connect","dojo/_base/html","dojox/gfx","dojox/gfx/_base","dojox/gfx/shape","dojox/gfx/path","dojox/geo/openlayers/Feature","dojox/geo/openlayers/Layer"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a){
return _1.declare("dojox.geo.openlayers.GfxLayer",dojox.geo.openlayers.Layer,{_viewport:null,constructor:function(_b,_c){
var s=dojox.gfx.createSurface(this.olLayer.div,100,100);
this._surface=s;
var vp;
if(_c&&_c.viewport){
vp=_c.viewport;
}else{
vp=s.createGroup();
}
this.setViewport(vp);
_1.connect(this.olLayer,"onMapResize",this,"onMapResize");
this.olLayer.getDataExtent=this.getDataExtent;
},getViewport:function(){
return this._viewport;
},setViewport:function(g){
if(this._viewport){
this._viewport.removeShape();
}
this._viewport=g;
this._surface.add(g);
},onMapResize:function(){
this._surfaceSize();
},setMap:function(_d){
this.inherited(arguments);
this._surfaceSize();
},getDataExtent:function(){
var _e=this._surface.getDimensions();
return _e;
},getSurface:function(){
return this._surface;
},_surfaceSize:function(){
var s=this.olLayer.map.getSize();
this._surface.setDimensions(s.w,s.h);
},moveTo:function(_f){
var s=_1.style(this.olLayer.map.layerContainerDiv);
var _10=parseInt(s.left);
var top=parseInt(s.top);
if(_f.zoomChanged||_10||top){
var d=this.olLayer.div;
_1.style(d,{left:-_10+"px",top:-top+"px"});
if(this._features==null){
return;
}
var vp=this.getViewport();
vp.setTransform(dojox.gfx.matrix.translate(_10,top));
this.inherited(arguments);
}
},added:function(){
this.inherited(arguments);
this._surfaceSize();
}});
});
