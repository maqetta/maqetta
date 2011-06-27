/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/manager/Mouse",["dojo","../util/oo","../defaults","./Stencil"],function(_1){
dojox.drawing.manager.Mouse=dojox.drawing.util.oo.declare(function(_2){
this.util=_2.util;
this.keys=_2.keys;
this.id=_2.id||this.util.uid("mouse");
this.currentNodeId="";
this.registered={};
},{doublClickSpeed:400,_lastx:0,_lasty:0,__reg:0,_downOnCanvas:false,init:function(_3){
this.container=_3;
this.setCanvas();
var c;
var _4=false;
_1.connect(this.container,"rightclick",this,function(_5){
console.warn("RIGHTCLICK");
});
_1.connect(document.body,"mousedown",this,function(_6){
});
_1.connect(this.container,"mousedown",this,function(_7){
this.down(_7);
if(_7.button!=_1.mouseButtons.RIGHT){
_4=true;
c=_1.connect(document,"mousemove",this,"drag");
}
});
_1.connect(document,"mouseup",this,function(_8){
if(_8.button!=_1.mouseButtons.RIGHT){
_1.disconnect(c);
_4=false;
}
this.up(_8);
});
_1.connect(document,"mousemove",this,function(_9){
if(!_4){
this.move(_9);
}
});
_1.connect(this.keys,"onEsc",this,function(_a){
this._dragged=false;
});
},setCanvas:function(){
var _b=_1.coords(this.container.parentNode);
this.origin=_1.clone(_b);
},scrollOffset:function(){
return {top:this.container.parentNode.scrollTop,left:this.container.parentNode.scrollLeft};
},resize:function(_c,_d){
if(this.origin){
this.origin.w=_c;
this.origin.h=_d;
}
},register:function(_e){
var _f=_e.id||"reg_"+(this.__reg++);
if(!this.registered[_f]){
this.registered[_f]=_e;
}
return _f;
},unregister:function(_10){
if(!this.registered[_10]){
return;
}
delete this.registered[_10];
},_broadcastEvent:function(_11,obj){
for(var nm in this.registered){
if(this.registered[nm][_11]){
this.registered[nm][_11](obj);
}
}
},onDown:function(obj){
this._broadcastEvent(this.eventName("down"),obj);
},onDrag:function(obj){
var nm=this.eventName("drag");
if(this._selected&&nm=="onDrag"){
nm="onStencilDrag";
}
this._broadcastEvent(nm,obj);
},onMove:function(obj){
this._broadcastEvent("onMove",obj);
},overName:function(obj,evt){
var nm=obj.id.split(".");
evt=evt.charAt(0).toUpperCase()+evt.substring(1);
if(nm[0]=="dojox"&&(dojox.drawing.defaults.clickable||!dojox.drawing.defaults.clickMode)){
return "onStencil"+evt;
}else{
return "on"+evt;
}
},onOver:function(obj){
this._broadcastEvent(this.overName(obj,"over"),obj);
},onOut:function(obj){
this._broadcastEvent(this.overName(obj,"out"),obj);
},onUp:function(obj){
var nm=this.eventName("up");
if(nm=="onStencilUp"){
this._selected=true;
}else{
if(this._selected&&nm=="onUp"){
nm="onStencilUp";
this._selected=false;
}
}
this._broadcastEvent(nm,obj);
if(dojox.gfx.renderer=="silverlight"){
return;
}
this._clickTime=new Date().getTime();
if(this._lastClickTime){
if(this._clickTime-this._lastClickTime<this.doublClickSpeed){
var dnm=this.eventName("doubleClick");
console.warn("DOUBLE CLICK",dnm,obj);
this._broadcastEvent(dnm,obj);
}else{
}
}
this._lastClickTime=this._clickTime;
},zoom:1,setZoom:function(_12){
this.zoom=1/_12;
},setEventMode:function(_13){
this.mode=_13?"on"+_13.charAt(0).toUpperCase()+_13.substring(1):"";
},eventName:function(_14){
_14=_14.charAt(0).toUpperCase()+_14.substring(1);
if(this.mode){
if(this.mode=="onPathEdit"){
return "on"+_14;
}
if(this.mode=="onUI"){
}
return this.mode+_14;
}else{
if(!dojox.drawing.defaults.clickable&&dojox.drawing.defaults.clickMode){
return "on"+_14;
}
var dt=!this.drawingType||this.drawingType=="surface"||this.drawingType=="canvas"?"":this.drawingType;
var t=!dt?"":dt.charAt(0).toUpperCase()+dt.substring(1);
return "on"+t+_14;
}
},up:function(evt){
this.onUp(this.create(evt));
},down:function(evt){
this._downOnCanvas=true;
var sc=this.scrollOffset();
var dim=this._getXY(evt);
this._lastpagex=dim.x;
this._lastpagey=dim.y;
var o=this.origin;
var x=dim.x-o.x+sc.left;
var y=dim.y-o.y+sc.top;
var _15=x>=0&&y>=0&&x<=o.w&&y<=o.h;
x*=this.zoom;
y*=this.zoom;
o.startx=x;
o.starty=y;
this._lastx=x;
this._lasty=y;
this.drawingType=this.util.attr(evt,"drawingType")||"";
var id=this._getId(evt);
if(evt.button==_1.mouseButtons.RIGHT&&this.id=="mse"){
}else{
evt.preventDefault();
_1.stopEvent(evt);
}
this.onDown({mid:this.id,x:x,y:y,pageX:dim.x,pageY:dim.y,withinCanvas:_15,id:id});
},over:function(obj){
this.onOver(obj);
},out:function(obj){
this.onOut(obj);
},move:function(evt){
var obj=this.create(evt);
if(this.id=="MUI"){
}
if(obj.id!=this.currentNodeId){
var _16={};
for(var nm in obj){
_16[nm]=obj[nm];
}
_16.id=this.currentNodeId;
this.currentNodeId&&this.out(_16);
obj.id&&this.over(obj);
this.currentNodeId=obj.id;
}
this.onMove(obj);
},drag:function(evt){
this.onDrag(this.create(evt,true));
},create:function(evt,_17){
var sc=this.scrollOffset();
var dim=this._getXY(evt);
var _18=dim.x;
var _19=dim.y;
var o=this.origin;
var x=dim.x-o.x+sc.left;
var y=dim.y-o.y+sc.top;
var _1a=x>=0&&y>=0&&x<=o.w&&y<=o.h;
x*=this.zoom;
y*=this.zoom;
var id=_1a?this._getId(evt,_17):"";
var ret={mid:this.id,x:x,y:y,pageX:dim.x,pageY:dim.y,page:{x:dim.x,y:dim.y},orgX:o.x,orgY:o.y,last:{x:this._lastx,y:this._lasty},start:{x:this.origin.startx,y:this.origin.starty},move:{x:_18-this._lastpagex,y:_19-this._lastpagey},scroll:sc,id:id,withinCanvas:_1a};
this._lastx=x;
this._lasty=y;
this._lastpagex=_18;
this._lastpagey=_19;
_1.stopEvent(evt);
return ret;
},_getId:function(evt,_1b){
return this.util.attr(evt,"id",null,_1b);
},_getXY:function(evt){
return {x:evt.pageX,y:evt.pageY};
},setCursor:function(_1c,_1d){
if(!_1d){
_1.style(this.container,"cursor",_1c);
}else{
_1.style(_1d,"cursor",_1c);
}
}});
return dojox.drawing.manager.Mouse;
});
