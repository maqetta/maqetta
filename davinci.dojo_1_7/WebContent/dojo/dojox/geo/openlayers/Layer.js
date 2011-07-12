/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/Layer",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/_base/sniff"],function(_1,_2,_3,_4){
return _1.declare("dojox.geo.openlayers.Layer",null,{constructor:function(_5,_6){
var ol=_6?_6.olLayer:null;
if(!ol){
ol=_1.delegate(new OpenLayers.Layer(_5,_6));
}
this.olLayer=ol;
this._features=null;
this.olLayer.events.register("moveend",this,_1.hitch(this,this.moveTo));
},renderFeature:function(f){
f.render();
},getDojoMap:function(){
return this.dojoMap;
},addFeature:function(f){
if(_1.isArray(f)){
_1.forEach(f,function(_7){
this.addFeature(_7);
},this);
return;
}
if(this._features==null){
this._features=[];
}
this._features.push(f);
f._setLayer(this);
},removeFeature:function(f){
var ft=this._features;
if(ft==null){
return;
}
if(f instanceof Array){
f=f.slice(0);
_1.forEach(f,function(_8){
this.removeFeature(_8);
},this);
return;
}
var i=_1.indexOf(ft,f);
if(i!=-1){
ft.splice(i,1);
}
f._setLayer(null);
f.remove();
},removeFeatureAt:function(_9){
var ft=this._features;
var f=ft[_9];
if(!f){
return;
}
ft.splice(_9,1);
f._setLayer(null);
f.remove();
},getFeatures:function(){
return this._features;
},getFeatureAt:function(i){
if(this._features==null){
return undefined;
}
return this._features[i];
},getFeatureCount:function(){
if(this._features==null){
return 0;
}
return this._features.length;
},clear:function(){
var fa=this.getFeatures();
this.removeFeature(fa);
},moveTo:function(_a){
if(_a.zoomChanged){
if(this._features==null){
return;
}
_1.forEach(this._features,function(f){
this.renderFeature(f);
},this);
}
},redraw:function(){
if(_1.isIE){
setTimeout(_1.hitch(this,function(){
this.olLayer.redraw();
},0));
}else{
this.olLayer.redraw();
}
},added:function(){
}});
});
