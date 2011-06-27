/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx3d/scheduler",["dojo/_base/kernel","dojox","./vector","dojo/_base/array"],function(_1,_2){
_1.getObject("gfx3d",true,_2);
_2.gfx3d.scheduler={zOrder:function(_3,_4){
_4=_4?_4:_2.gfx3d.scheduler.order;
_3.sort(function(a,b){
return _4(b)-_4(a);
});
return _3;
},bsp:function(_5,_6){
_6=_6?_6:_2.gfx3d.scheduler.outline;
var p=new _2.gfx3d.scheduler.BinarySearchTree(_5[0],_6);
_1.forEach(_5.slice(1),function(_7){
p.add(_7,_6);
});
return p.iterate(_6);
},order:function(it){
return it.getZOrder();
},outline:function(it){
return it.getOutline();
}};
_1.declare("dojox.gfx3d.scheduler.BinarySearchTree",null,{constructor:function(_8,_9){
this.plus=null;
this.minus=null;
this.object=_8;
var o=_9(_8);
this.orient=o[0];
this.normal=_2.gfx3d.vector.normalize(o);
},add:function(_a,_b){
var _c=0.5,o=_b(_a),v=_2.gfx3d.vector,n=this.normal,a=this.orient,_d=_2.gfx3d.scheduler.BinarySearchTree;
if(_1.every(o,function(_e){
return Math.floor(_c+v.dotProduct(n,v.substract(_e,a)))<=0;
})){
if(this.minus){
this.minus.add(_a,_b);
}else{
this.minus=new _d(_a,_b);
}
}else{
if(_1.every(o,function(_f){
return Math.floor(_c+v.dotProduct(n,v.substract(_f,a)))>=0;
})){
if(this.plus){
this.plus.add(_a,_b);
}else{
this.plus=new _d(_a,_b);
}
}else{
throw "The case: polygon cross siblings' plate is not implemneted yet";
}
}
},iterate:function(_10){
var _11=0.5;
var v=_2.gfx3d.vector;
var _12=[];
var _13=null;
var _14={x:0,y:0,z:-10000};
if(Math.floor(_11+v.dotProduct(this.normal,v.substract(_14,this.orient)))<=0){
_13=[this.plus,this.minus];
}else{
_13=[this.minus,this.plus];
}
if(_13[0]){
_12=_12.concat(_13[0].iterate());
}
_12.push(this.object);
if(_13[1]){
_12=_12.concat(_13[1].iterate());
}
return _12;
}});
_2.gfx3d.drawer={conservative:function(_15,_16,_17){
_1.forEach(this.objects,function(_18){
_18.destroy();
});
_1.forEach(_16,function(_19){
_19.draw(_17.lighting);
});
},chart:function(_1a,_1b,_1c){
_1.forEach(this.todos,function(_1d){
_1d.draw(_1c.lighting);
});
}};
});
