/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/stencil/_Base",["dojo","../..","dojo/fx/easing","../defaults"],function(_1,_2){
_1.getObject("drawing.stencil",true,_2);
_1.getObject("drawing.tools.custom",true,_2);
_2.drawing.stencil._Base=_2.drawing.util.oo.declare(function(_3){
_1.mixin(this,_3);
this.style=_3.style||_2.drawing.defaults.copy();
if(_3.stencil){
this.stencil=_3.stencil;
this.util=_3.stencil.util;
this.mouse=_3.stencil.mouse;
this.container=_3.stencil.container;
this.style=_3.stencil.style;
}
var _4=/Line|Vector|Axes|Arrow/;
var _5=/Text/;
this.shortType=this.util.abbr(this.type);
this.isText=_5.test(this.type);
this.isLine=_4.test(this.type);
this.renderHit=this.style.renderHitLayer;
if(!this.renderHit&&this.style.renderHitLines&&this.isLine){
this.renderHit=true;
}
if(!this.renderHit&&this.style.useSelectedStyle){
this.useSelectedStyle=true;
this.selCopy=_1.clone(this.style.selected);
for(var nm in this.style.norm){
if(this.style.selected[nm]===undefined){
this.style.selected[nm]=this.style.norm[nm];
}
}
this.textSelected=_1.clone(this.style.text);
this.textSelected.color=this.style.selected.fill;
}
this.angleSnap=this.style.angleSnap||1;
this.marginZero=_3.marginZero||this.style.anchors.marginZero;
this.id=_3.id||this.util.uid(this.type);
this._cons=[];
if(!this.annotation&&!this.subShape){
this.util.attr(this.container,"id",this.id);
}
this.connect(this,"onBeforeRender","preventNegativePos");
this._offX=this.mouse.origin.x;
this._offY=this.mouse.origin.y;
if(this.isText){
this.align=_3.align||this.align;
this.valign=_3.valign||this.valign;
if(_3.data&&_3.data.makeFit){
var _6=this.makeFit(_3.data.text,_3.data.width);
this.textSize=this.style.text.size=_6.size;
this._lineHeight=_6.box.h;
}else{
this.textSize=parseInt(this.style.text.size,10);
this._lineHeight=this.textSize*1.4;
}
this.deleteEmptyCreate=_3.deleteEmptyCreate!==undefined?_3.deleteEmptyCreate:this.style.text.deleteEmptyCreate;
this.deleteEmptyModify=_3.deleteEmptyModify!==undefined?_3.deleteEmptyModify:this.style.text.deleteEmptyModify;
}
this.attr(_3.data);
if(this.noBaseRender){
return;
}
if(_3.points){
if(_3.data&&_3.data.closePath===false){
this.closePath=false;
}
this.setPoints(_3.points);
this.connect(this,"render",this,"onRender",true);
this.baseRender&&this.enabled&&this.render();
_3.label&&this.setLabel(_3.label);
_3.shadow&&this.addShadow(_3.shadow);
}else{
if(_3.data){
_3.data.width=_3.data.width?_3.data.width:this.style.text.minWidth;
_3.data.height=_3.data.height?_3.data.height:this._lineHeight;
this.setData(_3.data);
this.connect(this,"render",this,"onRender",true);
this.baseRender&&this.enabled&&this.render(_3.data.text);
this.baseRender&&_3.label&&this.setLabel(_3.label);
this.baseRender&&_3.shadow&&this.addShadow(_3.shadow);
}else{
if(this.draws){
this.points=[];
this.data={};
this.connectMouse();
this._postRenderCon=_1.connect(this,"render",this,"_onPostRender");
}
}
}
if(this.showAngle){
this.angleLabel=new _2.drawing.annotations.Angle({stencil:this});
}
if(!this.enabled){
this.disable();
this.moveToBack();
this.render(_3.data.text);
}
},{type:"dojox.drawing.stencil",minimumSize:10,enabled:true,drawingType:"stencil",setData:function(_7){
this.data=_7;
this.points=this.dataToPoints();
},setPoints:function(_8){
this.points=_8;
if(this.pointsToData){
this.data=this.pointsToData();
}
},onDelete:function(_9){
},onBeforeRender:function(_a){
},onModify:function(_b){
},onChangeData:function(_c){
},onChangeText:function(_d){
},onRender:function(_e){
this._postRenderCon=_1.connect(this,"render",this,"_onPostRender");
this.created=true;
this.disconnectMouse();
if(this.shape){
this.shape.superClass=this;
}else{
this.container.superClass=this;
}
this._setNodeAtts(this);
},onChangeStyle:function(_f){
this._isBeingModified=true;
if(!this.enabled){
this.style.current=this.style.disabled;
this.style.currentText=this.style.textDisabled;
this.style.currentHit=this.style.hitNorm;
}else{
this.style.current=this.style.norm;
this.style.currentHit=this.style.hitNorm;
this.style.currentText=this.style.text;
}
if(this.selected){
if(this.useSelectedStyle){
this.style.current=this.style.selected;
this.style.currentText=this.textSelected;
}
this.style.currentHit=this.style.hitSelected;
}else{
if(this.highlighted){
this.style.currentHit=this.style.hitHighlighted;
}
}
this.render();
},animate:function(_10,_11){
console.warn("ANIMATE..........................");
var d=_10.d||_10.duration||1000;
var ms=_10.ms||20;
var _12=_10.ease||_1.fx.easing.linear;
var _13=_10.steps;
var ts=new Date().getTime();
var w=100;
var cnt=0;
var _14=true;
var sp,ep;
if(_1.isArray(_10.start)){
sp=_10.start;
ep=_10.end;
}else{
if(_1.isObject(_10.start)){
sp=_10.start;
ep=_10.end;
_14=false;
}else{
console.warn("No data provided to animate");
}
}
var v=setInterval(_1.hitch(this,function(){
var t=new Date().getTime()-ts;
var p=_12(1-t/d);
if(t>d||cnt++>100){
clearInterval(v);
return;
}
if(_14){
var _15=[];
_1.forEach(sp,function(pt,i){
var o={x:(ep[i].x-sp[i].x)*p+sp[i].x,y:(ep[i].y-sp[i].y)*p+sp[i].y};
_15.push(o);
});
this.setPoints(_15);
this.render();
}else{
var o={};
for(var nm in sp){
o[nm]=(ep[nm]-sp[nm])*p+sp[nm];
}
this.attr(o);
}
}),ms);
},attr:function(key,_16){
var n=this.enabled?this.style.norm:this.style.disabled;
var t=this.enabled?this.style.text:this.style.textDisabled;
var ts=this.textSelected||{},o,nm,_17,_18=_1.toJson(n),_19=_1.toJson(t);
var _1a={x:true,y:true,r:true,height:true,width:true,radius:true,angle:true};
var _1b=false;
if(typeof (key)!="object"){
o={};
o[key]=_16;
}else{
o=_1.clone(key);
}
if(o.width){
_17=o.width;
delete o.width;
}
for(nm in o){
if(nm in n){
n[nm]=o[nm];
}
if(nm in t){
t[nm]=o[nm];
}
if(nm in ts){
ts[nm]=o[nm];
}
if(nm in _1a){
_1a[nm]=o[nm];
_1b=true;
if(nm=="radius"&&o.angle===undefined){
o.angle=_1a.angle=this.getAngle();
}else{
if(nm=="angle"&&o.radius===undefined){
o.radius=_1a.radius=this.getRadius();
}
}
}
if(nm=="text"){
this.setText(o.text);
}
if(nm=="label"){
this.setLabel(o.label);
}
}
if(o.borderWidth!==undefined){
n.width=o.borderWidth;
}
if(this.useSelectedStyle){
for(nm in this.style.norm){
if(this.selCopy[nm]===undefined){
this.style.selected[nm]=this.style.norm[nm];
}
}
this.textSelected.color=this.style.selected.color;
}
if(!this.created){
return;
}
if(o.x!==undefined||o.y!==undefined){
var box=this.getBounds(true);
var mx={dx:0,dy:0};
for(nm in o){
if(nm=="x"||nm=="y"||nm=="r"){
mx["d"+nm]=o[nm]-box[nm];
}
}
this.transformPoints(mx);
}
var p=this.points;
if(o.angle!==undefined){
this.dataToPoints({x:this.data.x1,y:this.data.y1,angle:o.angle,radius:o.radius});
}else{
if(_17!==undefined){
p[1].x=p[2].x=p[0].x+_17;
this.pointsToData(p);
}
}
if(o.height!==undefined&&o.angle===undefined){
p[2].y=p[3].y=p[0].y+o.height;
this.pointsToData(p);
}
if(o.r!==undefined){
this.data.r=Math.max(0,o.r);
}
if(_1b||_19!=_1.toJson(t)||_18!=_1.toJson(n)){
this.onChangeStyle(this);
}
o.width=_17;
if(o.cosphi!=undefined){
!this.data?this.data={cosphi:o.cosphi}:this.data.cosphi=o.cosphi;
this.style.zAxis=o.cosphi!=0?true:false;
}
},exporter:function(){
var _1c=this.type.substring(this.type.lastIndexOf(".")+1).charAt(0).toLowerCase()+this.type.substring(this.type.lastIndexOf(".")+2);
var o=_1.clone(this.style.norm);
o.borderWidth=o.width;
delete o.width;
if(_1c=="path"){
o.points=this.points;
}else{
o=_1.mixin(o,this.data);
}
o.type=_1c;
if(this.isText){
o.text=this.getText();
o=_1.mixin(o,this.style.text);
delete o.minWidth;
delete o.deleteEmptyCreate;
delete o.deleteEmptyModify;
}
var lbl=this.getLabel();
if(lbl){
o.label=lbl;
}
return o;
},disable:function(){
this.enabled=false;
this.renderHit=false;
this.onChangeStyle(this);
},enable:function(){
this.enabled=true;
this.renderHit=true;
this.onChangeStyle(this);
},select:function(){
this.selected=true;
this.onChangeStyle(this);
},deselect:function(_1d){
if(_1d){
setTimeout(_1.hitch(this,function(){
this.selected=false;
this.onChangeStyle(this);
}),200);
}else{
this.selected=false;
this.onChangeStyle(this);
}
},_toggleSelected:function(){
if(!this.selected){
return;
}
this.deselect();
setTimeout(_1.hitch(this,"select"),0);
},highlight:function(){
this.highlighted=true;
this.onChangeStyle(this);
},unhighlight:function(){
this.highlighted=false;
this.onChangeStyle(this);
},moveToFront:function(){
this.container&&this.container.moveToFront();
},moveToBack:function(){
this.container&&this.container.moveToBack();
},onTransformBegin:function(_1e){
this._isBeingModified=true;
},onTransformEnd:function(_1f){
this._isBeingModified=false;
this.onModify(this);
},onTransform:function(_20){
if(!this._isBeingModified){
this.onTransformBegin();
}
this.setPoints(this.points);
this.render();
},transformPoints:function(mx){
if(!mx.dx&&!mx.dy){
return;
}
var _21=_1.clone(this.points),_22=false;
_1.forEach(this.points,function(o){
o.x+=mx.dx;
o.y+=mx.dy;
if(o.x<this.marginZero||o.y<this.marginZero){
_22=true;
}
});
if(_22){
this.points=_21;
console.error("Attempt to set object '"+this.id+"' to less than zero.");
return;
}
this.onTransform();
this.onTransformEnd();
},applyTransform:function(mx){
this.transformPoints(mx);
},setTransform:function(mx){
this.attr({x:mx.dx,y:mx.dy});
},getTransform:function(){
return this.selected?this.container.getParent().getTransform():{dx:0,dy:0};
},addShadow:function(_23){
_23=_23===true?{}:_23;
_23.stencil=this;
this.shadow=new _2.drawing.annotations.BoxShadow(_23);
},removeShadow:function(){
this.shadow.destroy();
},setLabel:function(_24){
if(!this._label){
this._label=new _2.drawing.annotations.Label({text:_24,util:this.util,mouse:this.mouse,stencil:this,annotation:true,container:this.container,labelPosition:this.labelPosition});
}else{
if(_24!=undefined){
this._label.setLabel(_24);
}
}
},getLabel:function(){
if(this._label){
return this._label.getText();
}
return null;
},getAngle:function(){
var d=this.pointsToData();
var obj={start:{x:d.x1,y:d.y1},x:d.x2,y:d.y2};
var _25=this.util.angle(obj,this.angleSnap);
_25<0?_25=360+_25:_25;
return _25;
},getRadius:function(){
var box=this.getBounds(true);
var _26={start:{x:box.x1,y:box.y1},x:box.x2,y:box.y2};
return this.util.length(_26);
},getBounds:function(_27){
var p=this.points,x1,y1,x2,y2;
if(p.length==2){
if(_27){
x1=p[0].x;
y1=p[0].y;
x2=p[1].x;
y2=p[1].y;
}else{
x1=p[0].x<p[1].x?p[0].x:p[1].x;
y1=p[0].y<p[1].y?p[0].y:p[1].y;
x2=p[0].x<p[1].x?p[1].x:p[0].x;
y2=p[0].y<p[1].y?p[1].y:p[0].y;
}
return {x1:x1,y1:y1,x2:x2,y2:y2,x:x1,y:y1,w:x2-x1,h:y2-y1};
}else{
return {x1:p[0].x,y1:p[0].y,x2:p[2].x,y2:p[2].y,x:p[0].x,y:p[0].y,w:p[2].x-p[0].x,h:p[2].y-p[0].y};
}
},preventNegativePos:function(){
if(this._isBeingModified){
return;
}
if(!this.points||!this.points.length){
return;
}
if(this.type=="dojox.drawing.tools.custom.Axes"){
var _28=this.marginZero,_29=this.marginZero;
_1.forEach(this.points,function(p){
_28=Math.min(p.y,_28);
});
_1.forEach(this.points,function(p){
_29=Math.min(p.x,_29);
});
if(_28<this.marginZero){
_1.forEach(this.points,function(p,i){
p.y=p.y+(this.marginZero-_28);
},this);
}
if(_29<this.marginZero){
_1.forEach(this.points,function(p){
p.x+=(this.marginZero-_29);
},this);
}
}else{
_1.forEach(this.points,function(p){
p.x=p.x<0?this.marginZero:p.x;
p.y=p.y<0?this.marginZero:p.y;
});
}
this.setPoints(this.points);
},_onPostRender:function(_2a){
if(this._isBeingModified){
this.onModify(this);
this._isBeingModified=false;
}else{
if(!this.created){
}
}
if(!this.editMode&&!this.selected&&this._prevData&&_1.toJson(this._prevData)!=_1.toJson(this.data)){
this.onChangeData(this);
this._prevData=_1.clone(this.data);
}else{
if(!this._prevData&&(!this.isText||this.getText())){
this._prevData=_1.clone(this.data);
}
}
},_setNodeAtts:function(_2b){
var att=this.enabled&&(!this.annotation||this.drawingType=="label")?this.drawingType:"";
this.util.attr(_2b,"drawingType",att);
},destroy:function(){
if(this.destroyed){
return;
}
if(this.data||this.points&&this.points.length){
this.onDelete(this);
}
this.disconnectMouse();
this.disconnect(this._cons);
_1.disconnect(this._postRenderCon);
this.remove(this.shape,this.hit);
this.destroyed=true;
},remove:function(){
var a=arguments;
if(!a.length){
if(!this.shape){
return;
}
a=[this.shape];
}
for(var i=0;i<a.length;i++){
if(a[i]){
a[i].removeShape();
}
}
},connectMult:function(){
if(arguments.length>1){
this._cons.push(this.connect.apply(this,arguments));
}else{
if(_1.isArray(arguments[0][0])){
_1.forEach(arguments[0],function(ar){
this._cons.push(this.connect.apply(this,ar));
},this);
}else{
this._cons.push(this.connect.apply(this,arguments[0]));
}
}
},connect:function(o,e,s,m,_2c){
var c;
if(typeof (o)!="object"){
if(s){
m=s;
s=e;
e=o;
o=this;
}else{
m=e;
e=o;
o=s=this;
}
}else{
if(!m){
m=s;
s=this;
}else{
if(_2c){
c=_1.connect(o,e,function(evt){
_1.hitch(s,m)(evt);
_1.disconnect(c);
});
this._cons.push(c);
return c;
}else{
}
}
}
c=_1.connect(o,e,s,m);
this._cons.push(c);
return c;
},disconnect:function(_2d){
if(!_2d){
return;
}
if(!_1.isArray(_2d)){
_2d=[_2d];
}
_1.forEach(_2d,_1.disconnect,_1);
},connectMouse:function(){
this._mouseHandle=this.mouse.register(this);
},disconnectMouse:function(){
this.mouse.unregister(this._mouseHandle);
},render:function(){
},dataToPoints:function(_2e){
},pointsToData:function(_2f){
},onDown:function(obj){
this._downOnCanvas=true;
_1.disconnect(this._postRenderCon);
this._postRenderCon=null;
},onMove:function(obj){
},onDrag:function(obj){
},onUp:function(obj){
}});
return _2.drawing.stencil._Base;
});
