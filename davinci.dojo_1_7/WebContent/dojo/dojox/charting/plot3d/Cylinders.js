/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/plot3d/Cylinders",["dojo/_base/kernel","dojox/gfx3d","dojo/_base/window","dojo/_base/window","dojo/_base/Color","./Base"],function(_1,_2){
var _3=function(a,f,o){
a=typeof a=="string"?a.split(""):a;
o=o||_1.global;
var z=a[0];
for(var i=1;i<a.length;z=f.call(o,z,a[i++])){
}
return z;
};
return _1.declare("dojox.charting.plot3d.Cylinders",dojox.charting.plot3d.Base,{constructor:function(_4,_5,_6){
this.depth="auto";
this.gap=0;
this.data=[];
this.material={type:"plastic",finish:"shiny",color:"lime"};
this.outline=null;
if(_6){
if("depth" in _6){
this.depth=_6.depth;
}
if("gap" in _6){
this.gap=_6.gap;
}
if("material" in _6){
var m=_6.material;
if(typeof m=="string"||m instanceof _1.Color){
this.material.color=m;
}else{
this.material=m;
}
}
if("outline" in _6){
this.outline=_6.outline;
}
}
},getDepth:function(){
if(this.depth=="auto"){
var w=this.width;
if(this.data&&this.data.length){
w=w/this.data.length;
}
return w-2*this.gap;
}
return this.depth;
},generate:function(_7,_8){
if(!this.data){
return this;
}
var _9=this.width/this.data.length,_a=0,_b=this.height/_3(this.data,Math.max);
if(!_8){
_8=_7.view;
}
for(var i=0;i<this.data.length;++i,_a+=_9){
_8.createCylinder({center:{x:_a+_9/2,y:0,z:0},radius:_9/2-this.gap,height:this.data[i]*_b}).setTransform(_2.matrix.rotateXg(-90)).setFill(this.material).setStroke(this.outline);
}
}});
});
