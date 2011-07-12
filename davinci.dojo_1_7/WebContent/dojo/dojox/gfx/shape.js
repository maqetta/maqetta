/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx/shape",["..","dojo/_base/kernel","dojo/_base/html","./matrix","dojo/_base/declare","dojo/_base/connect","dojo/_base/Color"],function(_1,_2){
_2.getObject("gfx.shape",true,_1);
var _3={};
var _4={};
_1.gfx.shape.register=function(_5){
var t=_5.declaredClass.split(".").pop();
var i=t in _3?++_3[t]:((_3[t]=0));
var _6=t+i;
_4[_6]=_5;
return _6;
};
_1.gfx.shape.byId=function(id){
return _4[id];
};
_1.gfx.shape.dispose=function(_7){
delete _4[_7.getUID()];
};
_2.declare("dojox.gfx.shape.Shape",null,{constructor:function(){
this.rawNode=null;
this.shape=null;
this.matrix=null;
this.fillStyle=null;
this.strokeStyle=null;
this.bbox=null;
this.parent=null;
this.parentMatrix=null;
var _8=_1.gfx.shape.register(this);
this.getUID=function(){
return _8;
};
},getNode:function(){
return this.rawNode;
},getShape:function(){
return this.shape;
},getTransform:function(){
return this.matrix;
},getFill:function(){
return this.fillStyle;
},getStroke:function(){
return this.strokeStyle;
},getParent:function(){
return this.parent;
},getBoundingBox:function(){
return this.bbox;
},getTransformedBoundingBox:function(){
var b=this.getBoundingBox();
if(!b){
return null;
}
var m=this._getRealMatrix(),gm=_1.gfx.matrix;
return [gm.multiplyPoint(m,b.x,b.y),gm.multiplyPoint(m,b.x+b.width,b.y),gm.multiplyPoint(m,b.x+b.width,b.y+b.height),gm.multiplyPoint(m,b.x,b.y+b.height)];
},getEventSource:function(){
return this.rawNode;
},setShape:function(_9){
this.shape=_1.gfx.makeParameters(this.shape,_9);
this.bbox=null;
return this;
},setFill:function(_a){
if(!_a){
this.fillStyle=null;
return this;
}
var f=null;
if(typeof (_a)=="object"&&"type" in _a){
switch(_a.type){
case "linear":
f=_1.gfx.makeParameters(_1.gfx.defaultLinearGradient,_a);
break;
case "radial":
f=_1.gfx.makeParameters(_1.gfx.defaultRadialGradient,_a);
break;
case "pattern":
f=_1.gfx.makeParameters(_1.gfx.defaultPattern,_a);
break;
}
}else{
f=_1.gfx.normalizeColor(_a);
}
this.fillStyle=f;
return this;
},setStroke:function(_b){
if(!_b){
this.strokeStyle=null;
return this;
}
if(typeof _b=="string"||_2.isArray(_b)||_b instanceof _2.Color){
_b={color:_b};
}
var s=this.strokeStyle=_1.gfx.makeParameters(_1.gfx.defaultStroke,_b);
s.color=_1.gfx.normalizeColor(s.color);
return this;
},setTransform:function(_c){
this.matrix=_1.gfx.matrix.clone(_c?_1.gfx.matrix.normalize(_c):_1.gfx.matrix.identity);
return this._applyTransform();
},_applyTransform:function(){
return this;
},moveToFront:function(){
var p=this.getParent();
if(p){
p._moveChildToFront(this);
this._moveToFront();
}
return this;
},moveToBack:function(){
var p=this.getParent();
if(p){
p._moveChildToBack(this);
this._moveToBack();
}
return this;
},_moveToFront:function(){
},_moveToBack:function(){
},applyRightTransform:function(_d){
return _d?this.setTransform([this.matrix,_d]):this;
},applyLeftTransform:function(_e){
return _e?this.setTransform([_e,this.matrix]):this;
},applyTransform:function(_f){
return _f?this.setTransform([this.matrix,_f]):this;
},removeShape:function(_10){
if(this.parent){
this.parent.remove(this,_10);
}
return this;
},_setParent:function(_11,_12){
this.parent=_11;
return this._updateParentMatrix(_12);
},_updateParentMatrix:function(_13){
this.parentMatrix=_13?_1.gfx.matrix.clone(_13):null;
return this._applyTransform();
},_getRealMatrix:function(){
var m=this.matrix;
var p=this.parent;
while(p){
if(p.matrix){
m=_1.gfx.matrix.multiply(p.matrix,m);
}
p=p.parent;
}
return m;
}});
_1.gfx.shape._eventsProcessing={connect:function(_14,_15,_16){
return _2.connect(this.getEventSource(),_14,_1.gfx.shape.fixCallback(this,_1.gfx.fixTarget,_15,_16));
},disconnect:function(_17){
_2.disconnect(_17);
}};
_1.gfx.shape.fixCallback=function(_18,_19,_1a,_1b){
if(!_1b){
_1b=_1a;
_1a=null;
}
if(_2.isString(_1b)){
_1a=_1a||_2.global;
if(!_1a[_1b]){
throw (["dojox.gfx.shape.fixCallback: scope[\"",_1b,"\"] is null (scope=\"",_1a,"\")"].join(""));
}
return function(e){
return _19(e,_18)?_1a[_1b].apply(_1a,arguments||[]):undefined;
};
}
return !_1a?function(e){
return _19(e,_18)?_1b.apply(_1a,arguments):undefined;
}:function(e){
return _19(e,_18)?_1b.apply(_1a,arguments||[]):undefined;
};
};
_2.extend(_1.gfx.shape.Shape,_1.gfx.shape._eventsProcessing);
_1.gfx.shape.Container={_init:function(){
this.children=[];
},openBatch:function(){
},closeBatch:function(){
},add:function(_1c){
var _1d=_1c.getParent();
if(_1d){
_1d.remove(_1c,true);
}
this.children.push(_1c);
return _1c._setParent(this,this._getRealMatrix());
},remove:function(_1e,_1f){
for(var i=0;i<this.children.length;++i){
if(this.children[i]==_1e){
if(_1f){
}else{
_1e.parent=null;
_1e.parentMatrix=null;
}
this.children.splice(i,1);
break;
}
}
return this;
},clear:function(){
var _20;
for(var i=0;i<this.children.length;++i){
_20=this.children[i];
_20.parent=null;
_20.parentMatrix=null;
}
this.children=[];
return this;
},_moveChildToFront:function(_21){
for(var i=0;i<this.children.length;++i){
if(this.children[i]==_21){
this.children.splice(i,1);
this.children.push(_21);
break;
}
}
return this;
},_moveChildToBack:function(_22){
for(var i=0;i<this.children.length;++i){
if(this.children[i]==_22){
this.children.splice(i,1);
this.children.unshift(_22);
break;
}
}
return this;
}};
_2.declare("dojox.gfx.shape.Surface",null,{constructor:function(){
this.rawNode=null;
this._parent=null;
this._nodes=[];
this._events=[];
},destroy:function(){
_2.forEach(this._nodes,_2.destroy);
this._nodes=[];
_2.forEach(this._events,_2.disconnect);
this._events=[];
this.rawNode=null;
if(_2.isIE){
while(this._parent.lastChild){
_2.destroy(this._parent.lastChild);
}
}else{
this._parent.innerHTML="";
}
this._parent=null;
},getEventSource:function(){
return this.rawNode;
},_getRealMatrix:function(){
return null;
},isLoaded:true,onLoad:function(_23){
},whenLoaded:function(_24,_25){
var f=_2.hitch(_24,_25);
if(this.isLoaded){
f(this);
}else{
var h=_2.connect(this,"onLoad",function(_26){
_2.disconnect(h);
f(_26);
});
}
}});
_2.extend(_1.gfx.shape.Surface,_1.gfx.shape._eventsProcessing);
_2.declare("dojox.gfx.Point",null,{});
_2.declare("dojox.gfx.Rectangle",null,{});
_2.declare("dojox.gfx.shape.Rect",_1.gfx.shape.Shape,{constructor:function(_27){
this.shape=_1.gfx.getDefault("Rect");
this.rawNode=_27;
},getBoundingBox:function(){
return this.shape;
}});
_2.declare("dojox.gfx.shape.Ellipse",_1.gfx.shape.Shape,{constructor:function(_28){
this.shape=_1.gfx.getDefault("Ellipse");
this.rawNode=_28;
},getBoundingBox:function(){
if(!this.bbox){
var _29=this.shape;
this.bbox={x:_29.cx-_29.rx,y:_29.cy-_29.ry,width:2*_29.rx,height:2*_29.ry};
}
return this.bbox;
}});
_2.declare("dojox.gfx.shape.Circle",_1.gfx.shape.Shape,{constructor:function(_2a){
this.shape=_1.gfx.getDefault("Circle");
this.rawNode=_2a;
},getBoundingBox:function(){
if(!this.bbox){
var _2b=this.shape;
this.bbox={x:_2b.cx-_2b.r,y:_2b.cy-_2b.r,width:2*_2b.r,height:2*_2b.r};
}
return this.bbox;
}});
_2.declare("dojox.gfx.shape.Line",_1.gfx.shape.Shape,{constructor:function(_2c){
this.shape=_1.gfx.getDefault("Line");
this.rawNode=_2c;
},getBoundingBox:function(){
if(!this.bbox){
var _2d=this.shape;
this.bbox={x:Math.min(_2d.x1,_2d.x2),y:Math.min(_2d.y1,_2d.y2),width:Math.abs(_2d.x2-_2d.x1),height:Math.abs(_2d.y2-_2d.y1)};
}
return this.bbox;
}});
_2.declare("dojox.gfx.shape.Polyline",_1.gfx.shape.Shape,{constructor:function(_2e){
this.shape=_1.gfx.getDefault("Polyline");
this.rawNode=_2e;
},setShape:function(_2f,_30){
if(_2f&&_2f instanceof Array){
this.inherited(arguments,[{points:_2f}]);
if(_30&&this.shape.points.length){
this.shape.points.push(this.shape.points[0]);
}
}else{
this.inherited(arguments,[_2f]);
}
return this;
},_normalizePoints:function(){
var p=this.shape.points,l=p&&p.length;
if(l&&typeof p[0]=="number"){
var _31=[];
for(var i=0;i<l;i+=2){
_31.push({x:p[i],y:p[i+1]});
}
this.shape.points=_31;
}
},getBoundingBox:function(){
if(!this.bbox&&this.shape.points.length){
var p=this.shape.points;
var l=p.length;
var t=p[0];
var _32={l:t.x,t:t.y,r:t.x,b:t.y};
for(var i=1;i<l;++i){
t=p[i];
if(_32.l>t.x){
_32.l=t.x;
}
if(_32.r<t.x){
_32.r=t.x;
}
if(_32.t>t.y){
_32.t=t.y;
}
if(_32.b<t.y){
_32.b=t.y;
}
}
this.bbox={x:_32.l,y:_32.t,width:_32.r-_32.l,height:_32.b-_32.t};
}
return this.bbox;
}});
_2.declare("dojox.gfx.shape.Image",_1.gfx.shape.Shape,{constructor:function(_33){
this.shape=_1.gfx.getDefault("Image");
this.rawNode=_33;
},getBoundingBox:function(){
return this.shape;
},setStroke:function(){
return this;
},setFill:function(){
return this;
}});
_2.declare("dojox.gfx.shape.Text",_1.gfx.shape.Shape,{constructor:function(_34){
this.fontStyle=null;
this.shape=_1.gfx.getDefault("Text");
this.rawNode=_34;
},getFont:function(){
return this.fontStyle;
},setFont:function(_35){
this.fontStyle=typeof _35=="string"?_1.gfx.splitFontString(_35):_1.gfx.makeParameters(_1.gfx.defaultFont,_35);
this._setFont();
return this;
}});
_1.gfx.shape.Creator={createShape:function(_36){
var gfx=_1.gfx;
switch(_36.type){
case gfx.defaultPath.type:
return this.createPath(_36);
case gfx.defaultRect.type:
return this.createRect(_36);
case gfx.defaultCircle.type:
return this.createCircle(_36);
case gfx.defaultEllipse.type:
return this.createEllipse(_36);
case gfx.defaultLine.type:
return this.createLine(_36);
case gfx.defaultPolyline.type:
return this.createPolyline(_36);
case gfx.defaultImage.type:
return this.createImage(_36);
case gfx.defaultText.type:
return this.createText(_36);
case gfx.defaultTextPath.type:
return this.createTextPath(_36);
}
return null;
},createGroup:function(){
return this.createObject(_1.gfx.Group);
},createRect:function(_37){
return this.createObject(_1.gfx.Rect,_37);
},createEllipse:function(_38){
return this.createObject(_1.gfx.Ellipse,_38);
},createCircle:function(_39){
return this.createObject(_1.gfx.Circle,_39);
},createLine:function(_3a){
return this.createObject(_1.gfx.Line,_3a);
},createPolyline:function(_3b){
return this.createObject(_1.gfx.Polyline,_3b);
},createImage:function(_3c){
return this.createObject(_1.gfx.Image,_3c);
},createText:function(_3d){
return this.createObject(_1.gfx.Text,_3d);
},createPath:function(_3e){
return this.createObject(_1.gfx.Path,_3e);
},createTextPath:function(_3f){
return this.createObject(_1.gfx.TextPath,{}).setText(_3f);
},createObject:function(_40,_41){
return null;
}};
return _1.gfx.shape;
});
