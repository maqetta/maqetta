/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/plot3d/Bars",["dojo/_base/kernel","dojox/gfx3d","dojo/_base/window","dojo/_base/declare","dojo/_base/Color","./Base"],function(_1,_2,_3,_4,_5,_6){
var _7=function(a,f,o){
a=typeof a=="string"?a.split(""):a;
o=o||_1.global;
var z=a[0];
for(var i=1;i<a.length;z=f.call(o,z,a[i++])){
}
return z;
};
return _1.declare("dojox.charting.plot3d.Bars",dojox.charting.plot3d.Base,{constructor:function(_8,_9,_a){
this.depth="auto";
this.gap=0;
this.data=[];
this.material={type:"plastic",finish:"dull",color:"lime"};
if(_a){
if("depth" in _a){
this.depth=_a.depth;
}
if("gap" in _a){
this.gap=_a.gap;
}
if("material" in _a){
var m=_a.material;
if(typeof m=="string"||m instanceof _1.Color){
this.material.color=m;
}else{
this.material=m;
}
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
},generate:function(_b,_c){
if(!this.data){
return this;
}
var _d=this.width/this.data.length,_e=0,_f=this.depth=="auto"?_d-2*this.gap:this.depth,_10=this.height/_7(this.data,Math.max);
if(!_c){
_c=_b.view;
}
for(var i=0;i<this.data.length;++i,_e+=_d){
_c.createCube({bottom:{x:_e+this.gap,y:0,z:0},top:{x:_e+_d-this.gap,y:this.data[i]*_10,z:_f}}).setFill(this.material);
}
}});
});
