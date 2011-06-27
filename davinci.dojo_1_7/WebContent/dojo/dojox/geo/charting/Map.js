/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/charting/Map",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/html","dojo/_base/xhr","dojo/_base/connect","dojo/_base/window","dojox/gfx","dojox/geo/charting/_base","dojox/geo/charting/Feature","dojox/geo/charting/_Marker","dojo/number"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c){
return _1.declare("dojox.geo.charting.Map",null,{defaultColor:"#B7B7B7",highlightColor:"#D5D5D5",series:[],dataBindingAttribute:null,dataBindingValueFunction:null,dataStore:null,showTooltips:true,enableFeatureZoom:true,colorAnimationDuration:0,_idAttributes:null,_onSetListener:null,_onNewListener:null,_onDeleteListener:null,constructor:function(_d,_e){
_1.style(_d,"display","block");
this.container=_d;
var _f=this._getContainerBounds();
this.surface=_8.createSurface(_d,_f.w,_f.h);
this._createZoomingCursor();
this.mapBackground=this.surface.createRect({x:0,y:0,width:_f.w,height:_f.w}).setFill("rgba(0,0,0,0)");
this.mapObj=this.surface.createGroup();
this.mapObj.features={};
if(typeof _e=="object"){
this._init(_e);
}else{
if(typeof _e=="string"&&_e.length>0){
_1.xhrGet({url:_e,handleAs:"json",sync:true,load:_1.hitch(this,"_init")});
}
}
},_getContainerBounds:function(){
var _10=_1.position(this.container,true);
var _11=_1.marginBox(this.container);
var _12=_1.contentBox(this.container);
this._storedContainerBounds={x:_10.x,y:_10.y,w:_12.w||100,h:_12.h||100};
return this._storedContainerBounds;
},resize:function(_13,_14,_15){
var _16=this._storedContainerBounds;
var _17=this._getContainerBounds();
if((_16.w==_17.w)&&(_16.h==_17.h)){
return;
}
this.mapBackground.setShape({width:_17.w,height:_17.h});
this.surface.setDimensions(_17.w,_17.h);
this.mapObj.marker.hide();
this.mapObj.marker._needTooltipRefresh=true;
if(_13){
var _18=this.getMapScale();
var _19=_18;
if(_14){
var _1a=this.mapObj.boundBox;
var _1b=_17.w/_16.w;
var _1c=_17.h/_16.h;
_19=_18*Math.sqrt(_1b*_1c);
}
var _1d=this.screenCoordsToMapCoords(_16.w/2,_16.h/2);
this.setMapCenterAndScale(_1d.x,_1d.y,_19,_15);
}
},_isMobileDevice:function(){
return (_1.isSafari&&(navigator.userAgent.indexOf("iPhone")>-1||navigator.userAgent.indexOf("iPod")>-1||navigator.userAgent.indexOf("iPad")>-1))||(navigator.userAgent.toLowerCase().indexOf("android")>-1);
},setMarkerData:function(_1e){
_1.xhrGet({url:_1e,handleAs:"json",handle:_1.hitch(this,"_appendMarker")});
},setDataBindingAttribute:function(_1f){
this.dataBindingAttribute=_1f;
if(this.dataStore){
this._queryDataStore();
}
},setDataBindingValueFunction:function(_20){
this.dataBindingValueFunction=_20;
if(this.dataStore){
this._queryDataStore();
}
},_queryDataStore:function(){
if(!this.dataBindingAttribute||(this.dataBindingAttribute.length==0)){
return;
}
var _21=this;
this.dataStore.fetch({scope:this,onComplete:function(_22){
this._idAttributes=_21.dataStore.getIdentityAttributes({});
_1.forEach(_22,function(_23){
var id=_21.dataStore.getValue(_23,this._idAttributes[0]);
if(_21.mapObj.features[id]){
var val=null;
var _24=_21.dataStore.getValue(_23,_21.dataBindingAttribute);
if(_24){
if(this.dataBindingValueFunction){
val=this.dataBindingValueFunction(_24);
}else{
if(isNaN(val)){
val=_c.parse(_24);
}else{
val=_24;
}
}
}
if(val){
_21.mapObj.features[id].setValue(val);
}
}
},this);
}});
},_onSet:function(_25,_26,_27,_28){
var id=this.dataStore.getValue(_25,this._idAttributes[0]);
var _29=this.mapObj.features[id];
if(_29&&(_26==this.dataBindingAttribute)){
if(_28){
_29.setValue(_28);
}else{
_29.unsetValue();
}
}
},_onNew:function(_2a,_2b){
var id=this.dataStore.getValue(item,this._idAttributes[0]);
var _2c=this.mapObj.features[id];
if(_2c&&(attribute==this.dataBindingAttribute)){
_2c.setValue(newValue);
}
},_onDelete:function(_2d){
var id=_2d[this._idAttributes[0]];
var _2e=this.mapObj.features[id];
if(_2e){
_2e.unsetValue();
}
},setDataStore:function(_2f,_30){
if(this.dataStore!=_2f){
if(this._onSetListener){
_1.disconnect(this._onSetListener);
_1.disconnect(this._onNewListener);
_1.disconnect(this._onDeleteListener);
}
this.dataStore=_2f;
if(_2f){
_onSetListener=_1.connect(this.dataStore,"onSet",this,this._onSet);
_onNewListener=_1.connect(this.dataStore,"onNew",this,this._onNew);
_onDeleteListener=_1.connect(this.dataStore,"onDelete",this,this._onDelete);
}
}
if(_30){
this.setDataBindingAttribute(_30);
}
},addSeries:function(_31){
if(typeof _31=="object"){
this._addSeriesImpl(_31);
}else{
if(typeof _31=="string"&&_31.length>0){
_1.xhrGet({url:_31,handleAs:"json",sync:true,load:_1.hitch(this,function(_32){
this._addSeriesImpl(_32.series);
})});
}
}
},_addSeriesImpl:function(_33){
this.series=_33;
for(var _34 in this.mapObj.features){
var _35=this.mapObj.features[_34];
_35.setValue(_35.value);
}
},fitToMapArea:function(_36,_37,_38,_39){
if(!_37){
_37=0;
}
var _3a=_36.w,_3b=_36.h,_3c=this._getContainerBounds(),_3d=Math.min((_3c.w-2*_37)/_3a,(_3c.h-2*_37)/_3b);
this.setMapCenterAndScale(_36.x+_36.w/2,_36.y+_36.h/2,_3d,_38,_39);
},fitToMapContents:function(_3e,_3f,_40){
var _41=this.mapObj.boundBox;
this.fitToMapArea(_41,_3e,_3f,_40);
},setMapCenter:function(_42,_43,_44,_45){
var _46=this.getMapScale();
this.setMapCenterAndScale(_42,_43,_46,_44,_45);
},_createAnimation:function(_47,_48,_49,_4a){
var _4b=_48.dx?_48.dx:0;
var _4c=_48.dy?_48.dy:0;
var _4d=_49.dx?_49.dx:0;
var _4e=_49.dy?_49.dy:0;
var _4f=_48.xx?_48.xx:1;
var _50=_49.xx?_49.xx:1;
var _51=_8.fx.animateTransform({duration:1000,shape:_47,transform:[{name:"translate",start:[_4b,_4c],end:[_4d,_4e]},{name:"scale",start:[_4f],end:[_50]}]});
if(_4a){
var _52=_1.connect(_51,"onEnd",this,function(_53){
_4a(_53);
_1.disconnect(_52);
});
}
return _51;
},setMapCenterAndScale:function(_54,_55,_56,_57,_58){
var _59=this.mapObj.boundBox;
var _5a=this._getContainerBounds();
var _5b=_5a.w/2-_56*(_54-_59.x);
var _5c=_5a.h/2-_56*(_55-_59.y);
var _5d=new _8.matrix.Matrix2D({xx:_56,yy:_56,dx:_5b,dy:_5c});
var _5e=this.mapObj.getTransform();
if(!_57||!_5e){
this.mapObj.setTransform(_5d);
}else{
var _5f=this._createAnimation(this.mapObj,_5e,_5d,_58);
_5f.play();
}
},getMapCenter:function(){
var _60=this._getContainerBounds();
return this.screenCoordsToMapCoords(_60.w/2,_60.h/2);
},setMapScale:function(_61,_62,_63){
var _64=this._getContainerBounds();
var _65=this.screenCoordsToMapCoords(_64.w/2,_64.h/2);
this.setMapScaleAt(_61,_65.x,_65.y,_62,_63);
},setMapScaleAt:function(_66,_67,_68,_69,_6a){
var _6b=null;
var _6c=null;
_6b={x:_67,y:_68};
_6c=this.mapCoordsToScreenCoords(_6b.x,_6b.y);
var _6d=this.mapObj.boundBox;
var _6e=_6c.x-_66*(_6b.x-_6d.x);
var _6f=_6c.y-_66*(_6b.y-_6d.y);
var _70=new _8.matrix.Matrix2D({xx:_66,yy:_66,dx:_6e,dy:_6f});
var _71=this.mapObj.getTransform();
if(!_69||!_71){
this.mapObj.setTransform(_70);
}else{
var _72=this._createAnimation(this.mapObj,_71,_70,_6a);
_72.play();
}
},getMapScale:function(){
var mat=this.mapObj.getTransform();
var _73=mat?mat.xx:1;
return _73;
},mapCoordsToScreenCoords:function(_74,_75){
var _76=this.mapObj.getTransform();
var _77=_8.matrix.multiplyPoint(_76,_74,_75);
return _77;
},screenCoordsToMapCoords:function(_78,_79){
var _7a=_8.matrix.invert(this.mapObj.getTransform());
var _7b=_8.matrix.multiplyPoint(_7a,_78,_79);
return _7b;
},deselectAll:function(){
for(var _7c in this.mapObj.features){
this.mapObj.features[_7c].select(false);
}
this.selectedFeature=null;
this.focused=false;
},_init:function(_7d){
this.mapObj.boundBox={x:_7d.layerExtent[0],y:_7d.layerExtent[1],w:(_7d.layerExtent[2]-_7d.layerExtent[0]),h:_7d.layerExtent[3]-_7d.layerExtent[1]};
this.fitToMapContents(3);
_1.forEach(_7d.featureNames,function(_7e){
var _7f=_7d.features[_7e];
_7f.bbox.x=_7f.bbox[0];
_7f.bbox.y=_7f.bbox[1];
_7f.bbox.w=_7f.bbox[2];
_7f.bbox.h=_7f.bbox[3];
var _80=new _a(this,_7e,_7f);
_80.init();
this.mapObj.features[_7e]=_80;
},this);
this.mapObj.marker=new _b({},this);
},_appendMarker:function(_81){
this.mapObj.marker=new _b(_81,this);
},_createZoomingCursor:function(){
if(!_1.byId("mapZoomCursor")){
var _82=_1.doc.createElement("div");
_1.attr(_82,"id","mapZoomCursor");
_1.addClass(_82,"mapZoomIn");
_1.style(_82,"display","none");
_1.body().appendChild(_82);
}
},onFeatureClick:function(_83){
},onFeatureOver:function(_84){
},onZoomEnd:function(_85){
}});
});
