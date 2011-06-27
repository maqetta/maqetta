/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/Patch",["dojo/_base/kernel"],function(_1){
dojox.geo.openlayers.Patch={destroyMap:function(){
if(!this.unloadDestroy){
return false;
}
if(this.panTween){
this.panTween.stop();
this.panTween=null;
}
OpenLayers.Event.stopObserving(window,"unload",this.unloadDestroy);
this.unloadDestroy=null;
if(this.updateSizeDestroy){
OpenLayers.Event.stopObserving(window,"resize",this.updateSizeDestroy);
}else{
this.events.unregister("resize",this,this.updateSize);
}
this.paddingForPopups=null;
if(this.controls!=null){
for(var i=this.controls.length-1;i>=0;--i){
this.controls[i].destroy();
}
this.controls=null;
}
if(this.layers!=null){
for(var i=this.layers.length-1;i>=0;--i){
this.layers[i].destroy(false);
}
this.layers=null;
}
if(this.viewPortDiv){
var _2=this.div==this.viewPortDiv.parentNode;
if(_2){
this.div.removeChild(this.viewPortDiv);
}
}
this.viewPortDiv=null;
if(this.eventListeners){
this.events.un(this.eventListeners);
this.eventListeners=null;
}
this.events.destroy();
this.events=null;
},removeLayerMap:function(_3,_4){
if(_4==null){
_4=true;
}
var _5;
if(_3.isFixed){
_5=this.viewPortDiv==_3.div.parentNode;
if(_5){
this.viewPortDiv.removeChild(_3.div);
}
}else{
_5=this.layerContainerDiv==_3.div.parentNode;
if(_5){
this.layerContainerDiv.removeChild(_3.div);
}
}
OpenLayers.Util.removeItem(this.layers,_3);
_3.removeMap(this);
_3.map=null;
if(this.baseLayer==_3){
this.baseLayer=null;
if(_4){
for(var i=0,_6=this.layers.length;i<_6;i++){
var _7=this.layers[i];
if(_7.isBaseLayer||this.allOverlays){
this.setBaseLayer(_7);
break;
}
}
}
}
this.resetLayersZIndex();
this.events.triggerEvent("removelayer",{layer:_3});
},controlPanzoomRemoveButton:function(_8){
OpenLayers.Event.stopObservingElement(_8);
_8.map=null;
_8.getSlideFactor=null;
var _9=this.div==_8.parentNode;
if(_9){
this.div.removeChild(_8);
}
OpenLayers.Util.removeItem(this.buttons,_8);
},layerGetResolution:function(){
if(!this.map){
return;
}
var _a=this.map.getZoom();
return this.getResolutionForZoom(_a);
},patchOpenLayers:function(){
if(_1.isIE){
_1.extend(OpenLayers.Map,{removeLayer:this.removeLayerMap,destroy:this.destroyMap});
}
if(_1.isIE){
_1.extend(OpenLayers.Control.PanZoom,{_removeButton:this.controlPanzoomRemoveButton});
}
_1.extend(OpenLayers.Layer,{getResolution:this.layerGetResolution});
}};
});
