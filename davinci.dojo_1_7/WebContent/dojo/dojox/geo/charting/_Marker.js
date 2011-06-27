/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/charting/_Marker",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","./_base"],function(_1,_2,_3){
return _1.declare("dojox.geo.charting._Marker",null,{_needTooltipRefresh:null,_map:null,constructor:function(_4,_5){
this._map=_5;
var _6=_5.mapObj;
this.features=_6.features;
this.markerData=_4;
_needTooltipRefresh=false;
},show:function(_7){
this.currentFeature=this.features[_7];
if(this._map.showTooltips&&this.currentFeature){
this.markerText=this.currentFeature.markerText||this.markerData[_7]||_7;
dojox.geo.charting.showTooltip(this.markerText,this.currentFeature.shape,["before"]);
}
this._needTooltipRefresh=false;
},hide:function(){
if(this._map.showTooltips&&this.currentFeature){
dojox.geo.charting.hideTooltip(this.currentFeature.shape);
}
this._needTooltipRefresh=false;
},_getGroupBoundingBox:function(_8){
var _9=_8.children;
var _a=_9[0];
var _b=_a.getBoundingBox();
this._arround=_1.clone(_b);
_1.forEach(_9,function(_c){
var _d=_c.getBoundingBox();
this._arround.x=Math.min(this._arround.x,_d.x);
this._arround.y=Math.min(this._arround.y,_d.y);
},this);
},_toWindowCoords:function(_e,_f,_10){
var _11=(_e.x-this.topLeft[0])*this.scale;
var _12=(_e.y-this.topLeft[1])*this.scale;
if(_1.isFF==3.5){
_e.x=_f.x;
_e.y=_f.y;
}else{
if(_1.isChrome){
_e.x=_10.x+_11;
_e.y=_10.y+_12;
}else{
_e.x=_f.x+_11;
_e.y=_f.y+_12;
}
}
_e.width=(this.currentFeature._bbox[2])*this.scale;
_e.height=(this.currentFeature._bbox[3])*this.scale;
_e.x+=_e.width/6;
_e.y+=_e.height/4;
}});
});
