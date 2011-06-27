/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx3d/object",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/array","dojox/gfx","./scheduler","./gradient","./vector","./matrix","./lighting"],function(_1){
var _2=function(o,x){
if(arguments.length>1){
o=x;
}
var e={};
for(var i in o){
if(i in e){
continue;
}
}
};
_1.declare("dojox.gfx3d.Object",null,{constructor:function(){
this.object=null;
this.matrix=null;
this.cache=null;
this.renderer=null;
this.parent=null;
this.strokeStyle=null;
this.fillStyle=null;
this.shape=null;
},setObject:function(_3){
this.object=dojox.gfx.makeParameters(this.object,_3);
return this;
},setTransform:function(_4){
this.matrix=dojox.gfx3d.matrix.clone(_4?dojox.gfx3d.matrix.normalize(_4):dojox.gfx3d.identity,true);
return this;
},applyRightTransform:function(_5){
return _5?this.setTransform([this.matrix,_5]):this;
},applyLeftTransform:function(_6){
return _6?this.setTransform([_6,this.matrix]):this;
},applyTransform:function(_7){
return _7?this.setTransform([this.matrix,_7]):this;
},setFill:function(_8){
this.fillStyle=_8;
return this;
},setStroke:function(_9){
this.strokeStyle=_9;
return this;
},toStdFill:function(_a,_b){
return (this.fillStyle&&typeof this.fillStyle["type"]!="undefined")?_a[this.fillStyle.type](_b,this.fillStyle.finish,this.fillStyle.color):this.fillStyle;
},invalidate:function(){
this.renderer.addTodo(this);
},destroy:function(){
if(this.shape){
var p=this.shape.getParent();
if(p){
p.remove(this.shape);
}
this.shape=null;
}
},render:function(_c){
throw "Pure virtual function, not implemented";
},draw:function(_d){
throw "Pure virtual function, not implemented";
},getZOrder:function(){
return 0;
},getOutline:function(){
return null;
}});
_1.declare("dojox.gfx3d.Scene",dojox.gfx3d.Object,{constructor:function(){
this.objects=[];
this.todos=[];
this.schedule=dojox.gfx3d.scheduler.zOrder;
this._draw=dojox.gfx3d.drawer.conservative;
},setFill:function(_e){
this.fillStyle=_e;
_1.forEach(this.objects,function(_f){
_f.setFill(_e);
});
return this;
},setStroke:function(_10){
this.strokeStyle=_10;
_1.forEach(this.objects,function(_11){
_11.setStroke(_10);
});
return this;
},render:function(_12,_13){
var m=dojox.gfx3d.matrix.multiply(_12,this.matrix);
if(_13){
this.todos=this.objects;
}
_1.forEach(this.todos,function(_14){
_14.render(m,_13);
});
},draw:function(_15){
this.objects=this.schedule(this.objects);
this._draw(this.todos,this.objects,this.renderer);
},addTodo:function(_16){
if(_1.every(this.todos,function(_17){
return _17!=_16;
})){
this.todos.push(_16);
this.invalidate();
}
},invalidate:function(){
this.parent.addTodo(this);
},getZOrder:function(){
var _18=0;
_1.forEach(this.objects,function(_19){
_18+=_19.getZOrder();
});
return (this.objects.length>1)?_18/this.objects.length:0;
}});
_1.declare("dojox.gfx3d.Edges",dojox.gfx3d.Object,{constructor:function(){
this.object=_1.clone(dojox.gfx3d.defaultEdges);
},setObject:function(_1a,_1b){
this.object=dojox.gfx.makeParameters(this.object,(_1a instanceof Array)?{points:_1a,style:_1b}:_1a);
return this;
},getZOrder:function(){
var _1c=0;
_1.forEach(this.cache,function(_1d){
_1c+=_1d.z;
});
return (this.cache.length>1)?_1c/this.cache.length:0;
},render:function(_1e){
var m=dojox.gfx3d.matrix.multiply(_1e,this.matrix);
this.cache=_1.map(this.object.points,function(_1f){
return dojox.gfx3d.matrix.multiplyPoint(m,_1f);
});
},draw:function(){
var c=this.cache;
if(this.shape){
this.shape.setShape("");
}else{
this.shape=this.renderer.createPath();
}
var p=this.shape.setAbsoluteMode("absolute");
if(this.object.style=="strip"||this.object.style=="loop"){
p.moveTo(c[0].x,c[0].y);
_1.forEach(c.slice(1),function(_20){
p.lineTo(_20.x,_20.y);
});
if(this.object.style=="loop"){
p.closePath();
}
}else{
for(var i=0;i<this.cache.length;){
p.moveTo(c[i].x,c[i].y);
i++;
p.lineTo(c[i].x,c[i].y);
i++;
}
}
p.setStroke(this.strokeStyle);
}});
_1.declare("dojox.gfx3d.Orbit",dojox.gfx3d.Object,{constructor:function(){
this.object=_1.clone(dojox.gfx3d.defaultOrbit);
},render:function(_21){
var m=dojox.gfx3d.matrix.multiply(_21,this.matrix);
var _22=[0,Math.PI/4,Math.PI/3];
var _23=dojox.gfx3d.matrix.multiplyPoint(m,this.object.center);
var _24=_1.map(_22,function(_25){
return {x:this.center.x+this.radius*Math.cos(_25),y:this.center.y+this.radius*Math.sin(_25),z:this.center.z};
},this.object);
_24=_1.map(_24,function(_26){
return dojox.gfx3d.matrix.multiplyPoint(m,_26);
});
var _27=dojox.gfx3d.vector.normalize(_24);
_24=_1.map(_24,function(_28){
return dojox.gfx3d.vector.substract(_28,_23);
});
var A={xx:_24[0].x*_24[0].y,xy:_24[0].y*_24[0].y,xz:1,yx:_24[1].x*_24[1].y,yy:_24[1].y*_24[1].y,yz:1,zx:_24[2].x*_24[2].y,zy:_24[2].y*_24[2].y,zz:1,dx:0,dy:0,dz:0};
var B=_1.map(_24,function(_29){
return -Math.pow(_29.x,2);
});
var X=dojox.gfx3d.matrix.multiplyPoint(dojox.gfx3d.matrix.invert(A),B[0],B[1],B[2]);
var _2a=Math.atan2(X.x,1-X.y)/2;
var _2b=_1.map(_24,function(_2c){
return dojox.gfx.matrix.multiplyPoint(dojox.gfx.matrix.rotate(-_2a),_2c.x,_2c.y);
});
var a=Math.pow(_2b[0].x,2);
var b=Math.pow(_2b[0].y,2);
var c=Math.pow(_2b[1].x,2);
var d=Math.pow(_2b[1].y,2);
var rx=Math.sqrt((a*d-b*c)/(d-b));
var ry=Math.sqrt((a*d-b*c)/(a-c));
this.cache={cx:_23.x,cy:_23.y,rx:rx,ry:ry,theta:_2a,normal:_27};
},draw:function(_2d){
if(this.shape){
this.shape.setShape(this.cache);
}else{
this.shape=this.renderer.createEllipse(this.cache);
}
this.shape.applyTransform(dojox.gfx.matrix.rotateAt(this.cache.theta,this.cache.cx,this.cache.cy)).setStroke(this.strokeStyle).setFill(this.toStdFill(_2d,this.cache.normal));
}});
_1.declare("dojox.gfx3d.Path3d",dojox.gfx3d.Object,{constructor:function(){
this.object=_1.clone(dojox.gfx3d.defaultPath3d);
this.segments=[];
this.absolute=true;
this.last={};
this.path="";
},_collectArgs:function(_2e,_2f){
for(var i=0;i<_2f.length;++i){
var t=_2f[i];
if(typeof (t)=="boolean"){
_2e.push(t?1:0);
}else{
if(typeof (t)=="number"){
_2e.push(t);
}else{
if(t instanceof Array){
this._collectArgs(_2e,t);
}else{
if("x" in t&&"y" in t){
_2e.push(t.x);
_2e.push(t.y);
}
}
}
}
}
},_validSegments:{m:3,l:3,z:0},_pushSegment:function(_30,_31){
var _32=this._validSegments[_30.toLowerCase()],_33;
if(typeof (_32)=="number"){
if(_32){
if(_31.length>=_32){
_33={action:_30,args:_31.slice(0,_31.length-_31.length%_32)};
this.segments.push(_33);
}
}else{
_33={action:_30,args:[]};
this.segments.push(_33);
}
}
},moveTo:function(){
var _34=[];
this._collectArgs(_34,arguments);
this._pushSegment(this.absolute?"M":"m",_34);
return this;
},lineTo:function(){
var _35=[];
this._collectArgs(_35,arguments);
this._pushSegment(this.absolute?"L":"l",_35);
return this;
},closePath:function(){
this._pushSegment("Z",[]);
return this;
},render:function(_36){
var m=dojox.gfx3d.matrix.multiply(_36,this.matrix);
var _37="";
var _38=this._validSegments;
_1.forEach(this.segments,function(_39){
_37+=_39.action;
for(var i=0;i<_39.args.length;i+=_38[_39.action.toLowerCase()]){
var pt=dojox.gfx3d.matrix.multiplyPoint(m,_39.args[i],_39.args[i+1],_39.args[i+2]);
_37+=" "+pt.x+" "+pt.y;
}
});
this.cache=_37;
},_draw:function(){
return this.parent.createPath(this.cache);
}});
_1.declare("dojox.gfx3d.Triangles",dojox.gfx3d.Object,{constructor:function(){
this.object=_1.clone(dojox.gfx3d.defaultTriangles);
},setObject:function(_3a,_3b){
if(_3a instanceof Array){
this.object=dojox.gfx.makeParameters(this.object,{points:_3a,style:_3b});
}else{
this.object=dojox.gfx.makeParameters(this.object,_3a);
}
return this;
},render:function(_3c){
var m=dojox.gfx3d.matrix.multiply(_3c,this.matrix);
var c=_1.map(this.object.points,function(_3d){
return dojox.gfx3d.matrix.multiplyPoint(m,_3d);
});
this.cache=[];
var _3e=c.slice(0,2);
var _3f=c[0];
if(this.object.style=="strip"){
_1.forEach(c.slice(2),function(_40){
_3e.push(_40);
_3e.push(_3e[0]);
this.cache.push(_3e);
_3e=_3e.slice(1,3);
},this);
}else{
if(this.object.style=="fan"){
_1.forEach(c.slice(2),function(_41){
_3e.push(_41);
_3e.push(_3f);
this.cache.push(_3e);
_3e=[_3f,_41];
},this);
}else{
for(var i=0;i<c.length;){
this.cache.push([c[i],c[i+1],c[i+2],c[i]]);
i+=3;
}
}
}
},draw:function(_42){
this.cache=dojox.gfx3d.scheduler.bsp(this.cache,function(it){
return it;
});
if(this.shape){
this.shape.clear();
}else{
this.shape=this.renderer.createGroup();
}
_1.forEach(this.cache,function(_43){
this.shape.createPolyline(_43).setStroke(this.strokeStyle).setFill(this.toStdFill(_42,dojox.gfx3d.vector.normalize(_43)));
},this);
},getZOrder:function(){
var _44=0;
_1.forEach(this.cache,function(_45){
_44+=(_45[0].z+_45[1].z+_45[2].z)/3;
});
return (this.cache.length>1)?_44/this.cache.length:0;
}});
_1.declare("dojox.gfx3d.Quads",dojox.gfx3d.Object,{constructor:function(){
this.object=_1.clone(dojox.gfx3d.defaultQuads);
},setObject:function(_46,_47){
this.object=dojox.gfx.makeParameters(this.object,(_46 instanceof Array)?{points:_46,style:_47}:_46);
return this;
},render:function(_48){
var m=dojox.gfx3d.matrix.multiply(_48,this.matrix),i;
var c=_1.map(this.object.points,function(_49){
return dojox.gfx3d.matrix.multiplyPoint(m,_49);
});
this.cache=[];
if(this.object.style=="strip"){
var _4a=c.slice(0,2);
for(i=2;i<c.length;){
_4a=_4a.concat([c[i],c[i+1],_4a[0]]);
this.cache.push(_4a);
_4a=_4a.slice(2,4);
i+=2;
}
}else{
for(i=0;i<c.length;){
this.cache.push([c[i],c[i+1],c[i+2],c[i+3],c[i]]);
i+=4;
}
}
},draw:function(_4b){
this.cache=dojox.gfx3d.scheduler.bsp(this.cache,function(it){
return it;
});
if(this.shape){
this.shape.clear();
}else{
this.shape=this.renderer.createGroup();
}
for(var x=0;x<this.cache.length;x++){
this.shape.createPolyline(this.cache[x]).setStroke(this.strokeStyle).setFill(this.toStdFill(_4b,dojox.gfx3d.vector.normalize(this.cache[x])));
}
},getZOrder:function(){
var _4c=0;
for(var x=0;x<this.cache.length;x++){
var i=this.cache[x];
_4c+=(i[0].z+i[1].z+i[2].z+i[3].z)/4;
}
return (this.cache.length>1)?_4c/this.cache.length:0;
}});
_1.declare("dojox.gfx3d.Polygon",dojox.gfx3d.Object,{constructor:function(){
this.object=_1.clone(dojox.gfx3d.defaultPolygon);
},setObject:function(_4d){
this.object=dojox.gfx.makeParameters(this.object,(_4d instanceof Array)?{path:_4d}:_4d);
return this;
},render:function(_4e){
var m=dojox.gfx3d.matrix.multiply(_4e,this.matrix);
this.cache=_1.map(this.object.path,function(_4f){
return dojox.gfx3d.matrix.multiplyPoint(m,_4f);
});
this.cache.push(this.cache[0]);
},draw:function(_50){
if(this.shape){
this.shape.setShape({points:this.cache});
}else{
this.shape=this.renderer.createPolyline({points:this.cache});
}
this.shape.setStroke(this.strokeStyle).setFill(this.toStdFill(_50,dojox.gfx3d.matrix.normalize(this.cache)));
},getZOrder:function(){
var _51=0;
for(var x=0;x<this.cache.length;x++){
_51+=this.cache[x].z;
}
return (this.cache.length>1)?_51/this.cache.length:0;
},getOutline:function(){
return this.cache.slice(0,3);
}});
_1.declare("dojox.gfx3d.Cube",dojox.gfx3d.Object,{constructor:function(){
this.object=_1.clone(dojox.gfx3d.defaultCube);
this.polygons=[];
},setObject:function(_52){
this.object=dojox.gfx.makeParameters(this.object,_52);
},render:function(_53){
var a=this.object.top;
var g=this.object.bottom;
var b={x:g.x,y:a.y,z:a.z};
var c={x:g.x,y:g.y,z:a.z};
var d={x:a.x,y:g.y,z:a.z};
var e={x:a.x,y:a.y,z:g.z};
var f={x:g.x,y:a.y,z:g.z};
var h={x:a.x,y:g.y,z:g.z};
var _54=[a,b,c,d,e,f,g,h];
var m=dojox.gfx3d.matrix.multiply(_53,this.matrix);
var p=_1.map(_54,function(_55){
return dojox.gfx3d.matrix.multiplyPoint(m,_55);
});
a=p[0];
b=p[1];
c=p[2];
d=p[3];
e=p[4];
f=p[5];
g=p[6];
h=p[7];
this.cache=[[a,b,c,d,a],[e,f,g,h,e],[a,d,h,e,a],[d,c,g,h,d],[c,b,f,g,c],[b,a,e,f,b]];
},draw:function(_56){
this.cache=dojox.gfx3d.scheduler.bsp(this.cache,function(it){
return it;
});
var _57=this.cache.slice(3);
if(this.shape){
this.shape.clear();
}else{
this.shape=this.renderer.createGroup();
}
for(var x=0;x<_57.length;x++){
this.shape.createPolyline(_57[x]).setStroke(this.strokeStyle).setFill(this.toStdFill(_56,dojox.gfx3d.vector.normalize(_57[x])));
}
},getZOrder:function(){
var top=this.cache[0][0];
var _58=this.cache[1][2];
return (top.z+_58.z)/2;
}});
_1.declare("dojox.gfx3d.Cylinder",dojox.gfx3d.Object,{constructor:function(){
this.object=_1.clone(dojox.gfx3d.defaultCylinder);
},render:function(_59){
var m=dojox.gfx3d.matrix.multiply(_59,this.matrix);
var _5a=[0,Math.PI/4,Math.PI/3];
var _5b=dojox.gfx3d.matrix.multiplyPoint(m,this.object.center);
var _5c=_1.map(_5a,function(_5d){
return {x:this.center.x+this.radius*Math.cos(_5d),y:this.center.y+this.radius*Math.sin(_5d),z:this.center.z};
},this.object);
_5c=_1.map(_5c,function(_5e){
return dojox.gfx3d.vector.substract(dojox.gfx3d.matrix.multiplyPoint(m,_5e),_5b);
});
var A={xx:_5c[0].x*_5c[0].y,xy:_5c[0].y*_5c[0].y,xz:1,yx:_5c[1].x*_5c[1].y,yy:_5c[1].y*_5c[1].y,yz:1,zx:_5c[2].x*_5c[2].y,zy:_5c[2].y*_5c[2].y,zz:1,dx:0,dy:0,dz:0};
var B=_1.map(_5c,function(_5f){
return -Math.pow(_5f.x,2);
});
var X=dojox.gfx3d.matrix.multiplyPoint(dojox.gfx3d.matrix.invert(A),B[0],B[1],B[2]);
var _60=Math.atan2(X.x,1-X.y)/2;
var _61=_1.map(_5c,function(_62){
return dojox.gfx.matrix.multiplyPoint(dojox.gfx.matrix.rotate(-_60),_62.x,_62.y);
});
var a=Math.pow(_61[0].x,2);
var b=Math.pow(_61[0].y,2);
var c=Math.pow(_61[1].x,2);
var d=Math.pow(_61[1].y,2);
var rx=Math.sqrt((a*d-b*c)/(d-b));
var ry=Math.sqrt((a*d-b*c)/(a-c));
if(rx<ry){
var t=rx;
rx=ry;
ry=t;
_60-=Math.PI/2;
}
var top=dojox.gfx3d.matrix.multiplyPoint(m,dojox.gfx3d.vector.sum(this.object.center,{x:0,y:0,z:this.object.height}));
var _63=this.fillStyle.type=="constant"?this.fillStyle.color:dojox.gfx3d.gradient(this.renderer.lighting,this.fillStyle,this.object.center,this.object.radius,Math.PI,2*Math.PI,m);
if(isNaN(rx)||isNaN(ry)||isNaN(_60)){
rx=this.object.radius,ry=0,_60=0;
}
this.cache={center:_5b,top:top,rx:rx,ry:ry,theta:_60,gradient:_63};
},draw:function(){
var c=this.cache,v=dojox.gfx3d.vector,m=dojox.gfx.matrix,_64=[c.center,c.top],_65=v.substract(c.top,c.center);
if(v.dotProduct(_65,this.renderer.lighting.incident)>0){
_64=[c.top,c.center];
_65=v.substract(c.center,c.top);
}
var _66=this.renderer.lighting[this.fillStyle.type](_65,this.fillStyle.finish,this.fillStyle.color),d=Math.sqrt(Math.pow(c.center.x-c.top.x,2)+Math.pow(c.center.y-c.top.y,2));
if(this.shape){
this.shape.clear();
}else{
this.shape=this.renderer.createGroup();
}
this.shape.createPath("").moveTo(0,-c.rx).lineTo(d,-c.rx).lineTo(d,c.rx).lineTo(0,c.rx).arcTo(c.ry,c.rx,0,true,true,0,-c.rx).setFill(c.gradient).setStroke(this.strokeStyle).setTransform([m.translate(_64[0]),m.rotate(Math.atan2(_64[1].y-_64[0].y,_64[1].x-_64[0].x))]);
if(c.rx>0&&c.ry>0){
this.shape.createEllipse({cx:_64[1].x,cy:_64[1].y,rx:c.rx,ry:c.ry}).setFill(_66).setStroke(this.strokeStyle).applyTransform(m.rotateAt(c.theta,_64[1]));
}
}});
_1.declare("dojox.gfx3d.Viewport",dojox.gfx.Group,{constructor:function(){
this.dimension=null;
this.objects=[];
this.todos=[];
this.renderer=this;
this.schedule=dojox.gfx3d.scheduler.zOrder;
this.draw=dojox.gfx3d.drawer.conservative;
this.deep=false;
this.lights=[];
this.lighting=null;
},setCameraTransform:function(_67){
this.camera=dojox.gfx3d.matrix.clone(_67?dojox.gfx3d.matrix.normalize(_67):dojox.gfx3d.identity,true);
this.invalidate();
return this;
},applyCameraRightTransform:function(_68){
return _68?this.setCameraTransform([this.camera,_68]):this;
},applyCameraLeftTransform:function(_69){
return _69?this.setCameraTransform([_69,this.camera]):this;
},applyCameraTransform:function(_6a){
return this.applyCameraRightTransform(_6a);
},setLights:function(_6b,_6c,_6d){
this.lights=(_6b instanceof Array)?{sources:_6b,ambient:_6c,specular:_6d}:_6b;
var _6e={x:0,y:0,z:1};
this.lighting=new dojox.gfx3d.lighting.Model(_6e,this.lights.sources,this.lights.ambient,this.lights.specular);
this.invalidate();
return this;
},addLights:function(_6f){
return this.setLights(this.lights.sources.concat(_6f));
},addTodo:function(_70){
if(_1.every(this.todos,function(_71){
return _71!=_70;
})){
this.todos.push(_70);
}
},invalidate:function(){
this.deep=true;
this.todos=this.objects;
},setDimensions:function(dim){
if(dim){
var w=_1.isString(dim.width)?parseInt(dim.width):dim.width;
var h=_1.isString(dim.height)?parseInt(dim.height):dim.height;
if(this.rawNode){
var trs=this.rawNode.style;
trs.height=h;
trs.width=w;
}
this.dimension={width:w,height:h};
}else{
this.dimension=null;
}
},render:function(){
if(!this.todos.length){
return;
}
var m=dojox.gfx3d.matrix;
for(var x=0;x<this.todos.length;x++){
this.todos[x].render(dojox.gfx3d.matrix.normalize([m.cameraRotateXg(180),m.cameraTranslate(0,this.dimension.height,0),this.camera]),this.deep);
}
this.objects=this.schedule(this.objects);
this.draw(this.todos,this.objects,this);
this.todos=[];
this.deep=false;
}});
dojox.gfx3d.Viewport.nodeType=dojox.gfx.Group.nodeType;
dojox.gfx3d._creators={createEdges:function(_72,_73){
return this.create3DObject(dojox.gfx3d.Edges,_72,_73);
},createTriangles:function(_74,_75){
return this.create3DObject(dojox.gfx3d.Triangles,_74,_75);
},createQuads:function(_76,_77){
return this.create3DObject(dojox.gfx3d.Quads,_76,_77);
},createPolygon:function(_78){
return this.create3DObject(dojox.gfx3d.Polygon,_78);
},createOrbit:function(_79){
return this.create3DObject(dojox.gfx3d.Orbit,_79);
},createCube:function(_7a){
return this.create3DObject(dojox.gfx3d.Cube,_7a);
},createCylinder:function(_7b){
return this.create3DObject(dojox.gfx3d.Cylinder,_7b);
},createPath3d:function(_7c){
return this.create3DObject(dojox.gfx3d.Path3d,_7c);
},createScene:function(){
return this.create3DObject(dojox.gfx3d.Scene);
},create3DObject:function(_7d,_7e,_7f){
var obj=new _7d();
this.adopt(obj);
if(_7e){
obj.setObject(_7e,_7f);
}
return obj;
},adopt:function(obj){
obj.renderer=this.renderer;
obj.parent=this;
this.objects.push(obj);
this.addTodo(obj);
return this;
},abandon:function(obj,_80){
for(var i=0;i<this.objects.length;++i){
if(this.objects[i]==obj){
this.objects.splice(i,1);
}
}
obj.parent=null;
return this;
},setScheduler:function(_81){
this.schedule=_81;
},setDrawer:function(_82){
this.draw=_82;
}};
_1.extend(dojox.gfx3d.Viewport,dojox.gfx3d._creators);
_1.extend(dojox.gfx3d.Scene,dojox.gfx3d._creators);
delete dojox.gfx3d._creators;
_1.extend(dojox.gfx.Surface,{createViewport:function(){
var _83=this.createObject(dojox.gfx3d.Viewport,null,true);
_83.setDimensions(this.getDimensions());
return _83;
}});
return dojox.gfx3d.Object;
});
