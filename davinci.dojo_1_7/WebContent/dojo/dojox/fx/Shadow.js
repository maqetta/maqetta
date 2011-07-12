/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/fx/Shadow",["dijit/_Widget","dojo/NodeList-fx"],function(_1,_2){
dojo.experimental("dojox.fx.Shadow");
dojo.declare("dojox.fx.Shadow",dijit._Widget,{shadowPng:dojo.moduleUrl("dojox.fx","resources/shadow"),shadowThickness:7,shadowOffset:3,opacity:0.75,animate:false,node:null,startup:function(){
this.inherited(arguments);
this.node.style.position="relative";
this.pieces={};
var x1=-1*this.shadowThickness;
var y0=this.shadowOffset;
var y1=this.shadowOffset+this.shadowThickness;
this._makePiece("tl","top",y0,"left",x1);
this._makePiece("l","top",y1,"left",x1,"scale");
this._makePiece("tr","top",y0,"left",0);
this._makePiece("r","top",y1,"left",0,"scale");
this._makePiece("bl","top",0,"left",x1);
this._makePiece("b","top",0,"left",0,"crop");
this._makePiece("br","top",0,"left",0);
this.nodeList=dojo.query(".shadowPiece",this.node);
this.setOpacity(this.opacity);
this.resize();
},_makePiece:function(_3,_4,_5,_6,_7,_8){
var _9;
var _a=this.shadowPng+_3.toUpperCase()+".png";
if(dojo.isIE<7){
_9=dojo.create("div");
_9.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+_a+"'"+(_8?", sizingMethod='"+_8+"'":"")+")";
}else{
_9=dojo.create("img",{src:_a});
}
_9.style.position="absolute";
_9.style[_4]=_5+"px";
_9.style[_6]=_7+"px";
_9.style.width=this.shadowThickness+"px";
_9.style.height=this.shadowThickness+"px";
dojo.addClass(_9,"shadowPiece");
this.pieces[_3]=_9;
this.node.appendChild(_9);
},setOpacity:function(n,_b){
if(dojo.isIE){
return;
}
if(!_b){
_b={};
}
if(this.animate){
var _c=[];
this.nodeList.forEach(function(_d){
_c.push(dojo._fade(dojo.mixin(_b,{node:_d,end:n})));
});
dojo.fx.combine(_c).play();
}else{
this.nodeList.style("opacity",n);
}
},setDisabled:function(_e){
if(_e){
if(this.disabled){
return;
}
if(this.animate){
this.nodeList.fadeOut().play();
}else{
this.nodeList.style("visibility","hidden");
}
this.disabled=true;
}else{
if(!this.disabled){
return;
}
if(this.animate){
this.nodeList.fadeIn().play();
}else{
this.nodeList.style("visibility","visible");
}
this.disabled=false;
}
},resize:function(_f){
var x;
var y;
if(_f){
x=_f.x;
y=_f.y;
}else{
var co=dojo._getBorderBox(this.node);
x=co.w;
y=co.h;
}
var _10=y-(this.shadowOffset+this.shadowThickness);
if(_10<0){
_10=0;
}
if(y<1){
y=1;
}
if(x<1){
x=1;
}
with(this.pieces){
l.style.height=_10+"px";
r.style.height=_10+"px";
b.style.width=x+"px";
bl.style.top=y+"px";
b.style.top=y+"px";
br.style.top=y+"px";
tr.style.left=x+"px";
r.style.left=x+"px";
br.style.left=x+"px";
}
}});
return dojox.fx.Shadow;
});
