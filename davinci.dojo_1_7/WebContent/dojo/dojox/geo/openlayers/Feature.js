/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel","dojo/_base/declare","dojox/geo/openlayers/Map"],function(_1,_2,_3){
return _1.declare("dojox.geo.openlayers.Feature",null,{constructor:function(){
this._layer=null;
this._coordSys=dojox.geo.openlayers.EPSG4326;
},getCoordinateSystem:function(){
return this._coordSys;
},setCoordinateSystem:function(cs){
this._coordSys=cs;
},getLayer:function(){
return this._layer;
},_setLayer:function(l){
this._layer=l;
},render:function(){
},remove:function(){
},_getLocalXY:function(p){
var x=p.x;
var y=p.y;
var _4=this.getLayer();
var _5=_4.olLayer.map.getResolution();
var _6=_4.olLayer.getExtent();
var rx=(x/_5+(-_6.left/_5));
var ry=((_6.top/_5)-y/_5);
return [rx,ry];
}});
});
