/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/plugins/tools/Pan",["dojo","../../util/oo","../_Plugin","../../manager/_registry"],function(_1){
dojox.drawing.plugins.tools.Pan=dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin,function(_2){
this.domNode=_2.node;
var _3;
this.toolbar=_2.scope;
this.connect(this.toolbar,"onToolClick",this,function(){
this.onSetPan(false);
});
this.connect(this.keys,"onKeyUp",this,"onKeyUp");
this.connect(this.keys,"onKeyDown",this,"onKeyDown");
this.connect(this.keys,"onArrow",this,"onArrow");
this.connect(this.anchors,"onAnchorUp",this,"checkBounds");
this.connect(this.stencils,"register",this,"checkBounds");
this.connect(this.canvas,"resize",this,"checkBounds");
this.connect(this.canvas,"setZoom",this,"checkBounds");
this.connect(this.canvas,"onScroll",this,function(){
if(this._blockScroll){
this._blockScroll=false;
return;
}
_3&&clearTimeout(_3);
_3=setTimeout(_1.hitch(this,"checkBounds"),200);
});
this._mouseHandle=this.mouse.register(this);
},{selected:false,keyScroll:false,type:"dojox.drawing.plugins.tools.Pan",onPanUp:function(_4){
if(_4.id==this.button.id){
this.onSetPan(false);
}
},onKeyUp:function(_5){
switch(_5.keyCode){
case 32:
this.onSetPan(false);
break;
case 39:
case 37:
case 38:
case 40:
clearInterval(this._timer);
break;
}
},onKeyDown:function(_6){
if(_6.keyCode==32){
this.onSetPan(true);
}
},interval:20,onArrow:function(_7){
if(this._timer){
clearInterval(this._timer);
}
this._timer=setInterval(_1.hitch(this,function(_8){
this.canvas.domNode.parentNode.scrollLeft+=_8.x*10;
this.canvas.domNode.parentNode.scrollTop+=_8.y*10;
},_7),this.interval);
},onSetPan:function(_9){
if(_9===true||_9===false){
this.selected=!_9;
}
if(this.selected){
this.selected=false;
this.button.deselect();
}else{
this.selected=true;
this.button.select();
}
this.mouse.setEventMode(this.selected?"pan":"");
},onPanDrag:function(_a){
var x=_a.x-_a.last.x;
var y=_a.y-_a.last.y;
this.canvas.domNode.parentNode.scrollTop-=_a.move.y;
this.canvas.domNode.parentNode.scrollLeft-=_a.move.x;
this.canvas.onScroll();
},onUp:function(_b){
if(_b.withinCanvas){
this.keyScroll=true;
}else{
this.keyScroll=false;
}
},onStencilUp:function(_c){
this.checkBounds();
},onStencilDrag:function(_d){
},checkBounds:function(){
var _e=function(){
};
var _f=function(){
};
var t=Infinity,r=-Infinity,b=-10000,l=10000,sx=0,sy=0,dy=0,dx=0,mx=this.stencils.group?this.stencils.group.getTransform():{dx:0,dy:0},sc=this.mouse.scrollOffset(),scY=sc.left?10:0,scX=sc.top?10:0,ch=this.canvas.height,cw=this.canvas.width,z=this.canvas.zoom,pch=this.canvas.parentHeight,pcw=this.canvas.parentWidth;
this.stencils.withSelected(function(m){
var o=m.getBounds();
_f("SEL BOUNDS:",o);
t=Math.min(o.y1+mx.dy,t);
r=Math.max(o.x2+mx.dx,r);
b=Math.max(o.y2+mx.dy,b);
l=Math.min(o.x1+mx.dx,l);
});
this.stencils.withUnselected(function(m){
var o=m.getBounds();
_f("UN BOUNDS:",o);
t=Math.min(o.y1,t);
r=Math.max(o.x2,r);
b=Math.max(o.y2,b);
l=Math.min(o.x1,l);
_e("----------- B:",b,o.y2);
});
b*=z;
var _10=0,_11=0;
_e("Bottom test","b:",b,"z:",z,"ch:",ch,"pch:",pch,"top:",sc.top,"sy:",sy,"mx.dy:",mx.dy);
if(b>pch||sc.top){
_e("*bottom scroll*");
ch=Math.max(b,pch+sc.top);
sy=sc.top;
_10+=this.canvas.getScrollWidth();
}else{
if(!sy&&ch>pch){
_e("*bottom remove*");
ch=pch;
}
}
r*=z;
if(r>pcw||sc.left){
cw=Math.max(r,pcw+sc.left);
sx=sc.left;
_11+=this.canvas.getScrollWidth();
}else{
if(!sx&&cw>pcw){
cw=pcw;
}
}
cw+=_10*2;
ch+=_11*2;
this._blockScroll=true;
this.stencils.group&&this.stencils.group.applyTransform({dx:dx,dy:dy});
this.stencils.withUnselected(function(m){
m.transformPoints({dx:dx,dy:dy});
});
this.canvas.setDimensions(cw,ch,sx,sy);
}});
dojox.drawing.plugins.tools.Pan.setup={name:"dojox.drawing.plugins.tools.Pan",tooltip:"Pan Tool",iconClass:"iconPan",button:false};
dojox.drawing.register(dojox.drawing.plugins.tools.Pan.setup,"plugin");
return dojox.drawing.plugins.tools.Pan;
});
