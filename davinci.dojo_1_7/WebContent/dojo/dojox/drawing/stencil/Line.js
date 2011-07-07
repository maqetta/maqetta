/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","./_Base","../util/oo","../manager/_registry"],function(_1){
dojox.drawing.stencil.Line=dojox.drawing.util.oo.declare(dojox.drawing.stencil._Base,function(_2){
},{type:"dojox.drawing.stencil.Line",anchorType:"single",baseRender:true,dataToPoints:function(o){
o=o||this.data;
if(o.radius||o.angle){
var pt=this.util.pointOnCircle(o.x,o.y,o.radius,o.angle);
this.data=o={x1:o.x,y1:o.y,x2:pt.x,y2:pt.y};
}
this.points=[{x:o.x1,y:o.y1},{x:o.x2,y:o.y2}];
return this.points;
},pointsToData:function(p){
p=p||this.points;
this.data={x1:p[0].x,y1:p[0].y,x2:p[1].x,y2:p[1].y};
return this.data;
},_create:function(_3,d,_4){
this.remove(this[_3]);
this[_3]=this.container.createLine(d).setStroke(_4);
this._setNodeAtts(this[_3]);
},render:function(){
this.onBeforeRender(this);
this.renderHit&&this._create("hit",this.data,this.style.currentHit);
this._create("shape",this.data,this.style.current);
}});
dojox.drawing.register({name:"dojox.drawing.stencil.Line"},"stencil");
return dojox.drawing.stencil.Line;
});
