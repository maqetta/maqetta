/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/stencil/Path",["dojo","./_Base","../util/oo","../manager/_registry"],function(_1){
dojox.drawing.stencil.Path=dojox.drawing.util.oo.declare(dojox.drawing.stencil._Base,function(_2){
_1.disconnect(this._postRenderCon);
},{type:"dojox.drawing.stencil.Path",closePath:true,baseRender:true,closeRadius:10,closeColor:{r:255,g:255,b:0,a:0.5},_create:function(_3,_4){
this.remove(this[_3]);
if(!this.points.length){
return;
}
if(dojox.gfx.renderer=="svg"){
var _5=[];
_1.forEach(this.points,function(o,i){
if(!o.skip){
if(i==0){
_5.push("M "+o.x+" "+o.y);
}else{
var _6=(o.t||"")+" ";
if(o.x===undefined){
_5.push(_6);
}else{
_5.push(_6+o.x+" "+o.y);
}
}
}
},this);
if(this.closePath){
_5.push("Z");
}
this.stringPath=_5.join(" ");
this[_3]=this.container.createPath(_5.join(" ")).setStroke(_4);
this.closePath&&this[_3].setFill(_4.fill);
}else{
this[_3]=this.container.createPath({}).setStroke(_4);
this.closePath&&this[_3].setFill(_4.fill);
_1.forEach(this.points,function(o,i){
if(!o.skip){
if(i==0||o.t=="M"){
this[_3].moveTo(o.x,o.y);
}else{
if(o.t=="Z"){
this.closePath&&this[_3].closePath();
}else{
this[_3].lineTo(o.x,o.y);
}
}
}
},this);
this.closePath&&this[_3].closePath();
}
this._setNodeAtts(this[_3]);
},render:function(){
this.onBeforeRender(this);
this.renderHit&&this._create("hit",this.style.currentHit);
this._create("shape",this.style.current);
},getBounds:function(_7){
var _8=10000,_9=10000,_a=0,_b=0;
_1.forEach(this.points,function(p){
if(p.x!==undefined&&!isNaN(p.x)){
_8=Math.min(_8,p.x);
_9=Math.min(_9,p.y);
_a=Math.max(_a,p.x);
_b=Math.max(_b,p.y);
}
});
return {x1:_8,y1:_9,x2:_a,y2:_b,x:_8,y:_9,w:_a-_8,h:_b-_9};
},checkClosePoint:function(_c,_d,_e){
var _f=this.util.distance(_c.x,_c.y,_d.x,_d.y);
if(this.points.length>1){
if(_f<this.closeRadius&&!this.closeGuide&&!_e){
var c={cx:_c.x,cy:_c.y,rx:this.closeRadius,ry:this.closeRadius};
this.closeGuide=this.container.createEllipse(c).setFill(this.closeColor);
}else{
if(_e||_f>this.closeRadius&&this.closeGuide){
this.remove(this.closeGuide);
this.closeGuide=null;
}
}
}
return _f<this.closeRadius;
}});
dojox.drawing.register({name:"dojox.drawing.stencil.Path"},"stencil");
return dojox.drawing.stencil.Path;
});
