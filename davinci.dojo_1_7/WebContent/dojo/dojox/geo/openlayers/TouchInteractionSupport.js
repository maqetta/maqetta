/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/TouchInteractionSupport",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/connect","dojo/_base/html","dojo/_base/lang","dojo/_base/event","dojo/_base/window"],function(_1,_2,_3,_4,_5,_6,_7){
return _1.declare("dojox.geo.openlayers.TouchInteractionSupport",null,{_map:null,_centerTouchLocation:null,_touchMoveListener:null,_touchEndListener:null,_initialFingerSpacing:null,_initialScale:null,_tapCount:null,_tapThreshold:null,_lastTap:null,constructor:function(_8){
this._map=_8;
this._centerTouchLocation=new OpenLayers.LonLat(0,0);
var _9=this._map.div;
_1.connect(_9,"touchstart",this,this._touchStartHandler);
_1.connect(_9,"touchmove",this,this._touchMoveHandler);
_1.connect(_9,"touchend",this,this._touchEndHandler);
this._tapCount=0;
this._lastTap={x:0,y:0};
this._tapThreshold=100;
},_getTouchBarycenter:function(_a){
var _b=_a.touches;
var _c=_b[0];
var _d=null;
if(_b.length>1){
_d=_b[1];
}else{
_d=_b[0];
}
var _e=_1.marginBox(this._map.div);
var _f=(_c.pageX+_d.pageX)/2-_e.l;
var _10=(_c.pageY+_d.pageY)/2-_e.t;
return {x:_f,y:_10};
},_getFingerSpacing:function(_11){
var _12=_11.touches;
var _13=-1;
if(_12.length>=2){
var dx=(_12[1].pageX-_12[0].pageX);
var dy=(_12[1].pageY-_12[0].pageY);
_13=Math.sqrt(dx*dx+dy*dy);
}
return _13;
},_isDoubleTap:function(_14){
var _15=false;
var _16=_14.touches;
if((this._tapCount>0)&&_16.length==1){
var dx=(_16[0].pageX-this._lastTap.x);
var dy=(_16[0].pageY-this._lastTap.y);
var _17=dx*dx+dy*dy;
if(_17<this._tapThreshold){
_15=true;
}else{
this._tapCount=0;
}
}
this._tapCount++;
this._lastTap.x=_16[0].pageX;
this._lastTap.y=_16[0].pageY;
setTimeout(_1.hitch(this,function(){
this._tapCount=0;
}),300);
return _15;
},_doubleTapHandler:function(_18){
var _19=_18.touches;
var _1a=_1.marginBox(this._map.div);
var _1b=_19[0].pageX-_1a.l;
var _1c=_19[0].pageY-_1a.t;
var _1d=this._map.getLonLatFromPixel(new OpenLayers.Pixel(_1b,_1c));
this._map.setCenter(new OpenLayers.LonLat(_1d.lon,_1d.lat),this._map.getZoom()+1);
},_touchStartHandler:function(_1e){
_1.stopEvent(_1e);
if(this._isDoubleTap(_1e)){
this._doubleTapHandler(_1e);
return;
}
var _1f=this._getTouchBarycenter(_1e);
this._centerTouchLocation=this._map.getLonLatFromPixel(new OpenLayers.Pixel(_1f.x,_1f.y));
this._initialFingerSpacing=this._getFingerSpacing(_1e);
this._initialScale=this._map.getScale();
if(!this._touchMoveListener){
this._touchMoveListener=_1.connect(_1.global,"touchmove",this,this._touchMoveHandler);
}
if(!this._touchEndListener){
this._touchEndListener=_1.connect(_1.global,"touchend",this,this._touchEndHandler);
}
},_touchEndHandler:function(_20){
_1.stopEvent(_20);
var _21=_20.touches;
if(_21.length==0){
if(this._touchMoveListener){
_1.disconnect(this._touchMoveListener);
this._touchMoveListener=null;
}
if(this._touchEndListener){
_1.disconnect(this._touchEndListener);
this._touchEndListener=null;
}
}else{
var _22=this._getTouchBarycenter(_20);
this._centerTouchLocation=this._map.getLonLatFromPixel(new OpenLayers.Pixel(_22.x,_22.y));
}
},_touchMoveHandler:function(_23){
_1.stopEvent(_23);
var _24=this._getTouchBarycenter(_23);
var _25=this._map.getLonLatFromPixel(new OpenLayers.Pixel(_24.x,_24.y));
var _26=_25.lon-this._centerTouchLocation.lon;
var _27=_25.lat-this._centerTouchLocation.lat;
var _28=1;
var _29=_23.touches;
if(_29.length>=2){
var _2a=this._getFingerSpacing(_23);
_28=_2a/this._initialFingerSpacing;
this._map.zoomToScale(this._initialScale/_28);
}
var _2b=this._map.getCenter();
this._map.setCenter(new OpenLayers.LonLat(_2b.lon-_26,_2b.lat-_27));
}});
});
