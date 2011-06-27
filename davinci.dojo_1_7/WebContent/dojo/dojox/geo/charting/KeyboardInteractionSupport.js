/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/charting/KeyboardInteractionSupport",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/connect","dojo/_base/html","dojox/lang/functional"],function(_1,_2,_3,_4,_5,_6){
return _1.declare("dojox.geo.charting.KeyboardInteractionSupport",null,{_map:null,_zoomEnabled:false,constructor:function(_7,_8){
this._map=_7;
if(_8){
this._zoomEnabled=_8.enableZoom;
}
},connect:function(){
var _9=_1.byId(this._map.container);
_1.attr(_9,{tabindex:0,role:"presentation","aria-label":"map"});
this._keydownListener=_1.connect(_9,"keydown",this,"keydownHandler");
this._onFocusListener=_1.connect(_9,"focus",this,"onFocus");
this._onBlurListener=_1.connect(_9,"blur",this,"onBlur");
},disconnect:function(){
_1.disconnect(this._keydownListener);
this._keydownListener=null;
_1.disconnect(this._onFocusListener);
this._onFocusListener=null;
_1.disconnect(this._onBlurListener);
this._onBlurListener=null;
},keydownHandler:function(e){
switch(e.keyCode){
case _1.keys.LEFT_ARROW:
this._directTo(-1,-1,1,-1);
break;
case _1.keys.RIGHT_ARROW:
this._directTo(-1,-1,-1,1);
break;
case _1.keys.UP_ARROW:
this._directTo(1,-1,-1,-1);
break;
case _1.keys.DOWN_ARROW:
this._directTo(-1,1,-1,-1);
break;
case _1.keys.SPACE:
if(this._map.selectedFeature&&!this._map.selectedFeature._isZoomIn&&this._zoomEnabled){
this._map.selectedFeature._zoomIn();
}
break;
case _1.keys.ESCAPE:
if(this._map.selectedFeature&&this._map.selectedFeature._isZoomIn&&this._zoomEnabled){
this._map.selectedFeature._zoomOut();
}
break;
default:
return;
}
_1.stopEvent(e);
},onFocus:function(e){
if(this._map.selectedFeature||this._map.focused){
return;
}
this._map.focused=true;
var _a,_b=false;
if(this._map.lastSelectedFeature){
_a=this._map.lastSelectedFeature;
}else{
var _c=this._map.getMapCenter(),_d=Infinity;
_6.forIn(this._map.mapObj.features,function(_e){
var _f=Math.sqrt(Math.pow(_e._center[0]-_c.x,2)+Math.pow(_e._center[1]-_c.y,2));
if(_f<_d){
_d=_f;
_a=_e;
}
});
_b=true;
}
if(_a){
if(_b){
_a._onclickHandler(null);
}else{
}
this._map.mapObj.marker.show(_a.id);
}
},onBlur:function(){
this._map.lastSelectedFeature=this._map.selectedFeature;
},_directTo:function(up,_10,_11,_12){
var _13=this._map.selectedFeature,_14=_13._center[0],_15=_13._center[1],_16=Infinity,_17=null;
_6.forIn(this._map.mapObj.features,function(_18){
var _19=Math.abs(_14-_18._center[0]),_1a=Math.abs(_15-_18._center[1]),_1b=_19+_1a;
if((up-_10)*(_15-_18._center[1])>0){
if(_19<_1a&&_16>_1b){
_16=_1b;
_17=_18;
}
}
if((_11-_12)*(_14-_18._center[0])>0){
if(_19>_1a&&_16>_1b){
_16=_1b;
_17=_18;
}
}
});
if(_17){
this._map.mapObj.marker.hide();
_17._onclickHandler(null);
this._map.mapObj.marker.show(_17.id);
}
}});
});
