/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/charting/widget/Map",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/html","dijit/_Widget","dojox/geo/charting/Map"],function(_1,_2,_3,_4,_5,_6){
return _1.declare("dojox.geo.charting.widget.Map",dijit._Widget,{shapeData:"",dataStore:null,dataBindingAttribute:"",dataBindingValueFunction:null,markerData:"",series:"",adjustMapCenterOnResize:false,adjustMapScaleOnResize:false,animateOnResize:false,onFeatureClick:null,onFeatureOver:null,enableMouseSupport:false,enableTouchSupport:false,enableMouseZoom:false,enableMousePan:false,enableKeyboardSupport:false,showTooltips:false,enableFeatureZoom:true,colorAnimationDuration:0,mouseClickThreshold:2,_mouseInteractionSupport:null,_touchInteractionSupport:null,_keyboardInteractionSupport:null,constructor:function(_7,_8){
this.map=null;
},startup:function(){
this.inherited(arguments);
if(this.map){
this.map.fitToMapContents();
}
},postMixInProperties:function(){
this.inherited(arguments);
},create:function(_9,_a){
this.inherited(arguments);
},getInnerMap:function(){
return this.map;
},buildRendering:function(){
this.inherited(arguments);
if(this.shapeData){
this.map=new _6(this.domNode,this.shapeData);
if(this.markerData&&(this.markerData.length>0)){
this.map.setMarkerData(this.markerData);
}
if(this.dataStore){
if(this.dataBindingValueFunction){
this.map.setDataBindingValueFunction(this.dataBindingValueFunction);
}
this.map.setDataStore(this.dataStore,this.dataBindingAttribute);
}
if(this.series&&(this.series.length>0)){
this.map.addSeries(this.series);
}
if(this.onFeatureClick){
this.map.onFeatureClick=this.onFeatureClick;
}
if(this.onFeatureOver){
this.map.onFeatureOver=this.onFeatureOver;
}
if(this.enableMouseSupport){
if(!dojox.geo.charting.MouseInteractionSupport){
throw Error("Can't find dojox.geo.charting.MouseInteractionSupport. Didn't you forget to dojo"+".require() it?");
}
var _b={};
_b.enablePan=this.enableMousePan;
_b.enableZoom=this.enableMouseZoom;
_b.mouseClickThreshold=this.mouseClickThreshold;
this._mouseInteractionSupport=new dojox.geo.charting.MouseInteractionSupport(this.map,_b);
this._mouseInteractionSupport.connect();
}
if(this.enableTouchSupport){
if(!dojox.geo.charting.TouchInteractionSupport){
throw Error("Can't find dojox.geo.charting.TouchInteractionSupport. Didn't you forget to dojo"+".require() it?");
}
this._touchInteractionSupport=new dojox.geo.charting.TouchInteractionSupport(this.map,{});
this._touchInteractionSupport.connect();
}
if(this.enableKeyboardSupport){
if(!dojox.geo.charting.KeyboardInteractionSupport){
throw Error("Can't find dojox.geo.charting.KeyboardInteractionSupport. Didn't you forget to dojo"+".require() it?");
}
this._keyboardInteractionSupport=new dojox.geo.charting.KeyboardInteractionSupport(this.map,{});
this._keyboardInteractionSupport.connect();
}
this.map.showTooltips=this.showTooltips;
this.map.enableFeatureZoom=this.enableFeatureZoom;
this.map.colorAnimationDuration=this.colorAnimationDuration;
}
},resize:function(b){
var _c;
switch(arguments.length){
case 0:
break;
case 1:
_c=_1.mixin({},b);
_1.marginBox(this.domNode,_c);
break;
case 2:
_c={w:arguments[0],h:arguments[1]};
_1.marginBox(this.domNode,_c);
break;
}
if(this.map){
this.map.resize(this.adjustMapCenterOnResize,this.adjustMapScaleOnResize,this.animateOnResize);
}
}});
});
