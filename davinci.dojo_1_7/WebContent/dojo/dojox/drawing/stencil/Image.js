/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/stencil/Image",["dojo","./_Base","../util/oo","../manager/_registry"],function(_1){
dojox.drawing.stencil.Image=dojox.drawing.util.oo.declare(dojox.drawing.stencil._Base,function(_2){
},{type:"dojox.drawing.stencil.Image",anchorType:"group",baseRender:true,dataToPoints:function(o){
o=o||this.data;
this.points=[{x:o.x,y:o.y},{x:o.x+o.width,y:o.y},{x:o.x+o.width,y:o.y+o.height},{x:o.x,y:o.y+o.height}];
return this.points;
},pointsToData:function(p){
p=p||this.points;
var s=p[0];
var e=p[2];
this.data={x:s.x,y:s.y,width:e.x-s.x,height:e.y-s.y,src:this.src||this.data.src};
return this.data;
},_createHilite:function(){
this.remove(this.hit);
this.hit=this.container.createRect(this.data).setStroke(this.style.current).setFill(this.style.current.fill);
this._setNodeAtts(this.hit);
},_create:function(_3,d,_4){
this.remove(this[_3]);
var s=this.container.getParent();
this[_3]=s.createImage(d);
this.container.add(this[_3]);
this._setNodeAtts(this[_3]);
},render:function(_5){
if(this.data.width=="auto"||isNaN(this.data.width)){
this.getImageSize(true);
console.warn("Image size not provided. Acquiring...");
return;
}
this.onBeforeRender(this);
this.renderHit&&this._createHilite();
this._create("shape",this.data,this.style.current);
},getImageSize:function(_6){
if(this._gettingSize){
return;
}
this._gettingSize=true;
var _7=_1.create("img",{src:this.data.src},_1.body());
var _8=_1.connect(_7,"error",this,function(){
_1.disconnect(c);
_1.disconnect(_8);
console.error("Error loading image:",this.data.src);
console.warn("Error image:",this.data);
});
var c=_1.connect(_7,"load",this,function(){
var _9=_1.marginBox(_7);
this.setData({x:this.data.x,y:this.data.y,src:this.data.src,width:_9.w,height:_9.h});
_1.disconnect(c);
_1.destroy(_7);
_6&&this.render(true);
});
}});
dojox.drawing.register({name:"dojox.drawing.stencil.Image"},"stencil");
return dojox.drawing.stencil.Image;
});
