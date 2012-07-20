//>>built
define("dojox/gfx/Mover",["dojo/_base/lang","dojo/_base/array","dojo/_base/declare","dojo/on","dojo/_base/event"],function(_1,_2,_3,on,_4){
return _3("dojox.gfx.Mover",null,{constructor:function(_5,e,_6){
var _7=e;
e=e.touches?e.touches[0]:e;
this.shape=_5;
this.lastX=e.clientX;
this.lastY=e.clientY;
var h=this.host=_6,d=document,_8=on(d,"mousemove",_1.hitch(this,"onFirstMove")),_9=on(d,"touchmove",_1.hitch(this,"onFirstMove"));
this.events=[on(d,"mousemove",_1.hitch(this,"onMouseMove")),on(d,"mouseup",_1.hitch(this,"destroy")),on(d,"touchmove",_1.hitch(this,"onMouseMove")),on(d,"touchend",_1.hitch(this,"destroy")),on(d,"dragstart",_1.hitch(_4,"stop")),on(d,"selectstart",_1.hitch(_4,"stop")),_9,_8];
if(h&&h.onMoveStart){
h.onMoveStart(this);
}
},onMouseMove:function(e){
var _a=e;
e=e.touches?e.touches[0]:e;
var x=e.clientX;
var y=e.clientY;
this.host.onMove(this,{dx:x-this.lastX,dy:y-this.lastY});
this.lastX=x;
this.lastY=y;
_4.stop(_a);
},onFirstMove:function(){
this.host.onFirstMove(this);
this.events.pop().remove();
},destroy:function(){
_2.forEach(this.events,function(h){
h.remove();
});
var h=this.host;
if(h&&h.onMoveStop){
h.onMoveStop(this);
}
this.events=this.shape=null;
}});
});
