//>>built
define("dojox/dgauges/GaugeBase",["dojo/_base/lang","dojo/_base/declare","dojo/dom-geometry","dijit/registry","dijit/_WidgetBase","dojo/_base/html","dojo/_base/event","dojox/gfx","dojox/widget/_Invalidating","./ScaleBase","dojox/gfx/matrix","dojox/gfx/canvas"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c){
return _2("dojox.dgauges.GaugeBase",[_5,_9],{_elements:null,_scales:null,_elementsIndex:null,_elementsRenderers:null,_gfxGroup:null,_mouseShield:null,_widgetBox:null,_node:null,value:0,font:null,constructor:function(_d,_e){
this._addGroupBoundingBoxSupport();
this.font={family:"Helvetica",style:"normal",variant:"small-caps",weight:"bold",size:"10pt",color:"black"};
this._elements=[];
this._scales=[];
this._elementsIndex={};
this._elementsRenderers={};
this._node=_4.byId(_e);
var _f=_6.getMarginBox(_e);
this.surface=_8.createSurface(this._node,_f.w||1,_f.h||1);
this._widgetBox=_f;
this._baseGroup=this.surface.createGroup();
this._mouseShield=this._baseGroup.createGroup();
this._gfxGroup=this._baseGroup.createGroup();
},_setCursor:function(_10){
if(this._node){
this._node.style.cursor=_10;
}
},_addGroupBoundingBoxSupport:function(){
dojox.gfx.addRect=function(a,b){
if(a===null&&b===null){
return null;
}
if(a===null&&b!==null){
return b;
}
if(b===null){
return a;
}
var _11=Math.min(a.x,b.x);
var _12=Math.max(a.x+a.width,b.x+b.width);
var _13=Math.min(a.y,b.y);
var _14=Math.max(a.y+a.height,b.y+b.height);
return {x:_11,y:_13,width:_12-_11,height:_14-_13};
};
_1.extend(_b.Matrix2D,{isIdentity:function(){
return this.xy===0&&this.yx===0&&this.xx===1&&this.yy===1&&this.dx===0&&this.dy===0;
},transformRectangle:function(_15){
_15=_15||{x:0,y:0,width:0,height:0};
if(this.isIdentity()){
return {"x":_15.x,"y":_15.y,"width":_15.width,"height":_15.height};
}
var m=dojox.gfx.matrix;
var p0=m.multiplyPoint(this,_15.x,_15.y);
var p1=m.multiplyPoint(this,_15.x,_15.y+_15.height);
var p2=m.multiplyPoint(this,_15.x+_15.width,_15.y);
var p3=m.multiplyPoint(this,_15.x+_15.width,_15.y+_15.height);
var _16=Math.min(p0.x,Math.min(p1.x,Math.min(p2.x,p3.x)));
var _17=Math.min(p0.y,Math.min(p1.y,Math.min(p2.y,p3.y)));
var _18=Math.max(p0.x,Math.max(p1.x,Math.max(p2.x,p3.x)));
var _19=Math.max(p0.y,Math.max(p1.y,Math.max(p2.y,p3.y)));
var r={};
r.x=_16;
r.y=_17;
r.width=_18-_16;
r.height=_19-_17;
return r;
}});
_1.extend(_c.Group,{getBoundingBox:function(){
var bb=null;
var cs=this.children;
var ncs=this.children.length;
var c;
for(var i=0;i<ncs;++i){
c=cs[i];
var cbb=c.getBoundingBox();
if(!cbb){
continue;
}
var ct=c.getTransform();
if(ct&&!ct.isIdentity()){
cbb=ct.transformRectangle(cbb);
}
bb=bb?dojox.gfx.addRect(bb,cbb):cbb;
}
return bb;
}});
},_computeBoundingBox:function(_1a){
return _1a?_1a.getBoundingBox():{x:0,y:0,width:0,height:0};
},destroy:function(){
this.surface.destroy();
},resize:function(_1b,_1c){
var box;
switch(arguments.length){
case 1:
box=_1.mixin({},_1b);
_3.setMarginBox(this._node,box);
break;
case 2:
box={w:_1b,h:_1c};
_3.setMarginBox(this._node,box);
break;
}
box=_3.getMarginBox(this._node);
this._widgetBox=box;
var d=this.surface.getDimensions();
if(d.width!=box.w||d.height!=box.h){
this.surface.setDimensions(box.w,box.h);
this._mouseShield.clear();
this._mouseShield.createRect({x:0,y:0,width:box.w,height:box.h}).setFill([0,0,0,0]);
return this.invalidateRendering();
}else{
return this;
}
},addElement:function(_1d,_1e){
if(this._elementsIndex[_1d]&&this._elementsIndex[_1d]!=_1e){
this.removeElement(_1d);
}
if(_1.isFunction(_1e)){
var _1f={};
_1.mixin(_1f,new _9());
_1f._name=_1d;
_1f._gfxGroup=this._gfxGroup.createGroup();
_1f.width=0;
_1f.height=0;
_1f._isGFX=true;
_1f.refreshRendering=function(){
_1f._gfxGroup.clear();
return _1e(_1f._gfxGroup,_1f.width,_1f.height);
};
this._elements.push(_1f);
this._elementsIndex[_1d]=_1f;
}else{
_1e._name=_1d;
_1e._gfxGroup=this._gfxGroup.createGroup();
_1e._gauge=this;
this._elements.push(_1e);
this._elementsIndex[_1d]=_1e;
if(_1e instanceof _a){
this._scales.push(_1e);
}
}
return this.invalidateRendering();
},removeElement:function(_20){
var _21=this._elementsIndex[_20];
if(_21){
_21._gfxGroup.removeShape();
var idx=this._elements.indexOf(_21);
this._elements.splice(idx,1);
if(_21 instanceof _a){
var _22=this._scales.indexOf(_21);
this._scales.splice(_22,1);
}
delete this._elementsIndex[_20];
delete this._elementsRenderers[_20];
}
this.invalidateRendering();
return _21;
},getElement:function(_23){
return this._elementsIndex[_23];
},getElementRenderer:function(_24){
return this._elementsRenderers[_24];
},onStartEditing:function(_25){
},onEndEditing:function(_26){
}});
});
