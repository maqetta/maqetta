/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/charting/Feature",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/html","dojo/_base/event","dojox/gfx/fx","dojox/color"],function(_1,_2,_3,_4,_5,fx,_6){
return _1.declare("dojox.geo.charting.Feature",null,{_isZoomIn:false,isSelected:false,markerText:null,constructor:function(_7,_8,_9){
this.id=_8;
this.shape=_7.mapObj.createGroup();
this.parent=_7;
this.mapObj=_7.mapObj;
this._bbox=_9.bbox;
this._center=_9.center;
this._defaultFill=_7.defaultColor;
this._highlightFill=_7.highlightColor;
this._defaultStroke={width:this._normalizeStrokeWeight(0.5),color:"white"};
var _a=(_1.isArray(_9.shape[0]))?_9.shape:[_9.shape];
_1.forEach(_a,function(_b){
this.shape.createPolyline(_b).setStroke(this._defaultStroke);
},this);
this.unsetValue();
},unsetValue:function(){
this.value=null;
this._defaultFill=this.parent.defaultColor;
var _c=new _6.Color(this.parent.defaultColor).toHsl();
_c.l=1.2*_c.l;
this._highlightFill=_6.fromHsl(_c);
this._setFillWith(this._defaultFill);
},setValue:function(_d){
this.value=_d;
if(this.parent.series.length!=0){
for(var i=0;i<this.parent.series.length;i++){
var _e=this.parent.series[i];
if((_d>=_e.min)&&(_d<_e.max)){
this._setFillWith(_e.color);
this._defaultFill=_e.color;
var _f=new _6.Color(_e.color).toHsv();
_f.v=(_f.v+20);
this._highlightFill=_6.fromHsv(_f);
}
}
}
},_setFillWith:function(_10){
var _11=(_1.isArray(this.shape.children))?this.shape.children:[this.shape.children];
_1.forEach(_11,_1.hitch(this,function(_12){
if(this.parent.colorAnimationDuration>0){
var _13=fx.animateFill({shape:_12,color:{start:_12.getFill(),end:_10},duration:this.parent.colorAnimationDuration});
_13.play();
}else{
_12.setFill(_10);
}
}));
},_setStrokeWith:function(_14){
var _15=(_1.isArray(this.shape.children))?this.shape.children:[this.shape.children];
_1.forEach(_15,function(_16){
_16.setStroke({color:_14.color,width:_14.width,join:"round"});
});
},_normalizeStrokeWeight:function(_17){
var _18=this.shape._getRealMatrix();
return (dojox.gfx.renderer!="vml")?_17/(this.shape._getRealMatrix()||{xx:1}).xx:_17;
},_onmouseoverHandler:function(evt){
this.parent.onFeatureOver(this);
this._setFillWith(this._highlightFill);
this.mapObj.marker.show(this.id);
},_onmouseoutHandler:function(){
this._setFillWith(this._defaultFill);
this.mapObj.marker.hide();
_1.style("mapZoomCursor","display","none");
},_onmousemoveHandler:function(evt){
if(this.mapObj.marker._needTooltipRefresh){
this.mapObj.marker.show(this.id);
}
if(this.isSelected){
if(parent.enableFeatureZoom){
evt=_1.fixEvent(evt||window.event);
_1.style("mapZoomCursor","left",evt.pageX+12+"px");
_1.style("mapZoomCursor","top",evt.pageY+"px");
_1.byId("mapZoomCursor").className=this._isZoomIn?"mapZoomOut":"mapZoomIn";
_1.style("mapZoomCursor","display","block");
}else{
_1.style("mapZoomCursor","display","none");
}
}
},_onclickHandler:function(evt){
this.parent.onFeatureClick(this);
if(!this.isSelected){
this.parent.deselectAll();
this.select(true);
this._onmousemoveHandler(evt);
}else{
if(parent.enableFeatureZoom){
if(this._isZoomIn){
this._zoomOut();
}else{
this._zoomIn();
}
}
}
},select:function(_19){
if(_19){
this.shape.moveToFront();
this._setStrokeWith({color:"black",width:this._normalizeStrokeWeight(2)});
this._setFillWith(this._highlightFill);
this.isSelected=true;
this.parent.selectedFeature=this;
}else{
this._setStrokeWith(this._defaultStroke);
this._setFillWith(this._defaultFill);
this.isSelected=false;
this._isZoomIn=false;
}
},_zoomIn:function(){
var _1a=this.mapObj.marker;
_1a.hide();
this.parent.fitToMapArea(this._bbox,15,true,_1.hitch(this,function(){
this._setStrokeWith({color:"black",width:this._normalizeStrokeWeight(2)});
_1a._needTooltipRefresh=true;
this.parent.onZoomEnd(this);
}));
this._isZoomIn=true;
_1.byId("mapZoomCursor").className="";
},_zoomOut:function(){
var _1b=this.mapObj.marker;
_1b.hide();
this.parent.fitToMapContents(3,true,_1.hitch(this,function(){
this._setStrokeWith({color:"black",width:this._normalizeStrokeWeight(2)});
_1b._needTooltipRefresh=true;
this.parent.onZoomEnd(this);
}));
this._isZoomIn=false;
_1.byId("mapZoomCursor").className="";
},init:function(){
this.shape.id=this.id;
this.tooltip=null;
}});
});
