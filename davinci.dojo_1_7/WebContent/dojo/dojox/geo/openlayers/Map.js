/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel","dojo/_base/declare","dojox/main","dojo/_base/lang","dojo/_base/array","dojo/_base/json","dojox/geo/openlayers/TouchInteractionSupport","dojox/geo/openlayers/Layer"],function(_1,_2,_3,_4,_5,_6,_7,_8){
_1.experimental("dojox.geo.openlayers.Map");
var _9=_1.getObject("geo.openlayers.BaseLayerType",true,_3);
_3.geo.openlayers.BaseLayerType={OSM:"OSM",WMS:"WMS",GOOGLE:"Google",VIRTUAL_EARTH:"VirtualEarth",BING:"VirtualEarth",YAHOO:"Yahoo",ARCGIS:"ArcGIS"};
var _a=_1.getObject("geo.openlayers",true,_3);
_3.geo.openlayers.EPSG4326=new OpenLayers.Projection("EPSG:4326");
return _1.declare("dojox.geo.openlayers.Map",null,{olMap:null,_tp:null,constructor:function(_b,_c){
_b=_1.byId(_b);
this._tp={x:0,y:0};
if(!_c){
_c={};
}
var _d=_c.openLayersMapOptions;
if(!_d){
_d={controls:[new OpenLayers.Control.ScaleLine({maxWidth:200}),new OpenLayers.Control.Navigation()]};
}
var _e=_c.baseLayerType;
if(!_e){
_e=_3.geo.openlayers.BaseLayerType.OSM;
}
_1.style(_b,{width:"100%",height:"100%",dir:"ltr"});
var _f=new OpenLayers.Map(_b,_d);
this.olMap=_f;
this._layerDictionary={olLayers:[],layers:[]};
if(_c.touchHandler){
this._touchControl=new _7(_f);
}
var _10=this._createBaseLayer(_c);
this.addLayer(_10);
this.initialFit(_c);
},initialFit:function(_11){
var o=_11.initialLocation;
if(o==null){
o=[-160,70,160,-70];
}
this.fitTo(o);
},setBaseLayerType:function(_12){
if(_12==this.baseLayerType){
return;
}
var o=null;
if(typeof _12=="string"){
o={baseLayerName:_12,baseLayerType:_12};
this.baseLayerType=_12;
}else{
if(typeof _12=="object"){
o=_12;
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
var _13=!!oc&&!!olm.baseLayer&&!!olm.baseLayer.map;
if(_13){
var _14=olm.getProjectionObject();
if(_14!=null){
oc=oc.transform(_14,_3.geo.openlayers.EPSG4326);
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
if(_13){
_14=olm.getProjectionObject();
if(_14!=null){
oc=oc.transform(_3.geo.openlayers.EPSG4326,_14);
}
olm.setCenter(oc,ob);
}
}
}
return bl;
},getBaseLayerType:function(){
return this.baseLayerType;
},getScale:function(_15){
var _16;
var om=this.olMap;
if(_15){
var _17=om.getUnits();
if(!_17){
return;
}
var _18=OpenLayers.INCHES_PER_UNIT;
_16=(om.getGeodesicPixelSize().w||0.000001)*_18["km"]*OpenLayers.DOTS_PER_INCH;
}else{
_16=om.getScale();
}
return _16;
},getOLMap:function(){
return this.olMap;
},_createBaseLayer:function(_19){
var _1a=null;
var _1b=_19.baseLayerType;
var url=_19.baseLayerUrl;
var _1c=_19.baseLayerName;
var _1d=_19.baseLayerOptions;
if(!_1c){
_1c=_1b;
}
if(!_1d){
_1d={};
}
switch(_1b){
case _3.geo.openlayers.BaseLayerType.OSM:
_1d.transitionEffect="resize";
_1a=new _8(_1c,{olLayer:new OpenLayers.Layer.OSM(_1c,url,_1d)});
break;
case _3.geo.openlayers.BaseLayerType.WMS:
if(!url){
url="http://labs.metacarta.com/wms/vmap0";
if(!_1d.layers){
_1d.layers="basic";
}
}
_1a=new _8(_1c,{olLayer:new OpenLayers.Layer.WMS(_1c,url,_1d,{transitionEffect:"resize"})});
break;
case _3.geo.openlayers.BaseLayerType.GOOGLE:
_1a=new _8(_1c,{olLayer:new OpenLayers.Layer.Google(_1c,_1d)});
break;
case _3.geo.openlayers.BaseLayerType.VIRTUAL_EARTH:
_1a=new _8(_1c,{olLayer:new OpenLayers.Layer.VirtualEarth(_1c,_1d)});
break;
case _3.geo.openlayers.BaseLayerType.YAHOO:
_1a=new _8(_1c,{olLayer:new OpenLayers.Layer.Yahoo(_1c,_1d)});
break;
case _3.geo.openlayers.BaseLayerType.ARCGIS:
if(!url){
url="http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/export";
}
_1a=new _8(_1c,{olLayer:new OpenLayers.Layer.ArcGIS93Rest(_1c,url,_1d,{})});
break;
}
if(_1a==null){
if(_1b instanceof OpenLayers.Layer){
_1a=_1b;
}else{
_1d.transitionEffect="resize";
_1a=new _8(_1c,{olLayer:new OpenLayers.Layer.OSM(_1c,url,_1d)});
this.baseLayerType=_3.geo.openlayers.BaseLayerType.OSM;
}
}
return _1a;
},removeLayer:function(_1e){
var om=this.olMap;
var oll=_1e.olLayer;
om.removeLayer(oll,false);
},addLayer:function(_1f){
_1f.dojoMap=this;
var om=this.olMap;
var ol=_1f.olLayer;
this._layerDictionary.olLayers.push(ol);
this._layerDictionary.layers.push(_1f);
om.addLayer(ol);
_1f.added();
},_getLayer:function(ol){
var i=_1.indexOf(this._layerDictionary.olLayers,ol);
if(i!=-1){
return this._layerDictionary.layers[i];
}
return null;
},getLayer:function(_20,_21){
var om=this.olMap;
var ols=om.getBy("layers",_20,_21);
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
var _22=_3.geo.openlayers.EPSG4326;
if(o==null){
var c=this.transformXY(0,0,_22);
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
ul=this.transformXY(a[0],a[1],_22);
b.left=ul.x;
b.top=ul.y;
lr=this.transformXY(a[2],a[3],_22);
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
ul=this.transformXY(p[0]-e,p[1]+e,_22);
b.left=ul.x;
b.top=ul.y;
lr=this.transformXY(p[0]+e,p[1]-e,_22);
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
ul=this.transformXY(o[0],o[1],_22);
b.left=ul.x;
b.top=ul.y;
lr=this.transformXY(o[2],o[3],_22);
b.right=lr.x;
b.bottom=lr.y;
}
}
}
if(b!=null){
map.zoomToExtent(b,true);
}
},transform:function(p,_23,to){
return this.transformXY(p.x,p.y,_23,to);
},transformXY:function(x,y,_24,to){
var tp=this._tp;
tp.x=x;
tp.y=y;
if(!_24){
_24=_3.geo.openlayers.EPSG4326;
}
if(!to){
to=this.olMap.getProjectionObject();
}
tp=OpenLayers.Projection.transform(tp,_24,to);
return tp;
}});
var re=/^\s*(\d{1,3})[D�]\s*(\d{1,2})[M']\s*(\d{1,2}\.?\d*)\s*(S|"|'')\s*([NSEWnsew]{0,1})\s*$/i;
_3.geo.openlayers.parseDMS=function(v,_25){
var res=re.exec(v);
if(res==null||res.length<5){
return parseFloat(v);
}
var d=parseFloat(res[1]);
var m=parseFloat(res[2]);
var s=parseFloat(res[3]);
var _26=res[5];
if(_25){
var lc=_26.toLowerCase();
var dd=d+(m+s/60)/60;
if(lc=="w"||lc=="s"){
dd=-dd;
}
return dd;
}
return [d,m,s,_26];
};
});
