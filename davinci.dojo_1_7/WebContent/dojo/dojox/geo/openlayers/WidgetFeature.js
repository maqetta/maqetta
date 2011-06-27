/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/WidgetFeature",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dojox/geo/openlayers/Feature"],function(_1,_2,_3,_4){
return _1.declare("dojox.geo.openlayers.WidgetFeature",dojox.geo.openlayers.Feature,{_widget:null,_bbox:null,constructor:function(_5){
this._params=_5;
},setParameters:function(_6){
this._params=_6;
},getParameters:function(){
return this._params;
},_getWidget:function(){
var _7=this._params;
if((this._widget==null)&&(_7!=null)){
var w=null;
if(typeof (_7.createWidget)=="function"){
w=_7.createWidget.call(this);
}else{
if(_7.dojoType){
_1["require"](_7.dojoType);
var c=_1.getObject(_7.dojoType);
w=new c(_7);
}else{
if(_7.dijitId){
w=dijit.byId(_7.dijitId);
}else{
if(_7.widget){
w=_7.widget;
}
}
}
}
if(w!=null){
this._widget=w;
if(typeof (w.startup)=="function"){
w.startup();
}
var n=w.domNode;
if(n!=null){
_1.style(n,{position:"absolute"});
}
}
this._widget=w;
}
return this._widget;
},_getWidgetWidth:function(){
var p=this._params;
if(p.width){
return p.width;
}
var w=this._getWidget();
if(w){
return _1.style(w.domNode,"width");
}
},_getWidgetHeight:function(){
var p=this._params;
if(p.height){
return p.height;
}
var w=this._getWidget();
if(w){
return _1.style(w.domNode,"height");
}
},render:function(){
var _8=this.getLayer();
var _9=this._getWidget();
if(_9==null){
return;
}
var _a=this._params;
var _b=_a.longitude;
var _c=_a.latitude;
var _d=this.getCoordinateSystem();
var _e=_8.getDojoMap();
var p=_e.transformXY(_b,_c,_d);
var a=this._getLocalXY(p);
var _f=this._getWidgetWidth();
var _10=this._getWidgetHeight();
var x=a[0]-_f/2;
var y=a[1]-_10/2;
var dom=_9.domNode;
var p=_8.olLayer.div;
if(dom.parentNode!=p){
if(dom.parentNode){
dom.parentNode.removeChild(dom);
}
p.appendChild(dom);
}
this._updateWidgetPosition({x:x,y:y,width:_f,height:_10});
},_updateWidgetPosition:function(box){
var w=this._widget;
var dom=w.domNode;
_1.style(dom,{position:"absolute",left:box.x+"px",top:box.y+"px",width:box.width+"px",height:box.height+"px"});
if(w.srcNodeRef){
_1.style(w.srcNodeRef,{position:"absolute",left:box.x+"px",top:box.y+"px",width:box.width+"px",height:box.height+"px"});
}
if(_1.isFunction(w.resize)){
w.resize({w:box.width,h:box.height});
}
},remove:function(){
var w=this.getWidget();
if(!w){
return;
}
var dom=w.domNode;
if(dom.parentNode){
dom.parentNode.removeChild(dom);
}
}});
});
