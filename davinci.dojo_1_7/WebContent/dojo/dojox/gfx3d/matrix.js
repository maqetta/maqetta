/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx3d/matrix",["dojo/_base/kernel","dojox","dojo/_base/lang"],function(_1,_2,_3){
_1.getObject("gfx3d",true,_2);
_2.gfx3d.matrix={_degToRad:function(_4){
return Math.PI*_4/180;
},_radToDeg:function(_5){
return _5/Math.PI*180;
}};
_2.gfx3d.matrix.Matrix3D=function(_6){
if(_6){
if(typeof _6=="number"){
this.xx=this.yy=this.zz=_6;
}else{
if(_6 instanceof Array){
if(_6.length>0){
var m=_2.gfx3d.matrix.normalize(_6[0]);
for(var i=1;i<_6.length;++i){
var l=m;
var r=_2.gfx3d.matrix.normalize(_6[i]);
m=new _2.gfx3d.matrix.Matrix3D();
m.xx=l.xx*r.xx+l.xy*r.yx+l.xz*r.zx;
m.xy=l.xx*r.xy+l.xy*r.yy+l.xz*r.zy;
m.xz=l.xx*r.xz+l.xy*r.yz+l.xz*r.zz;
m.yx=l.yx*r.xx+l.yy*r.yx+l.yz*r.zx;
m.yy=l.yx*r.xy+l.yy*r.yy+l.yz*r.zy;
m.yz=l.yx*r.xz+l.yy*r.yz+l.yz*r.zz;
m.zx=l.zx*r.xx+l.zy*r.yx+l.zz*r.zx;
m.zy=l.zx*r.xy+l.zy*r.yy+l.zz*r.zy;
m.zz=l.zx*r.xz+l.zy*r.yz+l.zz*r.zz;
m.dx=l.xx*r.dx+l.xy*r.dy+l.xz*r.dz+l.dx;
m.dy=l.yx*r.dx+l.yy*r.dy+l.yz*r.dz+l.dy;
m.dz=l.zx*r.dx+l.zy*r.dy+l.zz*r.dz+l.dz;
}
_1.mixin(this,m);
}
}else{
_1.mixin(this,_6);
}
}
}
};
_1.extend(_2.gfx3d.matrix.Matrix3D,{xx:1,xy:0,xz:0,yx:0,yy:1,yz:0,zx:0,zy:0,zz:1,dx:0,dy:0,dz:0});
_1.mixin(_2.gfx3d.matrix,{identity:new _2.gfx3d.matrix.Matrix3D(),translate:function(a,b,c){
if(arguments.length>1){
return new _2.gfx3d.matrix.Matrix3D({dx:a,dy:b,dz:c});
}
return new _2.gfx3d.matrix.Matrix3D({dx:a.x,dy:a.y,dz:a.z});
},scale:function(a,b,c){
if(arguments.length>1){
return new _2.gfx3d.matrix.Matrix3D({xx:a,yy:b,zz:c});
}
if(typeof a=="number"){
return new _2.gfx3d.matrix.Matrix3D({xx:a,yy:a,zz:a});
}
return new _2.gfx3d.matrix.Matrix3D({xx:a.x,yy:a.y,zz:a.z});
},rotateX:function(_7){
var c=Math.cos(_7);
var s=Math.sin(_7);
return new _2.gfx3d.matrix.Matrix3D({yy:c,yz:-s,zy:s,zz:c});
},rotateXg:function(_8){
return _2.gfx3d.matrix.rotateX(_2.gfx3d.matrix._degToRad(_8));
},rotateY:function(_9){
var c=Math.cos(_9);
var s=Math.sin(_9);
return new _2.gfx3d.matrix.Matrix3D({xx:c,xz:s,zx:-s,zz:c});
},rotateYg:function(_a){
return _2.gfx3d.matrix.rotateY(_2.gfx3d.matrix._degToRad(_a));
},rotateZ:function(_b){
var c=Math.cos(_b);
var s=Math.sin(_b);
return new _2.gfx3d.matrix.Matrix3D({xx:c,xy:-s,yx:s,yy:c});
},rotateZg:function(_c){
return _2.gfx3d.matrix.rotateZ(_2.gfx3d.matrix._degToRad(_c));
},cameraTranslate:function(a,b,c){
if(arguments.length>1){
return new _2.gfx3d.matrix.Matrix3D({dx:-a,dy:-b,dz:-c});
}
return new _2.gfx3d.matrix.Matrix3D({dx:-a.x,dy:-a.y,dz:-a.z});
},cameraRotateX:function(_d){
var c=Math.cos(-_d);
var s=Math.sin(-_d);
return new _2.gfx3d.matrix.Matrix3D({yy:c,yz:-s,zy:s,zz:c});
},cameraRotateXg:function(_e){
return _2.gfx3d.matrix.rotateX(_2.gfx3d.matrix._degToRad(_e));
},cameraRotateY:function(_f){
var c=Math.cos(-_f);
var s=Math.sin(-_f);
return new _2.gfx3d.matrix.Matrix3D({xx:c,xz:s,zx:-s,zz:c});
},cameraRotateYg:function(_10){
return _2.gfx3d.matrix.rotateY(_2.gfx3d.matrix._degToRad(_10));
},cameraRotateZ:function(_11){
var c=Math.cos(-_11);
var s=Math.sin(-_11);
return new _2.gfx3d.matrix.Matrix3D({xx:c,xy:-s,yx:s,yy:c});
},cameraRotateZg:function(_12){
return _2.gfx3d.matrix.rotateZ(_2.gfx3d.matrix._degToRad(_12));
},normalize:function(_13){
return (_13 instanceof _2.gfx3d.matrix.Matrix3D)?_13:new _2.gfx3d.matrix.Matrix3D(_13);
},clone:function(_14){
var obj=new _2.gfx3d.matrix.Matrix3D();
for(var i in _14){
if(typeof (_14[i])=="number"&&typeof (obj[i])=="number"&&obj[i]!=_14[i]){
obj[i]=_14[i];
}
}
return obj;
},invert:function(_15){
var m=_2.gfx3d.matrix.normalize(_15);
var D=m.xx*m.yy*m.zz+m.xy*m.yz*m.zx+m.xz*m.yx*m.zy-m.xx*m.yz*m.zy-m.xy*m.yx*m.zz-m.xz*m.yy*m.zx;
var M=new _2.gfx3d.matrix.Matrix3D({xx:(m.yy*m.zz-m.yz*m.zy)/D,xy:(m.xz*m.zy-m.xy*m.zz)/D,xz:(m.xy*m.yz-m.xz*m.yy)/D,yx:(m.yz*m.zx-m.yx*m.zz)/D,yy:(m.xx*m.zz-m.xz*m.zx)/D,yz:(m.xz*m.yx-m.xx*m.yz)/D,zx:(m.yx*m.zy-m.yy*m.zx)/D,zy:(m.xy*m.zx-m.xx*m.zy)/D,zz:(m.xx*m.yy-m.xy*m.yx)/D,dx:-1*(m.xy*m.yz*m.dz+m.xz*m.dy*m.zy+m.dx*m.yy*m.zz-m.xy*m.dy*m.zz-m.xz*m.yy*m.dz-m.dx*m.yz*m.zy)/D,dy:(m.xx*m.yz*m.dz+m.xz*m.dy*m.zx+m.dx*m.yx*m.zz-m.xx*m.dy*m.zz-m.xz*m.yx*m.dz-m.dx*m.yz*m.zx)/D,dz:-1*(m.xx*m.yy*m.dz+m.xy*m.dy*m.zx+m.dx*m.yx*m.zy-m.xx*m.dy*m.zy-m.xy*m.yx*m.dz-m.dx*m.yy*m.zx)/D});
return M;
},_multiplyPoint:function(m,x,y,z){
return {x:m.xx*x+m.xy*y+m.xz*z+m.dx,y:m.yx*x+m.yy*y+m.yz*z+m.dy,z:m.zx*x+m.zy*y+m.zz*z+m.dz};
},multiplyPoint:function(_16,a,b,c){
var m=_2.gfx3d.matrix.normalize(_16);
if(typeof a=="number"&&typeof b=="number"&&typeof c=="number"){
return _2.gfx3d.matrix._multiplyPoint(m,a,b,c);
}
return _2.gfx3d.matrix._multiplyPoint(m,a.x,a.y,a.z);
},multiply:function(_17){
var m=_2.gfx3d.matrix.normalize(_17);
for(var i=1;i<arguments.length;++i){
var l=m;
var r=_2.gfx3d.matrix.normalize(arguments[i]);
m=new _2.gfx3d.matrix.Matrix3D();
m.xx=l.xx*r.xx+l.xy*r.yx+l.xz*r.zx;
m.xy=l.xx*r.xy+l.xy*r.yy+l.xz*r.zy;
m.xz=l.xx*r.xz+l.xy*r.yz+l.xz*r.zz;
m.yx=l.yx*r.xx+l.yy*r.yx+l.yz*r.zx;
m.yy=l.yx*r.xy+l.yy*r.yy+l.yz*r.zy;
m.yz=l.yx*r.xz+l.yy*r.yz+l.yz*r.zz;
m.zx=l.zx*r.xx+l.zy*r.yx+l.zz*r.zx;
m.zy=l.zx*r.xy+l.zy*r.yy+l.zz*r.zy;
m.zz=l.zx*r.xz+l.zy*r.yz+l.zz*r.zz;
m.dx=l.xx*r.dx+l.xy*r.dy+l.xz*r.dz+l.dx;
m.dy=l.yx*r.dx+l.yy*r.dy+l.yz*r.dz+l.dy;
m.dz=l.zx*r.dx+l.zy*r.dy+l.zz*r.dz+l.dz;
}
return m;
},_project:function(m,x,y,z){
return {x:m.xx*x+m.xy*y+m.xz*z+m.dx,y:m.yx*x+m.yy*y+m.yz*z+m.dy,z:m.zx*x+m.zy*y+m.zz*z+m.dz};
},project:function(_18,a,b,c){
var m=_2.gfx3d.matrix.normalize(_18);
if(typeof a=="number"&&typeof b=="number"&&typeof c=="number"){
return _2.gfx3d.matrix._project(m,a,b,c);
}
return _2.gfx3d.matrix._project(m,a.x,a.y,a.z);
}});
_2.gfx3d.Matrix3D=_2.gfx3d.matrix.Matrix3D;
return _2.gfx3d.matrix;
});
