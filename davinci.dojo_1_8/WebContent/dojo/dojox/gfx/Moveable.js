//>>built
define("dojox/gfx/Moveable",["dojo/_base/lang","dojo/_base/declare","dojo/_base/array","dojo/_base/event","dojo/topic","dojo/dom-class","dojo/_base/window","./Mover"],function(_1,_2,_3,_4,_5,_6,_7,_8){
return _2("dojox.gfx.Moveable",null,{constructor:function(_9,_a){
this.shape=_9;
this.delay=(_a&&_a.delay>0)?_a.delay:0;
this.mover=(_a&&_a.mover)?_a.mover:_8;
this.events=[this.shape.connect("onmousedown",this,"onMouseDown"),this.shape.connect("touchstart",this,"onMouseDown")];
},destroy:function(){
_3.forEach(this.events,this.shape.disconnect,this.shape);
this.events=this.shape=null;
},onMouseDown:function(e){
var _b=e;
e=e.touches?e.touches[0]:e;
if(this.delay){
this.events.push(this.shape.connect("onmousemove",this,"onMouseMove"),this.shape.connect("onmouseup",this,"onMouseUp"),this.shape.connect("touchmove",this,"onMouseMove"),this.shape.connect("touchend",this,"onMouseUp"));
this._lastX=e.clientX;
this._lastY=e.clientY;
}else{
new this.mover(this.shape,_b,this);
}
_4.stop(_b);
},onMouseMove:function(e){
var _c=e;
e=e.touches?e.touches[0]:e;
if(Math.abs(e.clientX-this._lastX)>this.delay||Math.abs(e.clientY-this._lastY)>this.delay){
this.onMouseUp(e);
new this.mover(this.shape,e,this);
}
_4.stop(_c);
},onMouseUp:function(e){
this.shape.disconnect(this.events.pop());
this.shape.disconnect(this.events.pop());
this.shape.disconnect(this.events.pop());
this.shape.disconnect(this.events.pop());
},onMoveStart:function(_d){
_5.publish("/gfx/move/start",_d);
_6.add(_7.body(),"dojoMove");
},onMoveStop:function(_e){
_5.publish("/gfx/move/stop",_e);
_6.remove(_7.body(),"dojoMove");
},onFirstMove:function(_f){
},onMove:function(_10,_11){
this.onMoving(_10,_11);
this.shape.applyLeftTransform(_11);
this.onMoved(_10,_11);
},onMoving:function(_12,_13){
},onMoved:function(_14,_15){
}});
});
