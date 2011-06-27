/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/tools/custom/Vector",["dojo","../Arrow","../../util/positioning"],function(_1){
dojox.drawing.tools.custom.Vector=dojox.drawing.util.oo.declare(dojox.drawing.tools.Arrow,function(_2){
this.minimumSize=this.style.arrows.length;
this.addShadow({size:3,mult:2});
},{draws:true,type:"dojox.drawing.tools.custom.Vector",minimumSize:30,showAngle:true,changeAxis:function(_3){
_3=_3!==undefined?_3:this.style.zAxis?0:1;
if(_3==0){
this.style.zAxis=false;
this.data.cosphi=0;
}else{
this.style.zAxis=true;
var p=this.points;
var pt=this.zPoint();
this.setPoints([{x:p[0].x,y:p[0].y},{x:pt.x,y:pt.y}]);
}
this.render();
},_createZeroVector:function(_4,d,_5){
var s=_4=="hit"?this.minimumSize:this.minimumSize/6;
var f=_4=="hit"?_5.fill:null;
d={cx:this.data.x1,cy:this.data.y1,rx:s,ry:s};
this.remove(this[_4]);
this[_4]=this.container.createEllipse(d).setStroke(_5).setFill(f);
this.util.attr(this[_4],"drawingType","stencil");
},_create:function(_6,d,_7){
this.remove(this[_6]);
this[_6]=this.container.createLine(d).setStroke(_7);
this._setNodeAtts(this[_6]);
},onDrag:function(_8){
if(this.created){
return;
}
var x1=_8.start.x,y1=_8.start.y,x2=_8.x,y2=_8.y;
if(this.keys.shift&&!this.style.zAxis){
var pt=this.util.snapAngle(_8,45/180);
x2=pt.x;
y2=pt.y;
}
if(this.keys.alt){
var dx=x2>x1?((x2-x1)/2):((x1-x2)/-2);
var dy=y2>y1?((y2-y1)/2):((y1-y2)/-2);
x1-=dx;
x2-=dx;
y1-=dy;
y2-=dy;
}
if(this.style.zAxis){
var _9=this.zPoint(_8);
x2=_9.x;
y2=_9.y;
}
this.setPoints([{x:x1,y:y1},{x:x2,y:y2}]);
this.render();
},onTransform:function(_a){
if(!this._isBeingModified){
this.onTransformBegin();
}
this.setPoints(this.points);
this.render();
},anchorConstrain:function(x,y){
if(!this.style.zAxis){
return null;
}
var _b=this.style.zAngle*Math.PI/180;
var _c=x<0?x>-y:x<-y;
var dx=_c?x:-y/Math.tan(_b);
var dy=!_c?y:-Math.tan(_b)*x;
return {x:dx,y:dy};
},zPoint:function(_d){
if(_d===undefined){
if(!this.points[0]){
return null;
}
var d=this.pointsToData();
_d={start:{x:d.x1,y:d.y1},x:d.x2,y:d.y2};
}
var _e=this.util.length(_d);
var _f=this.util.angle(_d);
_f<0?_f=360+_f:_f;
_f=_f>135&&_f<315?this.style.zAngle:this.util.oppAngle(this.style.zAngle);
return this.util.pointOnCircle(_d.start.x,_d.start.y,_e,_f);
},pointsToData:function(p){
p=p||this.points;
var _10=0;
var obj={start:{x:p[0].x,y:p[0].y},x:p[1].x,y:p[1].y};
if(this.style.zAxis&&(this.util.length(obj)>this.minimumSize)){
var _11=this.util.angle(obj);
_11<0?_11=360+_11:_11;
_10=_11>135&&_11<315?1:-1;
}
this.data={x1:p[0].x,y1:p[0].y,x2:p[1].x,y2:p[1].y,cosphi:_10};
return this.data;
},dataToPoints:function(o){
o=o||this.data;
if(o.radius||o.angle){
var _12=0;
var pt=this.util.pointOnCircle(o.x,o.y,o.radius,o.angle);
if(this.style.zAxis||(o.cosphi&&o.cosphi!=0)){
this.style.zAxis=true;
_12=o.angle>135&&o.angle<315?1:-1;
}
this.data=o={x1:o.x,y1:o.y,x2:pt.x,y2:pt.y,cosphi:_12};
}
this.points=[{x:o.x1,y:o.y1},{x:o.x2,y:o.y2}];
return this.points;
},render:function(){
this.onBeforeRender(this);
if(this.getRadius()>=this.minimumSize){
this._create("hit",this.data,this.style.currentHit);
this._create("shape",this.data,this.style.current);
}else{
this.data.cosphi=0;
this._createZeroVector("hit",this.data,this.style.currentHit);
this._createZeroVector("shape",this.data,this.style.current);
}
},onUp:function(obj){
if(this.created||!this._downOnCanvas){
return;
}
this._downOnCanvas=false;
if(!this.shape){
var d=100;
obj.start.x=this.style.zAxis?obj.start.x+d:obj.start.x;
obj.y=obj.y+d;
this.setPoints([{x:obj.start.x,y:obj.start.y},{x:obj.x,y:obj.y}]);
this.render();
}
if(this.getRadius()<this.minimumSize){
var p=this.points;
this.setPoints([{x:p[0].x,y:p[0].y},{x:p[0].x,y:p[0].y}]);
}else{
var p=this.points;
var pt=this.style.zAxis?this.zPoint(obj):this.util.snapAngle(obj,this.angleSnap/180);
this.setPoints([{x:p[0].x,y:p[0].y},{x:pt.x,y:pt.y}]);
}
this.renderedOnce=true;
this.onRender(this);
}});
dojox.drawing.tools.custom.Vector.setup={name:"dojox.drawing.tools.custom.Vector",tooltip:"Vector Tool",iconClass:"iconVector"};
if(dojox.drawing.defaults.zAxisEnabled){
dojox.drawing.tools.custom.Vector.setup.secondary={name:"vectorSecondary",label:"z-axis",funct:function(_13){
_13.selected?this.zDeselect(_13):this.zSelect(_13);
var _14=this.drawing.stencils.selectedStencils;
for(var nm in _14){
if(_14[nm].shortType=="vector"&&(_14[nm].style.zAxis!=dojox.drawing.defaults.zAxis)){
var s=_14[nm];
s.changeAxis();
if(s.style.zAxis){
s.deselect();
s.select();
}
}
}
},setup:function(){
var _15=dojox.drawing.defaults.zAxis;
this.zSelect=function(_16){
if(!_16.enabled){
return;
}
_15=true;
dojox.drawing.defaults.zAxis=true;
_16.select();
this.vectorTest();
this.zSelected=_16;
};
this.zDeselect=function(_17){
if(!_17.enabled){
return;
}
_15=false;
dojox.drawing.defaults.zAxis=false;
_17.deselect();
this.vectorTest();
this.zSelected=null;
};
this.vectorTest=function(){
_1.forEach(this.buttons,function(b){
if(b.toolType=="vector"&&b.selected){
this.drawing.currentStencil.style.zAxis=_15;
}
},this);
};
_1.connect(this,"onRenderStencil",this,function(){
if(this.zSelected){
this.zDeselect(this.zSelected);
}
});
var c=_1.connect(this.drawing,"onSurfaceReady",this,function(){
_1.disconnect(c);
_1.connect(this.drawing.stencils,"onSelect",this,function(_18){
if(_18.shortType=="vector"){
if(_18.style.zAxis){
_1.forEach(this.buttons,function(b){
if(b.toolType=="vectorSecondary"){
this.zSelect(b);
}
},this);
}else{
_1.forEach(this.buttons,function(b){
if(b.toolType=="vectorSecondary"){
this.zDeselect(b);
}
},this);
}
}
});
});
},postSetup:function(btn){
_1.connect(btn,"enable",function(){
dojox.drawing.defaults.zAxisEnabled=true;
});
_1.connect(btn,"disable",function(){
dojox.drawing.defaults.zAxisEnabled=false;
});
}};
}
dojox.drawing.register(dojox.drawing.tools.custom.Vector.setup,"tool");
return dojox.drawing.tools.custom.Vector;
});
