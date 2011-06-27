/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/manager/Anchors",["dojo","../util/oo","./Stencil"],function(_1){
dojox.drawing.manager.Anchors=dojox.drawing.util.oo.declare(function(_2){
this.mouse=_2.mouse;
this.undo=_2.undo;
this.util=_2.util;
this.drawing=_2.drawing;
this.items={};
},{onAddAnchor:function(_3){
},onReset:function(_4){
var st=this.util.byId("drawing").stencils;
st.onDeselect(_4);
st.onSelect(_4);
},onRenderStencil:function(){
for(var nm in this.items){
_1.forEach(this.items[nm].anchors,function(a){
a.shape.moveToFront();
});
}
},onTransformPoint:function(_5){
var _6=this.items[_5.stencil.id].anchors;
var _7=this.items[_5.stencil.id].item;
var _8=[];
_1.forEach(_6,function(a,i){
if(_5.id==a.id||_5.stencil.anchorType!="group"){
}else{
if(_5.org.y==a.org.y){
a.setPoint({dx:0,dy:_5.shape.getTransform().dy-a.shape.getTransform().dy});
}else{
if(_5.org.x==a.org.x){
a.setPoint({dx:_5.shape.getTransform().dx-a.shape.getTransform().dx,dy:0});
}
}
a.shape.moveToFront();
}
var mx=a.shape.getTransform();
_8.push({x:mx.dx+a.org.x,y:mx.dy+a.org.y});
if(a.point.t){
_8[_8.length-1].t=a.point.t;
}
},this);
_7.setPoints(_8);
_7.onTransform(_5);
this.onRenderStencil();
},onAnchorUp:function(_9){
},onAnchorDown:function(_a){
},onAnchorDrag:function(_b){
},onChangeStyle:function(_c){
for(var nm in this.items){
_1.forEach(this.items[nm].anchors,function(a){
a.shape.moveToFront();
});
}
},add:function(_d){
this.items[_d.id]={item:_d,anchors:[]};
if(_d.anchorType=="none"){
return;
}
var _e=_d.points;
_1.forEach(_e,function(p,i){
if(p.noAnchor){
return;
}
if(i==0||i==_d.points.length-1){
}
var a=new dojox.drawing.manager.Anchor({stencil:_d,point:p,pointIdx:i,mouse:this.mouse,util:this.util});
this.items[_d.id]._cons=[_1.connect(a,"onRenderStencil",this,"onRenderStencil"),_1.connect(a,"reset",this,"onReset"),_1.connect(a,"onAnchorUp",this,"onAnchorUp"),_1.connect(a,"onAnchorDown",this,"onAnchorDown"),_1.connect(a,"onAnchorDrag",this,"onAnchorDrag"),_1.connect(a,"onTransformPoint",this,"onTransformPoint"),_1.connect(_d,"onChangeStyle",this,"onChangeStyle")];
this.items[_d.id].anchors.push(a);
this.onAddAnchor(a);
},this);
if(_d.shortType=="path"){
var f=_e[0],l=_e[_e.length-1],a=this.items[_d.id].anchors;
if(f.x==l.x&&f.y==l.y){
console.warn("LINK ANVHROS",a[0],a[a.length-1]);
a[0].linkedAnchor=a[a.length-1];
a[a.length-1].linkedAnchor=a[0];
}
}
if(_d.anchorType=="group"){
_1.forEach(this.items[_d.id].anchors,function(_f){
_1.forEach(this.items[_d.id].anchors,function(a){
if(_f.id!=a.id){
if(_f.org.y==a.org.y){
_f.x_anchor=a;
}else{
if(_f.org.x==a.org.x){
_f.y_anchor=a;
}
}
}
},this);
},this);
}
},remove:function(_10){
if(!this.items[_10.id]){
return;
}
_1.forEach(this.items[_10.id].anchors,function(a){
a.destroy();
});
_1.forEach(this.items[_10.id]._cons,_1.disconnect,_1);
this.items[_10.id].anchors=null;
delete this.items[_10.id];
}});
dojox.drawing.manager.Anchor=dojox.drawing.util.oo.declare(function(_11){
this.defaults=dojox.drawing.defaults.copy();
this.mouse=_11.mouse;
this.point=_11.point;
this.pointIdx=_11.pointIdx;
this.util=_11.util;
this.id=_11.id||this.util.uid("anchor");
this.org=_1.mixin({},this.point);
this.stencil=_11.stencil;
if(this.stencil.anchorPositionCheck){
this.anchorPositionCheck=_1.hitch(this.stencil,this.stencil.anchorPositionCheck);
}
if(this.stencil.anchorConstrain){
this.anchorConstrain=_1.hitch(this.stencil,this.stencil.anchorConstrain);
}
this._zCon=_1.connect(this.mouse,"setZoom",this,"render");
this.render();
this.connectMouse();
},{y_anchor:null,x_anchor:null,render:function(){
this.shape&&this.shape.removeShape();
var d=this.defaults.anchors,z=this.mouse.zoom,b=d.width*z,s=d.size*z,p=s/2,_12={width:b,style:d.style,color:d.color,cap:d.cap};
var _13={x:this.point.x-p,y:this.point.y-p,width:s,height:s};
this.shape=this.stencil.container.createRect(_13).setStroke(_12).setFill(d.fill);
this.shape.setTransform({dx:0,dy:0});
this.util.attr(this,"drawingType","anchor");
this.util.attr(this,"id",this.id);
},onRenderStencil:function(_14){
},onTransformPoint:function(_15){
},onAnchorDown:function(obj){
this.selected=obj.id==this.id;
},onAnchorUp:function(obj){
this.selected=false;
this.stencil.onTransformEnd(this);
},onAnchorDrag:function(obj){
if(this.selected){
var mx=this.shape.getTransform();
var pmx=this.shape.getParent().getParent().getTransform();
var _16=this.defaults.anchors.marginZero;
var _17=pmx.dx+this.org.x,_18=pmx.dy+this.org.y,x=obj.x-_17,y=obj.y-_18,s=this.defaults.anchors.minSize;
var _19,_1a,_1b,_1c;
var chk=this.anchorPositionCheck(x,y,this);
if(chk.x<0){
console.warn("X<0 Shift");
while(this.anchorPositionCheck(x,y,this).x<0){
this.shape.getParent().getParent().applyTransform({dx:2,dy:0});
}
}
if(chk.y<0){
console.warn("Y<0 Shift");
while(this.anchorPositionCheck(x,y,this).y<0){
this.shape.getParent().getParent().applyTransform({dx:0,dy:2});
}
}
if(this.y_anchor){
if(this.org.y>this.y_anchor.org.y){
_1b=this.y_anchor.point.y+s-this.org.y;
_1c=Infinity;
if(y<_1b){
y=_1b;
}
}else{
_1b=-_18+_16;
_1c=this.y_anchor.point.y-s-this.org.y;
if(y<_1b){
y=_1b;
}else{
if(y>_1c){
y=_1c;
}
}
}
}else{
_1b=-_18+_16;
if(y<_1b){
y=_1b;
}
}
if(this.x_anchor){
if(this.org.x>this.x_anchor.org.x){
_19=this.x_anchor.point.x+s-this.org.x;
_1a=Infinity;
if(x<_19){
x=_19;
}
}else{
_19=-_17+_16;
_1a=this.x_anchor.point.x-s-this.org.x;
if(x<_19){
x=_19;
}else{
if(x>_1a){
x=_1a;
}
}
}
}else{
_19=-_17+_16;
if(x<_19){
x=_19;
}
}
var _1d=this.anchorConstrain(x,y);
if(_1d!=null){
x=_1d.x;
y=_1d.y;
}
this.shape.setTransform({dx:x,dy:y});
if(this.linkedAnchor){
this.linkedAnchor.shape.setTransform({dx:x,dy:y});
}
this.onTransformPoint(this);
}
},anchorConstrain:function(x,y){
return null;
},anchorPositionCheck:function(x,y,_1e){
return {x:1,y:1};
},setPoint:function(mx){
this.shape.applyTransform(mx);
},connectMouse:function(){
this._mouseHandle=this.mouse.register(this);
},disconnectMouse:function(){
this.mouse.unregister(this._mouseHandle);
},reset:function(_1f){
},destroy:function(){
_1.disconnect(this._zCon);
this.disconnectMouse();
this.shape.removeShape();
}});
return dojox.drawing.manager.Anchors;
});
