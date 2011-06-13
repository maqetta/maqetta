/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/connect","dojo/_base/window","dojo/_base/html"],function(_1,_2,_3,_4,_5,_6){
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
this._mouseDragListener=_1.connect(node,"onmousemove",this,this._mouseDragHandler);
this._mouseUpClickListener=this._map.surface.connect("onmouseup",this,this._mouseUpClickHandler);
this._mouseUpListener=this._map.surface.connect("onmouseup",this,this._mouseUpHandler);
this._map.surface.rawNode.setCapture();
}
},_mouseUpClickHandler:function(_15){
if(!this._cancelMouseClick){
this._mouseClickHandler(_15);
}
this._cancelMouseClick=false;
},_mouseUpHandler:function(_16){
_1.stopEvent(_16);
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
},_getFeatureFromMouseEvent:function(_17){
var _18=null;
if(_17.gfxTarget&&_17.gfxTarget.getParent){
_18=this._map.mapObj.features[_17.gfxTarget.getParent().id];
}
return _18;
},_mouseMoveHandler:function(_19){
if(this._mouseDragListener&&this._panEnabled){
return;
}
var _1a=this._getFeatureFromMouseEvent(_19);
if(_1a!=this._currentFeature){
if(this._currentFeature){
this._currentFeature._onmouseoutHandler();
}
this._currentFeature=_1a;
if(_1a){
_1a._onmouseoverHandler();
}
}
if(_1a){
_1a._onmousemoveHandler(_19);
}
},_mouseDragHandler:function(_1b){
_1.stopEvent(_1b);
var dx=Math.abs(_1b.pageX-this._screenClickLocation.x);
var dy=Math.abs(_1b.pageY-this._screenClickLocation.y);
if(!this._cancelMouseClick&&(dx>this.mouseClickThreshold||dy>this.mouseClickThreshold)){
this._cancelMouseClick=true;
if(this._panEnabled){
this._map.mapObj.marker.hide();
}
}
if(!this._panEnabled){
return;
}
var _1c=this._map._getContainerBounds();
var _1d=_1b.pageX-_1c.x,_1e=_1b.pageY-_1c.y;
var _1f=this._map.screenCoordsToMapCoords(_1d,_1e);
var _20=_1f.x-this._mapClickLocation.x;
var _21=_1f.y-this._mapClickLocation.y;
var _22=this._map.getMapCenter();
this._map.setMapCenter(_22.x-_20,_22.y-_21);
},_mouseWheelHandler:function(_23){
_1.stopEvent(_23);
this._map.mapObj.marker.hide();
var _24=this._map._getContainerBounds();
var _25=_23.pageX-_24.x,_26=_23.pageY-_24.y;
var _27=this._map.screenCoordsToMapCoords(_25,_26);
var _28=_23[(_1.isMozilla?"detail":"wheelDelta")]/(_1.isMozilla?-3:120);
var _29=Math.pow(1.2,_28);
this._map.setMapScaleAt(this._map.getMapScale()*_29,_27.x,_27.y,false);
this._map.mapObj.marker._needTooltipRefresh=true;
}});
});
