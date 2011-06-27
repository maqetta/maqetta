/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dnd/Moveable",["../main","./Mover"],function(_1){
_1.declare("dojo.dnd.Moveable",null,{handle:"",delay:0,skip:false,constructor:function(_2,_3){
this.node=_1.byId(_2);
if(!_3){
_3={};
}
this.handle=_3.handle?_1.byId(_3.handle):null;
if(!this.handle){
this.handle=this.node;
}
this.delay=_3.delay>0?_3.delay:0;
this.skip=_3.skip;
this.mover=_3.mover?_3.mover:_1.dnd.Mover;
this.events=[_1.connect(this.handle,"onmousedown",this,"onMouseDown"),_1.connect(this.handle,"ontouchstart",this,"onMouseDown"),_1.connect(this.handle,"ondragstart",this,"onSelectStart"),_1.connect(this.handle,"onselectstart",this,"onSelectStart")];
},markupFactory:function(_4,_5){
return new _1.dnd.Moveable(_5,_4);
},destroy:function(){
_1.forEach(this.events,_1.disconnect);
this.events=this.node=this.handle=null;
},onMouseDown:function(e){
if(this.skip&&_1.dnd.isFormElement(e)){
return;
}
if(this.delay){
this.events.push(_1.connect(this.handle,"onmousemove",this,"onMouseMove"),_1.connect(this.handle,"ontouchmove",this,"onMouseMove"),_1.connect(this.handle,"onmouseup",this,"onMouseUp"),_1.connect(this.handle,"ontouchend",this,"onMouseUp"));
var _6=e.touches?e.touches[0]:e;
this._lastX=_6.pageX;
this._lastY=_6.pageY;
}else{
this.onDragDetected(e);
}
_1.stopEvent(e);
},onMouseMove:function(e){
var _7=e.touches?e.touches[0]:e;
if(Math.abs(_7.pageX-this._lastX)>this.delay||Math.abs(_7.pageY-this._lastY)>this.delay){
this.onMouseUp(e);
this.onDragDetected(e);
}
_1.stopEvent(e);
},onMouseUp:function(e){
for(var i=0;i<2;++i){
_1.disconnect(this.events.pop());
}
_1.stopEvent(e);
},onSelectStart:function(e){
if(!this.skip||!_1.dnd.isFormElement(e)){
_1.stopEvent(e);
}
},onDragDetected:function(e){
new this.mover(this.node,e,this);
},onMoveStart:function(_8){
_1.publish("/dnd/move/start",[_8]);
_1.addClass(_1.body(),"dojoMove");
_1.addClass(this.node,"dojoMoveItem");
},onMoveStop:function(_9){
_1.publish("/dnd/move/stop",[_9]);
_1.removeClass(_1.body(),"dojoMove");
_1.removeClass(this.node,"dojoMoveItem");
},onFirstMove:function(_a,e){
},onMove:function(_b,_c,e){
this.onMoving(_b,_c);
var s=_b.node.style;
s.left=_c.l+"px";
s.top=_c.t+"px";
this.onMoved(_b,_c);
},onMoving:function(_d,_e){
},onMoved:function(_f,_10){
}});
return _1.dnd.Moveable;
});
