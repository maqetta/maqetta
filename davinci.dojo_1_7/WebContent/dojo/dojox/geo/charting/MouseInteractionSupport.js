/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/charting/MouseInteractionSupport",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/connect","dojo/_base/window","dojo/_base/html"],function(_1,_2,_3,_4,_5,_6){
return _1.declare("dojox.geo.charting.MouseInteractionSupport",null,{_map:null,_mapClickLocation:null,_screenClickLocation:null,_mouseDragListener:null,_mouseUpListener:null,_mouseUpClickListener:null,_mouseDownListener:null,_mouseMoveListener:null,_mouseWheelListener:null,_currentFeature:null,_cancelMouseClick:null,_zoomEnabled:false,_panEnabled:false,_onDragStartListener:null,_onSelectStartListener:null,mouseClickThreshold:2,constructor:function(_7,_8){
this._map=_7;
this._mapClickLocation={x:0,y:0};
this._screenClickLocation={x:0,y:0};
this._cancelMouseClick=false;
if(_8){
this._zoomEnabled=_8.enableZoom;
this._panEnabled=_8.enablePan;
if(_8.mouseClickThreshold&&_8.mouseClickThreshold>0){
this.mouseClickThreshold=_8.mouseClickThreshold;
}
}
},setEnableZoom:function(_9){
if(_9&&!this._mouseWheelListener){
var _a=!_1.isMozilla?"onmousewheel":"DOMMouseScroll";
this._mouseWheelListener=this._map.surface.connect(_a,this,this._mouseWheelHandler);
}else{
if(!_9&&this._mouseWheelListener){
_1.disconnect(this._mouseWheelListener);
this._mouseWheelListener=null;
}
}
this._zoomEnabled=_9;
},setEnablePan:function(_b){
this._panEnabled=_b;
},connect:function(){
this._mouseMoveListener=this._map.surface.connect("onmousemove",this,this._mouseMoveHandler);
this._mouseDownListener=this._map.surface.connect("onmousedown",this,this._mouseDownHandler);
if(_1.isIE){
_onDragStartListener=_1.connect(_1.doc,"ondragstart",this,_1.stopEvent);
_onSelectStartListener=_1.connect(_1.doc,"onselectstart",this,_1.stopEvent);
}
this.setEnableZoom(this._zoomEnabled);
this.setEnablePan(this._panEnabled);
},disconnect:function(){
var _c=this._zoomEnabled;
this.setEnableZoom(false);
this._zoomEnabled=_c;
if(this._mouseMoveListener){
_1.disconnect(this._mouseMoveListener);
this._mouseMoveListener=null;
_1.disconnect(this._mouseDownListener);
this._mouseDownListener=null;
}
if(this._onDragStartListener){
_1.disconnect(this._onDragStartListener);
this._onDragStartListener=null;
_1.disconnect(this._onSelectStartListener);
this._onSelectStartListener=null;
}
},_mouseClickHandler:function(_d){
var _e=this._getFeatureFromMouseEvent(_d);
if(_e){
_e._onclickHandler(_d);
}else{
for(var _f in this._map.mapObj.features){
this._map.mapObj.features[_f].select(false);
}
this._map.onFeatureClick(null);
}
},_mouseDownHandler:function(_10){
this._map.focused=true;
this._cancelMouseClick=false;
this._screenClickLocation.x=_10.pageX;
this._screenClickLocation.y=_10.pageY;
var _11=this._map._getContainerBounds();
var _12=_10.pageX-_11.x,_13=_10.pageY-_11.y;
var _14=this._map.screenCoordsToMapCoords(_12,_13);
this._mapClickLocation.x=_14.x;
this._mapClickLocation.y=_14.y;
if(!_1.isIE){
this._mouseDragListener=_1.connect(_1.doc,"onmousemove",this,this._mouseDragHandler);
this._mouseUpClickListener=this._map.surface.connect("onmouseup",this,this._mouseUpClickHandler);
this._mouseUpListener=_1.connect(_1.doc,"onmouseup",this,this._mouseUpHandler);
}else{
var _15=_1.byId(this._map.container);
this._mouseDragListener=_1.connect(_15,"onmousemove",this,this._mouseDragHandler);
this._mouseUpClickListener=this._map.surface.connect("onmouseup",this,this._mouseUpClickHandler);
this._mouseUpListener=this._map.surface.connect("onmouseup",this,this._mouseUpHandler);
this._map.surface.rawNode.setCapture();
}
},_mouseUpClickHandler:function(_16){
if(!this._cancelMouseClick){
this._mouseClickHandler(_16);
}
this._cancelMouseClick=false;
},_mouseUpHandler:function(_17){
_1.stopEvent(_17);
this._map.mapObj.marker._needTooltipRefresh=true;
if(this._mouseDragListener){
_1.disconnect(this._mouseDragListener);
this._mouseDragListener=null;
}
if(this._mouseUpClickListener){
_1.disconnect(this._mouseUpClickListener);
this._mouseUpClickListener=null;
}
if(this._mouseUpListener){
_1.disconnect(this._mouseUpListener);
this._mouseUpListener=null;
}
if(_1.isIE){
this._map.surface.rawNode.releaseCapture();
}
},_getFeatureFromMouseEvent:function(_18){
var _19=null;
if(_18.gfxTarget&&_18.gfxTarget.getParent){
_19=this._map.mapObj.features[_18.gfxTarget.getParent().id];
}
return _19;
},_mouseMoveHandler:function(_1a){
if(this._mouseDragListener&&this._panEnabled){
return;
}
var _1b=this._getFeatureFromMouseEvent(_1a);
if(_1b!=this._currentFeature){
if(this._currentFeature){
this._currentFeature._onmouseoutHandler();
}
this._currentFeature=_1b;
if(_1b){
_1b._onmouseoverHandler();
}
}
if(_1b){
_1b._onmousemoveHandler(_1a);
}
},_mouseDragHandler:function(_1c){
_1.stopEvent(_1c);
var dx=Math.abs(_1c.pageX-this._screenClickLocation.x);
var dy=Math.abs(_1c.pageY-this._screenClickLocation.y);
if(!this._cancelMouseClick&&(dx>this.mouseClickThreshold||dy>this.mouseClickThreshold)){
this._cancelMouseClick=true;
if(this._panEnabled){
this._map.mapObj.marker.hide();
}
}
if(!this._panEnabled){
return;
}
var _1d=this._map._getContainerBounds();
var _1e=_1c.pageX-_1d.x,_1f=_1c.pageY-_1d.y;
var _20=this._map.screenCoordsToMapCoords(_1e,_1f);
var _21=_20.x-this._mapClickLocation.x;
var _22=_20.y-this._mapClickLocation.y;
var _23=this._map.getMapCenter();
this._map.setMapCenter(_23.x-_21,_23.y-_22);
},_mouseWheelHandler:function(_24){
_1.stopEvent(_24);
this._map.mapObj.marker.hide();
var _25=this._map._getContainerBounds();
var _26=_24.pageX-_25.x,_27=_24.pageY-_25.y;
var _28=this._map.screenCoordsToMapCoords(_26,_27);
var _29=_24[(_1.isMozilla?"detail":"wheelDelta")]/(_1.isMozilla?-3:120);
var _2a=Math.pow(1.2,_29);
this._map.setMapScaleAt(this._map.getMapScale()*_2a,_28.x,_28.y,false);
this._map.mapObj.marker._needTooltipRefresh=true;
}});
});
