/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx3d/lighting",["dojo/_base/kernel","dojox","dojox/gfx/_base"],function(_1,_2){
_1.getObject("gfx3d",true,_2);
var _3=_2.gfx3d.lighting={black:function(){
return {r:0,g:0,b:0,a:1};
},white:function(){
return {r:1,g:1,b:1,a:1};
},toStdColor:function(c){
c=_2.gfx.normalizeColor(c);
return {r:c.r/255,g:c.g/255,b:c.b/255,a:c.a};
},fromStdColor:function(c){
return new _1.Color([Math.round(255*c.r),Math.round(255*c.g),Math.round(255*c.b),c.a]);
},scaleColor:function(s,c){
return {r:s*c.r,g:s*c.g,b:s*c.b,a:s*c.a};
},addColor:function(a,b){
return {r:a.r+b.r,g:a.g+b.g,b:a.b+b.b,a:a.a+b.a};
},multiplyColor:function(a,b){
return {r:a.r*b.r,g:a.g*b.g,b:a.b*b.b,a:a.a*b.a};
},saturateColor:function(c){
return {r:c.r<0?0:c.r>1?1:c.r,g:c.g<0?0:c.g>1?1:c.g,b:c.b<0?0:c.b>1?1:c.b,a:c.a<0?0:c.a>1?1:c.a};
},mixColor:function(c1,c2,s){
return _3.addColor(_3.scaleColor(s,c1),_3.scaleColor(1-s,c2));
},diff2Color:function(c1,c2){
var r=c1.r-c2.r;
var g=c1.g-c2.g;
var b=c1.b-c2.b;
var a=c1.a-c2.a;
return r*r+g*g+b*b+a*a;
},length2Color:function(c){
return c.r*c.r+c.g*c.g+c.b*c.b+c.a*c.a;
},dot:function(a,b){
return a.x*b.x+a.y*b.y+a.z*b.z;
},scale:function(s,v){
return {x:s*v.x,y:s*v.y,z:s*v.z};
},add:function(a,b){
return {x:a.x+b.x,y:a.y+b.y,z:a.z+b.z};
},saturate:function(v){
return Math.min(Math.max(v,0),1);
},length:function(v){
return Math.sqrt(_2.gfx3d.lighting.dot(v,v));
},normalize:function(v){
return _3.scale(1/_3.length(v),v);
},faceforward:function(n,i){
var p=_2.gfx3d.lighting;
var s=p.dot(i,n)<0?1:-1;
return p.scale(s,n);
},reflect:function(i,n){
var p=_2.gfx3d.lighting;
return p.add(i,p.scale(-2*p.dot(i,n),n));
},diffuse:function(_4,_5){
var c=_3.black();
for(var i=0;i<_5.length;++i){
var l=_5[i],d=_3.dot(_3.normalize(l.direction),_4);
c=_3.addColor(c,_3.scaleColor(d,l.color));
}
return _3.saturateColor(c);
},specular:function(_6,v,_7,_8){
var c=_3.black();
for(var i=0;i<_8.length;++i){
var l=_8[i],h=_3.normalize(_3.add(_3.normalize(l.direction),v)),s=Math.pow(Math.max(0,_3.dot(_6,h)),1/_7);
c=_3.addColor(c,_3.scaleColor(s,l.color));
}
return _3.saturateColor(c);
},phong:function(_9,v,_a,_b){
_9=_3.normalize(_9);
var c=_3.black();
for(var i=0;i<_b.length;++i){
var l=_b[i],r=_3.reflect(_3.scale(-1,_3.normalize(v)),_9),s=Math.pow(Math.max(0,_3.dot(r,_3.normalize(l.direction))),_a);
c=_3.addColor(c,_3.scaleColor(s,l.color));
}
return _3.saturateColor(c);
}};
_1.declare("dojox.gfx3d.lighting.Model",null,{constructor:function(_c,_d,_e,_f){
this.incident=_3.normalize(_c);
this.lights=[];
for(var i=0;i<_d.length;++i){
var l=_d[i];
this.lights.push({direction:_3.normalize(l.direction),color:_3.toStdColor(l.color)});
}
this.ambient=_3.toStdColor(_e.color?_e.color:"white");
this.ambient=_3.scaleColor(_e.intensity,this.ambient);
this.ambient=_3.scaleColor(this.ambient.a,this.ambient);
this.ambient.a=1;
this.specular=_3.toStdColor(_f?_f:"white");
this.specular=_3.scaleColor(this.specular.a,this.specular);
this.specular.a=1;
this.npr_cool={r:0,g:0,b:0.4,a:1};
this.npr_warm={r:0.4,g:0.4,b:0.2,a:1};
this.npr_alpha=0.2;
this.npr_beta=0.6;
this.npr_scale=0.6;
},constant:function(_10,_11,_12){
_12=_3.toStdColor(_12);
var _13=_12.a,_14=_3.scaleColor(_13,_12);
_14.a=_13;
return _3.fromStdColor(_3.saturateColor(_14));
},matte:function(_15,_16,_17){
if(typeof _16=="string"){
_16=_3.finish[_16];
}
_17=_3.toStdColor(_17);
_15=_3.faceforward(_3.normalize(_15),this.incident);
var _18=_3.scaleColor(_16.Ka,this.ambient),_19=_3.saturate(-4*_3.dot(_15,this.incident)),_1a=_3.scaleColor(_19*_16.Kd,_3.diffuse(_15,this.lights)),_1b=_3.scaleColor(_17.a,_3.multiplyColor(_17,_3.addColor(_18,_1a)));
_1b.a=_17.a;
return _3.fromStdColor(_3.saturateColor(_1b));
},metal:function(_1c,_1d,_1e){
if(typeof _1d=="string"){
_1d=_3.finish[_1d];
}
_1e=_3.toStdColor(_1e);
_1c=_3.faceforward(_3.normalize(_1c),this.incident);
var v=_3.scale(-1,this.incident),_1f,_20,_21=_3.scaleColor(_1d.Ka,this.ambient),_22=_3.saturate(-4*_3.dot(_1c,this.incident));
if("phong" in _1d){
_1f=_3.scaleColor(_22*_1d.Ks*_1d.phong,_3.phong(_1c,v,_1d.phong_size,this.lights));
}else{
_1f=_3.scaleColor(_22*_1d.Ks,_3.specular(_1c,v,_1d.roughness,this.lights));
}
_20=_3.scaleColor(_1e.a,_3.addColor(_3.multiplyColor(_1e,_21),_3.multiplyColor(this.specular,_1f)));
_20.a=_1e.a;
return _3.fromStdColor(_3.saturateColor(_20));
},plastic:function(_23,_24,_25){
if(typeof _24=="string"){
_24=_3.finish[_24];
}
_25=_3.toStdColor(_25);
_23=_3.faceforward(_3.normalize(_23),this.incident);
var v=_3.scale(-1,this.incident),_26,_27,_28=_3.scaleColor(_24.Ka,this.ambient),_29=_3.saturate(-4*_3.dot(_23,this.incident)),_2a=_3.scaleColor(_29*_24.Kd,_3.diffuse(_23,this.lights));
if("phong" in _24){
_26=_3.scaleColor(_29*_24.Ks*_24.phong,_3.phong(_23,v,_24.phong_size,this.lights));
}else{
_26=_3.scaleColor(_29*_24.Ks,_3.specular(_23,v,_24.roughness,this.lights));
}
_27=_3.scaleColor(_25.a,_3.addColor(_3.multiplyColor(_25,_3.addColor(_28,_2a)),_3.multiplyColor(this.specular,_26)));
_27.a=_25.a;
return _3.fromStdColor(_3.saturateColor(_27));
},npr:function(_2b,_2c,_2d){
if(typeof _2c=="string"){
_2c=_3.finish[_2c];
}
_2d=_3.toStdColor(_2d);
_2b=_3.faceforward(_3.normalize(_2b),this.incident);
var _2e=_3.scaleColor(_2c.Ka,this.ambient),_2f=_3.saturate(-4*_3.dot(_2b,this.incident)),_30=_3.scaleColor(_2f*_2c.Kd,_3.diffuse(_2b,this.lights)),_31=_3.scaleColor(_2d.a,_3.multiplyColor(_2d,_3.addColor(_2e,_30))),_32=_3.addColor(this.npr_cool,_3.scaleColor(this.npr_alpha,_31)),_33=_3.addColor(this.npr_warm,_3.scaleColor(this.npr_beta,_31)),d=(1+_3.dot(this.incident,_2b))/2,_31=_3.scaleColor(this.npr_scale,_3.addColor(_31,_3.mixColor(_32,_33,d)));
_31.a=_2d.a;
return _3.fromStdColor(_3.saturateColor(_31));
}});
_2.gfx3d.lighting.finish={defaults:{Ka:0.1,Kd:0.6,Ks:0,roughness:0.05},dull:{Ka:0.1,Kd:0.6,Ks:0.5,roughness:0.15},shiny:{Ka:0.1,Kd:0.6,Ks:1,roughness:0.001},glossy:{Ka:0.1,Kd:0.6,Ks:1,roughness:0.0001},phong_dull:{Ka:0.1,Kd:0.6,Ks:0.5,phong:0.5,phong_size:1},phong_shiny:{Ka:0.1,Kd:0.6,Ks:1,phong:1,phong_size:200},phong_glossy:{Ka:0.1,Kd:0.6,Ks:1,phong:1,phong_size:300},luminous:{Ka:1,Kd:0,Ks:0,roughness:0.05},metalA:{Ka:0.35,Kd:0.3,Ks:0.8,roughness:1/20},metalB:{Ka:0.3,Kd:0.4,Ks:0.7,roughness:1/60},metalC:{Ka:0.25,Kd:0.5,Ks:0.8,roughness:1/80},metalD:{Ka:0.15,Kd:0.6,Ks:0.8,roughness:1/100},metalE:{Ka:0.1,Kd:0.7,Ks:0.8,roughness:1/120}};
return _3;
});
