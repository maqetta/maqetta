/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/Map",["dojo/_base/kernel","dojo/_base/declare","dojox/main","dojo/_base/lang","dojo/_base/array","dojo/_base/json","dojox/geo/openlayers/TouchInteractionSupport","dojox/geo/openlayers/Layer","dojox/geo/openlayers/Patch"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){
_1.experimental("dojox.geo.openlayers.Map");
var _a=_1.getObject("geo.openlayers.BaseLayerType",true,_3);
_3.geo.openlayers.BaseLayerType={OSM:"OSM",WMS:"WMS",GOOGLE:"Google",VIRTUAL_EARTH:"VirtualEarth",BING:"VirtualEarth",YAHOO:"Yahoo",ARCGIS:"ArcGIS"};
var _b=_1.getObject("geo.openlayers",true,_3);
_3.geo.openlayers.EPSG4326=new OpenLayers.Projection("EPSG:4326");
var re=/^\s*(\d{1,3})[D�]\s*(\d{1,2})[M']\s*(\d{1,2}\.?\d*)\s*(S|"|'')\s*([NSEWnsew]{0,1})\s*$/i;
_3.geo.openlayers.parseDMS=function(v,_c){
var _d=re.exec(v);
if(_d==null||_d.length<5){
return parseFloat(v);
}
var d=parseFloat(_d[1]);
var m=parseFloat(_d[2]);
var s=parseFloat(_d[3]);
var _e=_d[5];
if(_c){
var lc=_e.toLowerCase();
var dd=d+(m+s/60)/60;
if(lc=="w"||lc=="s"){
dd=-dd;
}
return dd;
}
return [d,m,s,_e];
};
return _1.declare("dojox.geo.openlayers.Map",null,{olMap:null,_tp:null,constructor:function(_f,_10){
if(!_10){
_10={};
}
if(_10.patchOpenLayers){
_3.geo.openlayers.Patch.patchOpenLayers();
}
_f=_1.byId(_f);
this._tp={x:0,y:0};
var _11=_10.openLayersMapOptions;
if(!_11){
_11={controls:[new OpenLayers.Control.ScaleLine({maxWidth:200}),new OpenLayers.Control.Navigation()]};
}
if(_10.accessible){
var kbd=new OpenLayers.Control.KeyboardDefaults();
if(!_11.controls){
_11.controls=[];
}
_11.controls.push(kbd);
}
var _12=_10.baseLayerType;
if(!_12){
_12=_3.geo.openlayers.BaseLayerType.OSM;
}
_1.style(_f,{width:"100%",height:"100%",dir:"ltr"});
var map=new OpenLayers.Map(_f,_11);
this.olMap=map;
this._layerDictionary={olLayers:[],layers:[]};
if(_10.touchHandler){
this._touchControl=new _7(map);
}
var _13=this._createBaseLayer(_10);
this.addLayer(_13);
this.initialFit(_10);
},initialFit:function(_14){
var o=_14.initialLocation;
if(o==null){
o=[-160,70,160,-70];
}
this.fitTo(o);
},setBaseLayerType:function(_15){
if(_15==this.baseLayerType){
return;
}
var o=null;
if(typeof _15=="string"){
o={baseLayerName:_15,baseLayerType:_15};
this.baseLayerType=_15;
}else{
if(typeof _15=="object"){
o=_15;
this.baseLayerType=o.baseLayerType;
}
}
var bl=null;
if(o!=null){
bl=this._createBaseLayer(o);
if(bl!=null){
var olm=this.olMap;
var ob=olm.getZoom();
var oc=olm.getCenter();
var _16=!!oc&&!!olm.baseLayer&&!!olm.baseLayer.map;
if(_16){
var _17=olm.getProjectionObject();
if(_17!=null){
oc=oc.transform(_17,_3.geo.openlayers.EPSG4326);
}
}
var old=olm.baseLayer;
if(old!=null){
var l=this._getLayer(old);
this.removeLayer(l);
}
if(bl!=null){
this.addLayer(bl);
}
if(_16){
_17=olm.getProjectionObject();
if(_17!=null){
oc=oc.transform(_3.geo.openlayers.EPSG4326,_17);
}
olm.setCenter(oc,ob);
}
}
}
return bl;
},getBaseLayerType:function(){
return this.baseLayerType;
},getScale:function(_18){
var _19;
var om=this.olMap;
if(_18){
var _1a=om.getUnits();
if(!_1a){
return;
}
var _1b=OpenLayers.INCHES_PER_UNIT;
_19=(om.getGeodesicPixelSize().w||0.000001)*_1b["km"]*OpenLayers.DOTS_PER_INCH;
}else{
_19=om.getScale();
}
return _19;
},getOLMap:function(){
return this.olMap;
},_createBaseLayer:function(_1c){
var _1d=null;
var _1e=_1c.baseLayerType;
var url=_1c.baseLayerUrl;
var _1f=_1c.baseLayerName;
var _20=_1c.baseLayerOptions;
if(!_1f){
_1f=_1e;
}
if(!_20){
_20={};
}
switch(_1e){
case _3.geo.openlayers.BaseLayerType.OSM:
_20.transitionEffect="resize";
_1d=new _8(_1f,{olLayer:new OpenLayers.Layer.OSM(_1f,url,_20)});
break;
case _3.geo.openlayers.BaseLayerType.WMS:
if(!url){
url="http://labs.metacarta.com/wms/vmap0";
if(!_20.layers){
_20.layers="basic";
}
}
_1d=new _8(_1f,{olLayer:new OpenLayers.Layer.WMS(_1f,url,_20,{transitionEffect:"resize"})});
break;
case _3.geo.openlayers.BaseLayerType.GOOGLE:
_1d=new _8(_1f,{olLayer:new OpenLayers.Layer.Google(_1f,_20)});
break;
case _3.geo.openlayers.BaseLayerType.VIRTUAL_EARTH:
_1d=new _8(_1f,{olLayer:new OpenLayers.Layer.VirtualEarth(_1f,_20)});
break;
case _3.geo.openlayers.BaseLayerType.YAHOO:
_1d=new _8(_1f,{olLayer:new OpenLayers.Layer.Yahoo(_1f,_20)});
break;
case _3.geo.openlayers.BaseLayerType.ARCGIS:
if(!url){
url="http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/export";
}
_1d=new _8(_1f,{olLayer:new OpenLayers.Layer.ArcGIS93Rest(_1f,url,_20,{})});
break;
}
if(_1d==null){
if(_1e instanceof OpenLayers.Layer){
_1d=_1e;
}else{
_20.transitionEffect="resize";
_1d=new _8(_1f,{olLayer:new OpenLayers.Layer.OSM(_1f,url,_20)});
this.baseLayerType=_3.geo.openlayers.BaseLayerType.OSM;
}
}
return _1d;
},removeLayer:function(_21){
var om=this.olMap;
var i=_1.indexOf(this._layerDictionary.layers,_21);
if(i>0){
this._layerDictionary.layers.splice(i,1);
}
var oll=_21.olLayer;
var j=_1.indexOf(this._layerDictionary.olLayers,oll);
if(j>0){
this._layerDictionary.olLayers.splice(i,j);
}
om.removeLayer(oll,false);
},layerIndex:function(_22,_23){
var olm=this.olMap;
if(!_23){
return olm.getLayerIndex(_22.olLayer);
}
olm.raiseLayer(_22.olLayer,_23);
this._layerDictionary.layers.sort(function(l1,l2){
return olm.getLayerIndex(l1.olLayer)-olm.getLayerIndex(l2.olLayer);
});
this._layerDictionary.olLayers.sort(function(l1,l2){
return olm.getLayerIndex(l1)-olm.getLayerIndex(l2);
});
return _23;
},addLayer:function(_24){
_24.dojoMap=this;
var om=this.olMap;
var ol=_24.olLayer;
this._layerDictionary.olLayers.push(ol);
this._layerDictionary.layers.push(_24);
om.addLayer(ol);
_24.added();
},_getLayer:function(ol){
var i=_1.indexOf(this._layerDictionary.olLayers,ol);
if(i!=-1){
return this._layerDictionary.layers[i];
}
return null;
},getLayer:function(_25,_26){
var om=this.olMap;
var ols=om.getBy("layers",_25,_26);
var ret=[];
_1.forEach(ols,function(ol){
ret.push(this._getLayer(ol));
},this);
return ret;
},getLayerCount:function(){
var om=this.olMap;
if(om.layers==null){
return 0;
}
return om.layers.length;
},fitTo:function(o){
var map=this.olMap;
var _27=_3.geo.openlayers.EPSG4326;
if(o==null){
var c=this.transformXY(0,0,_27);
map.setCenter(new OpenLayers.LonLat(c.x,c.y));
return;
}
var b=null;
if(typeof o=="string"){
var j=_1.fromJson(o);
}else{
j=o;
}
var ul;
var lr;
if(j.hasOwnProperty("bounds")){
var a=j.bounds;
b=new OpenLayers.Bounds();
ul=this.transformXY(a[0],a[1],_27);
b.left=ul.x;
b.top=ul.y;
lr=this.transformXY(a[2],a[3],_27);
b.right=lr.x;
b.bottom=lr.y;
}
if(b==null){
if(j.hasOwnProperty("position")){
var p=j.position;
var e=j.hasOwnProperty("extent")?j.extent:1;
if(typeof e=="string"){
e=parseFloat(e);
}
b=new OpenLayers.Bounds();
ul=this.transformXY(p[0]-e,p[1]+e,_27);
b.left=ul.x;
b.top=ul.y;
lr=this.transformXY(p[0]+e,p[1]-e,_27);
b.right=lr.x;
b.bottom=lr.y;
}
}
if(b==null){
if(o.length==4){
b=new OpenLayers.Bounds();
if(false){
b.left=o[0];
b.top=o[1];
b.right=o[2];
b.bottom=o[3];
}else{
ul=this.transformXY(o[0],o[1],_27);
b.left=ul.x;
b.top=ul.y;
lr=this.transformXY(o[2],o[3],_27);
b.right=lr.x;
b.bottom=lr.y;
}
}
}
if(b!=null){
map.zoomToExtent(b,true);
}
},transform:function(p,_28,to){
return this.transformXY(p.x,p.y,_28,to);
},transformXY:function(x,y,_29,to){
var tp=this._tp;
tp.x=x;
tp.y=y;
if(!_29){
_29=_3.geo.openlayers.EPSG4326;
}
if(!to){
to=this.olMap.getProjectionObject();
}
tp=OpenLayers.Projection.transform(tp,_29,to);
return tp;
}});
});
